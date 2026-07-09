document.addEventListener('DOMContentLoaded', () => {
    const API_URL = '/api/products';
    const CAT_API_URL = '/api/categories';
    
    // UI Elements
    const navProducts = document.getElementById('nav-products');
    const navCategories = document.getElementById('nav-categories');
    const navOrders = document.getElementById('nav-orders');
    
    const productsView = document.getElementById('products-view');
    const productFormView = document.getElementById('product-form-view');
    const categoriesView = document.getElementById('categories-view');
    const categoryFormView = document.getElementById('category-form-view');
    const ordersView = document.getElementById('orders-view');
    const settingsView = document.getElementById('settings-view');
    
    const btnAddItem = document.getElementById('btn-add-item');
    const mainHeading = document.getElementById('main-heading');
    const msgContainer = document.getElementById('message-container');
    const navSettings = document.getElementById('nav-settings');
    
    const productForm = document.getElementById('product-form');
    const btnCancel = document.getElementById('btn-cancel');
    const tableBody = document.getElementById('products-table-body');
    const formTitle = document.getElementById('form-title');
    
    const categoryForm = document.getElementById('category-form');
    const btnCancelCat = document.getElementById('btn-cancel-cat');
    const catTableBody = document.getElementById('categories-table-body');

    let currentTab = 'products'; // 'products' or 'categories'
    let isEditing = false;

    // Load initial data
    fetchProducts();

    // Nav Listeners
    navProducts.addEventListener('click', (e) => {
        e.preventDefault();
        currentTab = 'products';
        navProducts.classList.add('active');
        navCategories.classList.remove('active');
        navOrders.classList.remove('active');
        navSettings.classList.remove('active');
        mainHeading.textContent = "Gestion des Produits";
        btnAddItem.textContent = "+ Ajouter un produit";
        showView('products');
        fetchProducts();
    });

    navCategories.addEventListener('click', (e) => {
        e.preventDefault();
        currentTab = 'categories';
        navCategories.classList.add('active');
        navProducts.classList.remove('active');
        navOrders.classList.remove('active');
        navSettings.classList.remove('active');
        mainHeading.textContent = "Gestion des Catégories";
        btnAddItem.textContent = "+ Ajouter une catégorie";
        showView('categories');
        fetchCategories();
    });

    navOrders.addEventListener('click', (e) => {
        e.preventDefault();
        currentTab = 'orders';
        navOrders.classList.add('active');
        navProducts.classList.remove('active');
        navCategories.classList.remove('active');
        navSettings.classList.remove('active');
        mainHeading.textContent = "Gestion des Commandes";
        btnAddItem.classList.add('hidden');
        showView('orders');
        fetchOrders();
    });

    navSettings.addEventListener('click', (e) => {
        e.preventDefault();
        currentTab = 'settings';
        navSettings.classList.add('active');
        navProducts.classList.remove('active');
        navCategories.classList.remove('active');
        navOrders.classList.remove('active');
        mainHeading.textContent = "Coordonnées Bancaires";
        btnAddItem.classList.add('hidden');
        showView('settings');
        fetchBankSettings();
    });

    // Add Item Button
    btnAddItem.addEventListener('click', () => {
        if (currentTab === 'products') {
            isEditing = false;
            formTitle.textContent = "Ajouter un produit";
            productForm.reset();
            document.getElementById('product-id').value = '';
            showView('product-form');
        } else {
            categoryForm.reset();
            showView('category-form');
        }
    });

    btnCancel.addEventListener('click', () => showView('products'));
    btnCancelCat.addEventListener('click', () => showView('categories'));

    // Submit Product
    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const productData = {
            name: document.getElementById('name').value,
            slug: document.getElementById('slug').value,
            price: parseFloat(document.getElementById('price').value),
            discount_price: document.getElementById('discount_price').value ? parseFloat(document.getElementById('discount_price').value) : null,
            stock: parseInt(document.getElementById('stock').value),
            categories: document.getElementById('categories').value,
            features: document.getElementById('features').value
        };
        const id = document.getElementById('product-id').value;
        if (isEditing && id) productData.id = id;

        try {
            const response = await fetch(API_URL, {
                method: isEditing ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });
            if (!response.ok) throw new Error('Erreur lors de la sauvegarde');
            showMessage(`Produit ${isEditing ? 'modifié' : 'ajouté'}!`, 'success');
            showView('products');
            fetchProducts();
        } catch (error) {
            showMessage(error.message, 'error');
        }
    });

    // Submit Category
    categoryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const catData = {
            name: document.getElementById('cat-name').value,
            slug: document.getElementById('cat-slug').value
        };
        try {
            const response = await fetch(CAT_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(catData)
            });
            if (!response.ok) throw new Error('Erreur lors de la sauvegarde de la catégorie');
            showMessage('Catégorie ajoutée!', 'success');
            showView('categories');
            fetchCategories();
        } catch (error) {
            showMessage(error.message, 'error');
        }
    });
    // Submit Bank Settings
    const settingsBankForm = document.getElementById('settings-bank-form');
    if (settingsBankForm) {
        settingsBankForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const bankData = {
                beneficiary: document.getElementById('bank-beneficiary').value,
                iban: document.getElementById('bank-iban').value,
                bic: document.getElementById('bank-bic').value
            };
            
            try {
                const response = await fetch('/api/settings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ key: 'bank_details', value: bankData })
                });
                if (!response.ok) throw new Error('Erreur lors de la sauvegarde');
                showMessage('Coordonnées bancaires enregistrées!', 'success');
            } catch (error) {
                showMessage(error.message, 'error');
            }
        });
    }

    // Functions
    function showView(view) {
        productsView.classList.add('hidden');
        productFormView.classList.add('hidden');
        categoriesView.classList.add('hidden');
        categoryFormView.classList.add('hidden');
        ordersView.classList.add('hidden');
        settingsView.classList.add('hidden');
        btnAddItem.classList.add('hidden');

        if (view === 'products') {
            productsView.classList.remove('hidden');
            btnAddItem.classList.remove('hidden');
        } else if (view === 'product-form') {
            productFormView.classList.remove('hidden');
        } else if (view === 'categories') {
            categoriesView.classList.remove('hidden');
            btnAddItem.classList.remove('hidden');
        } else if (view === 'category-form') {
            categoryFormView.classList.remove('hidden');
        } else if (view === 'orders') {
            ordersView.classList.remove('hidden');
        } else if (view === 'settings') {
            settingsView.classList.remove('hidden');
        }
    }

    function showMessage(text, type) {
        msgContainer.innerHTML = `<div class="message ${type}">${text}</div>`;
        setTimeout(() => msgContainer.innerHTML = '', 5000);
    }

    async function fetchProducts() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Erreur de chargement des produits');
            const products = await response.json();
            
            if (products.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">Aucun produit trouvé.</td></tr>`;
                return;
            }
            
            tableBody.innerHTML = '';
            products.forEach(p => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${p.name}</strong></td>
                    <td>${p.slug}</td>
                    <td>${p.price} €</td>
                    <td>${p.discount_price ? p.discount_price + ' €' : '-'}</td>
                    <td>
                        <span style="color: ${p.stock > 10 ? 'green' : (p.stock > 0 ? 'orange' : 'red')}">
                            ${p.stock}
                        </span>
                    </td>
                    <td>${p.categories || '-'}</td>
                    <td>
                        <button class="btn btn-secondary btn-edit" data-product='${JSON.stringify(p).replace(/'/g, "&apos;")}'>Éditer</button>
                        <button class="btn btn-danger btn-delete" data-id="${p.id}">Suppr.</button>
                    </td>
                `;
                tableBody.appendChild(tr);
            });

            document.querySelectorAll('.btn-edit').forEach(btn => {
                btn.addEventListener('click', (e) => editProduct(JSON.parse(e.target.getAttribute('data-product'))));
            });
            document.querySelectorAll('.btn-delete').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    if(confirm('Supprimer ce produit ?')) deleteProduct(e.target.getAttribute('data-id'));
                });
            });
        } catch (error) {
            tableBody.innerHTML = `<tr><td colspan="7" style="color:red;text-align:center;">${error.message}</td></tr>`;
        }
    }

    async function fetchCategories() {
        try {
            const response = await fetch(CAT_API_URL);
            if (!response.ok) throw new Error('Erreur de chargement des catégories');
            const categories = await response.json();
            
            if (categories.length === 0) {
                catTableBody.innerHTML = `<tr><td colspan="3" style="text-align:center;">Aucune catégorie.</td></tr>`;
                return;
            }
            
            catTableBody.innerHTML = '';
            categories.forEach(c => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${c.name}</strong></td>
                    <td>${c.slug}</td>
                    <td>
                        <button class="btn btn-danger btn-delete-cat" data-id="${c.id}">Suppr.</button>
                    </td>
                `;
                catTableBody.appendChild(tr);
            });

            document.querySelectorAll('.btn-delete-cat').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    if(confirm('Supprimer cette catégorie ?')) deleteCategory(e.target.getAttribute('data-id'));
                });
            });
        } catch (error) {
            catTableBody.innerHTML = `<tr><td colspan="3" style="color:red;text-align:center;">${error.message}</td></tr>`;
        }
    }

    async function fetchOrders() {
        const orderTableBody = document.getElementById('orders-table-body');
        try {
            const response = await fetch('/api/orders');
            if (!response.ok) throw new Error('Erreur de chargement des commandes');
            const orders = await response.json();
            
            if (orders.length === 0) {
                orderTableBody.innerHTML = `<tr><td colspan="9" style="text-align:center;">Aucune commande.</td></tr>`;
                return;
            }
            
            orderTableBody.innerHTML = '';
            orders.forEach(o => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>#${o.id}</strong></td>
                    <td>${new Date(o.created_at).toLocaleString('fr-FR')}</td>
                    <td>
                        ${(o.first_name && o.first_name !== 'null') ? (o.first_name + ' ' + (o.last_name || '')) : '<em style="color:#aaa;">Invité</em>'}
                        ${o.order_data && o.order_data.bank_reference ? `<br><small style="color:#016FD0; font-weight:bold;">Ref: ${o.order_data.bank_reference}</small>` : ''}
                    </td>
                    <td>${o.email}</td>
                    <td>
                        <ul style="margin: 0; padding-left: 15px; font-size: 0.85em; text-align: left;">
                            ${(o.items && Array.isArray(o.items)) ? o.items.map(item => `<li>${item.quantity}x ${item.name || item.title || 'Article'}</li>`).join('') : '<em>Non disponible</em>'}
                        </ul>
                    </td>
                    <td>${parseFloat(o.total_amount).toFixed(2)} €</td>
                    <td>${o.order_data && (o.order_data.payment_method === 'bank' || o.order_data.payment_method === 'bank_transfer') ? 'Virement' : (o.order_data && o.order_data.payment_method === 'card' ? 'Carte' : '-')}</td>
                    <td>
                        <span style="padding: 3px 8px; border-radius: 4px; font-size: 0.85rem; color: white; background-color: ${o.status === 'paid' ? 'green' : (o.status === 'pending' ? 'orange' : 'gray')}">
                            ${o.status.toUpperCase()}
                        </span>
                    </td>
                    <td>
                        ${o.status === 'pending' ? `<div style="display:flex; flex-direction:column; gap:5px;"><button class="btn btn-primary btn-confirm-order" style="padding: 4px 8px; font-size: 0.8rem;" data-id="${o.id}">Confirmer</button><button class="btn-remind-order" style="padding: 4px 8px; font-size: 0.8rem; background-color: #ffc107; color: #000; border: none; border-radius: 4px; cursor: pointer;" data-id="${o.id}">Relancer</button></div>` : '-'}
                    </td>
                `;
                orderTableBody.appendChild(tr);
            });

                        document.querySelectorAll('.btn-remind-order').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    if (confirm("Envoyer un email de relance (en attente de paiement) au client ?")) {
                        remindOrder(e.target.getAttribute('data-id'));
                    }
                });
            });

            document.querySelectorAll('.btn-confirm-order').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    if (confirm("Confirmer le paiement et envoyer l'email au client ?")) {
                        confirmOrder(e.target.getAttribute('data-id'));
                    }
                });
            });
        } catch (error) {
            orderTableBody.innerHTML = `<tr><td colspan="9" style="color:red;text-align:center;">${error.message}</td></tr>`;
        }
    }

        async function remindOrder(id) {
        showMessage('Envoi de la relance en cours...', 'success');
        try {
            const response = await fetch('/api/remind-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId: id })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Erreur lors de la relance');
            
            if (data.emailSent) {
                showMessage('Relance envoyée au client !', 'success');
            } else {
                showMessage('Relance traitée (mais SMTP non configuré pour email).', 'success');
            }
        } catch (error) {
            showMessage(error.message, 'error');
        }
    }

    async function confirmOrder(id) {
        showMessage('Confirmation en cours...', 'success');
        try {
            const response = await fetch('/api/confirm-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId: id })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Erreur lors de la confirmation');
            
            if (data.emailSent) {
                showMessage('Commande confirmée et email envoyé !', 'success');
            } else {
                showMessage('Commande confirmée (mais SMTP non configuré pour email).', 'success');
            }
            fetchOrders();
        } catch (error) {
            showMessage(error.message, 'error');
        }
    }

    function editProduct(product) {
        isEditing = true;
        formTitle.textContent = "Modifier le produit";
        document.getElementById('product-id').value = product.id;
        document.getElementById('name').value = product.name;
        document.getElementById('slug').value = product.slug;
        document.getElementById('price').value = product.price;
        document.getElementById('discount_price').value = product.discount_price || '';
        document.getElementById('stock').value = product.stock;
        document.getElementById('categories').value = product.categories || '';
        document.getElementById('features').value = product.features || '';
        showView('product-form');
    }

    async function deleteProduct(id) {
        try {
            const response = await fetch(API_URL, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
            if (!response.ok) throw new Error('Erreur de suppression');
            showMessage('Produit supprimé.', 'success');
            fetchProducts();
        } catch (error) {
            showMessage(error.message, 'error');
        }
    }

    async function deleteCategory(id) {
        try {
            const response = await fetch(CAT_API_URL, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
            if (!response.ok) throw new Error('Erreur de suppression (assurez-vous que la table catégories existe)');
            showMessage('Catégorie supprimée.', 'success');
            fetchCategories();
        } catch (error) {
            showMessage(error.message, 'error');
        }
    }
});
