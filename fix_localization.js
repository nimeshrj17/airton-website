const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

function updateFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    const $ = cheerio.load(content, { decodeEntities: false, recognizeSelfClosing: true });

    // Find all localization forms and neutralize them
    $('form[action*="/localization"]').each(function() {
        $(this).attr('action', '#');
        $(this).attr('method', 'GET');
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
