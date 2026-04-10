import { authenticate } from './authenticate.js';
import { authorize, enforceAccountStatus } from './authorize.js';

export const requireCustomer = [authenticate, authorize('customer'), enforceAccountStatus];
export const requireVendor = [authenticate, authorize('vendor'), enforceAccountStatus];
export const requireAdmin = [authenticate, authorize('admin', 'superadmin'), enforceAccountStatus];
export const requireDelivery = [authenticate, authorize('delivery'), enforceAccountStatus];

