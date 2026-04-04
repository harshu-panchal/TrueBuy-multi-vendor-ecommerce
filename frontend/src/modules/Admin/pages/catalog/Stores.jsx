import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlus, 
  FiSettings, 
  FiCheck, 
  FiGlobe, 
  FiLink, 
  FiServer, 
  FiShield, 
  FiList,
  FiArrowLeft,
  FiSave,
  FiImage,
  FiLayout,
  FiTarget,
  FiChevronRight,
  FiGrid
} from 'react-icons/fi';
import DataTable from '../../components/DataTable';

const StoreForm = ({ onBack, onSave }) => {
  const [formData, setFormData] = useState({
    logo: null,
    name: '',
    url: '',
    https: false,
    host: '',
    cdn: '',
    currency: 'USD',
    bodyId: '',
    order: 0,
    favicon: null,
    pngIcon: null,
    appleIcon: null,
    msTilePicture: null,
    msTileColor: '#000000'
  });

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, [field]: URL.createObjectURL(file) });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-gray-400 hover:text-primary-600 shadow-sm"
          >
            <FiArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Add a New Store</h1>
            <div className="flex items-center gap-2 text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
              <FiGlobe /> Store Settings Configuration
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onSave(formData, true)}
            className="px-6 py-2.5 bg-white border border-primary-200 text-primary-600 rounded-xl hover:bg-primary-50 transition-all text-sm font-bold flex items-center gap-2 active:scale-95 shadow-sm"
          >
            <FiSave />
            <span>Save & Continue</span>
          </button>
          <button
            onClick={() => onSave(formData, false)}
            className="px-8 py-2.5 bg-[#7e3af2] text-white rounded-xl hover:bg-[#6c2bd9] transition-all text-sm font-bold flex items-center gap-2 shadow-lg shadow-purple-100 active:scale-95"
          >
            <FiCheck />
            <span>Save Store</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: General Settings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-[11px] font-bold uppercase text-gray-400 tracking-widest flex items-center gap-2">
                <FiLayout className="text-primary-500" /> General Information
              </h3>
            </div>
            <div className="p-8 space-y-6">
              {/* Store Logo */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-widest flex items-center gap-2">
                  Store Logo <span className="text-[10px] text-primary-400 italic normal-case font-medium">(Best size: 250 × 50px)</span>
                </label>
                <div className="flex items-center gap-6">
                  <div className="w-64 h-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center relative group hover:border-primary-300 transition-all overflow-hidden">
                    {formData.logo ? (
                      <img src={formData.logo} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      <FiImage className="text-gray-300 text-2xl" />
                    )}
                    <input 
                      type="file" 
                      onChange={(e) => handleFileChange(e, 'logo')}
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                    />
                  </div>
                  <div className="text-xs text-gray-400 leading-relaxed font-medium">
                    Upload your store's primary logo.<br />Used for top navigation and checkout.
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Store Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Global Hyperlink Co."
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Shop URL</label>
                  <div className="relative">
                    <FiLink className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                    <input
                      type="url"
                      value={formData.url}
                      onChange={(e) => setFormData({...formData, url: e.target.value})}
                      placeholder="https://example.com/"
                      className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none shadow-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-primary-50/30 rounded-xl border border-primary-100/50 group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg border border-primary-100 text-primary-600 shadow-sm"><FiShield /></div>
                  <div>
                    <h5 className="text-xs font-bold text-gray-800 uppercase tracking-widest">Require HTTPS</h5>
                    <p className="text-[10px] text-gray-400 font-medium">Enforce secure browsing for this store</p>
                  </div>
                </div>
                <button
                  onClick={() => setFormData({...formData, https: !formData.https})}
                  className={`w-12 h-6 rounded-full relative transition-colors ${formData.https ? 'bg-primary-600' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${formData.https ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">HOST Values</label>
                <input
                  type="text"
                  value={formData.host}
                  onChange={(e) => setFormData({...formData, host: e.target.value})}
                  placeholder="example.com, www.example.com"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-primary-500 outline-none shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Content Delivery Network (CDN) URL</label>
                <div className="relative">
                  <FiServer className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input
                    type="url"
                    value={formData.cdn}
                    onChange={(e) => setFormData({...formData, cdn: e.target.value})}
                    placeholder="https://cdn.example.com/"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Default Currency</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({...formData, currency: e.target.value})}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none appearance-none shadow-sm font-bold"
                  >
                    <option>USD</option>
                    <option>EUR</option>
                    <option>GBP</option>
                    <option>INR</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID of HTML Body</label>
                  <input
                    type="text"
                    value={formData.bodyId}
                    onChange={(e) => setFormData({...formData, bodyId: e.target.value})}
                    placeholder="store-body"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Display Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none shadow-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Icons Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
             <div className="p-4 bg-gray-50/50 border-b border-gray-100">
                <h3 className="text-[11px] font-bold uppercase text-gray-400 tracking-widest flex items-center gap-2">
                  <FiTarget className="text-primary-500" /> Icons & Branding
                </h3>
             </div>
             <div className="p-6 space-y-6">
                {[
                  { label: 'Favicon', key: 'favicon', desc: 'Browser tab icon' },
                  { label: 'PNG Icon', key: 'pngIcon', desc: 'Modern device icon' },
                  { label: 'Apple Touch Icon', key: 'appleIcon', desc: 'iOS home screen icon' },
                  { label: 'MS Tile Picture', key: 'msTilePicture', desc: 'Windows start menu' }
                ].map((icon) => (
                  <div key={icon.key} className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-1">{icon.label}</label>
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center shrink-0 relative hover:border-primary-300 transition-all overflow-hidden shadow-inner">
                         {formData[icon.key] ? (
                           <img src={formData[icon.key]} alt="Icon" className="w-full h-full object-contain" />
                         ) : (
                           <FiImage className="text-gray-300" />
                         )}
                         <input 
                           type="file" 
                           onChange={(e) => handleFileChange(e, icon.key)}
                           className="absolute inset-0 opacity-0 cursor-pointer" 
                         />
                       </div>
                       <div className="text-[10px] text-gray-400">{icon.desc}</div>
                    </div>
                  </div>
                ))}

                <div className="space-y-2 pt-4 border-t border-gray-50">
                  <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest px-1">MS Tile Color</label>
                  <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-xl border border-gray-100">
                    <input
                      type="color"
                      value={formData.msTileColor}
                      onChange={(e) => setFormData({...formData, msTileColor: e.target.value})}
                      className="w-10 h-10 rounded border-none bg-transparent cursor-pointer"
                    />
                    <span className="text-xs font-mono font-bold text-gray-500 uppercase">{formData.msTileColor}</span>
                  </div>
                </div>
             </div>
          </div>

          <div className="bg-primary-600 rounded-2xl p-6 text-white shadow-xl shadow-purple-200 relative overflow-hidden">
             <div className="relative z-10 space-y-2">
                <FiGrid className="text-3xl opacity-50 mb-2" />
                <h4 className="text-sm font-black uppercase tracking-widest">Multi-Store Engine</h4>
                <p className="text-[10px] opacity-80 leading-relaxed font-medium">
                  Configure store-specific assets and regional settings. Each store can have unique branding, domains, and UX identifiers.
                </p>
             </div>
             <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Stores = () => {
  const [view, setView] = useState('list'); // 'list' or 'add'
  const [showSettings, setShowSettings] = useState(false);

  const [tableSettings, setTableSettings] = useState({
    rowLines: true,
    columnLines: false,
    striped: false,
    hover: true,
  });

  const [visibleColumns, setVisibleColumns] = useState({
    name: true,
    url: true,
    host: true,
    cdn: true,
    https: true,
    order: true,
  });

  const [storesData, setStoresData] = useState([]);

  const handleSave = (formData, continueEditing) => {
    console.log('Saving store data:', formData);
    // Basic mock logic: add to list if it's a new store
    const newStore = {
      id: (storesData.length + 1).toString(),
      name: formData.name || 'New Store',
      url: formData.url,
      host: formData.host,
      cdn: formData.cdn,
      https: formData.https,
      order: formData.order
    };
    
    setStoresData([...storesData, newStore]);
    
    if (!continueEditing) {
      setView('list');
    } else {
      alert('Store saved successfully! You can continue editing.');
    }
  };

  if (view === 'add') {
    return <StoreForm onBack={() => setView('list')} onSave={handleSave} />;
  }

  const columns = [
    { 
      key: 'name', 
      label: 'Store Name', 
      hidden: !visibleColumns.name, 
      render: (v) => <span className="font-bold text-gray-800 tracking-tight">{v}</span> 
    },
    { 
      key: 'url', 
      label: 'Shop URL', 
      hidden: !visibleColumns.url, 
      render: (v) => <span className="text-xs font-medium text-primary-600 hover:underline cursor-pointer">{v}</span> 
    },
    { 
      key: 'host', 
      label: 'HOST Values', 
      hidden: !visibleColumns.host, 
      render: (v) => <span className="text-[10px] font-mono text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">{v}</span> 
    },
    { 
      key: 'cdn', 
      label: 'CDN URL', 
      hidden: !visibleColumns.cdn, 
      render: (v) => <span className="text-[10px] text-gray-500 italic">{v || '—'}</span> 
    },
    { 
      key: 'https', 
      label: 'Require HTTPS', 
      hidden: !visibleColumns.https, 
      render: (v) => v ? <FiCheck className="text-green-600 text-lg" /> : <span className="text-gray-300">—</span> 
    },
    { 
      key: 'order', 
      label: 'Display Order', 
      hidden: !visibleColumns.order, 
      render: (v) => <span className="px-2 py-1 bg-gray-100 rounded text-xs font-black text-gray-500">{v}</span> 
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
        <div className="p-4 border-b border-gray-100 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-primary-600 pr-4 border-r border-gray-100">
              <div className="p-2 bg-primary-50 rounded-lg"><FiGlobe /></div>
              <span className="text-sm font-bold text-gray-600">Store Management</span>
            </div>

            <button
              onClick={() => setView('add')}
              className="px-6 py-2.5 bg-[#7e3af2] text-white rounded-xl hover:bg-[#6c2bd9] transition-all text-sm font-bold flex items-center gap-2 shadow-lg shadow-purple-100 active:scale-95"
            >
              <FiPlus className="text-lg" />
              <span>Add New</span>
            </button>
          </div>
        </div>

        <div className="p-0 overflow-x-auto min-h-[400px]">
          <DataTable
            data={storesData}
            columns={filteredColumns}
            pagination={false}
            rowLines={tableSettings.rowLines}
            columnLines={tableSettings.columnLines}
            className={`rounded-none shadow-none border-none ${tableSettings.striped ? '[&_tbody_tr:nth-child(even)]:bg-gray-50/50' : ''} ${!tableSettings.hover ? '[&_tbody_tr]:hover:bg-transparent' : ''}`}
          />
        </div>

        <div className="p-4 px-6 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary-500 shadow-sm" />
                <span className="text-[10px] font-bold uppercase text-gray-400 tracking-widest">Active Stores: {storesData.length}</span>
             </div>
          </div>
          
          <div className="flex items-center gap-2">
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
                      <h4 className="text-[10px] font-bold uppercase text-gray-400 tracking-widest mb-3 border-b border-gray-50 pb-2">Layout Config</h4>
                      
                      <div className="space-y-2.5">
                        {[
                          { label: 'Row lines', key: 'rowLines' },
                          { label: 'Column lines', key: 'columnLines' },
                          { label: 'Striped', key: 'striped' },
                          { label: 'Hover', key: 'hover' }
                        ].map(({ label, key }) => (
                          <label key={key} className="flex items-center justify-between cursor-pointer group">
                            <span className="text-xs font-bold text-gray-600 group-hover:text-primary-600 transition-colors uppercase tracking-widest">{label}</span>
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
                        <h4 className="text-[10px] font-bold uppercase text-gray-400 tracking-widest mb-2">Column Manager</h4>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                          {[
                            { label: 'Store Name', key: 'name' },
                            { label: 'Shop URL', key: 'url' },
                            { label: 'HOST Values', key: 'host' },
                            { label: 'CDN URL', key: 'cdn' },
                            { label: 'HTTPS', key: 'https' },
                            { label: 'Display Order', key: 'order' }
                          ].map(({ label, key }) => (
                            <label key={key} className="flex items-center gap-2 cursor-pointer group">
                              <div
                                onClick={() => setVisibleColumns(v => ({ ...v, [key]: !v[key] }))}
                                className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${visibleColumns[key] ? 'bg-primary-600 border-primary-600' : 'bg-white border-gray-300'}`}
                              >
                                {visibleColumns[key] && <FiCheck className="text-white text-[8px]" />}
                              </div>
                              <span className={`text-[9px] font-bold uppercase tracking-widest transition-colors ${visibleColumns[key] ? 'text-gray-900' : 'text-gray-400'}`}>
                                {label}
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
      </div>
    </motion.div>
  );
};

export default Stores;
