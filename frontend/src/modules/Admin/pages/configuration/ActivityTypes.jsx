import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiActivity, 
  FiPlus, 
  FiEdit3, 
  FiTrash2, 
  FiCheck, 
  FiMinus, 
  FiArrowLeft, 
  FiSave,
  FiType,
  FiPower
} from 'react-icons/fi';
import DataTable from '../../components/DataTable';

const ActivityTypeForm = ({ onBack, onSave, initialData = null }) => {
  const isEdit = !!initialData;
  const [formData, setFormData] = useState({
    name: '',
    isEnabled: true,
    ...(initialData || {})
  });

  const handleToggle = () => {
    setFormData(prev => ({ ...prev, isEnabled: !prev.isEnabled }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6 pb-20 text-left"
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
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              {isEdit ? `Edit activity - ${formData.name}` : 'Add a new activity type'}
            </h1>
          </div>
        </div>

        <button 
          onClick={() => onSave(formData, false)}
          className="px-8 py-2.5 bg-[#6b2bd9] text-white rounded-xl hover:bg-[#5b24b7] transition-all text-sm font-bold flex items-center gap-2 shadow-lg shadow-purple-100 active:scale-95"
        >
          <FiSave size={16} />
          <span>Save</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden p-8 lg:p-12 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
           <div className="space-y-2">
             <label className="text-xs font-bold text-gray-700 tracking-widest uppercase px-1">
               Activity Name
             </label>
             <input
               type="text"
               value={formData.name}
               onChange={(e) => setFormData({ ...formData, name: e.target.value })}
               className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] focus:bg-white outline-none transition-all placeholder:text-gray-300"
               placeholder="Public.ViewCategory..."
             />
           </div>

           <div className="space-y-2">
             <label className="text-xs font-bold text-gray-700 tracking-widest uppercase px-1">
               Administrative State
             </label>
             <button
               onClick={handleToggle}
               className={`p-3.5 w-full rounded-2xl border flex items-center justify-between transition-all group ${
                 formData.isEnabled 
                 ? 'bg-purple-50 border-purple-100 ring-2 ring-purple-100/30' 
                 : 'bg-white border-gray-100 shadow-sm'
               }`}
             >
               <div className="flex items-center gap-3">
                 <div className={`p-2 rounded-xl transition-all ${
                   formData.isEnabled ? 'bg-[#6b2bd9] text-white shadow-md' : 'bg-gray-50 text-gray-400'
                 }`}>
                   <FiCheck size={14} />
                 </div>
                  <span className={`text-xs font-bold tracking-widest uppercase ${
                    formData.isEnabled ? 'text-[#6b2bd9]' : 'text-gray-700'
                  }`}>
                    Activity is {formData.isEnabled ? 'Enabled' : 'Disabled'}
                  </span>
               </div>
               <div className={`w-10 h-5 rounded-full relative transition-all ${formData.isEnabled ? 'bg-[#6b2bd9]' : 'bg-gray-200'}`}>
                 <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${
                   formData.isEnabled ? 'left-6' : 'left-1'
                 }`} />
               </div>
             </button>
           </div>
        </div>
      </div>
    </motion.div>
  );
};

const ActivityTypes = () => {
  const [view, setView] = useState('list');
  const [editingActivity, setEditingActivity] = useState(null);
  const [activities, setActivities] = useState([
    { id: 1, name: 'Public.ViewCategory', isEnabled: true },
    { id: 2, name: 'Public.ViewManufacturer', isEnabled: true },
    { id: 3, name: 'Public.ViewProduct', isEnabled: true },
    { id: 4, name: 'Admin.ViewOrders', isEnabled: true },
    { id: 5, name: 'Admin.ViewSettings', isEnabled: false },
  ]);

  const handleSave = (formData, continueEditing) => {
    if (editingActivity) {
      setActivities(prev => prev.map(a => a.id === editingActivity.id ? { ...formData, id: editingActivity.id } : a));
    } else {
      const nextId = Math.max(...activities.map(a => a.id), 0) + 1;
      setActivities(prev => [...prev, { ...formData, id: nextId }]);
    }
    
    if (!continueEditing) {
      setEditingActivity(null);
      setView('list');
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this activity type?')) {
      setActivities(prev => prev.filter(a => a.id !== id));
    }
  };

  const columns = [
    { 
      key: 'name', 
      label: 'Activity Name', 
      render: (v) => <span className="font-bold text-gray-800 tracking-tight">{v}</span> 
    },
    { 
      key: 'isEnabled', 
      label: 'Status', 
      render: (v) => (
        <div className="flex items-center">
            {v ? (
              <div className="p-1 px-3 bg-green-50 text-green-600 rounded-full flex items-center gap-2 border border-green-100 transition-all">
                  <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Active</span>
              </div>
            ) : (
              <div className="p-1 px-3 bg-red-50 text-red-400 rounded-full flex items-center gap-2 border border-red-100 transition-all">
                  <div className="w-1 h-1 rounded-full bg-red-400" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Inactive</span>
              </div>
            )}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-2 text-right">
          <button 
             onClick={() => { setEditingActivity(row); setView('form'); }}
             className="p-1.5 bg-purple-50 text-[#6b2bd9] rounded-lg hover:bg-[#6b2bd9] hover:text-white transition-all shadow-sm active:scale-95"
          >
            <FiEdit3 size={14} />
          </button>
          <button 
             onClick={() => handleDelete(row.id)}
             className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-95"
          >
            <FiTrash2 size={14} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 pb-20 text-left">
      <AnimatePresence mode="wait">
        {view === 'list' ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-visible relative">
              {/* Header section synchronized with Plans.jsx */}
              <div className="p-4 border-b border-gray-100 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-3 pr-4 border-r border-gray-100">
                    <div className="p-2 bg-purple-50 text-[#6b2bd9] rounded-lg shadow-sm">
                      <FiActivity size={20} />
                    </div>
                    <div>
                      <h1 className="text-sm font-bold text-gray-600 tracking-tight">Activity Types</h1>
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Behavioral Monitoring Index</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => { setEditingActivity(null); setView('form'); }}
                    className="px-6 py-2.5 bg-[#6b2bd9] text-white rounded-xl hover:bg-[#5b24b7] transition-all text-sm font-bold flex items-center gap-2 shadow-lg shadow-purple-100 active:scale-95"
                  >
                    <FiPlus size={18} />
                    <span>Add New Type</span>
                  </button>
                </div>
              </div>

              {/* Main Container */}
              <div className="p-0 overflow-x-auto min-h-[400px]">
                <DataTable 
                  data={activities}
                  columns={columns}
                  className="border-none shadow-none rounded-none"
                />
              </div>
            </div>
          </motion.div>
        ) : (
          <ActivityTypeForm 
            onBack={() => { setEditingActivity(null); setView('list'); }}
            onSave={handleSave}
            initialData={editingActivity}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ActivityTypes;
