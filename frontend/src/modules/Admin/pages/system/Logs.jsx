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
  FiFileText,
  FiSettings,
  FiKey,
  FiUser,
  FiTag,
  FiCalendar,
  FiX,
  FiEye
} from 'react-icons/fi';
import DataTable from '../../components/DataTable';

const LogForm = ({ onBack, onSave, onUpdate, initialData = null }) => {
  const isEdit = !!initialData;
  const [formData, setFormData] = useState(initialData || {
    id: '',
    logger: 'System',
    message: '',
    username: '',
    createdOn: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = () => {
    if (isEdit) {
      onUpdate(formData);
    } else {
      onSave({ 
        ...formData, 
        id: formData.id || Math.floor(10000 + Math.random() * 90000).toString(), 
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
              View Log Entry
            </h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">
              Reviewing Log ID: {formData.id}
            </p>
          </div>
        </div>

        <button
          onClick={onBack}
          className="px-8 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-sm font-bold flex items-center gap-2 shadow-sm active:scale-95"
        >
          <span>Done Exploring</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden text-left">
        <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-[11px] font-bold uppercase text-gray-400 tracking-widest flex items-center gap-2">
            <FiFileText className="text-primary-500" /> Log Details
          </h3>
        </div>
        <div className="p-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2 lg:col-span-1">
              <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase px-1">Log ID</label>
              <div className="relative group">
                <FiKey className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                <input
                  type="text"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all placeholder:text-gray-300 shadow-sm"
                  placeholder="e.g., 5013 (Optional)"
                />
              </div>
            </div>

            <div className="space-y-2 lg:col-span-1">
              <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase px-1">Created on</label>
              <div className="relative group">
                <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                <input
                  type="date"
                  value={formData.createdOn}
                  onChange={(e) => setFormData({ ...formData, createdOn: e.target.value })}
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-gray-600 shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-2 lg:col-span-1">
              <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase px-1">Logger</label>
              <div className="relative group">
                <FiTag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                <input
                  type="text"
                  value={formData.logger}
                  onChange={(e) => setFormData({ ...formData, logger: e.target.value })}
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all placeholder:text-gray-300 shadow-sm"
                  placeholder="e.g., AuthProvider, Database"
                />
              </div>
            </div>

            <div className="space-y-2 lg:col-span-1">
              <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase px-1">Username</label>
              <div className="relative group">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all placeholder:text-gray-300 shadow-sm"
                  placeholder="e.g., admin@trubuy.com"
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase px-1">Short message</label>
              <div className="relative group">
                <FiType className="absolute left-4 top-4 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all placeholder:text-gray-300 shadow-sm min-h-[120px] resize-y"
                  placeholder="Describe the log event..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Logs = () => {
  const [view, setView] = useState('list');
  const [editingLog, setEditingLog] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showFilter, setShowFilter] = useState(false);
  
  // Filter States
  const [filters, setFilters] = useState({
    message: '',
    logger: 'All',
  });

  const [logs, setLogs] = useState([
    { id: '10045', logger: 'Authentication', message: 'Admin login successfully.', username: 'admin', createdOn: '2026-04-03' },
    { id: '10046', logger: 'PaymentGateway', message: 'Failed to process payment capture.', username: 'system', createdOn: '2026-04-02' }
  ]);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchMessage = log.message.toLowerCase().includes(filters.message.toLowerCase());
      const matchLogger = filters.logger === 'All' || log.logger === filters.logger;
      return matchMessage && matchLogger;
    });
  }, [logs, filters]);

  const handleResetFilters = () => setFilters({
    message: '',
    logger: 'All',
  });

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedIds(new Set(filteredLogs.map(r => r.id)));
    else setSelectedIds(new Set());
  };

  const handleSelectRow = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const handleSaveLog = (newLog) => {
    setLogs([newLog, ...logs]);
    setView('list');
  };

  const handleUpdateLog = (updated) => {
    setLogs(logs.map(r => r.id === updated.id ? updated : r));
    setView('list');
  };

  const handleDeleteLog = (id) => {
    if (window.confirm('Delete this system log?')) {
      setLogs(logs.filter(r => r.id !== id));
      const newSelected = new Set(selectedIds);
      newSelected.delete(id);
      setSelectedIds(newSelected);
    }
  };

  const handleDeleteSelected = () => {
    if (window.confirm(`Permanently delete ${selectedIds.size} records?`)) {
      setLogs(logs.filter(r => !selectedIds.has(r.id)));
      setSelectedIds(new Set());
    }
  };

  const columns = [
    {
      key: 'checkbox',
      label: (
        <input
          type="checkbox"
          checked={selectedIds.size === filteredLogs.length && filteredLogs.length > 0}
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
      key: 'logger',
      label: 'Logger',
      render: (v) => (
        <span className="text-[10px] font-black text-indigo-500 bg-indigo-50/50 border border-indigo-100 rounded px-2.5 py-1 uppercase tracking-widest">
          {v}
        </span>
      )
    },
    {
      key: 'message',
      label: 'Short message',
      render: (v) => (
        <div className="flex items-center gap-2 group max-w-sm cursor-default">
          <div className="p-1.5 bg-gray-50 rounded-lg text-gray-400 transition-colors shadow-sm border border-gray-100">
            <FiFileText size={12} />
          </div>
          <span className="font-bold text-gray-800 tracking-tight text-xs truncate" title={v}>{v}</span>
        </div>
      )
    },
    {
      key: 'username',
      label: 'Username',
      render: (v) => (
         <span className="text-xs font-bold text-gray-600">
            {v ? `@${v}` : '—'}
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
              setEditingLog(row);
              setView('edit');
            }}
            className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors shadow-sm"
          >
            <FiEye size={14} />
          </button>
        </div>
      )
    }
  ];

  if (view !== 'list') {
    return (
      <LogForm
        onBack={() => setView('list')}
        initialData={editingLog}
        onSave={handleSaveLog}
        onUpdate={handleUpdateLog}
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
                  <FiFileText />
               </div>
               <div>
                  <h1 className="text-sm font-bold text-gray-600 tracking-tight">System Logs</h1>
               </div>
            </div>

            <button
               onClick={() => {
                 if (window.confirm('Are you sure you want to completely purge all system logs?')) {
                   setLogs([]);
                   setSelectedIds(new Set());
                 }
               }}
               className="px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all text-sm font-bold flex items-center gap-2 shadow-sm active:scale-95"
            >
               <FiTrash2 size={16} />
               <span>Clear Logs</span>
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
                    <FiSearch size={10} /> Message Extract
                  </label>
                  <input
                    type="text"
                    value={filters.message}
                    onChange={(e) => setFilters({ ...filters, message: e.target.value })}
                    placeholder="Search event traces..."
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary-500/20 outline-none transition-all shadow-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 px-1 font-black">
                    <FiTag size={10} /> Logger Reference
                  </label>
                  <select
                    value={filters.logger}
                    onChange={(e) => setFilters({ ...filters, logger: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary-500/20 outline-none appearance-none transition-all cursor-pointer shadow-sm"
                  >
                    <option value="All">All Loggers</option>
                    <option value="Authentication">Authentication</option>
                    <option value="PaymentGateway">PaymentGateway</option>
                    <option value="Database">Database</option>
                    <option value="System">System</option>
                  </select>
                </div>

                <div className="lg:col-span-2 flex items-center justify-between pt-6 border-t border-gray-200/50 mt-2">
                   <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Active Traces: {filteredLogs.length}</span>
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
            data={filteredLogs}
            columns={columns}
            pagination={true}
            itemsPerPage={10}
            className="border-none shadow-none rounded-none"
          />

          {filteredLogs.length === 0 && (
            <div className="flex flex-col items-center justify-center p-24 bg-gray-50/20 space-y-4">
              <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 text-gray-200">
                <FiFileText size={48} />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">No log events found</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Adjust filters or await system activity</p>
              </div>
            </div>
          )}
        </div>

        {/* Action Bar Footer */}
        <div className="p-4 px-6 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-sm shadow-blue-200" />
                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">Total Log Volume: {logs.length} Traces</span>
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

export default Logs;
