const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

function updateFooterServices(filePath, oldFilePath) {
    if (!fs.existsSync(oldFilePath)) return;

    let oldContent = fs.readFileSync(oldFilePath, 'utf8');
    let newContent = fs.readFileSync(filePath, 'utf8');
    
    let modified = false;

    const $old = cheerio.load(oldContent, { decodeEntities: false, recognizeSelfClosing: true });
    const $new = cheerio.load(newContent, { decodeEntities: false, recognizeSelfClosing: true });

    // Find the 'Nos services' block in the footer of the OLD file
    const oldServicesUl = $old('h3.footer-block__heading:contains("Nos services")').closest('.footer-block').find('ul.accordion-details__content');
    
    if (oldServicesUl.length === 0) return;

    // Find the specific 'li' containing Devis installation and Contrat entretien
    let devisInstallationLi = null;
    let contratEntretienLi = null;

    oldServicesUl.find('li.reversed-link').each(function() {
        if ($old(this).text().includes('Devis installation') || $old(this).text().includes('Installation')) {
            devisInstallationLi = $old(this).prop('outerHTML');
        }
        if ($old(this).text().includes('Contrat entretien')) {
            contratEntretienLi = $old(this).prop('outerHTML');
        }
    });

    if (!devisInstallationLi && !contratEntretienLi) return;

    // Find the 'Nos services' block in the footer of the NEW file
    const newServicesBlock = $new('h3.footer-block__heading:contains("Nos services")').closest('.footer-block');
    const newServicesUl = newServicesBlock.find('ul.accordion-details__content');
    
    if (newServicesUl.length > 0) {
        let combinedHtml = '';
        if (devisInstallationLi) combinedHtml += devisInstallationLi;
        if (contratEntretienLi) combinedHtml += contratEntretienLi;
        
        newServicesUl.html(combinedHtml);
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(filePath, $new.html(), 'utf8');
        console.log('Restored Nos services items in:', filePath);
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
            updateFooterServices(fullPath, oldPath);
        }
    }
}

walkDir('./airton.shop');
console.log('Done.');
