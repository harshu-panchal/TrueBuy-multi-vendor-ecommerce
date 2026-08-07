import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import * as vendorController from '../controllers/vendor.controller.js';
import * as orderController from '../controllers/order.controller.js';
import * as subOrderController from '../controllers/subOrder.controller.js';
import * as catalogController from '../controllers/catalog.controller.js';
import * as customerController from '../controllers/customer.controller.js';
import * as deliveryController from '../controllers/delivery.controller.js';
import * as returnController from '../controllers/return.controller.js';
import * as supportController from '../controllers/support.controller.js';
import * as reviewController from '../controllers/review.controller.js';
import * as analyticsController from '../controllers/analytics.controller.js';
import * as reportController from '../controllers/report.controller.js';
import * as marketingController from '../controllers/marketing.controller.js';
import * as notificationController from '../controllers/notification.controller.js';
import * as uploadController from '../controllers/upload.controller.js';
import * as systemController from '../controllers/system.controller.js';
import * as b2bController from '../controllers/b2b.controller.js';
import * as financeController from '../controllers/finance.controller.js';
import * as subscriptionController from '../controllers/subscription.controller.js';
import * as giftCardController from '../controllers/giftCard.controller.js';
import * as cartAdminController from '../controllers/cart.controller.js';
import * as wishlistAdminController from '../controllers/wishlist.controller.js';
import * as bestsellerController from '../controllers/bestseller.controller.js';
import * as neverPurchasedController from '../controllers/neverPurchased.controller.js';
import * as activityLogController from '../controllers/activityLog.controller.js';
import * as affiliateController from '../controllers/affiliate.controller.js';
import * as newsletterController from '../controllers/newsletter.controller.js';
import { authenticate } from '../../../middlewares/authenticate.js';
import { authorize, enforceAccountStatus } from '../../../middlewares/authorize.js';
import { authLimiter } from '../../../middlewares/rateLimiter.js';
import { validate } from '../../../middlewares/validate.js';
import { uploadSingle } from '../../../middlewares/upload.js';
import { createSubscriptionPlanSchema, updateSubscriptionPlanSchema, subscriptionPlanIdParamSchema } from '../validators/subscription.validator.js';
import { loginSchema, refreshTokenSchema, logoutSchema } from '../validators/auth.validator.js';
import {
    orderIdParamSchema,
    updateOrderStatusSchema,
    subOrderIdParamSchema,
    updateSubOrderStatusSchema,
    assignDeliverySchema,
} from '../validators/order.validator.js';
import {
    createProductSchema,
    updateProductSchema,
    productIdParamSchema,
    taxPricingRulesSchema,
    categoryIdParamSchema,
    createCategorySchema,
    updateCategorySchema,
    reorderCategoriesSchema,
    brandIdParamSchema,
    createBrandSchema,
    updateBrandSchema,
} from '../validators/catalog.validator.js';
import {
    customerListQuerySchema,
    customerIdParamSchema,
    customerUpdateSchema,
    customerStatusUpdateSchema,
    customerAddressParamsSchema,
    customerAddressUpdateSchema,
    customerOrdersQuerySchema,
    customerTransactionsQuerySchema,
    customerAddressesQuerySchema,
} from '../validators/customer.validator.js';
import {
    deliveryListQuerySchema,
    deliveryBoyIdParamSchema,
    createDeliveryBoySchema,
    updateDeliveryBoySchema,
    updateDeliveryStatusSchema,
    updateDeliveryApplicationStatusSchema,
    settleCashSchema,
} from '../validators/delivery.validator.js';
import {
    withdrawListQuerySchema,
    withdrawRequestIdParamSchema,
    updateWithdrawStatusSchema,
} from '../validators/finance.validator.js';
import {
    reviewListQuerySchema,
    reviewIdParamSchema,
    updateReviewStatusSchema,
} from '../validators/review.validator.js';
import {
    vendorListQuerySchema,
    vendorIdParamSchema,
    vendorStatusUpdateSchema,
    vendorCommissionUpdateSchema,
    vendorCommissionsQuerySchema,
} from '../validators/vendor.validator.js';
import {
    marketingIdParamSchema,
    couponListQuerySchema,
    createCouponSchema,
    updateCouponSchema,
    createBannerSchema,
    updateBannerSchema,
    reorderBannersSchema,
    campaignListQuerySchema,
    createCampaignSchema,
    updateCampaignSchema,
} from '../validators/marketing.validator.js';
import {
    settingUpdateSchema,
    policyTypeParamSchema,
    policyUpdateSchema,
    notificationSendSchema,
    customMessageSchema,
} from '../validators/system.validator.js';
import {
    b2bOrdersQuerySchema,
    b2bOrderIdParamSchema,
    assignB2BDeliverySchema,
    b2bWholesaleProductsQuerySchema,
    b2bWholesaleProductStatusSchema,
    b2bVendorPermissionsSchema,
    vendorIdParamSchema as b2bVendorIdParamSchema,
} from '../validators/b2b.validator.js';

