import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiFilter,
  FiX,
  FiSettings,
  FiPlus,
  FiSearch,
  FiBox,
  FiCheck,
  FiDatabase,
  FiInfo,
  FiGlobe,
  FiPackage,
  FiSave,
  FiArrowLeft,
  FiMoreVertical,
  FiAlertCircle,
  FiImage,
  FiTag,
  FiHash,
  FiClock,
  FiChevronLeft,
  FiLayers
} from 'react-icons/fi';
import DataTable from '../../components/DataTable';

const Manufacturers = () => {
  // Navigation State
  const [view, setView] = useState('list'); // 'list' or 'add'
  const [activeTab, setActiveTab] = useState('General');

  // UI State
  const [showFilter, setShowFilter] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Form State
  const [formData, setFormData] = useState({
    displayOrder: 0,
    published: true,
    name: '',
    description: '',
    picture: null,
    allowSelectPageSize: 'No',
    pageSizeOptions: '10, 20, 50',
    template: 'Default Desktop',
    discounts: [],
    stores: [],
    roles: [],
    seo: {
      titleTag: '',
      metaDescription: '',
      metaKeywords: '',
      urlAlias: ''
    }
  });

  // Filter State
  const [filters, setFilters] = useState({
    name: '',
    store: 'all'
  });

  const [tableSettings, setTableSettings] = useState({
    rowLines: true,
    columnLines: false,
    striped: false,
    hover: true,
  });

  const [visibleColumns, setVisibleColumns] = useState({
    id: true,
    name: true,
    published: true,
    displayOrder: true,
    stores: true,
    created: true,
    updated: true,
  });

  // Mock Data
  const initialData = [];
  const [manufacturers] = useState(initialData);

  const filteredData = useMemo(() => {
    return manufacturers.filter(item => {
      const matchName = item.name?.toLowerCase().includes(filters.name.toLowerCase());
      const matchStore = filters.store === 'all' || true;
      return matchName && matchStore;
    });
  }, [manufacturers, filters]);

  const handleResetFilters = () => setFilters({ name: '', store: 'all' });

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedIds(new Set(filteredData.map(m => m.id)));
    else setSelectedIds(new Set());
  };

  const handleSelectRow = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  // Table Columns
  const columns = [
    {
      key: 'checkbox',
      label: (
        <input
          type="checkbox"
          checked={selectedIds.size === filteredData.length && filteredData.length > 0}
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
    { key: 'id', label: 'ID', hidden: !visibleColumns.id, render: (v) => <span className="font-mono text-[10px] font-black tracking-tight text-gray-400">{v}</span> },
    { key: 'name', label: 'Name', hidden: !visibleColumns.name, render: (v) => <span className="font-bold text-gray-800 tracking-tight">{v}</span> },
    {
      key: 'published',
      label: 'Published',
      hidden: !visibleColumns.published,
      render: (v) => (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${v ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
          {v ? 'Published' : 'Draft'}
        </span>
      )
    },
    { key: 'displayOrder', label: 'Order', hidden: !visibleColumns.displayOrder, render: (v) => <span className="font-mono text-[10px] bg-gray-50 px-2 py-1 rounded border border-gray-100 text-gray-500">{v}</span> },
    { key: 'stores', label: 'Limited to Stores', hidden: !visibleColumns.stores, render: (v) => <span className="text-[10px] font-medium text-gray-400 italic">{v || 'No restriction'}</span> },
    { key: 'created', label: 'Created On', hidden: !visibleColumns.created, render: (v) => <span className="text-[10px] font-medium text-gray-400 whitespace-nowrap">{v}</span> },
    { key: 'updated', label: 'Updated On', hidden: !visibleColumns.updated, render: (v) => <span className="text-[10px] font-medium text-gray-400 whitespace-nowrap">{v}</span> },
  ];

  const filteredColumns = columns.filter(col => !col.hidden);

  if (view === 'add') {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6 pb-20"
      >
        {/* Detail Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setView('list')}
              className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-primary-600 hover:border-primary-100 transition-all shadow-sm"
            >
              <FiChevronLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-black text-gray-800 tracking-tight">Add a New Manufacturer</h1>
              <p className="text-xs text-gray-500 font-medium">Create a new supply source for your catalog</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center gap-2">
              <FiSave className="text-gray-400" /> Save
            </button>
            <button className="px-5 py-2.5 bg-primary-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary-700 transition-all shadow-lg shadow-primary-100 flex items-center gap-2">
              <FiCheck /> Save & Continue
            </button>
          </div>
        </div>

        {/* Tab System */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex border-b border-gray-100 p-1">
            {['General', 'SEO', 'Products'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 lg:flex-none px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all gap-2 flex items-center justify-center ${activeTab === tab ? 'bg-primary-50 text-primary-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
              >
                {tab === 'General' && <FiInfo />}
                {tab === 'SEO' && <FiGlobe />}
                {tab === 'Products' && <FiPackage />}
                {tab}
              </button>
            ))}
          </div>

          <div className="p-8">
            <AnimatePresence mode="wait">
              {activeTab === 'General' && (
                <motion.div
                  key="general"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 max-w-5xl"
                >
                  {/* Display Order */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <FiHash /> Display Order
                    </label>
                    <input
                      type="number"
                      value={formData.displayOrder}
                      onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                    />
                  </div>

                  {/* Published */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-2xl">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Published State</span>
                      <p className="text-[10px] text-gray-400 italic">Toggle visibility in store-front</p>
                    </div>
                    <button
                      onClick={() => setFormData({ ...formData, published: !formData.published })}
                      className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${formData.published ? 'bg-green-500 shadow-inner' : 'bg-gray-300'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${formData.published ? 'translate-x-7' : 'translate-x-1'}`} />
                    </button>
                  </div>

                  {/* Name */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <FiTag /> Manufacturer Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter brand name..."
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-sm"
                    />
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <FiInfo /> Description
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Provide catalog description..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-sm"
                    />
                  </div>

                  {/* Picture */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <FiImage /> Brand Logo / Picture
                    </label>
                    <div className="border-2 border-dashed border-gray-100 rounded-2xl p-8 flex flex-col items-center justify-center text-gray-400 hover:border-primary-200 hover:bg-primary-50/10 transition-all cursor-pointer group">
                      <FiPlus size={32} className="mb-2 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-black uppercase tracking-widest">Upload Image</span>
                      <p className="text-[9px] mt-1 font-medium italic opacity-60">PNG, JPG up to 5MB</p>
                    </div>
                  </div>

                  {/* Page Size Toggle */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <FiLayers /> Allow Cust. Select Page Size
                    </label>
                    <select
                      value={formData.allowSelectPageSize}
                      onChange={(e) => setFormData({ ...formData, allowSelectPageSize: e.target.value })}
                      className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-sm"
                    >
                      <option>No</option>
                      <option>Yes</option>
                    </select>
                  </div>

                  {/* Page Size Options */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <FiHash /> Page Size Options
                    </label>
                    <input
                      type="text"
                      value={formData.pageSizeOptions}
                      onChange={(e) => setFormData({ ...formData, pageSizeOptions: e.target.value })}
                      className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-sm"
                    />
                  </div>

                  {/* Manufacturer Template */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <FiBox /> Manufacturer Template
                    </label>
                    <select
                      value={formData.template}
                      onChange={(e) => setFormData({ ...formData, template: e.target.value })}
                      className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-sm"
                    >
                      <option>Default Desktop</option>
                      <option>Modern Cards</option>
                      <option>Brand Showcase</option>
                    </select>
                  </div>

                  {/* Discounts */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <FiTag /> Discounts
                    </label>
                    <select className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-sm">
                      <option>None Available</option>
                    </select>
                  </div>

                  {/* Limited to Stores */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <FiDatabase /> Limited to Stores
                    </label>
                    <select
                      className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-sm"
                    >
                      <option>Unspecified</option>
                    </select>
                  </div>

                  {/* Limited to Customer Roles */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <FiBox /> Limited to Customer Roles
                    </label>
                    <select
                      className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-sm"
                    >
                      <option>Unspecified</option>
                      <option>Administrators</option>
                      <option>Distributer B2B</option>
                      <option>Forum Moderators</option>
                      <option>Guests</option>
                      <option>Inactive New Customers</option>
                      <option>Registered</option>
                      <option>Vendor B2C</option>
                    </select>
                  </div>
                </motion.div>
              )}

              {activeTab === 'SEO' && (
                <motion.div
                  key="seo"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8 max-w-3xl"
                >
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <FiGlobe /> Search Engine Title
                      </label>
                      <input
                        type="text"
                        placeholder="Page title tag..."
                        className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <FiInfo /> Meta Description
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Brief SEO summary..."
                        className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <FiTag /> Meta Keywords
                      </label>
                      <input
                        type="text"
                        placeholder="Comma separated keywords..."
                        className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <FiHash /> URL Alias / Slug
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-mono font-black text-gray-300">/brand/</span>
                        <input
                          type="text"
                          placeholder="manufacturer-name"
                          className="w-full pl-16 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-sm"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'Products' && (
                <motion.div
                  key="products"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200"
                >
                  <div className="p-4 bg-amber-50 rounded-2xl mb-4 border border-amber-100 flex items-center gap-4 max-w-md">
                    <FiAlertCircle className="text-amber-500 flex-shrink-0" size={24} />
                    <p className="text-[11px] font-black uppercase text-amber-600 leading-relaxed tracking-tight">
                      In order to proceed, the record must be saved first.
                    </p>
                  </div>
                  <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Locked Module</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-20"
    >
      {/* Mobile Header */}
      <div className="lg:hidden">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Manufacturers</h1>
        <p className="text-sm text-gray-600">Inventory supply and production sources</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-visible relative">

        {/* Action Bar */}
        <div className="p-4 border-b border-gray-100 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-primary-600 pr-4 border-r border-gray-100">
              <div className="p-2 bg-primary-50 rounded-lg"><FiBox /></div>
              <span className="text-sm font-bold text-gray-600">Manufacturer Directory</span>
            </div>

            <button
              onClick={() => setView('add')}
              className="px-6 py-2.5 bg-[#7e3af2] text-white rounded-xl hover:bg-[#6c2bd9] transition-all text-sm font-bold flex items-center gap-2 shadow-lg shadow-purple-100 active:scale-95"
            >
              <FiPlus className="text-lg" />
              <span>Add New</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className={`px-4 py-2 rounded-xl border transition-all text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-sm ${showFilter || Object.values(filters).some(v => v !== '' && v !== 'all')
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
            >
              <FiFilter className="text-xs" />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* Filter Form Overlay */}
        <AnimatePresence>
          {showFilter && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden bg-gray-50/50 border-b border-gray-100"
            >
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                <div className="space-y-1.5 flex-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 px-1">
                    <FiSearch /> Manufacturer Name
                  </label>
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input
                      type="text"
                      placeholder="Search manufacturers..."
                      value={filters.name}
                      onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                      className="w-full pl-9 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 w-full lg:w-64">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 px-1">
                    <FiDatabase /> Limited to Store
                  </label>
                  <select
                    value={filters.store}
                    onChange={(e) => setFilters({ ...filters, store: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 outline-none appearance-none transition-all shadow-sm"
                  >
                    <option value="all">Unspecified</option>
                  </select>
                </div>

                <div className="md:col-span-2 flex items-center justify-between pt-2 border-t border-gray-100 mt-2">
                  <span className="text-[10px] uppercase font-bold text-gray-300 tracking-widest">Matched Records: {filteredData.length}</span>
                  <button onClick={handleResetFilters} className="text-xs font-bold text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors uppercase tracking-widest">
                    <FiX size={14} /> Clear Selection
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Table Section */}
        <div className="p-0 overflow-x-auto min-h-[400px]">
          <DataTable
            data={filteredData}
            columns={filteredColumns}
            pagination={false}
            rowLines={tableSettings.rowLines}
            columnLines={tableSettings.columnLines}
            className={`${tableSettings.striped ? '[&_tbody_tr:nth-child(even)]:bg-gray-50/50' : ''} ${!tableSettings.hover ? '[&_tbody_tr]:hover:bg-transparent' : ''}`}
          />
        </div>

        {/* Footer with Settings */}
        <div className="p-4 px-6 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Registered Manufacturers: {filteredData.length}</span>
          </div>

          <div className="flex items-center gap-2">
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
                        {['Row lines', 'Column lines', 'Striped', 'Hover'].map(label => {
                          const key = label === 'Row lines' ? 'rowLines' : label === 'Column lines' ? 'columnLines' : label.toLowerCase();
                          return (
                            <label key={label} className="flex items-center justify-between cursor-pointer group">
                              <span className="text-xs font-bold text-gray-600">{label}</span>
                              <div
                                onClick={() => setTableSettings(s => ({ ...s, [key]: !s[key] }))}
                                className={`w-8 h-4 rounded-full relative transition-colors ${tableSettings[key] ? 'bg-primary-600' : 'bg-gray-300'}`}
                              >
                                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${tableSettings[key] ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                              </div>
                            </label>
                          );
                        })}
                      </div>

                      <div className="pt-2 border-t border-gray-50 space-y-2">
                        <h4 className="text-[10px] font-bold uppercase text-gray-400 tracking-widest mb-2">Column Manager</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(visibleColumns).map(([key, isVisible]) => (
                            <label key={key} className="flex items-center gap-2 cursor-pointer group">
                              <div
                                onClick={() => setVisibleColumns(v => ({ ...v, [key]: !v[key] }))}
                                className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${isVisible ? 'bg-primary-600 border-primary-600' : 'bg-white border-gray-300'}`}
                              >
                                {isVisible && <FiCheck className="text-white text-[8px]" />}
                              </div>
                              <span className={`text-[9px] font-bold uppercase tracking-widest transition-colors ${isVisible ? 'text-gray-900' : 'text-gray-400'}`}>
                                {key}
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
      </div>
    </motion.div>
  );
};

export default Manufacturers;
