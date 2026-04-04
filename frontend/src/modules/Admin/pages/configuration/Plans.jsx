import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlus, 
  FiEdit3, 
  FiTrash2, 
  FiCheck, 
  FiSettings,
  FiGrid,
  FiLayers,
  FiArrowLeft,
  FiType,
  FiTag,
  FiClock,
  FiFileText,
  FiUser,
  FiSave,
  FiX
} from 'react-icons/fi';
import DataTable from '../../components/DataTable';

const PlanForm = ({ onSave, onClose, mode = 'add', initialData = null }) => {
  const isEdit = mode === 'edit';
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    price: initialData?.price || '',
    maxAds: initialData?.maxAds || '',
    duration: initialData?.duration?.toString().split(' ')[0] || '',
    description: initialData?.description || '',
    userType: initialData?.userType || 'Vendor',
    isActive: initialData?.isActive ?? true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleToggle = (field) => {
    setFormData(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6 pb-20"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onClose}
            className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-gray-400 hover:text-[#6b2bd9] shadow-sm"
          >
            <FiArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              {isEdit ? 'Edit Subscription Plan' : 'Add a New Plan'}
            </h1>
          </div>
        </div>

        <button 
          onClick={handleSubmit}
          className="px-8 py-2.5 bg-[#6b2bd9] text-white rounded-xl hover:bg-[#5b24b7] transition-all text-sm font-bold flex items-center gap-2 shadow-lg shadow-purple-100 active:scale-95"
        >
          <FiSave size={16} />
          <span>Save</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden text-left">
        <div className="p-8 lg:p-12 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 tracking-widest uppercase px-1">
                Plan Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] focus:bg-white outline-none transition-all"
                placeholder="e.g., Diamond Business Plan"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 tracking-widest uppercase px-1">
                Price (₹)
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] focus:bg-white outline-none transition-all"
                placeholder="999"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 tracking-widest uppercase px-1">
                Allowed Max Ads
              </label>
              <input
                type="number"
                value={formData.maxAds}
                onChange={(e) => setFormData({ ...formData, maxAds: e.target.value })}
                className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] focus:bg-white outline-none transition-all"
                placeholder="Unlimited"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 tracking-widest uppercase px-1">
                Duration (Days)
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] focus:bg-white outline-none transition-all"
                placeholder="30"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 tracking-widest uppercase px-1">
              Description
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] focus:bg-white outline-none transition-all resize-none"
              placeholder="Detailed plan benefits and features..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <label className="text-xs font-bold text-gray-700 tracking-widest uppercase px-1">
                Is This for Vendor or Distributer
              </label>
              <select
                value={formData.userType}
                onChange={(e) => setFormData({ ...formData, userType: e.target.value })}
                className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] outline-none shadow-sm appearance-none cursor-pointer"
              >
                <option value="Vendor">Vendor</option>
                <option value="Distributer">Distributer</option>
              </select>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-bold text-gray-700 tracking-widest uppercase px-1">
                Status
              </label>
              <button 
                type="button"
                onClick={() => handleToggle('isActive')}
                className={`p-3.5 w-full rounded-2xl border flex items-center justify-between transition-all group ${
                  formData.isActive ? 'bg-purple-50 border-purple-100 ring-2 ring-primary-50/50 shadow-sm' : 'bg-white border-gray-100 hover:border-gray-200 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-xl transition-all ${
                    formData.isActive ? 'bg-[#6b2bd9] text-white' : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100'
                  }`}>
                    {formData.isActive ? <FiCheck size={14} /> : <FiX size={14} />}
                  </div>
                  <div className="text-left">
                    <h3 className={`text-[10px] font-black uppercase tracking-widest ${formData.isActive ? 'text-[#6b2bd9]' : 'text-gray-400'}`}>
                      PLAN IS ACTIVE
                    </h3>
                  </div>
                </div>
                <div className={`w-10 h-5 rounded-full transition-all relative ${formData.isActive ? 'bg-[#6b2bd9]' : 'bg-gray-200'}`}>
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${formData.isActive ? 'left-6' : 'left-1'}`} />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Plans = () => {
  const [view, setView] = useState('list');
  const [plans, setPlans] = useState([]);

  const [editingPlan, setEditingPlan] = useState(null);

  const handleDeletePlan = (id) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      setPlans(plans.filter(p => p.id !== id));
    }
  };

  const handleEditPlan = (plan) => {
    setEditingPlan(plan);
    setView('edit');
  };

  const handleSavePlan = (planData) => {
    if (editingPlan) {
      setPlans(plans.map(p => p.id === editingPlan.id ? { ...planData, id: p.id } : p));
    } else {
      const newPlan = {
        ...planData,
        id: Date.now().toString(),
        duration: planData.duration.toString().includes('Days') ? planData.duration : `${planData.duration} Days`
      };
      setPlans([newPlan, ...plans]);
    }
    setView('list');
    setEditingPlan(null);
  };

  const columns = [
    {
      key: 'name',
      label: 'Plan Identity',
      render: (v) => (
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gray-50 rounded-lg text-gray-400 group-hover:text-[#6b2bd9] transition-colors shadow-sm">
             <FiLayers size={12} />
          </div>
          <span className="font-bold text-gray-800 tracking-tight">{v}</span>
        </div>
      )
    },
    {
      key: 'price',
      label: 'Pricing (₹)',
      render: (v) => (
        <div className="flex items-center gap-2">
          <span className="text-sm font-black text-gray-900">₹{v}</span>
        </div>
      )
    },
    {
      key: 'duration',
      label: 'Validity Period',
      render: (v) => (
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
          {v}
        </span>
      )
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (v) => (
        <div className="flex items-center justify-center">
           {v ? (
             <div className="p-1 bg-green-50 text-green-500 rounded-full shadow-sm shadow-green-100">
                <FiCheck size={12} />
             </div>
           ) : (
             <div className="p-1 bg-red-50 text-red-400 rounded-full shadow-sm shadow-red-100">
                <FiPlus className="rotate-45" size={12} />
             </div>
           )}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleEditPlan(row)}
            className="p-1.5 bg-primary-50 text-[#6b2bd9] rounded-lg hover:bg-primary-100 transition-colors shadow-sm"
          >
             <FiEdit3 size={14} />
          </button>
          <button 
            onClick={() => handleDeletePlan(row.id)}
            className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors shadow-sm"
          >
             <FiTrash2 size={14} />
          </button>
        </div>
      )
    }
  ];

  if (view === 'add' || view === 'edit') {
    return (
      <PlanForm 
        mode={view}
        initialData={editingPlan}
        onSave={handleSavePlan}
        onClose={() => {
          setView('list');
          setEditingPlan(null);
        }}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-20"
    >
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-visible relative">
        <div className="p-4 border-b border-gray-100 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3 pr-4 border-r border-gray-100">
               <div className="p-2 bg-primary-50 text-[#6b2bd9] rounded-lg shadow-sm">
                  <FiGrid size={20} />
               </div>
               <div>
                  <h1 className="text-sm font-bold text-gray-600 tracking-tight">Subscription Plans</h1>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Plan & Tier Management</p>
               </div>
            </div>
            <button
               onClick={() => setView('add')}
               className="px-6 py-2.5 bg-[#6b2bd9] text-white rounded-xl hover:bg-[#5b24b7] transition-all text-sm font-bold flex items-center gap-2 shadow-lg shadow-purple-100 active:scale-95"
            >
               <FiPlus size={18} />
               <span>Add New Plan</span>
            </button>
          </div>
        </div>

        <div className="p-0 overflow-x-auto min-h-[400px] flex flex-col">
          <DataTable
            data={plans}
            columns={columns}
            pagination={true}
            itemsPerPage={10}
            className="border-none shadow-none rounded-none"
          />
          {plans.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center p-24 bg-gray-50/20 space-y-4">
              <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 text-gray-200">
                <FiLayers size={48} />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">No plans configured</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Start by adding your first subscription tier</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-gray-50/10 border-t border-gray-100 flex items-center justify-between">
           <div className="flex items-center gap-4 text-[10px] font-black text-gray-300 uppercase tracking-widest">
              <span>Displaying {plans.length} plans</span>
           </div>
           <button 
             className="p-2 rounded-xl transition-all border bg-white border-gray-200 text-gray-400 hover:bg-gray-50 active:scale-95 shadow-sm"
           >
              <FiSettings size={18} />
           </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Plans;