const router = Router();
const adminAuth = [authenticate, authorize('admin', 'superadmin'), enforceAccountStatus];

// ─── Auth ─────────────────────────────────────────────────────────────────────
router.post('/auth/login', authLimiter, validate(loginSchema), authController.login);
router.post('/auth/refresh', validate(refreshTokenSchema), authController.refresh);
router.post('/auth/logout', validate(logoutSchema), authController.logout);
router.get('/auth/profile', ...adminAuth, authController.getProfile);

// ─── Analytics ────────────────────────────────────────────────────────────────
router.get('/analytics/dashboard', ...adminAuth, analyticsController.getDashboardStats);
router.get('/analytics/revenue', ...adminAuth, analyticsController.getRevenueData);
router.get('/analytics/order-status', ...adminAuth, analyticsController.getOrderStatusBreakdown);
router.get('/analytics/top-products', ...adminAuth, analyticsController.getTopProducts);
router.get('/analytics/customer-growth', ...adminAuth, analyticsController.getCustomerGrowth);
router.get('/analytics/recent-orders', ...adminAuth, analyticsController.getRecentOrders);
router.get('/analytics/sales', ...adminAuth, analyticsController.getSalesData);
router.get('/analytics/finance-summary', ...adminAuth, analyticsController.getFinancialSummary);
router.get('/analytics/inventory-stats', ...adminAuth, analyticsController.getInventoryStats);
router.get('/analytics/top-customers', ...adminAuth, analyticsController.getTopCustomers);
router.get('/analytics/registered-customers-count', ...adminAuth, analyticsController.getRegisteredCustomersCount);
router.get('/analytics/online-customers', ...adminAuth, analyticsController.getOnlineCustomers);

// ─── Orders ───────────────────────────────────────────────────────────────────
router.get('/orders', ...adminAuth, orderController.getAllOrders);
router.get('/orders/:id', ...adminAuth, validate(orderIdParamSchema, 'params'), orderController.getOrderById);
router.patch('/orders/:id/status', ...adminAuth, validate(orderIdParamSchema, 'params'), validate(updateOrderStatusSchema), orderController.updateOrderStatus);
router.delete('/orders/:id', ...adminAuth, validate(orderIdParamSchema, 'params'), orderController.deleteOrder);

// ─── SubOrders (Product Orders) ───────────────────────────────────────────────
router.get('/suborders', ...adminAuth, subOrderController.getAllSubOrders);
router.patch('/suborders/:id/status', ...adminAuth, validate(subOrderIdParamSchema, 'params'), validate(updateSubOrderStatusSchema), subOrderController.updateSubOrderStatus);
router.patch('/suborders/:id/assign-delivery', ...adminAuth, validate(subOrderIdParamSchema, 'params'), validate(assignDeliverySchema), subOrderController.assignDeliveryBoy);

