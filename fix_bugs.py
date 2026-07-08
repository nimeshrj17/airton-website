import os

# 1. Fix checkout.html CSS and HTML layout for ticket cutout
checkout_path = '/Users/nimeshranjan/Downloads/us.sitesucker.mac.sitesucker-pro/airton.shop/checkout.html'
with open(checkout_path, 'r', encoding='utf-8') as f:
    checkout = f.read()

# Fix CSS
old_css = """        .ticket-cutout {
            position: absolute;
            left: 0;
            right: 0;
            top: 45%;
            height: 1px;
            border-top: 2px dashed #e0e0e0;
            z-index: 1;
        }"""
new_css = """        .ticket-cutout {
            position: relative;
            margin-left: -30px;
            margin-right: -30px;
            width: calc(100% + 60px);
            height: 1px;
            border-top: 2px dashed #e0e0e0;
            z-index: 1;
            margin-top: 30px;
            margin-bottom: 30px;
        }"""
checkout = checkout.replace(old_css, new_css)

old_desc_css = ".ticket-desc { color: #777; font-size: 0.9rem; line-height: 1.5; margin-bottom: 60px; }"
new_desc_css = ".ticket-desc { color: #777; font-size: 0.9rem; line-height: 1.5; margin-bottom: 20px; }"
checkout = checkout.replace(old_desc_css, new_desc_css)

# Fix HTML
old_html = """    <div class="ticket-container" id="ticketSuccess">
        <div class="ticket-cutout"></div>
        <div class="ticket-emoji" style="display:flex; justify-content:center; align-items:center; margin-top:20px;">"""
new_html = """    <div class="ticket-container" id="ticketSuccess">
        <div class="ticket-emoji" style="display:flex; justify-content:center; align-items:center; margin-top:20px;">"""
checkout = checkout.replace(old_html, new_html)

old_html2 = """        <div class="ticket-title">Merci !</div>
        <div class="ticket-desc">Votre commande a été confirmée avec succès. Vous recevrez très bientôt une confirmation par e-mail.</div>
        
        <div class="ticket-details">"""
new_html2 = """        <div class="ticket-title">Merci !</div>
        <div class="ticket-desc">Votre commande a été confirmée avec succès. Vous recevrez très bientôt une confirmation par e-mail.</div>
        
        <div class="ticket-cutout"></div>
        
        <div class="ticket-details">"""
checkout = checkout.replace(old_html2, new_html2)

with open(checkout_path, 'w', encoding='utf-8') as f:
    f.write(checkout)


# 2. Fix api/confirm-order.js and api/webhook.js
files = [
    '/Users/nimeshranjan/Downloads/us.sitesucker.mac.sitesucker-pro/api/confirm-order.js',
    '/Users/nimeshranjan/Downloads/us.sitesucker.mac.sitesucker-pro/api/webhook.js'
]
for file_path in files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    old_cond = "${orderData.order_data?.payment_method === 'bank_transfer' ? `"
    new_cond = "${(orderData.order_data?.payment_method === 'bank_transfer' || orderData.order_data?.payment_method === 'bank') ? `"
    content = content.replace(old_cond, new_cond)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Fixed CSS and email template conditions.")
