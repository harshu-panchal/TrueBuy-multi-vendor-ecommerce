import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlus,
  FiTrash2,
  FiEdit3,
  FiFilter,
  FiCheck,
  FiSave,
  FiLayout,
  FiGlobe,
  FiUsers,
  FiCode,
  FiEye,
  FiType,
  FiMenu,
  FiList,
  FiArrowLeft,
  FiSettings,
  FiChevronDown,
  FiLayers,
  FiRefreshCw,
  FiGrid,
  FiExternalLink
} from 'react-icons/fi';
import DataTable from '../../components/DataTable';

const MenuForm = ({ 
  mode = 'add', 
  initialData = {}, 
  onClose,
  onSave,
  onDelete
}) => {
  const data = initialData || {};
  const isEdit = mode === 'edit';
  const [activeTab, setActiveTab] = useState('General');
  const [formData, setFormData] = useState({
    systemName: data?.systemName || '',
    published: data?.published ?? true,
    designTemplate: data?.designTemplate || 'LinkList',
    widgetZone: data?.widgetZone || '',
    displayOrder: data?.displayOrder || 0,
    limitedToStores: data?.limitedToStores || 'All Stores',
    limitedToCustomerRoles: data?.limitedToCustomerRoles || 'All Customer Roles',
    title: data?.title || '',
    menuItems: data?.menuItems || [],
    ...data
  });

  const tabs = ['General', 'Menu Items', 'Advanced Settings'];

  const handleToggle = (field) => {
    setFormData(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6 pb-20"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onClose}
            className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-gray-400 hover:text-[#6b2bd9] shadow-sm"
          >
            <FiArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              {isEdit ? `Edit menu details - ${formData.systemName}` : 'Add a new navigation menu'}
            </h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">
              Navigation Management & Distribution
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => onSave(formData, true)}
            className="px-6 py-2.5 bg-white border border-[#6b2bd9]/20 text-[#6b2bd9] rounded-xl hover:bg-purple-50 transition-all text-sm font-bold flex items-center gap-2 active:scale-95 shadow-sm"
          >
            <FiSave size={16} />
            <span>Save and Continue Edit</span>
          </button>
          <button 
            onClick={() => onSave(formData, false)}
            className="px-8 py-2.5 bg-[#6b2bd9] text-white rounded-xl hover:bg-[#5b24b7] transition-all text-sm font-bold flex items-center gap-2 shadow-lg shadow-purple-100 active:scale-95"
          >
            <FiCheck size={16} />
            <span>Save</span>
          </button>
          {isEdit && (
             <button 
               onClick={onDelete}
               className="px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all text-sm font-bold flex items-center gap-2 shadow-lg shadow-red-100 active:scale-95"
             >
                <FiTrash2 size={16} />
                <span>Delete</span>
             </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-100 pb-0.5">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-[11px] font-black uppercase tracking-widest transition-all relative ${
              activeTab === tab ? 'text-[#6b2bd9]' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-6 right-6 h-0.5 bg-[#6b2bd9] rounded-full"
              />
            )}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-8 lg:p-12 space-y-12">
          {activeTab === 'General' ? (
            <div className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                    <FiCode className="text-gray-300" /> System Name
                  </label>
                  <input
                    type="text"
                    value={formData.systemName}
                    onChange={(e) => setFormData({ ...formData, systemName: e.target.value })}
                    className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] focus:bg-white outline-none transition-all"
                    placeholder="e.g., footer-navigation"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                    <FiLayout className="text-gray-300" /> Design Template
                  </label>
                  <select
                    value={formData.designTemplate}
                    onChange={(e) => setFormData({ ...formData, designTemplate: e.target.value })}
                    className="w-full px-5 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] outline-none shadow-sm appearance-none cursor-pointer"
                  >
                    <option value="LinkList">Link List (Standard)</option>
                    <option value="ListGroup">List Group</option>
                    <option value="Dropdown">Dropdown Menu</option>
                    <option value="Navbar">Horizontal Navbar</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <button 
                  onClick={() => handleToggle('published')}
                  className={`p-5 rounded-3xl border flex flex-col gap-3 transition-all group ${
                    formData.published ? 'bg-purple-50 border-purple-100 ring-2 ring-primary-50/50 shadow-sm' : 'bg-white border-gray-100 hover:border-gray-200 shadow-sm'
                  }`}
                >
                   <div className={`p-3 rounded-2xl w-fit transition-all ${
                     formData.published ? 'bg-[#6b2bd9] text-white' : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100'
                   }`}>
                      <FiEye size={16} />
                   </div>
                   <div className="text-left">
                      <h3 className={`text-[10px] font-black uppercase tracking-widest ${formData.published ? 'text-[#6b2bd9]' : 'text-gray-400'}`}>
                        PUBLISHED
                      </h3>
                      <p className="text-[8px] font-bold text-gray-300 uppercase tracking-tighter mt-0.5">
                        {formData.published ? 'VISIBLE ON FRONTEND' : 'HIDDEN FROM FRONTEND'}
                      </p>
                   </div>
                </button>
              </div>

              <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                    <FiType className="text-gray-300" /> Menu Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl text-base font-black focus:ring-4 focus:ring-[#6b2bd9]/5 focus:border-[#6b2bd9] outline-none transition-all placeholder:text-gray-300"
                    placeholder="e.g., Customer Service Links"
                  />
              </div>
            </div>
          ) : activeTab === 'Menu Items' ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
                <div className="flex items-center justify-between px-1">
                   <div className="flex items-center gap-2">
                      <FiList className="text-[#6b2bd9]" />
                      <h3 className="text-[11px] font-black text-gray-800 uppercase tracking-widest">Navigation Items</h3>
                   </div>
                   <button className="px-6 py-2.5 bg-[#6b2bd9] text-white rounded-xl hover:bg-[#5b24b7] transition-all text-[11px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-purple-100 active:scale-95">
                      <FiPlus size={14} />
                      <span>Add New Item</span>
                   </button>
                </div>

                <div className="bg-white border border-gray-100 rounded-[2rem] overflow-hidden shadow-sm">
                   <table className="w-full text-left border-collapse">
                      <thead>
                         <tr className="bg-gray-50/50 border-b border-gray-100">
                            <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Label</th>
                            <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest">Routing URL</th>
                            <th className="px-8 py-5 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                         {formData.menuItems.map((item, idx) => (
                           <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
                              <td className="px-8 py-5">
                                 <span className="text-sm font-bold text-gray-700">{item.name}</span>
                              </td>
                              <td className="px-8 py-5">
                                 <div className="flex items-center gap-2">
                                    <FiExternalLink size={12} className="text-gray-300" />
                                    <span className="text-[11px] font-bold text-[#6b2bd9] bg-purple-50 px-3 py-1 rounded-full">{item.url}</span>
                                 </div>
                              </td>
                              <td className="px-8 py-5 text-right">
                                 <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-2 bg-white border border-gray-100 rounded-lg text-gray-400 hover:text-[#6b2bd9] hover:border-purple-100 transition-all shadow-sm"><FiEdit3 size={14} /></button>
                                    <button className="p-2 bg-white border border-gray-100 rounded-lg text-gray-400 hover:text-red-500 hover:border-red-100 transition-all shadow-sm"><FiTrash2 size={14} /></button>
                                 </div>
                              </td>
                           </tr>
                         ))}
                         {formData.menuItems.length === 0 && (
                            <tr>
                               <td colSpan="3" className="px-8 py-16 text-center">
                                  <div className="flex flex-col items-center gap-3">
                                     <div className="p-4 bg-gray-50 rounded-2xl text-gray-200">
                                        <FiList size={32} />
                                     </div>
                                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">
                                        No items added to this menu yet.<br/>Start by adding your first navigation link.
                                     </p>
                                  </div>
                               </td>
                            </tr>
                         )}
                      </tbody>
                   </table>
                </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                    <FiGrid className="text-gray-300" /> Widget Zone
                  </label>
                  <input
                    type="text"
                    value={formData.widgetZone}
                    onChange={(e) => setFormData({ ...formData, widgetZone: e.target.value })}
                    className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] outline-none transition-all shadow-sm"
                    placeholder="Enter widget zone name..."
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                    <FiRefreshCw className="text-gray-300" /> Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                    className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] outline-none transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                    <FiGlobe className="text-gray-300" /> Limited to stores
                  </label>
                  <select 
                    value={formData.limitedToStores}
                    onChange={(e) => setFormData({ ...formData, limitedToStores: e.target.value })}
                    className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] outline-none shadow-sm appearance-none cursor-pointer"
                  >
                    <option value="All Stores">All Stores</option>
                  </select>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                    <FiUsers className="text-gray-300" /> Limited to customer roles
                  </label>
                  <select 
                    value={formData.limitedToCustomerRoles}
                    onChange={(e) => setFormData({ ...formData, limitedToCustomerRoles: e.target.value })}
                    className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] outline-none shadow-sm appearance-none cursor-pointer"
                  >
                    <option value="All Customer Roles">All Customer Roles</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const Menus = () => {
  const [view, setView] = useState('list');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [editingMenu, setEditingMenu] = useState(null);
  
  const [filters, setFilters] = useState({
    systemName: '',
    title: '',
    store: 'All'
  });

  const [menus, setMenus] = useState([
    {
      id: '1',
      systemName: 'TopMenu',
      title: 'Top Navigation Menu',
      published: true,
      displayOrder: 1,
      designTemplate: 'Navbar',
      limitedToStores: 'All Stores',
      menuItems: [
        { name: 'Home', url: '/' },
        { name: 'Shop', url: '/products' }
      ]
    },
    {
      id: '2',
      systemName: 'FooterLinks',
      title: 'Footer Useful Links',
      published: true,
      displayOrder: 2,
      designTemplate: 'LinkList',
      limitedToStores: 'All Stores',
      menuItems: [
        { name: 'About Us', url: '/about' },
        { name: 'Contact', url: '/contact' }
      ]
    }
  ]);

  const filteredMenus = useMemo(() => {
    return menus.filter(menu => {
      const matchesSystemName = !filters.systemName || menu.systemName.toLowerCase().includes(filters.systemName.toLowerCase());
      const matchesTitle = !filters.title || menu.title.toLowerCase().includes(filters.title.toLowerCase());
      const matchesStore = filters.store === 'All' || menu.limitedToStores === filters.store;
      return matchesSystemName && matchesTitle && matchesStore;
    });
  }, [menus, filters]);

  const handleDelete = (id) => {
    if (window.confirm('Permanently delete this menu?')) {
      setMenus(menus.filter(m => m.id !== id));
      const newSelected = new Set(selectedIds);
      newSelected.delete(id);
      setSelectedIds(newSelected);
    }
  };

  const handleSaveMenu = (data, continueEditing) => {
    if (editingMenu) {
      setMenus(menus.map(m => m.id === editingMenu.id ? { ...data, id: m.id } : m));
    } else {
      const newMenu = { ...data, id: Date.now().toString() };
      setMenus([newMenu, ...menus]);
    }

    if (!continueEditing) {
      setView('list');
      setEditingMenu(null);
    }
  };

  const columns = [
    {
      key: 'checkbox',
      label: (
        <input
          type="checkbox"
          checked={selectedIds.size === filteredMenus.length && filteredMenus.length > 0}
          onChange={(e) => {
            if (e.target.checked) setSelectedIds(new Set(filteredMenus.map(m => m.id)));
            else setSelectedIds(new Set());
          }}
          className="w-4 h-4 rounded border-gray-300 text-[#6b2bd9] focus:ring-[#6b2bd9]"
        />
      ),
      render: (_, row) => (
        <input
          type="checkbox"
          checked={selectedIds.has(row.id)}
          onChange={() => {
            const next = new Set(selectedIds);
            if (next.has(row.id)) next.delete(row.id);
            else next.add(row.id);
            setSelectedIds(next);
          }}
          className="w-4 h-4 rounded border-gray-300 text-[#6b2bd9] focus:ring-[#6b2bd9]"
        />
      )
    },
    {
      key: 'systemName',
      label: 'System Identity',
      render: (v) => (
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gray-50 rounded-lg text-gray-400 group-hover:text-[#6b2bd9] transition-colors shadow-sm">
             <FiCode size={12} />
          </div>
          <span className="font-bold text-gray-800 tracking-tight">{v}</span>
        </div>
      )
    },
    {
      key: 'title',
      label: 'Public Title',
      render: (v) => (
        <div className="flex items-center gap-2">
          <FiLayers size={12} className="text-gray-300" />
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">{v}</span>
        </div>
      )
    },
    {
      key: 'published',
      label: 'Status',
      render: (v) => (
        <div className="flex items-center justify-center">
           {v ? (
             <div className="p-1 bg-green-50 text-green-500 rounded-full shadow-sm shadow-green-100">
                <FiCheck size={12} />
             </div>
           ) : (
             <div className="p-1 bg-red-50 text-red-400 rounded-full shadow-sm shadow-red-100">
                <FiPlus className="rotate-45" size={12} />
             </div>
           )}
        </div>
      )
    },
    {
      key: 'displayOrder',
      label: 'Order',
      render: (v) => <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{v}</span>
    },
    {
      key: 'actions',
      label: 'Action',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              setEditingMenu(row);
              setView('edit');
            }}
            className="p-1.5 bg-primary-50 text-[#6b2bd9] rounded-lg hover:bg-primary-100 transition-colors shadow-sm"
          >
             <FiEdit3 size={14} />
          </button>
          <button onClick={() => handleDelete(row.id)} className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors shadow-sm">
             <FiTrash2 size={14} />
          </button>
        </div>
      )
    }
  ];

  if (view === 'add' || view === 'edit') {
    return (
      <MenuForm 
        mode={view}
        initialData={editingMenu}
        onClose={() => {
          setView('list');
          setEditingMenu(null);
        }} 
        onSave={handleSaveMenu}
        onDelete={() => handleDelete(editingMenu.id)}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-20"
    >
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-visible relative">
        <div className="p-4 border-b border-gray-100 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3 pr-4 border-r border-gray-100">
               <div className="p-2 bg-primary-50 text-[#6b2bd9] rounded-lg shadow-sm">
                  <FiMenu />
               </div>
               <div>
                  <h1 className="text-sm font-bold text-gray-600 tracking-tight">Navigation Menus</h1>
               </div>
            </div>
            <button
               onClick={() => setView('add')}
               className="px-6 py-2.5 bg-[#6b2bd9] text-white rounded-xl hover:bg-[#5b24b7] transition-all text-sm font-bold flex items-center gap-2 shadow-lg shadow-purple-100 active:scale-95"
            >
               <FiPlus size={18} />
               <span>Add New</span>
            </button>
          </div>

          <button
             onClick={() => setShowFilters(!showFilters)}
             className={`px-8 py-2.5 rounded-xl transition-all text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2 border active:scale-95 shadow-lg ${
              showFilters ? 'bg-[#6b2bd9] border-[#6b2bd9] text-white shadow-purple-100' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
             }`}
          >
             <FiFilter size={16} />
             <span>Filter</span>
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-b border-gray-100 bg-gray-50/50"
            >
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">System Name</label>
                  <input
                    type="text"
                    placeholder="Search by system name..."
                    value={filters.systemName}
                    onChange={(e) => setFilters({ ...filters, systemName: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] outline-none transition-all shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Title</label>
                  <input
                    type="text"
                    placeholder="Search by title..."
                    value={filters.title}
                    onChange={(e) => setFilters({ ...filters, title: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] outline-none transition-all shadow-sm"
                  />
                </div>
                <div className="flex items-end pb-1 gap-2">
                   <button 
                     onClick={() => setFilters({ store: 'All', systemName: '', title: '' })}
                     className="px-4 py-2.5 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-[#6b2bd9] transition-colors"
                   >
                     Reset Filters
                   </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-0 overflow-x-auto min-h-[400px]">
          <DataTable
            data={filteredMenus}
            columns={columns}
            pagination={true}
            itemsPerPage={10}
            className="border-none shadow-none rounded-none"
          />
          {filteredMenus.length === 0 && (
            <div className="flex flex-col items-center justify-center p-24 bg-gray-50/20 space-y-4">
              <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 text-gray-200">
                <FiList size={48} />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">No menus found</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Adjust filters or create a new navigation menu</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-gray-50/10 border-t border-gray-100 flex items-center justify-between">
           <div className="flex items-center gap-4 text-[10px] font-black text-gray-300 uppercase tracking-widest">
              <span>Displaying {filteredMenus.length} items</span>
           </div>
           <button 
             className="p-2 rounded-xl transition-all border bg-white border-gray-200 text-gray-400 hover:bg-gray-50 active:scale-95 shadow-sm"
           >
              <FiSettings size={18} />
           </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Menus;

