import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiFilter,
  FiPlus,
  FiTrash2,
  FiCheck,
  FiCpu,
  FiX,
  FiSearch,
  FiArrowLeft,
  FiSave,
  FiEdit3,
  FiInbox,
  FiGlobe,
  FiLayout,
  FiType,
  FiShield,
  FiSettings,
  FiKey
} from 'react-icons/fi';
import DataTable from '../../components/DataTable';

const RuleForm = ({ onBack, onSave, onUpdate, initialData = null }) => {
  const isEdit = !!initialData;
  const [formData, setFormData] = useState(initialData || {
    id: '',
    name: '',
    scope: 'Global',
    active: true,
    createdOn: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = () => {
    if (isEdit) {
      onUpdate(formData);
    } else {
      onSave({ 
        ...formData, 
        id: formData.id || Math.floor(1000 + Math.random() * 9000).toString(), 
        createdOn: formData.createdOn || new Date().toISOString().split('T')[0] 
      });
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
              {isEdit ? 'Edit Rule' : 'New Rule'}
            </h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">
              {isEdit ? `Modifying: ${formData.name}` : 'Create a new system rule pattern'}
            </p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="px-8 py-3 bg-[#7e3af2] text-white rounded-xl hover:bg-[#6c2bd9] transition-all text-sm font-bold flex items-center gap-2 shadow-lg shadow-purple-100 active:scale-95"
        >
          <FiSave size={18} />
          <span>{isEdit ? 'Update Rule' : 'Save Rule'}</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden text-left">
        <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-[11px] font-bold uppercase text-gray-400 tracking-widest flex items-center gap-2">
            <FiLayout className="text-primary-500" /> Rule Configuration
          </h3>
        </div>
        <div className="p-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2 lg:col-span-1">
              <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase px-1">Rule ID</label>
              <div className="relative group">
                <FiKey className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                <input
                  type="text"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all placeholder:text-gray-300 shadow-sm"
                  placeholder="e.g., 1003 (Optional)"
                />
              </div>
            </div>

            <div className="space-y-2 lg:col-span-1">
              <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase px-1">Created on</label>
              <div className="relative group">
                <FiLayout className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                <input
                  type="date"
                  value={formData.createdOn}
                  onChange={(e) => setFormData({ ...formData, createdOn: e.target.value })}
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-gray-600 shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-2 lg:col-span-1">
              <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase px-1">Rule Name</label>
              <div className="relative group">
                <FiType className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all placeholder:text-gray-300 shadow-sm"
                  placeholder="e.g., Block Suspicious IPs"
                />
              </div>
            </div>

            <div className="space-y-2 lg:col-span-1">
              <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase px-1">Scope</label>
              <div className="relative group">
                <FiGlobe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                <select
                  value={formData.scope}
                  onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none appearance-none transition-all cursor-pointer shadow-sm"
                >
                  <option value="Global">Global</option>
                  <option value="Cart">Cart</option>
                  <option value="Customer">Customer</option>
                  <option value="Product">Product</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-5 bg-gray-50/50 rounded-2xl border border-gray-100 flex items-center justify-between hover:bg-white hover:shadow-md transition-all group max-w-sm">
             <div className="flex items-center gap-4">
                <div className="p-2.5 bg-white rounded-xl text-primary-500 shadow-sm border border-primary-50 group-hover:bg-primary-50 group-hover:text-primary-600 transition-all">
                   <FiShield size={20} />
                </div>
                <div>
                   <h5 className="text-[10px] font-black text-gray-800 uppercase tracking-widest">Rule Status</h5>
                   <p className="text-[9px] text-gray-400 font-bold tracking-tight">Toggle to activate this rule</p>
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

const Rules = () => {
  const [view, setView] = useState('list');
  const [editingRule, setEditingRule] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showFilter, setShowFilter] = useState(false);
  
  // Filter States
  const [filters, setFilters] = useState({
    name: '',
    scope: 'All',
  });

  const [rules, setRules] = useState([
    { id: '1001', name: 'Must be shipped', scope: 'Cart', active: true, createdOn: '2026-04-03' },
    { id: '1002', name: 'VIP Discount Applied', scope: 'Customer', active: false, createdOn: '2026-04-01' }
  ]);

  const filteredRules = useMemo(() => {
    return rules.filter(rule => {
      const matchName = rule.name.toLowerCase().includes(filters.name.toLowerCase());
      const matchScope = filters.scope === 'All' || rule.scope === filters.scope;
      return matchName && matchScope;
    });
  }, [rules, filters]);

  const handleResetFilters = () => setFilters({
    name: '',
    scope: 'All',
  });

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedIds(new Set(filteredRules.map(r => r.id)));
    else setSelectedIds(new Set());
  };

  const handleSelectRow = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const handleSaveRule = (newRule) => {
    setRules([newRule, ...rules]);
    setView('list');
  };

  const handleUpdateRule = (updated) => {
    setRules(rules.map(r => r.id === updated.id ? updated : r));
    setView('list');
  };

  const handleDeleteRule = (id) => {
    if (window.confirm('Delete this rule record?')) {
      setRules(rules.filter(r => r.id !== id));
      const newSelected = new Set(selectedIds);
      newSelected.delete(id);
      setSelectedIds(newSelected);
    }
  };

  const handleDeleteSelected = () => {
    if (window.confirm(`Permanently delete ${selectedIds.size} records?`)) {
      setRules(rules.filter(r => !selectedIds.has(r.id)));
      setSelectedIds(new Set());
    }
  };

  const columns = [
    {
      key: 'checkbox',
      label: (
        <input
          type="checkbox"
          checked={selectedIds.size === filteredRules.length && filteredRules.length > 0}
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
      key: 'id',
      label: 'ID',
      render: (v) => (
        <span className="text-[10px] font-black text-gray-500 bg-gray-50 border border-gray-100 rounded px-2 py-1 uppercase tracking-widest">
          #{v}
        </span>
      )
    },
    {
      key: 'name',
      label: 'Name',
      render: (v) => (
        <div className="flex items-center gap-2 group">
          <div className="p-1.5 bg-gray-50 rounded-lg text-gray-400 group-hover:text-primary-600 transition-colors shadow-sm">
            <FiCpu size={12} />
          </div>
          <span className="font-bold text-gray-800 tracking-tight">{v}</span>
        </div>
      )
    },
    {
      key: 'scope',
      label: 'Scope',
      render: (v) => (
        <span className="text-[10px] font-black text-gray-500 bg-gray-50/50 border border-gray-100 rounded px-2.5 py-1 uppercase tracking-widest">
          {v}
        </span>
      )
    },
    {
      key: 'active',
      label: 'Is active',
      render: (v) => v ?
        <div className="flex items-center justify-start ml-4"><FiCheck className="text-green-600 text-lg" /></div> :
        <div className="flex items-center justify-start ml-4 text-gray-200"><FiX /></div>
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
              setEditingRule(row);
              setView('edit');
            }}
            className="p-1.5 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors shadow-sm"
          >
            <FiEdit3 size={14} />
          </button>
          <button
            onClick={() => handleDeleteRule(row.id)}
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
      <RuleForm
        onBack={() => setView('list')}
        initialData={editingRule}
        onSave={handleSaveRule}
        onUpdate={handleUpdateRule}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-20 text-left"
    >
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-visible relative">
        {/* Action Bar */}
        <div className="p-4 border-b border-gray-100 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3 pr-4 border-r border-gray-100">
               <div className="p-2 bg-primary-50 text-[#7e3af2] rounded-lg shadow-sm border border-primary-50">
                  <FiCpu />
               </div>
               <div>
                  <h1 className="text-sm font-bold text-gray-600 tracking-tight">System Rules</h1>
               </div>
            </div>

            <button
               onClick={() => {
                 setEditingRule(null);
                 setView('add');
               }}
               className="px-6 py-2.5 bg-[#7e3af2] text-white rounded-xl hover:bg-[#6c2bd9] transition-all text-sm font-bold flex items-center gap-2 shadow-sm active:scale-95"
            >
               <FiPlus size={16} />
               <span>Add New Rule</span>
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
              className="overflow-hidden bg-gray-50/50 border-b border-gray-100 text-left"
            >
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 px-1 font-black">
                    <FiSearch size={10} /> Rule Name
                  </label>
                  <input
                    type="text"
                    value={filters.name}
                    onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                    placeholder="Search logic patterns..."
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary-500/20 outline-none transition-all shadow-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 px-1 font-black">
                    <FiGlobe size={10} /> Scope
                  </label>
                  <select
                    value={filters.scope}
                    onChange={(e) => setFilters({ ...filters, scope: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary-500/20 outline-none appearance-none transition-all cursor-pointer shadow-sm"
                  >
                    <option value="All">All Scopes</option>
                    <option value="Global">Global</option>
                    <option value="Cart">Cart</option>
                    <option value="Customer">Customer</option>
                    <option value="Product">Product</option>
                  </select>
                </div>

                <div className="lg:col-span-2 flex items-center justify-between pt-6 border-t border-gray-200/50 mt-2">
                   <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Active Hits: {filteredRules.length}</span>
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
            data={filteredRules}
            columns={columns}
            pagination={true}
            itemsPerPage={10}
            className="border-none shadow-none rounded-none"
          />

          {filteredRules.length === 0 && (
            <div className="flex flex-col items-center justify-center p-24 bg-gray-50/20 space-y-4">
              <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 text-gray-200">
                <FiCpu size={48} />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">No system rules found</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Adjust filters or create a new logic pattern</p>
              </div>
            </div>
          )}
        </div>

        {/* Action Bar Footer */}
        <div className="p-4 px-6 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-sm shadow-green-200" />
                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">Engines: {rules.length} Rules</span>
              </div>
              <div className="h-4 w-[1px] bg-gray-200" />
              <span className="text-[10px] font-black text-[#7e3af2] uppercase tracking-[0.1em]">Active Processing: {rules.filter(r => r.active).length}</span>
           </div>
           
           <div className="flex items-center gap-2 text-gray-400">
              <FiSettings size={14} className="hover:text-primary-600 cursor-pointer transition-colors" />
           </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Rules;
