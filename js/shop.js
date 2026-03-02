// Show Stoppers Academy — Merch Shop Frontend Logic
// Manages: product listing, cart state, Stripe Elements, checkout flow

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
    // State
    products: [],
    loading: true,
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

    // Checkout form fields
    checkout: {
      name: '',
      email: '',
      line1: '',
      line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'US',
      discountCode: '',
    },

    // Stripe
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
        if (!res.ok) throw new Error('Failed to load products');
        const data = await res.json();
        this.products = data.products || [];
      } catch (err) {
        console.error('Failed to fetch products:', err);
        this.products = [];
      } finally {
        this.loading = false;
      }
    },

    openProduct(product) {
      this.selectedProduct = product;
      this.selectedVariant = null;
      // Auto-select first available variant if all variants exist
      if (product.variants && product.variants.length > 0) {
        const first = product.variants.find((v) => v.is_active && v.stock_count > 0);
        if (first) this.selectedVariant = first;
      }
    },

    isOutOfStock(product, variant) {
      if (!product) return true;
      if (product.variants && product.variants.filter((v) => v.is_active).length > 0) {
        // Variants present: a variant must be selected and in stock
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
      if (!STRIPE_PUBLISHABLE_KEY || STRIPE_PUBLISHABLE_KEY.includes('YOUR_PUBLISHABLE_KEY')) {
        console.warn('Stripe publishable key not configured. Set window.__SSA_STRIPE_KEY__ before shop.js loads.');
        return;
      }
      this._stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
    },

    mountCardElement() {
      if (!this._stripe) return;
      const container = document.getElementById('stripe-card-element');
      if (!container) return;
      if (this._cardElement) {
        this._cardElement.unmount();
      }
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
      this._cardElement.on('change', (event) => {
        this.cardError = event.error ? event.error.message : '';
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
      this.checkoutLoading = true;
      this.checkoutError = '';

      if (!this._stripe || !this._cardElement) {
        this.checkoutError = 'Payment system not ready. Please refresh and try again.';
        this.checkoutLoading = false;
        return;
      }

      try {
        // 1. Create order + PaymentIntent on backend
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
        if (!orderRes.ok) {
          throw new Error(orderData.error || 'Checkout failed');
        }

        const { client_secret, order_id } = orderData;

        // 2. Confirm payment with Stripe
        const { error: stripeError } = await this._stripe.confirmCardPayment(client_secret, {
          payment_method: {
            card: this._cardElement,
            billing_details: {
              name: this.checkout.name,
              email: this.checkout.email,
            },
          },
        });

        if (stripeError) {
          throw new Error(stripeError.message);
        }

        // 3. Clear cart and redirect to success page
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
