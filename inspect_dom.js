const fs = require('fs');
const cheerio = require('cheerio');

const content = fs.readFileSync('/tmp/old_airton/airton.shop/cart.html', 'utf8');
const $ = cheerio.load(content, { decodeEntities: false, recognizeSelfClosing: true });

$('.dynamic-checkout__content').each((i, el) => {
    console.log(`dynamic-checkout__content ${i} parent class:`, $(el).parent().attr('class'));
});
