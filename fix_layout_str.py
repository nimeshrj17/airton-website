import os
import re

file_path = '/Users/nimeshranjan/Downloads/us.sitesucker.mac.sitesucker-pro/airton.shop/checkout.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

css_progress = """
        /* Progress Bar */
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
            background-color: #016FD0;
            border-color: #016FD0;
            color: #fff;
        }
        .progress-step.completed .step-label {
            color: #016FD0;
        }
    </style>"""

content = content.replace('    </style>', css_progress)

progress_html = """
    <div class="progress-container" id="progressBar">
        <div class="progress-bar-bg"></div>
        <div class="progress-bar-fill" id="progressFill"></div>
        <div class="progress-steps">
            <div class="progress-step active" id="p-step1">
                <div class="step-circle">1</div>
                <div class="step-label">Coordonnées</div>
            </div>
            <div class="progress-step" id="p-step2">
                <div class="step-circle">2</div>
                <div class="step-label">Paiement</div>
            </div>
        </div>
    </div>
    <div id="step1">"""

content = content.replace('    <div id="step1">', progress_html)

# Update JS logic to animate progress bar
old_js = "document.getElementById('step2').style.display = 'block';"
new_js = """document.getElementById('step2').style.display = 'block';
                document.getElementById('progressFill').style.width = '100%';
                document.getElementById('p-step1').classList.remove('active');
                document.getElementById('p-step1').classList.add('completed');
                document.getElementById('p-step2').classList.add('active');
                document.getElementById('p-step2').innerHTML = '<div class="step-circle">✓</div><div class="step-label">Paiement</div>';
                document.getElementById('p-step1').innerHTML = '<div class="step-circle">✓</div><div class="step-label">Coordonnées</div>';"""

content = content.replace(old_js, new_js)

# Fix layout by moving checkout-right INSIDE checkout-container-inner
# The issue is we have:
# <div class="checkout-container-inner">
#    <div class="checkout-left">
#         ...
#    </div>
# </div>
# <div class="checkout-right"> ... </div>

# We want:
# <div class="checkout-container-inner">
#    <div class="checkout-left">
#         ...
#    </div>
#    <div class="checkout-right"> ... </div>
# </div>

# Currently, checkout-container-inner is closed right before checkout-right.
content = content.replace('            </div>\n            \n        <div class="checkout-right">', '            \n        <div class="checkout-right">')
# Now we need to add the closing div for checkout-container-inner after checkout-right.
# checkout-right ends at line 806 with:
#         </div>
#     </div>
# </div>
# </div>
#     </div>
# Let's just find the cross-sell-container end.
# Actually, an easier way is to just add it before the closing of step2.

content = content.replace('    <div class="checkout-container" style="display:block; padding: 20px; max-width: 1200px; margin: 0 auto;">', '    <div class="checkout-container" style="display:block; padding: 20px; max-width: 1200px; margin: 0 auto; width: 100%; box-sizing: border-box;">')

# Ensure we have the correct structure
# I will use a regex to fix the closing tags.
# Replace:
#         </div>
#     </div>
# </div>
# </div>
#     </div>
# 
#     
#         </div>
#     </div>

# Let's find exactly how step2 is closed.
content = content.replace('<!-- Stripe JS -->', '    </div>\n    </div>\n<!-- Stripe JS -->')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Progress bar added")
