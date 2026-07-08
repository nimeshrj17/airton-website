import os

file_path = '/Users/nimeshranjan/Downloads/us.sitesucker.mac.sitesucker-pro/airton.shop/checkout.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace button onclicks
content = content.replace("onclick=\"copyText('Yawa Mareva Segbetse')\"", "onclick=\"copyText('Yawa Mareva Segbetse', this)\"")
content = content.replace("onclick=\"copyText('FR7631233123450823999451181')\"", "onclick=\"copyText('FR7631233123450823999451181', this)\"")
content = content.replace("onclick=\"copyText('TRBKFRPPXXX')\"", "onclick=\"copyText('TRBKFRPPXXX', this)\"")
content = content.replace("onclick=\"copyText(document.getElementById('mTransferRef').innerText)\"", "onclick=\"copyText(document.getElementById('mTransferRef').innerText, this)\"")

# Replace function
old_func = """        function copyText(text) {
            navigator.clipboard.writeText(text);
        }"""

new_func = """        function copyText(text, btnElement) {
            navigator.clipboard.writeText(text);
            if (btnElement) {
                const originalHTML = btnElement.innerHTML;
                
                btnElement.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#28a745" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
                
                const toast = document.createElement('div');
                toast.textContent = 'Copié !';
                toast.style.position = 'fixed';
                toast.style.bottom = '30px';
                toast.style.left = '50%';
                toast.style.transform = 'translateX(-50%)';
                toast.style.background = '#333';
                toast.style.color = '#fff';
                toast.style.padding = '10px 20px';
                toast.style.borderRadius = '30px';
                toast.style.fontFamily = 'Arial, sans-serif';
                toast.style.fontSize = '14px';
                toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                toast.style.zIndex = '9999';
                toast.style.opacity = '0';
                toast.style.transition = 'opacity 0.3s ease';
                document.body.appendChild(toast);
                
                setTimeout(() => { toast.style.opacity = '1'; }, 10);
                
                setTimeout(() => {
                    btnElement.innerHTML = originalHTML;
                    toast.style.opacity = '0';
                    setTimeout(() => toast.remove(), 300);
                }, 2000);
            }
        }"""

content = content.replace(old_func, new_func)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated copy functionality.")
