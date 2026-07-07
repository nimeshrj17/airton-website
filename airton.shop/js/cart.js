// js/cart.js

function getCart() {
    const cart = localStorage.getItem('airton_cart');
    return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
    localStorage.setItem('airton_cart', JSON.stringify(cart));
    updateCartIcon();
    renderCart(); // If on cart page
    if (typeof renderCartDrawer === 'function') renderCartDrawer();
}

function addToCart(product, quantity = 1) {
    const cart = getCart();
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            slug: product.slug,
            name: product.name,
            price: parseFloat(product.price),
            image_url: product.image_url,
            quantity: quantity
        });
    }
    
    saveCart(cart);
    alert(product.name + " ajouté au panier!");
}

function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
}

function updateQuantity(productId, quantity) {
    const cart = getCart();
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = Math.max(1, quantity);
        saveCart(cart);
    }
}

function clearCart() {
    localStorage.removeItem('airton_cart');
    updateCartIcon();
    renderCart();
    if (typeof renderCartDrawer === 'function') renderCartDrawer();
}

function updateCartIcon() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    document.querySelectorAll('.cart-drawer-button, a[href="cart.html"]').forEach(btn => {
        let countSpan = btn.querySelector('.custom-cart-count');
        if (!countSpan) {
            countSpan = document.createElement('span');
            countSpan.className = 'custom-cart-count';
            countSpan.style.cssText = 'position: absolute; top: -5px; right: -5px; background-color: #ff0000; color: #ffffff; border-radius: 50%; font-size: 11px; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; font-weight: bold;';
            btn.appendChild(countSpan);
        }
        countSpan.textContent = totalItems;
        countSpan.style.display = totalItems > 0 ? 'flex' : 'none';
    });
}

function setupAddToCartInterception() {
    // Intercept form submissions just in case
    document.addEventListener('submit', (e) => {
        if (e.target.matches('form[action*="/cart/add"]')) {
            e.preventDefault();
            e.stopPropagation();
        }
    }, true);
    
    // Strip existing event listeners and prevent native form submit by cloning all ATC buttons
    const atcButtons = document.querySelectorAll('button[name="add"], .product-form__submit, .configurator-sticky-btn, .configurator-useful-card__add, .configurator-content-footer-add-to-cart');
    atcButtons.forEach(btn => {
        const clone = btn.cloneNode(true);
        clone.type = 'button'; // Strip submit behavior
        if (btn.parentNode) {
            btn.parentNode.replaceChild(clone, btn);
        }
    });

    // Global click interceptor in capture phase to beat any existing frameworks (React/Vue/etc)
    document.addEventListener('click', async (e) => {
        const atcBtn = e.target.closest('button[name="add"], .product-form__submit, .configurator-sticky-btn, .configurator-useful-card__add, .configurator-content-footer-add-to-cart');
        
        if (atcBtn) {
            e.preventDefault();
            e.stopPropagation();
            
            let productToAdd = window.airtonCurrentProduct;
            
            if (!productToAdd) {
                // We are likely on a collection page or homepage. Try to extract slug from a product link in the same card.
                const card = atcBtn.closest('.grid__item, .product-card-wrapper, li, form, div');
                let slug = null;
                if (card) {
                    const link = card.querySelector('a[href*="products/"]');
                    if (link) {
                        const match = link.getAttribute('href').match(/products\/([^.]+)/);
                        if (match) slug = match[1];
                    }
                }
                
                if (slug) {
                    const originalText = atcBtn.textContent;
                    atcBtn.textContent = '...';
                    try {
                        const response = await fetch(`/api/products?slug=${slug}`);
                        if (response.ok) {
                            productToAdd = await response.json();
                            productToAdd.slug = slug;
                            
                            // Try to grab an image from the card for the cart thumbnail
                            const img = card.querySelector('img');
                            if (img) productToAdd.image_url = img.src || img.getAttribute('data-src') || productToAdd.image_url;
                        }
                    } catch (err) {
                        console.error('Fetch error:', err);
                    }
                    atcBtn.textContent = originalText;
                }
            }
            
            if (productToAdd) {
                let quantity = 1;
                const form = atcBtn.closest('form');
                if (form) {
                    const qtyInput = form.querySelector('input[name="quantity"]');
                    if (qtyInput) quantity = parseInt(qtyInput.value) || 1;
                }
                
                addToCart(productToAdd, quantity);
                
                // Try to open the cart drawer automatically
                const cartDrawer = document.querySelector('cart-drawer');
                if (cartDrawer && typeof cartDrawer.open === 'function') {
                    cartDrawer.open();
                } else if (cartDrawer && cartDrawer.classList) {
                    cartDrawer.classList.add('is-active', 'active');
                    cartDrawer.removeAttribute('hidden');
                    document.body.classList.add('overflow-hidden');
                }
            } else {
                alert("Erreur: Impossible d'ajouter ce produit au panier.");
            }
        }
    }, true);
}

