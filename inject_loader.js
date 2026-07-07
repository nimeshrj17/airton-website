const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

function injectProductLoader(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            injectProductLoader(fullPath);
        } else if (fullPath.endsWith('.html')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            
            // Check if already injected
            if (content.includes('product-loader.js')) {
                continue;
            }

            const $ = cheerio.load(content, { decodeEntities: false, recognizeSelfClosing: true });
            
            // Append script to body
            $('body').append('\n<script src="../js/product-loader.js"></script>\n');
            
            fs.writeFileSync(fullPath, $.html(), 'utf8');
            console.log('Injected product-loader.js into:', fullPath);
        }
    }
}

injectProductLoader('./airton.shop/products');
console.log('Done.');
