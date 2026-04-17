import { create } from 'zustand';
import toast from 'react-hot-toast';
import {
  getWholesaleProducts,
  getB2BCart,
  addB2BCartItem,
  updateB2BCartItem,
  removeB2BCartItem,
  clearB2BCart,
  placeB2BOrder,
  getB2BOrders,
  getB2BOrderById,
  respondToB2BOrder,
} from '../services/b2bService';

export const useVendorB2BStore = create((set, get) => ({
  // Marketplace products
  products: [],
  totalProducts: 0,
  productsPage: 1,
  productsPages: 1,
  productsLoading: false,

  // Seller context + cart
  activeSellerVendorId: '',
  cart: null,
  cartLoading: false,
  cartSaving: false,

  // Orders (buy/sell)
  orders: [],
  totalOrders: 0,
  ordersPage: 1,
  ordersPages: 1,
  ordersLoading: false,
  orderDetail: null,
  orderDetailLoading: false,

  setActiveSeller: (sellerVendorId) => {
    set({ activeSellerVendorId: String(sellerVendorId || '') });
  },

  // Products
  fetchWholesaleProducts: async (params = {}) => {
    set({ productsLoading: true });
    try {
      const res = await getWholesaleProducts(params);
      const data = res?.data ?? res;
      set({
        products: data?.products ?? [],
        totalProducts: data?.total ?? 0,
        productsPage: data?.page ?? 1,
        productsPages: data?.pages ?? 1,
        productsLoading: false,
      });
    } catch {
      set({ productsLoading: false });
    }
  },

  // Cart
  fetchCart: async (sellerVendorId) => {
    const seller = String(sellerVendorId || get().activeSellerVendorId || '');
    if (!seller) {
      set({ cart: null });
      return null;
    }
    set({ cartLoading: true, activeSellerVendorId: seller });
    try {
      const res = await getB2BCart(seller);
      const cart = res?.data ?? res;
      set({ cart: cart || null, cartLoading: false });
      return cart || null;
    } catch {
      set({ cartLoading: false });
      return null;
    }
  },

  addToCart: async ({ sellerVendorId, productId, quantity, variant, variantKey }) => {
    const seller = String(sellerVendorId || get().activeSellerVendorId || '');
    if (!seller) {
      toast.error('Select a seller first.');
      return null;
    }
    set({ cartSaving: true, activeSellerVendorId: seller });
    try {
      const res = await addB2BCartItem({
        sellerVendorId: seller,
        productId,
        quantity,
        variant,
        variantKey,
      });
      const cart = res?.data ?? res;
      set({ cart: cart || null, cartSaving: false });
      toast.success('Added to B2B cart');
      return cart || null;
    } catch {
      set({ cartSaving: false });
      return null;
    }
  },

  updateCartItem: async ({ sellerVendorId, productId, quantity, variant, variantKey }) => {
    const seller = String(sellerVendorId || get().activeSellerVendorId || '');
    if (!seller) return null;
    set({ cartSaving: true, activeSellerVendorId: seller });
    try {
      const res = await updateB2BCartItem({
        sellerVendorId: seller,
        productId,
        quantity,
        variant,
        variantKey,
      });
      const cart = res?.data ?? res;
      set({ cart: cart || null, cartSaving: false });
      return cart || null;
    } catch {
      set({ cartSaving: false });
      return null;
    }
  },

  removeCartItem: async ({ sellerVendorId, productId, variantKey }) => {
    const seller = String(sellerVendorId || get().activeSellerVendorId || '');
    if (!seller) return false;
    set({ cartSaving: true, activeSellerVendorId: seller });
    try {
      const res = await removeB2BCartItem({
        sellerVendorId: seller,
        productId,
        variantKey,
      });
      const cart = res?.data ?? res;
      set({ cart: cart || null, cartSaving: false });
      toast.success('Removed from cart');
      return true;
    } catch {
      set({ cartSaving: false });
      return false;
    }
  },

  clearCart: async (sellerVendorId) => {
    const seller = String(sellerVendorId || get().activeSellerVendorId || '');
    if (!seller) return false;
    set({ cartSaving: true, activeSellerVendorId: seller });
    try {
      await clearB2BCart(seller);
      set({ cart: null, cartSaving: false });
      toast.success('Cart cleared');
      return true;
    } catch {
      set({ cartSaving: false });
      return false;
    }
  },

  placeOrder: async ({ sellerVendorId, buyerNote }) => {
    const seller = String(sellerVendorId || get().activeSellerVendorId || '');
    if (!seller) return null;
    set({ cartSaving: true, activeSellerVendorId: seller });
    try {
      const res = await placeB2BOrder({ sellerVendorId: seller, buyerNote });
      const order = res?.data ?? res;
      set({ cart: null, cartSaving: false });
      toast.success('B2B order placed');
      return order || null;
    } catch {
      set({ cartSaving: false });
      return null;
    }
  },

  // Orders
  fetchOrders: async (params = {}) => {
    set({ ordersLoading: true });
    try {
      const res = await getB2BOrders(params);
      const data = res?.data ?? res;
      set({
        orders: data?.orders ?? [],
        totalOrders: data?.total ?? 0,
        ordersPage: data?.page ?? 1,
        ordersPages: data?.pages ?? 1,
        ordersLoading: false,
      });
    } catch {
      set({ ordersLoading: false });
    }
  },

  fetchOrderDetail: async (id) => {
    if (!id) return null;
    set({ orderDetailLoading: true });
    try {
      const res = await getB2BOrderById(id);
      const order = res?.data ?? res;
      set({ orderDetail: order || null, orderDetailLoading: false });
      return order || null;
    } catch {
      set({ orderDetailLoading: false });
      return null;
    }
  },

  respondToOrder: async ({ id, action, reason }) => {
    if (!id) return null;
    set({ ordersLoading: true });
    try {
      const res = await respondToB2BOrder(id, action, reason);
      const updated = res?.data ?? res;
      set((state) => ({
        orders: (state.orders || []).map((o) =>
          String(o?._id || o?.orderNumber) === String(updated?._id || updated?.orderNumber)
            ? updated
            : o
        ),
        orderDetail: state.orderDetail && (String(state.orderDetail?._id) === String(updated?._id) ? updated : state.orderDetail),
        ordersLoading: false,
      }));
      toast.success(action === 'accept' ? 'Order accepted' : 'Order rejected');
      return updated || null;
    } catch {
      set({ ordersLoading: false });
      return null;
    }
  },

  resetB2B: () =>
    set({
      products: [],
      totalProducts: 0,
      productsPage: 1,
      productsPages: 1,
      productsLoading: false,
      activeSellerVendorId: '',
      cart: null,
      cartLoading: false,
      cartSaving: false,
      orders: [],
      totalOrders: 0,
      ordersPage: 1,
      ordersPages: 1,
      ordersLoading: false,
      orderDetail: null,
      orderDetailLoading: false,
    }),
}));

