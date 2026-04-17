import { Router } from 'express';
import { validate } from '../../../middlewares/validate.js';
import {
    requireAdmin,
    requireCustomer,
    requireDelivery,
    requireVendor,
} from '../../../middlewares/roleAccess.js';
import * as customerReturnController from '../controllers/customerReturn.controller.js';
import * as vendorReturnController from '../controllers/vendorReturn.controller.js';
import * as adminReturnController from '../controllers/adminReturn.controller.js';
import * as deliveryReturnController from '../controllers/deliveryReturn.controller.js';
import {
    adminAssignSchema,
    createReturnSchema,
    deliveryUpdateSchema,
    listReturnsQuerySchema,
    returnIdParamSchema,
    vendorDecisionSchema,
} from '../validators/return.validator.js';

const router = Router();

// Customer
router.post(
    '/user/returns',
    ...requireCustomer,
    validate(createReturnSchema),
    customerReturnController.createReturnRequest
);
router.get(
    '/user/returns',
    ...requireCustomer,
    validate(listReturnsQuerySchema, 'query'),
    customerReturnController.getMyReturnRequests
);
router.get(
    '/user/returns/:orderId',
    ...requireCustomer,
    customerReturnController.getReturnRequestByOrderId
);

// Vendor
router.get(
    '/vendor/returns',
    ...requireVendor,
    validate(listReturnsQuerySchema, 'query'),
    vendorReturnController.getVendorReturns
);
router.put(
    '/vendor/returns/:id',
    ...requireVendor,
    validate(returnIdParamSchema, 'params'),
    validate(vendorDecisionSchema),
    vendorReturnController.reviewVendorReturn
);

// Admin
router.get(
    '/admin/returns',
    ...requireAdmin,
    validate(listReturnsQuerySchema, 'query'),
    adminReturnController.getAdminReturns
);
router.get(
    '/admin/returns/:id',
    ...requireAdmin,
    validate(returnIdParamSchema, 'params'),
    adminReturnController.getAdminReturnById
);
router.patch(
    '/admin/returns/:id/status',
    ...requireAdmin,
    validate(returnIdParamSchema, 'params'),
    adminReturnController.updateAdminReturnStatus
);
router.patch(
    '/admin/returns/:id/assign',
    ...requireAdmin,
    validate(returnIdParamSchema, 'params'),
    validate(adminAssignSchema),
    adminReturnController.assignReturnPickup
);

// Delivery
router.get(
    '/delivery/returns',
    ...requireDelivery,
    validate(listReturnsQuerySchema, 'query'),
    deliveryReturnController.getAssignedReturnPickups
);
router.patch(
    '/delivery/returns/:id',
    ...requireDelivery,
    validate(returnIdParamSchema, 'params'),
    validate(deliveryUpdateSchema),
    deliveryReturnController.updateAssignedReturnStatus
);

export default router;

