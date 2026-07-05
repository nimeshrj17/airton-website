const fs = require('fs');
const path = require('path');

const countryHTML = `
<li class="disclosure-list__item">
  <a class="disclosure-list__option" href="#" data-value="BE" data-disclosure-option>
    <span class="f-country-flags f-country-flags--BE" style="--background-image: url(https://cdn.shopify.com/static/images/flags/be.svg?width=20)"></span>Belgique<span class="localization-form__currency">(EUR €)</span>
  </a>
</li>
<li class="disclosure-list__item">
  <a class="disclosure-list__option" href="#" data-value="LU" data-disclosure-option>
    <span class="f-country-flags f-country-flags--LU" style="--background-image: url(https://cdn.shopify.com/static/images/flags/lu.svg?width=20)"></span>Luxembourg<span class="localization-form__currency">(EUR €)</span>
  </a>
</li>
<li class="disclosure-list__item">
  <a class="disclosure-list__option" href="#" data-value="CH" data-disclosure-option>
    <span class="f-country-flags f-country-flags--CH" style="--background-image: url(https://cdn.shopify.com/static/images/flags/ch.svg?width=20)"></span>Suisse<span class="localization-form__currency">(EUR €)</span>
  </a>
</li>
`;

const monacoRegex = /<li class="disclosure-list__item">\s*<a\s*class="disclosure-list__option"\s*href="#"\s*data-value="MC"\s*data-disclosure-option\s*>\s*<span class="f-country-flags f-country-flags--MC" style="--background-image: url\(https:\/\/cdn.shopify.com\/static\/images\/flags\/mc.svg\?width=20\)"><\/span>Monaco<span class="localization-form__currency"\s*>\(EUR\s*€\)<\/span\s*>\s*<\/a>\s*<\/li>/g;

const shippingReplacements = [
    { from: '9.99€', to: '8.99€' },
    { from: '19.99€', to: '17.99€' },
    { from: '49.90€', to: '44.91€' },
    { from: '69.90€', to: '62.91€' },
    { from: '220.00€', to: '198.00€' },
    { from: '279.00€', to: '251.10€' },
    { from: '399.00€', to: '359.10€' },
    { from: '459.00€', to: '413.10€' },
];

const paymentRegex = /<div class="footer-payment-methods">[\s\S]*?<\/div>\s*<!-- American Express -->[\s\S]*?<\/svg><\/div>\s*<\/div>/g;

const bankTransferHTML = `
<div class="footer-payment-methods">
  <div class="footer-payment-methods__item" style="display:flex; align-items:center; gap:8px;">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
    <span style="font-size: 14px; font-weight: 500;">Virement Bancaire</span>
  </div>
</div>
`;

function updateFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Add countries after Monaco
    if (content.match(monacoRegex)) {
        if (!content.includes('data-value="BE"')) {
            content = content.replace(monacoRegex, match => match + countryHTML);
            modified = true;
        }
    }

    // Replace payment methods
    if (content.match(paymentRegex)) {
        content = content.replace(paymentRegex, bankTransferHTML);
        modified = true;
    } else {
        // Fallback regex if the American Express comment is slightly different
        const genericPaymentRegex = /<div class="footer-payment-methods">[\s\S]{100,2000}?<\/div>\s*<\/div>\s*<\/div>\s*<div class="footer__content-bottom-wrapper/g;
        if (content.match(genericPaymentRegex)) {
            content = content.replace(genericPaymentRegex, bankTransferHTML + '</div><div class="footer__content-bottom-wrapper');
            modified = true;
        }
    }

    // Update shipping prices
    for (let rule of shippingReplacements) {
        if (content.includes(rule.from)) {
            content = content.split(rule.from).join(rule.to);
            modified = true;
        }
    }

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated:', filePath);
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.html')) {
            updateFile(fullPath);
        }
    }
}

walkDir('./airton.shop');
console.log('Done.');
