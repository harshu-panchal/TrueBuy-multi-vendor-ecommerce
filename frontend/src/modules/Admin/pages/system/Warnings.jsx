import React from 'react';
import { motion } from 'framer-motion';
import { 
  FiCheck, 
  FiAlertCircle, 
  FiAlertTriangle,
  FiActivity
} from 'react-icons/fi';

const warningsData = [
  {
    type: 'info',
    text: "Specified store URL (http://localhost:5000/) doesn't match this store URL (https://www.trubuyonline.com/)",
  },
  {
    type: 'success',
    text: "The task scheduler can poll and execute tasks.",
  },
  {
    type: 'success',
    text: "The sitemap for the store is reachable.",
  },
  {
    type: 'success',
    text: "Primary exchange rate currency is set",
  },
  {
    type: 'error',
    text: "Primary exchange rate currency. The rate should be set to 1.",
  },
  {
    type: 'success',
    text: "Primary store currency is set",
  },
  {
    type: 'success',
    text: "Default weight is set",
  },
  {
    type: 'success',
    text: "Default dimension is set",
  },
  {
    type: 'success',
    text: "Payment methods are OK",
  },
  {
    type: 'success',
    text: "All directory permissions are OK",
  },
  {
    type: 'success',
    text: "All file permissions are OK",
  },
  {
    type: 'success',
    text: "All hash codes of attribute combinations have been set.",
  }
];

const Warnings = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-20 text-left max-w-5xl mx-auto"
    >
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h3 className="text-[11px] font-bold uppercase text-gray-500 tracking-widest flex items-center gap-2">
            <FiActivity className="text-primary-500" /> Diagnostics Matrix
          </h3>
        </div>

        <div className="p-2 sm:p-4">
          <div className="flex flex-col gap-1">
            {warningsData.map((item, index) => {
              let Icon = FiCheck;
              let iconClass = "text-emerald-500";
              let textClass = "text-gray-600";
              let bgClass = "hover:bg-gray-50";

              if (item.type === 'error') {
                Icon = FiAlertTriangle;
                iconClass = "text-red-500";
                textClass = "text-red-600 font-bold";
                bgClass = "bg-red-50/30 hover:bg-red-50";
              } else if (item.type === 'info') {
                Icon = FiAlertCircle;
                iconClass = "text-teal-500";
                bgClass = "hover:bg-gray-50";
              }

              return (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={index}
                  className={`flex items-start sm:items-center gap-4 p-4 rounded-xl transition-colors cursor-default ${bgClass}`}
                >
                  <div className={`mt-0.5 sm:mt-0 shrink-0 ${iconClass}`}>
                    <Icon size={18} strokeWidth={item.type === 'success' ? 3 : 2.5} />
                  </div>
                  <span className={`text-sm tracking-tight leading-snug ${textClass}`}>
                    {item.text}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
        
        {/* Footer info */}
        <div className="bg-gray-50 border-t border-gray-100 px-6 py-4 flex items-center justify-between">
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-200" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">Engine health nominal</span>
           </div>
           <div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">Last checked: Just now</span>
           </div>
        </div>
      </div>
      
    </motion.div>
  );
};

export default Warnings;
