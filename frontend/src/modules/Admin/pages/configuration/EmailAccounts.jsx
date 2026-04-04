import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiMail, 
  FiPlus, 
  FiEdit3, 
  FiTrash2, 
  FiCheck, 
  FiMinus, 
  FiArrowLeft, 
  FiSave,
  FiServer,
  FiShield,
  FiUser,
  FiLock,
  FiGlobe
} from 'react-icons/fi';
import DataTable from '../../components/DataTable';

const EmailAccountForm = ({ onBack, onSave, initialData = null }) => {
  const isEdit = !!initialData;
  const [formData, setFormData] = useState({
    email: '',
    displayName: '',
    host: '',
    port: 587,
    user: '',
    password: '',
    useSSL: false,
    isDefault: false,
    ...(initialData || {})
  });

  const handleToggle = (field) => {
    setFormData(prev => ({ ...prev, [field]: !prev[field] }));
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
              {isEdit ? `Edit account - ${formData.email}` : 'Add a new email account'}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10">
           <div className="space-y-2">
             <label className="text-xs font-bold text-gray-700 tracking-widest uppercase px-1">
               Email Address
             </label>
             <input
               type="email"
               value={formData.email}
               onChange={(e) => setFormData({ ...formData, email: e.target.value })}
               className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] focus:bg-white outline-none transition-all"
               placeholder="notifications@trubuy.com"
             />
           </div>

           <div className="space-y-2">
             <label className="text-xs font-bold text-gray-700 tracking-widest uppercase px-1">
               Display Name
             </label>
             <input
               type="text"
               value={formData.displayName}
               onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
               className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] focus:bg-white outline-none transition-all"
               placeholder="TruBuy Support"
             />
           </div>

           <div className="space-y-2">
             <label className="text-xs font-bold text-gray-700 tracking-widest uppercase px-1">
               Host (SMTP)
             </label>
             <input
               type="text"
               value={formData.host}
               onChange={(e) => setFormData({ ...formData, host: e.target.value })}
               className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] focus:bg-white outline-none transition-all"
               placeholder="smtp.gmail.com"
             />
           </div>

           <div className="space-y-2">
             <label className="text-xs font-bold text-gray-700 tracking-widest uppercase px-1">
               Port
             </label>
             <input
               type="number"
               value={formData.port}
               onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) || 0 })}
               className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] focus:bg-white outline-none transition-all"
               placeholder="587"
             />
           </div>

           <div className="space-y-2">
             <label className="text-xs font-bold text-gray-700 tracking-widest uppercase px-1">
               Auth User
             </label>
             <input
               type="text"
               value={formData.user}
               onChange={(e) => setFormData({ ...formData, user: e.target.value })}
               className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] focus:bg-white outline-none transition-all"
             />
           </div>

           <div className="space-y-2">
             <label className="text-xs font-bold text-gray-700 tracking-widest uppercase px-1">
               Auth Password
             </label>
             <input
               type="password"
               value={formData.password}
               onChange={(e) => setFormData({ ...formData, password: e.target.value })}
               className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] focus:bg-white outline-none transition-all"
             />
           </div>

           <div className="space-y-2">
             <label className="text-xs font-bold text-gray-700 tracking-widest uppercase px-1">Security</label>
             <button
               onClick={() => handleToggle('useSSL')}
               className={`p-3.5 w-full rounded-2xl border flex items-center justify-between transition-all group ${
                 formData.useSSL 
                 ? 'bg-purple-50 border-purple-100 ring-2 ring-purple-100/30' 
                 : 'bg-white border-gray-100 shadow-sm'
               }`}
             >
               <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl transition-all ${
                    formData.useSSL ? 'bg-[#6b2bd9] text-white shadow-md' : 'bg-gray-50 text-gray-400'
                  }`}>
                    <FiShield size={14} />
                  </div>
                  <span className={`text-xs font-bold tracking-widest uppercase ${
                    formData.useSSL ? 'text-[#6b2bd9]' : 'text-gray-700'
                  }`}>
                    Use SSL / TLS
                  </span>
               </div>
               <div className={`w-10 h-5 rounded-full relative transition-all ${formData.useSSL ? 'bg-[#6b2bd9]' : 'bg-gray-200'}`}>
                 <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${
                   formData.useSSL ? 'left-6' : 'left-1'
                 }`} />
               </div>
             </button>
           </div>

           <div className="space-y-2">
             <label className="text-xs font-bold text-gray-700 tracking-widest uppercase px-1">State</label>
             <button
               onClick={() => handleToggle('isDefault')}
               className={`p-3.5 w-full rounded-2xl border flex items-center justify-between transition-all group ${
                 formData.isDefault 
                 ? 'bg-purple-50 border-purple-100 ring-2 ring-purple-100/30' 
                 : 'bg-white border-gray-100 shadow-sm'
               }`}
             >
               <div className="flex items-center gap-3">
                 <div className={`p-2 rounded-xl transition-all ${
                   formData.isDefault ? 'bg-[#6b2bd9] text-white shadow-md' : 'bg-gray-50 text-gray-400'
                 }`}>
                   <FiCheck size={14} />
                 </div>
                  <span className={`text-xs font-bold tracking-widest uppercase ${
                    formData.isDefault ? 'text-[#6b2bd9]' : 'text-gray-700'
                  }`}>
                    Primary Account
                  </span>
               </div>
               <div className={`w-10 h-5 rounded-full relative transition-all ${formData.isDefault ? 'bg-[#6b2bd9]' : 'bg-gray-200'}`}>
                 <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${
                   formData.isDefault ? 'left-6' : 'left-1'
                 }`} />
               </div>
             </button>
           </div>
        </div>
      </div>
    </motion.div>
  );
};

const EmailAccounts = () => {
  const [view, setView] = useState('list'); // 'list' or 'form'
  const [editingAccount, setEditingAccount] = useState(null);
  const [accounts, setAccounts] = useState([
    { id: 1, email: 'noreply@trubuy.com', displayName: 'TruBuy Notifications', host: 'smtp.sendgrid.net', port: 587, user: 'apikey', isDefault: true, useSSL: true },
    { id: 2, email: 'support@trubuy.com', displayName: 'TruBuy Support', host: 'smtp.gmail.com', port: 465, user: 'trubuy_support', isDefault: false, useSSL: true },
  ]);

  const handleSave = (formData, continueEditing) => {
    if (editingAccount) {
      setAccounts(prev => prev.map(a => a.id === editingAccount.id ? { ...formData, id: editingAccount.id } : a));
    } else {
      const nextId = Math.max(...accounts.map(a => a.id), 0) + 1;
      setAccounts(prev => [...prev, { ...formData, id: nextId }]);
    }
    
    if (!continueEditing) {
      setEditingAccount(null);
      setView('list');
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this email account configuration?')) {
      setAccounts(prev => prev.filter(a => a.id !== id));
    }
  };

  const columns = [
    { 
      key: 'email', 
      label: 'Configuration Identity', 
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gray-50 rounded-lg text-gray-400 group-hover:text-[#6b2bd9] transition-colors shadow-sm">
             <FiMail size={12} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-gray-900 tracking-tight">{row.email}</span>
            {row.isDefault && <span className="text-[8px] text-[#6b2bd9] font-black uppercase tracking-tighter">Primary Account</span>}
          </div>
        </div>
      ) 
    },
    { key: 'displayName', label: 'Email display name', render: (v) => <span className="text-sm font-semibold text-gray-500">{v}</span> },
    { key: 'host', label: 'Host', render: (v) => <span className="text-[10px] font-mono font-bold text-blue-500 uppercase tracking-tight bg-blue-50 px-2 py-1 rounded-md">{v}</span> },
    { key: 'port', label: 'Port', render: (v) => <span className="text-[#6b2bd9] font-black text-[10px]">{v}</span> },
    { key: 'user', label: 'User', render: (v) => <span className="text-gray-400 font-bold text-[10px] font-mono">{v}</span> },
    { 
      key: 'isDefault', 
      label: 'Status', 
      render: (v) => (
        <div className="flex items-center justify-center">
          <div className={`p-1 rounded-full shadow-sm ${v ? 'bg-purple-50 text-[#6b2bd9] shadow-purple-100' : 'bg-gray-50 text-gray-300 shadow-sm'}`}>
            {v ? <FiCheck size={12} /> : <FiMinus size={12} className="rotate-45" />}
          </div>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-2 text-right">
          <button 
             onClick={() => { setEditingAccount(row); setView('form'); }}
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
                      <FiMail size={20} />
                    </div>
                    <div>
                      <h1 className="text-sm font-bold text-gray-600 tracking-tight">Email Accounts</h1>
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-0.5">SMTP Infrastructure Hub</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => { setEditingAccount(null); setView('form'); }}
                    className="px-6 py-2.5 bg-[#6b2bd9] text-white rounded-xl hover:bg-[#5b24b7] transition-all text-sm font-bold flex items-center gap-2 shadow-lg shadow-purple-100 active:scale-95"
                  >
                    <FiPlus size={18} />
                    <span>Add New Account</span>
                  </button>
                </div>
              </div>

              {/* Main Container */}
              <div className="p-0 overflow-x-auto min-h-[400px]">
                <DataTable 
                  data={accounts}
                  columns={columns}
                  className="border-none shadow-none rounded-none"
                />
              </div>
            </div>
          </motion.div>
        ) : (
          <EmailAccountForm 
            onBack={() => { setEditingAccount(null); setView('list'); }}
            onSave={handleSave}
            initialData={editingAccount}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmailAccounts;
