import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiFilter, 
  FiSearch, 
  FiX, 
  FiCheck, 
  FiSettings, 
  FiChevronDown,
  FiUser,
  FiMail,
  FiShoppingBag,
  FiRepeat,
  FiMoreHorizontal,
  FiCalendar
} from 'react-icons/fi';
import DataTable from '../../components/DataTable';

const RecurringPayments = () => {
  // Selection/UI State
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showFilter, setShowFilter] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Filter State
  const [filters, setFilters] = useState({
    customerName: '',
    customerEmail: '',
    initialOrderId: '',
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
    customer: true,
    cycleLength: true,
    cyclePeriod: true,
    isActive: true,
    initialOrder: true,
    startDate: true,
    nextPayment: true,
    totalCycles: true,
    cyclesRemaining: true,
    createdOn: true,
  });

  // Mock Data (Empty for now)
  const initialData = [];

  const [payments] = useState(initialData);

  // Filtering Logic
  const filteredData = useMemo(() => {
    return payments.filter(item => {
      const matchName = !filters.customerName || item.customer.toLowerCase().includes(filters.customerName.toLowerCase());
      const matchEmail = !filters.customerEmail || item.email.toLowerCase().includes(filters.customerEmail.toLowerCase());
      const matchOrder = !filters.initialOrderId || item.initialOrder.toLowerCase().includes(filters.initialOrderId.toLowerCase());
      // Match Store placeholder (always true for all)
      const matchStore = filters.store === 'all' || true;

      return matchName && matchEmail && matchOrder && matchStore;
    });
  }, [payments, filters]);

  // Selection Handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedIds(new Set(filteredData.map(p => p.id)));
    else setSelectedIds(new Set());
  };

  const handleSelectRow = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const handleResetFilters = () => {
    setFilters({ customerName: '', customerEmail: '', initialOrderId: '', store: 'all' });
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
    { 
      key: 'customer', 
      label: 'Customer', 
      hidden: !visibleColumns.customer, 
      render: (v, row) => (
        <div className="flex flex-col">
          <span className="font-bold text-gray-800">{v}</span>
          <span className="text-xs text-gray-400">{row.email}</span>
        </div>
      ) 
    },
    { key: 'cycleLength', label: 'Cycle Length', hidden: !visibleColumns.cycleLength, render: (v) => <span className="font-bold text-gray-600">{v}</span> },
    { key: 'cyclePeriod', label: 'Cycle Period', hidden: !visibleColumns.cyclePeriod, render: (v) => <span className="text-xs font-medium text-gray-500">{v}</span> },
    { 
      key: 'isActive', 
      label: 'Status', 
      hidden: !visibleColumns.isActive,
      render: (v) => (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${v ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          {v ? 'Active' : 'Inactive'}
        </span>
      )
    },
    { key: 'initialOrder', label: 'Initial Order', hidden: !visibleColumns.initialOrder, render: (v) => <span className="text-primary-600 hover:underline cursor-pointer font-bold">{v}</span> },
    { key: 'startDate', label: 'Start Date', hidden: !visibleColumns.startDate, render: (v) => <span className="text-xs font-medium text-gray-400">{v}</span> },
    { key: 'nextPayment', label: 'Next Payment', hidden: !visibleColumns.nextPayment, render: (v) => <span className="text-xs font-bold text-gray-700">{v}</span> },
    { key: 'totalCycles', label: 'Total', hidden: !visibleColumns.totalCycles, render: (v) => <span className="font-black text-gray-400 text-[10px] uppercase">{v} Cycles</span> },
    { key: 'cyclesRemaining', label: 'Remaining', hidden: !visibleColumns.cyclesRemaining, render: (v) => <span className="font-black text-primary-600 text-[10px] uppercase">{v} Left</span> },
    { key: 'createdOn', label: 'Created On', hidden: !visibleColumns.createdOn, render: (v) => <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">{v}</span> },
  ];

  const filteredColumns = columns.filter(col => !col.hidden);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Mobile Header */}
      <div className="lg:hidden">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Recurring Payments</h1>
        <p className="text-sm sm:text-base text-gray-600">Subscriptions and automatic billing logs</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 relative mb-20 overflow-visible">
        
        {/* Action Bar */}
        <div className="p-4 border-b border-gray-100 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-primary-600">
            <div className="p-2 bg-primary-50 rounded-lg"><FiRepeat /></div>
            <span className="text-sm font-bold text-gray-600">Recurring Billing</span>
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
              className="overflow-hidden bg-gray-50/30 border-b border-gray-100"
            >
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <FiUser /> Customer Name
                  </label>
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input
                      type="text"
                      placeholder="Search name..."
                      value={filters.customerName}
                      onChange={(e) => setFilters({...filters, customerName: e.target.value})}
                      className="w-full pl-9 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <FiMail /> Email Address
                  </label>
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input
                      type="text"
                      placeholder="Search email..."
                      value={filters.customerEmail}
                      onChange={(e) => setFilters({...filters, customerEmail: e.target.value})}
                      className="w-full pl-9 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <FiShoppingBag /> Initial Order
                  </label>
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input
                      type="text"
                      placeholder="#ORD-"
                      value={filters.initialOrderId}
                      onChange={(e) => setFilters({...filters, initialOrderId: e.target.value})}
                      className="w-full pl-9 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <FiMoreHorizontal /> Store
                  </label>
                  <select
                    value={filters.store}
                    onChange={(e) => setFilters({...filters, store: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 outline-none appearance-none transition-all shadow-sm"
                  >
                    <option value="all">Unspecified</option>
                  </select>
                </div>

                <div className="lg:col-span-4 flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-xs text-gray-400">Filtering through {payments.length} subscriptions</span>
                  <button onClick={handleResetFilters} className="text-sm font-semibold text-gray-500 hover:text-primary-600 flex items-center gap-1">
                    <FiX size={14} /> Reset
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
        <div className="p-1 px-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 relative">
          <div className="text-xs text-gray-400 font-medium font-mono mt-1">
            TOTAL_RESULTS: {filteredData.length}
          </div>

          <div className="flex items-center gap-2 order-1 sm:order-2 w-full sm:w-auto justify-end">
            {/* Page Size Select */}
            <div className="relative">
              <select className="appearance-none bg-white border border-gray-200 rounded px-3 pr-8 py-1.5 text-xs font-semibold text-gray-700 focus:outline-none hover:border-gray-300 transition-colors">
                <option>25 per page</option>
                <option>50 per page</option>
                <option>100 per page</option>
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                <FiChevronDown className="text-gray-400 text-xs" />
              </div>
            </div>

            {/* Settings Button */}
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded border transition-all ${showSettings ? 'bg-primary-50 border-primary-300 text-primary-600 shadow-sm' : 'bg-gray-200 border-gray-300 text-gray-700 hover:bg-gray-300'}`}
              >
                <FiSettings className={`text-lg ${showSettings ? 'animate-spin-slow' : ''}`} />
              </button>

              <AnimatePresence>
                {showSettings && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-full right-0 mb-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 z-50 pointer-events-auto"
                  >
                    <div className="space-y-4">
                      {/* Toggles */}
                      <div className="space-y-3">
                        {['Row lines', 'Column lines', 'Striped', 'Hover'].map(label => {
                          const key = label === 'Row lines' ? 'rowLines' : label === 'Column lines' ? 'columnLines' : label.toLowerCase();
                          return (
                            <div key={label} className="flex items-center justify-between group">
                              <span className="text-sm text-gray-700">{label}</span>
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

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2 border-t border-gray-50">
                        <button
                          onClick={() => setTableSettings({ rowLines: true, columnLines: false, striped: false, hover: true })}
                          className="flex-1 py-1.5 border border-gray-200 rounded text-xs font-semibold hover:bg-gray-50 transition-colors"
                        >
                          Reset Defaults
                        </button>
                      </div>

                      {/* Column Visibility */}
                      <div className="grid grid-cols-2 gap-x-4 gap-y-3 pt-3 border-t border-gray-50">
                        {Object.entries(visibleColumns).map(([key, isVisible]) => (
                          <label key={key} className="flex items-center gap-2 cursor-pointer group">
                            <div
                              onClick={() => setVisibleColumns(v => ({ ...v, [key]: !v[key] }))}
                              className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${isVisible ? 'bg-primary-600 border-primary-600' : 'bg-white border-gray-300'}`}
                            >
                              {isVisible && <FiCheck className="text-white text-[10px]" />}
                            </div>
                            <span className={`text-xs capitalize transition-colors ${isVisible ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-600'}`}>
                              {key.replace(/([A-Z])/g, ' $1').trim()}
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

export default RecurringPayments;
