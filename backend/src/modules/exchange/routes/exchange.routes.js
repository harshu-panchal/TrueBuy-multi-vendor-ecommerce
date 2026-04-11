import { Router } from 'express';
import { validate } from '../../../middlewares/validate.js';
import { authenticate } from '../../../middlewares/authenticate.js';
import { authorize, enforceAccountStatus } from '../../../middlewares/authorize.js';
import * as exchangeController from '../controllers/exchange.controller.js';
import {
    createExchangeSchema,
    exchangeIdParamSchema,
    exchangeDecisionSchema,
    exchangePickupSchema,
    exchangeShipSchema,
    listExchangeQuerySchema,
} from '../validators/exchange.validator.js';

const router = Router();
const customerAuth = [authenticate, authorize('customer'), enforceAccountStatus];
const vendorAuth = [authenticate, authorize('vendor'), enforceAccountStatus];
const deliveryAuth = [authenticate, authorize('delivery'), enforceAccountStatus];
const adminAuth = [authenticate, authorize('admin', 'superadmin'), enforceAccountStatus];

router.post('/exchange/request', ...customerAuth, validate(createExchangeSchema), exchangeController.createExchangeRequest);
router.get('/exchange/my', ...customerAuth, validate(listExchangeQuerySchema, 'query'), exchangeController.getMyExchangeRequests);
router.get('/exchange/vendor', ...vendorAuth, validate(listExchangeQuerySchema, 'query'), exchangeController.getVendorExchangeRequests);
router.get('/exchange/admin', ...adminAuth, validate(listExchangeQuerySchema, 'query'), exchangeController.getAdminExchangeRequests);
router.get('/exchange/:id', authenticate, enforceAccountStatus, validate(exchangeIdParamSchema, 'params'), exchangeController.getExchangeRequestById);
router.post('/exchange/:id/approve', ...vendorAuth, validate(exchangeIdParamSchema, 'params'), validate(exchangeDecisionSchema), exchangeController.approveExchangeRequest);
router.post('/exchange/:id/reject', ...vendorAuth, validate(exchangeIdParamSchema, 'params'), validate(exchangeDecisionSchema), exchangeController.rejectExchangeRequest);
router.post('/exchange/:id/pickup', ...deliveryAuth, validate(exchangeIdParamSchema, 'params'), validate(exchangePickupSchema), exchangeController.pickupExchangeRequest);
router.post('/exchange/:id/ship', ...vendorAuth, validate(exchangeIdParamSchema, 'params'), validate(exchangeShipSchema), exchangeController.shipExchangeRequest);
router.post('/exchange/:id/override-approve', ...adminAuth, validate(exchangeIdParamSchema, 'params'), validate(exchangeDecisionSchema), exchangeController.approveExchangeRequest);
router.post('/exchange/:id/override-reject', ...adminAuth, validate(exchangeIdParamSchema, 'params'), validate(exchangeDecisionSchema), exchangeController.rejectExchangeRequest);

export default router;
