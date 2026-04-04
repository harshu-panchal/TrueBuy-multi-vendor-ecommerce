import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiTrash2, 
  FiFilter, 
  FiSearch, 
  FiX, 
  FiCheck, 
  FiSettings, 
  FiChevronDown,
  FiActivity,
  FiUser,
  FiCalendar,
  FiMail,
  FiCpu
} from 'react-icons/fi';
import DataTable from '../../components/DataTable';

const ActivityLog = () => {
  // Selection State
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showFilter, setShowFilter] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Filter State
  const [filters, setFilters] = useState({
    createdFrom: '',
    createdTo: '',
    activityType: '',
    customerEmail: '',
    isSystemAccount: 'all'
  });

  const [tableSettings, setTableSettings] = useState({
    rowLines: true,
    columnLines: false,
    striped: false,
    hover: true,
  });

  const [visibleColumns, setVisibleColumns] = useState({
    type: true,
    customer: true,
    createdOn: true,
    message: true,
    isSystemAccount: true,
  });

  // Mock Data (Empty for now)
  const initialData = [];

  const [logs, setLogs] = useState(initialData);

  // Filtering Logic
  const filteredData = useMemo(() => {
    return logs.filter(log => {
      const matchType = !filters.activityType || log.type.toLowerCase().includes(filters.activityType.toLowerCase());
      const matchEmail = !filters.customerEmail || log.customer.toLowerCase().includes(filters.customerEmail.toLowerCase());
      const matchSystem = filters.isSystemAccount === 'all' || 
                         (filters.isSystemAccount === 'yes' && log.isSystemAccount) || 
                         (filters.isSystemAccount === 'no' && !log.isSystemAccount);
      
      const logDate = new Date(log.createdOn);
      const matchFrom = !filters.createdFrom || logDate >= new Date(filters.createdFrom);
      const matchTo = !filters.createdTo || logDate <= new Date(filters.createdTo);

      return matchType && matchEmail && matchSystem && matchFrom && matchTo;
    });
  }, [logs, filters]);

  // Handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(new Set(filteredData.map(log => log.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedIds.size} selected logs?`)) {
      setLogs(logs.filter(log => !selectedIds.has(log.id)));
      setSelectedIds(new Set());
    }
  };

  const handleDeleteAll = () => {
    if (window.confirm('Are you sure you want to delete ALL activity logs? This cannot be undone.')) {
      setLogs([]);
      setSelectedIds(new Set());
    }
  };

  const handleResetFilters = () => {
    setFilters({
      createdFrom: '',
      createdTo: '',
      activityType: '',
      customerEmail: '',
      isSystemAccount: 'all'
    });
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
    {
      key: 'type',
      label: 'Activity Log Type',
      sortable: true,
      hidden: !visibleColumns.type,
      render: (value) => (
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 rounded text-blue-600">
            <FiActivity className="text-xs" />
          </div>
          <span className="font-medium text-gray-700">{value}</span>
        </div>
      )
    },
    {
      key: 'customer',
      label: 'Customer',
      sortable: true,
      hidden: !visibleColumns.customer,
      render: (value) => (
        <div className="flex items-center gap-2">
          <FiUser className="text-gray-400 text-xs" />
          <span className="text-gray-600 truncate max-w-[150px]">{value}</span>
        </div>
      )
    },
    {
      key: 'createdOn',
      label: 'Created On',
      sortable: true,
      hidden: !visibleColumns.createdOn,
      render: (value) => (
        <span className="text-gray-500 text-xs font-mono">{value}</span>
      )
    },
    {
      key: 'message',
      label: 'Message',
      sortable: false,
      hidden: !visibleColumns.message,
      render: (value) => (
        <span className="text-gray-600 text-sm whitespace-normal block max-w-[300px] leading-relaxed">
          {value}
        </span>
      )
    },
    {
      key: 'isSystemAccount',
      label: 'Is System Account',
      sortable: true,
      hidden: !visibleColumns.isSystemAccount,
      render: (value) => value ? <FiCheck className="text-green-600 text-lg mx-auto" /> : <span className="text-gray-300 mx-auto">—</span>,
    }
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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Activity Log</h1>
        <p className="text-sm sm:text-base text-gray-600">Monitor and manage system activities and user actions</p>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 relative mb-20">
        
        {/* Action Bar */}
        <div className="p-4 border-b border-gray-100 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDeleteAll}
              className="px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <FiTrash2 className="text-xs" />
              <span>Delete All</span>
            </button>
            <button
              onClick={handleDeleteSelected}
              disabled={selectedIds.size === 0}
              className={`px-4 py-2 border rounded-lg transition-all text-sm font-medium flex items-center gap-2 ${
                selectedIds.size > 0 
                  ? 'bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-100' 
                  : 'bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed'
              }`}
            >
              <FiTrash2 className="text-xs" />
              <span>Delete Selected ({selectedIds.size})</span>
            </button>
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
              {Object.values(filters).some(v => v !== '' && v !== 'all') && (
                <span className="w-2 h-2 bg-white rounded-full animate-pulse ml-1" />
              )}
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
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                    <FiCalendar className="text-gray-400" /> Created From
                  </label>
                  <input
                    type="date"
                    value={filters.createdFrom}
                    onChange={(e) => setFilters({...filters, createdFrom: e.target.value})}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                    <FiCalendar className="text-gray-400" /> Created To
                  </label>
                  <input
                    type="date"
                    value={filters.createdTo}
                    onChange={(e) => setFilters({...filters, createdTo: e.target.value})}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                    <FiActivity className="text-gray-400" /> Activity Type
                  </label>
                  <select
                    value={filters.activityType}
                    onChange={(e) => setFilters({...filters, activityType: e.target.value})}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none appearance-none"
                  >
                    <option value="">All Types</option>
                    <optgroup label="Add Actions">
                      <option>Add a new category</option>
                      <option>Add a new checkout attribute</option>
                      <option>Add a new customer</option>
                      <option>Add a new customer role</option>
                      <option>Add a new discount</option>
                      <option>Add a new gift card</option>
                      <option>Add a new manufacturer</option>
                      <option>Add a new product</option>
                      <option>Add a new product attribute</option>
                      <option>Add a new setting</option>
                      <option>Add a new specification attribute</option>
                      <option>Add a new widget</option>
                    </optgroup>
                    <optgroup label="Delete Actions">
                      <option>Delete a checkout attribute</option>
                      <option>Delete a customer</option>
                      <option>Delete a customer role</option>
                      <option>Delete a discount</option>
                      <option>Delete a gift card</option>
                      <option>Delete a manufacturer</option>
                      <option>Delete a product</option>
                      <option>Delete a product attribute</option>
                      <option>Delete a return request</option>
                      <option>Delete a setting</option>
                      <option>Delete a specification attribute</option>
                      <option>Delete a widget</option>
                      <option>Delete category</option>
                    </optgroup>
                    <optgroup label="Edit Actions">
                      <option>Edit a checkout attribute</option>
                      <option>Edit a customer</option>
                      <option>Edit a customer role</option>
                      <option>Edit a discount</option>
                      <option>Edit a gift card</option>
                      <option>Edit a manufacturer</option>
                      <option>Edit a product</option>
                      <option>Edit a product attribute</option>
                      <option>Edit a return request</option>
                      <option>Edit a specification attribute</option>
                      <option>Edit a widget</option>
                      <option>Edit an order</option>
                      <option>Edit category</option>
                      <option>Edit promotion providers</option>
                      <option>Edit setting(s)</option>
                      <option>Edit theme variables</option>
                    </optgroup>
                    <optgroup label="System Actions">
                      <option>Export theme variables</option>
                      <option>Import theme variables</option>
                    </optgroup>
                    <optgroup label="Public Store Actions">
                      <option>Public store. Add blog comment</option>
                      <option>Public store. Add news comment</option>
                      <option>Public store. Add product review</option>
                      <option>Public store. Add to compare list</option>
                      <option>Public store. Add to shopping cart</option>
                      <option>Public store. Add to wishlist</option>
                      <option>Public store. Login</option>
                    </optgroup>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                    <FiMail className="text-gray-400" /> Customer Email
                  </label>
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      placeholder="Search email..."
                      value={filters.customerEmail}
                      onChange={(e) => setFilters({...filters, customerEmail: e.target.value})}
                      className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                    <FiCpu className="text-gray-400" /> Customer System Account
                  </label>
                  <select
                    value={filters.isSystemAccount}
                    onChange={(e) => setFilters({...filters, isSystemAccount: e.target.value})}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none appearance-none"
                  >
                    <option value="all">Unspecified</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>

                <div className="xl:col-span-1 flex items-end gap-2">
                  <button
                    onClick={handleResetFilters}
                    className="flex-1 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <FiX /> Reset
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

        {/* Footer */}
        <div className="p-1 px-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 relative">
          <div className="text-xs text-gray-400 font-medium order-2 sm:order-1">
            Displaying {filteredData.length} logs
          </div>

          <div className="flex items-center gap-2 order-1 sm:order-2 w-full sm:w-auto justify-end">
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
                          Reset
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

export default ActivityLog;
