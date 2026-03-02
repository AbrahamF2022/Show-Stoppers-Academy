// Show Stoppers Academy — Shop Admin JS
// Handles: auth, product CRUD, variant management, discount codes, order management

const TOKEN_KEY = 'ssaAuthToken';

function getApiBase() {
  if (window.__SSA_API_BASE__) return window.__SSA_API_BASE__;
  const saved = localStorage.getItem('ssaApiBase');
  if (saved) return saved;
  return window.location.protocol === 'https:'
    ? 'https://show-stoppers-academy-production.up.railway.app/api'
    : 'http://localhost:4000/api';
}

const API_BASE = getApiBase();

function getToken() { return localStorage.getItem(TOKEN_KEY); }
function setToken(t) { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); }

async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    let msg = 'Request failed';
    try { const d = await res.json(); msg = d.error || d.message || msg; } catch (_) {}
    throw new Error(msg);
  }
  if (res.status === 204) return null;
  return res.json();
}

window.adminApp = function () {
  return {
    // Auth
    authed: false,
    loginEmail: '',
    loginPassword: '',
    loginError: '',
    loginLoading: false,

    // Tabs
    activeTab: 'products',

    // Products
    products: [],
    productsLoading: false,
    showProductForm: false,
    editingProduct: null,
    productFormLoading: false,
    productFormError: '',
    productForm: { name: '', description: '', price: '', stock_count: 0, image_urls_text: '', is_active: true },

    // Variants
    variantManagerProductId: null,
    showVariantForm: false,
    variantForm: { size: '', color: '', stock_count: 0 },

    // Confirm delete
    confirmDelete: null,

    // Discounts
    discounts: [],
    discountsLoading: false,
    showDiscountForm: false,
    discountFormLoading: false,
    discountFormError: '',
    discountForm: { code: '', discount_type: 'percent', value: '', max_uses: '', expires_at: '' },

    // Orders
    orders: [],
    ordersLoading: false,
    ordersTotal: 0,
    orderPage: 0,
    orderFilter: '',
    orderSearch: '',
    orderUpdateId: null,
    orderUpdateLoading: false,
    orderUpdateForm: { status: 'paid', tracking_number: '', admin_notes: '' },

    // ── Lifecycle ───────────────────────────────────────────────────────────

    async init() {
      const token = getToken();
      if (token) {
        try {
          const data = await apiFetch('/auth/me');
          if (data.user.role === 'admin') {
            this.authed = true;
            await this.loadProducts();
          } else {
            setToken(null);
          }
        } catch {
          setToken(null);
        }
      }
    },

    // ── Auth ────────────────────────────────────────────────────────────────

    async login() {
      this.loginLoading = true;
      this.loginError = '';
      try {
        const data = await apiFetch('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: this.loginEmail, password: this.loginPassword }),
        });
        if (data.user.role !== 'admin') {
          this.loginError = 'Admin access only.';
          return;
        }
        setToken(data.token);
        this.authed = true;
        await this.loadProducts();
      } catch (err) {
        this.loginError = err.message || 'Login failed';
      } finally {
        this.loginLoading = false;
      }
    },

    logout() {
      setToken(null);
      this.authed = false;
    },

    // ── Products ────────────────────────────────────────────────────────────

    async loadProducts() {
      this.productsLoading = true;
      try {
        const data = await apiFetch('/shop/products');
        this.products = data.products || [];
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        this.productsLoading = false;
      }
    },

    resetProductForm() {
      this.productForm = { name: '', description: '', price: '', stock_count: 0, image_urls_text: '', is_active: true };
      this.productFormError = '';
    },

    startEditProduct(product) {
      this.editingProduct = product;
      this.productForm = {
        name: product.name,
        description: product.description || '',
        price: (product.price_cents / 100).toFixed(2),
        stock_count: product.stock_count,
        image_urls_text: (product.image_urls || []).join('\n'),
        is_active: product.is_active,
      };
      this.showProductForm = true;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    async saveProduct() {
      this.productFormLoading = true;
      this.productFormError = '';
      try {
        const image_urls = this.productForm.image_urls_text
          .split('\n')
          .map((u) => u.trim())
          .filter((u) => u.length > 0);

        const payload = {
          name: this.productForm.name,
          description: this.productForm.description || undefined,
          price_cents: Math.round(parseFloat(this.productForm.price) * 100),
          stock_count: parseInt(this.productForm.stock_count, 10),
          image_urls,
        };

        if (this.editingProduct) {
          await apiFetch(`/shop/products/${this.editingProduct.id}`, {
            method: 'PUT',
            body: JSON.stringify({ ...payload, is_active: this.productForm.is_active }),
          });
        } else {
          await apiFetch('/shop/products', { method: 'POST', body: JSON.stringify(payload) });
        }

        this.showProductForm = false;
        this.editingProduct = null;
        await this.loadProducts();
      } catch (err) {
        this.productFormError = err.message || 'Failed to save product';
      } finally {
        this.productFormLoading = false;
      }
    },

    confirmDeleteProduct(product) {
      this.confirmDelete = product.id;
    },

    async deleteProduct(productId) {
      try {
        await apiFetch(`/shop/products/${productId}`, { method: 'DELETE' });
        this.confirmDelete = null;
        await this.loadProducts();
      } catch (err) {
        alert('Failed to delete: ' + err.message);
      }
    },

    // ── Variants ────────────────────────────────────────────────────────────

    openVariantManager(product) {
      if (this.variantManagerProductId === product.id) {
        this.variantManagerProductId = null;
        this.showVariantForm = false;
      } else {
        this.variantManagerProductId = product.id;
        this.showVariantForm = false;
        this.variantForm = { size: '', color: '', stock_count: 0 };
      }
    },

    async addVariant(productId) {
      try {
        await apiFetch(`/shop/products/${productId}/variants`, {
          method: 'POST',
          body: JSON.stringify({
            size: this.variantForm.size || undefined,
            color: this.variantForm.color || undefined,
            stock_count: parseInt(this.variantForm.stock_count, 10) || 0,
          }),
        });
        this.variantForm = { size: '', color: '', stock_count: 0 };
        this.showVariantForm = false;
        await this.loadProducts();
      } catch (err) {
        alert('Failed to add variant: ' + err.message);
      }
    },

    async removeVariant(product, variantId) {
      try {
        await apiFetch(`/shop/products/${product.id}/variants/${variantId}`, { method: 'DELETE' });
        await this.loadProducts();
      } catch (err) {
        alert('Failed to remove variant: ' + err.message);
      }
    },

    // ── Discount Codes ───────────────────────────────────────────────────────

    async loadDiscounts() {
      this.discountsLoading = true;
      try {
        const data = await apiFetch('/shop/discount-codes');
        this.discounts = data.codes || [];
      } catch (err) {
        console.error('Failed to load discounts:', err);
      } finally {
        this.discountsLoading = false;
      }
    },

    resetDiscountForm() {
      this.discountForm = { code: '', discount_type: 'percent', value: '', max_uses: '', expires_at: '' };
      this.discountFormError = '';
    },

    async createDiscount() {
      this.discountFormLoading = true;
      this.discountFormError = '';
      try {
        const payload = {
          code: this.discountForm.code.toUpperCase(),
          discount_type: this.discountForm.discount_type,
          value: parseInt(this.discountForm.value, 10),
          max_uses: this.discountForm.max_uses ? parseInt(this.discountForm.max_uses, 10) : undefined,
          expires_at: this.discountForm.expires_at ? new Date(this.discountForm.expires_at).toISOString() : undefined,
        };
        await apiFetch('/shop/discount-codes', { method: 'POST', body: JSON.stringify(payload) });
        this.showDiscountForm = false;
        await this.loadDiscounts();
      } catch (err) {
        this.discountFormError = err.message || 'Failed to create discount code';
      } finally {
        this.discountFormLoading = false;
      }
    },

    async deactivateDiscount(id) {
      try {
        await apiFetch(`/shop/discount-codes/${id}`, { method: 'DELETE' });
        await this.loadDiscounts();
      } catch (err) {
        alert('Failed to deactivate: ' + err.message);
      }
    },

    // ── Orders ───────────────────────────────────────────────────────────────

    async loadOrders() {
      this.ordersLoading = true;
      try {
        const params = new URLSearchParams({ limit: '20', offset: String(this.orderPage * 20) });
        if (this.orderFilter) params.set('status', this.orderFilter);
        if (this.orderSearch) params.set('search', this.orderSearch);
        const data = await apiFetch(`/shop/orders?${params}`);
        this.orders = data.orders || [];
        this.ordersTotal = data.total || 0;
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        this.ordersLoading = false;
      }
    },

    startOrderUpdate(order) {
      this.orderUpdateId = order.id;
      this.orderUpdateForm = {
        status: order.status,
        tracking_number: order.tracking_number || '',
        admin_notes: order.admin_notes || '',
      };
    },

    async saveOrderStatus(orderId) {
      this.orderUpdateLoading = true;
      try {
        await apiFetch(`/shop/orders/${orderId}/status`, {
          method: 'PUT',
          body: JSON.stringify({
            status: this.orderUpdateForm.status,
            tracking_number: this.orderUpdateForm.tracking_number || undefined,
            admin_notes: this.orderUpdateForm.admin_notes || undefined,
          }),
        });
        this.orderUpdateId = null;
        await this.loadOrders();
      } catch (err) {
        alert('Failed to update status: ' + err.message);
      } finally {
        this.orderUpdateLoading = false;
      }
    },
  };
};
