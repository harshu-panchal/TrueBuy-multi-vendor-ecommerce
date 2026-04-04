import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSearch, 
  FiFilter, 
  FiCreditCard, 
  FiCheck, 
  FiMinus, 
  FiArrowLeft, 
  FiSave, 
  FiType, 
  FiPercent, 
  FiFileText, 
  FiSettings,
  FiPackage
} from 'react-icons/fi';

const StackedCardsIcon = ({ active, isCOD }) => (
  <div className="relative w-12 h-10 flex items-center justify-center">
    {isCOD ? (
       <div className={`p-2.5 rounded-xl ${active ? 'bg-orange-50 text-orange-500 shadow-orange-100' : 'bg-gray-100 text-gray-400'} shadow-sm transition-all duration-500`}>
          <FiPackage size={24} />
       </div>
    ) : (
      <>
        <div className={`absolute left-0 bottom-0 w-8 h-6 rounded-md border-2 ${active ? 'bg-blue-400 border-blue-500' : 'bg-gray-200 border-gray-300'} transform -rotate-6 transition-all duration-500`} />
        <div className={`absolute right-0 top-0 w-8 h-6 rounded-md border-2 ${active ? 'bg-emerald-400 border-emerald-500 shadow-sm' : 'bg-gray-300 border-gray-400'} transition-all duration-500`} />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
           <div className={`w-4 h-1 rounded-full ${active ? 'bg-white/40' : 'bg-black/10'}`} />
        </div>
      </>
    )}
  </div>
);

