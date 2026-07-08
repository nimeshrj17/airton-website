import re

path = '/Users/nimeshranjan/Downloads/us.sitesucker.mac.sitesucker-pro/airton.shop/checkout.html'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the remaining step 2
pattern = r'<div class="m-step">\s*<div class="m-step-circle active">2</div>\s*<div class="m-step-text">Effectuez le virement avant le <span id="mTransferDate">.*?</span></div>\s*</div>\s*</div>'
content = re.sub(pattern, '', content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed checkout steps removal!")
