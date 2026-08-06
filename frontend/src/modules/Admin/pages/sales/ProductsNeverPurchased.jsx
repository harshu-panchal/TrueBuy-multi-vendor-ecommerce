import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSearch, 
  FiSlash, 
  FiBox, 
  FiRefreshCw, 
  FiDownload,
  FiPackage,
  FiHome,
  FiCheckCircle,
  FiXCircle
} from 'react-icons/fi';
import DataTable from '../../components/DataTable';
import Badge from '../../../../shared/components/Badge';
import { formatCurrency, formatDateTime } from '../../utils/adminHelpers';
import { getNeverPurchased } from '../../services/adminService';
import toast from 'react-hot-toast';

const ProductsNeverPurchased = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
      const response = await getNeverPurchased({
        search: searchQuery,
        startDate: filters.startDate,
        endDate: filters.endDate,
        limit: 200,
      });

      const fetchedProducts = response.data?.products || [];
      setProducts(fetchedProducts);
    } catch (error) {
      console.error("Failed to fetch never purchased products:", error);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Export CSV
  const handleExportCSV = () => {
    const exportData = products.map(p => ({
      'Product Name': p.name,
      'SKU': p.sku,
      'Price': p.price,
      'Stock Quantity': p.stock,
      'Total Sold': '0 Items',
      'Created Date': formatDateTime(p.created),
      'Vendor Store': p.vendorName,
    }));

    if (exportData.length === 0) {
      toast.error('No products never purchased records to export');
      return;
    }

    const headers = Object.keys(exportData[0]).join(',');
    const rows = exportData.map(row => Object.values(row).map(v => `"${v}"`).join(','));
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Products_Never_Purchased_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Desktop Table Columns
  const columns = [
    { 
      key: 'image', 
      label: 'Image', 
      sortable: false,
      render: (v, row) => (
        <div className="w-10 h-10 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center p-0.5 grayscale hover:grayscale-0 transition-all">
          {v ? (
            <img src={v} alt={row.name} className="w-full h-full object-cover rounded" />
          ) : (
            <FiPackage className="text-gray-400" />
          )}
        </div>
      )
    },
    { 
      key: 'name', 
      label: 'Product Name', 
      sortable: true,
      render: (v, row) => (
        <div className="flex flex-col max-w-[220px]">
          <span className="font-bold text-xs text-gray-900 truncate">{v}</span>
          <span className="text-[11px] text-gray-500 font-mono">SKU: {row.sku || 'N/A'}</span>
        </div>
      )
    },
    { 
      key: 'price', 
      label: 'Price', 
      sortable: true,
      render: (v) => <span className="font-semibold text-xs text-gray-800 whitespace-nowrap">{formatCurrency(v || 0)}</span> 
    },
    { 
      key: 'stock', 
      label: 'Stock Qty', 
      sortable: true,
      render: (v) => (
        <span className={`text-xs font-bold ${v <= 5 ? 'text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200' : 'text-gray-700'}`}>
          {v} in stock
        </span>
      )
    },
    { 
      key: 'totalQty', 
      label: 'Total Sold', 
      sortable: false,
      render: () => (
        <span className="inline-flex items-center gap-1 text-xs font-extrabold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200">
          <FiSlash size={12} className="text-gray-400" /> 0 Items Sold
        </span>
      )
    },
    { 
      key: 'created', 
      label: 'Created On', 
      sortable: true,
      render: (v) => <span className="text-xs text-gray-600 whitespace-nowrap">{formatDateTime(v)}</span> 
    },
    { 
      key: 'published', 
      label: 'Status', 
      sortable: true,
      render: (v) => v ? (
        <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
          <FiCheckCircle size={12} /> Active
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200">
          <FiXCircle size={12} /> Draft
        </span>
      )
    },
  ];

  // Mobile Responsive Card Renderer
  const renderMobileCard = (row) => {
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 space-y-3">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-gray-100 pb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-12 h-12 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center p-0.5 flex-shrink-0 grayscale">
              {row.image ? (
                <img src={row.image} alt={row.name} className="w-full h-full object-cover rounded" />
              ) : (
                <FiPackage className="text-gray-400" />
              )}
            </div>
            <div>
              <p className="font-bold text-xs text-gray-900 line-clamp-1">{row.name}</p>
              <p className="text-[11px] text-gray-500 font-mono">SKU: {row.sku || 'N/A'}</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
            0 Sold
          </span>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-2.5 rounded-lg border border-gray-100">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Unit Price</p>
            <p className="font-extrabold text-gray-900 text-sm">{formatCurrency(row.price || 0)}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Stock Available</p>
            <p className={`font-bold ${row.stock <= 5 ? 'text-red-600' : 'text-gray-700'}`}>{row.stock} in stock</p>
          </div>
          <div className="col-span-2 pt-1 border-t border-gray-200/60 flex justify-between items-center">
            <span className="text-[10px] font-bold text-gray-400 uppercase">Listing Date</span>
            <span className="font-semibold text-gray-700">{formatDateTime(row.created)}</span>
          </div>
        </div>
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
            <span>Products Never Purchased</span>
            <FiSlash className="text-gray-400 text-xl" />
          </h1>
          <p className="text-sm text-gray-500">
            Audit dead stock and stagnant catalog items that have generated zero completed sales
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="p-2.5 text-gray-600 hover:text-gray-900 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 shadow-sm transition-colors"
            title="Refresh Unsold Products"
          >
            <FiRefreshCw className={isLoading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-gray-800 hover:bg-gray-900 text-white rounded-xl font-medium text-sm transition-colors flex items-center gap-2 shadow-sm"
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
              placeholder="Search product name or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
          </div>

          {/* Start Date */}
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
          />

          {/* End Date */}
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
        </div>
      </div>

      {/* Main DataTable */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <DataTable
          data={products}
          columns={columns}
          pagination={true}
          itemsPerPage={15}
          isLoading={isLoading}
          renderMobileCard={renderMobileCard}
        />
      </div>
    </motion.div>
  );
};

export default ProductsNeverPurchased;
