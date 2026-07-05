const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

function updateFile(filePath, oldFilePath) {
    if (!fs.existsSync(oldFilePath)) return;

    let oldContent = fs.readFileSync(oldFilePath, 'utf8');
    let newContent = fs.readFileSync(filePath, 'utf8');
    
    let modified = false;

    const $old = cheerio.load(oldContent, { decodeEntities: false, recognizeSelfClosing: true });
    const $new = cheerio.load(newContent, { decodeEntities: false, recognizeSelfClosing: true });

    // Restoring sections
    const selectorsToRestoreHTML = [
        '.footer__payment',
        '.cart-drawer__payment-methods',
        '.configurator-payment-methods',
        '.product-form__buttons',
        '.additional-checkout-buttons'
    ];

    selectorsToRestoreHTML.forEach(sel => {
        $old(sel).each(function(i, oldEl) {
            const newEl = $new(sel).eq(i);
            if (newEl.length) {
                newEl.html($old(oldEl).html());
                modified = true;
            }
        });
    });

    // Remove Alma elements from the restored DOM
    const itemSelectors = ['.list-payment__item', '.footer-payment-methods__item', '.configurator-payment-methods__item'];
    itemSelectors.forEach(sel => {
        $new(sel).each(function() {
            if ($new(this).html().includes('#FB5022')) { // Alma SVG color
                $new(this).remove();
                modified = true;
            }
        });
    });

    if (modified) {
        fs.writeFileSync(filePath, $new.html(), 'utf8');
        console.log('Restored payments for:', filePath);
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.html')) {
            const oldPath = fullPath.replace('airton.shop', '/tmp/old_airton/airton.shop');
            updateFile(fullPath, oldPath);
        }
    }
}

walkDir('./airton.shop');
console.log('Done.');
