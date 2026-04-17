import api from '../../../shared/utils/api';

// Products
export const getWholesaleProducts = (params = {}) =>
  api.get('/b2b/products', { params });

// Cart
export const getB2BCart = (sellerVendorId) =>
  api.get('/b2b/cart', { params: { sellerVendorId } });

export const addB2BCartItem = (payload) =>
  api.post('/b2b/cart/items', payload);

export const updateB2BCartItem = (payload) =>
  api.patch('/b2b/cart/items', payload);

export const removeB2BCartItem = (payload) =>
  api.delete('/b2b/cart/items', { data: payload });

export const clearB2BCart = (sellerVendorId) =>
  api.delete('/b2b/cart', { params: { sellerVendorId } });

// Orders
export const placeB2BOrder = (payload) =>
  api.post('/b2b/orders', payload);

export const getB2BOrders = (params = {}) =>
  api.get('/b2b/orders', { params });

export const getB2BOrderById = (id) =>
  api.get(`/b2b/orders/${id}`);

export const respondToB2BOrder = (id, action, reason = '') =>
  api.patch(`/b2b/orders/${id}/respond`, { action, reason });

