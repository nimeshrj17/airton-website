const BACKEND_URL = 'http://localhost:4000';

async function fetchProducts() {
    try {
        const response = await fetch(`${BACKEND_URL}/api/product/list`);
        const data = await response.json();
        if (data.success) {
            console.log('Fetched products:', data.products);
            // Render products in the UI based on Shopify DOM structure if needed
        }
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

function interceptAddToCart() {
    const forms = document.querySelectorAll('form[action="/cart/add"]');
    forms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const itemId = formData.get('id');
            const quantity = formData.get('quantity') || 1;
            
            console.log(`Intercepted Add to Cart: Item ${itemId}, Quantity ${quantity}`);
            
            // Call our custom backend
            try {
                const response = await fetch(`${BACKEND_URL}/api/cart/add`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'token': localStorage.getItem('token') || '' // Need token if auth is required
                    },
                    body: JSON.stringify({ itemId, size: 'M' }) // Mock size for now
                });
                const result = await response.json();
                console.log('Backend response:', result);
                if (result.success) {
                    alert('Added to custom backend cart!');
                } else {
                    alert('Error: ' + result.message);
                }
            } catch (err) {
                console.error(err);
                alert('Failed to connect to backend.');
            }
        });
    });
}

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
    fetchProducts();
    interceptAddToCart();
    interceptExternalLinks();
    interceptForms();
});
