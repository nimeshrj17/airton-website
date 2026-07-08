import os

file_path = '/Users/nimeshranjan/Downloads/us.sitesucker.mac.sitesucker-pro/airton.shop/checkout.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# I will replace the bank-detail-items with the ones having copy buttons

old_bank_grid = """                        <div class="bank-grid">
                            <div class="bank-detail-item">
                                <label>Titulaire</label>
                                <p>Yawa Mareva Segbetse</p>
                            </div>
                            <div class="bank-detail-item">
                                <label>BIC / SWIFT</label>
                                <p>TRBKFRPPXXX</p>
                            </div>
                            <div class="bank-detail-item" style="grid-column: 1 / -1;">
                                <label>IBAN</label>
                                <p>FR76 3123 3123 4508 2399 9451 181</p>
                            </div>
                        </div>"""

new_bank_grid = """                        <div class="bank-grid">
                            <div class="bank-detail-item">
                                <label>Titulaire</label>
                                <div style="display: flex; align-items: center; justify-content: space-between;">
                                    <p style="margin: 0;">Yawa Mareva Segbetse</p>
                                </div>
                            </div>
                            <div class="bank-detail-item">
                                <label>BIC / SWIFT</label>
                                <div style="display: flex; align-items: center; justify-content: space-between;">
                                    <p style="margin: 0;">TRBKFRPPXXX</p>
                                    <div onclick="copyText('TRBKFRPPXXX')" style="cursor: pointer; color: #555;" title="Copier">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                    </div>
                                </div>
                            </div>
                            <div class="bank-detail-item" style="grid-column: 1 / -1;">
                                <label>IBAN</label>
                                <div style="display: flex; align-items: center; justify-content: space-between;">
                                    <p style="margin: 0;">FR76 3123 3123 4508 2399 9451 181</p>
                                    <div onclick="copyText('FR7631233123450823999451181')" style="cursor: pointer; color: #555;" title="Copier">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                    </div>
                                </div>
                            </div>
                        </div>"""

content = content.replace(old_bank_grid, new_bank_grid)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Copy buttons added to bank transfer option in checkout form")