const PaymentMethodCard = ({ method, onToggle, onConfigure }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const isCOD = method.paymentId === 'Payments.CashOnDelivery';
  const features = [
    { key: 'recurring', label: 'Recurring payments' },
    { key: 'capture', label: 'Supports capture' },
    { key: 'refund', label: 'Supports refund' },
    { key: 'partialRefund', label: 'Supports partial refund' },
    { key: 'void', label: 'Supports void' },
  ];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-purple-500/5 transition-all flex flex-col overflow-hidden group relative"
    >
      {/* Top Content */}
      <div className="p-8 flex-1 space-y-4">
        <div className="flex items-center gap-6">
          <StackedCardsIcon active={method.active} isCOD={isCOD} />
          <div className="space-y-2.5">
             <h3 className="text-xl font-bold text-[#0f172a] tracking-tight leading-none group-hover:text-[#6b2bd9] transition-colors">
               {method.name}
             </h3>
             <p className="text-[11px] font-bold text-gray-400">
               ID: <span className="opacity-70">{method.paymentId}</span>
             </p>
          </div>
        </div>

        <div className="space-y-3">
           {features.map((feature) => {
             const isSupported = method.features[feature.key];
             return (
               <div key={feature.key} className="flex items-center gap-4">
                  <div className={`flex items-center justify-center w-4 h-4 transition-colors`}>
                    {isSupported ? (
                      <FiCheck size={14} className="text-emerald-500 stroke-[4]" />
                    ) : (
                      <FiMinus size={14} className="text-gray-400" />
                    )}
                  </div>
                  <span className={`text-[12px] font-bold tracking-tight transition-colors ${isSupported ? 'text-gray-800' : 'text-gray-500'}`}>
                    {feature.label} {isSupported && method.featureDetails?.[feature.key] && (
                      <span className="text-gray-500 font-medium text-[11px]">({method.featureDetails[feature.key]})</span>
                    )}
                  </span>
               </div>
             );
           })}
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="px-8 py-5 bg-gray-50/30 border-t border-gray-100 flex items-center justify-between relative">
        <div className="flex items-center gap-6">
           <div className={`w-3.5 h-3.5 rounded-full shadow-inner ${method.active ? 'bg-orange-400 shadow-orange-600/20 animate-pulse' : 'bg-gray-200'}`} />
           <button 
             onClick={() => onToggle(method.id)}
             className={`px-7 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border border-transparent ${
               method.active 
               ? 'bg-white text-gray-600 hover:bg-gray-100 hover:border-gray-200 shadow-sm' 
               : 'bg-[#6b2bd9] text-white hover:bg-[#5b24b7] shadow-lg shadow-purple-200'
             }`}
           >
             {method.active ? 'Deactivate' : 'Activate'}
           </button>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className={`p-2.5 transition-all relative z-20 ${showDropdown ? 'text-[#6b2bd9] bg-white shadow-sm rounded-xl' : 'text-gray-400 hover:text-[#6b2bd9]'}`}
          >
            <FiSettings size={22} className={`${showDropdown ? 'rotate-90' : ''} transition-transform duration-500`} />
          </button>

          <AnimatePresence>
            {showDropdown && (
              <>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-10"
                  onClick={() => setShowDropdown(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-2xl shadow-xl shadow-purple-900/10 border border-gray-100 overflow-hidden z-20 overflow-hidden"
                >
                  <button 
                    onClick={() => { onConfigure(method); setShowDropdown(false); }}
                    className="w-full px-5 py-3.5 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors group/item"
                  >
                    <div className="p-1.5 bg-blue-50 text-blue-500 rounded-lg group-hover/item:bg-blue-500 group-hover/item:text-white transition-all">
                      <FiSettings size={14} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-800">Edit</p>
                      <p className="text-[9px] text-gray-400 font-medium tracking-tight">Basic information</p>
                    </div>
                  </button>
                  <button 
                    onClick={() => { onConfigure(method); setShowDropdown(false); }}
                    className="w-full px-5 py-3.5 flex items-center gap-3 text-left border-t border-gray-50 hover:bg-gray-50 transition-colors group/item"
                  >
                    <div className="p-1.5 bg-purple-50 text-[#6b2bd9] rounded-lg group-hover/item:bg-[#6b2bd9] group-hover/item:text-white transition-all">
                      <FiSettings size={14} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-800">Configure</p>
                      <p className="text-[9px] text-gray-400 font-medium tracking-tight">Advanced settings</p>
                    </div>
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

const PaymentMethodForm = ({ method, onBack, onSave }) => {
  const [formData, setFormData] = useState({
    name: method.name || '',
    friendlyName: method.friendlyName || '',
    additionalFee: method.additionalFee || 0,
    instructions: method.instructions || '',
    ...method
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6 pb-20"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-gray-400 hover:text-[#6b2bd9] shadow-sm active:scale-95"
          >
            <FiArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Configure {formData.name}
            </h1>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.2em] mt-1">
              Gateway Infrastructure & Transaction Flow
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => onSave(formData, true)}
            className="px-6 py-2.5 bg-white border border-[#6b2bd9]/20 text-[#6b2bd9] rounded-xl hover:bg-purple-50 transition-all text-sm font-bold flex items-center gap-2 active:scale-95 shadow-sm"
          >
            <FiSave size={16} />
            <span>Save and Continue Edit</span>
          </button>
          <button 
            onClick={() => onSave(formData, false)}
            className="px-8 py-2.5 bg-[#6b2bd9] text-white rounded-xl hover:bg-[#5b24b7] transition-all text-sm font-bold flex items-center gap-2 shadow-lg shadow-purple-200/50 active:scale-95"
          >
            <FiCheck size={18} />
            <span>Save</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-sm overflow-hidden p-8 lg:p-12 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
           <div className="space-y-2">
             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
               <FiType className="text-gray-300" /> Friendly Name
             </label>
             <input
               type="text"
               value={formData.friendlyName}
               onChange={(e) => setFormData({ ...formData, friendlyName: e.target.value })}
               className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] outline-none transition-all placeholder:text-gray-300"
               placeholder="Payment name displayed to customer..."
             />
           </div>

           <div className="space-y-2">
             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
               <FiPercent className="text-gray-300" /> Additional Fee (%)
             </label>
             <input
               type="number"
               value={formData.additionalFee}
               onChange={(e) => setFormData({ ...formData, additionalFee: parseFloat(e.target.value) || 0 })}
               className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] outline-none transition-all"
             />
           </div>

           <div className="md:col-span-2 space-y-2">
             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
               <FiFileText className="text-gray-300" /> Instructions
             </label>
             <textarea
               rows={4}
               value={formData.instructions}
               onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
               className="w-full px-5 py-4 bg-gray-50/50 border border-gray-100 rounded-[2rem] text-sm font-medium focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] outline-none transition-all placeholder:text-gray-300 resize-none"
               placeholder="Detailed instructions for the customer..."
             />
           </div>
        </div>
      </div>
    </motion.div>
  );
};

const PaymentMethods = () => {
  const [view, setView] = useState('list');
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [methods, setMethods] = useState([
    { 
      id: 1, 
      name: 'Purchase order', 
      friendlyName: 'Purchase Order Tracking',
      paymentId: 'Payments.PurchaseOrderNumber', 
      active: true,
      features: { recurring: false, capture: false, refund: false, partialRefund: false, void: false }
    },
    { 
      id: 2, 
      name: 'Prepayment', 
      friendlyName: 'Cash Prepayment',
      paymentId: 'Payments.Prepayment', 
      active: true,
      features: { recurring: false, capture: false, refund: false, partialRefund: false, void: false }
    },
    { 
      id: 3, 
      name: 'Pay in store', 
      friendlyName: 'Store Pickup Payment',
      paymentId: 'Payments.PayInStore', 
      active: true,
      features: { recurring: false, capture: false, refund: false, partialRefund: false, void: false }
    },
    { 
      id: 4, 
      name: 'Credit card (manual)', 
      friendlyName: 'Secure Credit Card (Offline)',
      paymentId: 'Payments.Manual', 
      active: true,
      features: { recurring: true, capture: false, refund: false, partialRefund: false, void: false },
      featureDetails: { recurring: 'Manual' }
    },
    { 
      id: 5, 
      name: 'Invoice', 
      friendlyName: 'Standard Invoice Billing',
      paymentId: 'Payments.Invoice', 
      active: true,
      features: { recurring: false, capture: false, refund: false, partialRefund: false, void: false }
    },
    { 
      id: 6, 
      name: 'Direct Debit', 
      friendlyName: 'Automatic Bank Withdrawal',
      paymentId: 'Payments.DirectDebit', 
      active: true,
      features: { recurring: false, capture: false, refund: false, partialRefund: false, void: false }
    },
    { 
      id: 7, 
      name: 'Cash on delivery', 
      friendlyName: 'Standard Cash Payment',
      paymentId: 'Payments.CashOnDelivery', 
      active: true,
      features: { recurring: false, capture: false, refund: false, partialRefund: false, void: false }
    },
  ]);

  const toggleStatus = (id) => {
    setMethods(prev => prev.map(m => m.id === id ? { ...m, active: !m.active } : m));
  };

  const handleConfigure = (method) => {
    setSelectedMethod(method);
    setView('config');
  };

  const handleSave = (updatedMethod, continueEditing) => {
    setMethods(prev => prev.map(m => m.id === updatedMethod.id ? updatedMethod : m));
    if (!continueEditing) {
      setView('list');
      setSelectedMethod(null);
    }
  };

  const filteredMethods = methods.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (activeTab === 'All' || (activeTab === 'Active' && m.active) || (activeTab === 'Inactive' && !m.active))
  );

  return (
    <div className="min-h-screen bg-[#f8f9fc] p-8 lg:p-12">
      <div className="max-w-7xl mx-auto space-y-10">
        <AnimatePresence mode="wait">
          {view === 'list' ? (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-10"
            >
              {/* Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
                  {filteredMethods.map((method) => (
                    <PaymentMethodCard 
                      key={method.id} 
                      method={method} 
                      onToggle={toggleStatus}
                      onConfigure={() => handleConfigure(method)}
                    />
                  ))}
                </AnimatePresence>
              </div>

              {filteredMethods.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-10 flex flex-col items-center gap-4 opacity-40"
                >
                  <FiCreditCard size={64} className="text-gray-300" />
                  <p className="text-sm font-black text-gray-400 uppercase tracking-widest">No payment methods found</p>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <PaymentMethodForm 
               method={selectedMethod} 
               onBack={() => { setView('list'); setSelectedMethod(null); }}
               onSave={handleSave}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PaymentMethods;
