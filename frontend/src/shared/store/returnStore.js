import { create } from 'zustand';
import * as adminService from '../../modules/Admin/services/adminService';
import * as vendorService from '../../modules/Vendor/services/vendorService';
import toast from 'react-hot-toast';

export const useReturnStore = create((set, get) => ({
    returnRequests: [
        {
            id: 'RET-8B2X1L904',
            orderId: 'ORD-55421',
            vendorId: 'VEND-991',
            status: 'pending',
            refundStatus: 'pending',
            requestDate: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            updatedAt: new Date().toISOString(),
            refundAmount: 1299,
            reason: 'Defective Product',
            description: 'The product has a scratch on the screen and the volume button is loose.',
            customer: {
                name: 'Ankit Sharma',
                email: 'ankit.s@example.com',
                phone: '+91 98765 43210',
                address: '123, Silver Oak Apartments, Sector 45, Gurgaon, Haryana - 122003'
            },
            vendor: {
                storeName: 'Premium Electronics',
                email: 'premium.elec@example.com'
            },
            items: [
                {
                    id: 'PROD-001',
                    name: 'Wireless Noise Cancelling Headphones',
                    price: 1299,
                    quantity: 1,
                    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop'
                }
            ],
            product: { // Compatibility for admin view
                 name: 'Wireless Noise Cancelling Headphones',
                 image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop'
            },
            images: [
                'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=500&h=500&fit=crop',
                'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&h=500&fit=crop'
            ]
        },
        {
            id: 'RET-NJC77301',
            orderId: 'ORD-99082',
            vendorId: 'VEND-NJC99', // Placeholder ID for Naina Jewellery Collection
            status: 'pending',
            refundStatus: 'pending',
            requestDate: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
            updatedAt: new Date().toISOString(),
            refundAmount: 4500,
            reason: 'Wrong Color',
            description: 'Ordered Golden finish but received Silver finish necklace set.',
            customer: {
                name: 'Priya Verma',
                email: 'priya.v@example.com',
                phone: '+91 99887 76655',
                address: 'H-45, Lajpat Nagar, New Delhi - 110024'
            },
            vendor: {
                storeName: 'Naina Jewellery Collection',
                email: 'naina.jewels@example.com'
            },
            items: [
                {
                    id: 'PROD-JWL05',
                    name: 'Traditional Kundan Necklace Set',
                    price: 4500,
                    quantity: 1,
                    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200&h=200&fit=crop'
                }
            ],
            product: {
                 name: 'Traditional Kundan Necklace Set',
                 image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200&h=200&fit=crop'
            }
        }
    ],
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
            let response;
            
            if (role === 'admin') {
                response = await adminService.getAllReturnRequests(apiParams);
            } else if (role === 'vendor') {
                response = await vendorService.getVendorReturnRequests(apiParams);
            } else {
                // For users/others, we still filter local state for now or call a user-specific endpoint if exists
                // But generally, users get their return status from the order detail which calls this with orderId
                // So we can just return what's in state if no specific API for users
                set({ isLoading: false });
                return;
            }

            const payload = response.data?.data || response.data || response;
            const requests = payload.returnRequests || [];
            
            set({ 
                returnRequests: requests, 
                pagination: payload.pagination || get().pagination,
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

    fetchReturnRequestById: async (id) => {
        // If it's a mock ID (e.g., from Naina Jewellery mock), return it from local state
        if (id && String(id).startsWith('RET-')) {
            return get().returnRequests.find(req => String(req.id) === String(id)) || null;
        }

        set({ isLoading: true });
        try {
            const response = await adminService.getReturnRequestById(id);
            set({ isLoading: false });
            return response.data?.data || response.data || response;
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
