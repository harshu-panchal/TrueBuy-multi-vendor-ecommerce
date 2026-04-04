import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FiArrowLeft, 
  FiRefreshCw, 
  FiCheck, 
  FiClock, 
  FiHash,
  FiEdit3,
  FiCalendar
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const SetUpLevel = () => {
  const navigate = useNavigate();
  const [upLevelId, setUpLevelId] = useState('TL000002');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = () => {
    setIsUpdating(true);
    // Simulate API call
    setTimeout(() => {
      setIsUpdating(false);
      // Success logic here
    }, 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-20 max-w-4xl"
    >
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-10 lg:p-14 space-y-12">
          {/* Main Input Section */}
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                <FiHash className="text-gray-300" /> UpLevelId
              </label>
              <div className="relative group">
                <input
                  type="text"
                  value={upLevelId}
                  onChange={(e) => setUpLevelId(e.target.value)}
                  className="w-full px-6 py-4 bg-gray-50/30 border border-gray-100 rounded-2xl text-base font-black focus:ring-4 focus:ring-[#6b2bd9]/5 focus:border-[#6b2bd9] focus:bg-white outline-none transition-all placeholder:text-gray-300 shadow-inner group-hover:border-gray-200"
                  placeholder="e.g., TL000001"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-200 group-focus-within:text-[#6b2bd9] transition-colors">
                   <FiEdit3 size={18} />
                </div>
              </div>
            </div>

            {/* Metadata Section - Styled beautifully */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
               <div className="flex items-center gap-3 p-4 bg-gray-50/50 rounded-2xl border border-gray-100/50 group hover:bg-white hover:border-[#6b2bd9]/10 transition-all">
                  <div className="p-2.5 bg-white rounded-xl shadow-sm text-gray-400 group-hover:text-blue-500 transition-colors">
                     <FiCalendar size={14} />
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Created On</p>
                    <p className="text-[10px] font-bold text-gray-600 mt-0.5">2/16/2026 12:30:02 AM</p>
                  </div>
               </div>
               <div className="flex items-center gap-3 p-4 bg-gray-50/50 rounded-2xl border border-gray-100/50 group hover:bg-white hover:border-[#6b2bd9]/10 transition-all">
                  <div className="p-2.5 bg-white rounded-xl shadow-sm text-gray-400 group-hover:text-green-500 transition-colors">
                     <FiClock size={14} />
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Last Updated</p>
                    <p className="text-[10px] font-bold text-gray-600 mt-0.5">2/17/2026 6:45:52 PM</p>
                  </div>
               </div>
            </div>
          </div>

          {/* Action Buttons consistent with the provided image layout but in our theme */}
          <div className="flex items-center justify-between pt-8 border-t border-gray-50">
            <button 
              onClick={() => navigate(-1)}
              className="px-8 py-3 bg-white border border-gray-200 text-gray-500 rounded-2xl hover:bg-gray-50 transition-all text-xs font-black uppercase tracking-widest flex items-center gap-2 active:scale-95 shadow-sm"
            >
              <FiArrowLeft size={16} />
              <span>Back</span>
            </button>
            <button 
              onClick={handleUpdate}
              disabled={isUpdating}
              className="px-10 py-3 bg-[#10b981] text-white rounded-2xl hover:bg-[#059669] transition-all text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-emerald-100 active:scale-95 disabled:opacity-50"
            >
              {isUpdating ? <FiRefreshCw className="animate-spin" size={16} /> : <FiCheck size={16} />}
              <span>Update</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SetUpLevel;
