// Show Stoppers Academy — Merch Shop Frontend Logic

// ─── Config ───────────────────────────────────────────────────────────────────

const STRIPE_PUBLISHABLE_KEY = window.__SSA_STRIPE_KEY__ || 'pk_test_YOUR_PUBLISHABLE_KEY_HERE';

function getApiBase() {
  if (window.__SSA_API_BASE__) return window.__SSA_API_BASE__;
  const saved = localStorage.getItem('ssaApiBase');
  if (saved) return saved;
  if (window.location.protocol === 'https:') {
    return 'https://show-stoppers-academy-production.up.railway.app/api';
  }
  return 'http://localhost:4000/api';
}

const API_BASE = getApiBase();
const CART_KEY = 'ssaMerchCart';

// ─── Dummy Products (shown when backend has no products yet) ──────────────────

const DUMMY_PRODUCTS = [
  {
    id: 'demo-1',
    name: 'SSA Classic Hoodie',
    description: 'Stay warm and rep the academy in our premium heavyweight hoodie. Embroidered Show Stoppers logo on chest. 80% cotton, 20% polyester fleece.',
    price_cents: 4500,
    image_urls: ['https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&q=80'],
    stock_count: 24,
    is_active: true,
    badge: 'Best Seller',
    category: 'Apparel',
    variants: [
      { id: 'v1a', product_id: 'demo-1', size: 'S', color: 'Black', stock_count: 5, is_active: true },
      { id: 'v1b', product_id: 'demo-1', size: 'M', color: 'Black', stock_count: 8, is_active: true },
      { id: 'v1c', product_id: 'demo-1', size: 'L', color: 'Black', stock_count: 7, is_active: true },
      { id: 'v1d', product_id: 'demo-1', size: 'XL', color: 'Black', stock_count: 4, is_active: true },
    ],
  },
  {
    id: 'demo-2',
    name: 'Show Stoppers Tee',
    description: 'The go-to everyday tee. Soft ring-spun cotton with screen-printed SSA logo. Available in red and white.',
    price_cents: 2500,
    image_urls: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80'],
    stock_count: 40,
    is_active: true,
    badge: 'New',
    category: 'Apparel',
    variants: [
      { id: 'v2a', product_id: 'demo-2', size: 'S', color: 'Red', stock_count: 10, is_active: true },
      { id: 'v2b', product_id: 'demo-2', size: 'M', color: 'Red', stock_count: 12, is_active: true },
      { id: 'v2c', product_id: 'demo-2', size: 'L', color: 'Red', stock_count: 10, is_active: true },
      { id: 'v2d', product_id: 'demo-2', size: 'XL', color: 'Red', stock_count: 8, is_active: true },
    ],
  },
  {
    id: 'demo-3',
    name: 'Academy Snapback',
    description: 'Structured 6-panel snapback with flat brim and embroidered SSA crest. One size fits most.',
    price_cents: 3000,
    image_urls: ['https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&q=80'],
    stock_count: 15,
    is_active: true,
    badge: null,
    category: 'Accessories',
    variants: [],
  },
  {
    id: 'demo-4',
    name: 'Performance Shorts',
    description: 'Lightweight athletic shorts built for the court. Moisture-wicking fabric, drawstring waist, side pockets.',
    price_cents: 3500,
    image_urls: ['https://images.unsplash.com/photo-1562183241-b937e95585b6?w=600&q=80'],
    stock_count: 20,
    is_active: true,
    badge: null,
    category: 'Apparel',
    variants: [
      { id: 'v4a', product_id: 'demo-4', size: 'S', color: 'Black', stock_count: 5, is_active: true },
      { id: 'v4b', product_id: 'demo-4', size: 'M', color: 'Black', stock_count: 7, is_active: true },
      { id: 'v4c', product_id: 'demo-4', size: 'L', color: 'Black', stock_count: 5, is_active: true },
      { id: 'v4d', product_id: 'demo-4', size: 'XL', color: 'Black', stock_count: 3, is_active: true },
    ],
  },
  {
    id: 'demo-5',
    name: 'SSA Tracksuit',
    description: 'Full matching tracksuit — zip-up jacket and jogger pants. Perfect for warmups and travel days. Embroidered logo.',
    price_cents: 7500,
    image_urls: ['https://images.unsplash.com/photo-1544966503-7cc5ac882d5e?w=600&q=80'],
    stock_count: 10,
    is_active: true,
    badge: 'Limited',
    category: 'Apparel',
    variants: [
      { id: 'v5a', product_id: 'demo-5', size: 'S', color: 'Red/Black', stock_count: 2, is_active: true },
      { id: 'v5b', product_id: 'demo-5', size: 'M', color: 'Red/Black', stock_count: 3, is_active: true },
      { id: 'v5c', product_id: 'demo-5', size: 'L', color: 'Red/Black', stock_count: 3, is_active: true },
      { id: 'v5d', product_id: 'demo-5', size: 'XL', color: 'Red/Black', stock_count: 2, is_active: true },
    ],
  },
  {
    id: 'demo-6',
    name: 'SSA Water Bottle',
    description: '32oz insulated stainless steel bottle. Keeps drinks cold 24 hrs, hot 12 hrs. Laser-engraved logo.',
    price_cents: 2000,
    image_urls: ['https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80'],
    stock_count: 50,
    is_active: true,
    badge: null,
    category: 'Accessories',
    variants: [],
  },
  {
    id: 'demo-7',
    name: 'Compression Socks',
    description: 'High-performance crew socks with arch support and moisture management. Show Stoppers stripe detail.',
    price_cents: 1200,
    image_urls: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80'],
    stock_count: 60,
    is_active: true,
    badge: null,
    category: 'Accessories',
    variants: [],
  },
  {
    id: 'demo-8',
    name: 'Drawstring Bag',
    description: 'Lightweight polyester drawstring bag with SSA logo print. Great for practice, the gym, or everyday carry.',
    price_cents: 1800,
    image_urls: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80'],
    stock_count: 35,
    is_active: true,
    badge: 'New',
    category: 'Accessories',
    variants: [],
  },
];

