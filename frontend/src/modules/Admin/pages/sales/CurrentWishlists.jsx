import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSearch,
  FiChevronRight, 
  FiHeart, 
  FiRefreshCw, 
  FiDownload,
  FiPackage,
  FiHome
} from 'react-icons/fi';
import DataTable from '../../components/DataTable';
import Badge from '../../../../shared/components/Badge';
import { formatCurrency, formatDateTime } from '../../utils/adminHelpers';
import { getAllWishlists } from '../../services/adminService';
import toast from 'react-hot-toast';

const CurrentWishlists = () => {
  const [wishlists, setWishlists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
  });

  // Fetch Data from Backend API
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getAllWishlists({
        search: searchQuery,
        startDate: filters.startDate,
        endDate: filters.endDate,
        limit: 200,
      });

      const fetchedWishlists = response.data?.wishlists || [];
      setWishlists(fetchedWishlists);
    } catch (error) {
      console.error("Failed to fetch wishlists:", error);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Expansion Logic
  const toggleExpand = (id) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) newExpanded.delete(id);
    else newExpanded.add(id);
    setExpandedRows(newExpanded);
  };

  // Filter Computation
  const filteredData = useMemo(() => {
    return wishlists.filter(item => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchCustomer = (item.customer || '').toLowerCase().includes(q);
        const matchEmail = (item.email || '').toLowerCase().includes(q);
        const matchItems = (item.items || []).some(it => (it.name || '').toLowerCase().includes(q));

        if (!matchCustomer && !matchEmail && !matchItems) return false;
      }
      return true;
    });
  }, [wishlists, searchQuery]);

  // Export CSV
  const handleExportCSV = () => {
    const exportData = filteredData.map(w => ({
      'Wishlist ID': w.wishlistId || w.id,
      'Customer Name': w.customer,
      'Customer Email': w.email,
      'Total Items Count': w.totalItems,
      'Total Wishlist Value': w.totalValue,
      'Last Activity Date': formatDateTime(w.date),
    }));

    if (exportData.length === 0) {
      toast.error('No wishlist records to export');
      return;
    }

    const headers = Object.keys(exportData[0]).join(',');
    const rows = exportData.map(row => Object.values(row).map(v => `"${v}"`).join(','));
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Active_Wishlists_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Nested Expanded Wishlist Items Drawer Component
  const renderNestedItems = (row) => {
    return (
      <div className="bg-gray-50/80 p-4 border-y border-gray-100 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
            <FiHeart className="text-red-500 fill-red-500" />
            <span>Items Breakdown in {row.customer}'s Wishlist ({row.totalItems} items)</span>
          </p>
          <span className="text-xs font-extrabold text-gray-900 bg-white px-2.5 py-1 rounded-lg border border-gray-200 shadow-sm">
            Total Value: {formatCurrency(row.totalValue || 0)}
          </span>
        </div>

        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-100 border-b border-gray-200 text-[11px] font-bold text-gray-600 uppercase">
              <tr>
                <th className="p-3">Product</th>
                <th className="p-3 text-center">Active</th>
                <th className="p-3 text-center">Quantity</th>
                <th className="p-3 text-right">Unit Price</th>
                <th className="p-3 text-right">Total</th>
                <th className="p-3 text-left">Store</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(row.items || []).map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-3 flex items-center gap-2.5">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-8 h-8 object-cover rounded-lg border border-gray-200" />
                    ) : (
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                        <FiPackage />
                      </div>
                    )}
                    <span className="font-bold text-gray-900 line-clamp-1">{item.name}</span>
                  </td>
                  <td className="p-3 text-center font-bold">
                    {item.isActive ? (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-700 text-xs">✓</span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-100 text-red-600 text-xs">✕</span>
                    )}
                  </td>
                  <td className="p-3 text-center font-extrabold text-gray-900">{item.quantity || 1}</td>
                  <td className="p-3 text-right font-semibold text-gray-700">{formatCurrency(item.price || 0)}</td>
                  <td className="p-3 text-right font-extrabold text-red-600">{formatCurrency(item.total || item.price)}</td>
                  <td className="p-3 text-left font-semibold text-gray-800">
                    <span className="flex items-center gap-1">
                      <FiHome className="text-gray-400 text-xs" />
                      {item.vendorName || 'TruBuy Store'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Desktop Table Columns
  const columns = [
    {
      key: 'expand',
      label: '',
      sortable: false,
      render: (_, row) => (
        <button 
          onClick={() => toggleExpand(row.id)}
          className={`p-1.5 rounded-lg transition-all ${expandedRows.has(row.id) ? 'bg-red-50 text-red-600 rotate-90' : 'text-gray-400 hover:bg-gray-100'}`}
          title="Expand Wishlist Items"
        >
          <FiChevronRight className="transition-transform duration-300" size={16} />
        </button>
      )
    },
    { 
      key: 'customer', 
      label: 'Customer', 
      sortable: true,
      render: (v, row) => (
        <div className="flex flex-col max-w-[180px]">
          <span className="font-bold text-xs text-gray-800 truncate">{v}</span>
          <span className="text-[11px] text-gray-500 truncate">{row.email}</span>
        </div>
      )
    },
    { 
      key: 'totalItems', 
      label: 'Total Items', 
      sortable: true,
      render: (v) => (
        <div className="flex items-center gap-1">
          <Badge variant="danger" size="sm">
            {v} {v === 1 ? 'Item' : 'Items'}
          </Badge>
        </div>
      )
    },
    { 
      key: 'totalValue', 
      label: 'Total Wishlist Value', 
      sortable: true,
      render: (v) => <span className="font-extrabold text-xs text-gray-900 whitespace-nowrap">{formatCurrency(v || 0)}</span> 
    },
    { 
      key: 'date', 
      label: 'Last Updated', 
      sortable: true,
      render: (v) => <span className="text-xs text-gray-600 whitespace-nowrap">{formatDateTime(v)}</span> 
    },
  ];

  // Mobile Responsive Card Renderer
  const renderMobileCard = (row) => {
    const isExpanded = expandedRows.has(row.id);
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 space-y-3">
        {/* Card Header */}
        <div className="flex justify-between items-start border-b border-gray-100 pb-2.5">
          <div>
            <p className="font-bold text-xs text-gray-900">{row.customer}</p>
            <p className="text-[11px] text-gray-500">{row.email}</p>
          </div>
          <Badge variant="danger" size="sm">
            {row.totalItems} Items
          </Badge>
        </div>

        {/* Wishlist Value & Date */}
        <div className="flex justify-between items-center text-xs bg-gray-50 p-2.5 rounded-lg border border-gray-100">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Total Wishlist Value</p>
            <p className="font-extrabold text-red-600 text-sm">{formatCurrency(row.totalValue || 0)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-gray-400 uppercase">Last Activity</p>
            <p className="font-semibold text-gray-700">{formatDateTime(row.date)}</p>
          </div>
        </div>

        {/* Expand Toggle Button */}
        <button
          onClick={() => toggleExpand(row.id)}
          className="w-full py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 flex items-center justify-center gap-1.5 transition-colors"
        >
          <span>{isExpanded ? 'Hide Wishlist Items' : 'View Wishlist Items Breakdown'}</span>
          <FiChevronRight className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
        </button>

        {/* Nested Items in Mobile */}
        {isExpanded && renderNestedItems(row)}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1.5 flex items-center gap-2">
            <span>Current Wishlists</span>
            <FiHeart className="text-red-500 text-xl" />
          </h1>
          <p className="text-sm text-gray-500">
            Real-time business intelligence into active customer product wishlists and saved items
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="p-2.5 text-gray-600 hover:text-red-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 shadow-sm transition-colors"
            title="Refresh Wishlists"
          >
            <FiRefreshCw className={isLoading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium text-sm transition-colors flex items-center gap-2 shadow-sm"
          >
            <FiDownload />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search customer, email, or product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Start Date */}
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />

          {/* End Date */}
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>

      {/* Main DataTable */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <DataTable
          data={filteredData}
          columns={columns}
          pagination={true}
          itemsPerPage={15}
          isLoading={isLoading}
          renderMobileCard={renderMobileCard}
          expandedRows={expandedRows}
          renderExpandedRow={renderNestedItems}
        />
      </div>
    </motion.div>
  );
};

export default CurrentWishlists;
