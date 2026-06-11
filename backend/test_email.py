import os
import django
import traceback

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.core.mail import send_mail
from django.conf import settings

print('USER:', settings.EMAIL_HOST_USER)
print('PASS:', settings.EMAIL_HOST_PASSWORD)

try:
    res = send_mail('Test Email', 'This is a test.', settings.DEFAULT_FROM_EMAIL, ['munna.codeexpert@gmail.com'], fail_silently=False)
    print('Success! Return:', res)
except Exception as e:
    print('Failed!')
    traceback.print_exc()
