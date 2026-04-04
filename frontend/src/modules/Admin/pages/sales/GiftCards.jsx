import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlus,
  FiFilter, 
  FiSearch, 
  FiX, 
  FiCheck, 
  FiSettings, 
  FiChevronDown,
  FiTag,
  FiUser,
  FiMail,
  FiDollarSign,
  FiActivity,
  FiTrash2
} from 'react-icons/fi';
import DataTable from '../../components/DataTable';

const GiftCards = () => {
  // UI State
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showFilter, setShowFilter] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State for Add New
  const [newGiftCard, setNewGiftCard] = useState({
    type: 'Virtual',
    initialValue: '',
    isActivated: false,
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

  const [tableSettings, setTableSettings] = useState({
    rowLines: true,
    columnLines: false,
    striped: false,
    hover: true,
  });

  const [visibleColumns, setVisibleColumns] = useState({
    id: true,
    couponCode: true,
    initialValue: true,
    remainingAmount: true,
    isActivated: true,
    createdOn: true,
    senderName: true,
    senderEmail: true,
  });

  // Mock Data (Empty for now)
  const initialData = [];

  const [giftCards, setGiftCards] = useState(initialData);

  // Filtering Logic
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

  const handleResetFilters = () => {
    setFilters({ couponCode: '', status: 'all' });
  };

  const generateCode = () => {
    const randomHex = () => Math.floor(Math.random() * 0xffffffff).toString(16).padEnd(8, '0');
    const randomHexShort = () => Math.floor(Math.random() * 0xffff).toString(16).padEnd(4, '0');
    const code = `${randomHex()}-${randomHexShort()}`;
    setNewGiftCard({ ...newGiftCard, couponCode: code });
  };

  const handleSave = (e, continueEditing = false) => {
    e?.preventDefault();
    if (!newGiftCard.couponCode) return alert('Please generate or enter a coupon code');
    
    // Add to list logic
    const cardToAdd = {
      ...newGiftCard,
      id: giftCards.length + 1,
      createdOn: new Date().toISOString().replace('T', ' ').slice(0, 19),
      initialValue: `INR ${newGiftCard.initialValue}`,
      remainingAmount: `INR ${newGiftCard.initialValue}`
    };
    
    // Add to list
    setGiftCards(prev => [...prev, cardToAdd]);
    console.log('Saved Gift Card:', cardToAdd);
    
    if (!continueEditing) {
      setShowAddModal(false);
      setNewGiftCard({
        type: 'Virtual', initialValue: '', isActivated: false, couponCode: '',
        recipientName: '', recipientEmail: '', senderName: '', senderEmail: '', message: ''
      });
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this gift card?')) {
      setGiftCards(prev => prev.filter(card => card.id !== id));
    }
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
      key: 'couponCode', 
      label: 'Coupon Code', 
      hidden: !visibleColumns.couponCode, 
      render: (v) => (
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary-50 rounded text-primary-600">
            <FiTag />
          </div>
          <span className="font-bold text-gray-800 tracking-tight whitespace-nowrap">{v}</span>
        </div>
      ) 
    },
    { key: 'initialValue', label: 'Initial Value', hidden: !visibleColumns.initialValue, render: (v) => <span className="font-medium text-gray-600">{v}</span> },
    { key: 'remainingAmount', label: 'Remaining', hidden: !visibleColumns.remainingAmount, render: (v) => <span className="font-black text-primary-600 uppercase text-[10px] tracking-tight">{v}</span> },
    { 
      key: 'isActivated', 
      label: 'Status', 
      hidden: !visibleColumns.isActivated,
      render: (v) => (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${v ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
          {v ? 'Activated' : 'Deactivated'}
        </span>
      )
    },
    { key: 'createdOn', label: 'Created On', hidden: !visibleColumns.createdOn, render: (v) => <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">{v}</span> },
    { key: 'senderName', label: "Sender's Name", hidden: !visibleColumns.senderName, render: (v) => <div className="flex items-center gap-2 font-bold text-gray-800 whitespace-nowrap"><FiUser className="text-gray-300" />{v}</div> },
    { key: 'senderEmail', label: "Sender's Email", hidden: !visibleColumns.senderEmail, render: (v) => <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium italic"><FiMail className="text-gray-200" />{v}</div> },
    {
      key: 'action',
      label: 'Action',
      render: (_, row) => (
        <button 
          onClick={() => handleDelete(row.id)}
          className="p-2 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-all border border-gray-100 hover:border-red-100"
          title="Delete Gift Card"
        >
          <FiTrash2 className="text-sm" />
        </button>
      )
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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Gift Cards</h1>
        <p className="text-sm sm:text-base text-gray-600">Manage and track gift card balances and activation status</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 relative mb-20">
        
        {/* Action Bar */}
        <div className="p-4 border-b border-gray-100 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-primary-600 pr-4 border-r border-gray-100">
              <div className="p-2 bg-primary-50 rounded-lg"><FiTag /></div>
              <span className="text-sm font-bold text-gray-600">Inventory Gift Cards</span>
            </div>
            
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all text-sm font-bold flex items-center gap-2 shadow-lg shadow-primary-200 active:scale-95"
            >
              <FiPlus />
              <span>Add New</span>
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
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <FiTag /> Coupon Code
                  </label>
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input
                      type="text"
                      placeholder="GFT-..."
                      value={filters.couponCode}
                      onChange={(e) => setFilters({...filters, couponCode: e.target.value})}
                      className="w-full pl-9 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <FiActivity /> Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 outline-none appearance-none transition-all shadow-sm"
                  >
                    <option value="all">Unspecified</option>
                    <option value="activated">Activated</option>
                    <option value="deactivated">Deactivated</option>
                  </select>
                </div>

                <div className="md:col-span-2 flex items-center justify-between pt-2 border-t border-gray-100 mt-2">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Matched Results: {filteredData.length}</span>
                  <button onClick={handleResetFilters} className="text-xs font-bold text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors">
                    <FiX size={14} /> Clear Selection
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

        {/* Footer with Settings */}
        <div className="p-1 px-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 relative">
          <div className="flex items-center gap-3 order-2 sm:order-1">
            <div className="p-1 px-2 bg-gray-200 text-gray-500 rounded text-[10px] font-bold font-mono">
              COUNT_{filteredData.length}
            </div>
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

      {/* Add Gift Card Modal */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto"
              onClick={() => setShowAddModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden pointer-events-auto"
                onClick={e => e.stopPropagation()}
              >
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Add New Gift Card</h2>
                    <p className="text-sm text-gray-500 font-medium">Issue a new digital or physical credit coupon</p>
                  </div>
                  <button 
                    onClick={() => setShowAddModal(false)}
                    className="p-2 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-gray-600 border border-transparent hover:border-gray-100"
                  >
                    <FiX size={20} />
                  </button>
                </div>

                <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                  {/* Row 1: Type & Value */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Gift Card Type</label>
                      <select
                        value={newGiftCard.type}
                        onChange={e => setNewGiftCard({...newGiftCard, type: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-xl outline-none transition-all font-medium text-gray-700 appearance-none"
                      >
                        <option>Virtual</option>
                        <option>Physical</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Initial Value</label>
                      <div className="relative">
                        <input
                          type="number"
                          placeholder="INR"
                          value={newGiftCard.initialValue}
                          onChange={e => setNewGiftCard({...newGiftCard, initialValue: e.target.value})}
                          className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-xl outline-none transition-all font-medium text-gray-700"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Activation & Coupon */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Is Gift Card Activated?</label>
                      <button
                        onClick={() => setNewGiftCard({...newGiftCard, isActivated: !newGiftCard.isActivated})}
                        className={`w-14 h-7 rounded-full relative transition-colors duration-300 flex items-center shadow-inner ${newGiftCard.isActivated ? 'bg-green-500' : 'bg-gray-200'}`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full shadow-lg transition-transform duration-300 ${newGiftCard.isActivated ? 'translate-x-[32px]' : 'translate-x-[4px]'}`} />
                      </button>
                    </div>

                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center justify-between">
                        Coupon Code
                        <button 
                          type="button"
                          onClick={generateCode}
                          className="text-primary-600 hover:text-primary-700 text-xs font-bold transition-colors"
                        >
                          Generate Code
                        </button>
                      </label>
                      <div className="relative group">
                        <input
                          type="text"
                          placeholder="838bc5ae-40de"
                          value={newGiftCard.couponCode}
                          onChange={e => setNewGiftCard({...newGiftCard, couponCode: e.target.value})}
                          className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-xl outline-none transition-all font-mono text-sm tracking-widest text-primary-700"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300">
                          <FiTag className="group-focus-within:text-primary-400 group-focus-within:animate-pulse" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <hr className="border-gray-100" />

                  {/* Recipient Details */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                       Recipient Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        placeholder="Recipient's Name"
                        value={newGiftCard.recipientName}
                        onChange={e => setNewGiftCard({...newGiftCard, recipientName: e.target.value})}
                        className="w-full px-4 py-2.5 bg-gray-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-xl outline-none transition-all text-sm"
                      />
                      <input
                        type="email"
                        placeholder="Recipient's Email"
                        value={newGiftCard.recipientEmail}
                        onChange={e => setNewGiftCard({...newGiftCard, recipientEmail: e.target.value})}
                        className="w-full px-4 py-2.5 bg-gray-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-xl outline-none transition-all text-sm"
                      />
                    </div>
                  </div>

                  {/* Sender Details */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                       Sender Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        placeholder="Sender's Name"
                        value={newGiftCard.senderName}
                        onChange={e => setNewGiftCard({...newGiftCard, senderName: e.target.value})}
                        className="w-full px-4 py-2.5 bg-gray-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-xl outline-none transition-all text-sm"
                      />
                      <input
                        type="email"
                        placeholder="Sender's Email"
                        value={newGiftCard.senderEmail}
                        onChange={e => setNewGiftCard({...newGiftCard, senderEmail: e.target.value})}
                        className="w-full px-4 py-2.5 bg-gray-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-xl outline-none transition-all text-sm"
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Message</label>
                    <textarea
                      placeholder="Special gift for your special one..."
                      rows="3"
                      value={newGiftCard.message}
                      onChange={e => setNewGiftCard({...newGiftCard, message: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-xl outline-none transition-all text-sm resize-none"
                    />
                  </div>
                </div>

                <div className="p-6 bg-gray-50 border-t border-gray-100 flex flex-col md:flex-row gap-3">
                  <button
                    onClick={() => handleSave()}
                    className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 active:scale-95 flex items-center justify-center gap-2"
                  >
                    Save
                  </button>
                  <button
                    onClick={(e) => handleSave(e, true)}
                    className="flex-1 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 hover:border-primary-300 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    Save & Continue Editing
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default GiftCards;
