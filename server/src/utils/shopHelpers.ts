import { supabase } from './supabaseClient.js';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  image_urls: string[];
  stock_count: number;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  variants?: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size: string | null;
  color: string | null;
  stock_count: number;
  is_active: boolean;
  created_at: string;
}

export interface DiscountCode {
  id: string;
  code: string;
  discount_type: 'percent' | 'fixed';
  value: number;
  max_uses: number | null;
  uses_count: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface ShippingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  variant_id: string | null;
  quantity: number;
  unit_price_cents: number;
  product_snapshot: {
    name: string;
    description?: string;
    price_cents: number;
    image_url?: string;
    size?: string;
    color?: string;
  };
  created_at: string;
}

export interface Order {
  id: string;
  stripe_payment_intent_id: string | null;
  customer_email: string;
  customer_name: string;
  shipping_address: ShippingAddress;
  subtotal_cents: number;
  discount_cents: number;
  total_cents: number;
  discount_code_id: string | null;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  tracking_number: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

// ─── Products ─────────────────────────────────────────────────────────────────

export async function listActiveProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*, variants:product_variants(*)')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Product[];
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*, variants:product_variants(*)')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data as Product | null;
}

export async function createProduct(input: {
  name: string;
  description?: string;
  price_cents: number;
  image_urls?: string[];
  stock_count: number;
  created_by: string;
}): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data as Product;
}

export async function updateProduct(
  id: string,
  updates: Partial<{
    name: string;
    description: string;
    price_cents: number;
    image_urls: string[];
    stock_count: number;
    is_active: boolean;
  }>
): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Product;
}

export async function softDeleteProduct(id: string): Promise<void> {
  const { error } = await supabase
    .from('products')
    .update({ is_active: false })
    .eq('id', id);

  if (error) throw error;
}

// ─── Variants ─────────────────────────────────────────────────────────────────

export async function addVariant(input: {
  product_id: string;
  size?: string;
  color?: string;
  stock_count: number;
}): Promise<ProductVariant> {
  const { data, error } = await supabase
    .from('product_variants')
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data as ProductVariant;
}

export async function removeVariant(variantId: string): Promise<void> {
  const { error } = await supabase
    .from('product_variants')
    .update({ is_active: false })
    .eq('id', variantId);

  if (error) throw error;
}

export async function decrementVariantStock(variantId: string, qty: number): Promise<void> {
  const { error } = await supabase.rpc('decrement_variant_stock', {
    variant_id: variantId,
    qty,
  });
  if (error) {
    // Fallback if RPC not available: read-then-write (acceptable at low scale)
    const { data } = await supabase
      .from('product_variants')
      .select('stock_count')
      .eq('id', variantId)
      .single();
    if (data) {
      await supabase
        .from('product_variants')
        .update({ stock_count: Math.max(0, data.stock_count - qty) })
        .eq('id', variantId);
    }
  }
}

export async function decrementProductStock(productId: string, qty: number): Promise<void> {
  const { data } = await supabase
    .from('products')
    .select('stock_count')
    .eq('id', productId)
    .single();
  if (data) {
    await supabase
      .from('products')
      .update({ stock_count: Math.max(0, data.stock_count - qty) })
      .eq('id', productId);
  }
}

// ─── Discount Codes ───────────────────────────────────────────────────────────

export async function findDiscountCode(code: string): Promise<DiscountCode | null> {
  const { data, error } = await supabase
    .from('discount_codes')
    .select('*')
    .eq('code', code.toUpperCase())
    .maybeSingle();

  if (error) throw error;
  return data as DiscountCode | null;
}

export async function listDiscountCodes(): Promise<DiscountCode[]> {
  const { data, error } = await supabase
    .from('discount_codes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as DiscountCode[];
}

export async function createDiscountCode(input: {
  code: string;
  discount_type: 'percent' | 'fixed';
  value: number;
  max_uses?: number;
  expires_at?: string;
}): Promise<DiscountCode> {
  const { data, error } = await supabase
    .from('discount_codes')
    .insert({ ...input, code: input.code.toUpperCase() })
    .select()
    .single();

  if (error) throw error;
  return data as DiscountCode;
}

export async function deactivateDiscountCode(id: string): Promise<void> {
  const { error } = await supabase
    .from('discount_codes')
    .update({ is_active: false })
    .eq('id', id);

  if (error) throw error;
}

export async function incrementDiscountCodeUses(id: string): Promise<void> {
  const { data } = await supabase
    .from('discount_codes')
    .select('uses_count')
    .eq('id', id)
    .single();
  if (data) {
    await supabase
      .from('discount_codes')
      .update({ uses_count: data.uses_count + 1 })
      .eq('id', id);
  }
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export async function createOrder(input: {
  stripe_payment_intent_id: string;
  customer_email: string;
  customer_name: string;
  shipping_address: ShippingAddress;
  subtotal_cents: number;
  discount_cents: number;
  total_cents: number;
  discount_code_id?: string;
}): Promise<Order> {
  const { data, error } = await supabase
    .from('orders')
    .insert({ ...input, status: 'pending' })
    .select()
    .single();

  if (error) throw error;
  return data as Order;
}

export async function createOrderItems(
  items: Array<{
    order_id: string;
    product_id: string | null;
    variant_id: string | null;
    quantity: number;
    unit_price_cents: number;
    product_snapshot: object;
  }>
): Promise<void> {
  const { error } = await supabase.from('order_items').insert(items);
  if (error) throw error;
}

export async function getOrderByPaymentIntentId(intentId: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('stripe_payment_intent_id', intentId)
    .maybeSingle();

  if (error) throw error;
  return data as Order | null;
}

export async function getOrderById(id: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data as Order | null;
}

export async function updateOrderStatus(
  id: string,
  status: Order['status'],
  extras?: { tracking_number?: string; admin_notes?: string }
): Promise<Order> {
  const { data, error } = await supabase
    .from('orders')
    .update({ status, ...extras })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Order;
}

export async function markOrderPaid(intentId: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .update({ status: 'paid' })
    .eq('stripe_payment_intent_id', intentId)
    .eq('status', 'pending') // idempotent: only update if still pending
    .select()
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows matched
  return data as Order | null;
}

export interface OrderFilters {
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export async function listOrders(filters: OrderFilters = {}): Promise<{ orders: Order[]; total: number }> {
  let query = supabase
    .from('orders')
    .select('*, order_items(*)', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  if (filters.search) {
    query = query.or(
      `customer_email.ilike.%${filters.search}%,customer_name.ilike.%${filters.search}%`
    );
  }
  if (filters.limit) {
    query = query.limit(filters.limit);
  }
  if (filters.offset) {
    query = query.range(filters.offset, (filters.offset + (filters.limit || 20)) - 1);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { orders: data as Order[], total: count ?? 0 };
}
