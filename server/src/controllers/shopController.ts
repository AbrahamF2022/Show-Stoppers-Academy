import { Request, Response } from 'express';
import Stripe from 'stripe';
import { z } from 'zod';
import { config } from '../config.js';
import { ApiError } from '../middleware/errorHandler.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import {
  listActiveProducts,
  getProductById,
  createProduct,
  updateProduct,
  softDeleteProduct,
  addVariant,
  removeVariant,
  decrementProductStock,
  decrementVariantStock,
  findDiscountCode,
  listDiscountCodes,
  createDiscountCode,
  deactivateDiscountCode,
  incrementDiscountCodeUses,
  createOrder,
  createOrderItems,
  getOrderByPaymentIntentId,
  getOrderById,
  updateOrderStatus,
  markOrderPaid,
  listOrders,
  type ShippingAddress,
} from '../utils/shopHelpers.js';
import {
  sendOrderConfirmation,
  sendAdminOrderAlert,
} from '../utils/emailService.js';

// ─── Stripe instance (lazy) ───────────────────────────────────────────────────

let stripeClient: Stripe | null = null;
function getStripe(): Stripe {
  if (!stripeClient) {
    if (!config.stripeSecretKey) throw new ApiError(500, 'Stripe is not configured');
    stripeClient = new Stripe(config.stripeSecretKey, { apiVersion: '2026-02-25.clover' });
  }
  return stripeClient;
}

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

const createProductSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  price_cents: z.number().int().min(1),
  image_urls: z.array(z.string().url()).optional().default([]),
  stock_count: z.number().int().min(0).default(0),
});

const updateProductSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  price_cents: z.number().int().min(1).optional(),
  image_urls: z.array(z.string().url()).optional(),
  stock_count: z.number().int().min(0).optional(),
  is_active: z.boolean().optional(),
});

const addVariantSchema = z.object({
  size: z.string().max(20).optional(),
  color: z.string().max(50).optional(),
  stock_count: z.number().int().min(0).default(0),
});

const createDiscountCodeSchema = z.object({
  code: z.string().min(2).max(30).toUpperCase(),
  discount_type: z.enum(['percent', 'fixed']),
  value: z.number().int().min(1),
  max_uses: z.number().int().min(1).optional(),
  expires_at: z.string().datetime().optional(),
});

const checkoutSchema = z.object({
  customer_name: z.string().min(1).max(200),
  customer_email: z.string().email(),
  shipping_address: z.object({
    line1: z.string().min(1),
    line2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    postal_code: z.string().min(1),
    country: z.string().min(2).max(2).default('US'),
  }),
  items: z.array(
    z.object({
      product_id: z.string().uuid(),
      variant_id: z.string().uuid().optional(),
      quantity: z.number().int().min(1).max(100),
    })
  ).min(1),
  discount_code: z.string().optional(),
});

const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'paid', 'shipped', 'delivered', 'cancelled']),
  tracking_number: z.string().optional(),
  admin_notes: z.string().optional(),
});

// ─── Products ─────────────────────────────────────────────────────────────────

export async function getProducts(_req: Request, res: Response) {
  const products = await listActiveProducts();
  res.json({ products });
}

export async function postProduct(req: AuthenticatedRequest, res: Response) {
  const body = createProductSchema.parse(req.body);
  const product = await createProduct({ ...body, created_by: req.user!.sub });
  res.status(201).json({ product });
}

export async function putProduct(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const body = updateProductSchema.parse(req.body);

  const existing = await getProductById(id);
  if (!existing) throw new ApiError(404, 'Product not found');

  const product = await updateProduct(id, body);
  res.json({ product });
}

export async function deleteProduct(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const existing = await getProductById(id);
  if (!existing) throw new ApiError(404, 'Product not found');

  await softDeleteProduct(id);
  res.status(204).send();
}

// ─── Variants ─────────────────────────────────────────────────────────────────

export async function postVariant(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const existing = await getProductById(id);
  if (!existing) throw new ApiError(404, 'Product not found');

  const body = addVariantSchema.parse(req.body);
  const variant = await addVariant({ product_id: id, ...body });
  res.status(201).json({ variant });
}

export async function deleteVariant(req: AuthenticatedRequest, res: Response) {
  const { variantId } = req.params;
  await removeVariant(variantId);
  res.status(204).send();
}

// ─── Discount Codes ───────────────────────────────────────────────────────────

export async function getDiscountCodes(_req: Request, res: Response) {
  const codes = await listDiscountCodes();
  res.json({ codes });
}

export async function postDiscountCode(req: AuthenticatedRequest, res: Response) {
  const body = createDiscountCodeSchema.parse(req.body);
  const code = await createDiscountCode(body);
  res.status(201).json({ code });
}

export async function deactivateCode(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  await deactivateDiscountCode(id);
  res.status(204).send();
}

export async function validateDiscountCode(req: Request, res: Response) {
  const { code, subtotal_cents } = req.body as { code: string; subtotal_cents: number };
  if (!code) throw new ApiError(400, 'code is required');
  if (!subtotal_cents || subtotal_cents <= 0) throw new ApiError(400, 'subtotal_cents is required');

  const record = await findDiscountCode(code);
  if (!record || !record.is_active) throw new ApiError(404, 'Invalid discount code');
  if (record.expires_at && new Date(record.expires_at) < new Date()) {
    throw new ApiError(400, 'Discount code has expired');
  }
  if (record.max_uses != null && record.uses_count >= record.max_uses) {
    throw new ApiError(400, 'Discount code has reached its maximum uses');
  }

  let discount_cents = 0;
  if (record.discount_type === 'percent') {
    discount_cents = Math.round((subtotal_cents * record.value) / 100);
  } else {
    discount_cents = Math.min(record.value, subtotal_cents);
  }

  res.json({
    valid: true,
    discount_cents,
    discount_type: record.discount_type,
    value: record.value,
    code_id: record.id,
  });
}

