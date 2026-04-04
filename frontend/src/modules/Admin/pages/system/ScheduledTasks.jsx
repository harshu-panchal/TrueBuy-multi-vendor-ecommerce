import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiFilter,
  FiPlus,
  FiTrash2,
  FiSearch,
  FiArrowLeft,
  FiSave,
  FiEdit3,
  FiType,
  FiSettings,
  FiCheck,
  FiX,
  FiClock,
  FiActivity,
  FiTerminal,
  FiPlay
} from 'react-icons/fi';
import DataTable from '../../components/DataTable';

const TaskForm = ({ onBack, onSave, onUpdate, initialData = null }) => {
  const isEdit = !!initialData;
  const [formData, setFormData] = useState(initialData || {
    id: '',                 
    name: '',            
    enabled: true,         
    cron: '0 0 * * *', 
    lastRun: '1 hour ago',                 
    nextRun: '23 hours from now',     
  });

  const handleSubmit = () => {
    if (isEdit) {
      onUpdate(formData);
    } else {
      onSave({ 
        ...formData, 
        id: formData.id || Math.floor(10 + Math.random() * 90).toString(), 
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
              {isEdit ? 'Configure Scheduled Task' : 'New Background Task'}
            </h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">
              {isEdit ? `Modifying Engine Routine` : 'Bind a new repeating system command'}
            </p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="px-8 py-3 bg-[#7e3af2] text-white rounded-xl hover:bg-[#6c2bd9] transition-all text-sm font-bold flex items-center gap-2 shadow-lg shadow-purple-100 active:scale-95"
        >
          <FiSave size={18} />
          <span>{isEdit ? 'Save Routine' : 'Create Routine'}</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden text-left">
        <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-[11px] font-bold uppercase text-gray-400 tracking-widest flex items-center gap-2">
            <FiActivity className="text-primary-500" /> Task Telemetry
          </h3>
        </div>
        <div className="p-10 space-y-12">
          
          <div>
             <h4 className="text-xs font-black text-gray-800 uppercase tracking-widest mb-6 border-b border-gray-100 pb-2 flex items-center gap-2"><FiSettings className="text-primary-400"/> Primary Constraints</h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-2 lg:col-span-1">
                 <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase px-1">Task Name</label>
                 <div className="relative group">
                   <FiType className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                   <input
                     type="text"
                     value={formData.name}
                     onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                     className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all placeholder:text-gray-300 shadow-sm"
                     placeholder="e.g. Refresh Data Cache"
                   />
                 </div>
               </div>

               <div className="space-y-2 lg:col-span-1">
                 <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase px-1">Cron Expression</label>
                 <div className="relative group">
                   <FiTerminal className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                   <input
                     type="text"
                     value={formData.cron}
                     onChange={(e) => setFormData({ ...formData, cron: e.target.value })}
                     className="w-full pl-12 pr-4 py-3.5 bg-slate-900 border border-slate-700 rounded-2xl text-sm font-mono text-green-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all placeholder:text-gray-600 shadow-sm"
                     placeholder="* * * * *"
                   />
                 </div>
               </div>

               <div className="space-y-2 lg:col-span-1">
                 <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase px-1">Last Run</label>
                 <div className="relative group">
                   <FiClock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                   <input
                     type="text"
                     value={formData.lastRun}
                     onChange={(e) => setFormData({ ...formData, lastRun: e.target.value })}
                     className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-gray-600 shadow-sm"
                   />
                 </div>
               </div>
               
               <div className="space-y-2 lg:col-span-1">
                 <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase px-1">Next Run In</label>
                 <div className="relative group">
                   <FiClock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                   <input
                     type="text"
                     value={formData.nextRun}
                     onChange={(e) => setFormData({ ...formData, nextRun: e.target.value })}
                     className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-gray-600 shadow-sm"
                   />
                 </div>
               </div>
             </div>
          </div>
          
          <div className="flex items-end">
             <div className={`p-6 rounded-3xl border border-gray-100 flex items-center justify-between cursor-pointer transition-all shadow-sm w-full md:w-1/2 ${formData.enabled ? 'bg-gradient-to-r from-green-50 to-emerald-50/20 shadow-green-100/50' : 'bg-gray-50/50'}`}
               onClick={() => setFormData({ ...formData, enabled: !formData.enabled })}
             >
                <div className="flex items-center gap-4">
                   <div className={`p-3 rounded-2xl ${formData.enabled ? 'bg-green-500 text-white shadow-lg shadow-green-200' : 'bg-white text-gray-400 shadow-sm border border-gray-100'}`}>
                      {formData.enabled ? <FiCheck size={20} /> : <FiX size={20} />}
                   </div>
                   <div>
                      <h5 className="text-xs font-black text-gray-800 uppercase tracking-widest mb-0.5">Task Engine</h5>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">{formData.enabled ? 'Routine is currently unbound' : 'Routine is paused'}</span>
                   </div>
                </div>
                <div
                  className={`w-14 h-8 rounded-full relative transition-all duration-300 shadow-inner ${formData.enabled ? 'bg-green-500' : 'bg-gray-200'}`}
                >
                  <motion.div
                    animate={{ x: formData.enabled ? 28 : 4 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="absolute top-1.5 w-5 h-5 rounded-full bg-white shadow-md"
                  />
                </div>
             </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ScheduledTasks = () => {
  const [view, setView] = useState('list');
  const [editingItem, setEditingItem] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showFilter, setShowFilter] = useState(false);
  
  // Filter States
  const [filters, setFilters] = useState({
    name: '',
  });

  const [tasks, setTasks] = useState([
    { 
       id: '1', 
       name: 'Send queued emails', 
       enabled: true, 
       cron: '*/5 * * * *', 
       lastRun: '2 minutes ago', 
       nextRun: '3 minutes from now'
    },
    { 
       id: '2', 
       name: 'Clear log file cache', 
       enabled: false, 
       cron: '0 0 * * 0', 
       lastRun: '1 week ago', 
       nextRun: 'Manual Trigger'
    }
  ]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(item => {
      return item.name.toLowerCase().includes(filters.name.toLowerCase());
    });
  }, [tasks, filters]);

  const handleResetFilters = () => setFilters({
    name: '',
  });

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedIds(new Set(filteredTasks.map(r => r.id)));
    else setSelectedIds(new Set());
  };

  const handleSelectRow = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const handleSaveItem = (newItem) => {
    setTasks([...tasks, newItem]);
    setView('list');
  };

  const handleUpdateItem = (updated) => {
    setTasks(tasks.map(r => r.id === updated.id ? updated : r));
    setView('list');
  };

  const handleDeleteItem = (id) => {
    if (window.confirm('Delete this scheduled routine?')) {
      setTasks(tasks.filter(r => r.id !== id));
      const newSelected = new Set(selectedIds);
      newSelected.delete(id);
      setSelectedIds(newSelected);
    }
  };

  const handleDeleteSelected = () => {
    if (window.confirm(`Permanently delete ${selectedIds.size} routines?`)) {
      setTasks(tasks.filter(r => !selectedIds.has(r.id)));
      setSelectedIds(new Set());
    }
  };

  const columns = [
    {
      key: 'checkbox',
      label: (
        <input
          type="checkbox"
          checked={selectedIds.size === filteredTasks.length && filteredTasks.length > 0}
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
      key: 'name',
      label: 'Name',
      render: (v) => (
        <div className="flex items-center gap-2 group">
          <div className="p-1.5 bg-gray-50 rounded-lg text-gray-400 transition-colors shadow-sm border border-gray-100">
            <FiActivity size={12} />
          </div>
          <span className="font-bold text-gray-800 tracking-tight text-xs">{v}</span>
        </div>
      )
    },
    {
      key: 'enabled',
      label: 'Enabled',
      render: (v) => v ?
        <div className="flex items-center justify-start ml-2"><FiCheck className="text-green-500 text-lg" /></div> :
        <div className="flex items-center justify-start ml-2 text-gray-200"><FiX className="text-lg" /></div>
    },
    {
      key: 'cron',
      label: 'Cron Expression',
      render: (v) => (
         <span className="text-[10px] font-mono text-green-600 bg-slate-900 border border-slate-800 rounded px-2.5 py-1 tracking-widest shadow-sm">
            {v}
         </span>
      )
    },
    {
      key: 'lastRun',
      label: 'Last Run',
      render: (v) => (
         <span className="text-[11px] font-bold text-gray-400 tracking-tight block">
            {v}
         </span>
      )
    },
    {
      key: 'nextRun',
      label: 'Next Run In',
      render: (v) => (
         <span className="text-[11px] font-bold text-indigo-500 tracking-tight block">
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
              setEditingItem(row);
              setView('edit');
            }}
            className="p-1.5 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors shadow-sm"
          >
            <FiEdit3 size={14} />
          </button>
          <button
            onClick={() => {
              alert(`Executing routine: ${row.name}`);
            }}
            className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors shadow-sm"
            title="Run Now"
          >
            <FiPlay size={14} />
          </button>
        </div>
      )
    }
  ];

  if (view !== 'list') {
    return (
      <TaskForm
        onBack={() => setView('list')}
        initialData={editingItem}
        onSave={handleSaveItem}
        onUpdate={handleUpdateItem}
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
                  <FiActivity />
               </div>
               <div>
                  <h1 className="text-sm font-bold text-gray-600 tracking-tight">Scheduled Tasks</h1>
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
              className="overflow-hidden bg-gray-50/50 border-b border-gray-100 text-left"
            >
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 px-1 font-black">
                    <FiSearch size={10} /> Task Name
                  </label>
                  <input
                    type="text"
                    value={filters.name}
                    onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                    placeholder="Search routines..."
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary-500/20 outline-none transition-all shadow-sm"
                  />
                </div>

                <div className="lg:col-span-2 flex items-center justify-between pt-6 border-t border-gray-200/50 mt-2">
                   <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Active Hits: {filteredTasks.length}</span>
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
            data={filteredTasks}
            columns={columns}
            pagination={true}
            itemsPerPage={10}
            className="border-none shadow-none rounded-none w-full"
          />

          {filteredTasks.length === 0 && (
            <div className="flex flex-col items-center justify-center p-24 bg-gray-50/20 space-y-4">
              <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 text-gray-200">
                <FiActivity size={48} />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">No routines bound</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Awaiting engine instructions</p>
              </div>
            </div>
          )}
        </div>

        {/* Action Bar Footer */}
        <div className="p-4 px-6 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shadow-sm shadow-indigo-200" />
                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">Total System Routines: {tasks.length}</span>
              </div>
           </div>
           
           <div className="flex items-center gap-2 text-gray-400">
              <FiSettings size={14} className="hover:text-primary-600 cursor-pointer transition-colors" />
           </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ScheduledTasks;
