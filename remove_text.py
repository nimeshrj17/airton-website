import os

file_path = '/Users/nimeshranjan/Downloads/us.sitesucker.mac.sitesucker-pro/airton.shop/checkout.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove "Finaliser la commande" text
content = content.replace('<h1 class="page-title">Finaliser la commande</h1>', '')

# 2. Remove the alert from copyText
content = content.replace("navigator.clipboard.writeText(text).then(() => alert('Copié !'));", "navigator.clipboard.writeText(text);")

# 3. Translate the Thank You banner
old_ticket_ui = """    <!-- Ticket Success UI (Hidden) -->
    <div class="ticket-container" id="ticketSuccess">
        <div class="ticket-cutout"></div>
        <div class="ticket-emoji">🎉</div>
        <div class="ticket-title">Thank you!</div>
        <div class="ticket-desc">Your order has been confirmed successfully. You will receive the confirmation via email shortly.</div>
        
        <div class="ticket-details">
            <div>
                <div class="ticket-label">Order ID</div>
                <div class="ticket-val" id="ticketId">--</div>
            </div>
            <div>
                <div class="ticket-label">Amount</div>
                <div class="ticket-val" id="ticketAmount">--</div>
            </div>
            <div>
                <div class="ticket-label">Date & Time</div>
                <div class="ticket-val" id="ticketDate">--</div>
            </div>
        </div>
        
        <div class="ticket-method">
            <div class="ticket-method-icon">
                <svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none"><rect x="3" y="16" width="18" height="6"></rect><polygon points="12 2 3 10 21 10"></polygon><line x1="6" y1="10" x2="6" y2="16"></line><line x1="18" y1="10" x2="18" y2="16"></line><line x1="12" y1="10" x2="12" y2="16"></line></svg>
            </div>
            <div class="ticket-method-text" id="ticketMethodText">Bank Transfer</div>
        </div>"""

new_ticket_ui = """    <!-- Ticket Success UI (Hidden) -->
    <div class="ticket-container" id="ticketSuccess">
        <div class="ticket-cutout"></div>
        <div class="ticket-emoji">🎉</div>
        <div class="ticket-title">Merci !</div>
        <div class="ticket-desc">Votre commande a été confirmée avec succès. Vous recevrez très bientôt une confirmation par e-mail.</div>
        
        <div class="ticket-details">
            <div>
                <div class="ticket-label">N° de Commande</div>
                <div class="ticket-val" id="ticketId">--</div>
            </div>
            <div>
                <div class="ticket-label">Montant</div>
                <div class="ticket-val" id="ticketAmount">--</div>
            </div>
            <div>
                <div class="ticket-label">Date et Heure</div>
                <div class="ticket-val" id="ticketDate">--</div>
            </div>
        </div>
        
        <div class="ticket-method">
            <div class="ticket-method-icon">
                <svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none"><rect x="3" y="16" width="18" height="6"></rect><polygon points="12 2 3 10 21 10"></polygon><line x1="6" y1="10" x2="6" y2="16"></line><line x1="18" y1="10" x2="18" y2="16"></line><line x1="12" y1="10" x2="12" y2="16"></line></svg>
            </div>
            <div class="ticket-method-text" id="ticketMethodText">Virement bancaire</div>
        </div>"""

content = content.replace(old_ticket_ui, new_ticket_ui)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Modifications applied successfully.")
