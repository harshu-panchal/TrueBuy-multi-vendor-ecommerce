import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useVendorSubscriptionStore } from "../../../shared/store/vendorSubscriptionStore";
import Button from "../../Admin/components/Button";
import Badge from "../../../shared/components/Badge";

const Subscriptions = () => {
  const {
    availablePlans,
    mySubscriptions,
    usage,
    isLoading,
    fetchAvailablePlans,
    fetchMySubscriptions,
    fetchUsage,
    purchasePlan,
  } = useVendorSubscriptionStore();

  useEffect(() => {
    fetchAvailablePlans();
    fetchMySubscriptions();
    fetchUsage();
  }, []);

  const handlePurchase = async (planId) => {
    if (window.confirm("Are you sure you want to purchase this plan?")) {
      // In a real implementation, you would integrate a payment gateway (Razorpay/Stripe) here.
      // For this implementation, we simulate a successful payment.
      await purchasePlan(planId, `test_pay_${Date.now()}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6">
      
      {/* Header & Usage Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            My Subscriptions
          </h1>
          <p className="text-gray-600">
            Manage your subscription plans and product limits.
          </p>
        </div>

        {usage && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex gap-6">
            <div>
              <p className="text-sm text-gray-500">Allowed Products</p>
              <p className="text-xl font-bold text-gray-800">{usage.allowedProducts}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Current Products</p>
              <p className="text-xl font-bold text-blue-600">{usage.currentProducts}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Remaining</p>
              <p className={`text-xl font-bold ${usage.remainingProducts > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {usage.remainingProducts}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Active Subscriptions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-800 mb-4">My Plans</h2>
          {isLoading ? (
            <p className="text-gray-500">Loading...</p>
          ) : mySubscriptions.length === 0 ? (
            <p className="text-gray-500">You don't have any subscriptions yet.</p>
          ) : (
            <div className="space-y-4">
              {mySubscriptions.map((sub) => {
                const isActive = sub.isActive && new Date(sub.expiryDate) > new Date();
                return (
                  <div key={sub._id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-gray-800">
                          {sub.subscriptionPlan?.name || "Unknown Plan"}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Purchased: {new Date(sub.purchaseDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={isActive ? "success" : "error"}>
                        {isActive ? "Active" : "Expired/Inactive"}
                      </Badge>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Product Limit: </span>
                        <span className="font-medium text-gray-800">+{sub.productLimit}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Expires: </span>
                        <span className="font-medium text-gray-800">
                          {new Date(sub.expiryDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Available Plans */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Available Plans to Purchase</h2>
          {isLoading ? (
            <p className="text-gray-500">Loading...</p>
          ) : availablePlans.length === 0 ? (
            <p className="text-gray-500">No plans available at the moment.</p>
          ) : (
            <div className="space-y-4">
              {availablePlans.map((plan) => (
                <div key={plan._id} className="border border-primary-200 rounded-lg p-4 bg-primary-50/30">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-lg text-primary-900">{plan.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{plan.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-xl text-primary-700">₹{plan.price}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <div>
                      <span className="font-semibold text-gray-800">{plan.productLimit}</span> Products
                    </div>
                    <div>
                      <span className="font-semibold text-gray-800">{plan.validityDays}</span> Days Validity
                    </div>
                  </div>

                  <Button 
                    onClick={() => handlePurchase(plan._id)} 
                    variant="primary" 
                    className="w-full">
                    Purchase Plan
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </motion.div>
  );
};

export default Subscriptions;