// ─── Products ─────────────────────────────────────────────────────────────────
router.get('/products', ...adminAuth, catalogController.getAllProducts);
router.get('/products/tax-pricing-rules', ...adminAuth, catalogController.getTaxPricingRules);
router.get('/products/:id', ...adminAuth, validate(productIdParamSchema, 'params'), catalogController.getProductById);
router.post('/products', ...adminAuth, validate(createProductSchema), catalogController.createProduct);
router.put('/products/tax-pricing-rules', ...adminAuth, validate(taxPricingRulesSchema), catalogController.updateTaxPricingRules);

router.put('/products/:id', ...adminAuth, validate(productIdParamSchema, 'params'), validate(updateProductSchema), catalogController.updateProduct);
router.patch('/products/:id/stock', ...adminAuth, validate(productIdParamSchema, 'params'), catalogController.updateProductStock);
router.delete('/products/:id', ...adminAuth, validate(productIdParamSchema, 'params'), catalogController.deleteProduct);

// ─── Categories ───────────────────────────────────────────────────────────────
router.get('/categories', ...adminAuth, catalogController.getAllCategories);
router.post('/categories', ...adminAuth, validate(createCategorySchema), catalogController.createCategory);
router.patch('/categories/reorder', ...adminAuth, validate(reorderCategoriesSchema), catalogController.reorderCategories);
router.put('/categories/:id', ...adminAuth, validate(categoryIdParamSchema, 'params'), validate(updateCategorySchema), catalogController.updateCategory);
router.delete('/categories/:id', ...adminAuth, validate(categoryIdParamSchema, 'params'), catalogController.deleteCategory);

// ─── Brands ───────────────────────────────────────────────────────────────────
router.get('/brands', ...adminAuth, catalogController.getAllBrands);
router.post('/brands', ...adminAuth, validate(createBrandSchema), catalogController.createBrand);
router.put('/brands/:id', ...adminAuth, validate(brandIdParamSchema, 'params'), validate(updateBrandSchema), catalogController.updateBrand);
router.delete('/brands/:id', ...adminAuth, validate(brandIdParamSchema, 'params'), catalogController.deleteBrand);

// ─── Product Tags ─────────────────────────────────────────────────────────────
router.get('/product-tags', ...adminAuth, catalogController.getProductTags);
router.delete('/product-tags/:tag', ...adminAuth, catalogController.deleteProductTag);

// ─── Recycle Bin ──────────────────────────────────────────────────────────────
router.get('/recycle-bin', ...adminAuth, catalogController.getRecycleBin);
router.put('/recycle-bin/:id/restore', ...adminAuth, catalogController.restoreRecycleBinItem);
router.delete('/recycle-bin/empty', ...adminAuth, catalogController.emptyRecycleBin);
router.delete('/recycle-bin/:id', ...adminAuth, catalogController.permanentDeleteRecycleBinItem);

// ─── Vendors ──────────────────────────────────────────────────────────────────
router.get('/vendors', ...adminAuth, validate(vendorListQuerySchema, 'query'), vendorController.getAllVendors);
router.get('/vendors/pending', ...adminAuth, (req, res, next) => { req.query.status = 'pending'; next(); }, validate(vendorListQuerySchema, 'query'), vendorController.getAllVendors);
router.get('/vendors/:id', ...adminAuth, validate(vendorIdParamSchema, 'params'), vendorController.getVendorDetail);
router.get('/vendors/:id/commissions', ...adminAuth, validate(vendorIdParamSchema, 'params'), validate(vendorCommissionsQuerySchema, 'query'), vendorController.getVendorCommissions);
router.patch('/vendors/:id/status', ...adminAuth, validate(vendorIdParamSchema, 'params'), validate(vendorStatusUpdateSchema), vendorController.updateVendorStatus);
router.patch('/vendors/:id/commission', ...adminAuth, validate(vendorIdParamSchema, 'params'), validate(vendorCommissionUpdateSchema), vendorController.updateCommissionRate);

