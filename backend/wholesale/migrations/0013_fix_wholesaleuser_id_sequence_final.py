"""
Migration: 0013_fix_wholesaleuser_id_sequence_final

Problem: The `id` column of `wholesale_wholesaleuser` has no DEFAULT value,
so every INSERT fails with:
    "null value in column 'id' violates not-null constraint"

The column might be UUID (needs gen_random_uuid() default) OR
a bigint/integer (needs a sequence-based default).

This migration auto-detects the column type and applies the correct fix.
"""

from django.db import migrations


def fix_id_default(apps, schema_editor):
    if schema_editor.connection.vendor != 'postgresql':
        return  # SQLite / other DBs handle this automatically

    conn = schema_editor.connection
    with conn.cursor() as cursor:
        # ── Step 1: Detect the actual data type of the id column ──
        cursor.execute("""
            SELECT data_type
            FROM information_schema.columns
            WHERE table_name = 'wholesale_wholesaleuser'
              AND column_name = 'id';
        """)
        row = cursor.fetchone()
        if not row:
            # Table doesn't exist yet — nothing to fix
            return

        data_type = row[0].lower()  # e.g. 'uuid', 'bigint', 'integer'

        # ── Step 2: Check if a DEFAULT is already set ──
        cursor.execute("""
            SELECT column_default
            FROM information_schema.columns
            WHERE table_name = 'wholesale_wholesaleuser'
              AND column_name = 'id';
        """)
        default_row = cursor.fetchone()
        current_default = default_row[0] if default_row else None

        if current_default:
            # A DEFAULT already exists — nothing to fix
            return

        # ── Step 3: Apply the appropriate fix ──
        if 'uuid' in data_type:
            # UUID column: use gen_random_uuid() (available in PostgreSQL 13+)
            # Try pgcrypto extension first as a fallback for older PG
            try:
                cursor.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto;")
            except Exception:
                pass

            # gen_random_uuid() is built-in from PG 13+; uuid_generate_v4() needs pgcrypto
            # Try gen_random_uuid() first
            try:
                cursor.execute("""
                    ALTER TABLE wholesale_wholesaleuser
                    ALTER COLUMN id SET DEFAULT gen_random_uuid();
                """)
            except Exception:
                # Fallback to uuid_generate_v4() from pgcrypto
                cursor.execute("""
                    ALTER TABLE wholesale_wholesaleuser
                    ALTER COLUMN id SET DEFAULT uuid_generate_v4();
                """)

        else:
            # Bigint / integer column: create a sequence and attach it
            seq_name = 'wholesale_wholesaleuser_id_seq_fix'

            # Get current max id (cast to bigint to be safe)
            try:
                cursor.execute(
                    'SELECT COALESCE(MAX(id::bigint), 0) FROM wholesale_wholesaleuser;'
                )
                max_id = cursor.fetchone()[0]
            except Exception:
                max_id = 0

            start_val = max_id + 1

            # Drop old sequence if it exists from previous attempt
            cursor.execute(f'DROP SEQUENCE IF EXISTS {seq_name};')

            # Create fresh sequence
            cursor.execute(
                f'CREATE SEQUENCE {seq_name} '
                f'AS bigint START WITH {start_val} INCREMENT BY 1 '
                f'NO MINVALUE NO MAXVALUE CACHE 1;'
            )

            # Set it as the column default
            cursor.execute(
                f'ALTER TABLE wholesale_wholesaleuser '
                f'ALTER COLUMN id SET DEFAULT nextval(\'{seq_name}\');'
            )

            # Own the sequence by the column
            cursor.execute(
                f'ALTER SEQUENCE {seq_name} OWNED BY wholesale_wholesaleuser.id;'
            )


def reverse_fix(apps, schema_editor):
    """Reverse: remove the added DEFAULT."""
    if schema_editor.connection.vendor != 'postgresql':
        return
    with schema_editor.connection.cursor() as cursor:
        cursor.execute("""
            ALTER TABLE wholesale_wholesaleuser
            ALTER COLUMN id DROP DEFAULT;
        """)
        cursor.execute('DROP SEQUENCE IF EXISTS wholesale_wholesaleuser_id_seq_fix;')


class Migration(migrations.Migration):

    dependencies = [
        ('wholesale', '0012_remove_wholesaleuser_serial_number'),
    ]

    operations = [
        migrations.RunPython(fix_id_default, reverse_code=reverse_fix),
    ]
