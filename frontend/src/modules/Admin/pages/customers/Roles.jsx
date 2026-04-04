import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiCheck, FiMoreHorizontal, FiSearch, FiSettings, FiChevronDown } from 'react-icons/fi';
import DataTable from '../../components/DataTable';
import Pagination from '../../components/Pagination';
import RoleForm from './RoleForm';

const Roles = () => {
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Roles data will be fetched from the backend
  const [rolesData, setRolesData] = useState([]);

  const [showSettings, setShowSettings] = useState(false);
  const [tableSettings, setTableSettings] = useState({
    rowLines: true,
    columnLines: false,
    striped: false,
    hover: true,
    pager: 'Bottom'
  });
  const [visibleColumns, setVisibleColumns] = useState({
    id: false,
    name: true,
    systemName: true,
    active: true,
    taxExempt: true,
    freeShipping: true,
    isSystemRole: true,
    minOrderTotal: true,
    maxOrderTotal: false
  });

  const handleSave = (newRole) => {
    // Logic to save role to backend will go here
    console.log('Saving role:', newRole);
    setIsAdding(false);
  };

  if (isAdding) {
    return (
      <RoleForm
        onBack={() => setIsAdding(false)}
        onSave={handleSave}
      />
    );
  }

  const columns = [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      hidden: !visibleColumns.id,
      render: (value) => <span className="text-gray-500 font-mono text-xs">{value || '—'}</span>
    },
    {
      key: 'title',
      label: 'Name',
      sortable: true,
      hidden: !visibleColumns.name,
      render: (value) => (
        <button className="text-primary-600 hover:text-primary-700 font-medium transition-colors">
          {value}
        </button>
      ),
    },
    {
      key: 'systemName',
      label: 'System Name',
      sortable: true,
      hidden: !visibleColumns.systemName,
      render: (value) => <span className="text-gray-600">{value}</span>,
    },
    {
      key: 'active',
      label: 'Active',
      sortable: false,
      hidden: !visibleColumns.active,
      render: (value) => value ? <FiCheck className="text-green-600 text-lg mx-auto" /> : <span className="text-gray-300">—</span>,
    },
    {
      key: 'taxExempt',
      label: 'Tax Exempt',
      sortable: false,
      hidden: !visibleColumns.taxExempt,
      render: (value) => value ? <FiCheck className="text-green-600 text-lg mx-auto" /> : <span className="text-gray-300">—</span>,
    },
    {
      key: 'freeShipping',
      label: 'Free Shipping',
      sortable: false,
      hidden: !visibleColumns.freeShipping,
      render: (value) => value ? <FiCheck className="text-green-600 text-lg mx-auto" /> : <span className="text-gray-300">—</span>,
    },
    {
      key: 'isSystemRole',
      label: 'Is System Role',
      sortable: false,
      hidden: !visibleColumns.isSystemRole,
      render: (value) => value ? <FiCheck className="text-green-600 text-lg mx-auto" /> : <span className="text-gray-300">—</span>,
    },
    {
      key: 'minOrderTotal',
      label: 'Min Order Total',
      sortable: true,
      hidden: !visibleColumns.minOrderTotal,
      render: (value) => <span className="text-gray-600">{value || '0.00'}</span>,
    },
    {
      key: 'maxOrderTotal',
      label: 'Max Order Total',
      sortable: true,
      hidden: !visibleColumns.maxOrderTotal,
      render: (value) => <span className="text-gray-600">{value || '—'}</span>,
    },
    {
      key: 'actions',
      label: '',
      sortable: false,
      render: () => (
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600">
          <FiMoreHorizontal />
        </button>
      ),
    },
  ];

  // Filter columns based on hidden attribute
  const filteredColumns = columns.filter(col => !col.hidden);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header Info (Mobile Only as per layout) */}
      <div className="lg:hidden">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Customer roles</h1>
        <p className="text-sm sm:text-base text-gray-600">Manage customer access levels and permissions</p>
      </div>

      {/* Action Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 relative mb-20">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg transition-colors text-sm font-medium"
          >
            <FiPlus className="text-gray-400" />
            <span>Add new...</span>
          </button>

          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search roles..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            />
          </div>
        </div>

        {/* Table Section */}
        <div className="p-0 overflow-x-auto min-h-[300px]">
          <DataTable
            data={rolesData}
            columns={filteredColumns}
            pagination={false}
            rowLines={tableSettings.rowLines}
            columnLines={tableSettings.columnLines}
            className={`${tableSettings.striped ? '[&_tbody_tr:nth-child(even)]:bg-gray-50/50' : ''} ${!tableSettings.hover ? '[&_tbody_tr]:hover:bg-transparent' : ''}`}
          />
        </div>

        {/* Footer info/pagination with Settings */}
        <div className="p-1 px-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 relative">
          <div className="text-xs text-gray-400 font-medium order-2 sm:order-1">
            Displaying items 0-0 of 0
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
                          onClick={() => setTableSettings({ rowLines: true, columnLines: false, striped: false, hover: true, pager: 'Bottom' })}
                          className="flex-1 py-1.5 border border-gray-200 rounded text-xs font-semibold hover:bg-gray-50 transition-colors"
                        >
                          Reset
                        </button>
                        <button className="flex-1 py-1.5 border border-gray-200 rounded text-xs font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-1">
                          <span className="font-mono text-[10px] tracking-tight">|↔|</span> Fit columns
                        </button>
                      </div>

                      {/* Column Visiblity */}
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

export default Roles;