// ─── Customers ────────────────────────────────────────────────────────────────
router.get('/customers', ...adminAuth, validate(customerListQuerySchema, 'query'), customerController.getAllCustomers);
router.post('/customers', ...adminAuth, customerController.createCustomer);
router.get('/customers/addresses', ...adminAuth, validate(customerAddressesQuerySchema, 'query'), customerController.getCustomerAddresses);
router.get('/customers/transactions', ...adminAuth, validate(customerTransactionsQuerySchema, 'query'), customerController.getCustomerTransactions);
router.get('/customers/:id/orders', ...adminAuth, validate(customerIdParamSchema, 'params'), validate(customerOrdersQuerySchema, 'query'), customerController.getCustomerOrders);
router.get('/customers/:id', ...adminAuth, validate(customerIdParamSchema, 'params'), customerController.getCustomerById);
router.put('/customers/:id', ...adminAuth, validate(customerIdParamSchema, 'params'), validate(customerUpdateSchema), customerController.updateCustomerDetail);
router.patch('/customers/:id/status', ...adminAuth, validate(customerIdParamSchema, 'params'), validate(customerStatusUpdateSchema), customerController.updateCustomerStatus);
router.delete('/customers/:customerId/addresses/:addressId', ...adminAuth, validate(customerAddressParamsSchema, 'params'), customerController.deleteCustomerAddress);
router.put('/customers/:customerId/addresses/:addressId', ...adminAuth, validate(customerAddressParamsSchema, 'params'), validate(customerAddressUpdateSchema), customerController.updateCustomerAddress);

// ─── Delivery ─────────────────────────────────────────────────────────────────
router.get('/delivery-boys', ...adminAuth, validate(deliveryListQuerySchema, 'query'), deliveryController.getAllDeliveryBoys);
router.post('/delivery-boys', ...adminAuth, validate(createDeliveryBoySchema), deliveryController.createDeliveryBoy);
router.get('/delivery-boys/:id', ...adminAuth, validate(deliveryBoyIdParamSchema, 'params'), deliveryController.getDeliveryBoyById);
router.put('/delivery-boys/:id', ...adminAuth, validate(deliveryBoyIdParamSchema, 'params'), validate(updateDeliveryBoySchema), deliveryController.updateDeliveryBoy);
router.delete('/delivery-boys/:id', ...adminAuth, validate(deliveryBoyIdParamSchema, 'params'), deliveryController.deleteDeliveryBoy);
router.patch('/delivery-boys/:id/status', ...adminAuth, validate(deliveryBoyIdParamSchema, 'params'), validate(updateDeliveryStatusSchema), deliveryController.updateDeliveryBoyStatus);
router.patch('/delivery-boys/:id/application-status', ...adminAuth, validate(deliveryBoyIdParamSchema, 'params'), validate(updateDeliveryApplicationStatusSchema), deliveryController.updateDeliveryBoyApplicationStatus);
router.post('/delivery-boys/:id/settle-cash', ...adminAuth, validate(deliveryBoyIdParamSchema, 'params'), validate(settleCashSchema), deliveryController.settleCash);

// ─── Finance & Payouts ────────────────────────────────────────────────────────
router.get('/finance/withdraw-requests', ...adminAuth, validate(withdrawListQuerySchema, 'query'), financeController.getWithdrawRequests);
router.patch('/finance/withdraw-requests/:id', ...adminAuth, validate(withdrawRequestIdParamSchema, 'params'), validate(updateWithdrawStatusSchema), financeController.updateWithdrawRequestStatus);
router.get('/finance/stats', ...adminAuth, financeController.getFinanceStats);

// ─── Return Requests ──────────────────────────────────────────────────────────
router.get('/return-requests', ...adminAuth, returnController.getAllReturnRequests);
router.get('/return-requests/:id', ...adminAuth, returnController.getReturnRequestById);
router.patch('/return-requests/:id/status', ...adminAuth, returnController.updateReturnRequestStatus);
router.patch('/return-requests/:id/assign-delivery', ...adminAuth, returnController.assignDelivery);

