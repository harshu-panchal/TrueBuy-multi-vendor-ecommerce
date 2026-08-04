import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { adminLogin as apiLogin } from '../services/adminService';
import api from '../../../shared/utils/api';

export const useAdminAuthStore = create(
  persist(
    (set) => ({
      admin: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      // Admin login — calls real backend
      login: async (email, password, rememberMe = true) => {
        set({ isLoading: true });
        try {
          const response = await apiLogin(email, password);
          const { accessToken, refreshToken, admin } = response.data;

          const targetStorage = rememberMe ? localStorage : sessionStorage;
          const otherStorage = rememberMe ? sessionStorage : localStorage;

          targetStorage.setItem('adminToken', accessToken);
          targetStorage.setItem('adminRefreshToken', refreshToken);
          otherStorage.removeItem('adminToken');
          otherStorage.removeItem('adminRefreshToken');

          set({
            admin,
            token: accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });

          return { success: true, admin };
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // Admin logout
      logout: () => {
        const refreshToken =
          localStorage.getItem('adminRefreshToken') ||
          sessionStorage.getItem('adminRefreshToken');
        if (refreshToken) {
          api.post('/admin/auth/logout', { refreshToken }).catch(() => {});
        }

        set({ admin: null, token: null, refreshToken: null, isAuthenticated: false });
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminRefreshToken');
        sessionStorage.removeItem('adminToken');
        sessionStorage.removeItem('adminRefreshToken');
      },
    }),
    {
      name: 'admin-auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
