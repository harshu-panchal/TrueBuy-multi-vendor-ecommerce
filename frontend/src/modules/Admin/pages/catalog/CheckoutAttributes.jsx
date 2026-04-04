import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSettings,
  FiPlus,
  FiTrash2,
  FiCheck,
  FiShoppingBag,
  FiEye,
  FiType,
  FiGlobe,
  FiGrid,
  FiAlertCircle,
  FiArrowLeft,
  FiSave,
  FiInfo,
  FiTag,
  FiSettings as FiConfig,
  FiX
} from 'react-icons/fi';
import DataTable from '../../components/DataTable';

const AttributeForm = ({ onBack, onSave }) => {
  const [activeTab, setActiveTab] = useState('Attribute Info');
  const [formData, setFormData] = useState({
    name: '',
    prompt: '',
    isActive: true,
    required: false,
    shippableRequired: false,
    taxExempt: false,
    taxCategory: 'None',
    controlType: 'Drop-down List',
    order: 0,
    limitedToStores: false,
    stores: []
  });

  const tabs = ['Attribute Info', 'Options'];

  const taxCategories = ['Tax Free', 'Books', 'Electronics & Software', 'Downloadable Products', 'Jewellery', 'Apparel Shoes'];
  const controlTypes = [
    'Drop-down List',
    'Radio Button List',
    'Checkboxes',
    'Text Box',
    'Multiline Text Box',
    'Datepicker',
    'File Upload',
    'Boxes (color & images)'
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
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
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Add a New Checkout Attribute</h1>
            <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
              <FiShoppingBag /> Transaction Customization
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
            <span>Save Attribute</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1 bg-gray-100/50 p-1 rounded-2xl w-fit border border-gray-200/50">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === tab
                ? 'bg-white text-primary-600 shadow-sm border border-gray-100'
                : 'text-gray-400 hover:text-gray-600'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'Attribute Info' ? (
          <motion.div
            key="info"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-[11px] font-bold uppercase text-gray-400 tracking-widest flex items-center gap-2">
                  <FiConfig className="text-primary-500" /> Core Attribute Configuration
                </h3>
              </div>
              <div className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Extra Insurance"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-500 outline-none shadow-sm transition-all hover:border-gray-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Text Prompt</label>
                    <input
                      type="text"
                      placeholder="e.g. Would you like to add shipping insurance?"
                      value={formData.prompt}
                      onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-500 outline-none shadow-sm transition-all hover:border-gray-300 italic"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'Is Active', key: 'isActive', desc: 'Enable for checkout display' },
                    { label: 'Required', key: 'required', desc: 'Mandatory customer choice' },
                    { label: 'Shippable Product', key: 'shippableRequired', desc: 'Needs shippable items' },
                    { label: 'Tax Exempt', key: 'taxExempt', desc: 'Exclude from tax calc' }
                  ].map((field) => (
                    <div key={field.key} className="p-5 bg-gray-50/10 rounded-2xl border border-gray-100 flex flex-col justify-between h-32 hover:bg-white hover:shadow-md transition-all group">
                      <div className="flex items-start justify-between">
                        <div className="p-2 bg-white rounded-xl text-gray-400 group-hover:text-primary-600 transition-colors shadow-sm">
                          {field.key === 'isActive' ? <FiCheck size={16} /> : field.key === 'required' ? <FiAlertCircle size={16} /> : field.key === 'shippableRequired' ? <FiShoppingBag size={16} /> : <FiTag size={16} />}
                        </div>
                        <button
                          onClick={() => setFormData({ ...formData, [field.key]: !formData[field.key] })}
                          className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${formData[field.key] ? 'bg-primary-600' : 'bg-gray-200'}`}
                        >
                          <motion.div
                            animate={{ x: formData[field.key] ? 18 : 2 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm"
                          />
                        </button>
                      </div>
                      <div>
                        <h5 className="text-[10px] font-black text-gray-800 uppercase tracking-widest">{field.label}</h5>
                        <p className="text-[9px] text-gray-400 font-bold tracking-tight leading-tight mt-0.5">{field.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 pt-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Tax Category</label>
                    <select
                      value={formData.taxCategory}
                      onChange={(e) => setFormData({ ...formData, taxCategory: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary-500 outline-none appearance-none shadow-sm"
                    >
                      {taxCategories.map(cat => <option key={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Control Type</label>
                    <select
                      value={formData.controlType}
                      onChange={(e) => setFormData({ ...formData, controlType: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary-500 outline-none appearance-none shadow-sm"
                    >
                      {controlTypes.map(type => <option key={type}>{type}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Display Order</label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-black focus:ring-2 focus:ring-primary-500 outline-none shadow-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Limited to Stores</label>
                    <select
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary-500 outline-none appearance-none shadow-sm transition-all hover:border-gray-300"
                      onChange={(e) => setFormData({ ...formData, limitedToStores: e.target.value !== 'All Stores' })}
                    >
                      <option>All Stores</option>
                      <option disabled>No specific stores available</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="options"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-dashed border-gray-200 space-y-6 shadow-inner"
          >
            <div className="relative">
              <div className="p-8 bg-amber-50 rounded-full text-amber-500 animate-pulse border border-amber-100 overflow-hidden group">
                <FiAlertCircle size={48} className="relative z-10" />
                <div className="absolute inset-0 bg-white/40 blur-xl scale-150 animate-ping opacity-20 pointer-events-none" />
              </div>
            </div>
            <div className="text-center space-y-2 max-w-xs px-4">
              <h3 className="text-base font-black text-gray-800 uppercase tracking-widest">System Lock</h3>
              <p className="text-xs text-gray-400 leading-relaxed font-bold tracking-tight">
                Options are dependent on the main checkout attribute record ID. <span className="text-primary-600 font-black underline decoration-primary-200">In order to proceed, the record must be saved first.</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const CheckoutAttributes = () => {
  // UI State
  const [view, setView] = useState('list'); // 'list' or 'add'
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
    name: true,
    prompt: true,
    controlType: true,
    options: true,
    isActive: true,
    required: true,
    order: true,
    limitedToStores: true,
  });

  // Mock data (Empty for production readiness)
  const [attributes, setAttributes] = useState([]);

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedIds(new Set(attributes.map(a => a.id)));
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
    if (window.confirm(`Permanently remove ${selectedIds.size} checkout attributes?`)) {
      setAttributes(attributes.filter(a => !selectedIds.has(a.id)));
      setSelectedIds(new Set());
    }
  };

  const handleSaveAttribute = (formData, continueEditing) => {
    console.log('Saving checkout attribute:', formData);
    const newAttr = {
      id: (attributes.length + 1).toString(),
      ...formData,
      options: []
    };
    setAttributes([...attributes, newAttr]);
    if (!continueEditing) setView('list');
    else alert('Checkout Attribute saved! You may proceed with further configuration.');
  };

  if (view === 'add') {
    return <AttributeForm onBack={() => setView('list')} onSave={handleSaveAttribute} />;
  }

  // Table Columns
  const columns = [
    {
      key: 'checkbox',
      label: (
        <input
          type="checkbox"
          checked={selectedIds.size === attributes.length && attributes.length > 0}
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
    { key: 'name', label: 'Name', hidden: !visibleColumns.name, render: (v) => <span className="font-bold text-gray-800 tracking-tight">{v}</span> },
    { key: 'prompt', label: 'Text Prompt', hidden: !visibleColumns.prompt, render: (v) => <span className="text-xs text-gray-500 italic">{v || '—'}</span> },
    { key: 'controlType', label: 'Control Type', hidden: !visibleColumns.controlType, render: (v) => <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 border border-gray-100 rounded px-2 py-1">{v}</span> },
    { key: 'options', label: 'Options', hidden: !visibleColumns.options, render: (v) => <span className="text-xs text-blue-600 font-medium">Manage Options ({v?.length || 0})</span> },
    {
      key: 'isActive',
      label: 'Is Active',
      hidden: !visibleColumns.isActive,
      render: (v) => v ? <FiCheck className="text-green-600 text-lg mx-auto" /> : <FiX className="text-red-400 text-lg mx-auto" />
    },
    {
      key: 'required',
      label: 'Required',
      hidden: !visibleColumns.required,
      render: (v) => v ? <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-2 py-0.5 rounded border border-amber-100">Required</span> : <span className="text-gray-300">Optional</span>
    },
    { key: 'order', label: 'Display Order', hidden: !visibleColumns.order, render: (v) => <span className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-black text-gray-500">{v}</span> },
    {
      key: 'limitedToStores',
      label: 'Limited to Stores',
      hidden: !visibleColumns.limitedToStores,
      render: (v) => v ? <span className="text-[10px] font-bold text-primary-600 uppercase tracking-widest flex items-center gap-1"><FiGlobe size={10} /> Limited</span> : <span className="text-gray-300">All Stores</span>
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
              <div className="p-2 bg-primary-50 rounded-lg"><FiShoppingBag /></div>
              <span className="text-sm font-bold text-gray-600">Checkout Attributes</span>
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

        {/* Empty State / Table Section */}
        {attributes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 bg-gray-50/20 rounded-b-2xl border-t border-gray-100 space-y-4">
            <div className="p-6 bg-white rounded-full shadow-sm border border-gray-100 text-gray-300">
              <FiShoppingBag size={48} />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">No Checkout Attributes</h3>
              <p className="text-xs text-gray-400 font-bold tracking-tight">Add gift wrapping, insurance or notes to your checkout process.</p>
            </div>
          </div>
        ) : (
          <div className="p-0 overflow-x-auto min-h-[400px]">
            <DataTable
              data={attributes}
              columns={filteredColumns}
              pagination={true}
              itemsPerPage={10}
              rowLines={tableSettings.rowLines}
              columnLines={tableSettings.columnLines}
              className={`rounded-none shadow-none border-none ${tableSettings.striped ? '[&_tbody_tr:nth-child(even)]:bg-gray-50/50' : ''} ${!tableSettings.hover ? '[&_tbody_tr]:hover:bg-transparent' : ''}`}
            />
          </div>
        )}

        {/* Settings Button */}
        <div className="absolute bottom-4 right-6 pt-4">
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
    </motion.div>
  );
};

export default CheckoutAttributes;
