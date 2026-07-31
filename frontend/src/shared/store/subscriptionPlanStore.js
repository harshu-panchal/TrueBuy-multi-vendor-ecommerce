import { create } from "zustand";
import api from "../utils/api";
import toast from "react-hot-toast";

export const useSubscriptionPlanStore = create((set, get) => ({
  plans: [],
  isLoading: false,

  fetchPlans: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get("/admin/subscription-plans");
      set({ plans: response.data });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch subscription plans"
      );
    } finally {
      set({ isLoading: false });
    }
  },

  createPlan: async (data) => {
    try {
      const response = await api.post("/admin/subscription-plans", data);
      toast.success("Subscription plan created successfully");
      await get().fetchPlans();
      return true;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create subscription plan"
      );
      return false;
    }
  },

  updatePlan: async (id, data) => {
    try {
      const response = await api.put(`/admin/subscription-plans/${id}`, data);
      toast.success("Subscription plan updated successfully");
      await get().fetchPlans();
      return true;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update subscription plan"
      );
      return false;
    }
  },

  deletePlan: async (id) => {
    try {
      await api.delete(`/admin/subscription-plans/${id}`);
      toast.success("Subscription plan deleted successfully");
      await get().fetchPlans();
      return true;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete subscription plan"
      );
      return false;
    }
  },

  togglePlanStatus: async (id, currentStatus) => {
    try {
      await api.put(`/admin/subscription-plans/${id}`, {
        isActive: !currentStatus,
      });
      toast.success(`Plan ${!currentStatus ? 'activated' : 'deactivated'}`);
      await get().fetchPlans();
      return true;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update plan status"
      );
      return false;
    }
  },
}));
