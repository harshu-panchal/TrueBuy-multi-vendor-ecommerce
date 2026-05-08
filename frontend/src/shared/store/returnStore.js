import { create } from 'zustand';
import * as adminService from '../../modules/Admin/services/adminService';
import * as vendorService from '../../modules/Vendor/services/vendorService';
import api from '../utils/api';
import toast from 'react-hot-toast';

const resolveReturnScope = (role = null) => {
    if (role === 'admin' || role === 'vendor' || role === 'delivery') return role;
    if (typeof window === 'undefined') return 'user';
    if (window.location.pathname.startsWith('/admin')) return 'admin';
    if (window.location.pathname.startsWith('/vendor')) return 'vendor';
    if (window.location.pathname.startsWith('/delivery')) return 'delivery';
    return 'user';
};

export const useReturnStore = create((set, get) => ({
    returnRequests: [],
    isLoading: false,
    error: null,
    pagination: {
        total: 0,
        page: 1,
        limit: 10,
        pages: 1
    },

    fetchReturnRequests: async (params = {}) => {
        set({ isLoading: true });
        try {
            const { role, ...apiParams } = params;
            const resolvedRole = resolveReturnScope(role);
            let response;
            let exchangeResponse = null;
            
            if (resolvedRole === 'admin') {
                response = await adminService.getAllReturnRequests(apiParams);
                exchangeResponse = await api.get('/exchange/admin', { params: apiParams });
            } else if (resolvedRole === 'vendor') {
                response = await vendorService.getVendorReturnRequests(apiParams);
                exchangeResponse = await api.get('/exchange/vendor', { params: apiParams });
            } else if (resolvedRole === 'delivery') {
                response = await api.get('/delivery/returns', { params: apiParams });
            } else {
                // User role: fetch both returns and exchanges
                response = await api.get('/user/returns', { params: apiParams });
                exchangeResponse = await api.get('/exchange/my', { params: apiParams });
            }

            const payload = response.data?.data || response.data || response;
            const exchangePayload = exchangeResponse?.data?.data || exchangeResponse?.data || exchangeResponse || {};
            
            const returnRequests = Array.isArray(payload.returnRequests) 
                ? payload.returnRequests 
                : (Array.isArray(payload) ? payload : []);
                
            const exchangeRequests = Array.isArray(exchangePayload.exchangeRequests)
                ? exchangePayload.exchangeRequests
                : (Array.isArray(exchangePayload) ? exchangePayload : []);

            const normalizedReturnRequests = returnRequests.map((request) => ({ ...request, type: request.type || 'return' }));
            const normalizedExchangeRequests = exchangeRequests.map((request) => ({
                ...request,
                type: 'exchange',
            }));
            
            const normalizedRequests = [...normalizedReturnRequests, ...normalizedExchangeRequests];
            const existingRequests = get().returnRequests;
            
            set({ 
                returnRequests: resolvedRole === 'admin' || resolvedRole === 'vendor'
                    ? [...normalizedRequests, ...existingRequests.filter((existing) => !normalizedRequests.some((req) => String(req.id) === String(existing.id)))]
                    : normalizedRequests,
                pagination: payload.pagination || exchangePayload.pagination || get().pagination,
                isLoading: false 
            });
        } catch (error) {
            set({ isLoading: false, error: error.message });
        }
    },

    getReturnRequestByOrderId: (orderId) => {
        return get().returnRequests.find(req => req.orderId === orderId || req.orderRefId === orderId);
    },

    fetchReturnRequestById: async (id, role = null) => {
        // Check local state first
        const localMatch = get().returnRequests.find(req => String(req.id) === String(id));
        if (localMatch) return localMatch;

        set({ isLoading: true });
        try {
            let response = null;
            try {
                const resolvedRole = resolveReturnScope(role);
                if (resolvedRole === 'vendor') {
                    response = await vendorService.getVendorReturnRequestById(id);
                } else if (resolvedRole === 'admin') {
                    response = await adminService.getReturnRequestById(id);
                } else if (resolvedRole === 'delivery') {
                    // Delivery might not have a direct "get by id" so we filter local or use list
                    const list = await api.get('/delivery/returns');
                    const found = (list.data?.data?.returnRequests || []).find(r => String(r.id || r._id) === String(id));
                    if (found) return found;
                } else {
                    response = await adminService.getReturnRequestById(id);
                }
            } catch (error) {
                if (error?.response?.status === 404) {
                    response = await api.get(`/exchange/${id}`);
                } else {
                    throw error;
                }
            }
            set({ isLoading: false });
            const payload = response?.data?.data || response?.data || response;
            if (payload?.replacementOrderId || payload?.paymentAdjustment || payload?.inventoryReserved) {
                return { ...payload, type: 'exchange' };
            }
            return payload;
        } catch (error) {
            set({ isLoading: false });
            toast.error(error.message || 'Failed to fetch return request details');
            return null;
        }
    },

    updateReturnStatus: async (id, statusData) => {
        set({ isLoading: true });
        try {
            const path = window.location.pathname;
            const isVendor = path.includes('/vendor');
            const isAdmin = path.includes('/admin');
            const isDelivery = path.includes('/delivery');
            
            let updatedReq = null;
            if (isAdmin) {
                const response = await adminService.updateReturnRequestStatus(id, statusData);
                updatedReq = response.data?.data || response.data || statusData;
            } else if (isVendor) {
                const vendorPayload = {};
                if (statusData.status === 'approved' || statusData.status === 'APPROVED_BY_VENDOR') {
                    vendorPayload.action = 'APPROVE';
                } else if (statusData.status === 'rejected' || statusData.status === 'REJECTED_BY_VENDOR') {
                    vendorPayload.action = 'REJECT';
                    vendorPayload.rejectionReason = statusData.rejectionReason || '';
                } else {
                    vendorPayload.status = statusData.status; 
                }
                vendorPayload.note = statusData.note || '';
                const response = await vendorService.updateVendorReturnRequestStatus(id, vendorPayload);
                updatedReq = response.data?.data || response.data || statusData;
            } else if (isDelivery) {
                // Ensure status is uppercase for backend validation
                const status = (statusData.status || '').toUpperCase();
                const response = await api.patch(`/delivery/returns/${id}`, { ...statusData, status });
                updatedReq = response.data?.data || response.data || statusData;
            } else {
                updatedReq = statusData;
            }

            const { returnRequests } = get();
            const updatedRequests = returnRequests.map((req) =>
                String(req.id || req._id) === String(id) ? { ...req, ...updatedReq, updatedAt: new Date().toISOString() } : req
            );

            set({ returnRequests: updatedRequests, isLoading: false });
            return true;
        } catch (error) {
            set({ isLoading: false });
            toast.error(error?.response?.data?.message || error.message || 'Failed to update status');
            return false;
        }
    },

    // Logistics Actions
    markAsPickedUp: async (id, proofImages = []) => {
        return await get().updateReturnStatus(id, { 
            status: 'PICKED_UP', 
            pickupImages: proofImages,
            pickedUpAt: new Date().toISOString() 
        });
    },

    confirmSellerReceipt: async (id) => {
        const req = get().returnRequests.find(r => String(r.id || r._id) === String(id));
        const nextStatus = req?.type === 'exchange' ? 'INSPECTION_PENDING' : 'COMPLETED';
        
        return await get().updateReturnStatus(id, { 
            status: nextStatus, 
            receivedAt: new Date().toISOString() 
        });
    },

    inspectExchangeItem: async (id, result, notes) => {
        set({ isLoading: true });
        const nextStatus = result === 'approved' ? 'COMPLETED' : 'REJECTED_BY_VENDOR';
        
        const statusData = {
            status: nextStatus,
            inspectionNotes: notes,
            inspectionDate: new Date().toISOString()
        };

        const success = await get().updateReturnStatus(id, statusData);
        if (success) {
            toast.success(result === 'approved' ? 'Inspection approved' : 'Inspection rejected');
        }
        set({ isLoading: false });
        return success;
    },

    resolveInspectionFailure: async (id, resolution) => {
        set({ isLoading: true });
        const statusData = {
            status: resolution === 'refund' ? 'COMPLETED' : 'REJECTED_BY_VENDOR',
            refundStatus: resolution === 'refund' ? 'PENDING' : 'FAILED',
            resolutionType: resolution,
            updatedAt: new Date().toISOString()
        };

        const success = await get().updateReturnStatus(id, statusData);
        if (success) {
            toast.success(`Resolution set to: ${resolution === 'refund' ? 'Refund Process' : 'Return to Customer'}`);
        }
        set({ isLoading: false });
        return success;
    },

    shipReplacement: async (id, trackingNumber) => {
        set({ isLoading: true });
        const statusData = { 
            status: 'COMPLETED',
            replacementOrderId: `REP-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
            forwardTrackingNumber: trackingNumber || `TRK-FWD-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
            shippedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const success = await get().updateReturnStatus(id, statusData);
        if (success) {
            toast.success('Replacement item shipped!');
        }
        set({ isLoading: false });
        return success;
    },

    confirmReplacementDelivery: async (id) => {
        set({ isLoading: true });
        const statusData = {
            status: 'COMPLETED',
            deliveredAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        const success = await get().updateReturnStatus(id, statusData);
        if (success) {
            toast.success('Exchange completed successfully!');
        }
        set({ isLoading: false });
        return success;
    },

    assignDeliveryToReturn: async (id, deliveryBoyId) => {
        set({ isLoading: true });
        try {
            const response = await adminService.assignDeliveryToReturn(id, deliveryBoyId);
            const payload = response.data?.data || response.data;
            
            set((state) => ({
                returnRequests: state.returnRequests.map((req) =>
                    String(req.id || req._id) === String(id) ? { ...req, ...payload } : req
                ),
                isLoading: false
            }));
            toast.success('Delivery partner assigned successfully');
            return true;
        } catch (error) {
            set({ isLoading: false });
            toast.error(error?.response?.data?.message || 'Failed to assign delivery partner');
            return false;
        }
    },

    processReturnRefund: async (id) => {
        set({ isLoading: true });
        try {
            const statusData = { 
                status: 'COMPLETED',
                refundStatus: 'COMPLETED',
                updatedAt: new Date().toISOString()
            };
            
            const response = await adminService.updateReturnRequestStatus(id, statusData);
            const updatedReq = response.data;
            
            set((state) => ({
                returnRequests: state.returnRequests.map((req) =>
                    String(req.id || req._id) === String(id) ? { ...req, ...updatedReq } : req
                ),
                isLoading: false
            }));
            toast.success('Refund processed successfully');
            return true;
        } catch (error) {
            set({ isLoading: false });
            toast.error(error.message || 'Failed to process refund');
            return false;
        }
    },

    cancelReturnRequest: async (id) => {
        set({ isLoading: true });
        set((state) => ({
            returnRequests: state.returnRequests.filter(req => String(req.id || req._id) !== String(id)),
            isLoading: false
        }));
        toast.success('Return request cancelled successfully');
        return true;
    },

    submitReturnRequest: async (returnRequestData) => {
        set({ isLoading: true });
        try {
            if (returnRequestData?.type === 'exchange') {
                const response = await api.post('/exchange/request', {
                    orderId: returnRequestData.orderId,
                    oldProductId: returnRequestData.oldProductId || returnRequestData.productId || returnRequestData.productIds?.[0],
                    newProductId: returnRequestData.newProductId || returnRequestData.replacementProductId,
                    reason: returnRequestData.reason,
                    description: returnRequestData.description || returnRequestData.additionalDetails || '',
                    images: Array.isArray(returnRequestData.images) ? returnRequestData.images : [],
                    oldVariant: returnRequestData.oldVariant || returnRequestData.variant || {},
                    newVariant: returnRequestData.newVariant || {},
                    exchangeWindowDays: returnRequestData.exchangeWindowDays || 7,
                });
                const payload = { ...(response.data?.data || response.data || response), type: 'exchange' };
                set((state) => ({
                    returnRequests: [payload, ...state.returnRequests],
                    isLoading: false,
                }));
                toast.success('Exchange request submitted successfully');
                return true;
            }

            // Real backend call for returns
            const response = await api.post('/user/returns', {
                orderId: returnRequestData.orderId,
                productId: returnRequestData.productId || returnRequestData.productIds?.[0],
                reason: returnRequestData.reason,
                images: Array.isArray(returnRequestData.images) ? returnRequestData.images : [],
            });

            const payload = { ...(response.data?.data || response.data || response), type: 'return' };
            
            set((state) => ({
                returnRequests: [payload, ...state.returnRequests],
                isLoading: false,
            }));
            
            toast.success('Return request submitted successfully');
            return true;
        } catch (error) {
            set({ isLoading: false });
            toast.error(error?.response?.data?.message || error.message || 'Failed to submit return request');
            return false;
        }
    }

}));
