import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiFilter, 
  FiX, 
  FiSettings, 
  FiPlus,
  FiSearch,
  FiTrash2,
  FiCheck,
  FiList,
  FiArrowLeft,
  FiSave,
  FiLayout,
  FiType,
  FiAtSign,
  FiToggleLeft,
  FiLayers,
  FiInfo,
  FiTerminal,
  FiAlertCircle,
  FiHash,
  FiEdit2,
  FiMoreVertical
} from 'react-icons/fi';
import DataTable from '../../components/DataTable';

const AttributeForm = ({ onBack, onSave }) => {
  const [activeTab, setActiveTab] = useState('General');
  const [formData, setFormData] = useState({
    name: '',
    alias: '',
    description: '',
    order: 0,
    allowFiltering: false,
    searchUIType: 'Checkboxes',
    indexOptionNames: false,
    exportMappings: ''
  });

  const tabs = ['General', 'Option Sets'];

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
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Add a New Product Attribute</h1>
            <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
              <FiList /> Catalog Management Configuration
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

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1 bg-gray-100/50 p-1 rounded-2xl w-fit border border-gray-200/50">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
              activeTab === tab 
                ? 'bg-white text-primary-600 shadow-sm border border-gray-100' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'General' ? (
          <motion.div
            key="general"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-[11px] font-bold uppercase text-gray-400 tracking-widest flex items-center gap-2">
                    <FiLayout className="text-primary-500" /> General Configuration
                  </h3>
                </div>
                <div className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="e.g. Color"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none shadow-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 flex items-center gap-1">
                        <FiAtSign className="text-[10px]" /> Alias
                      </label>
                      <input
                        type="text"
                        value={formData.alias}
                        onChange={(e) => setFormData({...formData, alias: e.target.value})}
                        placeholder="e.g. color-hex"
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Briefly describe the attribute's purpose..."
                      rows={3}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none shadow-sm resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                       <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl border border-gray-100 transition-all hover:bg-white hover:shadow-sm group">
                        <div>
                          <h5 className="text-[11px] font-bold text-gray-800 uppercase tracking-widest">Allow Filtering</h5>
                          <p className="text-[10px] text-gray-400 font-medium">Toggle attribute in shop filters</p>
                        </div>
                        <button
                          onClick={() => setFormData({...formData, allowFiltering: !formData.allowFiltering})}
                          className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${formData.allowFiltering ? 'bg-primary-600' : 'bg-gray-200'}`}
                        >
                          <motion.div 
                            animate={{ x: formData.allowFiltering ? 24 : 4 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm" 
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl border border-gray-100 transition-all hover:bg-white hover:shadow-sm group">
                        <div>
                          <h5 className="text-[11px] font-bold text-gray-800 uppercase tracking-widest">Index Option Names</h5>
                          <p className="text-[10px] text-gray-400 font-medium">Add names to search index</p>
                        </div>
                        <button
                          onClick={() => setFormData({...formData, indexOptionNames: !formData.indexOptionNames})}
                          className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${formData.indexOptionNames ? 'bg-primary-500' : 'bg-gray-200'}`}
                        >
                          <motion.div 
                            animate={{ x: formData.indexOptionNames ? 24 : 4 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm" 
                          />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Display Order</label>
                        <input
                          type="number"
                          value={formData.order}
                          onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none shadow-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Search UI Type</label>
                        <select
                          value={formData.searchUIType}
                          onChange={(e) => setFormData({...formData, searchUIType: e.target.value})}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none appearance-none shadow-sm font-bold text-gray-700"
                        >
                          <option>Checkboxes</option>
                          <option>Boxes (color & image)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-gray-50">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-800 uppercase tracking-widest flex items-center gap-2">
                        <FiTerminal className="text-primary-500" /> Mappings to Export Fields
                      </label>
                      <input
                        type="text"
                        value={formData.exportMappings}
                        onChange={(e) => setFormData({...formData, exportMappings: e.target.value})}
                        placeholder="Format prefix : Export field name"
                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-primary-500 outline-none shadow-inner"
                      />
                    </div>
                    <div className="flex gap-3 p-4 bg-amber-50/30 border border-amber-100 rounded-2xl group transition-all hover:bg-amber-50/50 shadow-sm shadow-amber-50/50">
                      <div className="p-2.5 bg-white rounded-xl border border-amber-100 text-amber-600 shadow-sm shrink-0 h-fit">
                        <FiInfo size={18} />
                      </div>
                      <p className="text-[10px] text-amber-800 leading-relaxed font-bold tracking-tight">
                        Define mappings of attribute values to export fields according to the pattern <span className="text-primary-600 font-black">&lt;Format prefix&gt;:&lt;Export field name&gt;</span>. 
                        Example: <span className="bg-white/80 px-1.5 py-0.5 rounded border border-amber-200 font-mono italic text-[9px]">gmc:color</span> exports the attribute values for colors to the field 
                        <span className="font-black italic"> color</span> during the Google Merchant Center Export. The mappings are only effective when exporting attribute combinations.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="option-sets"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-gray-200 space-y-6 shadow-inner"
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
                Option Sets are dependent on the main record ID. <span className="text-primary-600">In order to proceed, the record must be saved first.</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const ProductAttributes = () => {
  // UI State
  const [view, setView] = useState('list'); // 'list' or 'add'
  const [showFilter, setShowFilter] = useState(false);
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
    id: true,
    name: true,
    alias: true,
    optionSets: true,
    allowFiltering: true,
    order: true,
    indexOptionNames: false,
    searchUIType: true,
  });

  // Filter State
  const [filters, setFilters] = useState({
    name: '',
    alias: '',
    allowFiltering: 'Unspecified'
  });

  // Mock Data
  const [attributes, setAttributes] = useState([]);

  // Filtering Logic
  const filteredData = useMemo(() => {
    return attributes.filter(item => {
      const matchName = item.name.toLowerCase().includes(filters.name.toLowerCase());
      const matchAlias = item.alias.toLowerCase().includes(filters.alias.toLowerCase());
      const matchFiltering = filters.allowFiltering === 'Unspecified' 
        || (filters.allowFiltering === 'Yes' && item.allowFiltering)
        || (filters.allowFiltering === 'No' && !item.allowFiltering);
      return matchName && matchAlias && matchFiltering;
    });
  }, [attributes, filters]);

  const handleResetFilters = () => setFilters({ name: '', alias: '', allowFiltering: 'Unspecified' });

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedIds(new Set(filteredData.map(a => a.id)));
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
    if (window.confirm(`Are you sure you want to delete ${selectedIds.size} selected attributes?`)) {
      setAttributes(attributes.filter(a => !selectedIds.has(a.id)));
      setSelectedIds(new Set());
    }
  };

  const handleSaveAttribute = (formData, continueEditing) => {
     console.log('Saving attribute:', formData);
     const newAttribute = {
        id: (attributes.length + 1).toString(),
        name: formData.name || 'New Attribute',
        alias: formData.alias,
        optionSets: '—',
        allowFiltering: formData.allowFiltering,
        order: formData.order,
        indexOptionNames: formData.indexOptionNames,
        searchUIType: formData.searchUIType
     };
     setAttributes([...attributes, newAttribute]);
     if (!continueEditing) setView('list');
     else alert('Attribute saved! You can now configure Option Sets if redirected (mock functionality).');
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
    { key: 'id', label: 'ID', hidden: !visibleColumns.id, render: (v) => <span className="font-mono text-[10px] font-black text-gray-400">{v}</span> },
    { key: 'name', label: 'Name', hidden: !visibleColumns.name, render: (v) => <span className="font-bold text-gray-800 tracking-tight">{v}</span> },
    { key: 'alias', label: 'Alias', hidden: !visibleColumns.alias, render: (v) => <span className="text-[10px] font-medium text-gray-400 italic">@{v}</span> },
    { key: 'optionSets', label: 'Option Sets', hidden: !visibleColumns.optionSets, render: (v) => <span className="text-xs text-gray-600 max-w-xs truncate block">{v}</span> },
    { 
      key: 'allowFiltering', 
      label: 'Allow Filtering', 
      hidden: !visibleColumns.allowFiltering,
      render: (v) => v ? <FiCheck className="text-green-600 text-lg mx-auto" /> : <span className="text-gray-300">—</span> 
    },
    { key: 'order', label: 'Display Order', hidden: !visibleColumns.order, render: (v) => <span className="px-2 py-0.5 bg-gray-100 rounded text-[10px] font-black text-gray-500">{v}</span> },
    { 
      key: 'indexOptionNames', 
      label: 'Index Names', 
      hidden: !visibleColumns.indexOptionNames,
      render: (v) => v ? <FiCheck className="text-primary-500 text-lg mx-auto" /> : <span className="text-gray-300">—</span> 
    },
    { key: 'searchUIType', label: 'Search UI Type', hidden: !visibleColumns.searchUIType, render: (v) => <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded border border-gray-100">{v}</span> },
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
              <div className="p-2 bg-primary-50 rounded-lg"><FiList /></div>
              <span className="text-sm font-bold text-gray-600">Product Attributes</span>
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

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className={`px-4 py-2 rounded-xl border transition-all text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-sm ${
                showFilter || filters.name !== '' || filters.alias !== '' || filters.allowFiltering !== 'Unspecified'
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
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl">
                <div className="space-y-1.5 flex-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 px-1">
                    <FiType /> Attribute Name
                  </label>
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input
                      type="text"
                      placeholder="Search attributes..."
                      value={filters.name}
                      onChange={(e) => setFilters({...filters, name: e.target.value})}
                      className="w-full pl-9 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 flex-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 px-1">
                    <FiAtSign /> Alias
                  </label>
                  <input
                    type="text"
                    placeholder="Search by alias..."
                    value={filters.alias}
                    onChange={(e) => setFilters({...filters, alias: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-sm"
                  />
                </div>

                <div className="space-y-1.5 w-full">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 px-1">
                    <FiToggleLeft /> Allow Filtering
                  </label>
                  <select
                    value={filters.allowFiltering}
                    onChange={(e) => setFilters({...filters, allowFiltering: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary-500 outline-none appearance-none transition-all shadow-sm"
                  >
                    <option>Unspecified</option>
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                </div>

                <div className="md:col-span-2 lg:col-span-3 flex items-center justify-between pt-4 border-t border-gray-100 mt-2">
                  <span className="text-[10px] uppercase font-bold text-gray-300 tracking-widest">Matched Attributes: {filteredData.length}</span>
                  <button onClick={handleResetFilters} className="text-xs font-bold text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors uppercase tracking-widest">
                    <FiX size={14} /> Reset Filters
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
            pagination={true}
            itemsPerPage={10}
            rowLines={tableSettings.rowLines}
            columnLines={tableSettings.columnLines}
            className={`rounded-none shadow-none border-none ${tableSettings.striped ? '[&_tbody_tr:nth-child(even)]:bg-gray-50/50' : ''} ${!tableSettings.hover ? '[&_tbody_tr]:hover:bg-transparent' : ''}`}
          />
        </div>

        {/* Meta Dashboard Footer */}
        <div className="p-4 px-6 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary-500 shadow-sm" />
                <span className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Total Attributes: {attributes.length}</span>
             </div>
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
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                          {[
                            { label: 'ID', key: 'id' },
                            { label: 'Name', key: 'name' },
                            { label: 'Alias', key: 'alias' },
                            { label: 'Option Sets', key: 'optionSets' },
                            { label: 'Filtering', key: 'allowFiltering' },
                            { label: 'Order', key: 'order' },
                            { label: 'Index Names', key: 'indexOptionNames' },
                            { label: 'UI Type', key: 'searchUIType' }
                          ].map(({ label, key }) => (
                            <label key={key} className="flex items-center gap-2 cursor-pointer group">
                              <div
                                onClick={() => setVisibleColumns(v => ({ ...v, [key]: !v[key] }))}
                                className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${visibleColumns[key] ? 'bg-primary-600 border-primary-600' : 'bg-white border-gray-300'}`}
                              >
                                {visibleColumns[key] && <FiCheck className="text-white text-[8px]" />}
                              </div>
                              <span className={`text-[9px] font-bold uppercase tracking-widest transition-colors ${visibleColumns[key] ? 'text-gray-900' : 'text-gray-400'}`}>
                                {label}
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

export default ProductAttributes;
