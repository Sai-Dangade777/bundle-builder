console.log('====================================');
console.log("Connected");
console.log('====================================');

class BundleBuilder {
    constructor() {
        this.selectedProducts = new Map();
        this.products = this.initProducts();
        this.discountThreshold = 3;
        this.discountRate = 0.3;
        this.initEvents();
        this.updateUI();
    }
    initProducts() {
        const cards = document.querySelectorAll('.product-card');
        const products = new Map();
        cards.forEach(card => {
            const id = card.dataset.productId;
            const title = card.querySelector('.product-title').textContent;
            const price = parseFloat(card.querySelector('.product-price').textContent.replace('$', ''));
            const image = card.querySelector('.product-image img').src;
            products.set(id, { id, title, price, image, element: card, quantity: 0 });
        });
        this.selectedProducts.set('2', { ...products.get('2'), quantity: 1 });
        this.selectedProducts.set('4', { ...products.get('4'), quantity: 1 });
        this.selectedProducts.set('5', { ...products.get('5'), quantity: 1 });
        return products;
    }
    initEvents() {
        document.querySelectorAll('.add-to-bundle-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                const card = e.target.closest('.product-card');
                const id = card.dataset.productId;
                this.toggleProduct(id);
            });
        });
        document.addEventListener('click', e => {
            const item = e.target.closest('.selected-item');
            if (!item) return;
            const name = item.querySelector('.selected-item-name').textContent;
            const id = this.getIdByName(name);
            if (e.target.classList.contains('qty-btn')) {
                if (e.target.classList.contains('plus')) this.increaseQty(id);
                else if (e.target.classList.contains('minus')) this.decreaseQty(id);
            }
            if (e.target.classList.contains('remove-item')) this.removeProduct(id);
        });
        const mainBtn = document.querySelector('.add-bundle-btn-main');
        if (mainBtn) mainBtn.addEventListener('click', () => this.addBundleToCart());
    }
    getIdByName(name) {
        for (let [id, p] of this.products) if (p.title === name) return id;
        return null;
    }
    toggleProduct(id) {
        if (this.selectedProducts.has(id)) this.removeProduct(id);
        else this.addProduct(id);
        this.updateUI();
    }
    addProduct(id) {
        const p = this.products.get(id);
        if (p) {
            this.selectedProducts.set(id, { ...p, quantity: 1 });
            const btn = p.element.querySelector('.add-to-bundle-btn');
            btn.classList.add('added');
            btn.querySelector('.btn-text').textContent = 'Added to Bundle';
            btn.querySelector('.btn-icon').textContent = '✓';
        }
    }
    removeProduct(id) {
        const p = this.products.get(id);
        if (p) {
            this.selectedProducts.delete(id);
            const btn = p.element.querySelector('.add-to-bundle-btn');
            btn.classList.remove('added');
            btn.querySelector('.btn-text').textContent = 'Add to Bundle';
            btn.querySelector('.btn-icon').textContent = '+';
        }
    }
    increaseQty(id) {
        if (this.selectedProducts.has(id)) {
            this.selectedProducts.get(id).quantity++;
            this.updateUI();
        }
    }
    decreaseQty(id) {
        if (this.selectedProducts.has(id)) {
            const p = this.selectedProducts.get(id);
            if (p.quantity > 1) p.quantity--;
            else this.removeProduct(id);
            this.updateUI();
        }
    }
    updateUI() {
        this.updateProgress();
        this.updateSelectedList();
        this.updatePricing();
        this.updateMainBtn();
    }
    updateProgress() {
        const count = this.selectedProducts.size;
        const fill = document.querySelector('.progress-fill');
        fill.style.width = count >= this.discountThreshold ? '100%' : (count / this.discountThreshold * 100) + '%';
    }
    updateSelectedList() {
        const c = document.querySelector('.selected-products');
        c.innerHTML = '';
        this.selectedProducts.forEach(p => c.appendChild(this.createSelectedItem(p)));
    }
    createSelectedItem(p) {
        const d = document.createElement('div');
        d.className = 'selected-item';
        d.innerHTML = `<img src="${p.image}" alt="${p.title}">
            <div class="selected-item-info">
                <div class="selected-item-name">${p.title}</div>
                <div class="selected-item-price">$${p.price.toFixed(2)}</div>
            </div>
            <div class="quantity-controls">
                <button class="qty-btn minus">−</button>
                <span class="qty-number">${p.quantity}</span>
                <button class="qty-btn plus">+</button>
            </div>
            <button class="remove-item">🗑</button>`;
        return d;
    }
    updatePricing() {
        const subtotal = this.calcSubtotal();
        const hasDiscount = this.selectedProducts.size >= this.discountThreshold;
        const discount = hasDiscount ? subtotal * this.discountRate : 0;
        const total = subtotal - discount;
        const dr = document.querySelector('.discount-row span:last-child');
        if (dr) dr.textContent = `- $${discount.toFixed(2)} (30%)`;
        const sr = document.querySelector('.subtotal-row strong:last-child');
        if (sr) sr.textContent = `$${total.toFixed(2)}`;
    }
    calcSubtotal() {
        let s = 0;
        this.selectedProducts.forEach(p => s += p.price * p.quantity);
        return s;
    }
    updateMainBtn() {
        const btn = document.querySelector('.add-bundle-btn-main');
        if (!btn) return;
        const min = this.selectedProducts.size >= this.discountThreshold;
        btn.querySelector('span:first-child').textContent = min ? 'Added to Cart' : `Add ${this.discountThreshold - this.selectedProducts.size} Items to Proceed`;
        btn.style.background = min ? '#111' : '#666';
    }
    addBundleToCart() {
        const data = {
            products: Array.from(this.selectedProducts.values()),
            subtotal: this.calcSubtotal(),
            discount: this.selectedProducts.size >= this.discountThreshold ? this.calcSubtotal() * this.discountRate : 0,
            total: this.selectedProducts.size >= this.discountThreshold ? this.calcSubtotal() * (1 - this.discountRate) : this.calcSubtotal(),
            timestamp: new Date().toISOString()
        };
        console.log('Bundle added to cart:', data);
        const btn = document.querySelector('.add-bundle-btn-main');
        if (btn) {
            const orig = btn.querySelector('span:first-child').textContent;
            btn.querySelector('span:first-child').textContent = '✓ Bundle Added!';
            setTimeout(() => {
                btn.querySelector('span:first-child').textContent = orig;
            }, 2000);
        }
    }
}
document.addEventListener('DOMContentLoaded', () => new BundleBuilder());
