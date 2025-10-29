// app.js

// State management
let products = [];
let draggingProduct = null;
let offset = { x: 0, y: 0 };

// DOM Elements
const productUrlInput = document.getElementById('productUrl');
const productTypeSelect = document.getElementById('productType');
const extractBtn = document.getElementById('extractBtn');
const clearAllBtn = document.getElementById('clearAllBtn');
const exportBtn = document.getElementById('exportBtn');
const productList = document.getElementById('productList');
const productCount = document.getElementById('productCount');
const productsContainer = document.getElementById('productsContainer');
const overlayText = document.getElementById('overlayText');
const modelViewer = document.getElementById('modelViewer');

// Extract Product
extractBtn.addEventListener('click', () => {
    const url = productUrlInput.value.trim();
    const type = productTypeSelect.value;
    
    if (!url) {
        alert('Please enter a product image URL');
        return;
    }
    
    // Create new product
    const newProduct = {
        id: Date.now().toString(),
        imageUrl: url,
        type: type,
        position: { x: 150, y: 150 },
        scale: 1
    };
    
    products.push(newProduct);
    productUrlInput.value = '';
    
    updateUI();
    renderProducts();
});

// Clear All Products
clearAllBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to remove all products?')) {
        products = [];
        updateUI();
        renderProducts();
    }
});

// Export Functionality
exportBtn.addEventListener('click', () => {
    alert('Export feature coming soon! This will allow you to download your styled model.');
});

// Update UI
function updateUI() {
    // Update product count
    productCount.textContent = products.length;
    
    // Show/hide clear all button
    clearAllBtn.style.display = products.length > 0 ? 'flex' : 'none';
    
    // Show/hide overlay text
    overlayText.style.display = products.length === 0 ? 'block' : 'none';
    
    // Update product list
    if (products.length === 0) {
        productList.innerHTML = '<p class="empty-state">No products added yet</p>';
    } else {
        productList.innerHTML = products.map(product => `
            <div class="product-item">
                <img src="${product.imageUrl}" alt="${product.type}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2748%27 height=%2748%27%3E%3Crect fill=%27%23e5e7eb%27 width=%2748%27 height=%2748%27/%3E%3Ctext x=%2750%25%27 y=%2750%25%27 dominant-baseline=%27middle%27 text-anchor=%27middle%27 fill=%27%239ca3af%27 font-size=%2712%27%3E?%3C/text%3E%3C/svg%3E'">
                <div class="product-info">
                    <p class="product-type">${product.type}</p>
                    <p class="product-url">${product.imageUrl}</p>
                </div>
            </div>
        `).join('');
    }
}

// Render Products on Model
function renderProducts() {
    productsContainer.innerHTML = products.map(product => `
        <div 
            class="draggable-product" 
            data-id="${product.id}"
            style="left: ${product.position.x}px; top: ${product.position.y}px; transform: translate(-50%, -50%) scale(${product.scale});"
        >
            <img src="${product.imageUrl}" alt="${product.type}" draggable="false" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27100%27 height=%27100%27%3E%3Crect fill=%27%23e5e7eb%27 width=%27100%27 height=%27100%27/%3E%3Ctext x=%2750%25%27 y=%2750%25%27 dominant-baseline=%27middle%27 text-anchor=%27middle%27 fill=%27%239ca3af%27%3EError%3C/text%3E%3C/svg%3E'">
            <button class="remove-btn" onclick="removeProduct('${product.id}')">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
            </button>
        </div>
    `).join('');
    
    // Reattach drag event listeners
    attachDragListeners();
}

// Remove Product
function removeProduct(id) {
    products = products.filter(p => p.id !== id);
    updateUI();
    renderProducts();
}

// Drag and Drop Functionality
function attachDragListeners() {
    const draggableProducts = document.querySelectorAll('.draggable-product');
    
    draggableProducts.forEach(element => {
        element.addEventListener('mousedown', handleMouseDown);
        element.addEventListener('wheel', handleWheel);
    });
}

function handleMouseDown(e) {
    if (e.target.classList.contains('remove-btn') || e.target.closest('.remove-btn')) {
        return;
    }
    
    e.preventDefault();
    const productElement = e.currentTarget;
    const productId = productElement.dataset.id;
    const product = products.find(p => p.id === productId);
    
    if (!product) return;
    
    draggingProduct = productId;
    
    const rect = modelViewer.getBoundingClientRect();
    offset = {
        x: e.clientX - rect.left - product.position.x,
        y: e.clientY - rect.top - product.position.y
    };
    
    productElement.style.zIndex = '1000';
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
}

function handleMouseMove(e) {
    if (!draggingProduct) return;
    
    const product = products.find(p => p.id === draggingProduct);
    if (!product) return;
    
    const rect = modelViewer.getBoundingClientRect();
    const newX = e.clientX - rect.left - offset.x;
    const newY = e.clientY - rect.top - offset.y;
    
    product.position.x = newX;
    product.position.y = newY;
    
    const element = document.querySelector(`[data-id="${draggingProduct}"]`);
    if (element) {
        element.style.left = `${newX}px`;
        element.style.top = `${newY}px`;
    }
}

function handleMouseUp() {
    if (draggingProduct) {
        const element = document.querySelector(`[data-id="${draggingProduct}"]`);
        if (element) {
            element.style.zIndex = '1';
        }
    }
    
    draggingProduct = null;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
}

function handleWheel(e) {
    e.preventDefault();
    const productElement = e.currentTarget;
    const productId = productElement.dataset.id;
    const product = products.find(p => p.id === productId);
    
    if (!product) return;
    
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    product.scale = Math.max(0.3, Math.min(3, product.scale + delta));
    
    productElement.style.transform = `translate(-50%, -50%) scale(${product.scale})`;
}

// Initialize
updateUI();
