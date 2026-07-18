import { create } from "zustand";
import api from "../utils/api";
import toast from "react-hot-toast";

export const useVendorSubscriptionStore = create((set, get) => ({
  availablePlans: [],
  mySubscriptions: [],
  usage: null,
  isLoading: false,

  fetchAvailablePlans: async () => {
    set({ isLoading: true });
    try {
      // const response = await api.get("/vendor/subscription-plans");
      // set({ availablePlans: response.data });
      set({ availablePlans: [] });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch plans");
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMySubscriptions: async () => {
    set({ isLoading: true });
    try {
      // const response = await api.get("/vendor/subscriptions");
      // set({ mySubscriptions: response.data });
      set({ mySubscriptions: [] });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch subscriptions");
    } finally {
      set({ isLoading: false });
    }
  },

  fetchUsage: async () => {
    try {
      // const response = await api.get("/vendor/subscription/usage");
      // set({ usage: response.data });
      set({ usage: null });
    } catch (error) {
      console.error("Failed to fetch subscription usage", error);
    }
  },

  purchasePlan: async (planId, paymentId) => {
    set({ isLoading: true });
    try {
      // await api.post("/vendor/subscription/purchase", { planId, paymentId });
      toast.success("Subscription purchased successfully");
      await get().fetchMySubscriptions();
      await get().fetchUsage();
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to purchase plan");
      return false;
    } finally {
      set({ isLoading: false });
    }
  },
}));