// ─── Cart Persistence ─────────────────────────────────────────────────────────

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// ─── Alpine.js App ────────────────────────────────────────────────────────────

window.shopApp = function () {
  return {
    products: [],
    allProducts: [],
    loading: true,
    isDemoMode: false,
    activeCategory: 'All',
    categories: ['All', 'Apparel', 'Accessories'],
    selectedProduct: null,
    selectedVariant: null,
    cart: loadCart(),
    cartOpen: false,
    checkoutOpen: false,
    checkoutLoading: false,
    checkoutError: '',
    applyingDiscount: false,
    discountResult: null,
    cardError: '',

    checkout: {
      name: '', email: '', line1: '', line2: '',
      city: '', state: '', postal_code: '', country: 'US', discountCode: '',
    },

    _stripe: null,
    _cardElement: null,

    // ── Computed ────────────────────────────────────────────────────────────

    get cartCount() {
      return this.cart.reduce((sum, item) => sum + item.qty, 0);
    },

    get cartSubtotal() {
      return this.cart.reduce((sum, item) => sum + item.price_cents * item.qty, 0);
    },

    get checkoutTotal() {
      const discount = this.discountResult?.valid ? this.discountResult.discount_cents : 0;
      return Math.max(0, this.cartSubtotal - discount);
    },

    get filteredProducts() {
      if (this.activeCategory === 'All') return this.allProducts;
      return this.allProducts.filter((p) => p.category === this.activeCategory);
    },

    // ── Lifecycle ───────────────────────────────────────────────────────────

    async init() {
      await this.fetchProducts();
      this.initStripe();
      this.$watch('checkoutOpen', (open) => {
        if (open) this.$nextTick(() => this.mountCardElement());
      });
      this.$watch('cart', (val) => saveCart(val));
    },

    // ── Products ────────────────────────────────────────────────────────────

    async fetchProducts() {
      this.loading = true;
      try {
        const res = await fetch(`${API_BASE}/shop/products`);
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        const live = data.products || [];
        if (live.length > 0) {
          this.allProducts = live;
          this.isDemoMode = false;
        } else {
          // No live products yet — show demo catalogue
          this.allProducts = DUMMY_PRODUCTS;
          this.isDemoMode = true;
        }
      } catch {
        this.allProducts = DUMMY_PRODUCTS;
        this.isDemoMode = true;
      } finally {
        this.loading = false;
      }
    },

    filterBy(cat) {
      this.activeCategory = cat;
    },

    openProduct(product) {
      this.selectedProduct = product;
      this.selectedVariant = null;
      if (product.variants && product.variants.length > 0) {
        const first = product.variants.find((v) => v.is_active && v.stock_count > 0);
        if (first) this.selectedVariant = first;
      }
    },

    isOutOfStock(product, variant) {
      if (!product) return true;
      if (product.variants && product.variants.filter((v) => v.is_active).length > 0) {
        if (!variant) return true;
        return variant.stock_count === 0;
      }
      return product.stock_count === 0;
    },

    // ── Cart ────────────────────────────────────────────────────────────────

    addToCart(product, variant) {
      if (this.isOutOfStock(product, variant)) return;

      const variantLabel = variant
        ? [variant.size, variant.color].filter(Boolean).join(' / ')
        : null;

      const key = product.id + (variant ? ':' + variant.id : '');
      const existing = this.cart.findIndex((i) => i.key === key);

      if (existing >= 0) {
        this.cart[existing].qty += 1;
        this.cart = [...this.cart];
      } else {
        this.cart = [
          ...this.cart,
          {
            key,
            product_id: product.id,
            variant_id: variant?.id || null,
            name: product.name,
            price_cents: product.price_cents,
            image_url: product.image_urls?.[0] || null,
            variant_label: variantLabel,
            qty: 1,
          },
        ];
      }

      this.selectedProduct = null;
      this.selectedVariant = null;
      this.cartOpen = true;
    },

    quickAdd(event, product) {
      event.stopPropagation();
      // If product has variants, open the modal instead
      if (product.variants && product.variants.filter((v) => v.is_active).length > 0) {
        this.openProduct(product);
        return;
      }
      this.addToCart(product, null);
    },

    updateQty(index, newQty) {
      if (newQty <= 0) {
        this.cart = this.cart.filter((_, i) => i !== index);
      } else {
        this.cart[index] = { ...this.cart[index], qty: newQty };
        this.cart = [...this.cart];
      }
    },

    // ── Stripe Elements ──────────────────────────────────────────────────────

    initStripe() {
      if (!STRIPE_PUBLISHABLE_KEY || STRIPE_PUBLISHABLE_KEY.includes('YOUR_PUBLISHABLE_KEY')) return;
      this._stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
    },

    mountCardElement() {
      if (!this._stripe) return;
      const container = document.getElementById('stripe-card-element');
      if (!container) return;
      if (this._cardElement) this._cardElement.unmount();
      const elements = this._stripe.elements();
      this._cardElement = elements.create('card', {
        style: {
          base: {
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '15px',
            color: '#111827',
            '::placeholder': { color: '#9ca3af' },
          },
          invalid: { color: '#ef4444' },
        },
      });
      this._cardElement.mount('#stripe-card-element');
      this._cardElement.on('change', (e) => {
        this.cardError = e.error ? e.error.message : '';
      });
    },

    // ── Discount Code ────────────────────────────────────────────────────────

    async applyDiscount() {
      const code = this.checkout.discountCode.trim();
      if (!code) return;
      this.applyingDiscount = true;
      this.discountResult = null;
      try {
        const res = await fetch(`${API_BASE}/shop/discount-codes/validate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, subtotal_cents: this.cartSubtotal }),
        });
        const data = await res.json();
        if (!res.ok) {
          this.discountResult = { valid: false, error: data.error || 'Invalid code' };
        } else {
          this.discountResult = data;
        }
      } catch {
        this.discountResult = { valid: false, error: 'Could not validate code' };
      } finally {
        this.applyingDiscount = false;
      }
    },

    // ── Checkout ─────────────────────────────────────────────────────────────

    async submitCheckout() {
      if (this.isDemoMode) {
        this.checkoutError = 'This is a preview. The store is not live yet — no charges will be made.';
        return;
      }
      this.checkoutLoading = true;
      this.checkoutError = '';

      if (!this._stripe || !this._cardElement) {
        this.checkoutError = 'Payment system not ready. Please refresh and try again.';
        this.checkoutLoading = false;
        return;
      }

      try {
        const payload = {
          customer_name: this.checkout.name,
          customer_email: this.checkout.email,
          shipping_address: {
            line1: this.checkout.line1,
            line2: this.checkout.line2 || undefined,
            city: this.checkout.city,
            state: this.checkout.state.toUpperCase(),
            postal_code: this.checkout.postal_code,
            country: this.checkout.country.toUpperCase(),
          },
          items: this.cart.map((item) => ({
            product_id: item.product_id,
            variant_id: item.variant_id || undefined,
            quantity: item.qty,
          })),
          discount_code: this.checkout.discountCode.trim() || undefined,
        };

        const orderRes = await fetch(`${API_BASE}/shop/checkout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const orderData = await orderRes.json();
        if (!orderRes.ok) throw new Error(orderData.error || 'Checkout failed');

        const { client_secret, order_id } = orderData;

        const { error: stripeError } = await this._stripe.confirmCardPayment(client_secret, {
          payment_method: {
            card: this._cardElement,
            billing_details: { name: this.checkout.name, email: this.checkout.email },
          },
        });

        if (stripeError) throw new Error(stripeError.message);

        this.cart = [];
        localStorage.removeItem(CART_KEY);
        window.location.href = `/shop-success.html?order=${order_id}`;

      } catch (err) {
        this.checkoutError = err.message || 'Something went wrong. Please try again.';
      } finally {
        this.checkoutLoading = false;
      }
    },
  };
};
