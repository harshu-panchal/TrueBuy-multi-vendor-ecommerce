import { create } from 'zustand';
import * as adminService from '../../modules/Admin/services/adminService';
import toast from 'react-hot-toast';

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
        // MOCK: Filter local state if params are provided
        const { vendorId, deliveryBoyId, search, status } = params;
        
        let filtered = [...get().returnRequests];

        if (vendorId) {
            filtered = filtered.filter(req => req.vendorId === vendorId || req.items?.some(i => i.vendorId === vendorId));
        }

        if (deliveryBoyId) {
            filtered = filtered.filter(req => req.deliveryBoyId === deliveryBoyId);
        }

        if (status && status !== 'all') {
            filtered = filtered.filter(req => req.status === status);
        }

        if (search) {
            const lowSearch = search.toLowerCase();
            filtered = filtered.filter(req => 
                req.id.toLowerCase().includes(lowSearch) || 
                req.orderId.toLowerCase().includes(lowSearch) ||
                req.customer?.name?.toLowerCase().includes(lowSearch)
            );
        }

        set({ isLoading: false });
        // NOTE: We don't overwrite returnRequests here to keep local new entries
    },

    fetchReturnRequestById: async (id) => {
        set({ isLoading: true });
        try {
            const response = await adminService.getReturnRequestById(id);
            set({ isLoading: false });
            return response.data;
        } catch (error) {
            set({ isLoading: false });
            toast.error(error.message || 'Failed to fetch return request details');
            return null;
        }
    },

    updateReturnStatus: async (id, statusData) => {
        set({ isLoading: true });
        const { returnRequests } = get();
        
        const updatedRequests = returnRequests.map((req) =>
            req.id === id ? { ...req, ...statusData, updatedAt: new Date().toISOString() } : req
        );

        set({ returnRequests: updatedRequests, isLoading: false });
        // toast.success('Status updated successfully'); // Silent update for multi-step flows
        return true;
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
        return await get().updateReturnStatus(id, { 
            status: 'delivered_to_seller', 
            receivedAt: new Date().toISOString() 
        });
    },

    assignDeliveryToReturn: async (id, deliveryBoyId) => {
        set({ isLoading: true });
        try {
            // Mocking the backend response since we are frontend-only
            // In reality, this would call adminService.assignDeliveryToReturn
            const updatedReq = {
                status: 'approved',
                deliveryBoyId: deliveryBoyId, // Usually an object with name/phone, but using ID for now
                updatedAt: new Date().toISOString()
            };
            
            set((state) => ({
                returnRequests: state.returnRequests.map((req) =>
                    req.id === id ? { ...req, ...updatedReq } : req
                ),
                isLoading: false
            }));
            toast.success('Delivery partner assigned successfully');
            return true;
        } catch (error) {
            set({ isLoading: false });
            toast.error(error.message || 'Failed to assign delivery partner');
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

    submitReturnRequest: async (returnRequestData) => {
        set({ isLoading: true });
        try {
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
                    status: 'pending',
                    refundStatus: 'pending',
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
