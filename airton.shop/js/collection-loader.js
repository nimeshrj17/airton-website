document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/api/products');
        if (!response.ok) return;
        const products = await response.json();
        
        // Find all product cards across the site
        const productCards = document.querySelectorAll('.product-card__wrapper, .product-card-wrapper, .grid__item');
        
        productCards.forEach(card => {
            // Find the link to get the slug
            const link = card.querySelector('a[href*="/products/"], a[href*="products/"]');
            if (!link) return;
            
            const href = link.getAttribute('href');
            const slug = href.split('/').pop().replace('.html', '').split('?')[0];
            
            // Find matching product in DB
            const dbProduct = products.find(p => p.slug === slug);
            if (!dbProduct) return;
            
            // Update the prices
            const priceContainer = card.querySelector('.f-price, .price');
            if (!priceContainer) return;
            
            if (dbProduct.discount_price && parseFloat(dbProduct.discount_price) > 0 && parseFloat(dbProduct.discount_price) < parseFloat(dbProduct.price)) {
                priceContainer.classList.add('f-price--on-sale', 'price--on-sale');
                
                const salePriceEls = priceContainer.querySelectorAll('.f-price-item--sale, .price-item--sale');
                salePriceEls.forEach(el => { 
                    const fromPrefix = el.querySelector('.price-from');
                    if (fromPrefix) {
                        el.innerHTML = `<span class="price-from">à partir de</span> <span class="price-item">${parseFloat(dbProduct.discount_price).toFixed(2)}€</span>`;
                    } else {
                        el.textContent = `${parseFloat(dbProduct.discount_price).toFixed(2)}€`; 
                    }
                });
                
                const regularPriceEls = priceContainer.querySelectorAll('.f-price-item--regular, .price-item--regular');
                regularPriceEls.forEach(el => {
                    if (el.closest('.f-price__sale, .price__sale')) {
                        const sTag = el.querySelector('s');
                        if (sTag) {
                            sTag.textContent = `${parseFloat(dbProduct.price).toFixed(2)}€`;
                        } else {
                            el.innerHTML = `<s>${parseFloat(dbProduct.price).toFixed(2)}€</s>`;
                        }
                    }
                });
            } else {
                priceContainer.classList.remove('f-price--on-sale', 'price--on-sale');
                const regularPriceEls = priceContainer.querySelectorAll('.f-price-item--regular, .price-item--regular');
                regularPriceEls.forEach(el => {
                    if (!el.closest('.f-price__sale, .price__sale')) {
                        const fromPrefix = el.querySelector('.price-from');
                        if (fromPrefix) {
                            el.innerHTML = `<span class="price-from">à partir de</span> <span class="price-item">${parseFloat(dbProduct.price).toFixed(2)}€</span>`;
                        } else {
                            el.textContent = `${parseFloat(dbProduct.price).toFixed(2)}€`;
                        }
                    }
                });
            }
        });
    } catch(e) {
        console.error("Failed to load collection prices", e);
    }
});
