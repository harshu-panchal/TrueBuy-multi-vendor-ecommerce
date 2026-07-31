import React from "react";
import { motion } from "framer-motion";
import { FiClock, FiLogOut } from "react-icons/fi";
import { useVendorAuthStore } from "../store/vendorAuthStore";

const PendingApproval = () => {
  const { logout } = useVendorAuthStore();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden"
      >
        <div className="bg-yellow-400 p-8 flex justify-center">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-inner">
            <FiClock className="w-12 h-12 text-yellow-500" />
          </div>
        </div>
        
        <div className="p-8 text-center space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Account Under Review</h1>
            <p className="text-gray-600">
              Thank you for completing your onboarding! Your store application is currently pending admin approval.
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-600 border border-gray-100">
            We will notify you via email once your account has been reviewed. This typically takes 1-2 business days.
          </div>

          <div className="flex flex-col gap-3 mt-4">
            <button
              onClick={async () => {
                const res = await useVendorAuthStore.getState().fetchProfile();
                if (res?.vendor?.status === 'approved') {
                  window.location.href = '/vendor/dashboard';
                } else if (res?.vendor?.status === 'rejected') {
                  alert('Your application was rejected. Please contact support.');
                } else {
                  alert('Your account is still under review.');
                }
              }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-yellow-400 text-white rounded-xl font-bold hover:bg-yellow-500 transition-colors shadow-md"
            >
              Check Approval Status
            </button>

            <button
              onClick={() => logout()}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              <FiLogOut />
              Log Out
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PendingApproval;
