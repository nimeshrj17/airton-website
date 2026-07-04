const fs = require('fs');
const path = require('path');

function injectScript(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            injectScript(fullPath);
        } else if (fullPath.endsWith('.html')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (!content.includes('<script src="/airton.shop/custom-api.js"></script>')) {
                content = content.replace('</body>', '<script src="/airton.shop/custom-api.js"></script>\n</body>');
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Injected into', fullPath);
            }
        }
    }
}

injectScript('./airton.shop');
