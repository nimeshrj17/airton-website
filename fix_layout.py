from bs4 import BeautifulSoup

file_path = 'airton.shop/checkout.html'
with open(file_path, 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f, 'html.parser')

# 1. Add Progress Bar CSS
style_tag = soup.find('style')
if style_tag:
    style_tag.append("""
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
    """)

# 2. Add Progress Bar HTML before #step1
step1 = soup.find(id='step1')
if step1:
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
    """
    progress_soup = BeautifulSoup(progress_html, 'html.parser')
    step1.insert_before(progress_soup)

# 3. Fix Layout of #step2
step2 = soup.find(id='step2')
inner = step2.find(class_='checkout-container-inner') if step2 else None

if inner:
    # Find checkout-left and checkout-right inside inner (or inside step2)
    left = soup.find(class_='checkout-left', id=False) # Get the main one
    right = soup.find(class_='checkout-right')
    
    # Let's rebuild inner correctly
    inner.clear()
    
    # Sometimes left contains right because of bad closing tags. Let's extract them.
    if right and right.parent != inner:
        right.extract()
    if left and left.parent != inner:
        left.extract()
        
    # If right was inside left, it's extracted now.
    
    inner.append(left)
    inner.append(right)

# 4. Update JS to handle progress bar
scripts = soup.find_all('script')
for script in scripts:
    if script.string and 'document.getElementById(\'step1\').style.display = \'none\';' in script.string:
        js = script.string
        js = js.replace("document.getElementById('step2').style.display = 'block';", 
                        "document.getElementById('step2').style.display = 'block';\n"
                        "                document.getElementById('progressFill').style.width = '100%';\n"
                        "                document.getElementById('p-step1').classList.remove('active');\n"
                        "                document.getElementById('p-step1').classList.add('completed');\n"
                        "                document.getElementById('p-step2').classList.add('active');\n"
                        "                document.getElementById('p-step2').innerHTML = '<div class=\"step-circle\">2</div><div class=\"step-label\">Paiement</div>';\n"
                        "                document.getElementById('p-step1').innerHTML = '<div class=\"step-circle\">✓</div><div class=\"step-label\">Coordonnées</div>';")
        script.string = js


with open(file_path, 'w', encoding='utf-8') as f:
    f.write(str(soup))

print("Fixed layout and added progress bar")
