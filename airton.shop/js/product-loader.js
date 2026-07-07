document.addEventListener('DOMContentLoaded', async () => {
    // 1. Identify the product slug from the URL
    // e.g. /products/climatiseur-fixe-reversible.html -> "climatiseur-fixe-reversible"
    const path = window.location.pathname;
    const filename = path.split('/').pop();
    const slug = filename.replace('.html', '');

    if (!slug) return;

    try {
        const response = await fetch(`/api/products?slug=${slug}`);
        if (!response.ok) {
            // Product not in DB, fallback to static HTML content
            console.log('No dynamic data found for this product, using static content.');
            return; 
        }

        const product = await response.json();
        
        // 2. Populate Data in DOM
        
        // Update Titles (assume h1 with class product__title or similar)
        document.querySelectorAll('h1').forEach(h1 => {
            // Very naive replacement, assuming the main H1 is the product title
            // In a real scenario, you'd add specific IDs or classes (e.g. data-dynamic="title") to the exact elements
            if(h1.textContent.trim().length > 0) {
                 h1.textContent = product.name;
            }
        });

        // Update Prices
        // Assuming price classes like .price-item--regular
        document.querySelectorAll('.price-item--regular').forEach(priceEl => {
            priceEl.textContent = `€${product.price}`;
        });
        
        // If there's a discount price
        if (product.discount_price) {
            document.querySelectorAll('.price-item--sale').forEach(priceEl => {
                priceEl.textContent = `€${product.discount_price}`;
            });
            // Show sale badge if applicable
        }

        // Update Stock Status
        // Assuming an element with id="dynamic-stock" or class "product-form__inventory"
        document.querySelectorAll('.product-form__inventory, #dynamic-stock').forEach(stockEl => {
            if (product.stock > 10) {
                stockEl.textContent = 'En stock';
                stockEl.style.color = 'green';
            } else if (product.stock > 0) {
                stockEl.textContent = `Plus que ${product.stock} en stock!`;
                stockEl.style.color = 'orange';
            } else {
                stockEl.textContent = 'Rupture de stock';
                stockEl.style.color = 'red';
            }
        });

        // Parse features if it's JSON
        if (product.features) {
            try {
                const featuresObj = JSON.parse(product.features);
                const featuresContainer = document.querySelector('#dynamic-features');
                if (featuresContainer) {
                    let html = '<ul>';
                    for (const [key, value] of Object.entries(featuresObj)) {
                        html += `<li><strong>${key}:</strong> ${value}</li>`;
                    }
                    html += '</ul>';
                    featuresContainer.innerHTML = html;
                }
            } catch (e) {
                // Not JSON, just text
                const featuresContainer = document.querySelector('#dynamic-features');
                if (featuresContainer) {
                    featuresContainer.textContent = product.features;
                }
            }
        }

        console.log('Dynamic product data loaded successfully.');

    } catch (error) {
        console.error('Error loading dynamic product data:', error);
    }
});