function renderCart() {
    // Only run if we're on the cart page
    const cartForm = document.querySelector('.cart__form');
    const emptyState = document.querySelector('.cart__empty');
    const cartFooter = document.querySelector('.cart__footer');
    const tbody = document.querySelector('.cart__form tbody');
    
    if (!cartForm || !tbody || !emptyState) return;
    
    const cart = getCart();
    
    if (cart.length === 0) {
        emptyState.classList.remove('hidden');
        cartForm.classList.add('hidden');
        if(cartFooter) cartFooter.classList.add('hidden');
    } else {
        emptyState.classList.add('hidden');
        cartForm.classList.remove('hidden');
        if(cartFooter) cartFooter.classList.remove('hidden');
        
        let html = '';
        let total = 0;
        
        cart.forEach(item => {
            const lineTotal = item.price * item.quantity;
            total += lineTotal;
            const imgSrc = item.image_url || 'https://via.placeholder.com/80?text=Airton';
            
            html += `
            <tr class="cart-item" style="border-bottom: 1px solid #eee; padding-bottom: 15px; margin-bottom: 15px; display: flex; flex-direction: column; md:table-row">
                <td style="padding: 10px;">
                    <div style="display: flex; gap: 15px; align-items: center;">
                        <img src="${imgSrc}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: contain; border: 1px solid #ddd; border-radius: 4px;">
                        <div>
                            <h3 style="margin: 0; font-size: 16px;">${item.name}</h3>
                            <p style="margin: 5px 0 0 0; font-weight: bold;">€${item.price.toFixed(2)}</p>
                        </div>
                    </div>
                </td>
                <td style="padding: 10px; vertical-align: middle;">
                    <div style="display: inline-flex; border: 1px solid #ddd; border-radius: 4px;">
                        <button type="button" onclick="updateQuantity('${item.id}', ${item.quantity - 1})" style="padding: 5px 15px; border-right: 1px solid #ddd; background: none; cursor: pointer;">-</button>
                        <input type="number" value="${item.quantity}" readonly style="width: 40px; text-align: center; border: none; background: none; font-weight: bold;">
                        <button type="button" onclick="updateQuantity('${item.id}', ${item.quantity + 1})" style="padding: 5px 15px; border-left: 1px solid #ddd; background: none; cursor: pointer;">+</button>
                    </div>
                </td>
                <td style="padding: 10px; vertical-align: middle; text-align: right; font-weight: bold; font-size: 18px;">
                    €${lineTotal.toFixed(2)}
                </td>
                <td style="padding: 10px; vertical-align: middle; text-align: center;">
                    <button type="button" onclick="removeFromCart('${item.id}')" style="color: red; cursor: pointer; background: none; border: none; text-decoration: underline;">Retirer</button>
                </td>
            </tr>
            `;
        });
        
        tbody.innerHTML = html;
        
        // Update subtotal (Shopify's default class)
        const subtotalEls = document.querySelectorAll('.totals__subtotal-value, .cart-subtotal');
        if (subtotalEls.length > 0) {
            subtotalEls.forEach(el => el.textContent = `€${total.toFixed(2)}`);
        } else {
            // If the element doesn't exist, we can create a simple total display in the footer
            const summaryContainer = document.querySelector('.cart__footer-wrapper');
            if (summaryContainer) {
                let ourTotal = document.getElementById('custom-cart-total');
                if (!ourTotal) {
                    ourTotal = document.createElement('div');
                    ourTotal.id = 'custom-cart-total';
                    ourTotal.style.cssText = 'text-align: right; font-size: 24px; font-weight: bold; margin-bottom: 20px;';
                    summaryContainer.prepend(ourTotal);
                }
                ourTotal.innerHTML = `Total: €${total.toFixed(2)}`;
            }
        }
    }
}

// Intercept checkout button
function setupCheckoutButton() {
    const checkoutBtns = document.querySelectorAll('[name="checkout"], .cart__checkout-button');
    checkoutBtns.forEach(btn => {
        btn.onclick = async (e) => {
            e.preventDefault();
            const cart = getCart();
            if (cart.length === 0) return;
            
            // Check if user is logged in
            if (localStorage.getItem('user_logged_in') !== 'true') {
                window.location.href = '/airton.shop/login.html?redirect=' + encodeURIComponent('/airton.shop/checkout.html');
                return;
            }
            
            // Route directly to checkout form
            window.location.href = '/airton.shop/checkout.html';
        }
    });
}

