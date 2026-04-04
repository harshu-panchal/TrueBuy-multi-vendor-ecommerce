import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUsers, FiTrendingUp, FiSearch, FiSettings, FiCheck, FiChevronDown, FiRefreshCw } from 'react-icons/fi';
import DataTable from '../../components/DataTable';

const CustomerReports = () => {
  const [activeTab, setActiveTab] = useState('top-customers');
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tableSettings, setTableSettings] = useState({
    rowLines: true,
    columnLines: false,
    striped: false,
    hover: true,
  });

  const [visibleColumnsTop, setVisibleColumnsTop] = useState({
    id: true,
    email: true,
    username: true,
    name: true,
    active: true,
    lastActivity: true,
    ordersCount: true,
    orderTotal: true,
  });

  const [visibleColumnsRegistered, setVisibleColumnsRegistered] = useState({
    period: true,
    count: true,
  });

  const topCustomersColumns = [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      hidden: !visibleColumnsTop.id,
      render: (value) => <span className="text-gray-500 font-mono text-xs">{value || '—'}</span>
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      hidden: !visibleColumnsTop.email,
      render: (value) => <span className="text-primary-600 font-medium">{value}</span>
    },
    {
      key: 'username',
      label: 'Username',
      sortable: true,
      hidden: !visibleColumnsTop.username,
      render: (value) => <span className="text-gray-600">{value}</span>
    },
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      hidden: !visibleColumnsTop.name,
      render: (value) => <span className="text-gray-800 font-medium">{value}</span>
    },
    {
      key: 'active',
      label: 'Active',
      sortable: false,
      hidden: !visibleColumnsTop.active,
      render: (value) => value ? <FiCheck className="text-green-600 text-lg mx-auto" /> : <span className="text-gray-300">—</span>,
    },
    {
      key: 'lastActivity',
      label: 'Last Activity',
      sortable: true,
      hidden: !visibleColumnsTop.lastActivity,
      render: (value) => <span className="text-gray-500 text-sm">{value}</span>
    },
    {
      key: 'ordersCount',
      label: 'Number of Orders',
      sortable: true,
      hidden: !visibleColumnsTop.ordersCount,
      render: (value) => <span className="font-semibold text-gray-700">{value}</span>
    },
    {
      key: 'orderTotal',
      label: 'Order Total',
      sortable: true,
      hidden: !visibleColumnsTop.orderTotal,
      render: (value) => <span className="text-green-600 font-bold">${parseFloat(value || 0).toFixed(2)}</span>
    }
  ];

  const registeredCustomersColumns = [
    {
      key: 'period',
      label: 'Period',
      sortable: false,
      hidden: !visibleColumnsRegistered.period,
      render: (value) => <span className="text-gray-700 font-medium">{value}</span>
    },
    {
      key: 'count',
      label: 'Count',
      sortable: true,
      hidden: !visibleColumnsRegistered.count,
      render: (value) => (
        <div className="flex items-center gap-2">
          <span className="text-primary-600 font-bold text-lg">{value}</span>
          <div className="flex-1 h-1.5 w-24 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary-500 rounded-full" 
              style={{ width: `${Math.min((value / 100) * 100, 100)}%` }}
            />
          </div>
        </div>
      )
    }
  ];

  const registeredData = [
    { period: 'In the last 7 days', count: null },
    { period: 'In the last 14 days', count: null },
    { period: 'In the last month', count: null },
    { period: 'In the last year', count: null }
  ];

  const [topCustomersData] = useState([]);

  const tabs = [
    { id: 'top-customers', label: 'Top Customers', icon: FiTrendingUp },
    { id: 'registered-customers', label: 'Registered Customers', icon: FiUsers }
  ];

  const filteredColumns = activeTab === 'top-customers' 
    ? topCustomersColumns.filter(col => !col.hidden)
    : registeredCustomersColumns.filter(col => !col.hidden);

  const activeVisibleColumns = activeTab === 'top-customers' ? visibleColumnsTop : visibleColumnsRegistered;
  const setActiveVisibleColumns = activeTab === 'top-customers' ? setVisibleColumnsTop : setVisibleColumnsRegistered;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header Info (Mobile Only) */}
      <div className="lg:hidden">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Customer reports</h1>
        <p className="text-sm sm:text-base text-gray-600">Analyze customer behavior and registration trends</p>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 relative mb-20">
        {/* Tabs and Action Bar Area */}
        <div className="border-b border-gray-100">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-all whitespace-nowrap text-sm font-medium ${
                    activeTab === tab.id
                      ? 'border-primary-600 text-primary-600 bg-primary-50/30'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`text-lg ${activeTab === tab.id ? 'text-primary-600' : 'text-gray-400'}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="p-4 bg-gray-50/50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <button 
                className="p-2 text-gray-500 hover:bg-white hover:shadow-sm rounded-lg transition-all border border-gray-200"
                title="Refresh Report"
              >
                <FiRefreshCw className="text-sm" />
              </button>
              <h3 className="text-sm font-semibold text-gray-700 ml-2">
                {tabs.find(t => t.id === activeTab)?.label}
              </h3>
            </div>

            {activeTab === 'top-customers' && (
              <div className="relative flex-1 max-w-md">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search top customers..."
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm shadow-sm transition-all"
                />
              </div>
            )}
          </div>
        </div>

        {/* Table Section */}
        <div className="p-0 overflow-x-auto min-h-[300px]">
          <DataTable
            data={activeTab === 'top-customers' ? topCustomersData : registeredData}
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
            {activeTab === 'top-customers' ? 'Showing top spending customers' : 'Customer registration breakdown'}
          </div>

          <div className="flex items-center gap-2 order-1 sm:order-2 w-full sm:w-auto justify-end">
            {activeTab === 'top-customers' && (
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
            )}

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
                        {Object.entries(activeVisibleColumns).map(([key, isVisible]) => (
                          <label key={key} className="flex items-center gap-2 cursor-pointer group">
                            <div
                              onClick={() => setActiveVisibleColumns(v => ({ ...v, [key]: !v[key] }))}
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

export default CustomerReports;
