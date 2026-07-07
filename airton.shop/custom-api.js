

function interceptExternalLinks() {
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (link) {
            const href = link.getAttribute('href') || '';
            
            // Intercept absolute URLs to airton.shop or root-relative URLs
            if (href.includes('airton.shop') || href.startsWith('/')) {
                e.preventDefault();
                
                try {
                    // Try to parse the URL
                    const url = new URL(href, window.location.origin);
                    let pathname = url.pathname;
                    
                    // If the original URL had airton.shop, the pathname is just the path part.
                    // If it was already a local root-relative path (e.g. /products/...), same thing.
                    
                    // Specific overrides for pages we built from scratch
                    if (pathname.includes('/account/login') || pathname.includes('/customer_authentication')) {
                        window.location.href = '/airton.shop/login.html';
                        return;
                    } else if (pathname.includes('/checkout') || pathname.includes('/cart')) {
                        window.location.href = '/airton.shop/checkout.html';
                        return;
                    }
                    
                    // For everything else, SiteSucker probably downloaded it as a .html file.
                    // E.g., /collections/cache-climatiseur -> /airton.shop/collections/cache-climatiseur.html
                    
                    // Clean up the pathname
                    if (pathname.endsWith('/')) {
                        pathname = pathname.slice(0, -1);
                    }
                    if (!pathname.endsWith('.html') && pathname !== '' && pathname !== '/airton.shop') {
                        pathname += '.html';
                    }
                    
                    // Construct the local path
                    let localPath = pathname;
                    if (!localPath.startsWith('/airton.shop')) {
                         localPath = '/airton.shop' + localPath;
                    }
                    
                    console.log(`Routing external link ${href} to local path: ${localPath}`);
                    window.location.href = localPath;
                    
                } catch(err) {
                    console.error("Error parsing intercepted link:", err);
                }
            }
        }
    });
}

function interceptForms() {
    document.addEventListener('submit', (e) => {
        const form = e.target;
        if (form && form.tagName === 'FORM') {
            const action = form.getAttribute('action') || '';
            if (action.includes('airton.shop/localization') || action.includes('/localization')) {
                e.preventDefault();
                console.log('Intercepted localization form submit');
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('Custom API script loaded.');
    interceptExternalLinks();
    interceptForms();
});

// Handle variant changes on static sites to update price natively
document.addEventListener("variant:changed", (e) => {
    const variant = e.detail.variant;
    if (variant && variant.price) {
        // Format price
        let priceStr = (variant.price / 100).toFixed(2);
        // Sometimes prices are formatted with comma
        priceStr = priceStr.replace('.', ',');
        
        // Find price blocks
        const priceEls = document.querySelectorAll('.price-item--regular, .price .price__regular .price-item');
        priceEls.forEach(el => {
            el.innerHTML = `€${priceStr}`;
        });
        
        // Make sure Add to Cart stays active (since static HTML fetch will fail to update it properly)
        const atcBtns = document.querySelectorAll('button[name="add"], .product-form__submit');
        atcBtns.forEach(btn => {
            if (variant.available) {
                btn.removeAttribute('disabled');
                const textSpan = btn.querySelector('.btn__text');
                if (textSpan) textSpan.innerHTML = 'Ajouter au panier';
            }
        });
    }
});
// Monkey-patch Shopify ProductInfo to prevent static HTML fetch and handle variants purely on the client
document.addEventListener('DOMContentLoaded', () => {
    if (customElements.get('product-info')) {
        const ProductInfo = customElements.get('product-info');
        ProductInfo.prototype.renderProductInfo = function({requestUrl, targetId, callback}) {
            console.log('Intercepted static fetch for variants');
            // Find the selected variant values from the DOM
            const fieldsets = Array.from(this.querySelectorAll('fieldset'));
            const selectedOptions = fieldsets.map(fieldset => {
                const checked = fieldset.querySelector('input:checked');
                return checked ? checked.value : null;
            }).filter(Boolean);
            
            // Find the variant in ShopifyAnalytics
            if (window.ShopifyAnalytics && window.ShopifyAnalytics.meta && window.ShopifyAnalytics.meta.product && window.ShopifyAnalytics.meta.product.variants) {
                const variants = window.ShopifyAnalytics.meta.product.variants;
                
                const selectedTitle = selectedOptions.join(' / ');
                let matchedVariant = variants.find(v => v.public_title === selectedTitle || v.title === selectedTitle || (v.name && v.name.includes(selectedTitle)));
                
                if (!matchedVariant) {
                    matchedVariant = variants.find(v => {
                        return selectedOptions.every(opt => (v.public_title && v.public_title.includes(opt)) || (v.name && v.name.includes(opt)));
                    });
                }
                
                if (matchedVariant) {
                    matchedVariant.available = true;
                    
                    // Update price
                    let priceStr = (matchedVariant.price / 100).toFixed(2).replace('.', ',');
                    const priceEls = document.querySelectorAll('.price-item--regular, .price .price__regular .price-item');
                    priceEls.forEach(el => {
                        el.innerHTML = `€${priceStr}`;
                        // Ensure parent isn't hidden
                        el.classList.remove('hidden');
                        if(el.closest('.price')) el.closest('.price').classList.remove('hidden');
                    });
                    
                    // Show inventory
                    const inventoryEls = document.querySelectorAll('[id^="Inventory-"]');
                    inventoryEls.forEach(el => el.classList.remove('hidden'));
                    
                    // Update URL
                    if (this.updateURL) this.updateURL(window.location.pathname, matchedVariant.id);
                    
                    // Activate ATC button
                    if (this.toggleAddButton) this.toggleAddButton(false);
                    const atcBtns = document.querySelectorAll('button[name="add"], .product-form__submit');
                    atcBtns.forEach(btn => {
                        btn.removeAttribute('disabled');
                        const textSpan = btn.querySelector('.btn__text');
                        if (textSpan) textSpan.innerHTML = 'Ajouter au panier';
                    });
                    
                    // Update Cart product state
                    if (window.airtonCurrentProduct) {
                        window.airtonCurrentProduct.id = matchedVariant.id;
                        window.airtonCurrentProduct.price = matchedVariant.price / 100;
                        window.airtonCurrentProduct.name = matchedVariant.name || `${window.airtonCurrentProduct.name.split('-')[0]} - ${selectedTitle}`;
                    }
                }
            }
        };
    }
});
// Fix Vercel 404 on index.html
document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (link && link.href && link.href.endsWith('index.html')) {
        // If we are on Vercel or a web server, /index.html often 404s with cleanUrls.
        if (window.location.protocol.startsWith('http')) {
            e.preventDefault();
            window.location.href = '/';
        }
    }
});