function initCart() {
    updateCartIcon();
    renderCart();
    if (typeof renderCartDrawer === 'function') renderCartDrawer();
    setupCheckoutButton();
    setupAddToCartInterception();
    
    // Restrict shipping calculator countries
    const countrySelects = document.querySelectorAll('select[name="address[country]"]');
    countrySelects.forEach(select => {
        select.innerHTML = `
            <option value="France" data-provinces="[]">France</option>
            <option value="Belgium" data-provinces="[]">Belgique</option>
            <option value="Switzerland" data-provinces="[]">Suisse</option>
            <option value="Spain" data-provinces="[]">Espagne</option>
            <option value="Italy" data-provinces="[]">Italie</option>
        `;
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCart);
} else {
    initCart();
}

window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;

function renderCartDrawer() {
    const drawer = document.querySelector('cart-drawer');
    if (!drawer) return;
    
    const emptyState = drawer.querySelector('[id^="CartDrawerEmpty-"]');
    const bodyState = drawer.querySelector('[id^="CartDrawerBody-"]');
    const footerState = drawer.querySelector('[id^="CartDrawerFooter-"]');
    
    const cart = getCart();
    
    if (cart.length === 0) {
        drawer.setAttribute('is-empty', '');
        drawer.classList.add('is-empty');
        if (emptyState) {
            emptyState.classList.remove('hidden');
            emptyState.style.setProperty('display', 'block', 'important');
        }
        if (bodyState) bodyState.classList.add('hidden');
        if (footerState) footerState.classList.add('hidden');
    } else {
        drawer.removeAttribute('is-empty');
        drawer.classList.remove('is-empty');
        if (emptyState) {
            emptyState.classList.add('hidden');
            emptyState.style.setProperty('display', 'none', 'important');
        }
        if (bodyState) {
            bodyState.classList.remove('hidden');
            bodyState.style.display = 'flex';
        }
        if (footerState) {
            footerState.classList.remove('hidden');
            footerState.style.display = 'grid'; // The original CSS uses grid
        }
        
        let html = '';
        let total = 0;
        
        cart.forEach(item => {
            const lineTotal = item.price * item.quantity;
            total += lineTotal;
            const imgSrc = item.image_url || 'https://via.placeholder.com/80?text=Airton';
            
            html += `
            <div class="cart-item" style="display: flex; gap: 15px; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 15px;">
                <img src="${imgSrc}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: contain; border: 1px solid #ddd; border-radius: 4px;">
                <div style="flex-grow: 1;">
                    <h3 style="margin: 0 0 5px 0; font-size: 14px;">${item.name}</h3>
                    <p style="margin: 0 0 10px 0; font-weight: bold;">€${item.price.toFixed(2)}</p>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="display: inline-flex; border: 1px solid #ddd; border-radius: 4px;">
                            <button type="button" onclick="updateQuantity('${item.id}', ${item.quantity - 1})" style="padding: 2px 10px; border-right: 1px solid #ddd; background: none; cursor: pointer;">-</button>
                            <input type="number" value="${item.quantity}" readonly style="width: 30px; text-align: center; border: none; background: none; font-size: 14px;">
                            <button type="button" onclick="updateQuantity('${item.id}', ${item.quantity + 1})" style="padding: 2px 10px; border-left: 1px solid #ddd; background: none; cursor: pointer;">+</button>
                        </div>
                        <button type="button" onclick="removeFromCart('${item.id}')" style="color: #666; cursor: pointer; background: none; border: none; text-decoration: underline; font-size: 12px;">Retirer</button>
                    </div>
                </div>
            </div>
            `;
        });
        
        const cartItemsContainer = drawer.querySelector('cart-items');
        if (cartItemsContainer) {
            cartItemsContainer.innerHTML = html;
        }
        
        // Try to update standard Shopify total element
        const footerTotals = drawer.querySelector('.totals__subtotal-value');
        if (footerTotals) {
            footerTotals.textContent = `€${total.toFixed(2)}`;
        } else if (footerState) {
            let ourTotal = document.getElementById('drawer-custom-total');
            if (!ourTotal) {
                ourTotal = document.createElement('div');
                ourTotal.id = 'drawer-custom-total';
                ourTotal.style.cssText = 'text-align: right; font-size: 20px; font-weight: bold; margin-bottom: 15px;';
                footerState.prepend(ourTotal);
            }
            ourTotal.innerHTML = `Total: €${total.toFixed(2)}`;
        }
    }
}

