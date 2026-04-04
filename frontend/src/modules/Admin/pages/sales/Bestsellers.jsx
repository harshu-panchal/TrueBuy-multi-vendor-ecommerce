import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiFilter, 
  FiX, 
  FiSettings, 
  FiChevronDown,
  FiCalendar,
  FiTrendingUp,
  FiBox,
  FiDollarSign,
  FiTruck,
  FiCreditCard,
  FiCheck
} from 'react-icons/fi';
import DataTable from '../../components/DataTable';

const Bestsellers = () => {
  // UI State
  const [showFilter, setShowFilter] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Filter State
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    orderStatus: 'all',
    paymentStatus: 'all',
    shippingStatus: 'all'
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
      // Functional date filtering
      const itemDate = new Date(item.created).getTime();
      const start = filters.startDate ? new Date(filters.startDate).getTime() : 0;
      const end = filters.endDate ? new Date(filters.endDate).getTime() : Infinity;
      const matchDate = itemDate >= start && itemDate <= end;
      
      // Select filtering (Placeholders since mock data doesn't have these statuses yet)
      const matchOrder = filters.orderStatus === 'all' || true;
      const matchPayment = filters.paymentStatus === 'all' || true;
      const matchShipping = filters.shippingStatus === 'all' || true;

      return matchDate && matchOrder && matchPayment && matchShipping;
    });
  }, [products, filters]);

  const handleResetFilters = () => {
    setFilters({ startDate: '', endDate: '', orderStatus: 'all', paymentStatus: 'all', shippingStatus: 'all' });
  };

  // Table Columns
  const columns = [
    { 
      key: 'image', 
      label: 'Image', 
      hidden: !visibleColumns.image,
      render: (v) => (
        <div className="w-12 h-12 rounded-lg border border-gray-100 overflow-hidden bg-gray-50 flex items-center justify-center p-1">
          <img src={v} alt="product" className="max-w-full max-h-full object-cover rounded" />
        </div>
      )
    },
    { key: 'id', label: 'ID', hidden: !visibleColumns.id, render: (v) => <span className="font-mono text-[10px] text-gray-400 font-black tracking-tight">{v}</span> },
    { key: 'name', label: 'Product Name', hidden: !visibleColumns.name, render: (v) => <span className="font-bold text-gray-800 whitespace-nowrap">{v}</span> },
    { key: 'sku', label: 'SKU', hidden: !visibleColumns.sku, render: (v) => <span className="text-xs text-gray-400 font-medium">{v}</span> },
    { key: 'gtin', label: 'GTIN', hidden: !visibleColumns.gtin, render: (v) => <span className="text-[10px] text-gray-400 font-mono italic whitespace-nowrap">{v}</span> },
    { key: 'mpn', label: 'MPN', hidden: !visibleColumns.mpn, render: (v) => <span className="text-[10px] text-gray-400 font-mono">{v}</span> },
    { key: 'price', label: 'Price', hidden: !visibleColumns.price, render: (v) => <span className="font-bold text-gray-700">{v}</span> },
    { key: 'stock', label: 'Stock', hidden: !visibleColumns.stock, render: (v) => <span className={`${v < 20 ? 'text-orange-500' : 'text-gray-500'} font-black text-xs`}>{v}</span> },
    { key: 'created', label: 'Created On', hidden: !visibleColumns.created, render: (v) => <span className="text-[10px] text-gray-400 whitespace-nowrap">{v}</span> },
    { key: 'updated', label: 'Updated On', hidden: !visibleColumns.updated, render: (v) => <span className="text-[10px] text-gray-400 whitespace-nowrap">{v}</span> },
    { 
      key: 'published', 
      label: 'Published', 
      hidden: !visibleColumns.published,
      render: (v) => (
        <span className={`p-1 px-2.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${v ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
          {v ? 'Published' : 'Hidden'}
        </span>
      )
    },
    { key: 'totalQty', label: 'Total Qty', hidden: !visibleColumns.totalQty, render: (v) => <span className="font-black text-gray-900 bg-gray-100 p-1 px-2 rounded-md text-[10px]">{v} Sold</span> },
    { key: 'totalAmt', label: 'Total Amount', hidden: !visibleColumns.totalAmt, render: (v) => <span className="font-black text-primary-600">{v}</span> },
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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Bestsellers</h1>
        <p className="text-sm sm:text-base text-gray-600">Top performing products based on sales volume</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-visible relative">
        
        {/* Action Bar */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-primary-600">
            <div className="p-2 bg-primary-50 rounded-lg"><FiTrendingUp /></div>
            <span className="text-sm font-bold text-gray-600">Market Intelligence</span>
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
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
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

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <FiBox /> Order Status
                  </label>
                  <select
                    value={filters.orderStatus}
                    onChange={(e) => setFilters({...filters, orderStatus: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 outline-none appearance-none transition-all shadow-sm"
                  >
                    <option value="all">All</option>
                    <option>Pending</option>
                    <option>Processing</option>
                    <option>Complete</option>
                    <option>Cancelled</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <FiCreditCard /> Payment Status
                  </label>
                  <select
                    value={filters.paymentStatus}
                    onChange={(e) => setFilters({...filters, paymentStatus: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 outline-none appearance-none transition-all shadow-sm"
                  >
                    <option value="all">All</option>
                    <option>Pending</option>
                    <option>Authorized</option>
                    <option>Paid</option>
                    <option>Partially Refunded</option>
                    <option>Refunded</option>
                    <option>Voided</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <FiTruck /> Shipping Status
                  </label>
                  <select
                    value={filters.shippingStatus}
                    onChange={(e) => setFilters({...filters, shippingStatus: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 outline-none appearance-none transition-all shadow-sm"
                  >
                    <option value="all">All</option>
                    <option>Shipping Not Required</option>
                    <option>Not Yet Shipped</option>
                    <option>Partially Shipped</option>
                    <option>Shipped</option>
                    <option>Delivered</option>
                  </select>
                </div>

                <div className="lg:col-span-5 flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-[10px] font-black text-gray-300 uppercase tracking-[.25em]">Volume Metrics</span>
                  <button onClick={handleResetFilters} className="text-xs font-bold text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors">
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
            pagination={false}
            rowLines={tableSettings.rowLines}
            columnLines={tableSettings.columnLines}
            className={`${tableSettings.striped ? '[&_tbody_tr:nth-child(even)]:bg-gray-50/50' : ''} ${!tableSettings.hover ? '[&_tbody_tr]:hover:bg-transparent' : ''}`}
          />
        </div>

        {/* Footer info/pagination with Settings */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            ANALYZING {filteredData.length} BESTSELLERS
          </div>

          <div className="flex items-center gap-2">
            {/* Settings Button */}
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded border transition-all ${showSettings ? 'bg-primary-50 border-primary-300 text-primary-600' : 'bg-gray-200 border-gray-300 text-gray-700 hover:bg-gray-300'}`}
              >
                <FiSettings />
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
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b pb-2 mb-3">Table Configuration</h4>
                      
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
                      <div className="grid grid-cols-2 gap-x-4 gap-y-3 pt-3 border-t border-gray-100">
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

export default Bestsellers;
