const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

function updateFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    const $ = cheerio.load(content, { decodeEntities: false, recognizeSelfClosing: true });

    // Remove the alma widget div itself
    $('#configurator-alma-widget').each(function() {
        $(this).remove();
        modified = true;
    });

    // Remove any link or script loading the Alma widget
    $('link[href*="alma"], script[src*="alma"]').each(function() {
        $(this).remove();
        modified = true;
    });

    // Also remove any stray div containing "alma" in class or id, such as data-testid="widget-button" which might be alma specific
    $('.alma-payment-plans-container').each(function() {
        $(this).remove();
        modified = true;
    });

    if (modified) {
        fs.writeFileSync(filePath, $.html(), 'utf8');
        console.log('Removed Alma widgets from:', filePath);
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
