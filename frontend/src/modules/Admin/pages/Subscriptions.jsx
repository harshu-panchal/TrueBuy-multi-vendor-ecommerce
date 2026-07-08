import React, { useState, useEffect, useMemo } from "react";
import {
  FiPlus,
  FiSearch,
  FiEdit,
  FiTrash2,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import { motion } from "framer-motion";
import Button from "./../components/Button";
import Badge from "../../../shared/components/Badge";
import SubscriptionForm from "../components/Subscriptions/SubscriptionForm";
import { useSubscriptionPlanStore } from "../../../shared/store/subscriptionPlanStore";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";

const Subscriptions = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { plans, isLoading, fetchPlans, deletePlan, togglePlanStatus } = useSubscriptionPlanStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  useEffect(() => {
    fetchPlans();
    if (location.pathname.endsWith("/add")) {
      setShowForm(true);
    }
  }, [location.pathname]);

  const filteredPlans = useMemo(() => {
    return plans.filter((plan) =>
      plan.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [plans, searchQuery]);

  const handleCreate = () => {
    setEditingPlan(null);
    setShowForm(true);
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    if (location.pathname.endsWith("/add")) {
      navigate("/admin/subscriptions");
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this subscription plan?")) {
      deletePlan(id);
    }
  };

  const handleToggleStatus = (id, currentStatus) => {
    togglePlanStatus(id, currentStatus);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Subscription Plans
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Manage vendor subscription plans and product limits.
          </p>
        </div>
        <Button onClick={handleCreate} variant="primary" icon={FiPlus}>
          <span className="hidden sm:inline">Add Plan</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="relative w-full max-w-md">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search plans..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Plans Grid */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Loading plans...</div>
        ) : filteredPlans.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No subscription plans found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlans.map((plan) => (
              <div
                key={plan._id}
                className="border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-shadow bg-gray-50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-lg text-gray-800">{plan.name}</h3>
                    <Badge variant={plan.isActive ? "success" : "error"}>
                      {plan.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 min-h-[40px]">
                    {plan.description || "No description provided."}
                  </p>
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Price:</span>
                      <span className="font-semibold text-gray-800">₹{plan.price}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Product Limit:</span>
                      <span className="font-semibold text-gray-800">{plan.productLimit}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Validity:</span>
                      <span className="font-semibold text-gray-800">{plan.validityDays} days</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                  <Button
                    onClick={() => handleToggleStatus(plan._id, plan.isActive)}
                    variant="icon"
                    className="flex-1 text-gray-600"
                    icon={plan.isActive ? FiEyeOff : FiEye}
                    title={plan.isActive ? "Deactivate" : "Activate"}
                  />
                  <Button
                    onClick={() => handleEdit(plan)}
                    variant="iconBlue"
                    className="flex-1"
                    icon={FiEdit}
                  />
                  <Button
                    onClick={() => handleDelete(plan._id)}
                    variant="iconRed"
                    className="flex-1"
                    icon={FiTrash2}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <SubscriptionForm
          plan={editingPlan}
          onClose={handleCloseForm}
        />
      )}
    </motion.div>
  );
};

export default Subscriptions;
