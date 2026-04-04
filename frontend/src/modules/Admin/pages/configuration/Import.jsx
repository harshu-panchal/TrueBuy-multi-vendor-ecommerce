import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiDownload, 
  FiPlus, 
  FiX, 
  FiChevronDown, 
  FiFilePlus,
  FiInbox,
  FiArrowLeft
} from 'react-icons/fi';

const ImportProfileModal = ({ isOpen, onClose }) => {
  const [selectedObject, setSelectedObject] = useState('Newsletter Subscriber');

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
        <div className="px-6 sm:px-8 pb-10 space-y-8">
          <p className="text-xs font-semibold text-gray-400">
            Please select the import object and upload an import file.
          </p>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
              Object
            </label>
            <div className="relative">
              <select 
                value={selectedObject}
                onChange={(e) => setSelectedObject(e.target.value)}
                className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] outline-none shadow-sm appearance-none cursor-pointer"
              >
                <option value="Newsletter Subscriber">Newsletter Subscriber</option>
                <option value="Product">Product</option>
                <option value="Customer">Customer</option>
                <option value="Category">Category</option>
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <FiChevronDown size={18} />
              </div>
            </div>
          </div>

          <div className="space-y-2">
             <div className="w-full p-8 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-3 group hover:border-[#6b2bd9]/50 transition-all cursor-pointer bg-gray-50/50">
                <div className="p-3 bg-white rounded-xl shadow-sm text-gray-300 group-hover:text-[#6b2bd9] transition-colors">
                   <FiFilePlus size={24} />
                </div>
                <span className="text-sm font-bold text-gray-400 group-hover:text-gray-500 transition-colors">Upload import file...</span>
             </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 flex items-center justify-end gap-4">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-black text-gray-500 hover:text-gray-700 transition-colors uppercase tracking-widest"
          >
            Cancel
          </button>
          <button 
            onClick={onClose}
            className="px-10 py-2.5 bg-[#a5c0d9] text-white rounded-xl text-sm font-black uppercase tracking-widest shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            OK
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const Import = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6 pb-20 text-left">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-visible relative">
        {/* Header section synchronized with Plans.jsx */}
        <div className="p-4 border-b border-gray-100 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3 pr-4 border-r border-gray-100">
              <div className="p-2 bg-purple-50 text-[#6b2bd9] rounded-lg shadow-sm">
                <FiDownload size={20} />
              </div>
              <div>
                <h1 className="text-sm font-bold text-gray-600 tracking-tight">Data Management</h1>
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Automated Import Profiles</p>
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
              <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">No import profiles found</h3>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest max-w-sm mx-auto leading-relaxed">
                Start by creating your first ingestion profile to begin automated data synchronization across your platform nodes.
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
              <FiDownload size={18} />
           </button>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <ImportProfileModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Import;
