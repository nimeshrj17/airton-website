import os

files = [
    '/Users/nimeshranjan/Downloads/us.sitesucker.mac.sitesucker-pro/api/confirm-order.js',
    '/Users/nimeshranjan/Downloads/us.sitesucker.mac.sitesucker-pro/api/webhook.js'
]

for file_path in files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Revert info@airton.shop to service-client@airton-shop.eu
    content = content.replace('info@airton.shop', 'service-client@airton-shop.eu')

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
        
print("Reverted emails back to service-client@airton-shop.eu.")