// ─── Support Tickets ──────────────────────────────────────────────────────────
router.get('/support/tickets', ...adminAuth, supportController.getAllTickets);
router.get('/support/tickets/:id', ...adminAuth, supportController.getTicketById);
router.patch('/support/tickets/:id/status', ...adminAuth, supportController.updateTicketStatus);
router.post('/support/tickets/:id/messages', ...adminAuth, supportController.addTicketMessage);
router.get('/support/ticket-types', ...adminAuth, supportController.getAllTicketTypes);
router.post('/support/ticket-types', ...adminAuth, supportController.createTicketType);
router.put('/support/ticket-types/:id', ...adminAuth, supportController.updateTicketType);
router.delete('/support/ticket-types/:id', ...adminAuth, supportController.deleteTicketType);

// ─── Product Reviews ──────────────────────────────────────────────────────────
router.get('/reviews', ...adminAuth, validate(reviewListQuerySchema, 'query'), reviewController.getAllReviews);
router.patch('/reviews/:id/status', ...adminAuth, validate(reviewIdParamSchema, 'params'), validate(updateReviewStatusSchema), reviewController.updateReviewStatus);
router.delete('/reviews/:id', ...adminAuth, validate(reviewIdParamSchema, 'params'), reviewController.deleteReview);
router.post('/uploads/image', ...adminAuth, uploadSingle('image'), uploadController.uploadImage);

// ─── Marketing & Promotions ──────────────────────────────────────────────────
// Coupons
router.get('/marketing/coupons', ...adminAuth, validate(couponListQuerySchema, 'query'), marketingController.getAllCoupons);
router.post('/marketing/coupons', ...adminAuth, validate(createCouponSchema), marketingController.createCoupon);
router.put('/marketing/coupons/:id', ...adminAuth, validate(marketingIdParamSchema, 'params'), validate(updateCouponSchema), marketingController.updateCoupon);
router.delete('/marketing/coupons/:id', ...adminAuth, validate(marketingIdParamSchema, 'params'), marketingController.deleteCoupon);

// Banners
router.get('/marketing/banners', ...adminAuth, marketingController.getAllBanners);
router.post('/marketing/banners', ...adminAuth, validate(createBannerSchema), marketingController.createBanner);
router.patch('/marketing/banners/reorder', ...adminAuth, validate(reorderBannersSchema), marketingController.reorderBanners);
router.put('/marketing/banners/:id', ...adminAuth, validate(marketingIdParamSchema, 'params'), validate(updateBannerSchema), marketingController.updateBanner);
router.delete('/marketing/banners/:id', ...adminAuth, validate(marketingIdParamSchema, 'params'), marketingController.deleteBanner);

// Campaigns
router.get('/marketing/campaigns', ...adminAuth, validate(campaignListQuerySchema, 'query'), marketingController.getAllCampaigns);
router.post('/marketing/campaigns', ...adminAuth, validate(createCampaignSchema), marketingController.createCampaign);
router.put('/marketing/campaigns/:id', ...adminAuth, validate(marketingIdParamSchema, 'params'), validate(updateCampaignSchema), marketingController.updateCampaign);
router.delete('/marketing/campaigns/:id', ...adminAuth, validate(marketingIdParamSchema, 'params'), marketingController.deleteCampaign);

// ─── Reports ──────────────────────────────────────────────────────────────────
router.get('/reports/sales', ...adminAuth, reportController.getSalesReport);
router.get('/reports/inventory', ...adminAuth, reportController.getInventoryReport);

// ─── B2B Wholesale Marketplace ────────────────────────────────────────────────
router.get('/b2b/orders', ...adminAuth, validate(b2bOrdersQuerySchema, 'query'), b2bController.getAllB2BOrders);
router.get('/b2b/orders/:id', ...adminAuth, validate(b2bOrderIdParamSchema, 'params'), b2bController.getB2BOrderById);
router.patch(
    '/b2b/orders/:id/assign-delivery',
    ...adminAuth,
    validate(b2bOrderIdParamSchema, 'params'),
    validate(assignB2BDeliverySchema),
    b2bController.assignB2BDeliveryBoy
);

router.get('/b2b/products', ...adminAuth, validate(b2bWholesaleProductsQuerySchema, 'query'), b2bController.getWholesaleProductsForApproval);
router.patch('/b2b/products/:id/status', ...adminAuth, validate(b2bWholesaleProductStatusSchema), b2bController.updateWholesaleProductStatus);

