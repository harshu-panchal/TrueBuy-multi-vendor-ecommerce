import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useVendorSubscriptionStore } from "../../../shared/store/vendorSubscriptionStore";
import Button from "../../Admin/components/Button";

const OnboardingSubscription = () => {
  const navigate = useNavigate();
  const {
    availablePlans,
    isLoading,
    fetchAvailablePlans,
    purchasePlan,
  } = useVendorSubscriptionStore();

  useEffect(() => {
    fetchAvailablePlans();
  }, []);

  const handlePurchase = async (planId) => {
    if (window.confirm("Are you sure you want to select this plan?")) {
      const success = await purchasePlan(planId, `test_pay_${Date.now()}`);
      if (success) {
        navigate("/vendor/pending-approval");
      }
    }
  };

  const handleSkip = () => {
    navigate("/vendor/pending-approval");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-8"
      >
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Choose Your Store Plan
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            To complete your onboarding, please select a subscription plan that fits your business needs. You can upgrade or downgrade later.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {isLoading ? (
            <p className="text-center text-gray-500 py-8">Loading available plans...</p>
          ) : availablePlans.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-6">No plans available right now.</p>
              <Button onClick={handleSkip} variant="primary">
                Continue to Review
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {availablePlans.map((plan) => (
                <div key={plan._id} className="border-2 border-primary-100 hover:border-primary-300 rounded-xl p-6 transition-all bg-white relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-primary-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                  <h3 className="font-bold text-2xl text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-6 min-h-[48px]">{plan.description}</p>
                  
                  <div className="mb-6">
                    <span className="text-4xl font-extrabold text-gray-900">₹{plan.price}</span>
                    <span className="text-gray-500"> / {plan.validityDays} days</span>
                  </div>
                  
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-center text-gray-700">
                      <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                      Up to <span className="font-bold mx-1">{plan.productLimit}</span> Products
                    </li>
                    <li className="flex items-center text-gray-700">
                      <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                      Priority Support
                    </li>
                  </ul>

                  <Button 
                    onClick={() => handlePurchase(plan._id)} 
                    variant="primary" 
                    className="w-full py-3 text-lg font-bold shadow-md hover:shadow-lg">
                    Select {plan.name}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="text-center">
            <button onClick={handleSkip} className="text-gray-500 hover:text-gray-700 font-medium underline">
              Skip for now, I'll choose later
            </button>
        </div>
      </motion.div>
    </div>
  );
};

export default OnboardingSubscription;
