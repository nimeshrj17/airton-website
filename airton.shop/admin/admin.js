document.addEventListener('DOMContentLoaded', () => {
    const API_URL = '/api/products'; // Uses Vercel serverless functions
    
    // UI Elements
    const productsView = document.getElementById('products-view');
    const productFormView = document.getElementById('product-form-view');
    const btnAddProduct = document.getElementById('btn-add-product');
    const btnCancel = document.getElementById('btn-cancel');
    const productForm = document.getElementById('product-form');
    const tableBody = document.getElementById('products-table-body');
    const formTitle = document.getElementById('form-title');
    const msgContainer = document.getElementById('message-container');

    let isEditing = false;

    // Load Products on startup
    fetchProducts();

    // Event Listeners
    btnAddProduct.addEventListener('click', () => {
        isEditing = false;
        formTitle.textContent = "Ajouter un produit";
        productForm.reset();
        document.getElementById('product-id').value = '';
        showView('form');
    });

    btnCancel.addEventListener('click', () => {
        showView('table');
    });

    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const productData = {
            name: document.getElementById('name').value,
            slug: document.getElementById('slug').value,
            price: parseFloat(document.getElementById('price').value),
            discount_price: document.getElementById('discount_price').value ? parseFloat(document.getElementById('discount_price').value) : null,
            stock: parseInt(document.getElementById('stock').value),
            categories: document.getElementById('categories').value,
            features: document.getElementById('features').value // stored as text/json string
        };

        const id = document.getElementById('product-id').value;
        if (isEditing && id) {
            productData.id = id;
        }

        try {
            const method = isEditing ? 'PUT' : 'POST';
            const response = await fetch(API_URL, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erreur lors de la sauvegarde');
            }

            showMessage(`Produit ${isEditing ? 'modifié' : 'ajouté'} avec succès!`, 'success');
            showView('table');
            fetchProducts();
        } catch (error) {
            showMessage(error.message, 'error');
        }
    });

    // Functions
    function showView(view) {
        if (view === 'form') {
            productsView.classList.add('hidden');
            productFormView.classList.remove('hidden');
            btnAddProduct.classList.add('hidden');
        } else {
            productFormView.classList.add('hidden');
            productsView.classList.remove('hidden');
            btnAddProduct.classList.remove('hidden');
        }
    }

    function showMessage(text, type) {
        msgContainer.innerHTML = `<div class="message ${type}">${text}</div>`;
        setTimeout(() => {
            msgContainer.innerHTML = '';
        }, 5000);
    }

    async function fetchProducts() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Erreur de chargement des produits');
            
            const products = await response.json();
            renderTable(products);
        } catch (error) {
            tableBody.innerHTML = `<tr><td colspan="7" style="color:red;text-align:center;">${error.message}</td></tr>`;
        }
    }

    function renderTable(products) {
        if (!products || products.length === 0) {
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

        // Attach event listeners to buttons
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const product = JSON.parse(e.target.getAttribute('data-product'));
                editProduct(product);
            });
        });

        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                if(confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
                    deleteProduct(id);
                }
            });
        });
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
        
        showView('form');
    }

    async function deleteProduct(id) {
        try {
            const response = await fetch(API_URL, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });

            if (!response.ok) throw new Error('Erreur lors de la suppression');
            
            showMessage('Produit supprimé.', 'success');
            fetchProducts();
        } catch (error) {
            showMessage(error.message, 'error');
        }
    }
});
