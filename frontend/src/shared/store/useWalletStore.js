import { create } from 'zustand';
import api from '../utils/api';
import toast from 'react-hot-toast';

export const useWalletStore = create((set, get) => ({
  balance: 0,
  transactions: [],
  loading: false,
  error: null,

  fetchWallet: async () => {
    try {
      set({ loading: true, error: null });
      const response = await api.get('/user/wallet');
      if (response.success) {
        set({ 
          balance: response.data.balance, 
          transactions: response.data.transactions,
          loading: false 
        });
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch wallet data';
      set({ error: message, loading: false });
      toast.error(message);
    }
  },
  
  clearWallet: () => {
    set({ balance: 0, transactions: [], loading: false, error: null });
  },

  requestWithdrawal: async (amount, bankDetails) => {
    try {
      const response = await api.post('/user/wallet/withdraw', { amount, bankDetails });
      if (response.success) {
        toast.success('Withdrawal request submitted successfully');
        await get().fetchWallet(); // Refresh wallet data
        return response.data;
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to request withdrawal';
      toast.error(message);
      throw error;
    }
  }
}));
