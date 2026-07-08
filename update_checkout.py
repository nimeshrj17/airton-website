import re

path = '/Users/nimeshranjan/Downloads/us.sitesucker.mac.sitesucker-pro/airton.shop/checkout.html'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove SECURE TRANSACTION
content = content.replace('<div class="page-subtitle">SECURE TRANSACTION</div>', '')

# 2. Remove step numbers
content = re.sub(r'<span class="section-number">\d+</span>', '', content)

# 3. Remove Apple Pay from UI label
content = content.replace('Carte / Apple Pay', 'Carte')

# 4. Remove logo from Mollie Bank Transfer UI
logo_pattern = r'<div class="m-title" style="margin-bottom: 25px;">\s*<img src="https://airton\.shop/cdn/shop/files/Logo_Airton_2025_Noir_2\.svg" alt="Airton" style="height: 35px; object-fit: contain;">\s*</div>'
# Wait, let's just use string replace for safety since there are two (one for sepa error, one for mollie transfer).
# The user said "in the place wherein we enter the reference number remov3e the airton logo from the top and remove the steps text and the card of steps from there"
# Let's remove the logo in `#mollieTransfer`
# Let's just find `<div class="mollie-container" id="mollieTransfer">` and replace the logo block right after it.
# Actually, I can use regex to remove the m-title block inside mollieTransfer.

match = re.search(r'(<div class="mollie-container" id="mollieTransfer">[\s\S]*?)<div class="m-title"[^>]*>[\s\S]*?</div>(\s*<div style="font-size: 0\.95rem;)', content)
if match:
    content = content[:match.start()] + match.group(1) + match.group(2) + content[match.end():]

# 5. Remove steps text and card of steps from mollieTransfer
# The steps are:
# <div class="m-steps-title">Les étapes</div>
# <div class="m-steps-box"> ... </div>
steps_pattern = r'<div class="m-steps-title">Les étapes</div>\s*<div class="m-steps-box">[\s\S]*?</div>\s*</div>'
content = re.sub(steps_pattern, '', content)

# 6. Change payment reference JS to use orderId
ref_old = r"const ref = 'RF92-' \+ Math\.floor\(1000 \+ Math\.random\(\)\*9000\) \+ '-' \+ Math\.floor\(1000 \+ Math\.random\(\)\*9000\) \+ '-00';"
ref_new = r"const ref = '#' + orderId;"
content = re.sub(ref_old, ref_new, content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Checkout modifications applied!")
