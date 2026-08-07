import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiRefreshCw, FiSearch, FiDownload, FiMapPin, FiClock, FiUser, FiActivity } from 'react-icons/fi';
import DataTable from '../../components/DataTable';
import Badge from '../../../../shared/components/Badge';
import { getOnlineCustomers } from '../../services/adminService';
import { formatDateTime } from '../../utils/adminHelpers';
import toast from 'react-hot-toast';

const OnlineCustomers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [onlineData, setOnlineData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOnlineCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getOnlineCustomers({ search: searchQuery });
      if (response && response.success) {
        const data = (response.data || []).map(item => ({
          ...item,
          formattedLastActivity: formatDateTime(item?.lastActivity),
          formattedCreatedOn: formatDateTime(item?.createdOn)
        }));
        setOnlineData(data);
      }
    } catch (error) {
      console.error('Error fetching online customers:', error);
      toast.error('Failed to fetch online customers');
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchOnlineCustomers();
    // Auto-refresh every 30 seconds for live feel
    const interval = setInterval(fetchOnlineCustomers, 30000);
    return () => clearInterval(interval);
  }, [fetchOnlineCustomers]);

  // Export CSV
  const handleExportCSV = () => {
    if (onlineData.length === 0) {
      toast.error('No online customer records to export');
      return;
    }

    const exportData = onlineData.map(c => ({
      'Customer ID': c.id,
      'Customer Name': c.customerInfo,
      'Customer Email': c.customerNumber,
      'Phone': c.phone || 'N/A',
      'Location': c.location,
      'IP Address': c.ipAddress,
      'Last Activity': c.formattedLastActivity,
      'Registration Date': c.formattedCreatedOn,
      'Last Visited Route': c.lastVisitedPage,
    }));

    const headers = Object.keys(exportData[0]).join(',');
    const rows = exportData.map(row => Object.values(row).map(v => `"${v}"`).join(','));
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Online_Customers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Mobile Table Card Renderer
  const renderMobileCard = (row) => {
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 space-y-3">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-gray-100 pb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-sm relative">
              {row.customerInfo.charAt(0).toUpperCase()}
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
            </div>
            <div>
              <p className="font-bold text-xs text-gray-900">{row.customerInfo}</p>
              <p className="text-[11px] text-gray-500">{row.customerNumber}</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
            <FiCheck size={12} /> Active Now
          </span>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-2.5 rounded-lg border border-gray-100">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Location</p>
            <p className="font-bold text-gray-800 flex items-center gap-1 mt-0.5">
              <FiMapPin className="text-gray-400 text-xs" />
              {row.location}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Last Activity</p>
            <p className="font-semibold text-gray-700 mt-0.5">{row.formattedLastActivity}</p>
          </div>
          <div className="col-span-2 pt-1 border-t border-gray-200/60 flex justify-between items-center">
            <span className="text-[10px] font-bold text-gray-400 uppercase">Current Page</span>
            <span className="font-mono text-xs text-primary-600 bg-primary-50 px-2 py-0.5 rounded border border-primary-100">{row.lastVisitedPage}</span>
          </div>
        </div>
      </div>
    );
  };

  // Desktop Columns
  const columns = [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      render: (v) => <span className="font-mono text-xs text-gray-400">#{String(v).slice(-6).toUpperCase()}</span>
    },
    {
      key: 'customerInfo',
      label: 'Customer Info',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-xs relative">
            {value.charAt(0).toUpperCase()}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-white"></span>
          </div>
          <div>
            <p className="font-bold text-xs text-gray-900">{value}</p>
            <p className="text-[11px] text-gray-500">{row.customerNumber}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'active',
      label: 'Status',
      sortable: false,
      render: (value) => value ? (
        <span className="inline-flex items-center gap-1 text-xs font-extrabold text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
          <FiCheck size={12} /> Active Now
        </span>
      ) : (
        <span className="text-gray-400 text-xs">—</span>
      ),
    },
    {
      key: 'location',
      label: 'Location',
      sortable: true,
      render: (value) => (
        <span className="flex items-center gap-1 text-xs font-medium text-gray-700">
          <FiMapPin className="text-gray-400 text-xs" />
          {value || 'N/A'}
        </span>
      ),
    },
    {
      key: 'lastActivity',
      label: 'Last Activity',
      sortable: true,
      render: (_, row) => <span className="text-xs text-gray-600 whitespace-nowrap">{row.formattedLastActivity}</span>,
    },
    {
      key: 'createdOn',
      label: 'Registered On',
      sortable: true,
      render: (_, row) => <span className="text-xs text-gray-500 whitespace-nowrap">{row.formattedCreatedOn}</span>,
    },
    {
      key: 'lastVisitedPage',
      label: 'Current Route',
      sortable: false,
      render: (value) => (
        <span className="font-mono text-xs text-primary-600 bg-primary-50 px-2 py-0.5 rounded border border-primary-100">
          {value || '/'}
        </span>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 flex items-center gap-2">
            <span>Online Customers</span>
            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
          </h1>
          <p className="text-sm text-gray-500">
            Real-time traffic monitoring of active buyer sessions currently browsing the platform
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchOnlineCustomers}
            className="p-2.5 text-gray-600 hover:text-green-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 shadow-sm transition-colors flex items-center gap-1.5 text-sm font-semibold"
            title="Refresh Live Sessions"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Refresh Live Data</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium text-sm transition-colors flex items-center gap-2 shadow-sm"
          >
            <FiDownload />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="relative w-full max-w-md">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search active shopper name, email, or location..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
          />
        </div>
      </div>

      {/* Main DataTable */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <DataTable
          data={onlineData}
          columns={columns}
          pagination={true}
          itemsPerPage={15}
          isLoading={loading}
          renderMobileCard={renderMobileCard}
        />
      </div>
    </motion.div>
  );
};

export default OnlineCustomers;
