import sys

with open('backend/settings.py', 'rb') as f:
    data = f.read()

data = data.replace(b'\x00', b'')

with open('backend/settings.py', 'wb') as f:
    f.write(data)

print("Fixed settings.py")
