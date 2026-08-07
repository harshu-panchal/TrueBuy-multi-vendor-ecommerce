import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiTrash2, 
  FiFilter, 
  FiSearch, 
  FiX, 
  FiCheck, 
  FiRefreshCw,
  FiActivity,
  FiUser,
  FiCalendar,
  FiDownload,
  FiCpu
} from 'react-icons/fi';
import DataTable from '../../components/DataTable';
import Badge from '../../../../shared/components/Badge';
import { getAllActivityLogs, deleteActivityLogs } from '../../services/adminService';
import { formatDateTime } from '../../utils/adminHelpers';
import toast from 'react-hot-toast';

const ActivityLog = () => {
  // Selection & UI State
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showFilter, setShowFilter] = useState(false);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter State
  const [filters, setFilters] = useState({
    createdFrom: '',
    createdTo: '',
    activityType: '',
    customerEmail: '',
    isSystemAccount: 'all'
  });

  // Fetch Live Activity Logs
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAllActivityLogs({
        search: searchQuery,
        createdFrom: filters.createdFrom,
        createdTo: filters.createdTo,
        activityType: filters.activityType,
        customerEmail: filters.customerEmail,
        isSystemAccount: filters.isSystemAccount,
        limit: 100,
      });

      if (response && response.success) {
        const fetchedLogs = (response.data?.logs || []).map(l => ({
          ...l,
          formattedCreatedOn: formatDateTime(l.createdOn),
        }));
        setLogs(fetchedLogs);
      }
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      toast.error('Failed to fetch activity logs');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filters]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Selection Handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(new Set(logs.map(log => log.id)));
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

  // Delete Selected Logs
  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedIds.size} selected activity logs?`)) {
      try {
        await deleteActivityLogs({ ids: Array.from(selectedIds) });
        toast.success(`${selectedIds.size} logs deleted successfully`);
        setSelectedIds(new Set());
        fetchLogs();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Clear All Logs
  const handleDeleteAll = async () => {
    if (window.confirm('Are you sure you want to delete ALL activity logs? This action cannot be undone.')) {
      try {
        await deleteActivityLogs({ clearAll: true });
        toast.success('All activity logs cleared');
        setSelectedIds(new Set());
        fetchLogs();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (logs.length === 0) {
      toast.error('No activity logs to export');
      return;
    }

    const exportData = logs.map(l => ({
      'Log ID': l.logId,
      'Activity Type': l.type,
      'Customer Info': l.customer,
      'Message': l.message,
      'IP Address': l.ipAddress,
      'System Account': l.isSystemAccount ? 'Yes' : 'No',
      'Date': l.formattedCreatedOn,
    }));

    const headers = Object.keys(exportData[0]).join(',');
    const rows = exportData.map(row => Object.values(row).map(v => `"${v}"`).join(','));
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Activity_Logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Mobile Card View Renderer
  const renderMobileCard = (row) => {
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 space-y-3">
        <div className="flex justify-between items-start border-b border-gray-100 pb-2.5">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedIds.has(row.id)}
              onChange={() => handleSelectRow(row.id)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 w-4 h-4"
            />
            <span className="font-extrabold text-xs text-gray-900 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
              {row.type}
            </span>
          </div>
          {row.isSystemAccount ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              <FiCpu size={10} /> System
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              <FiUser size={10} /> User
            </span>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-xs font-semibold text-gray-800">{row.message}</p>
          <p className="text-[11px] text-gray-500 font-mono">{row.customer}</p>
        </div>

        <div className="pt-2 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
          <span className="font-mono text-[10px] text-gray-400">IP: {row.ipAddress}</span>
          <span className="font-medium text-gray-600">{row.formattedCreatedOn}</span>
        </div>
      </div>
    );
  };

  // Desktop Table Columns
  const columns = [
    {
      key: 'select',
      label: (
        <input
          type="checkbox"
          checked={logs.length > 0 && selectedIds.size === logs.length}
          onChange={handleSelectAll}
          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
      ),
      sortable: false,
      render: (_, row) => (
        <input
          type="checkbox"
          checked={selectedIds.has(row.id)}
          onChange={() => handleSelectRow(row.id)}
          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
      ),
    },
    {
      key: 'type',
      label: 'Activity Type',
      sortable: true,
      render: (v) => (
        <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-800 bg-gray-100 px-2.5 py-1 rounded-lg border border-gray-200">
          <FiActivity size={12} className="text-primary-500" /> {v}
        </span>
      ),
    },
    {
      key: 'customer',
      label: 'Customer / User',
      sortable: true,
      render: (v) => <span className="font-semibold text-xs text-gray-900">{v}</span>,
    },
    {
      key: 'message',
      label: 'Message',
      sortable: false,
      render: (v) => <span className="text-xs text-gray-700 max-w-xs truncate block">{v}</span>,
    },
    {
      key: 'isSystemAccount',
      label: 'System Event',
      sortable: true,
      render: (v) => v ? (
        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
          <FiCpu size={12} /> Yes
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
          <FiUser size={12} /> No
        </span>
      ),
    },
    {
      key: 'createdOn',
      label: 'Timestamp',
      sortable: true,
      render: (_, row) => <span className="text-xs text-gray-600 whitespace-nowrap">{row.formattedCreatedOn}</span>,
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
            <span>Activity Log</span>
            <FiActivity className="text-primary-600" />
          </h1>
          <p className="text-sm text-gray-500">
            Security audit trail of user events, system actions, and platform notifications
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={fetchLogs}
            className="p-2.5 text-gray-600 hover:text-gray-900 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 shadow-sm transition-colors"
            title="Refresh Logs"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} />
          </button>
          
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 bg-gray-800 hover:bg-gray-900 text-white rounded-xl font-medium text-xs transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <FiDownload size={14} />
            <span>Export CSV</span>
          </button>

          {selectedIds.size > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="px-3.5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium text-xs transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <FiTrash2 size={14} />
              <span>Delete ({selectedIds.size})</span>
            </button>
          )}

          <button
            onClick={handleDeleteAll}
            className="px-3.5 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <FiTrash2 size={14} />
            <span>Clear All</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Query */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search keyword, email, type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Activity Type Filter */}
          <input
            type="text"
            placeholder="Activity Type (e.g. Login, Order)..."
            value={filters.activityType}
            onChange={(e) => setFilters({ ...filters, activityType: e.target.value })}
            className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />

          {/* Date From */}
          <input
            type="date"
            value={filters.createdFrom}
            onChange={(e) => setFilters({ ...filters, createdFrom: e.target.value })}
            className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />

          {/* Date To */}
          <input
            type="date"
            value={filters.createdTo}
            onChange={(e) => setFilters({ ...filters, createdTo: e.target.value })}
            className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Main DataTable */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <DataTable
          data={logs}
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

export default ActivityLog;
