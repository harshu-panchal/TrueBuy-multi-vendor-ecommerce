import { Router } from 'express';
import { requireVendor } from '../../../middlewares/roleAccess.js';
import { validate } from '../../../middlewares/validate.js';
import * as productsController from '../controllers/products.controller.js';
import * as cartController from '../controllers/cart.controller.js';
import * as ordersController from '../controllers/orders.controller.js';
import {
    b2bProductsQuerySchema,
    sellerQuerySchema,
    addToCartSchema,
    updateCartItemSchema,
    removeCartItemSchema,
    placeOrderSchema,
    orderListQuerySchema,
    orderRespondSchema,
} from '../validators/b2b.validator.js';

const router = Router();

// Products (vendors only)
router.get('/products', ...requireVendor, validate(b2bProductsQuerySchema, 'query'), productsController.listWholesaleProducts);

// Cart
router.get('/cart', ...requireVendor, validate(sellerQuerySchema, 'query'), cartController.getCart);
router.post('/cart/items', ...requireVendor, validate(addToCartSchema), cartController.addToCart);
router.patch('/cart/items', ...requireVendor, validate(updateCartItemSchema), cartController.updateCartItem);
router.delete('/cart/items', ...requireVendor, validate(removeCartItemSchema), cartController.removeCartItem);
router.delete('/cart', ...requireVendor, validate(sellerQuerySchema, 'query'), cartController.clearCart);

// Orders
router.post('/orders', ...requireVendor, validate(placeOrderSchema), ordersController.placeOrder);
router.get('/orders', ...requireVendor, validate(orderListQuerySchema, 'query'), ordersController.listOrders);
router.get('/orders/:id', ...requireVendor, ordersController.getOrderById);
router.patch('/orders/:id/respond', ...requireVendor, validate(orderRespondSchema), ordersController.respondToOrder);

export default router;

