import Order from '../../../models/Order.model.js';
import SubOrder from '../../../models/SubOrder.model.js';

export const syncOrderStatusFromSubOrders = async (parentOrderId) => {
    try {
        const subOrders = await SubOrder.find({ parentOrderId });
        
        if (!subOrders || subOrders.length === 0) return;

        const statuses = subOrders.map(so => so.status);
        
        const allPending = statuses.every(s => s === 'pending');
        const allCancelled = statuses.every(s => s === 'cancelled');
        const allReturned = statuses.every(s => s === 'returned');
        const allDeliveredOrCancelled = statuses.every(s => s === 'delivered' || s === 'cancelled');
        const allShippedOrBeyond = statuses.every(s => ['shipped', 'in-transit', 'out_for_delivery', 'delivered', 'cancelled'].includes(s));
        const hasDelivered = statuses.includes('delivered');
        const hasShippedOrOutForDelivery = statuses.includes('shipped') || statuses.includes('out_for_delivery') || statuses.includes('in-transit');
        const hasAssignedForDelivery = statuses.includes('assigned_for_delivery');
        
        let newStatus = 'pending';
        
        if (allCancelled) {
            newStatus = 'cancelled';
        } else if (allReturned) {
            newStatus = 'returned';
        } else if (allPending) {
            newStatus = 'pending';
        } else if (allDeliveredOrCancelled && hasDelivered) {
            newStatus = 'delivered';
        } else if (allShippedOrBeyond && hasShippedOrOutForDelivery) {
            newStatus = 'shipped';
        } else if (hasDelivered || hasShippedOrOutForDelivery) {
            newStatus = 'partially_delivered';
        } else if (hasAssignedForDelivery) {
            newStatus = 'assigned_for_delivery';
        } else {
            newStatus = 'processing';
        }

        await Order.findByIdAndUpdate(parentOrderId, { status: newStatus });
        
    } catch (error) {
        console.error('Error syncing order status:', error);
    }
};
