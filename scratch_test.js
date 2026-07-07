const fs = require('fs');
const cheerio = require('cheerio');
const files = fs.readdirSync('./airton.shop/products').filter(f => f.endsWith('.html'));
for (const file of files) {
    const content = fs.readFileSync('./airton.shop/products/' + file, 'utf8');
    const $ = cheerio.load(content);
    let text = $('.price-item, .price-item--regular, .f-price-item').first().text().trim();
    // Remove the comma thousands separator
    text = text.replace(/,/g, '');
    let priceText = text.replace(/[^0-9.]/g, '');
    let price = parseFloat(priceText);
    console.log(file, '-> parsed as', price);
}
