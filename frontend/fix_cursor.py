import os

directory = 'd:/Munna/Munna/icommerce/icommerce/frontend/src/app/profile'
for root, dirs, files in os.walk(directory):
    for f in files:
        if f.endswith('.jsx'):
            path = os.path.join(root, f)
            with open(path, 'r', encoding='utf-8') as file:
                lines = file.readlines()
            
            changed = False
            for i, line in enumerate(lines):
                if 'onClick=' in line and 'className="' in line and 'cursor-pointer' not in line:
                    lines[i] = line.replace('className="', 'className="cursor-pointer ')
                    changed = True
                
            if changed:
                with open(path, 'w', encoding='utf-8') as file:
                    file.writelines(lines)
                print(f'Updated {path}')