router.patch(
    '/b2b/vendors/:id/permissions',
    ...adminAuth,
    validate(b2bVendorIdParamSchema, 'params'),
    validate(b2bVendorPermissionsSchema),
    b2bController.updateVendorB2BPermissions
);

// ─── Notifications ─────────────────────────────────────────────────────────────
router.get('/notifications', ...adminAuth, notificationController.getAdminNotifications);
router.put('/notifications/:id/read', ...adminAuth, notificationController.markAsRead);
router.put('/notifications/read-all', ...adminAuth, notificationController.markAllAsRead);
router.post('/notifications/push', ...adminAuth, validate(notificationSendSchema), systemController.sendPushNotification);
router.post('/notifications/message', ...adminAuth, validate(customMessageSchema), systemController.sendCustomMessage);

// ——— Settings & Policies ————————————————————————————————————————————————
router.get('/settings', ...adminAuth, systemController.getSettings);
router.put('/settings', ...adminAuth, validate(settingUpdateSchema), systemController.updateSettings);
router.get('/policies/:type', ...adminAuth, validate(policyTypeParamSchema, 'params'), systemController.getPolicy);
router.put('/policies/:type', ...adminAuth, validate(policyTypeParamSchema, 'params'), validate(policyUpdateSchema), systemController.updatePolicy);

// ——— Subscriptions & Recurring Payments ——————————————————————————————————
router.get('/recurring-payments', ...adminAuth, subscriptionController.getAllRecurringPayments);
router.patch('/recurring-payments/:id/status', ...adminAuth, subscriptionController.updateRecurringPaymentStatus);

// ——— Gift Cards —————————————————————————————————————————————————─────────
router.get('/gift-cards', ...adminAuth, giftCardController.getAllGiftCards);
router.post('/gift-cards', ...adminAuth, giftCardController.createGiftCard);
router.patch('/gift-cards/:id/status', ...adminAuth, giftCardController.updateGiftCardStatus);
router.delete('/gift-cards/:id', ...adminAuth, giftCardController.deleteGiftCard);

// ——— Shopping Carts —————————————————————————————————————————————————─────
router.get('/shopping-carts', ...adminAuth, cartAdminController.getAllActiveShoppingCarts);

// ——— Wishlists —————————————————————————————————————————————————──────────
router.get('/wishlists', ...adminAuth, wishlistAdminController.getAllActiveWishlists);

// ——— Bestsellers —————————————————————————————————————————————————─────────
router.get('/bestsellers', ...adminAuth, bestsellerController.getBestsellersReport);

// ——— Never Purchased Products ————————————————————————————————————————————
router.get('/never-purchased', ...adminAuth, neverPurchasedController.getNeverPurchasedReport);

// ——— Activity Logs —————————————————————————————————————————————————───────
router.get('/activity-logs', ...adminAuth, activityLogController.getAllActivityLogs);
router.delete('/activity-logs', ...adminAuth, activityLogController.deleteActivityLogs);

// ——— Affiliates —————————————————————————————————————————————————───────────
router.get('/affiliates', ...adminAuth, affiliateController.getAllAffiliates);
router.get('/affiliates/:id', ...adminAuth, affiliateController.getAffiliateById);
router.post('/affiliates', ...adminAuth, affiliateController.createAffiliate);
router.put('/affiliates/:id', ...adminAuth, affiliateController.updateAffiliate);
router.delete('/affiliates/:id', ...adminAuth, affiliateController.deleteAffiliate);

// ——— Newsletter Subscribers ————————————————————————————————————————————————
router.get('/newsletter-subscribers', ...adminAuth, newsletterController.getAllSubscribers);
router.post('/newsletter-subscribers', ...adminAuth, newsletterController.createSubscriber);
router.put('/newsletter-subscribers/:id', ...adminAuth, newsletterController.updateSubscriber);
router.delete('/newsletter-subscribers/:id', ...adminAuth, newsletterController.deleteSubscriber);
router.delete('/newsletter-subscribers', ...adminAuth, newsletterController.deleteSubscriber);

export default router;
