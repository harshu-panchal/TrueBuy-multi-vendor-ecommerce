import { create } from 'zustand';
import * as adminService from '../../modules/Admin/services/adminService';
import * as vendorService from '../../modules/Vendor/services/vendorService';
import api from '../utils/api';
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
        },
        {
            id: 'RET-DB-PICKUP-TEST',
            orderId: 'ORD-77221',
            vendorId: 'VEND-991',
            status: 'approved',
            refundStatus: 'pending',
            deliveryBoyId: 'DB-001',
            requestDate: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
            updatedAt: new Date().toISOString(),
            refundAmount: 24999,
            reason: 'Performance Issues',
            description: 'The phone freezes frequently during normal use.',
            customer: {
                name: 'Karan Malhotra',
                email: 'karan.m@example.com',
                phone: '+91 98888 77777',
                address: 'C-12, Green Park Extension, New Delhi - 110016'
            },
            pickupAddress: {
                name: 'Karan Malhotra',
                phone: '+91 98888 77777',
                address: 'C-12, Green Park Extension',
                city: 'New Delhi',
                state: 'Delhi',
                zipCode: '110016'
            },
            images: [
                'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&h=500&fit=crop'
            ],
            vendor: {
                storeName: 'Premium Electronics',
                phone: '+91 98XXX XXX99',
                address: 'Plot 45, Okhla Phase III, New Delhi - 110020',
                email: 'premium.elec@example.com'
            },
            items: [
                {
                    id: 'PROD-SMART-01',
                    name: 'Samsung Galaxy S23 FE',
                    price: 24999,
                    quantity: 1,
                    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=200&h=200&fit=crop'
                }
            ]
        },
        {
            id: 'RET-COMPLETED-99',
            orderId: 'ORD-88122',
            vendorId: 'VEND-991',
            status: 'completed',
            refundStatus: 'processed',
            deliveryBoyId: 'DB-001',
            requestDate: new Date(Date.now() - 604800000).toISOString(), // 7 days ago
            updatedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            refundAmount: 2999,
            reason: 'Quality Issues',
            description: 'The touch screen stops responding after 30 minutes of use.',
            customer: {
                name: 'Neha Gupta',
                email: 'neha.g@example.com',
                phone: '+91 97777 66666',
                address: 'Unit 402, Lotus towers, BKC, Mumbai - 400051'
            },
            vendor: {
                storeName: 'Premium Electronics',
                phone: '+91 98XXX XXX99',
                address: 'Plot 45, Okhla Phase III, New Delhi - 110020',
                email: 'premium.elec@example.com'
            },
            images: [
                'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500&h=500&fit=crop'
            ],
            items: [
                {
                    id: 'PROD-WATCH-01',
                    name: 'Boat Wave Smartwatch (Black)',
                    price: 2999,
                    quantity: 1,
                    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop'
                }
            ]
        },
        {
            id: 'EXC-99X-221',
            orderId: 'ORD-11223',
            vendorId: 'VEND-991',
            type: 'exchange',
            status: 'picked_up',
            refundStatus: 'not_applicable',
            deliveryBoyId: 'DB-001',
            requestDate: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
            updatedAt: new Date().toISOString(),
            refundAmount: 0,
            reason: 'Size Issue',
            description: 'The Large size is too tight. Need an Extra Large instead.',
            customer: {
                name: 'Rahul Khanna',
                email: 'rahul.k@example.com',
                phone: '+91 99999 88888',
                address: 'Flat 101, Sunshine Heights, Mumbai - 400001'
            },
            vendor: {
                storeName: 'Premium Electronics',
                phone: '+91 98XXX XXX99',
                address: 'Plot 45, Okhla Phase III, New Delhi - 110020',
                email: 'premium.elec@example.com'
            },
            images: [
                'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&h=500&fit=crop'
            ],
            pickupImages: [
                'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&h=500&fit=crop'
            ],
            items: [
                {
                    id: 'PROD-TSHIRT-01',
                    name: 'Essential Cotton T-Shirt (White)',
                    price: 999,
                    quantity: 1,
                    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200&h=200&fit=crop'
                }
            ]
        },
        {
            id: 'EXC-NEW-442',
            orderId: 'ORD-99001',
            vendorId: 'VEND-991',
            type: 'exchange',
            status: 'pending',
            refundStatus: 'not_applicable',
            requestDate: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
            updatedAt: new Date().toISOString(),
            refundAmount: 0,
            reason: 'Color Mismatch',
            description: 'The blue looks much darker than in the pictures. I want the Navy Blue instead.',
            customer: {
                name: 'Anjali Sharma',
                email: 'anjali.s@example.com',
                phone: '+91 98XXX XXX55',
                address: 'C-42, Sector 62, Noida - 201301'
            },
            vendor: {
                storeName: 'Premium Electronics',
                phone: '+91 98XXX XXX99',
                address: 'Plot 45, Okhla Phase III, New Delhi - 110020',
                email: 'premium.elec@example.com'
            },
            images: [
                'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop'
            ],
            items: [
                {
                    id: 'PROD-WATCH-01',
                    name: 'Smart Watch Series 7 (Blue)',
                    price: 2499,
                    quantity: 1,
                    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop'
                }
            ]
        },
        {
            id: 'EXC-INSP-771',
            orderId: 'ORD-88221',
            vendorId: 'VEND-991',
            type: 'exchange',
            status: 'inspection_pending',
            receivedAt: new Date(Date.now() - 3600000).toISOString(), // Received 1 hour ago (SLA active)
            items: [
                {
                    id: 'PROD-AUDIO-99',
                    name: 'Wireless Noise Cancelling Headphones',
                    price: 12999,
                    quantity: 1,
                    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop'
                }
            ]
        },
        {
            id: 'EXC-OVERDUE-911',
            orderId: 'ORD-99112',
            vendorId: 'VEND-991',
            type: 'exchange',
            status: 'inspection_pending',
            receivedAt: new Date(Date.now() - 172800000).toISOString(), // 48 hours ago (OVERDUE)
            requestDate: new Date(Date.now() - 432000000).toISOString(),
            updatedAt: new Date().toISOString(),
            customer: {
                name: 'Deepak Patel',
                email: 'patel.d@example.com',
                phone: '+91 91XXX XXX11',
                address: 'Sector 21, Gandhinagar, Gujarat - 382021'
            },
            items: [
                {
                    id: 'PROD-TAB-02',
                    name: 'iPad Air (M2 Chip, 256GB)',
                    price: 59900,
                    quantity: 1,
                    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=200&h=200&fit=crop'
                }
            ]
        },
        {
            id: 'EXC-FAILED-404',
            orderId: 'ORD-55001',
            vendorId: 'VEND-991',
            type: 'exchange',
            status: 'inspection_rejected',
            refundStatus: 'not_applicable',
            inspectionNotes: 'Item has deep scratches and water damage. Not eligible for exchange.',
            inspectionDate: new Date(Date.now() - 86400000).toISOString(),
            requestDate: new Date(Date.now() - 432000000).toISOString(),
            updatedAt: new Date().toISOString(),
            customer: {
                name: 'Sumit Goyal',
                email: 'sumit.g@example.com',
                phone: '+91 99XXX XXX44',
                address: 'Flat 404, Orchid residency, Pune - 411001'
            },
            items: [
                {
                    id: 'PROD-MOBILE-88',
                    name: 'iPhone 15 Pro (Natural Titanium)',
                    price: 134900,
                    quantity: 1,
                    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d256e?w=200&h=200&fit=crop'
                }
            ]
        },
        {
            id: 'EXC-SHIP-101',
            orderId: 'ORD-77665',
            vendorId: 'VEND-991',
            type: 'exchange',
            status: 'replacement_shipped',
            refundStatus: 'not_applicable',
            replacementOrderId: 'REP-XJ990L',
            forwardTrackingNumber: 'TRK-FWD-88229X-IN',
            requestDate: new Date(Date.now() - 604800000).toISOString(), // 7 days ago
            updatedAt: new Date().toISOString(),
            refundAmount: 0,
            reason: 'Wrong Color',
            description: 'Sent Red instead of Black.',
            customer: {
                name: 'Priya Verma',
                email: 'priya@example.com',
                phone: '+91 95XXX XXX00',
                address: 'Sector 5, Salt Lake, Kolkata - 700091'
            },
            vendor: {
                storeName: 'Premium Electronics',
                phone: '+91 98XXX XXX99',
                address: 'Plot 45, Okhla Phase III, New Delhi - 110020',
                email: 'premium.elec@example.com'
            },
            images: [
                'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop'
            ],
            items: [
                {
                    id: 'PROD-SHOE-01',
                    name: 'Men Run Swift 2 Shoes (Red)',
                    price: 4999,
                    quantity: 1,
                    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop'
                }
            ]
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
            let exchangeResponse = null;
            
            if (role === 'admin') {
                response = await adminService.getAllReturnRequests(apiParams);
                exchangeResponse = await api.get('/exchange/admin', { params: apiParams });
            } else if (role === 'vendor') {
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
                returnRequests: role === 'admin' || role === 'vendor'
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

    fetchReturnRequestById: async (id) => {
        // Check local state first (covers mock IDs like RET- or EXC-)
        const localMatch = get().returnRequests.find(req => String(req.id) === String(id));
        if (localMatch) return localMatch;

        set({ isLoading: true });
        try {
            let response = null;
            try {
                response = await adminService.getReturnRequestById(id);
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
        const req = get().returnRequests.find(r => r.id === id);
        const nextStatus = req?.type === 'exchange' ? 'inspection_pending' : 'delivered_to_seller';
        
        return await get().updateReturnStatus(id, { 
            status: nextStatus, 
            receivedAt: new Date().toISOString() 
        });
    },

    inspectExchangeItem: async (id, result, notes) => {
        set({ isLoading: true });
        const { returnRequests } = get();
        const nextStatus = result === 'approved' ? 'approved' : 'inspection_rejected';
        
        const updatedRequests = returnRequests.map((req) =>
            req.id === id ? { 
                ...req, 
                status: nextStatus, 
                inspectionNotes: notes,
                inspectionDate: new Date().toISOString(),
                updatedAt: new Date().toISOString() 
            } : req
        );

        set({ returnRequests: updatedRequests, isLoading: false });
        toast.success(result === 'approved' ? 'Inspection approved' : 'Inspection rejected');
        return true;
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