// ─── Checkout ─────────────────────────────────────────────────────────────────

export async function postCheckout(req: Request, res: Response) {
  const body = checkoutSchema.parse(req.body);

  // Resolve products and calculate totals
  let subtotal_cents = 0;
  const resolvedItems: Array<{
    product_id: string;
    variant_id: string | null;
    quantity: number;
    unit_price_cents: number;
    product_snapshot: object;
  }> = [];

  for (const item of body.items) {
    const product = await getProductById(item.product_id);
    if (!product || !product.is_active) {
      throw new ApiError(400, `Product not available: ${item.product_id}`);
    }

    let unit_price_cents = product.price_cents;
    let variantId: string | null = item.variant_id ?? null;
    let size: string | undefined;
    let color: string | undefined;

    if (item.variant_id) {
      const variant = product.variants?.find((v) => v.id === item.variant_id);
      if (!variant || !variant.is_active) {
        throw new ApiError(400, `Variant not available: ${item.variant_id}`);
      }
      size = variant.size ?? undefined;
      color = variant.color ?? undefined;
    }

    const lineTotal = unit_price_cents * item.quantity;
    subtotal_cents += lineTotal;

    resolvedItems.push({
      product_id: product.id,
      variant_id: variantId,
      quantity: item.quantity,
      unit_price_cents,
      product_snapshot: {
        name: product.name,
        description: product.description,
        price_cents: product.price_cents,
        image_url: product.image_urls[0] ?? null,
        size,
        color,
      },
    });
  }

  // Apply discount code
  let discount_cents = 0;
  let discount_code_id: string | undefined;

  if (body.discount_code) {
    const code = await findDiscountCode(body.discount_code);
    if (code && code.is_active) {
      const notExpired = !code.expires_at || new Date(code.expires_at) > new Date();
      const usesOk = code.max_uses == null || code.uses_count < code.max_uses;
      if (notExpired && usesOk) {
        discount_cents =
          code.discount_type === 'percent'
            ? Math.round((subtotal_cents * code.value) / 100)
            : Math.min(code.value, subtotal_cents);
        discount_code_id = code.id;
      }
    }
  }

  const total_cents = Math.max(0, subtotal_cents - discount_cents);

  // Create Stripe PaymentIntent
  const stripe = getStripe();
  const paymentIntent = await stripe.paymentIntents.create({
    amount: total_cents,
    currency: 'usd',
    metadata: {
      customer_email: body.customer_email,
      customer_name: body.customer_name,
    },
  });

  // Persist pending order
  const order = await createOrder({
    stripe_payment_intent_id: paymentIntent.id,
    customer_email: body.customer_email,
    customer_name: body.customer_name,
    shipping_address: body.shipping_address as ShippingAddress,
    subtotal_cents,
    discount_cents,
    total_cents,
    discount_code_id,
  });

  // Persist order items
  await createOrderItems(
    resolvedItems.map((item) => ({ ...item, order_id: order.id }))
  );

  res.status(201).json({
    client_secret: paymentIntent.client_secret,
    order_id: order.id,
    total_cents,
    discount_cents,
    subtotal_cents,
  });
}

// ─── Stripe Webhook ───────────────────────────────────────────────────────────

export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers['stripe-signature'] as string;
  if (!sig) throw new ApiError(400, 'Missing stripe-signature header');
  if (!config.stripeWebhookSecret) throw new ApiError(500, 'Webhook secret not configured');

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      (req as any).rawBody as Buffer,
      sig,
      config.stripeWebhookSecret
    );
  } catch (err: any) {
    throw new ApiError(400, `Webhook signature verification failed: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object as Stripe.PaymentIntent;
    const order = await markOrderPaid(intent.id);

    if (order) {
      // Decrement stock for each item
      const fullOrder = await getOrderByPaymentIntentId(intent.id);
      if (fullOrder?.order_items) {
        for (const item of fullOrder.order_items) {
          if (item.variant_id) {
            await decrementVariantStock(item.variant_id, item.quantity).catch(console.error);
          } else if (item.product_id) {
            await decrementProductStock(item.product_id, item.quantity).catch(console.error);
          }
        }

        // Increment discount code uses if applicable
        if (fullOrder.discount_code_id) {
          await incrementDiscountCodeUses(fullOrder.discount_code_id).catch(console.error);
        }

        // Send emails (non-blocking)
        sendOrderConfirmation(fullOrder).catch(console.error);
        sendAdminOrderAlert(fullOrder).catch(console.error);
      }
    }
  }

  res.json({ received: true });
}

// ─── Orders (Admin) ───────────────────────────────────────────────────────────

export async function getOrders(req: Request, res: Response) {
  const { status, search, limit, offset } = req.query as Record<string, string>;
  const result = await listOrders({
    status,
    search,
    limit: limit ? parseInt(limit, 10) : 20,
    offset: offset ? parseInt(offset, 10) : 0,
  });
  res.json(result);
}

export async function getOrder(req: Request, res: Response) {
  const { id } = req.params;
  const order = await getOrderById(id);
  if (!order) throw new ApiError(404, 'Order not found');
  res.json({ order });
}

export async function putOrderStatus(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const body = updateOrderStatusSchema.parse(req.body);

  const existing = await getOrderById(id);
  if (!existing) throw new ApiError(404, 'Order not found');

  const order = await updateOrderStatus(id, body.status, {
    tracking_number: body.tracking_number,
    admin_notes: body.admin_notes,
  });
  res.json({ order });
}
