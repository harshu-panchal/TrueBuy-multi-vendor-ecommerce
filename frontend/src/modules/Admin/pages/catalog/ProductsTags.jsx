import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiFilter, 
  FiX, 
  FiSettings, 
  FiPlus,
  FiSearch,
  FiTag,
  FiCheck,
  FiTrash2,
  FiEdit2,
  FiMoreVertical,
  FiDatabase,
  FiAlertCircle,
  FiPackage,
  FiDollarSign,
  FiHash,
  FiCalendar
} from 'react-icons/fi';
import DataTable from '../../components/DataTable';

const ProductsTags = () => {
  // UI State
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
    tagName: true,
    taggedProducts: true,
    published: true,
    mpn: true,
    price: true,
    stockQuantity: true,
    createdOn: true,
    updatedOn: true,
  });

  // Filter State
  const [filters, setFilters] = useState({
    tagName: '',
    published: 'Unspecified'
  });

  // Mock Data
  const [tags, setTags] = useState([]);

  // Filtering Logic
  const filteredData = useMemo(() => {
    return tags.filter(item => {
      const matchName = item.tagName.toLowerCase().includes(filters.tagName.toLowerCase());
      const matchPublished = filters.published === 'Unspecified' 
        || (filters.published === 'Published' && item.published)
        || (filters.published === 'Not Published' && !item.published);
      return matchName && matchPublished;
    });
  }, [tags, filters]);

  const handleResetFilters = () => setFilters({ tagName: '', published: 'Unspecified' });

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedIds(new Set(filteredData.map(t => t.id)));
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
    if (window.confirm(`Are you sure you want to delete ${selectedIds.size} selected tags?`)) {
      setTags(tags.filter(t => !selectedIds.has(t.id)));
      setSelectedIds(new Set());
    }
  };

  const handleDeleteRow = (id) => {
    if (window.confirm('Are you sure you want to delete this tag?')) {
      setTags(tags.filter(t => t.id !== id));
      if (selectedIds.has(id)) {
        const newSelected = new Set(selectedIds);
        newSelected.delete(id);
        setSelectedIds(newSelected);
      }
    }
  };

  // Table Columns Mapping
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
    { key: 'tagName', label: 'Tag Name', hidden: !visibleColumns.tagName, render: (v) => <span className="font-bold text-gray-800 tracking-tight">{v}</span> },
    { key: 'taggedProducts', label: 'Tagged Products', hidden: !visibleColumns.taggedProducts, render: (v) => <span className="px-2 py-1 bg-primary-50 text-primary-600 rounded-lg text-xs font-black">{v}</span> },
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
    { key: 'mpn', label: 'MPN', hidden: !visibleColumns.mpn, render: (v) => <span className="font-mono text-[10px] text-gray-400 font-black">{v || '-'}</span> },
    { key: 'price', label: 'Price', hidden: !visibleColumns.price, render: (v) => <span className="text-gray-900 font-bold">${v.toFixed(2)}</span> },
    { key: 'stockQuantity', label: 'Stock Quantity', hidden: !visibleColumns.stockQuantity, render: (v) => <span className={`font-mono text-xs font-black ${v < 100 ? 'text-amber-600' : 'text-gray-500'}`}>{v}</span> },
    { key: 'createdOn', label: 'Created On', hidden: !visibleColumns.createdOn, render: (v) => <span className="text-[10px] font-medium text-gray-400">{v}</span> },
    { key: 'updatedOn', label: 'Updated On', hidden: !visibleColumns.updatedOn, render: (v) => <span className="text-[10px] font-medium text-gray-400">{v}</span> },
    {
      key: 'actions',
      label: 'Action',
      sortable: false,
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors shadow-sm bg-white border border-gray-100">
            <FiEdit2 size={14} />
          </button>
          <button 
            onClick={() => handleDeleteRow(row.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors shadow-sm bg-white border border-gray-100"
          >
            <FiTrash2 size={14} />
          </button>
        </div>
      )
    }
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
              <div className="p-2 bg-primary-50 rounded-lg"><FiTag /></div>
              <span className="text-sm font-bold text-gray-600">Product Tags Directory</span>
            </div>

            <AnimatePresence>
               {selectedIds.size > 0 && (
                 <motion.button
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.9 }}
                   onClick={handleDeleteSelected}
                   className="px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-red-100 active:scale-95"
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
              className={`px-4 py-2 rounded-xl border transition-all text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-sm ${
                showFilter || filters.tagName !== '' || filters.published !== 'Unspecified'
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
                    <FiTag /> Tag Name
                  </label>
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input
                      type="text"
                      placeholder="Search tags..."
                      value={filters.tagName}
                      onChange={(e) => setFilters({...filters, tagName: e.target.value})}
                      className="w-full pl-9 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 w-full lg:w-64">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 px-1">
                    <FiCheck /> Published Status
                  </label>
                  <select
                    value={filters.published}
                    onChange={(e) => setFilters({...filters, published: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary-500 outline-none appearance-none transition-all shadow-sm"
                  >
                    <option>Unspecified</option>
                    <option>Published</option>
                    <option>Not Published</option>
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
                <span className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Total Tags: {tags.length}</span>
             </div>
             <div className="flex items-center gap-2 px-6 border-l border-gray-200">
                <FiPackage className="text-gray-300" size={12} />
                <span className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Mapped Products: {tags.reduce((acc, curr) => acc + curr.taggedProducts, 0)}</span>
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
                            <span className="text-xs font-bold text-gray-600 group-hover:text-primary-600 transition-colors">{label}</span>
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
                            { label: 'Tag Name', key: 'tagName' },
                            { label: 'Tagged Products', key: 'taggedProducts' },
                            { label: 'Published', key: 'published' },
                            { label: 'MPN', key: 'mpn' },
                            { label: 'Price', key: 'price' },
                            { label: 'Stock Quantity', key: 'stockQuantity' },
                            { label: 'Created On', key: 'createdOn' },
                            { label: 'Updated On', key: 'updatedOn' }
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

export default ProductsTags;
