const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

function updateFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    const $ = cheerio.load(content, { decodeEntities: false, recognizeSelfClosing: true });

    // Find configurator-payment-methods and replace content
    $('.configurator-payment-methods').each(function() {
        // Only if it doesn't already just have Virement Bancaire
        if (!$(this).text().includes('Virement Bancaire')) {
            $(this).html(`<div style="display:flex; align-items:center; gap:8px;">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
    <span style="font-size: 14px; font-weight: 500;">Virement Bancaire</span>
</div>`);
            modified = true;
        }
    });

    if (modified) {
        fs.writeFileSync(filePath, $.html(), 'utf8');
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
