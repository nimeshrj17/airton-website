import os
import re

file_path = '/Users/nimeshranjan/Downloads/us.sitesucker.mac.sitesucker-pro/airton.shop/checkout.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Enhance Progress Bar CSS
old_progress_css = """        /* Progress Bar */
        .progress-container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto 30px auto;
            position: relative;
        }
        .progress-bar-bg {
            background-color: #e0e0e0;
            height: 4px;
            border-radius: 2px;
            position: absolute;
            top: 14px;
            left: 0;
            right: 0;
            z-index: 1;
        }
        .progress-bar-fill {
            background-color: #016FD0;
            height: 4px;
            border-radius: 2px;
            width: 50%;
            position: absolute;
            top: 14px;
            left: 0;
            z-index: 2;
            transition: width 0.3s ease;
        }
        .progress-steps {
            display: flex;
            justify-content: space-between;
            position: relative;
            z-index: 3;
        }
        .progress-step {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
        }
        .step-circle {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background-color: #fff;
            border: 2px solid #e0e0e0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.85rem;
            font-weight: bold;
            color: #888;
            transition: all 0.3s ease;
        }
        .step-label {
            font-size: 0.8rem;
            font-weight: 500;
            color: #888;
        }
        
        .progress-step.active .step-circle {
            border-color: #016FD0;
            color: #016FD0;
        }
        .progress-step.active .step-label {
            color: #111;
            font-weight: 600;
        }
        .progress-step.completed .step-circle {
            background-color: #28a745;
            border-color: #28a745;
            color: #fff;
            box-shadow: 0 2px 8px rgba(40,167,69,0.3);
        }
        .progress-step.completed .step-label {
            color: #28a745;
        }"""

new_progress_css = """        /* Premium Progress Bar */
        .progress-container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto 40px auto;
            position: relative;
        }
        .progress-bar-bg {
            background-color: #e9ecef;
            height: 6px;
            border-radius: 3px;
            position: absolute;
            top: 15px;
            left: 0;
            right: 0;
            z-index: 1;
            box-shadow: inset 0 1px 2px rgba(0,0,0,0.1);
        }
        .progress-bar-fill {
            background-color: #016FD0;
            height: 6px;
            border-radius: 3px;
            width: 50%;
            position: absolute;
            top: 15px;
            left: 0;
            z-index: 2;
            transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1), background 0.6s ease;
        }
        .progress-steps {
            display: flex;
            justify-content: space-between;
            position: relative;
            z-index: 3;
        }
        .progress-step {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
        }
        .step-circle {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background-color: #fff;
            border: 2px solid #e9ecef;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.9rem;
            font-weight: 600;
            color: #adb5bd;
            transition: all 0.4s ease;
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }
        .step-label {
            font-size: 0.85rem;
            font-weight: 500;
            color: #adb5bd;
            transition: all 0.4s ease;
        }
        
        .progress-step.active .step-circle {
            border-color: #016FD0;
            color: #016FD0;
            box-shadow: 0 4px 10px rgba(1, 111, 208, 0.2);
            transform: scale(1.05);
        }
        .progress-step.active .step-label {
            color: #212529;
            font-weight: 700;
        }
        .progress-step.completed .step-circle {
            background-color: #28a745;
            border-color: #28a745;
            color: #fff;
            box-shadow: 0 4px 10px rgba(40, 167, 69, 0.3);
        }
        .progress-step.completed .step-label {
            color: #28a745;
            font-weight: 700;
        }"""
if old_progress_css in content:
    content = content.replace(old_progress_css, new_progress_css)
else:
    # Just in case the exact string match fails, I'll regex it
    content = re.sub(r'/\* Progress Bar \*/.*?\.progress-step\.completed \.step-label \{[^}]*\}', new_progress_css, content, flags=re.DOTALL)

# 2. Add Gradient to the JS logic that animates progress bar
old_js = "document.getElementById('progressFill').style.width = '100%';"
new_js = "document.getElementById('progressFill').style.width = '100%';\n                document.getElementById('progressFill').style.background = 'linear-gradient(90deg, #28a745 0%, #016FD0 100%)';"
content = content.replace(old_js, new_js)

# 3. Close the Card dropdown initially
content = content.replace('<div class="payment-option active" id="opt-card">', '<div class="payment-option" id="opt-card">')
content = content.replace('<input type="radio" name="payment_method" id="radio-card" checked>', '<input type="radio" name="payment_method" id="radio-card">')

# 4. Make currentPaymentMethod = null initially
content = content.replace("let currentPaymentMethod = 'card';", "let currentPaymentMethod = null;")

# 5. Add validation in mainPayButton for currentPaymentMethod, and add scrollTo
validation_js = """
            if (!currentPaymentMethod) {
                alert('Veuillez sélectionner un mode de paiement (Carte ou Virement Bancaire).');
                return;
            }

            const btn = document.getElementById('mainPayButton');"""
content = content.replace("            const btn = document.getElementById('mainPayButton');", validation_js)

# 6. Add window.scrollTo(0,0) to SEPA Error and Bank Transfer UI
sepa_scroll = """                    document.getElementById('sepaError').classList.add('active');
                    window.scrollTo(0, 0);
                    btn.textContent = 'Confirmer le paiement';"""
content = content.replace("                    document.getElementById('sepaError').classList.add('active');\n                    btn.textContent = 'Confirmer le paiement';", sepa_scroll)

bank_scroll = """                document.getElementById('mollieTransfer').classList.add('active');
                window.scrollTo(0, 0);
                
                btn.textContent = 'Confirmer le paiement';"""
content = content.replace("                document.getElementById('mollieTransfer').classList.add('active');\n                \n                btn.textContent = 'Confirmer le paiement';", bank_scroll)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Enhanced UI applied successfully")
