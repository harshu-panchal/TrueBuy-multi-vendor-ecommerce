import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiFilter, 
  FiX, 
  FiSettings, 
  FiChevronDown,
  FiChevronRight,
  FiCalendar,
  FiShoppingBag,
  FiTag,
  FiExternalLink,
  FiCheck,
  FiUsers
} from 'react-icons/fi';
import DataTable from '../../components/DataTable';

const CurrentShoppingCarts = () => {
  // UI State
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [showFilter, setShowFilter] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Filter State
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    store: 'all'
  });

  const [tableSettings, setTableSettings] = useState({
    rowLines: true,
    columnLines: false,
    striped: false,
    hover: true,
  });

  const [visibleColumns, setVisibleColumns] = useState({
    customer: true,
    totalItems: true,
    date: true,
  });

  // Mock Data (Empty for now)
  const initialData = [];

  const [carts] = useState(initialData);

  // Filtering Logic
  const filteredData = useMemo(() => {
    return carts.filter(item => {
      const itemDate = new Date(item.date).getTime();
      const start = filters.startDate ? new Date(filters.startDate).getTime() : 0;
      const end = filters.endDate ? new Date(filters.endDate).getTime() : Infinity;
      
      const matchDate = itemDate >= start && itemDate <= end;
      const matchStore = filters.store === 'all' || true; // Placeholder

      return matchDate && matchStore;
    });
  }, [carts, filters]);

  // Expansion Logic
  const toggleExpand = (id) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) newExpanded.delete(id);
    else newExpanded.add(id);
    setExpandedRows(newExpanded);
  };

  const handleResetFilters = () => {
    setFilters({ startDate: '', endDate: '', store: 'all' });
  };

  // Table Columns (Parent)
  const columns = [
    {
      key: 'expand',
      label: '',
      render: (_, row) => (
        <button 
          onClick={() => toggleExpand(row.id)}
          className={`p-2 rounded-lg transition-all ${expandedRows.has(row.id) ? 'bg-primary-50 text-primary-600 rotate-90' : 'text-gray-400 hover:bg-gray-50'}`}
        >
          <FiChevronRight className="transition-transform duration-300" />
        </button>
      )
    },
    { 
      key: 'customer', 
      label: 'Customer', 
      hidden: !visibleColumns.customer,
      render: (v, row) => (
        <div className="flex flex-col">
          <span className="font-bold text-gray-800 tracking-tight">{v}</span>
          <span className="text-[10px] text-gray-400 font-medium italic">{row.email}</span>
        </div>
      )
    },
    { 
      key: 'totalItems', 
      label: 'Total Items', 
      hidden: !visibleColumns.totalItems,
      render: (v) => <span className="p-1 px-2.5 bg-blue-50 text-blue-600 rounded-lg font-black text-[10px] uppercase tracking-wider">{v} items</span>
    },
    { key: 'date', label: 'Date', hidden: !visibleColumns.date, render: (v) => <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{v}</span> },
  ];

  const filteredColumns = columns.filter(col => !col.hidden);

  // Child Table Component
  const ChildTable = ({ items }) => (
    <div className="p-4 bg-gray-50/50 rounded-xl m-2 border border-blue-100 shadow-inner overflow-hidden">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 text-gray-400 uppercase font-black text-[10px] tracking-widest border-b border-gray-100">
            <tr>
              <th className="p-3 pl-5">Product</th>
              <th className="p-3">Status</th>
              <th className="p-3">Qty</th>
              <th className="p-3 font-mono text-[9px]">Price (Unit)</th>
              <th className="p-3 font-mono text-[9px]">Total (Excl.)</th>
              <th className="p-3 pr-5 text-right font-mono text-[9px]">Store ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {items.map(item => (
              <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="p-3 pl-5 font-bold text-gray-700 tracking-tight">{item.product}</td>
                <td className="p-3">
                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-tight ${item.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {item.active ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td className="p-3 font-mono text-[10px] font-black text-gray-400">{item.quantity}</td>
                <td className="p-3 font-bold text-gray-600 text-[10px]">{item.unitPrice}</td>
                <td className="p-3 text-primary-600 font-black text-[10px]">{item.total}</td>
                <td className="p-3 pr-5 text-right font-mono text-[9px] font-black text-gray-300 uppercase italic tracking-tighter">{item.store}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-20"
    >
      {/* Mobile Header */}
      <div className="lg:hidden">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Current Shopping Carts</h1>
        <p className="text-sm sm:text-base text-gray-600">Track current items in customer baskets</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-visible relative">
        
        {/* Action Bar */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-gray-500">
            <div className="p-2 bg-gray-100 rounded-lg"><FiShoppingBag /></div>
            <span className="text-sm font-bold text-gray-600">Active Sessions</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className={`px-4 py-2 rounded-lg border transition-all text-sm font-medium flex items-center gap-2 shadow-sm ${
                showFilter || Object.values(filters).some(v => v !== '' && v !== 'all')
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
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <FiCalendar /> Start Date
                  </label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 outline-none shadow-sm transition-all shadow-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <FiCalendar /> End Date
                  </label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 outline-none shadow-sm transition-all shadow-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <FiTag /> Store
                  </label>
                  <select
                    value={filters.store}
                    onChange={(e) => setFilters({...filters, store: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 outline-none appearance-none shadow-sm transition-all"
                  >
                    <option value="all">Unspecified</option>
                  </select>
                </div>

                <div className="md:col-span-3 flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-[10px] uppercase font-black text-gray-300 tracking-widest whitespace-nowrap">Cart Snapshots</span>
                  <button onClick={handleResetFilters} className="text-xs font-bold text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors">
                    <FiX size={14} /> Clear Selection
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Table Section */}
        <div className="p-0 overflow-x-auto min-h-[400px]">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100 text-xs text-gray-400 uppercase font-black tracking-widest">
              <tr>
                {filteredColumns.map(col => (
                  <th key={col.key} className="p-4 px-6">{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredData.map(row => (
                <React.Fragment key={row.id}>
                  <tr className={`group transition-all ${expandedRows.has(row.id) ? 'bg-primary-50/30' : 'hover:bg-gray-50/50'}`}>
                    {filteredColumns.map(col => (
                      <td key={col.key} className="p-4 px-6 text-sm">
                        {col.render ? col.render(row[col.key], row) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                  
                  {/* Expanded Row */}
                  <AnimatePresence>
                    {expandedRows.has(row.id) && (
                      <tr>
                        <td colSpan={filteredColumns.length} className="p-0 border-none bg-primary-50/10">
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                             <ChildTable items={row.items} />
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer with Settings */}
        <div className="p-4 px-6 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <span className="text-[10px] font-black uppercase text-gray-400 tracking-tighter">Current Sessions: {filteredData.length}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Settings Button */}
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded border transition-all ${showSettings ? 'bg-primary-50 border-primary-300 text-primary-600' : 'bg-gray-200 border-gray-300 text-gray-700'}`}
              >
                <FiSettings />
              </button>

              <AnimatePresence>
                {showSettings && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-full right-0 mb-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 z-50 pointer-events-auto"
                  >
                    <div className="space-y-3">
                      <h4 className="text-xs font-black uppercase text-gray-400 tracking-widest mb-3">Table Settings</h4>
                      {Object.entries(visibleColumns).map(([key, isVisible]) => (
                        <label key={key} className="flex items-center gap-2 cursor-pointer group">
                          <div
                            onClick={() => setVisibleColumns(v => ({ ...v, [key]: !v[key] }))}
                            className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isVisible ? 'bg-primary-600 border-primary-600' : 'bg-white border-gray-300'}`}
                          >
                            {isVisible && <FiCheck className="text-white text-[10px]" />}
                          </div>
                          <span className={`text-xs capitalize font-bold transition-colors ${isVisible ? 'text-gray-800' : 'text-gray-300 group-hover:text-gray-500'}`}>
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                        </label>
                      ))}
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

export default CurrentShoppingCarts;
