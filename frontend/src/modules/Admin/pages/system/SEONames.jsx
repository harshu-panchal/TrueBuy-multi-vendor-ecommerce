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
  FiGlobe,
  FiHash,
  FiLayers,
  FiLink
} from 'react-icons/fi';
import DataTable from '../../components/DataTable';

const SEOForm = ({ onBack, onSave, onUpdate, initialData = null }) => {
  const isEdit = !!initialData;
  const [formData, setFormData] = useState(initialData || {
    id: '',                 
    seoName: '',            
    namesPerObject: 1,         
    objectType: 'Product', 
    objectId: '',                 
    active: true,     
    language: 'English',          
  });

  const handleSubmit = () => {
    if (isEdit) {
      onUpdate(formData);
    } else {
      onSave({ 
        ...formData, 
        id: formData.id || Math.floor(1000 + Math.random() * 9000).toString(), 
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
              {isEdit ? 'Edit SEO Link' : 'New Custom SEO Link'}
            </h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">
              {isEdit ? `Modifying Engine ID: ${formData.id}` : 'Map an optimization vector to an object'}
            </p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="px-8 py-3 bg-[#7e3af2] text-white rounded-xl hover:bg-[#6c2bd9] transition-all text-sm font-bold flex items-center gap-2 shadow-lg shadow-purple-100 active:scale-95"
        >
          <FiSave size={18} />
          <span>{isEdit ? 'Update SEO Index' : 'Save SEO Index'}</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden text-left">
        <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-[11px] font-bold uppercase text-gray-400 tracking-widest flex items-center gap-2">
            <FiLink className="text-primary-500" /> Resolution Mapping
          </h3>
        </div>
        <div className="p-10 space-y-12">
          
          <div>
             <h4 className="text-xs font-black text-gray-800 uppercase tracking-widest mb-6 border-b border-gray-100 pb-2 flex items-center gap-2">
                <FiSettings className="text-primary-400"/> Core Mapping Definitions
             </h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-2 lg:col-span-1">
                 <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase px-1">ID (Optional)</label>
                 <div className="relative group">
                   <FiHash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                   <input
                     type="text"
                     value={formData.id}
                     onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                     className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all placeholder:text-gray-300 shadow-sm"
                     placeholder="Auto-generated if empty"
                   />
                 </div>
               </div>

               <div className="space-y-2 lg:col-span-1">
                 <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase px-1">Language</label>
                 <div className="relative group">
                   <FiGlobe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                   <select
                     value={formData.language}
                     onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                     className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none appearance-none transition-all cursor-pointer shadow-sm"
                   >
                     <option value="Standard">Standard / Null</option>
                     <option value="English">English</option>
                     <option value="Spanish">Spanish</option>
                   </select>
                 </div>
               </div>

               <div className="space-y-2 lg:col-span-2">
                 <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase px-1">SEO Name / Friendly URL</label>
                 <div className="relative group">
                   <FiType className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                   <input
                     type="text"
                     value={formData.seoName}
                     onChange={(e) => setFormData({ ...formData, seoName: e.target.value })}
                     className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-gray-800 shadow-sm"
                     placeholder="e.g. premium-leather-jacket"
                   />
                 </div>
               </div>
             </div>
          </div>

          <div>
             <h4 className="text-xs font-black text-gray-800 uppercase tracking-widest mb-6 border-b border-gray-100 pb-2 flex items-center gap-2">
                <FiLayers className="text-blue-400"/> Destination Payload Attributes
             </h4>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="space-y-2 lg:col-span-1">
                 <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase px-1">Object Entity Target</label>
                 <div className="relative group">
                   <FiLayers className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                   <select
                     value={formData.objectType}
                     onChange={(e) => setFormData({ ...formData, objectType: e.target.value })}
                     className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none appearance-none transition-all cursor-pointer shadow-sm"
                   >
                     <option value="Product">Product</option>
                     <option value="Category">Category</option>
                     <option value="Brand">Brand / Manufacturer</option>
                     <option value="Topic">Topic Pages</option>
                   </select>
                 </div>
               </div>
               
               <div className="space-y-2 lg:col-span-1">
                 <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase px-1">Internal Object ID</label>
                 <div className="relative group">
                   <FiHash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                   <input
                     type="number"
                     value={formData.objectId}
                     onChange={(e) => setFormData({ ...formData, objectId: e.target.value })}
                     className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all shadow-sm"
                     placeholder="e.g. 54"
                   />
                 </div>
               </div>

               <div className="space-y-2 lg:col-span-1">
                 <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase px-1">Names per object index</label>
                 <div className="relative group">
                   <FiLink className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-600 transition-colors" />
                   <input
                     type="number"
                     value={formData.namesPerObject}
                     onChange={(e) => setFormData({ ...formData, namesPerObject: e.target.value })}
                     className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold transition-all shadow-sm outline-none"
                   />
                 </div>
               </div>
             </div>
          </div>
          
          <div className="flex items-end pt-4">
             <div className={`p-6 rounded-3xl border border-gray-100 flex items-center justify-between cursor-pointer transition-all shadow-sm w-full md:w-1/2 ${formData.active ? 'bg-gradient-to-r from-green-50 to-emerald-50/20 shadow-green-100/50' : 'bg-gray-50/50'}`}
               onClick={() => setFormData({ ...formData, active: !formData.active })}
             >
                <div className="flex items-center gap-4">
                   <div className={`p-3 rounded-2xl ${formData.active ? 'bg-green-500 text-white shadow-lg shadow-green-200' : 'bg-white text-gray-400 shadow-sm border border-gray-100'}`}>
                      {formData.active ? <FiCheck size={20} /> : <FiX size={20} />}
                   </div>
                   <div>
                      <h5 className="text-xs font-black text-gray-800 uppercase tracking-widest mb-0.5">Route Engine Status</h5>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">{formData.active ? 'Link mapping is broadcast live' : 'Link mapping is currently bypassed'}</span>
                   </div>
                </div>
                <div
                  className={`w-14 h-8 rounded-full relative transition-all duration-300 shadow-inner ${formData.active ? 'bg-green-500' : 'bg-gray-200'}`}
                >
                  <motion.div
                    animate={{ x: formData.active ? 28 : 4 }}
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

const SEONames = () => {
  const [view, setView] = useState('list');
  const [editingItem, setEditingItem] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showFilter, setShowFilter] = useState(false);
  
  // Filter States
  const [globalSearch, setGlobalSearch] = useState('');
  const [filters, setFilters] = useState({
    seoName: '',
  });

  const [seoLinks, setSeoLinks] = useState([
    { 
       id: '900', 
       seoName: 'apple-iphone-16', 
       namesPerObject: 1, 
       objectType: 'Product', 
       objectId: '103', 
       active: true, 
       language: 'Standard'
    },
    { 
       id: '901', 
       seoName: 'electronic-devices', 
       namesPerObject: 1, 
       objectType: 'Category', 
       objectId: '5', 
       active: true, 
       language: 'Standard'
    }
  ]);

  const filteredLinks = useMemo(() => {
    return seoLinks.filter(item => {
      const matchSeo = item.seoName.toLowerCase().includes(filters.seoName.toLowerCase());
      const matchGlobal = !globalSearch 
        || item.seoName.toLowerCase().includes(globalSearch.toLowerCase())
        || item.objectType.toLowerCase().includes(globalSearch.toLowerCase());

      return matchSeo && matchGlobal;
    });
  }, [seoLinks, filters, globalSearch]);

  const handleResetFilters = () => setFilters({
    seoName: '',
  });

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedIds(new Set(filteredLinks.map(r => r.id)));
    else setSelectedIds(new Set());
  };

  const handleSelectRow = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const handleSaveItem = (newItem) => {
    setSeoLinks([...seoLinks, newItem]);
    setView('list');
  };

  const handleUpdateItem = (updated) => {
    setSeoLinks(seoLinks.map(r => r.id === updated.id ? updated : r));
    setView('list');
  };

  const handleDeleteItem = (id) => {
    if (window.confirm('Delete this SEO routing link?')) {
      setSeoLinks(seoLinks.filter(r => r.id !== id));
      const newSelected = new Set(selectedIds);
      newSelected.delete(id);
      setSelectedIds(newSelected);
    }
  };

  const handleDeleteSelected = () => {
    if (window.confirm(`Permanently delete ${selectedIds.size} routing links?`)) {
      setSeoLinks(seoLinks.filter(r => !selectedIds.has(r.id)));
      setSelectedIds(new Set());
    }
  };

  const columns = [
    {
      key: 'checkbox',
      label: (
        <input
          type="checkbox"
          checked={selectedIds.size === filteredLinks.length && filteredLinks.length > 0}
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
      key: 'seoName',
      label: 'SEO Name',
      render: (v) => (
        <div className="flex items-center gap-2 group">
          <div className="p-1.5 bg-gray-50 rounded-lg text-gray-400 transition-colors shadow-sm border border-gray-100">
            <FiSearch size={12} />
          </div>
          <span className="font-bold text-gray-800 tracking-tight text-xs">/{v}</span>
        </div>
      )
    },
    {
      key: 'namesPerObject',
      label: 'Names per object',
      render: (v) => (
         <span className={`text-[10px] font-black tracking-widest pl-4 ${v > 1 ? 'text-orange-500' : 'text-gray-400'}`}>
            {v}
         </span>
      )
    },
    {
      key: 'objectType',
      label: 'Object',
      render: (v) => (
         <span className={`text-[9px] font-black border rounded px-2.5 py-1 uppercase tracking-widest shadow-sm ${v === 'Product' ? 'text-indigo-600 bg-indigo-50/50 border-indigo-200' : 'text-emerald-600 bg-emerald-50/50 border-emerald-200'}`}>
            {v}
         </span>
      )
    },
    {
      key: 'objectId',
      label: 'Object ID',
      render: (v) => (
         <span className="text-[11px] font-bold text-gray-500 tracking-tight block">
            #{v}
         </span>
      )
    },
    {
      key: 'active',
      label: 'Is active',
      render: (v) => v ?
        <div className="flex items-center justify-start ml-2"><FiCheck className="text-green-500 text-lg" /></div> :
        <div className="flex items-center justify-start ml-2 text-gray-200"><FiX className="text-lg" /></div>
    },
    {
      key: 'language',
      label: 'Language',
      render: (v) => (
         <div className="flex items-center gap-2 group">
            <FiGlobe size={12} className="text-gray-400" />
            <span className="font-bold text-gray-600 tracking-tight text-[11px]">{v}</span>
         </div>
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
      <SEOForm
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
                  <FiSearch />
               </div>
               <div>
                  <h1 className="text-sm font-bold text-gray-600 tracking-tight">Search Engine Friendly Names</h1>
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
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 px-1 font-black">
                    <FiSearch size={10} /> Extract by Slug
                  </label>
                  <input
                    type="text"
                    value={filters.seoName}
                    onChange={(e) => setFilters({ ...filters, seoName: e.target.value })}
                    placeholder="Search SEO slug names..."
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary-500/20 outline-none transition-all shadow-sm"
                  />
                </div>

                <div className="lg:col-span-2 flex items-center justify-between pt-6 border-t border-gray-200/50 mt-2">
                   <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Active Maps: {filteredLinks.length}</span>
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
            data={filteredLinks}
            columns={columns}
            pagination={true}
            itemsPerPage={10}
            className="border-none shadow-none rounded-none w-full xl:w-full min-w-[1200px]"
          />

          {filteredLinks.length === 0 && (
            <div className="flex flex-col items-center justify-center p-24 bg-gray-50/20 space-y-4">
              <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 text-gray-200">
                <FiLink size={48} />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">No Links Bound</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Awaiting destination endpoints</p>
              </div>
            </div>
          )}
        </div>

        {/* Action Bar Footer */}
        <div className="p-4 px-6 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shadow-sm shadow-indigo-200" />
                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">Total Active Slugs: {seoLinks.length}</span>
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

export default SEONames;
