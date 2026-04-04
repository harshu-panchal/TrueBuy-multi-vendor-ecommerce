import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiFilter,
  FiPlus,
  FiTrash2,
  FiCheck,
  FiMail,
  FiX,
  FiSearch,
  FiArrowLeft,
  FiSave,
  FiEdit3,
  FiInbox,
  FiGlobe,
  FiLayout,
  FiType,
  FiUsers as FiRoles,
  FiSettings
} from 'react-icons/fi';
import DataTable from '../../components/DataTable';

const SubscriberForm = ({ onBack, onSave, onUpdate, initialData = null }) => {
  const isEdit = !!initialData;
  const [formData, setFormData] = useState(initialData || {
    email: '',
    active: true,
    store: 'Main Store',
    roles: ['Registered'],
  });

  const handleSubmit = () => {
    if (isEdit) {
      onUpdate(formData);
    } else {
      onSave({ ...formData, id: Date.now().toString(), createdOn: new Date().toISOString().split('T')[0] });
    }
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
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              {isEdit ? 'Edit Subscriber' : 'New Subscriber'}
            </h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">
              {isEdit ? `Modifying: ${formData.email}` : 'Create a new outreach record'}
            </p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="px-8 py-3 bg-[#7e3af2] text-white rounded-xl hover:bg-[#6c2bd9] transition-all text-sm font-bold flex items-center gap-2 shadow-lg shadow-purple-100 active:scale-95"
        >
          <FiSave size={18} />
          <span>{isEdit ? 'Update Subscriber' : 'Save Subscriber'}</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-[11px] font-bold uppercase text-gray-400 tracking-widest flex items-center gap-2">
            <FiLayout className="text-primary-500" /> Subscription Details
          </h3>
        </div>
        <div className="p-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2 lg:col-span-1">
              <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase px-1">Email Address</label>
              <div className="relative group">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all placeholder:text-gray-300 shadow-sm"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase px-1">Target Store</label>
              <div className="relative group">
                <FiGlobe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                <select
                  value={formData.store}
                  onChange={(e) => setFormData({ ...formData, store: e.target.value })}
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none appearance-none transition-all cursor-pointer shadow-sm"
                >
                  <option value="Main Store">Main Store</option>
                  <option value="Secondary Store">Secondary Store</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-5 bg-gray-50/50 rounded-2xl border border-gray-100 flex items-center justify-between hover:bg-white hover:shadow-md transition-all group max-w-sm">
             <div className="flex items-center gap-4">
                <div className="p-2.5 bg-white rounded-xl text-primary-500 shadow-sm border border-primary-50 group-hover:bg-primary-50 group-hover:text-primary-600 transition-all">
                   <FiInbox size={20} />
                </div>
                <div>
                   <h5 className="text-[10px] font-black text-gray-800 uppercase tracking-widest">Active Subscription</h5>
                   <p className="text-[9px] text-gray-400 font-bold tracking-tight">Toggle to enable outreach</p>
                </div>
             </div>
             <button
               onClick={() => setFormData({ ...formData, active: !formData.active })}
               className={`w-12 h-6 rounded-full relative transition-all duration-300 shadow-inner ${formData.active ? 'bg-green-500 shadow-green-100' : 'bg-gray-200'}`}
             >
               <motion.div
                 animate={{ x: formData.active ? 26 : 2 }}
                 transition={{ type: "spring", stiffness: 500, damping: 30 }}
                 className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md flex items-center justify-center font-bold"
               >
                 {formData.active && <FiCheck className="text-green-600 text-[8px]" />}
               </motion.div>
             </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const NewsletterSubscribers = () => {
  const [view, setView] = useState('list');
  const [editingSubscriber, setEditingSubscriber] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showFilter, setShowFilter] = useState(false);
  
  // Filter States
  const [filters, setFilters] = useState({
    email: '',
    role: 'All',
    store: 'All'
  });

  const [subscribers, setSubscribers] = useState([]);

  const filteredSubscribers = useMemo(() => {
    return subscribers.filter(sub => {
      const matchEmail = sub.email.toLowerCase().includes(filters.email.toLowerCase());
      const matchRole = filters.role === 'All' || sub.roles.includes(filters.role);
      const matchStore = filters.store === 'All' || sub.store === filters.store;
      return matchEmail && matchRole && matchStore;
    });
  }, [subscribers, filters]);

  const handleResetFilters = () => setFilters({
    email: '',
    role: 'All',
    store: 'All'
  });

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedIds(new Set(filteredSubscribers.map(s => s.id)));
    else setSelectedIds(new Set());
  };

  const handleSelectRow = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const handleSaveSub = (newSub) => {
    setSubscribers([newSub, ...subscribers]);
    setView('list');
  };

  const handleUpdateSub = (updated) => {
    setSubscribers(subscribers.map(s => s.id === updated.id ? updated : s));
    setView('list');
  };

  const handleDeleteSub = (id) => {
    if (window.confirm('Delete this subscriber record?')) {
      setSubscribers(subscribers.filter(s => s.id !== id));
      const newSelected = new Set(selectedIds);
      newSelected.delete(id);
      setSelectedIds(newSelected);
    }
  };

  const handleDeleteSelected = () => {
    if (window.confirm(`Permanently delete ${selectedIds.size} records?`)) {
      setSubscribers(subscribers.filter(s => !selectedIds.has(s.id)));
      setSelectedIds(new Set());
    }
  };

  const columns = [
    {
      key: 'checkbox',
      label: (
        <input
          type="checkbox"
          checked={selectedIds.size === filteredSubscribers.length && filteredSubscribers.length > 0}
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
    {
      key: 'email',
      label: 'Email',
      render: (v) => (
        <div className="flex items-center gap-2 group">
          <div className="p-1.5 bg-gray-50 rounded-lg text-gray-400 group-hover:text-primary-600 transition-colors shadow-sm">
            <FiMail size={12} />
          </div>
          <span className="font-bold text-gray-800 tracking-tight">{v}</span>
        </div>
      )
    },
    {
      key: 'active',
      label: 'Active',
      render: (v) => v ?
        <div className="flex items-center justify-center"><FiCheck className="text-green-600 text-lg" /></div> :
        <div className="flex items-center justify-center text-gray-200"><FiX /></div>
    },
    {
      key: 'store',
      label: 'Store',
      render: (v) => (
        <span className="text-[10px] font-black text-gray-500 bg-gray-50/50 border border-gray-100 rounded px-2.5 py-1 uppercase tracking-widest">
          {v}
        </span>
      )
    },
    {
      key: 'createdOn',
      label: 'Created on ↓',
      render: (v) => (
        <span className="text-[10px] font-black text-gray-400 tracking-[0.1em]">
          {v}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2 justify-start pl-2">
          <button
            onClick={() => {
              setEditingSubscriber(row);
              setView('edit');
            }}
            className="p-1.5 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors shadow-sm"
          >
            <FiEdit3 size={14} />
          </button>
          <button
            onClick={() => handleDeleteSub(row.id)}
            className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors shadow-sm"
          >
            <FiTrash2 size={14} />
          </button>
        </div>
      )
    }
  ];

  if (view !== 'list') {
    return (
      <SubscriberForm
        onBack={() => setView('list')}
        initialData={editingSubscriber}
        onSave={handleSaveSub}
        onUpdate={handleUpdateSub}
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
        {/* Action Bar */}
        <div className="p-4 border-b border-gray-100 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3 pr-4 border-r border-gray-100">
               <div className="p-2 bg-primary-50 text-[#7e3af2] rounded-lg shadow-sm border border-primary-50">
                  <FiMail />
               </div>
               <div>
                  <h1 className="text-sm font-bold text-gray-600 tracking-tight">Subscribers</h1>
               </div>
            </div>

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
                  ? 'bg-[#7e3af2] text-white border-[#7e3af2]'
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
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 px-1 font-black">
                    <FiSearch size={10} /> Email
                  </label>
                  <input
                    type="text"
                    value={filters.email}
                    onChange={(e) => setFilters({ ...filters, email: e.target.value })}
                    placeholder="Search outreach records..."
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary-500/20 outline-none transition-all shadow-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 px-1 font-black">
                    <FiRoles size={10} /> Customer Role
                  </label>
                  <select
                    value={filters.role}
                    onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary-500/20 outline-none appearance-none transition-all cursor-pointer shadow-sm"
                  >
                    <option value="All">All Roles</option>
                    <option value="Registered">Registered</option>
                    <option value="Vendor">Vendor</option>
                    <option value="Administrator">Administrator</option>
                    <option value="Guest">Guest</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 px-1 font-black">
                    <FiGlobe size={10} /> Store
                  </label>
                  <select
                    value={filters.store}
                    onChange={(e) => setFilters({ ...filters, store: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary-500/20 outline-none appearance-none transition-all cursor-pointer shadow-sm"
                  >
                    <option value="All">All Stores</option>
                    <option value="Main Store">Main Store</option>
                    <option value="Secondary Store">Secondary Store</option>
                  </select>
                </div>

                <div className="lg:col-span-3 flex items-center justify-between pt-6 border-t border-gray-200/50 mt-2">
                   <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Active Hits: {filteredSubscribers.length}</span>
                   </div>
                   <button 
                     onClick={handleResetFilters}
                     className="text-[10px] font-black text-gray-400 hover:text-red-500 transition-colors uppercase tracking-[0.2em] flex items-center gap-2"
                   >
                     <FiX /> Reset Filters
                   </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Table View */}
        <div className="p-0 overflow-x-auto min-h-[400px]">
          <DataTable
            data={filteredSubscribers}
            columns={columns}
            pagination={true}
            itemsPerPage={10}
            className="border-none shadow-none rounded-none"
          />

          {filteredSubscribers.length === 0 && (
            <div className="flex flex-col items-center justify-center p-24 bg-gray-50/20 space-y-4">
              <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 text-gray-200">
                <FiMail size={48} />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">No subscribers found</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Adjust filters to broaden focus</p>
              </div>
            </div>
          )}
        </div>

        {/* Action Bar Footer */}
        <div className="p-4 px-6 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-sm shadow-green-200" />
                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">Outreach Pool: {subscribers.length} Records</span>
              </div>
              <div className="h-4 w-[1px] bg-gray-200" />
              <span className="text-[10px] font-black text-[#7e3af2] uppercase tracking-[0.1em]">Active Reach: {subscribers.filter(s => s.active).length}</span>
           </div>
           
           <div className="flex items-center gap-2 text-gray-400">
              <FiSettings size={14} className="hover:text-primary-600 cursor-pointer transition-colors" />
           </div>
        </div>
      </div>
    </motion.div>
  );
};

export default NewsletterSubscribers;
