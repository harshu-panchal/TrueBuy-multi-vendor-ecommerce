import React from 'react';
import { FiCheck, FiClock, FiTruck, FiPackage, FiArrowLeft, FiX } from 'react-icons/fi';

const ReturnTimeline = ({ currentStatus, role = 'user' }) => {
  const steps = [
    {
      id: 'requested',
      label: 'Return',
      icon: FiClock,
      status: ['pending', 'approved', 'processing', 'picked_up', 'delivered_to_seller', 'completed', 'refunded'].includes(currentStatus) ? 'completed' : 'pending',
    },
    {
      id: 'approved',
      label: 'Approved',
      icon: FiCheck,
      status: currentStatus === 'rejected' ? 'rejected' : ['approved', 'processing', 'picked_up', 'delivered_to_seller', 'completed', 'refunded'].includes(currentStatus) ? 'completed' : 'pending',
    },
    {
      id: 'pickup',
      label: 'Pickup',
      icon: FiPackage,
      status: ['picked_up', 'delivered_to_seller', 'completed', 'refunded'].includes(currentStatus) ? 'completed' : 'pending',
    },
    {
      id: 'refund_completed',
      label: 'Refund Completed',
      icon: FiCheck,
      status: ['completed', 'refunded'].includes(currentStatus) ? 'completed' : 'pending',
    },
  ];

  // Filter steps based on role
  const visibleSteps = role === 'user' ? steps.filter(step => !step.hiddenForUser) : steps;

  return (
    <div className="w-full py-6">
      <div className="flex items-start justify-between relative px-2">
        {/* Connector Line */}
        <div className="absolute top-5 left-8 right-8 h-0.5 bg-gray-200 z-0" />
        
        {visibleSteps.map((step, index) => {
          const StepIcon = step.icon;
          const isCompleted = step.status === 'completed';
          const isRejected = step.status === 'rejected';
          const isCurrent = (index < visibleSteps.length - 1 && visibleSteps[index + 1].status === 'pending' && step.status === 'completed') || 
                            (index === visibleSteps.length - 1 && step.status === 'completed');

          return (
            <div key={step.id} className="flex flex-col items-center relative z-10 flex-1">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                  isCompleted 
                    ? 'bg-success-500 border-success-500 text-white shadow-glow-success' 
                    : isRejected 
                      ? 'bg-discount-500 border-discount-500 text-white shadow-glow-error'
                      : 'bg-white border-gray-300 text-gray-400'
                }`}
              >
                {isRejected ? <FiX className="text-xl" /> : <StepIcon className="text-xl" />}
              </div>
              <span className={`mt-2 text-[10px] font-bold text-center px-1 max-w-[80px] ${
                isCompleted ? 'text-success-600' : isRejected ? 'text-discount-600' : 'text-gray-500'
              }`}>
                {isRejected ? 'Rejected' : step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReturnTimeline;
