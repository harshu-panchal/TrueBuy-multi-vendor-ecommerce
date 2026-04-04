import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSettings,
  FiPlus,
  FiTrash2,
  FiCheck,
  FiUsers,
  FiX,
  FiMail,
  FiUser,
  FiArrowLeft,
  FiSave,
  FiGlobe,
  FiMapPin,
  FiPhone,
  FiPhoneCall,
  FiHash,
  FiLayout,
  FiBriefcase,
  FiLoader,
  FiExternalLink,
  FiUsers as FiCustomers,
  FiShoppingCart
} from 'react-icons/fi';
import DataTable from '../../components/DataTable';

const AffiliateForm = ({ onBack, onSave, onUpdate, initialData = null, onDelete }) => {
  const isEdit = !!initialData;
  const [activeTab, setActiveTab] = useState('info');
  const [formData, setFormData] = useState(initialData || {
    active: true,
    company: '',
    firstName: '',
    lastName: '',
    email: '',
    country: '',
    state: '',
    city: '',
    address1: '',
    address2: '',
    zipCode: '',
    phone: '',
    fax: ''
  });

  const [geoData, setGeoData] = useState([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(true);
  const [isLoadingStates, setIsLoadingStates] = useState(false);
  const [availableStates, setAvailableStates] = useState([]);

  // Fetch Countries on Mount
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setIsLoadingCountries(true);
        const response = await fetch('https://countriesnow.space/api/v0.1/countries/iso');
        const result = await response.json();
        if (!result.error) {
          setGeoData(result.data);
          if (!isEdit && result.data.length > 0) {
            handleCountryChange(result.data[0].name);
          } else if (isEdit && initialData.country) {
            fetchStatesForCountry(initialData.country);
          }
        }
      } catch (error) {
        console.error('Failed to fetch countries:', error);
      } finally {
        setIsLoadingCountries(false);
      }
    };
    fetchCountries();
  }, []);

  const fetchStatesForCountry = async (countryName) => {
    setIsLoadingStates(true);
    try {
      const response = await fetch('https://countriesnow.space/api/v0.1/countries/states', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country: countryName })
      });
      const result = await response.json();
      if (!result.error) {
        setAvailableStates(result.data.states.map(s => s.name));
      }
    } catch (e) { console.error(e); }
    finally { setIsLoadingStates(false); }
  };

  const handleCountryChange = async (countryName) => {
    setFormData(prev => ({ ...prev, country: countryName, state: '' }));
    await fetchStatesForCountry(countryName);
  };

  const tabs = [
    { id: 'info', label: 'Affiliate Info', icon: <FiLayout /> },
    { id: 'customers', label: 'Affiliated Customers', icon: <FiCustomers /> },
    { id: 'orders', label: 'Affiliated Orders', icon: <FiShoppingCart /> },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6 pb-20"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-gray-500 hover:text-primary-600 shadow-sm"
          >
            <FiArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              {isEdit ? `Edit affiliate details - ${formData.firstName} ${formData.lastName}` : 'Add a New Affiliate'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => isEdit ? onUpdate(formData, true) : onSave(formData, true)}
            className="px-6 py-2.5 bg-white border border-primary-200 text-primary-600 rounded-xl hover:bg-primary-50 transition-all text-sm font-semibold flex items-center gap-2 active:scale-95 shadow-sm"
          >
            <FiSave />
            <span>{isEdit ? 'Save and Continue Edit' : 'Save & Continue'}</span>
          </button>
          <button
            onClick={() => isEdit ? onUpdate(formData, false) : onSave(formData, false)}
            className="px-8 py-2.5 bg-[#7e3af2] text-white rounded-xl hover:bg-[#6c2bd9] transition-all text-sm font-semibold flex items-center gap-2 shadow-lg shadow-purple-100 active:scale-95"
          >
            <FiCheck />
            <span>{isEdit ? 'Save' : 'Save Affiliate'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-8 border-b border-gray-100">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-4 text-xs font-bold tracking-widest transition-all relative uppercase ${activeTab === tab.id ? 'text-primary-600' : 'text-gray-500 hover:text-gray-600'}`}
          >
            <div className="flex items-center gap-2">
              {tab.icon}
              {tab.label}
            </div>
            {activeTab === tab.id && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full" />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'info' && (
          <motion.div
            key="info"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
          >
            <div className="p-10 space-y-10">
              {isEdit && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-8 border-b border-gray-50">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 tracking-widest uppercase">Affiliate Identifier</label>
                    <p className="text-sm font-semibold text-gray-800">{formData.id}</p>
                  </div>
                  <div className="space-y-1 lg:col-span-2">
                    <label className="text-xs font-bold text-gray-700 tracking-widest uppercase">Affiliate URL</label>
                    <a href={`https://www.trubuyonline.com/?affiliateid=${formData.id}`} target="_blank" rel="noreferrer" className="text-sm font-semibold text-primary-600 flex items-center gap-2 hover:underline">
                      https://www.trubuyonline.com/?affiliateid={formData.id}
                      <FiExternalLink size={12} />
                    </a>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-700 tracking-widest uppercase px-1">Active</label>
                  <button
                    onClick={() => setFormData({ ...formData, active: !formData.active })}
                    className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${formData.active ? 'bg-orange-500' : 'bg-gray-200'}`}
                  >
                    <motion.div
                      animate={{ x: formData.active ? 26 : 2 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                    />
                  </button>
                </div>

                <div className="space-y-2 lg:col-span-2">
                  <label className="text-xs font-bold text-gray-700 tracking-widest uppercase px-1">Company</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary-500 outline-none shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700 tracking-widest uppercase px-1">First Name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary-500 outline-none shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700 tracking-widest uppercase px-1">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary-500 outline-none shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700 tracking-widest uppercase px-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary-500 outline-none shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-6 pt-6 border-t border-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 tracking-widest uppercase px-1">Country</label>
                    <div className="relative group">
                      <select
                        disabled={isLoadingCountries}
                        value={formData.country}
                        onChange={(e) => handleCountryChange(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary-500 outline-none shadow-sm appearance-none cursor-pointer"
                      >
                        {isLoadingCountries ? <option>Loading...</option> : geoData.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                      </select>
                      <FiGlobe className="absolute right-3 top-3.5 text-gray-500" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 tracking-widest uppercase px-1">State / Province</label>
                    <div className="relative group">
                      <select
                        disabled={isLoadingStates || isLoadingCountries}
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary-500 outline-none shadow-sm appearance-none cursor-pointer"
                      >
                        {isLoadingStates ? <option>Loading...</option> : availableStates.length > 0 ? availableStates.map(s => <option key={s} value={s}>{s}</option>) : <option>Unspecified</option>}
                      </select>
                      <FiGlobe className="absolute right-3 top-3.5 text-gray-500" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 tracking-widest uppercase px-1">City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary-500 outline-none shadow-sm"
                    />
                  </div>
                  <div className="space-y-2 lg:col-span-2">
                    <label className="text-xs font-bold text-gray-700 tracking-widest uppercase px-1">Address 1</label>
                    <input
                      type="text"
                      value={formData.address1}
                      onChange={(e) => setFormData({ ...formData, address1: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary-500 outline-none shadow-sm"
                    />
                  </div>
                  <div className="space-y-2 lg:col-span-2">
                    <label className="text-xs font-bold text-gray-700 tracking-widest uppercase px-1">Address 2</label>
                    <input
                      type="text"
                      value={formData.address2}
                      onChange={(e) => setFormData({ ...formData, address2: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary-500 outline-none shadow-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 tracking-widest uppercase px-1">Zip / Postal Code</label>
                    <input
                      type="text"
                      value={formData.zipCode}
                      onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary-500 outline-none shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-50">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 tracking-widest uppercase px-1">Phone Number</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary-500 outline-none shadow-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 tracking-widest uppercase px-1">Fax Number</label>
                    <input
                      type="tel"
                      value={formData.fax}
                      onChange={(e) => setFormData({ ...formData, fax: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-primary-500 outline-none shadow-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'customers' && (
          <motion.div
            key="customers"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
          >
            <div className="p-0 overflow-x-auto">
              <DataTable
                data={[]}
                columns={[
                  { key: 'name', label: 'Name', render: (v) => <span className="font-semibold text-gray-800">{v}</span> },
                  { key: 'username', label: 'Username', render: (v) => <span className="text-xs font-semibold text-primary-600 tracking-widest">{v}</span> },
                  { key: 'email', label: 'Email', render: (v) => <span className="text-xs font-medium text-gray-600">{v}</span> },
                  { key: 'createdOn', label: 'Created On', render: (v) => <span className="text-[10px] font-semibold text-gray-500 tracking-widest">{v}</span> },
                ]}
                pagination={true}
                itemsPerPage={10}
                className="rounded-none border-none shadow-none"
              />
            </div>
          </motion.div>
        )}

        {activeTab === 'orders' && (
          <motion.div
            key="orders"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
          >
            <div className="p-0 overflow-x-auto">
              <DataTable
                data={[]}
                columns={[
                  { key: 'id', label: 'Created Order', render: (v) => <span className="font-semibold text-primary-600 hover:underline cursor-pointer">{v}</span> },
                  {
                    key: 'status',
                    label: 'Order Status',
                    render: (v) => (
                      <span className={`px-3 py-1 rounded-full text-[10px] font-semibold tracking-widest ${v === 'Complete' ? 'bg-green-50 text-green-600' :
                        v === 'Processing' ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-500'
                        }`}>
                        {v}
                      </span>
                    )
                  },
                  {
                    key: 'payment',
                    label: 'Payment Status',
                    render: (v) => (
                      <span className={`px-3 py-1 rounded-full text-[10px] font-semibold tracking-widest ${v === 'Paid' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                        }`}>
                        {v}
                      </span>
                    )
                  },
                  {
                    key: 'shipping',
                    label: 'Shipping Status',
                    render: (v) => <span className="text-xs font-semibold text-gray-500 tracking-tight">{v}</span>
                  },
                  { key: 'createdOn', label: 'Created On', render: (v) => <span className="text-[10px] font-semibold text-gray-500 tracking-widest">{v}</span> },
                  { key: 'total', label: 'Order Total', render: (v) => <span className="font-semibold text-gray-800">{v}</span> },
                ]}
                pagination={true}
                itemsPerPage={10}
                className="rounded-none border-none shadow-none"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const Affiliates = () => {
  // UI State
  const [view, setView] = useState('list'); // 'list' or 'add' or 'edit'
  const [editingAffiliate, setEditingAffiliate] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Table Settings State
  const [tableSettings, setTableSettings] = useState({
    rowLines: true,
    columnLines: false,
    striped: false,
    hover: true,
  });

  // Column Visibility State
  const [visibleColumns, setVisibleColumns] = useState({
    email: true,
    firstName: true,
    lastName: true,
    active: true,
  });

  const [affiliates, setAffiliates] = useState([]);

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelectedIds(new Set(affiliates.map(a => a.id)));
    else setSelectedIds(new Set());
  };

  const handleSelectRow = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    if (window.confirm(`Permanently remove ${selectedIds.size} affiliate accounts?`)) {
      setAffiliates(affiliates.filter(a => !selectedIds.has(a.id)));
      setSelectedIds(new Set());
    }
  };

  const handleSaveAffiliate = (formData, continueEditing) => {
    const newAffiliate = {
      id: (affiliates.length + 1).toString(),
      ...formData
    };
    setAffiliates([...affiliates, newAffiliate]);
    if (!continueEditing) setView('list');
    else {
      setEditingAffiliate(newAffiliate);
      setView('edit');
    }
  };

  const handleUpdateAffiliate = (formData, continueEditing) => {
    setAffiliates(affiliates.map(a => a.id === formData.id ? formData : a));
    if (!continueEditing) setView('list');
    else alert('Affiliate updated successfully.');
  };

  const handleRowDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this affiliate?')) {
      setAffiliates(affiliates.filter(a => a.id !== id));
      setView('list');
    }
  };

  if (view === 'add') {
    return <AffiliateForm onBack={() => setView('list')} onSave={handleSaveAffiliate} />;
  }

  if (view === 'edit') {
    return <AffiliateForm
      onBack={() => setView('list')}
      initialData={editingAffiliate}
      onUpdate={handleUpdateAffiliate}
      onDelete={handleRowDelete}
    />;
  }

  // Table Columns
  const columns = [
    {
      key: 'checkbox',
      label: (
        <input
          type="checkbox"
          checked={selectedIds.size === affiliates.length && affiliates.length > 0}
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
      key: 'email',
      label: 'Email',
      hidden: !visibleColumns.email,
      render: (v) => (
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gray-50 rounded-lg text-gray-500"><FiMail size={12} /></div>
          <span className="font-semibold text-gray-800 tracking-tight">{v}</span>
        </div>
      )
    },
    {
      key: 'firstName',
      label: 'First Name',
      hidden: !visibleColumns.firstName,
      render: (v) => <span className="text-xs font-semibold text-gray-600 tracking-widest">{v}</span>
    },
    {
      key: 'lastName',
      label: 'Last Name',
      hidden: !visibleColumns.lastName,
      render: (v) => <span className="text-xs font-semibold text-gray-600 tracking-widest">{v}</span>
    },
    {
      key: 'active',
      label: 'Active',
      hidden: !visibleColumns.active,
      render: (v) => v ?
        <div className="flex items-center justify-center"><FiCheck className="text-green-600 text-lg" /></div> :
        <div className="flex items-center justify-center"><FiX className="text-red-400 text-lg" /></div>
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-3 justify-start pl-2">
          <button
            onClick={() => {
              setEditingAffiliate(row);
              setView('edit');
            }}
            className="p-1.5 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors shadow-sm"
            title="Edit Affiliate"
          >
            <FiGlobe size={14} />
          </button>
        </div>
      )
    },
  ];

  const filteredColumns = columns.filter(col => !col.hidden);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-20"
    >
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-visible relative">
        {/* Action Bar */}
        <div className="p-4 border-b border-gray-100 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-primary-600 pr-4 border-r border-gray-100">
              <div className="p-2 bg-primary-50 rounded-lg"><FiUsers /></div>
              <span className="text-sm font-semibold text-gray-600 tracking-tight">Affiliates</span>
            </div>

            <button
              onClick={() => {
                setEditingAffiliate(null);
                setView('add');
              }}
              className="px-6 py-2.5 bg-[#7e3af2] text-white rounded-xl hover:bg-[#6c2bd9] transition-all text-sm font-semibold flex items-center gap-2 shadow-lg shadow-purple-100 active:scale-95"
            >
              <FiPlus className="text-lg" />
              <span>Add New</span>
            </button>

            <AnimatePresence>
              {selectedIds.size > 0 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={handleDeleteSelected}
                  className="px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all text-xs font-semibold tracking-widest flex items-center gap-2 shadow-lg shadow-red-100 active:scale-95"
                >
                  <FiTrash2 size={14} />
                  <span>Delete Selected ({selectedIds.size})</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Table Section */}
        <div className="p-0 overflow-x-auto min-h-[400px]">
          <DataTable
            data={affiliates}
            columns={filteredColumns}
            pagination={true}
            itemsPerPage={10}
            rowLines={tableSettings.rowLines}
            columnLines={tableSettings.columnLines}
            className={`rounded-none shadow-none border-none ${tableSettings.striped ? '[&_tbody_tr:nth-child(even)]:bg-gray-50/50' : ''} ${!tableSettings.hover ? '[&_tbody_tr]:hover:bg-transparent' : ''}`}
          />

          {affiliates.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 bg-gray-50/20 rounded-b-2xl border-t border-gray-100 space-y-4">
              <div className="p-6 bg-white rounded-full shadow-sm border border-gray-100 text-gray-300">
                <FiUsers size={48} />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-sm font-semibold text-gray-800 tracking-widest">No Affiliates found</h3>
                <p className="text-xs text-gray-500 font-semibold tracking-tight">Expand your outreach by onboarding new affiliate partners.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Meta */}
        <div className="p-4 px-6 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-semibold text-gray-500 tracking-widest">Total Active Partners: {affiliates.filter(a => a.active).length}</span>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded border transition-all ${showSettings ? 'bg-primary-50 border-primary-300 text-primary-600 shadow-sm' : 'bg-gray-200 border-gray-300 text-gray-700 hover:bg-gray-300'}`}
            >
              <FiSettings />
            </button>

            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute bottom-full right-0 mb-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 z-50 pointer-events-auto"
                >
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-semibold text-gray-500 tracking-widest mb-3 border-b border-gray-50 pb-2">Layout Config</h4>

                    <div className="space-y-2.5">
                      {[
                        { label: 'Row lines', key: 'rowLines' },
                        { label: 'Column lines', key: 'columnLines' },
                        { label: 'Striped', key: 'striped' },
                        { label: 'Hover', key: 'hover' }
                      ].map(({ label, key }) => (
                        <label key={key} className="flex items-center justify-between cursor-pointer group">
                          <span className="text-xs font-semibold text-gray-600 group-hover:text-primary-600 transition-colors tracking-widest">{label}</span>
                          <div
                            onClick={() => setTableSettings(s => ({ ...s, [key]: !s[key] }))}
                            className={`w-8 h-4 rounded-full relative transition-colors ${tableSettings[key] ? 'bg-primary-600' : 'bg-gray-300'}`}
                          >
                            <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${tableSettings[key] ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                          </div>
                        </label>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-gray-50 space-y-2">
                      <h4 className="text-[10px] font-semibold text-gray-500 tracking-widest mb-2">Column Manager</h4>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-admin">
                        {Object.entries(visibleColumns).map(([key, isVisible]) => (
                          <label key={key} className="flex items-center gap-2 cursor-pointer group">
                            <div
                              onClick={() => setVisibleColumns(v => ({ ...v, [key]: !v[key] }))}
                              className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${isVisible ? 'bg-primary-600 border-primary-600' : 'bg-white border-gray-300'}`}
                            >
                              {isVisible && <FiCheck className="text-white text-[8px]" />}
                            </div>
                            <span className={`text-[9px] font-semibold tracking-widest transition-colors ${isVisible ? 'text-gray-900' : 'text-gray-500'}`}>
                              {key.replace(/([A-Z])/g, ' $1')}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Affiliates;
