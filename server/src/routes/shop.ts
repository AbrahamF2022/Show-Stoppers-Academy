import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import {
  getProducts,
  postProduct,
  putProduct,
  deleteProduct,
  postVariant,
  deleteVariant,
  getDiscountCodes,
  postDiscountCode,
  deactivateCode,
  validateDiscountCode,
  postCheckout,
  handleStripeWebhook,
  getOrders,
  getOrder,
  putOrderStatus,
} from '../controllers/shopController.js';

const router = Router();

// ─── Public ───────────────────────────────────────────────────────────────────

router.get('/products', asyncHandler(getProducts));
router.post('/discount-codes/validate', asyncHandler(validateDiscountCode));
router.post('/checkout', asyncHandler(postCheckout));
router.post('/webhook', asyncHandler(handleStripeWebhook));
router.get('/orders/:id', asyncHandler(getOrder));

// ─── Admin only ───────────────────────────────────────────────────────────────

router.post('/products', requireAuth, requireRole('admin'), asyncHandler(postProduct));
router.put('/products/:id', requireAuth, requireRole('admin'), asyncHandler(putProduct));
router.delete('/products/:id', requireAuth, requireRole('admin'), asyncHandler(deleteProduct));

router.post('/products/:id/variants', requireAuth, requireRole('admin'), asyncHandler(postVariant));
router.delete('/products/:id/variants/:variantId', requireAuth, requireRole('admin'), asyncHandler(deleteVariant));

router.get('/discount-codes', requireAuth, requireRole('admin'), asyncHandler(getDiscountCodes));
router.post('/discount-codes', requireAuth, requireRole('admin'), asyncHandler(postDiscountCode));
router.delete('/discount-codes/:id', requireAuth, requireRole('admin'), asyncHandler(deactivateCode));

router.get('/orders', requireAuth, requireRole('admin'), asyncHandler(getOrders));
router.put('/orders/:id/status', requireAuth, requireRole('admin'), asyncHandler(putOrderStatus));

export default router;
