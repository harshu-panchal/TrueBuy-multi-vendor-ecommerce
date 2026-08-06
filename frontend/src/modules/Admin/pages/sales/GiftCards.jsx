import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlus, 
  FiFilter, 
  FiSearch, 
  FiX, 
  FiCheck, 
  FiTag, 
  FiUser, 
  FiMail, 
  FiDollarSign, 
  FiActivity, 
  FiTrash2,
  FiRefreshCw,
  FiDownload,
  FiPower,
  FiGift
} from 'react-icons/fi';
import DataTable from '../../components/DataTable';
import Badge from '../../../../shared/components/Badge';
import AnimatedSelect from '../../components/AnimatedSelect';
import { formatCurrency, formatDateTime } from '../../utils/adminHelpers';
import { getAllGiftCards, createGiftCard, updateGiftCardStatus, deleteGiftCard } from '../../services/adminService';
import toast from 'react-hot-toast';

const GiftCards = () => {
  const [giftCards, setGiftCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });

  // Form State for Add New Gift Card
  const [newGiftCard, setNewGiftCard] = useState({
    type: 'Virtual',
    initialValue: '',
    isActivated: true,
    couponCode: '',
    recipientName: '',
    recipientEmail: '',
    senderName: '',
    senderEmail: '',
    message: ''
  });

  // Filter State
  const [filters, setFilters] = useState({
    couponCode: '',
    status: 'all'
  });

  // Fetch Live Data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getAllGiftCards({
        status: filters.status === 'all' ? undefined : filters.status,
        search: filters.couponCode,
        limit: 200,
      });

      const fetchedCards = response.data?.giftCards || [];
      const normalizedData = fetchedCards.map((card, idx) => ({
        ...card,
        id: card._id || `GC-${idx + 1}`,
        couponCode: card.couponCode || `GC-${idx + 1}`,
        initialValue: card.initialValue || 0,
        remainingAmount: card.remainingAmount ?? card.initialValue ?? 0,
        isActivated: card.isActivated !== false,
        createdOn: card.createdAt || card.createdOn,
        senderName: card.senderName || 'System Admin',
        senderEmail: card.senderEmail || 'admin@truebuy.com',
        recipientName: card.recipientName || 'Customer',
        recipientEmail: card.recipientEmail || 'customer@example.com',
      }));

      setGiftCards(normalizedData);
    } catch (error) {
      console.error("Failed to fetch gift cards:", error);
    } finally {
      setIsLoading(false);
    }
  }, [filters.status, filters.couponCode]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Code Generator Helper
  const generateCode = () => {
    const p1 = Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase();
    const p2 = Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase();
    setNewGiftCard(prev => ({ ...prev, couponCode: `GC-${p1}-${p2}` }));
  };

  // Submit Handler for Add New Gift Card
  const handleCreateGiftCard = async (e) => {
    e.preventDefault();
    if (!newGiftCard.initialValue || Number(newGiftCard.initialValue) <= 0) {
      toast.error('Please enter a valid gift card initial value');
      return;
    }

    try {
      await createGiftCard({
        ...newGiftCard,
        initialValue: Number(newGiftCard.initialValue),
      });

      toast.success('Gift card created successfully!');
      setShowAddModal(false);
      setNewGiftCard({
        type: 'Virtual',
        initialValue: '',
        isActivated: true,
        couponCode: '',
        recipientName: '',
        recipientEmail: '',
        senderName: '',
        senderEmail: '',
        message: ''
      });
      fetchData();
    } catch (error) {
      console.error("Create gift card error:", error);
      toast.error(error.response?.data?.message || 'Failed to create gift card');
    }
  };

  // Toggle Activation Status
  const handleToggleActivation = async (id, currentStatus) => {
    try {
      await updateGiftCardStatus(id, !currentStatus);
      toast.success(`Gift card ${!currentStatus ? 'activated' : 'deactivated'}`);
      fetchData();
    } catch (error) {
      console.error("Toggle activation error:", error);
      toast.error('Failed to update activation status');
    }
  };

  // Confirm Delete Handler
  const handleConfirmDelete = async () => {
    if (!deleteModal.id) return;
    try {
      await deleteGiftCard(deleteModal.id);
      toast.success('Gift card deleted');
      setDeleteModal({ isOpen: false, id: null });
      fetchData();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error('Failed to delete gift card');
    }
  };

  // Filter Computation
  const filteredData = useMemo(() => {
    return giftCards.filter(item => {
      const matchCode = !filters.couponCode || item.couponCode.toLowerCase().includes(filters.couponCode.toLowerCase());
      const matchStatus = filters.status === 'all' || 
                         (filters.status === 'activated' && item.isActivated) || 
                         (filters.status === 'deactivated' && !item.isActivated);

      return matchCode && matchStatus;
    });
  }, [giftCards, filters]);

  // Selection Handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedIds(new Set(filteredData.map(g => g.id)));
    else setSelectedIds(new Set());
  };

  const handleSelectRow = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  // Export CSV
  const handleExportCSV = () => {
    const exportData = filteredData.map(g => ({
      'Gift Card Code': g.couponCode,
      'Type': g.type,
      'Initial Value': g.initialValue,
      'Remaining Balance': g.remainingAmount,
      'Status': g.isActivated ? 'Activated' : 'Deactivated',
      'Recipient Name': g.recipientName,
      'Recipient Email': g.recipientEmail,
      'Sender Name': g.senderName,
      'Created Date': formatDateTime(g.createdOn),
    }));

    if (exportData.length === 0) {
      toast.error('No gift cards to export');
      return;
    }

    const headers = Object.keys(exportData[0]).join(',');
    const rows = exportData.map(row => Object.values(row).map(v => `"${v}"`).join(','));
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Gift_Cards_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Desktop Table Columns
  const columns = [
    {
      key: 'checkbox',
      label: (
        <input 
          type="checkbox" 
          checked={selectedIds.size === filteredData.length && filteredData.length > 0} 
          onChange={handleSelectAll}
          className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
        />
      ),
      sortable: false,
      render: (_, row) => (
        <input 
          type="checkbox" 
          checked={selectedIds.has(row.id)} 
          onChange={() => handleSelectRow(row.id)}
          className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
        />
      )
    },
    { 
      key: 'couponCode', 
      label: 'Gift Card Code', 
      sortable: true, 
      render: (v) => <span className="font-mono text-xs font-black tracking-wider text-primary-600 bg-primary-50 px-2 py-0.5 rounded border border-primary-100 whitespace-nowrap">{v}</span> 
    },
    { 
      key: 'type', 
      label: 'Type', 
      sortable: true, 
      render: (v) => <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-[11px] font-bold uppercase whitespace-nowrap">{v || 'Virtual'}</span> 
    },
    { 
      key: 'initialValue', 
      label: 'Initial Value', 
      sortable: true, 
      render: (v) => <span className="font-extrabold text-xs text-gray-900 whitespace-nowrap">{formatCurrency(v || 0)}</span> 
    },
    { 
      key: 'remainingAmount', 
      label: 'Remaining Balance', 
      sortable: true, 
      render: (v) => <span className="font-extrabold text-xs text-green-700 whitespace-nowrap">{formatCurrency(v || 0)}</span> 
    },
    { 
      key: 'isActivated', 
      label: 'Activated', 
      sortable: true, 
      render: (v, row) => (
        <button
          onClick={() => handleToggleActivation(row._id || row.id, v)}
          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold transition-colors shadow-sm ${v ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}
        >
          <FiPower size={11} />
          <span>{v ? 'Active' : 'Deactivated'}</span>
        </button>
      )
    },
    { 
      key: 'recipient', 
      label: 'Recipient', 
      sortable: false, 
      render: (_, row) => (
        <div className="max-w-[140px]">
          <p className="font-bold text-xs text-gray-800 truncate">{row.recipientName || 'Customer'}</p>
          <p className="text-[11px] text-gray-500 truncate">{row.recipientEmail || 'N/A'}</p>
        </div>
      )
    },
    { key: 'createdOn', label: 'Issued Date', sortable: true, render: (v) => <span className="text-xs text-gray-600 whitespace-nowrap">{formatDateTime(v)}</span> },
    {
      key: 'action',
      label: 'Action',
      sortable: false,
      render: (_, row) => (
        <button 
          onClick={() => setDeleteModal({ isOpen: true, id: row._id || row.id })}
          className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors border border-red-200"
          title="Delete Gift Card"
        >
          <FiTrash2 size={14} />
        </button>
      )
    }
  ];

  // Mobile Responsive Card Renderer
  const renderMobileCard = (row) => {
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 space-y-3">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-gray-100 pb-2.5">
          <div>
            <span className="font-mono text-xs font-extrabold text-primary-600 bg-primary-50 px-2 py-0.5 rounded border border-primary-100">{row.couponCode}</span>
            <p className="text-[11px] text-gray-500 mt-1 uppercase font-bold">{row.type || 'Virtual'} Card</p>
          </div>
          <button
            onClick={() => handleToggleActivation(row._id || row.id, row.isActivated)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold shadow-sm ${row.isActivated ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
          >
            <FiPower size={12} />
            <span>{row.isActivated ? 'Active' : 'Deactivated'}</span>
          </button>
        </div>

        {/* Values Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-2.5 rounded-lg border border-gray-100">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Initial Value</p>
            <p className="font-extrabold text-gray-900">{formatCurrency(row.initialValue || 0)}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Remaining Balance</p>
            <p className="font-extrabold text-green-700">{formatCurrency(row.remainingAmount || 0)}</p>
          </div>
        </div>

        {/* Recipient & Dates */}
        <div className="flex justify-between items-center text-xs pt-1">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Recipient</p>
            <p className="font-bold text-gray-800">{row.recipientName || 'Customer'}</p>
            <p className="text-[11px] text-gray-500">{row.recipientEmail || 'N/A'}</p>
          </div>
          <button
            onClick={() => setDeleteModal({ isOpen: true, id: row._id || row.id })}
            className="p-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs"
          >
            <FiTrash2 size={14} />
          </button>
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1.5">
            Gift Cards & Stored Value Vouchers
          </h1>
          <p className="text-sm text-gray-500">
            Issue, activate, and manage digital and physical gift cards and balances
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="p-2.5 text-gray-600 hover:text-primary-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 shadow-sm transition-colors"
            title="Refresh Gift Cards"
          >
            <FiRefreshCw className={isLoading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl font-medium text-sm transition-colors flex items-center gap-2 shadow-sm"
          >
            <FiDownload />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium text-sm transition-colors flex items-center gap-2 shadow-sm"
          >
            <FiPlus />
            <span>Add Gift Card</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Code/Email Search */}
          <div className="relative col-span-1 sm:col-span-2">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search voucher code, recipient name, or email..."
              value={filters.couponCode}
              onChange={(e) => setFilters({ ...filters, couponCode: e.target.value })}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Status Filter */}
          <AnimatedSelect
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            options={[
              { value: "all", label: "All Activation Statuses" },
              { value: "activated", label: "Activated Gift Cards" },
              { value: "deactivated", label: "Deactivated Cards" },
            ]}
            className="text-sm py-2"
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
        />
      </div>

      {/* Add New Gift Card Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-gray-200 p-6 space-y-4"
            >
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <FiGift className="text-primary-600 text-lg" />
                  <h2 className="font-bold text-gray-900 text-lg">Issue New Gift Card</h2>
                </div>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                  <FiX size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateGiftCard} className="space-y-3 text-xs">
                {/* Type & Initial Value */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Gift Card Type</label>
                    <AnimatedSelect
                      value={newGiftCard.type}
                      onChange={(e) => setNewGiftCard({ ...newGiftCard, type: e.target.value })}
                      options={[
                        { value: "Virtual", label: "Virtual (Digital)" },
                        { value: "Physical", label: "Physical Card" },
                      ]}
                      className="text-xs py-2 w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Initial Value ($ / ₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="100.00"
                      value={newGiftCard.initialValue}
                      onChange={(e) => setNewGiftCard({ ...newGiftCard, initialValue: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                {/* Coupon Code Generator */}
                <div>
                  <label className="block text-gray-700 font-bold mb-1">Voucher Code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. GC-8A3B-9F12"
                      value={newGiftCard.couponCode}
                      onChange={(e) => setNewGiftCard({ ...newGiftCard, couponCode: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 font-mono uppercase font-bold border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                    <button
                      type="button"
                      onClick={generateCode}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-bold whitespace-nowrap"
                    >
                      Generate Code
                    </button>
                  </div>
                </div>

                {/* Recipient Details */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Recipient Name</label>
                    <input
                      type="text"
                      placeholder="Recipient full name"
                      value={newGiftCard.recipientName}
                      onChange={(e) => setNewGiftCard({ ...newGiftCard, recipientName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Recipient Email</label>
                    <input
                      type="email"
                      placeholder="recipient@example.com"
                      value={newGiftCard.recipientEmail}
                      onChange={(e) => setNewGiftCard({ ...newGiftCard, recipientEmail: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                {/* Sender Details */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Sender Name</label>
                    <input
                      type="text"
                      placeholder="Sender name"
                      value={newGiftCard.senderName}
                      onChange={(e) => setNewGiftCard({ ...newGiftCard, senderName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Sender Email</label>
                    <input
                      type="email"
                      placeholder="sender@example.com"
                      value={newGiftCard.senderEmail}
                      onChange={(e) => setNewGiftCard({ ...newGiftCard, senderEmail: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                {/* Activation Checkbox */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isActivated"
                    checked={newGiftCard.isActivated}
                    onChange={(e) => setNewGiftCard({ ...newGiftCard, isActivated: e.target.checked })}
                    className="w-4 h-4 text-primary-600 rounded"
                  />
                  <label htmlFor="isActivated" className="font-bold text-gray-700 cursor-pointer">Activate Gift Card Immediately</label>
                </div>

                <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold"
                  >
                    Issue Gift Card
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-sm w-full shadow-2xl p-6 space-y-4 text-center border border-gray-200"
            >
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                <FiTrash2 size={24} />
              </div>
              <h3 className="font-bold text-gray-900 text-base">Delete Gift Card</h3>
              <p className="text-xs text-gray-500">Are you sure you want to delete this gift card record? This action cannot be undone.</p>
              <div className="flex justify-center gap-2 pt-2">
                <button
                  onClick={() => setDeleteModal({ isOpen: false, id: null })}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default GiftCards;
