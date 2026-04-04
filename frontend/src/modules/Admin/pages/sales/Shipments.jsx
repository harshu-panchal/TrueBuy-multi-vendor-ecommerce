import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiEdit2, 
  FiFilter, 
  FiSearch, 
  FiX, 
  FiCheck, 
  FiSettings, 
  FiChevronDown,
  FiPrinter,
  FiCalendar,
  FiTruck,
  FiPackage,
  FiExternalLink
} from 'react-icons/fi';
import DataTable from '../../components/DataTable';

const Shipments = () => {
  // Selection State
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showFilter, setShowFilter] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPrintOptions, setShowPrintOptions] = useState(false);
  const [editingShipment, setEditingShipment] = useState(null);

  // Filter State
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    trackingNumber: '',
    shippingMethod: 'all'
  });

  const [tableSettings, setTableSettings] = useState({
    rowLines: true,
    columnLines: false,
    striped: false,
    hover: true,
  });

  const [visibleColumns, setVisibleColumns] = useState({
    id: true,
    orderNumber: true,
    trackingNumber: true,
    carrier: true,
    trackingUrl: true,
    totalWeight: true,
    dateShipped: true,
    dateDelivered: true,
    shippingMethod: true,
    createdOn: true,
  });

  // Mock Data (Empty for now)
  const initialData = [];

  const [shipments, setShipments] = useState(initialData);

  // Filtering Logic
  const filteredData = useMemo(() => {
    return shipments.filter(item => {
      const matchTracking = !filters.trackingNumber || item.trackingNumber.toLowerCase().includes(filters.trackingNumber.toLowerCase());
      const matchMethod = filters.shippingMethod === 'all' || item.shippingMethod.toLowerCase() === filters.shippingMethod.toLowerCase();
      
      const shipDate = new Date(item.dateShipped);
      const matchStart = !filters.startDate || shipDate >= new Date(filters.startDate);
      const matchEnd = !filters.endDate || shipDate <= new Date(filters.endDate);

      return matchTracking && matchMethod && matchStart && matchEnd;
    });
  }, [shipments, filters]);

  // Selection Handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(new Set(filteredData.map(s => s.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const handleResetFilters = () => {
    setFilters({ startDate: '', endDate: '', trackingNumber: '', shippingMethod: 'all' });
  };

  const handleEdit = (shipment) => {
    setEditingShipment({ ...shipment });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    setShipments(prev => prev.map(s => s.id === editingShipment.id ? editingShipment : s));
    setEditingShipment(null);
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
    { key: 'orderNumber', label: 'Order Number', hidden: !visibleColumns.orderNumber, render: (v) => <span className="font-bold text-primary-600 cursor-pointer hover:underline">{v}</span> },
    { key: 'trackingNumber', label: 'Tracking Number', hidden: !visibleColumns.trackingNumber, render: (v) => <span className="font-medium text-gray-700 underline decoration-gray-100 underline-offset-4">{v}</span> },
    { key: 'carrier', label: 'Carrier', hidden: !visibleColumns.carrier, render: (v) => <div className="flex items-center gap-2 font-bold text-gray-800"><FiTruck className="text-gray-300" />{v}</div> },
    { key: 'trackingUrl', label: 'URL', hidden: !visibleColumns.trackingUrl, render: (v) => <a href={v} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-700 bg-blue-50 p-2 rounded-lg inline-block transition-colors"><FiExternalLink /></a> },
    { key: 'totalWeight', label: 'Weight', hidden: !visibleColumns.totalWeight, render: (v) => <span className="font-bold text-gray-600">{v}</span> },
    { key: 'dateShipped', label: 'Date Shipped', hidden: !visibleColumns.dateShipped, render: (v) => <span className="text-xs font-medium text-gray-500">{v}</span> },
    { key: 'dateDelivered', label: 'Date Delivered', hidden: !visibleColumns.dateDelivered, render: (v) => v ? <span className="text-xs font-medium text-gray-500">{v}</span> : <span className="text-gray-300 font-black">—</span> },
    { key: 'shippingMethod', label: 'Method', hidden: !visibleColumns.shippingMethod, render: (v) => <span className="p-1 px-2.5 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-black uppercase tracking-wider">{v}</span> },
    { key: 'createdOn', label: 'Created On', hidden: !visibleColumns.createdOn, render: (v) => <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">{v}</span> },
    {
      key: 'action',
      label: 'Action',
      render: (_, row) => (
        <button 
          onClick={() => handleEdit(row)}
          className="p-2 bg-gray-50 hover:bg-primary-50 text-gray-500 hover:text-primary-600 rounded-lg transition-all border border-gray-100 hover:border-primary-100"
        >
          <FiEdit2 className="text-sm" />
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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Shipments</h1>
        <p className="text-sm sm:text-base text-gray-600">Track and manage outgoing shipments and logistics</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 relative mb-20 overflow-visible">
        
        {/* Action Bar */}
        <div className="p-4 border-b border-gray-100 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setShowPrintOptions(!showPrintOptions)}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg transition-colors text-sm font-medium"
              >
                <FiPrinter className="text-gray-500" />
                <span>Print packaging slips</span>
                <FiChevronDown className={`transition-transform ${showPrintOptions ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {showPrintOptions && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowPrintOptions(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute left-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-2"
                    >
                      <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded-lg text-gray-700 flex items-center justify-between group">
                        <span>Print packaging slips (selected)</span>
                        <div className="text-[10px] bg-primary-50 text-primary-600 px-1.5 py-0.5 rounded font-bold">{selectedIds.size}</div>
                      </button>
                      <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded-lg text-gray-700">
                        Print packaging slips (all)
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
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
              className="overflow-hidden bg-gray-50/30 border-b border-gray-100"
            >
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <FiCalendar /> Start Date
                  </label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <FiCalendar /> End Date
                  </label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <FiPackage /> Tracking Number
                  </label>
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input
                      type="text"
                      placeholder="TRK..."
                      value={filters.trackingNumber}
                      onChange={(e) => setFilters({...filters, trackingNumber: e.target.value})}
                      className="w-full pl-9 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <FiTruck /> Shipping Method
                  </label>
                  <select
                    value={filters.shippingMethod}
                    onChange={(e) => setFilters({...filters, shippingMethod: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-primary-500 outline-none appearance-none transition-all shadow-sm"
                  >
                    <option value="all">All Methods</option>
                    <option value="express">Express</option>
                    <option value="standard">Standard</option>
                    <option value="overnight">Overnight</option>
                  </select>
                </div>

                <div className="lg:col-span-4 flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="text-xs text-gray-400 italic">Matching {filteredData.length} shipments</div>
                  <button
                    onClick={handleResetFilters}
                    className="px-4 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all flex items-center gap-2"
                  >
                    <FiX className="text-xs" /> Reset Filters
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
          <div className="text-xs text-gray-400 font-medium order-2 sm:order-1">
            Displaying items 0-{filteredData.length} of {shipments.length}
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

      {/* Edit Modal */}
      <AnimatePresence>
        {editingShipment && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
              onClick={() => setEditingShipment(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden pointer-events-auto"
                onClick={e => e.stopPropagation()}
              >
                <form onSubmit={handleSaveEdit}>
                  <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">Edit Shipment</h2>
                      <p className="text-sm text-gray-500">Updating shipment details for {editingShipment.orderNumber}</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setEditingShipment(null)}
                      className="p-2 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-gray-600 border border-transparent hover:border-gray-100"
                    >
                      <FiX size={20} />
                    </button>
                  </div>

                  <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tracking Number</label>
                      <input
                        type="text"
                        value={editingShipment.trackingNumber}
                        onChange={e => setEditingShipment({...editingShipment, trackingNumber: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-xl outline-none transition-all font-medium text-gray-700"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Carrier (Shipped By)</label>
                      <input
                        type="text"
                        value={editingShipment.carrier}
                        onChange={e => setEditingShipment({...editingShipment, carrier: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-xl outline-none transition-all font-medium text-gray-700"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tracking URL</label>
                      <input
                        type="url"
                        value={editingShipment.trackingUrl}
                        onChange={e => setEditingShipment({...editingShipment, trackingUrl: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-xl outline-none transition-all font-medium text-gray-700"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Shipping Method</label>
                      <select
                        value={editingShipment.shippingMethod}
                        onChange={e => setEditingShipment({...editingShipment, shippingMethod: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-xl outline-none transition-all font-medium text-gray-700 appearance-none"
                      >
                        <option>Express</option>
                        <option>Standard</option>
                        <option>Overnight</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Weight</label>
                      <input
                        type="text"
                        value={editingShipment.totalWeight}
                        onChange={e => setEditingShipment({...editingShipment, totalWeight: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-xl outline-none transition-all font-medium text-gray-700"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Date Shipped</label>
                      <input
                        type="date"
                        value={editingShipment.dateShipped}
                        onChange={e => setEditingShipment({...editingShipment, dateShipped: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-xl outline-none transition-all font-medium text-gray-700"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Date Delivered</label>
                      <input
                        type="date"
                        value={editingShipment.dateDelivered || ''}
                        onChange={e => setEditingShipment({...editingShipment, dateDelivered: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-xl outline-none transition-all font-medium text-gray-700"
                      />
                    </div>
                  </div>

                  <div className="p-6 bg-gray-50 flex gap-4 md:justify-end">
                    <button
                      type="button"
                      onClick={() => setEditingShipment(null)}
                      className="flex-1 md:flex-none px-8 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-100 transition-all shadow-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 md:flex-none px-12 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20 active:scale-95"
                    >
                      Update Shipment
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Shipments;
