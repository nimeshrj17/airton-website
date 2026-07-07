const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://alvwqkqsokaiarrmweht.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsdndxa3Fzb2thaWFycm13ZWh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzOTcyNjQsImV4cCI6MjA5ODk3MzI2NH0.fR2O_DvLGcDxUC3Ld4DrRafKJH4kEJhCUScswKaUKfA';
const supabase = createClient(supabaseUrl, supabaseKey);

async function seedProducts() {
    const productsDir = './airton.shop/products';
    const files = fs.readdirSync(productsDir);
    
    for (const file of files) {
        if (!file.endsWith('.html')) continue;
        
        const slug = file.replace('.html', '');
        const fullPath = path.join(productsDir, file);
        const content = fs.readFileSync(fullPath, 'utf8');
        const $ = cheerio.load(content, { decodeEntities: false, recognizeSelfClosing: true });
        
        // Try to extract name (assume h1 is the title)
        let name = $('h1').first().text().trim();
        if (!name) name = slug.replace(/-/g, ' '); // fallback

        // Try to extract price
        let rawPriceText = $('.price-item, .price-item--regular, .f-price-item').first().text().trim();
        rawPriceText = rawPriceText.replace(/,/g, ''); // Remove thousands separator
        let priceText = rawPriceText.replace(/[^0-9.]/g, ''); // Extract numbers and decimals
        let price = parseFloat(priceText);
        if (isNaN(price)) price = 399.90; // Better fallback

        // Insert into Supabase
        const { error } = await supabase
            .from('products')
            .upsert([
                { 
                    slug: slug, 
                    name: name, 
                    price: price, 
                    stock: 100, 
                    categories: 'General', 
                    features: 'Imported from static HTML' 
                }
            ], { onConflict: 'slug' });
            
        if (error) {
            console.error(`Failed to insert ${slug}:`, error.message);
        } else {
            console.log(`Inserted: ${name} (${slug}) - ${price}€`);
        }
    }
    
    console.log('Finished seeding products!');
}

seedProducts();
