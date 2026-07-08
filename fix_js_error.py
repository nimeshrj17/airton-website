import re

path = '/Users/nimeshranjan/Downloads/us.sitesucker.mac.sitesucker-pro/airton.shop/checkout.html'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the mTransferDate JS logic
pattern = r"// Date \(\+14 days\)[\s\S]*?document\.getElementById\('mTransferDate'\)\.textContent = d\.toLocaleDateString\('fr-FR', options\);"
content = re.sub(pattern, '', content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed JS error in checkout.html")
