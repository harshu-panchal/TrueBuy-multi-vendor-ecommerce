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
            } else {
                response = await api.get('/exchange/my', { params: apiParams });
            }

            const payload = response.data?.data || response.data || response;
            const exchangePayload = exchangeResponse?.data?.data || exchangeResponse?.data || exchangeResponse || {};
            const returnRequests = Array.isArray(payload.returnRequests) ? payload.returnRequests : [];
            const exchangeRequests = Array.isArray(payload.exchangeRequests)
                ? payload.exchangeRequests
                : Array.isArray(exchangePayload.exchangeRequests)
                    ? exchangePayload.exchangeRequests
                    : [];
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
                    : [...normalizedRequests, ...existingRequests.filter((existing) => !normalizedRequests.some((req) => String(req.id) === String(existing.id)))],
                pagination: payload.pagination || exchangePayload.pagination || get().pagination,
                isLoading: false 
            });
        } catch (error) {
            set({ isLoading: false, error: error.message });
            // toast.error('Failed to fetch return requests');
        }
    },

    getReturnRequestByOrderId: (orderId) => {
        return get().returnRequests.find(req => req.orderId === orderId || req.orderRefId === orderId);
    },

    fetchReturnRequestById: async (id, role = null) => {
        // Check local state first (covers mock IDs like RET- or EXC-)
        const localMatch = get().returnRequests.find(req => String(req.id) === String(id));
        if (localMatch) return localMatch;

        set({ isLoading: true });
        try {
            let response = null;
            try {
                const resolvedRole = resolveReturnScope(role);
                if (resolvedRole === 'vendor') {
                    response = await vendorService.getVendorReturnRequestById(id);
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
            const payload = response.data?.data || response.data || response;
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
            const isVendor = window.location.pathname.includes('/vendor/');
            const isAdmin = window.location.pathname.includes('/admin/');
            
            let updatedReq = null;
            if (isAdmin) {
                const response = await adminService.updateReturnRequestStatus(id, statusData);
                updatedReq = response.data?.data || response.data || statusData;
            } else if (isVendor) {
                const vendorPayload = {};
                if (statusData.status === 'approved') {
                    vendorPayload.action = 'APPROVE';
                    vendorPayload.status = 'approved';
                } else if (statusData.status === 'rejected') {
                    vendorPayload.action = 'REJECT';
                    vendorPayload.rejectionReason = statusData.rejectionReason || '';
                    vendorPayload.status = 'rejected';
                } else {
                    vendorPayload.status = statusData.status; 
                }
                const response = await vendorService.updateVendorReturnRequestStatus(id, vendorPayload);
                updatedReq = response.data?.data || response.data || statusData;
            } else {
                updatedReq = statusData;
            }

            const { returnRequests } = get();
            const updatedRequests = returnRequests.map((req) =>
                String(req.id) === String(id) ? { ...req, ...updatedReq, updatedAt: new Date().toISOString() } : req
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
            status: 'picked_up', 
            pickupImages: proofImages,
            pickedUpAt: new Date().toISOString() 
        });
    },

    confirmSellerReceipt: async (id) => {
        const req = get().returnRequests.find(r => r.id === id);
        const nextStatus = req?.type === 'exchange' ? 'inspection_pending' : 'delivered_to_seller';
        
        return await get().updateReturnStatus(id, { 
            status: nextStatus, 
            receivedAt: new Date().toISOString() 
        });
    },

    inspectExchangeItem: async (id, result, notes) => {
        set({ isLoading: true });
        const nextStatus = result === 'approved' ? 'approved' : 'inspection_rejected';
        
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
            status: resolution === 'refund' ? 'completed' : 'rejected', // Return to customer = rejected
            refundStatus: resolution === 'refund' ? 'pending' : 'not_applicable',
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
        
        // Generate a mock replacement order
        const req = get().returnRequests.find(r => r.id === id);
        const replacementOrderId = `REP-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

        // Update the return request
        const statusData = { 
            status: 'replacement_shipped',
            replacementOrderId,
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
            status: 'completed',
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
                    String(req.id) === String(id) ? { ...req, ...payload } : req
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
                status: 'completed',
                refundStatus: 'processed',
                updatedAt: new Date().toISOString()
            };
            
            const response = await adminService.updateReturnRequestStatus(id, statusData);
            const updatedReq = response.data;
            
            set((state) => ({
                returnRequests: state.returnRequests.map((req) =>
                    req.id === id ? { ...req, ...updatedReq } : req
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
        // MOCK: Local only cancellation as requested
        set((state) => ({
            returnRequests: state.returnRequests.filter(req => req.id !== id),
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

            // Check if there's an existing rejected request for this product in this order
            const existingRequests = get().returnRequests;
            const existingDraft = existingRequests.find(r => 
                r.orderId === returnRequestData.orderId && 
                r.items.some(item => returnRequestData.productIds.includes(item.id)) &&
                r.status === 'rejected'
            );

            if (existingDraft) {
                // UPDATE existing rejected request (Re-request logic)
                const statusData = {
                    status: 'pending',
                    reason: returnRequestData.reason,
                    description: returnRequestData.description,
                    images: returnRequestData.images,
                    pickupAddress: returnRequestData.pickupAddress,
                    rejectionReason: '', // Clear previous rejection reason
                    updatedAt: new Date().toISOString()
                };
                await get().updateReturnStatus(existingDraft.id, statusData);
            } else {
                // CREATE new request mock
                const newRequest = {
                    id: `RET-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                    ...returnRequestData,
                    type: returnRequestData.type || 'return',
                    status: 'pending',
                    refundStatus: returnRequestData.type === 'exchange' ? 'not_applicable' : 'pending',
                    requestDate: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                
                set((state) => ({
                    returnRequests: [newRequest, ...state.returnRequests],
                    isLoading: false
                }));
            }
            
            toast.success('Return request submitted successfully');
            return true;
        } catch (error) {
            set({ isLoading: false });
            toast.error(error.message || 'Failed to submit return request');
            return false;
        }
    }
}));
