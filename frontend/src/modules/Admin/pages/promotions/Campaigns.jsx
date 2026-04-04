import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlus,
  FiTrash2,
  FiEdit3,
  FiMail,
  FiLayout,
  FiGlobe,
  FiUsers,
  FiCalendar,
  FiMessageSquare,
  FiArrowLeft,
  FiSave,
  FiCheck,
  FiType,
  FiCode,
  FiInfo
} from 'react-icons/fi';
import DataTable from '../../components/DataTable';

const CampaignForm = ({ onBack, onSave, initialData = null }) => {
  const isEdit = !!initialData;
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    limitedToStores: 'All',
    limitedToRoles: 'All',
    body: '',
    ...initialData
  });

  const templateVariables = [
    { name: '{Store.Name}', desc: 'The name of your store' },
    { name: '{Store.URL}', desc: 'The URL of your store' },
    { name: '{Customer.FullName}', desc: 'Full name of the recipient' },
    { name: '{Customer.Email}', desc: 'Email address of the recipient' },
    { name: '{Campaign.Name}', desc: 'The title of this campaign' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6 pb-20"
    >
      {/* Form Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-gray-400 hover:text-primary-600 shadow-sm"
          >
            <FiArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              {isEdit ? 'Edit Campaign' : 'Add a New Campaign'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onSave(formData, true)}
            className="px-6 py-2.5 bg-white border border-primary-200 text-primary-600 rounded-xl hover:bg-primary-50 transition-all text-sm font-bold flex items-center gap-2 active:scale-95 shadow-sm"
          >
            <FiSave />
            <span>Save & Continue Editing</span>
          </button>
          <button
            onClick={() => onSave(formData, false)}
            className="px-8 py-2.5 bg-[#7e3af2] text-white rounded-xl hover:bg-[#6c2bd9] transition-all text-sm font-bold flex items-center gap-2 shadow-lg shadow-purple-100 active:scale-95"
          >
            <FiCheck />
            <span>Save</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase text-gray-400 tracking-widest flex items-center gap-2">
            <FiLayout className="text-primary-500" /> Campaign Configuration
          </h3>
        </div>

        <div className="p-8 lg:p-10 space-y-10">
          {/* Basic Info Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-700 uppercase tracking-widest px-1 flex items-center gap-2">
                <FiType className="text-gray-300" /> Name
              </label>
              <input
                type="text"
                placeholder="e.g. Summer Launch..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-gray-700 uppercase tracking-widest px-1 flex items-center gap-2">
                <FiMessageSquare className="text-gray-300" /> Subject
              </label>
              <input
                type="text"
                placeholder="Subject of the email..."
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Targeting Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-700 uppercase tracking-widest px-1 flex items-center gap-2">
                <FiGlobe className="text-gray-300" /> Limited to Stores
              </label>
              <div className="relative group">
                <select
                  value={formData.limitedToStores}
                  onChange={(e) => setFormData({ ...formData, limitedToStores: e.target.value })}
                  className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none appearance-none transition-all cursor-pointer shadow-sm"
                >
                  <option value="All">All Stores</option>
                  <option value="Main Store">Main Store</option>
                  <option value="Secondary Store">Secondary Store</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <FiArrowLeft className="-rotate-90" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-gray-700 uppercase tracking-widest px-1 flex items-center gap-2">
                <FiUsers className="text-gray-300" /> Limited to Customer Roles
              </label>
              <div className="relative group">
                <select
                  value={formData.limitedToRoles}
                  onChange={(e) => setFormData({ ...formData, limitedToRoles: e.target.value })}
                  className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none appearance-none transition-all cursor-pointer shadow-sm"
                >
                  <option value="All">All Roles</option>
                  <option value="Registered">Registered</option>
                  <option value="Vendor">Vendor</option>
                  <option value="Administrator">Administrator</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <FiArrowLeft className="-rotate-90" />
                </div>
              </div>
            </div>
          </div>

          {/* Template Variables Section */}
          <div className="space-y-4">
            <label className="text-xs font-black text-gray-700 uppercase tracking-widest px-1 flex items-center gap-2">
              <FiCode className="text-primary-500" /> Allowed Template Variables
            </label>
            <div className="p-6 bg-amber-50/10 border border-dashed border-amber-200/50 rounded-3xl flex items-center gap-4 group">
              <div className="p-3 bg-white rounded-2xl text-amber-500 shadow-sm border border-amber-50 group-hover:scale-110 transition-transform">
                <FiInfo size={20} />
              </div>
              <p className="text-xs font-bold text-amber-900/60 leading-relaxed max-w-lg">
                Variables are unknown until at least one message of the current type has either been sent or previewed.
              </p>
            </div>
          </div>

          {/* Body Section */}
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-700 uppercase tracking-widest px-1 flex items-center gap-2">
              <FiMessageSquare className="text-gray-300" /> Body
            </label>
            <div className="relative group shadow-sm bg-white rounded-3xl overflow-hidden border border-gray-200 focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 transition-all">
              <textarea
                placeholder="Compose your campaign content here..."
                rows={12}
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                className="w-full p-8 text-sm font-medium text-gray-700 outline-none resize-none leading-relaxed"
              />
              <div className="px-8 py-3 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Character Count: {formData.body.length}</span>
                <span className="text-xs font-black text-primary-500 uppercase tracking-widest cursor-pointer hover:underline">Preview Draft</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Campaigns = () => {
  // UI State
  const [view, setView] = useState('list'); // 'list' or 'add'
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [editingCampaign, setEditingCampaign] = useState(null);

  // Mock Data
  const [campaigns, setCampaigns] = useState([]);

  // Handle Selection
  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedIds(new Set(campaigns.map(c => c.id)));
    else setSelectedIds(new Set());
  };

  const handleSelectRow = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  // Actions
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      setCampaigns(campaigns.filter(c => c.id !== id));
      const newSelected = new Set(selectedIds);
      newSelected.delete(id);
      setSelectedIds(newSelected);
    }
  };

  const handleDeleteSelected = () => {
    if (window.confirm(`Permanently delete ${selectedIds.size} selected campaigns?`)) {
      setCampaigns(campaigns.filter(c => !selectedIds.has(c.id)));
      setSelectedIds(new Set());
    }
  };

  const handleSaveCampaign = (data, continueEditing) => {
    if (editingCampaign) {
      setCampaigns(campaigns.map(c => c.id === editingCampaign.id ? { ...data, id: c.id, createdOn: c.createdOn } : c));
    } else {
      const newCampaign = {
        ...data,
        id: Date.now().toString(),
        createdOn: new Date().toISOString().split('T')[0],
      };
      setCampaigns([newCampaign, ...campaigns]);
    }

    if (!continueEditing) {
      setView('list');
      setEditingCampaign(null);
    } else alert('Campaign progress saved. Continue composing.');
  };

  // Table Columns
  const columns = [
    {
      key: 'checkbox',
      label: (
        <input
          type="checkbox"
          checked={selectedIds.size === campaigns.length && campaigns.length > 0}
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
          <div className="p-1.5 bg-gray-50 rounded-lg text-gray-400 group-hover:text-primary-600 transition-colors shadow-sm">
            <FiLayout size={12} />
          </div>
          <span className="font-bold text-gray-800 tracking-tight">{v}</span>
        </div>
      )
    },
    {
      key: 'subject',
      label: 'Subject',
      render: (v) => (
        <div className="flex items-center gap-2">
          <FiMessageSquare size={12} className="text-gray-300" />
          <span className="text-xs font-medium text-gray-500">{v}</span>
        </div>
      )
    },
    {
      key: 'createdOn',
      label: 'Created on',
      render: (v) => (
        <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
          <FiCalendar size={10} />
          {v}
        </div>
      )
    },
    {
      key: 'limitedToStores',
      label: 'Limited to stores',
      render: (v) => (
        <div className="flex items-center gap-2">
          <FiGlobe size={12} className="text-gray-300" />
          <span className="text-[10px] font-black text-gray-500 bg-gray-50/50 border border-gray-100 rounded px-2.5 py-1 uppercase tracking-widest">
            {v}
          </span>
        </div>
      )
    },
    {
      key: 'limitedToCustomerRoles',
      label: 'Limited to customer roles',
      render: (v, row) => (
        <div className="flex items-center gap-2">
          <FiUsers size={12} className="text-gray-300" />
          <span className="text-[10px] font-black text-[#7e3af2] bg-primary-50/50 border border-primary-100 rounded px-2.5 py-1 uppercase tracking-widest">
            {row.limitedToRoles}
          </span>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Action',
      render: (_, row) => (
        <div className="flex items-center gap-2 justify-start pl-2">
          <button
            onClick={() => {
              setEditingCampaign(row);
              setView('add');
            }}
            className="p-1.5 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors shadow-sm"
          >
            <FiEdit3 size={14} />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors shadow-sm"
          >
            <FiTrash2 size={14} />
          </button>
        </div>
      )
    }
  ];

  if (view === 'add') {
    return (
      <CampaignForm
        onBack={() => {
          setView('list');
          setEditingCampaign(null);
        }}
        onSave={handleSaveCampaign}
        initialData={editingCampaign}
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
                <h1 className="text-sm font-bold text-gray-600 tracking-tight">Campaigns</h1>
              </div>
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
        </div>

        {/* Table View */}
        <div className="p-0 overflow-x-auto min-h-[400px]">
          <DataTable
            data={campaigns}
            columns={columns}
            pagination={true}
            itemsPerPage={10}
            className="border-none shadow-none rounded-none"
          />

          {campaigns.length === 0 && (
            <div className="flex flex-col items-center justify-center p-24 bg-gray-50/20 space-y-4">
              <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 text-gray-200">
                <FiMail size={48} />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">No campaigns found</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Kickstart your marketing with a new campaign</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Campaigns;
