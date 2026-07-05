const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

function updateFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    const $ = cheerio.load(content, { decodeEntities: false, recognizeSelfClosing: true });

    // Remove dynamic checkout buttons wrapper on product pages
    $('.shopify-payment-button').each(function() {
        $(this).remove();
        modified = true;
    });

    // Remove dynamic checkout buttons wrapper on cart page/drawer
    $('.dynamic-checkout__content').each(function() {
        $(this).remove();
        modified = true;
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
