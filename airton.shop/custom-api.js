

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
                    } else if (pathname.includes('/checkout')) {
                        window.location.href = '/airton.shop/checkout.html';
                        return;
                    } else if (pathname.includes('/cart')) {
                        window.location.href = '/airton.shop/cart.html';
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


// 1. Block the theme's native fetch for static HTML
const originalFetch = window.fetch;
window.fetch = function() {
    const url = arguments[0];
    if (typeof url === 'string' && url.includes('section_id=') && url.includes('/products/')) {
        console.log('Blocked static fetch for variant update');
        return new Promise(() => {}); // Never resolve, halting the theme's update logic
    }
    return originalFetch.apply(this, arguments);
};

// 2. Natively handle the variant changes
document.addEventListener('change', (e) => {
    if (e.target.matches('variant-selects input[type="radio"]')) {
        const productInfo = e.target.closest('product-info') || document;
        const fieldsets = Array.from(productInfo.querySelectorAll('fieldset'));
        const selectedOptions = fieldsets.map(fieldset => {
            const checked = fieldset.querySelector('input:checked');
            return checked ? checked.value : null;
        }).filter(Boolean);
        
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
                // Format price exactly like original: "599.90€" or "699.90€"
                let priceStr = (matchedVariant.price / 100).toFixed(2) + '€';
                
                // Update standard price blocks (using the correct class for this theme)
                const priceEls = document.querySelectorAll('.f-price-item--regular, .f-price-item--sale, .price-item');
                priceEls.forEach(el => {
                    if (!el.classList.contains('price-from')) {
                        el.innerHTML = priceStr;
                    }
                });
                
                // Update URL via pushState
                window.history.replaceState({}, "", window.location.pathname + "?variant=" + matchedVariant.id);
                
                // Keep the button active
                const atcBtns = document.querySelectorAll('button[name="add"], .product-form__submit');
                atcBtns.forEach(btn => {
                    btn.removeAttribute('disabled');
                    const textSpan = btn.querySelector('.btn__text');
                    if (textSpan) textSpan.innerHTML = 'Ajouter au panier';
                });
                
                // Keep inventory visible
                const inventoryEls = document.querySelectorAll('[id^="Inventory-"]');
                inventoryEls.forEach(el => el.classList.remove('hidden'));
                
                // Update global cart state
                if (window.airtonCurrentProduct) {
                    window.airtonCurrentProduct.id = matchedVariant.id;
                    window.airtonCurrentProduct.price = matchedVariant.price / 100;
                    window.airtonCurrentProduct.name = matchedVariant.name || (window.airtonCurrentProduct.name.split('-')[0] + ' - ' + selectedTitle);
                }
            }
        }
    }
});
