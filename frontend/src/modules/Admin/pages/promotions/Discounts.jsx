import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiFilter, 
  FiX, 
  FiSettings, 
  FiPlus,
  FiSearch,
  FiTrash2,
  FiCheck,
  FiPercent,
  FiType,
  FiCalendar,
  FiLock,
  FiHash,
  FiLayout,
  FiTrendingUp,
  FiDollarSign,
  FiTag,
  FiArrowLeft,
  FiSave,
  FiClock,
  FiStar,
  FiShield,
  FiUsers,
  FiShoppingCart,
  FiBox,
  FiAlertCircle
} from 'react-icons/fi';
import DataTable from '../../components/DataTable';

const RuleForm = ({ onBack, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true,
    scope: 'Cart'
  });

  const scopes = [
    { 
      id: 'Cart', 
      label: 'Cart', 
      desc: 'Rule to grant discounts to the customer or offer shipping and payment methods.',
      icon: FiShoppingCart
    },
    { 
      id: 'Customer', 
      label: 'Customer', 
      desc: 'Rule to automatically assign customers to customer roles per scheduled task.',
      icon: FiUsers 
    },
    { 
      id: 'Product', 
      label: 'Product', 
      desc: 'Rule to automatically assign products to categories per scheduled task.',
      icon: FiBox
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between bg-gray-50/50 p-4 rounded-2xl border border-gray-100 shadow-inner">
        <div className="flex items-center gap-3 text-primary-600">
           <FiShield size={24} />
           <h2 className="text-sm font-black uppercase tracking-widest text-gray-800">Add New Requirement Rule</h2>
        </div>
        <button onClick={onBack} className="text-gray-400 hover:text-red-500 transition-colors">
          <FiX size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Rule Name</label>
            <input
              type="text"
              placeholder="e.g. VIP Cart Incentive"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary-500 outline-none shadow-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Description</label>
            <textarea
              placeholder="Rule context and logic outline..."
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary-500 outline-none shadow-sm resize-none italic"
            />
          </div>
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
               <FiAlertCircle className="text-amber-500" />
               <span className="text-[10px] font-black text-gray-800 uppercase tracking-widest">Is Active</span>
            </div>
            <button
               onClick={() => setFormData({...formData, isActive: !formData.isActive})}
               className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${formData.isActive ? 'bg-green-500' : 'bg-gray-200'}`}
            >
               <motion.div 
                 animate={{ x: formData.isActive ? 18 : 2 }}
                 transition={{ type: "spring", stiffness: 500, damping: 30 }}
                 className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm" 
               />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Select Scope</label>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-admin">
            {scopes.map(scope => (
              <div 
                key={scope.id}
                onClick={() => setFormData({...formData, scope: scope.id})}
                className={`p-4 rounded-2xl border transition-all cursor-pointer group flex items-start gap-4 ${
                  formData.scope === scope.id 
                    ? 'bg-primary-50 border-primary-300 ring-2 ring-primary-100 shadow-md' 
                    : 'bg-white border-gray-100 hover:border-primary-200 hover:shadow-sm'
                }`}
              >
                <div className={`p-3 rounded-xl transition-colors ${
                  formData.scope === scope.id ? 'bg-primary-600 text-white' : 'bg-gray-50 text-gray-400 group-hover:text-primary-500'
                }`}>
                   <scope.icon size={20} />
                </div>
                <div>
                  <h5 className="text-[11px] font-black text-gray-800 uppercase tracking-widest flex items-center gap-2">
                    {scope.label} {formData.scope === scope.id && <FiCheck className="text-primary-600" />}
                  </h5>
                  <p className="text-[9px] text-gray-400 font-bold leading-relaxed mt-1 group-hover:text-gray-500">{scope.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 justify-end pt-4 border-t border-gray-50">
          <button
            onClick={() => onSave(formData, true)}
            className="px-6 py-2.5 bg-white border border-primary-200 text-primary-600 rounded-xl hover:bg-primary-50 transition-all text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 active:scale-95 shadow-sm"
          >
            <FiSave />
            <span>Save & Continue</span>
          </button>
          <button
            onClick={() => onSave(formData, false)}
            className="px-8 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-primary-50 active:scale-95"
          >
            <FiCheck />
            <span>Save Rule</span>
          </button>
      </div>
    </motion.div>
  );
};

const DiscountForm = ({ onBack, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'Assigned to Order Total',
    usePercentage: false,
    discountAmount: 0,
    discountPercentage: 0,
    startDate: '',
    endDate: '',
    countdownThreshold: 24, // hours
    badgeLabel: '',
    requiresCoupon: false,
    couponCode: '',
    limitation: 'Unlimited',
    requirements: false,
    requirementRules: []
  });

  const [activeSubView, setActiveSubView] = useState('main'); // 'main' or 'add-rule'

  const discountTypes = [
    'Assigned to Order Total',
    'Assigned to Products',
    'Assigned to Categories',
    'Assigned to Manufacturers',
    'Assigned to Shipping',
    'Assigned to Order Subtotal'
  ];

  const limitations = [
    'Unlimited',
    'N times only',
    'N times per customer'
  ];

  const handleSaveRule = (ruleData, continueEditing) => {
    console.log('Saving requirement rule:', ruleData);
    setFormData({
      ...formData,
      requirementRules: [...formData.requirementRules, { ...ruleData, id: Date.now().toString() }]
    });
    if (!continueEditing) setActiveSubView('main');
    else alert('Rule progress saved. Continue defining context.');
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6 pb-20"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-gray-400 hover:text-primary-600 shadow-sm"
          >
            <FiArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Add a New Discount</h1>
            <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
              <FiPercent /> Pricing Strategy & Promotions
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onSave(formData, true)}
            className="px-6 py-2.5 bg-white border border-primary-200 text-primary-600 rounded-xl hover:bg-primary-50 transition-all text-sm font-bold flex items-center gap-2 active:scale-95 shadow-sm"
          >
            <FiSave />
            <span>Save & Continue</span>
          </button>
          <button
            onClick={() => onSave(formData, false)}
            className="px-8 py-2.5 bg-[#7e3af2] text-white rounded-xl hover:bg-[#6c2bd9] transition-all text-sm font-bold flex items-center gap-2 shadow-lg shadow-purple-100 active:scale-95"
          >
            <FiCheck />
            <span>Save Discount</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-[11px] font-bold uppercase text-gray-400 tracking-widest flex items-center gap-2">
            <FiLayout className="text-primary-500" /> Basic Discount Settings
          </h3>
        </div>
        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="space-y-2 lg:col-span-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Name</label>
              <input
                type="text"
                placeholder="e.g. Festive Bonus..."
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-500 outline-none shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Discount Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary-500 outline-none appearance-none shadow-sm"
              >
                {discountTypes.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 bg-gray-50/10 rounded-2xl border border-gray-100 flex flex-col justify-between h-32 hover:bg-white hover:shadow-md transition-all group">
              <div className="flex items-start justify-between">
                <div className="p-2 bg-white rounded-xl text-gray-400 group-hover:text-primary-600 transition-colors shadow-sm">
                  <FiTrendingUp size={16}/>
                </div>
                <button
                  onClick={() => setFormData({...formData, usePercentage: !formData.usePercentage})}
                  className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${formData.usePercentage ? 'bg-primary-600' : 'bg-gray-200'}`}
                >
                  <motion.div 
                    animate={{ x: formData.usePercentage ? 18 : 2 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm" 
                  />
                </button>
              </div>
              <div>
                <h5 className="text-[10px] font-black text-gray-800 uppercase tracking-widest">Use Percentage</h5>
                <p className="text-[9px] text-gray-400 font-bold tracking-tight">Toggle for % or flat rate</p>
              </div>
            </div>

            <div className="space-y-2 flex flex-col justify-end">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 flex items-center gap-1.5">
                {formData.usePercentage ? <FiPercent /> : <FiDollarSign />} {formData.usePercentage ? 'Discount Percentage' : 'Discount Amount'}
              </label>
              <input
                type="number"
                value={formData.usePercentage ? formData.discountPercentage : formData.discountAmount}
                onChange={(e) => setFormData({...formData, [formData.usePercentage ? 'discountPercentage' : 'discountAmount']: parseFloat(e.target.value)})}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-black focus:ring-2 focus:ring-primary-500 outline-none shadow-sm"
              />
            </div>

            <div className="space-y-2 flex flex-col justify-end">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 flex items-center gap-1.5">
                <FiCalendar /> Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary-500 outline-none shadow-sm"
              />
            </div>

            <div className="space-y-2 flex flex-col justify-end">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 flex items-center gap-1.5">
                <FiCalendar /> End Date
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary-500 outline-none shadow-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Countdown Display Threshold (Hours)</label>
              <div className="relative group">
                <input
                  type="number"
                  value={formData.countdownThreshold}
                  onChange={(e) => setFormData({...formData, countdownThreshold: parseInt(e.target.value)})}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary-500 outline-none shadow-sm pr-10"
                />
                <FiClock className="absolute right-3 top-3.5 text-gray-400 group-hover:text-primary-500 transition-colors" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Offer Badge Label</label>
              <div className="relative group">
                <input
                  type="text"
                  placeholder="e.g. HOT DEAL!"
                  value={formData.badgeLabel}
                  onChange={(e) => setFormData({...formData, badgeLabel: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary-500 outline-none shadow-sm pr-10"
                />
                <FiStar className="absolute right-3 top-3.5 text-gray-400 group-hover:text-primary-500 transition-colors" />
              </div>
            </div>
            <div className="p-5 bg-gray-50/50 rounded-2xl border border-gray-100 flex items-center justify-between hover:bg-white hover:shadow-sm transition-all group">
               <div>
                  <h5 className="text-[10px] font-black text-gray-800 uppercase tracking-widest">Coupon Code</h5>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">Requires Auth</p>
               </div>
               <button
                  onClick={() => setFormData({...formData, requiresCoupon: !formData.requiresCoupon})}
                  className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${formData.requiresCoupon ? 'bg-primary-600' : 'bg-gray-200'}`}
               >
                  <motion.div 
                    animate={{ x: formData.requiresCoupon ? 18 : 2 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm" 
                  />
               </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Discount Limitation</label>
              <select
                value={formData.limitation}
                onChange={(e) => setFormData({...formData, limitation: e.target.value})}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary-500 outline-none appearance-none shadow-sm"
              >
                {limitations.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div className="p-5 bg-gray-50/50 rounded-2xl border border-gray-100 flex items-center justify-between hover:bg-white hover:shadow-sm transition-all group">
               <div className="flex items-center gap-4">
                  <div className="p-2 bg-white rounded-xl text-primary-500 shadow-sm border border-primary-50">
                     <FiShield size={20} />
                  </div>
                  <div>
                    <h5 className="text-[10px] font-black text-gray-800 uppercase tracking-widest">Requirements</h5>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight">Specify additional conditions</p>
                  </div>
               </div>
               <button
                  onClick={() => setFormData({...formData, requirements: !formData.requirements})}
                  className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${formData.requirements ? 'bg-primary-600' : 'bg-gray-200'}`}
               >
                  <motion.div 
                    animate={{ x: formData.requirements ? 18 : 2 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm" 
                  />
               </button>
            </div>
          </div>

          {/* Requirements Section */}
          <AnimatePresence>
            {formData.requirements && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-6 pt-6 border-t border-gray-100"
              >
                <div className="flex items-center justify-between">
                   <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Requirement Configuration</h4>
                   {activeSubView === 'main' && (
                     <button 
                       onClick={() => setActiveSubView('add-rule')}
                       className="px-4 py-2 bg-primary-50 text-primary-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-100 transition-all flex items-center gap-2 border border-primary-100"
                     >
                       <FiPlus /> Add Rule...
                     </button>
                   )}
                </div>

                <AnimatePresence mode="wait">
                  {activeSubView === 'main' ? (
                    <motion.div
                      key="rule-list"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="grid grid-cols-1 md:grid-cols-3 gap-4"
                    >
                      {/* Fixed Options */}
                      {[
                        { label: 'Major Customers', icon: FiUsers, count: 42 },
                        { label: 'Weekends', icon: FiCalendar, count: 12 },
                      ].map(opt => (
                        <div key={opt.label} className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-primary-100 transition-all group cursor-pointer relative overflow-hidden">
                          <div className="flex items-start justify-between relative z-10">
                            <div className="p-2.5 bg-gray-50 rounded-xl text-gray-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-all">
                               <opt.icon size={20} />
                            </div>
                            <span className="text-[9px] font-black text-gray-300 group-hover:text-primary-400 uppercase tracking-tighter transition-colors">Default Rule</span>
                          </div>
                          <div className="mt-4 relative z-10">
                            <h5 className="text-[11px] font-black text-gray-800 uppercase tracking-widest">{opt.label}</h5>
                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight mt-0.5">Applied to {opt.count} orders</p>
                          </div>
                          <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-all rotate-12 scale-150">
                             <opt.icon size={80} />
                          </div>
                        </div>
                      ))}

                      {/* Dynamic Rules Added */}
                      {formData.requirementRules.map(rule => (
                        <div key={rule.id} className="p-4 bg-white border border-primary-100 rounded-2xl shadow-sm hover:shadow-md transition-all group relative overflow-hidden ring-1 ring-primary-50">
                          <div className="flex items-start justify-between relative z-10">
                            <div className="p-2.5 bg-primary-50 rounded-xl text-primary-600">
                               <FiShield size={20} />
                            </div>
                            <div className="flex items-center gap-1.5">
                               <span className={`w-1.5 h-1.5 rounded-full ${rule.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                               <span className="text-[9px] font-black text-primary-600 uppercase tracking-widest">{rule.scope}</span>
                            </div>
                          </div>
                          <div className="mt-4 relative z-10">
                            <h5 className="text-[11px] font-black text-gray-800 uppercase tracking-widest">{rule.name}</h5>
                            <p className="text-[9px] text-gray-400 font-bold tracking-tight mt-0.5 line-clamp-1">{rule.description || 'No description provided.'}</p>
                          </div>
                          <button 
                            onClick={() => setFormData({...formData, requirementRules: formData.requirementRules.filter(r => r.id !== rule.id)})}
                            className="absolute top-2 right-2 p-1.5 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      ))}

                      {/* Empty Placeholder */}
                      {formData.requirementRules.length === 0 && (
                        <div className="col-span-1 md:col-span-1 flex items-center justify-center p-4 border border-dashed border-gray-200 rounded-2xl">
                           <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">No custom rules added</p>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <RuleForm key="rule-form" onBack={() => setActiveSubView('main')} onSave={handleSaveRule} />
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

const Discounts = () => {
  // UI State
  const [view, setView] = useState('list'); // 'list' or 'add'
  const [showFilter, setShowFilter] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Table Settings State
  const [tableSettings, setTableSettings] = useState({
    rowLines: true,
    columnLines: false,
    striped: false,
    hover: true,
  });

  // Column Visibility State
  const [visibleColumns, setVisibleColumns] = useState({
    id: true,
    name: true,
    type: true,
    rules: true,
    startDate: true,
    endDate: true,
    usePercentage: true,
    percentage: true,
    amount: true,
    requiresCoupon: true,
  });

  // Filter State
  const [filters, setFilters] = useState({
    name: '',
    type: 'All',
    usePercentage: 'Unspecified',
    requiresCoupon: 'Unspecified'
  });

  // Mock Data
  const [discounts, setDiscounts] = useState([]);

  const discountTypes = [
    'All',
    'Assigned to Order Total',
    'Assigned to Products',
    'Assigned to Categories',
    'Assigned to Manufacturers',
    'Assigned to Shipping',
    'Assigned to Order Subtotal'
  ];

  // Filtering Logic
  const filteredData = useMemo(() => {
    return discounts.filter(item => {
      const matchName = item.name.toLowerCase().includes(filters.name.toLowerCase());
      const matchType = filters.type === 'All' || item.type === filters.type;
      const matchPercentage = filters.usePercentage === 'Unspecified' 
        || (filters.usePercentage === 'Yes' && item.usePercentage)
        || (filters.usePercentage === 'No' && !item.usePercentage);
      const matchCoupon = filters.requiresCoupon === 'Unspecified'
        || (filters.requiresCoupon === 'Yes' && item.requiresCoupon)
        || (filters.requiresCoupon === 'No' && !item.requiresCoupon);
      return matchName && matchType && matchPercentage && matchCoupon;
    });
  }, [discounts, filters]);

  const handleResetFilters = () => setFilters({
    name: '',
    type: 'All',
    usePercentage: 'Unspecified',
    requiresCoupon: 'Unspecified'
  });

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedIds(new Set(filteredData.map(d => d.id)));
    else setSelectedIds(new Set());
  };

  const handleSelectRow = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    if (window.confirm(`Permanently delete ${selectedIds.size} discounts?`)) {
      setDiscounts(discounts.filter(d => !selectedIds.has(d.id)));
      setSelectedIds(new Set());
    }
  };

  const handleSaveDiscount = (formData, continueEditing) => {
    console.log('Saving discount:', formData);
    const newDiscount = {
      id: (discounts.length + 1).toString(),
      ...formData,
      rules: formData.requirementRules.length // Dynamic rules count
    };
    setDiscounts([...discounts, newDiscount]);
    if (!continueEditing) setView('list');
    else alert('Discount saved! You may proceed with further configuration.');
  };

  if (view === 'add') {
    return <DiscountForm onBack={() => setView('list')} onSave={handleSaveDiscount} />;
  }

  // Table Columns
  const columns = [
    {
      key: 'checkbox',
      label: (
        <input 
          type="checkbox" 
          checked={selectedIds.size === filteredData.length && filteredData.length > 0} 
          onChange={handleSelectAll}
          className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
      ),
      sortable: false,
      render: (_, row) => (
        <input 
          type="checkbox" 
          checked={selectedIds.has(row.id)} 
          onChange={() => handleSelectRow(row.id)}
          className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
      )
    },
    { key: 'id', label: 'ID', hidden: !visibleColumns.id, render: (v) => <span className="font-mono text-xs font-black text-gray-400">{v}</span> },
    { key: 'name', label: 'Name', hidden: !visibleColumns.name, render: (v) => <span className="font-bold text-gray-800 tracking-tight">{v}</span> },
    { key: 'type', label: 'Discount Type', hidden: !visibleColumns.type, render: (v) => <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 border border-gray-100 rounded px-2 py-1">{v}</span> },
    { key: 'rules', label: 'No. of Rules', hidden: !visibleColumns.rules, render: (v) => <span className="px-2 py-0.5 bg-primary-50 rounded text-xs font-black text-primary-600">{v}</span> },
    { key: 'startDate', label: 'Start Date', hidden: !visibleColumns.startDate, render: (v) => <span className="text-xs font-medium text-gray-500 flex items-center gap-1"><FiCalendar className="text-gray-300" /> {v || '—'}</span> },
    { key: 'endDate', label: 'End Date', hidden: !visibleColumns.endDate, render: (v) => <span className="text-xs font-medium text-gray-500 flex items-center gap-1"><FiCalendar className="text-gray-300" /> {v || '—'}</span> },
    { 
      key: 'usePercentage', 
      label: 'Use %', 
      hidden: !visibleColumns.usePercentage,
      render: (v) => v ? <FiCheck className="text-green-600 text-lg mx-auto" /> : <FiX className="text-gray-300 mx-auto" /> 
    },
    { key: 'discountPercentage', label: 'Discount Percentage', hidden: !visibleColumns.percentage, render: (v, row) => row.usePercentage ? <span className="text-xs font-black text-green-600">{v}%</span> : <span className="text-gray-300">—</span> },
    { key: 'discountAmount', label: 'Discount Amount', hidden: !visibleColumns.amount, render: (v, row) => !row.usePercentage ? <span className="text-xs font-black text-primary-600">${v}</span> : <span className="text-gray-300">—</span> },
    { 
      key: 'requiresCoupon', 
      label: 'Requires Coupon', 
      hidden: !visibleColumns.requiresCoupon,
      render: (v) => v ? <span className="p-1 px-2 bg-amber-50 rounded border border-amber-100 text-[10px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-1"><FiLock size={10} /> Required</span> : <span className="text-gray-300 italic text-[10px]">None</span> 
    },
  ];

  const filteredColumns = columns.filter(col => !col.hidden);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-20"
    >
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-visible relative">
        {/* Action Bar */}
        <div className="p-4 border-b border-gray-100 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-primary-600 pr-4 border-r border-gray-100">
              <div className="p-2 bg-primary-50 rounded-lg"><FiPercent /></div>
              <span className="text-sm font-bold text-gray-600">Discounts</span>
            </div>

            <button
              onClick={() => setView('add')}
              className="px-6 py-2.5 bg-[#7e3af2] text-white rounded-xl hover:bg-[#6c2bd9] transition-all text-sm font-bold flex items-center gap-2 shadow-lg shadow-purple-100 active:scale-95"
            >
              <FiPlus className="text-lg" />
              <span>Add New</span>
            </button>

            <AnimatePresence>
               {selectedIds.size > 0 && (
                 <motion.button
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.9 }}
                   onClick={handleDeleteSelected}
                   className="px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-red-100 active:scale-95"
                 >
                   <FiTrash2 size={14} />
                   <span>Delete Selected ({selectedIds.size})</span>
                 </motion.button>
               )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className={`px-4 py-2 rounded-xl border transition-all text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-sm ${
                showFilter 
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <FiFilter className="text-xs" />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* Filter Overlay */}
        <AnimatePresence>
          {showFilter && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden bg-gray-50/50 border-b border-gray-100"
            >
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 px-1">
                    <FiTag /> Discount Name
                  </label>
                  <input
                    type="text"
                    placeholder="Summer Sale..."
                    value={filters.name}
                    onChange={(e) => setFilters({...filters, name: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 px-1">
                    <FiType /> Discount Type
                  </label>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters({...filters, type: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary-500 outline-none appearance-none shadow-sm"
                  >
                    {discountTypes.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 px-1">
                    <FiTrendingUp /> Use Percentage
                  </label>
                  <select
                    value={filters.usePercentage}
                    onChange={(e) => setFilters({...filters, usePercentage: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary-500 outline-none appearance-none shadow-sm"
                  >
                    <option>Unspecified</option>
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 px-1">
                    <FiLock /> Requires Coupon
                  </label>
                  <select
                    value={filters.requiresCoupon}
                    onChange={(e) => setFilters({...filters, requiresCoupon: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary-500 outline-none appearance-none shadow-sm"
                  >
                    <option>Unspecified</option>
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                </div>

                <div className="lg:col-span-4 flex items-center justify-between pt-4 border-t border-gray-100 mt-2">
                  <span className="text-[10px] uppercase font-bold text-gray-300 tracking-widest">Matched Discounts: {filteredData.length}</span>
                  <button onClick={handleResetFilters} className="text-xs font-bold text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors uppercase tracking-widest">
                    <FiX size={14} /> Clear All Filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Table Section */}
        <div className="p-0 overflow-x-auto min-h-[400px]">
          <DataTable
            data={filteredData}
            columns={filteredColumns}
            pagination={true}
            itemsPerPage={10}
            rowLines={tableSettings.rowLines}
            columnLines={tableSettings.columnLines}
            className={`rounded-none shadow-none border-none ${tableSettings.striped ? '[&_tbody_tr:nth-child(even)]:bg-gray-50/50' : ''} ${!tableSettings.hover ? '[&_tbody_tr]:hover:bg-transparent' : ''}`}
          />
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-sm" />
              <span className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Active Promotions: {discounts.length}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded border transition-all ${showSettings ? 'bg-primary-50 border-primary-300 text-primary-600 shadow-sm' : 'bg-gray-200 border-gray-300 text-gray-700 hover:bg-gray-300'}`}
              >
                <FiSettings />
              </button>

              <AnimatePresence>
                {showSettings && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-full right-0 mb-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 z-50 pointer-events-auto"
                  >
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-bold uppercase text-gray-400 tracking-widest mb-3 border-b border-gray-50 pb-2">Layout Config</h4>
                      
                      <div className="space-y-2.5">
                        {[
                          { label: 'Row lines', key: 'rowLines' },
                          { label: 'Column lines', key: 'columnLines' },
                          { label: 'Striped', key: 'striped' },
                          { label: 'Hover', key: 'hover' }
                        ].map(({ label, key }) => (
                          <label key={key} className="flex items-center justify-between cursor-pointer group">
                            <span className="text-xs font-bold text-gray-600 group-hover:text-primary-600 transition-colors uppercase tracking-widest">{label}</span>
                            <div
                              onClick={() => setTableSettings(s => ({ ...s, [key]: !s[key] }))}
                              className={`w-8 h-4 rounded-full relative transition-colors ${tableSettings[key] ? 'bg-primary-600' : 'bg-gray-300'}`}
                            >
                              <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${tableSettings[key] ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                            </div>
                          </label>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-gray-50 space-y-2">
                        <h4 className="text-[10px] font-bold uppercase text-gray-400 tracking-widest mb-2">Column Manager</h4>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-admin">
                          {Object.entries(visibleColumns).map(([key, isVisible]) => (
                            <label key={key} className="flex items-center gap-2 cursor-pointer group">
                              <div
                                onClick={() => setVisibleColumns(v => ({ ...v, [key]: !v[key] }))}
                                className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${isVisible ? 'bg-primary-600 border-primary-600' : 'bg-white border-gray-300'}`}
                              >
                                {isVisible && <FiCheck className="text-white text-[8px]" />}
                              </div>
                              <span className={`text-[9px] font-bold uppercase tracking-widest transition-colors ${isVisible ? 'text-gray-900' : 'text-gray-400'}`}>
                                {key.replace(/([A-Z])/g, ' $1')}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Discounts;
