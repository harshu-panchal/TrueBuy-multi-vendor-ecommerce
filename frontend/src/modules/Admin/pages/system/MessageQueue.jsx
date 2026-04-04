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
  FiMail,
  FiSettings,
  FiKey,
  FiUser,
  FiTag,
  FiCalendar,
  FiX,
  FiPaperclip,
  FiSend,
  FiClock,
  FiFileText,
  FiCheck
} from 'react-icons/fi';
import DataTable from '../../components/DataTable';

const QueueForm = ({ onBack, onSave, onUpdate, initialData = null }) => {
  const isEdit = !!initialData;
  const [formData, setFormData] = useState(initialData || {
    id: '',                 
    subject: '',            
    attachments: 0,         
    account: 'System Mail', 
    to: '',                 
    priority: 'Normal',     
    attempts: 0,            
    sentOn: '',             
    createdOn: new Date().toISOString().split('T')[0],
    manual: false,          
    from: 'noreply@trubuy.com',               
    cc: '',                 
    bcc: ''                 
  });

  const handleSubmit = () => {
    if (isEdit) {
      onUpdate(formData);
    } else {
      onSave({ 
        ...formData, 
        id: formData.id || Math.floor(100000 + Math.random() * 900000).toString(), 
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
              {isEdit ? 'Edit Queued Message' : 'New Dispatch Data'}
            </h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">
              {isEdit ? `Modifying Dispatch ID: ${formData.id}` : 'Create a manual queue manifest payload'}
            </p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="px-8 py-3 bg-[#7e3af2] text-white rounded-xl hover:bg-[#6c2bd9] transition-all text-sm font-bold flex items-center gap-2 shadow-lg shadow-purple-100 active:scale-95"
        >
          <FiSave size={18} />
          <span>{isEdit ? 'Update Payload' : 'Queue Message'}</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden text-left">
        <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-[11px] font-bold uppercase text-gray-400 tracking-widest flex items-center gap-2">
            <FiMail className="text-primary-500" /> Transmission Blueprint
          </h3>
        </div>
        <div className="p-10 space-y-12">
          
          {/* Header Metadata Group */}
          <div>
             <h4 className="text-xs font-black text-gray-800 uppercase tracking-widest mb-6 border-b border-gray-100 pb-2 flex items-center gap-2"><FiSettings className="text-primary-400"/> Primary Engine Metadata</h4>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase px-1">Queued Email ID</label>
                 <div className="relative group">
                   <FiKey className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                   <input
                     type="text"
                     value={formData.id}
                     onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                     className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all placeholder:text-gray-300 shadow-sm"
                     placeholder="Auto-generated"
                   />
                 </div>
               </div>

               <div className="space-y-2">
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
               
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase px-1">Message Priority</label>
                 <div className="relative group">
                   <FiTag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                   <select
                     value={formData.priority}
                     onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                     className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none appearance-none transition-all cursor-pointer shadow-sm"
                   >
                     <option value="High">High</option>
                     <option value="Normal">Normal</option>
                     <option value="Low">Low</option>
                   </select>
                 </div>
               </div>
               
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase px-1">Sent on</label>
                 <div className="relative group">
                   <FiClock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                   <input
                     type="date"
                     value={formData.sentOn}
                     onChange={(e) => setFormData({ ...formData, sentOn: e.target.value })}
                     className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-gray-600 shadow-sm"
                   />
                 </div>
               </div>

               <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase px-1">Sent attempts</label>
                 <div className="relative group">
                   <FiSend className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                   <input
                     type="number"
                     min="0"
                     value={formData.attempts}
                     onChange={(e) => setFormData({ ...formData, attempts: e.target.value })}
                     className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all shadow-sm"
                   />
                 </div>
               </div>
               
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase px-1">Email account</label>
                 <div className="relative group">
                   <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                   <input
                     type="text"
                     value={formData.account}
                     onChange={(e) => setFormData({ ...formData, account: e.target.value })}
                     className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all placeholder:text-gray-300 shadow-sm"
                     placeholder="e.g. System Mail"
                   />
                 </div>
               </div>
             </div>
          </div>

          {/* Routing Group */}
          <div>
             <h4 className="text-xs font-black text-gray-800 uppercase tracking-widest mb-6 border-b border-gray-100 pb-2 flex items-center gap-2"><FiSend className="text-blue-400"/> Routing Vectors</h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase px-1">From</label>
                 <div className="relative group">
                   <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                   <input
                     type="email"
                     value={formData.from}
                     onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                     className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all placeholder:text-gray-300 shadow-sm"
                   />
                 </div>
               </div>

               <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase px-1">To</label>
                 <div className="relative group">
                   <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                   <input
                     type="email"
                     value={formData.to}
                     onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                     className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all placeholder:text-gray-300 shadow-sm"
                   />
                 </div>
               </div>

               <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase px-1">Cc</label>
                 <div className="relative group">
                   <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                   <input
                     type="text"
                     value={formData.cc}
                     onChange={(e) => setFormData({ ...formData, cc: e.target.value })}
                     className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all placeholder:text-gray-300 shadow-sm"
                   />
                 </div>
               </div>

               <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase px-1">Bcc</label>
                 <div className="relative group">
                   <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                   <input
                     type="text"
                     value={formData.bcc}
                     onChange={(e) => setFormData({ ...formData, bcc: e.target.value })}
                     className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all placeholder:text-gray-300 shadow-sm"
                   />
                 </div>
               </div>
             </div>
          </div>
          
          {/* Content Group */}
          <div>
             <h4 className="text-xs font-black text-gray-800 uppercase tracking-widest mb-6 border-b border-gray-100 pb-2 flex items-center gap-2"><FiFileText className="text-indigo-400"/> Payload Manifest</h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-2 md:col-span-2">
                 <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase px-1">Subject</label>
                 <div className="relative group">
                   <FiType className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                   <input
                     type="text"
                     value={formData.subject}
                     onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                     className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all placeholder:text-gray-300 shadow-sm"
                     placeholder="Message Title"
                   />
                 </div>
               </div>
               
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase px-1">File attachments</label>
                 <div className="relative group">
                   <FiPaperclip className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                   <input
                     type="number"
                     min="0"
                     value={formData.attachments}
                     onChange={(e) => setFormData({ ...formData, attachments: e.target.value })}
                     className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all shadow-sm"
                   />
                 </div>
               </div>
               
               <div className="flex items-end">
                 <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 flex items-center justify-between hover:bg-white hover:shadow-md transition-all group w-full">
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-white rounded-xl text-primary-500 shadow-sm border border-primary-50">
                          <FiCheck size={16} />
                       </div>
                       <div>
                          <h5 className="text-[10px] font-black text-gray-800 uppercase tracking-widest">Only send manually</h5>
                       </div>
                    </div>
                    <button
                      onClick={() => setFormData({ ...formData, manual: !formData.manual })}
                      className={`w-12 h-6 rounded-full relative transition-all duration-300 shadow-inner ${formData.manual ? 'bg-indigo-500 shadow-indigo-100' : 'bg-gray-200'}`}
                    >
                      <motion.div
                        animate={{ x: formData.manual ? 26 : 2 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md flex items-center justify-center font-bold"
                      />
                    </button>
                 </div>
               </div>
               
             </div>
          </div>
          
        </div>
      </div>
    </motion.div>
  );
};

const MessageQueue = () => {
  const [view, setView] = useState('list');
  const [editingItem, setEditingItem] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showFilter, setShowFilter] = useState(false);
  
  // Filter States
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    from: '',
    to: '',
    loadManual: false,
    maxAttempts: '',
    loadNotSent: false,
  });
  
  const [globalSearch, setGlobalSearch] = useState('');

  const [queue, setQueue] = useState([
    { 
       id: '99120', 
       subject: 'Welcome to TruBuy!', 
       attachments: 0, 
       account: 'System Mail', 
       to: 'newuser@email.com', 
       priority: 'High', 
       attempts: 1, 
       sentOn: '2026-04-03', 
       createdOn: '2026-04-03', 
       manual: false, 
       from: 'noreply@trubuy.com', 
       cc: '', 
       bcc: '' 
    },
    { 
       id: '99121', 
       subject: 'Order #1094 Confirmation', 
       attachments: 1, 
       account: 'Sales Alert', 
       to: 'shopper@email.com', 
       priority: 'Normal', 
       attempts: 0, 
       sentOn: '', 
       createdOn: '2026-04-03', 
       manual: false, 
       from: 'sales@trubuy.com', 
       cc: '', 
       bcc: '' 
    }
  ]);

  const filteredQueue = useMemo(() => {
    return queue.filter(item => {
      const matchTo = item.to.toLowerCase().includes(filters.to.toLowerCase());
      const matchFrom = item.from.toLowerCase().includes(filters.from.toLowerCase());
      const matchManual = !filters.loadManual || item.manual === true;
      const matchNotSent = !filters.loadNotSent || !item.sentOn;
      const matchAttempts = !filters.maxAttempts || item.attempts <= parseInt(filters.maxAttempts);
      
      let matchDate = true;
      if (filters.startDate) {
        matchDate = matchDate && new Date(item.createdOn) >= new Date(filters.startDate);
      }
      if (filters.endDate) {
        matchDate = matchDate && new Date(item.createdOn) <= new Date(filters.endDate);
      }
      
      const matchGlobal = !globalSearch 
        || item.subject.toLowerCase().includes(globalSearch.toLowerCase())
        || item.to.toLowerCase().includes(globalSearch.toLowerCase())
        || item.from.toLowerCase().includes(globalSearch.toLowerCase());
      
      return matchTo && matchFrom && matchManual && matchNotSent && matchAttempts && matchDate && matchGlobal;
    });
  }, [queue, filters, globalSearch]);

  const handleResetFilters = () => setFilters({
    startDate: '',
    endDate: '',
    from: '',
    to: '',
    loadManual: false,
    maxAttempts: '',
    loadNotSent: false,
  });

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedIds(new Set(filteredQueue.map(r => r.id)));
    else setSelectedIds(new Set());
  };

  const handleSelectRow = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const handleSaveItem = (newItem) => {
    setQueue([newItem, ...queue]);
    setView('list');
  };

  const handleUpdateItem = (updated) => {
    setQueue(queue.map(r => r.id === updated.id ? updated : r));
    setView('list');
  };

  const handleDeleteItem = (id) => {
    if (window.confirm('Delete this queued message?')) {
      setQueue(queue.filter(r => r.id !== id));
      const newSelected = new Set(selectedIds);
      newSelected.delete(id);
      setSelectedIds(newSelected);
    }
  };

  const handleDeleteSelected = () => {
    if (window.confirm(`Permanently delete ${selectedIds.size} records?`)) {
      setQueue(queue.filter(r => !selectedIds.has(r.id)));
      setSelectedIds(new Set());
    }
  };

  const columns = [
    {
      key: 'checkbox',
      label: (
        <input
          type="checkbox"
          checked={selectedIds.size === filteredQueue.length && filteredQueue.length > 0}
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
      label: 'Queued email ID',
      render: (v) => (
        <span className="text-[10px] font-black text-gray-500 bg-gray-50 border border-gray-100 rounded px-2 py-1 uppercase tracking-widest">
          #{v}
        </span>
      )
    },
    {
      key: 'subject',
      label: 'Subject',
      render: (v) => (
        <div className="flex items-center gap-2 group max-w-[200px]">
          <div className="p-1.5 bg-gray-50 rounded-lg text-gray-400 transition-colors shadow-sm border border-gray-100">
            <FiMail size={12} />
          </div>
          <span className="font-bold text-gray-800 tracking-tight text-xs truncate" title={v}>{v}</span>
        </div>
      )
    },
    {
      key: 'attachments',
      label: 'File attachments',
      render: (v) => (
         <div className="flex items-center gap-1.5 pl-4">
            <FiPaperclip size={12} className={v > 0 ? "text-primary-500" : "text-gray-300"}/>
            <span className={`text-[10px] font-black ${v > 0 ? "text-primary-600" : "text-gray-400"}`}>{v}</span>
         </div>
      )
    },
    {
      key: 'account',
      label: 'Email account',
      render: (v) => (
        <span className="text-[9px] font-black text-indigo-500 bg-indigo-50/50 border border-indigo-100 rounded px-2 py-1 uppercase tracking-widest">
          {v}
        </span>
      )
    },
    {
      key: 'to',
      label: 'To',
      render: (v) => (
         <span className="text-[11px] font-bold text-gray-600 truncate max-w-[120px] block" title={v}>
            {v}
         </span>
      )
    },
    {
      key: 'priority',
      label: 'Message Priority',
      render: (v) => {
        let colorClass = "text-gray-500 bg-gray-50";
        if(v === 'High') colorClass = "text-red-500 bg-red-50";
        if(v === 'Low') colorClass = "text-blue-500 bg-blue-50";
        return (
          <span className={`text-[9px] font-black border border-gray-100 rounded px-2 py-1 uppercase tracking-widest ${colorClass}`}>
            {v}
          </span>
        )
      }
    },
    {
      key: 'attempts',
      label: 'Sent attempts',
      render: (v) => (
         <span className="text-[10px] font-black text-gray-600 pl-4 block">{v}</span>
      )
    },
    {
      key: 'sentOn',
      label: 'Sent on',
      render: (v) => (
        <span className="text-[9px] font-black text-green-500 uppercase tracking-[0.1em]">
          {v || 'Pending'}
        </span>
      )
    },
    {
      key: 'createdOn',
      label: 'Created on',
      render: (v) => (
        <span className="text-[9px] font-black text-gray-400 tracking-[0.1em]">
          {v}
        </span>
      )
    },
    {
      key: 'manual',
      label: 'Only send manually',
      render: (v) => v ?
        <div className="flex items-center justify-start ml-4"><FiCheck className="text-primary-600 text-lg" /></div> :
        <div className="flex items-center justify-start ml-4 text-gray-200"><FiX /></div>
    },
    {
      key: 'from',
      label: 'From',
      render: (v) => (
         <span className="text-[11px] font-bold text-gray-400 truncate max-w-[120px] block" title={v}>
            {v}
         </span>
      )
    },
    {
      key: 'cc',
      label: 'Cc',
      render: (v) => (
         <span className="text-[10px] font-bold text-gray-400 truncate max-w-[80px] block" title={v}>
            {v || '—'}
         </span>
      )
    },
    {
      key: 'bcc',
      label: 'Bcc',
      render: (v) => (
         <span className="text-[10px] font-bold text-gray-400 truncate max-w-[80px] block" title={v}>
            {v || '—'}
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
            onClick={() => handleDeleteItem(row.id)}
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
      <QueueForm
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
                  <FiMail />
               </div>
               <div>
                  <h1 className="text-sm font-bold text-gray-600 tracking-tight">Message Queue</h1>
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

          <div className="flex items-center gap-3">
             <div className="relative group hidden md:block w-56">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                <input
                  type="text"
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  placeholder="Universal search..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all shadow-sm placeholder:text-gray-400 text-gray-700"
                />
             </div>
             
             <button
               onClick={() => {
                 if (window.confirm("Are you sure you want to clean up and remove all successfully sent emails from the queue?")) {
                   setQueue(queue.filter(r => !r.sentOn));
                   setSelectedIds(new Set());
                 }
               }}
               className="px-4 py-2.5 rounded-xl border bg-white text-gray-600 border-gray-200 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-all text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-sm"
             >
               <FiTrash2 className="text-xs" />
               <span>Cleanup</span>
             </button>

            <button
              onClick={() => setShowFilter(!showFilter)}
              className={`px-4 py-2.5 rounded-xl border transition-all text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-sm ${
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
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 px-1">
                    <FiCalendar size={10} /> Start date
                  </label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary-500/20 outline-none transition-all shadow-sm text-gray-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 px-1">
                    <FiCalendar size={10} /> End date
                  </label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary-500/20 outline-none transition-all shadow-sm text-gray-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 px-1">
                    <FiUser size={10} /> From address
                  </label>
                  <input
                    type="text"
                    value={filters.from}
                    onChange={(e) => setFilters({ ...filters, from: e.target.value })}
                    placeholder="Search origin addresses..."
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary-500/20 outline-none transition-all shadow-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 px-1">
                    <FiUser size={10} /> To address
                  </label>
                  <input
                    type="text"
                    value={filters.to}
                    onChange={(e) => setFilters({ ...filters, to: e.target.value })}
                    placeholder="Search destination addresses..."
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary-500/20 outline-none transition-all shadow-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 px-1">
                    <FiSettings size={10} /> Maximum send attempts
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={filters.maxAttempts}
                    onChange={(e) => setFilters({ ...filters, maxAttempts: e.target.value })}
                    placeholder="e.g. 3"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary-500/20 outline-none transition-all shadow-sm"
                  />
                </div>

                <div className="lg:col-span-1" />

                <div className="space-y-4 lg:col-span-3 pb-2 pt-2 border-t border-gray-100 flex flex-wrap gap-8">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all shadow-sm ${filters.loadManual ? 'bg-indigo-500 border-indigo-500 text-white' : 'bg-white border-gray-300 text-transparent group-hover:border-indigo-400'}`}>
                      <FiCheck size={12} />
                    </div>
                    <input 
                      type="checkbox" 
                      className="hidden" 
                      checked={filters.loadManual} 
                      onChange={(e) => setFilters({...filters, loadManual: e.target.checked})} 
                    />
                    <span className="text-[11px] font-black text-gray-600 uppercase tracking-widest">Load emails manually send only</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all shadow-sm ${filters.loadNotSent ? 'bg-red-500 border-red-500 text-white' : 'bg-white border-gray-300 text-transparent group-hover:border-red-400'}`}>
                      <FiCheck size={12} />
                    </div>
                    <input 
                      type="checkbox" 
                      className="hidden" 
                      checked={filters.loadNotSent} 
                      onChange={(e) => setFilters({...filters, loadNotSent: e.target.checked})} 
                    />
                    <span className="text-[11px] font-black text-gray-600 uppercase tracking-widest">Load not sent emails only</span>
                  </label>
                </div>

                <div className="lg:col-span-3 flex items-center justify-between pt-6 border-t border-gray-200/50 mt-2">
                   <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Active Hits: {filteredQueue.length}</span>
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
            data={filteredQueue}
            columns={columns}
            pagination={true}
            itemsPerPage={10}
            className="border-none shadow-none rounded-none w-[1600px] xl:w-full"
          />

          {filteredQueue.length === 0 && (
            <div className="flex flex-col items-center justify-center p-24 bg-gray-50/20 space-y-4">
              <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 text-gray-200">
                <FiMail size={48} />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">Queue empty</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Transmission lines are clear</p>
              </div>
            </div>
          )}
        </div>

        {/* Action Bar Footer */}
        <div className="p-4 px-6 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-sm shadow-green-200" />
                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">Total Items Built: {queue.length}</span>
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

export default MessageQueue;
