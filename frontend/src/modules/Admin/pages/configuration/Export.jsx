import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUpload, 
  FiPlus, 
  FiX, 
  FiChevronDown, 
  FiInbox,
  FiArrowLeft,
  FiShoppingBag,
  FiGrid
} from 'react-icons/fi';

const ExportProfileModal = ({ isOpen, onClose }) => {
  const [selectedProvider, setSelectedProvider] = useState('Google Merchant Center XML feed');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
      />

      {/* Modal Content */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-xl bg-white rounded-[2rem] shadow-2xl overflow-hidden text-left"
      >
        {/* Header */}
        <div className="p-6 sm:p-8 flex items-center justify-between">
          <h2 className="text-xl font-black text-gray-800 tracking-tight">New profile</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="px-6 sm:px-8 pb-10 space-y-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
              Provider
            </label>
            <div className="relative group">
              <div className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl flex items-center gap-4 shadow-sm group-hover:border-[#6b2bd9]/20 transition-all">
                 <div className="w-12 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-md relative overflow-hidden">
                    <FiShoppingBag size={20} />
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                 </div>
                 <div className="flex-1">
                    <div className="text-sm font-black text-gray-800 tracking-tight leading-none">Google Merchant Center XML feed</div>
                    <div className="text-[9px] font-black text-gray-300 uppercase tracking-widest mt-1">Feeds.GoogleMerchantCenterProductXml</div>
                 </div>
                 <div className="px-2 border-l border-gray-100 text-gray-400">
                    <FiChevronDown size={18} />
                 </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
            <p className="text-xs font-bold text-gray-400 leading-relaxed">
              Allows to export product data in XML feed format of Google Merchant Center (GMC).
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 flex items-center justify-end gap-4 border-t border-gray-100">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-black text-gray-500 hover:text-gray-700 transition-colors uppercase tracking-widest"
          >
            Cancel
          </button>
          <button 
            onClick={onClose}
            className="px-10 py-2.5 bg-[#4a90e2] text-white rounded-xl text-sm font-black uppercase tracking-widest shadow-lg shadow-blue-100/50 hover:bg-[#357abd] transition-all active:scale-95"
          >
            OK
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const Export = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6 pb-20 text-left">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-visible relative">
        {/* Header section synchronized with Plans.jsx */}
        <div className="p-4 border-b border-gray-100 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3 pr-4 border-r border-gray-100">
              <div className="p-2 bg-purple-50 text-[#6b2bd9] rounded-lg shadow-sm">
                <FiUpload size={20} />
              </div>
              <div>
                <h1 className="text-sm font-bold text-gray-600 tracking-tight">Data Management</h1>
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Automated Export Profiles</p>
              </div>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-2.5 bg-[#6b2bd9] text-white rounded-xl hover:bg-[#5b24b7] transition-all text-sm font-bold flex items-center gap-2 shadow-lg shadow-purple-100 active:scale-95"
            >
              <FiPlus size={18} />
              <span>Add New Profile</span>
            </button>
          </div>
        </div>

        {/* Empty State Synchronized with Plans.jsx */}
        <div className="p-0 overflow-x-auto min-h-[500px] flex flex-col items-center justify-center p-24 bg-gray-50/10 space-y-6">
            <div className="p-8 bg-white rounded-full border border-gray-100 shadow-xl shadow-gray-100/50 text-gray-200">
              <FiInbox size={64} />
            </div>
            
            <div className="text-center space-y-2">
              <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">No export profiles found</h3>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest max-w-sm mx-auto leading-relaxed">
                Start by creating your first export provider configuration to begin automated data delivery to external marketplaces.
              </p>
            </div>

            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-8 py-3 bg-white border border-gray-200 text-[#6b2bd9] rounded-2xl hover:bg-gray-50 transition-all text-[10px] font-black shadow-xl shadow-gray-100/50 active:scale-95 flex items-center gap-2 uppercase tracking-widest"
            >
               <FiPlus size={16} />
               <span>Create First Profile</span>
            </button>
        </div>

        {/* Footer Synchronized with Plans.jsx */}
        <div className="p-4 bg-gray-50/10 border-t border-gray-100 flex items-center justify-between">
           <div className="flex items-center gap-4 text-[10px] font-black text-gray-300 uppercase tracking-widest">
              <span>Displaying 0 profiles</span>
           </div>
           <button 
             className="p-2 rounded-xl transition-all border bg-white border-gray-200 text-gray-400 hover:bg-gray-50 active:scale-95 shadow-sm"
           >
              <FiUpload size={18} />
           </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isModalOpen && (
          <ExportProfileModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Export;
