import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiFilter, 
  FiX, 
  FiSettings, 
  FiCalendar,
  FiSlash,
  FiBox,
  FiCheck,
  FiClock
} from 'react-icons/fi';
import DataTable from '../../components/DataTable';

const ProductsNeverPurchased = () => {
  // UI State
  const [showFilter, setShowFilter] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Filter State
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
  });

  const [tableSettings, setTableSettings] = useState({
    rowLines: true,
    columnLines: false,
    striped: false,
    hover: true,
  });

  const [visibleColumns, setVisibleColumns] = useState({
    image: true,
    id: true,
    name: true,
    sku: true,
    gtin: true,
    mpn: true,
    price: true,
    stock: true,
    created: true,
    updated: true,
    published: true,
    totalQty: true,
    totalAmt: true,
  });

  // Mock Data (Empty for now)
  const initialData = [];

  const [products] = useState(initialData);

  // Filtering Logic
  const filteredData = useMemo(() => {
    return products.filter(item => {
      const itemDate = new Date(item.created).getTime();
      const start = filters.startDate ? new Date(filters.startDate).getTime() : 0;
      const end = filters.endDate ? new Date(filters.endDate).getTime() : Infinity;
      return itemDate >= start && itemDate <= end;
    });
  }, [products, filters]);

  const handleResetFilters = () => {
    setFilters({ startDate: '', endDate: '' });
  };

  // Table Columns
  const columns = [
    { 
      key: 'image', 
      label: 'Image', 
      hidden: !visibleColumns.image,
      render: (v) => (
        <div className="w-12 h-12 rounded-lg border border-gray-100 overflow-hidden bg-gray-50 flex items-center justify-center p-1 grayscale group-hover:grayscale-0 transition-all duration-500">
          <img src={v} alt="product" className="max-w-full max-h-full object-cover rounded opacity-40 group-hover:opacity-100" />
        </div>
      )
    },
    { key: 'id', label: 'ID', hidden: !visibleColumns.id, render: (v) => <span className="font-mono text-[10px] font-black tracking-tight text-gray-300">{v}</span> },
    { key: 'name', label: 'Product Name', hidden: !visibleColumns.name, render: (v) => <span className="font-bold text-gray-800 whitespace-nowrap tracking-tight">{v}</span> },
    { key: 'sku', label: 'SKU', hidden: !visibleColumns.sku, render: (v) => <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{v}</span> },
    { key: 'gtin', label: 'GTIN', hidden: !visibleColumns.gtin, render: (v) => <span className="text-[9px] text-gray-300 font-mono italic whitespace-nowrap">{v}</span> },
    { key: 'mpn', label: 'MPN', hidden: !visibleColumns.mpn, render: (v) => <span className="text-[9px] text-gray-300 font-mono italic whitespace-nowrap">{v}</span> },
    { key: 'price', label: 'Price', hidden: !visibleColumns.price, render: (v) => <span className="font-bold text-gray-700">{v}</span> },
    { key: 'stock', label: 'Stock Qty', hidden: !visibleColumns.stock, render: (v) => <span className="font-black text-gray-400 text-xs">{v}</span> },
    { key: 'created', label: 'Created On', hidden: !visibleColumns.created, render: (v) => <span className="text-[10px] text-gray-400 whitespace-nowrap font-medium italic">{v}</span> },
    { key: 'updated', label: 'Updated On', hidden: !visibleColumns.updated, render: (v) => <span className="text-[10px] text-gray-400 whitespace-nowrap font-medium italic">{v}</span> },
    { 
      key: 'published', 
      label: 'Status', 
      hidden: !visibleColumns.published,
      render: (v) => (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${v ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
          {v ? 'Active' : 'Closed'}
        </span>
      )
    },
    { key: 'totalQty', label: 'Total Sold', hidden: !visibleColumns.totalQty, render: () => <span className="font-black text-gray-300 bg-gray-50 p-1 px-2.5 rounded-lg text-[9px] uppercase tracking-tighter italic border border-gray-100">0 Items</span> },
    { key: 'totalAmt', label: 'Total Amt', hidden: !visibleColumns.totalAmt, render: () => <span className="font-black text-gray-300 italic text-[10px]">₹0.00</span> },
  ];

  const filteredColumns = columns.filter(col => !col.hidden);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-20"
    >
      {/* Mobile Header */}
      <div className="lg:hidden">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 font-black tracking-tight">Never Purchased</h1>
        <p className="text-sm sm:text-base text-gray-600">Identifying stagnant inventory and aging products</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-visible relative">
        
        {/* Action Bar */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-primary-600">
            <div className="p-2 bg-primary-50 rounded-lg"><FiSlash /></div>
            <span className="text-sm font-bold text-gray-600">Stagnant Inventory</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className={`px-4 py-2 rounded-lg border transition-all text-sm font-medium flex items-center gap-2 shadow-sm ${
                showFilter || Object.values(filters).some(v => v !== '')
                  ? 'bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-100'
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
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <FiCalendar /> Start Date
                  </label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-sm"
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
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-sm"
                  />
                </div>

                <div className="lg:col-span-2 flex items-center justify-between pb-1 border-b border-gray-100 lg:border-none">
                  <div className="flex flex-col gap-0.5">
                     <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Inventory Aging</span>
                     <span className="text-[9px] text-gray-300 italic">Filter products by creation window</span>
                  </div>
                  <button onClick={handleResetFilters} className="text-xs font-bold text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors">
                    <FiX size={14} /> Clear Window
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

        {/* Footer info/pagination with Settings */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
             <FiClock className="text-gray-300" /> TOTAL_ZERO_SALE_ITEMS: {filteredData.length}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Settings Button */}
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded border transition-all ${showSettings ? 'bg-primary-50 border-primary-300 text-primary-600 shadow-sm' : 'bg-gray-200 border-gray-300 text-gray-700 hover:bg-gray-300'}`}
              >
                <FiSettings className={`${showSettings ? 'animate-spin-slow' : ''}`} />
              </button>

              <AnimatePresence>
                {showSettings && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-full right-0 mb-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 z-50 pointer-events-auto"
                  >
                    <div className="space-y-4 text-left">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2 mb-3">View Matrix</h4>
                      
                      {/* Toggles */}
                      <div className="space-y-3">
                        {['Row lines', 'Column lines', 'Striped', 'Hover'].map(label => {
                          const key = label === 'Row lines' ? 'rowLines' : label === 'Column lines' ? 'columnLines' : label.toLowerCase();
                          return (
                            <div key={label} className="flex items-center justify-between group">
                              <span className="text-xs font-bold text-gray-600">{label}</span>
                              <button
                                onClick={() => setTableSettings(s => ({ ...s, [key]: !s[key] }))}
                                className={`w-10 h-5 rounded-full relative transition-colors duration-200 shadow-inner ${tableSettings[key] ? 'bg-primary-600' : 'bg-gray-300'}`}
                              >
                                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${tableSettings[key] ? 'translate-x-5' : 'translate-x-1'}`} />
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      {/* Column Visibility */}
                      <div className="grid grid-cols-2 gap-x-4 gap-y-3 pt-3 border-t border-gray-50">
                        {Object.entries(visibleColumns).map(([key, isVisible]) => (
                          <label key={key} className="flex items-center gap-2 cursor-pointer group">
                            <div
                              onClick={() => setVisibleColumns(v => ({ ...v, [key]: !v[key] }))}
                              className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isVisible ? 'bg-primary-600 border-primary-600' : 'bg-white border-gray-300'}`}
                            >
                              {isVisible && <FiCheck className="text-white text-[10px]" />}
                            </div>
                            <span className={`text-[10px] font-bold uppercase transition-colors ${isVisible ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-600'}`}>
                              {key}
                            </span>
                          </label>
                        ))}
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

export default ProductsNeverPurchased;
