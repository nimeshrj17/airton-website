document.addEventListener('DOMContentLoaded', () => {
    const API_URL = '/api/products';
    const CAT_API_URL = '/api/categories';
    
    // UI Elements
    const navProducts = document.getElementById('nav-products');
    const navCategories = document.getElementById('nav-categories');
    
    const productsView = document.getElementById('products-view');
    const productFormView = document.getElementById('product-form-view');
    const categoriesView = document.getElementById('categories-view');
    const categoryFormView = document.getElementById('category-form-view');
    
    const btnAddItem = document.getElementById('btn-add-item');
    const mainHeading = document.getElementById('main-heading');
    const msgContainer = document.getElementById('message-container');
    
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
        mainHeading.textContent = "Gestion des Catégories";
        btnAddItem.textContent = "+ Ajouter une catégorie";
        showView('categories');
        fetchCategories();
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

    // Functions
    function showView(view) {
        productsView.classList.add('hidden');
        productFormView.classList.add('hidden');
        categoriesView.classList.add('hidden');
        categoryFormView.classList.add('hidden');
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
