import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiGlobe, 
  FiTruck, 
  FiPercent, 
  FiChevronRight,
  FiMapPin,
  FiType,
  FiDollarSign,
  FiBox,
  FiCpu,
  FiShield,
  FiList,
  FiArrowLeft,
  FiPlus,
  FiFilter,
  FiTrash2,
  FiCheck,
  FiMinus,
  FiEdit3,
  FiMoreHorizontal,
  FiDownload,
  FiSearch,
  FiSave,
  FiEye,
  FiSettings,
  FiInfo,
  FiCreditCard,
  FiLayout,
  FiHash,
  FiFileText,
  FiBriefcase,
  FiCode,
  FiLink,
  FiTarget,
  FiLayers,
  FiArchive,
  FiStar,
  FiRefreshCw
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/DataTable';

const SettingItem = ({ icon: Icon, title, onClick }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center justify-between p-5 bg-gray-50/50 hover:bg-white border border-transparent hover:border-[#6b2bd9]/10 rounded-2xl transition-all group shadow-sm hover:shadow-md active:scale-[0.99]"
  >
    <div className="flex items-center gap-4">
      <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-400 group-hover:text-[#6b2bd9] transition-colors">
        <Icon size={18} />
      </div>
      <span className="text-sm font-bold text-gray-700 tracking-tight group-hover:text-gray-900 transition-colors">
        {title}
      </span>
    </div>
    <div className="text-gray-300 group-hover:text-[#6b2bd9] transition-all transform group-hover:translate-x-1">
      <FiChevronRight size={18} />
    </div>
  </button>
);

const SettingGroup = ({ title, items }) => (
  <div className="space-y-4">
    {title && (
      <h3 className="text-[10px] font-bold text-black uppercase tracking-[0.2em] px-2 mb-2">
        {title}
      </h3>
    )}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {items.map((item, idx) => (
        <SettingItem 
          key={idx}
          icon={item.icon}
          title={item.title}
          onClick={item.onClick}
        />
      ))}
    </div>
  </div>
);

const CountryForm = ({ onBack, onSave, initialData = null }) => {
  const isEdit = !!initialData;
  const [activeTab, setActiveTab] = useState('Country Info');
  const [formData, setFormData] = useState({
    name: '',
    published: true,
    displayOrder: 0,
    allowBilling: true,
    allowShipping: true,
    subjectToVat: false,
    displayCookieManager: false,
    defaultCurrency: 'INR',
    limitedToStores: false,
    code: '',
    code3: '',
    iso: '',
    addressFormat: '',
    ...(initialData || {})
  });

  const tabs = ['Country Info', 'States & Provinces'];

  const handleToggle = (field) => {
    setFormData(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6 pb-20"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-gray-400 hover:text-[#6b2bd9] shadow-sm"
          >
            <FiArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              {isEdit ? `Edit country details - ${formData.name}` : 'Add a new country'}
            </h1>
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
            className="px-8 py-2.5 bg-[#6b2bd9] text-white rounded-xl hover:bg-[#5b24b7] transition-all text-sm font-bold flex items-center gap-2 shadow-lg shadow-purple-200/50 active:scale-95"
          >
            <FiCheck size={18} />
            <span>Save</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-100 pb-0.5">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-[11px] font-bold uppercase tracking-widest transition-all relative ${
              activeTab === tab ? 'text-[#6b2bd9]' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div 
                layoutId="activeTabUnderline"
                className="absolute bottom-0 left-6 right-6 h-0.5 bg-[#6b2bd9] rounded-full"
              />
            )}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-8 lg:p-12 space-y-12">
          {activeTab === 'Country Info' ? (
            <div className="space-y-12">
              {/* Basic Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                    <FiMapPin className="text-gray-300" /> Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                    <FiSettings className="text-gray-300" /> Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
                    className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                    <FiDollarSign className="text-gray-300" /> Default Currency
                  </label>
                  <select
                    value={formData.defaultCurrency}
                    onChange={(e) => setFormData({ ...formData, defaultCurrency: e.target.value })}
                    className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] outline-none transition-all cursor-pointer appearance-none"
                  >
                    <option value="INR">Indian Rupee (₹)</option>
                    <option value="USD">US Dollar ($)</option>
                    <option value="EUR">Euro (€)</option>
                    <option value="GBP">British Pound (£)</option>
                  </select>
                </div>
              </div>

              {/* Toggles Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                 {[
                   { id: 'published', label: 'Published', icon: <FiEye /> },
                   { id: 'allowBilling', label: 'Allow Billing', icon: <FiCreditCard /> },
                   { id: 'allowShipping', label: 'Allow Shipping', icon: <FiTruck /> },
                   { id: 'subjectToVat', label: 'Subject to VAT', icon: <FiPercent /> },
                   { id: 'displayCookieManager', label: 'Cookie Manager', icon: <FiBriefcase /> },
                   { id: 'limitedToStores', label: 'Limited to Stores', icon: <FiList /> },
                 ].map(item => (
                   <button
                     key={item.id}
                     onClick={() => handleToggle(item.id)}
                     className={`p-5 rounded-3xl border flex flex-col gap-3 transition-all group ${
                       formData[item.id] 
                       ? 'bg-purple-50/50 border-purple-100 ring-2 ring-purple-100/30' 
                       : 'bg-white border-gray-100 hover:border-gray-200'
                     }`}
                   >
                     <div className={`p-3 rounded-2xl w-fit transition-all ${
                       formData[item.id] ? 'bg-[#6b2bd9] text-white shadow-md' : 'bg-gray-50 text-gray-400'
                     }`}>
                       {item.icon}
                     </div>
                     <div className="text-left">
                       <span className={`text-[10px] font-bold uppercase tracking-widest ${
                         formData[item.id] ? 'text-[#6b2bd9]' : 'text-gray-400'
                       }`}>
                         {item.label}
                       </span>
                       <p className="text-[8px] font-bold text-gray-300 uppercase tracking-widest mt-0.5">
                         {formData[item.id] ? 'Currently Active' : 'Currently Inactive'}
                       </p>
                     </div>
                   </button>
                 ))}
              </div>

              {/* Codes & Logistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 ">
                 <div className="space-y-2">
                    <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                      <FiType className="text-gray-300" /> Country Code (2-char)
                    </label>
                    <input
                      type="text"
                      maxLength={2}
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] outline-none transition-all uppercase"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                      <FiType className="text-gray-300" /> Country Code (3-char)
                    </label>
                    <input
                      type="text"
                      maxLength={3}
                      value={formData.code3}
                      onChange={(e) => setFormData({ ...formData, code3: e.target.value.toUpperCase() })}
                      className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] outline-none transition-all uppercase"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                      <FiHash className="text-gray-300" /> Numeric ISO Code
                    </label>
                    <input
                      type="text"
                      value={formData.iso}
                      onChange={(e) => setFormData({ ...formData, iso: e.target.value })}
                      className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] outline-none transition-all"
                    />
                 </div>
              </div>

              {/* Address Format */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                  <FiFileText className="text-gray-300" /> Address Format
                </label>
                <textarea
                  rows={4}
                  value={formData.addressFormat}
                  onChange={(e) => setFormData({ ...formData, addressFormat: e.target.value })}
                  placeholder="Enter custom formatting logic for this country's addresses..."
                  className="w-full px-8 py-6 bg-gray-50/50 border border-gray-100 rounded-[2rem] text-sm font-medium focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] focus:bg-white outline-none transition-all resize-none leading-relaxed"
                />
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest px-2 italic">
                  Tip: Use tokens like [FirstName], [LastName], [Address1] for dynamic formatting.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-20 min-h-[400px]">
               <div className="p-8 bg-amber-50 rounded-[2.5rem] border border-amber-100 flex flex-col items-center gap-6 max-w-lg text-center">
                  <div className="p-4 bg-white rounded-2xl text-amber-500 shadow-sm border border-amber-50 ring-4 ring-amber-100/30">
                    <FiInfo size={32} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold text-amber-900 uppercase tracking-widest">Action Required</h3>
                    <p className="text-[11px] font-bold text-amber-900/60 leading-relaxed uppercase tracking-widest">
                      You need to save the country before you can add states for this country page.
                    </p>
                  </div>
                  <button 
                    onClick={() => onSave(formData, true)}
                    className="px-8 py-2.5 bg-amber-500 text-white rounded-2xl hover:bg-amber-600 transition-all text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg shadow-amber-200"
                  >
                    Save Country First
                  </button>
               </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const ShippingMethodForm = ({ onBack, onSave, initialData = null }) => {
   const isEdit = !!initialData;
   const [formData, setFormData] = useState({
     name: '',
     description: '',
     order: 0,
     rules: 0,
     limited: 'All stores',
     noCharges: false,
     ...(initialData || {})
   });

   const handleToggle = (field) => {
     setFormData(prev => ({ ...prev, [field]: !prev[field] }));
   };

   return (
     <motion.div
       initial={{ opacity: 0, x: 20 }}
       animate={{ opacity: 1, x: 0 }}
       className="space-y-6 pb-20"
     >
       {/* Header consistent with other forms */}
       <div className="flex items-center justify-between">
         <div className="flex items-center gap-4">
           <button 
             onClick={onBack}
             className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-gray-400 hover:text-[#6b2bd9] shadow-sm"
           >
             <FiArrowLeft size={20} />
           </button>
           <div>
             <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
               {isEdit ? `Edit shipping method - ${formData.name}` : 'Add a new shipping method'}
             </h1>
             <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.2em] mt-1">
               Logistics Configuration & Governance
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
             className="px-8 py-2.5 bg-[#6b2bd9] text-white rounded-xl hover:bg-[#5b24b7] transition-all text-sm font-bold flex items-center gap-2 shadow-lg shadow-purple-200/50 active:scale-95"
           >
             <FiCheck size={18} />
             <span>Save</span>
           </button>
         </div>
       </div>

       <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-sm overflow-hidden">
         <div className="p-8 lg:p-12 space-y-12">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
             {/* Left Column: Basic Details */}
             <div className="space-y-8">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                     <FiType className="text-gray-300" /> Name
                   </label>
                   <input
                     type="text"
                     value={formData.name}
                     onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                     placeholder="e.g., By Ground, Express Shipping"
                     className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] outline-none transition-all placeholder:text-gray-300"
                   />
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                     <FiFileText className="text-gray-300" /> Description
                   </label>
                   <textarea
                     rows={4}
                     value={formData.description}
                     onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                     placeholder="Enter a brief description for customers..."
                     className="w-full px-5 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] outline-none transition-all resize-none leading-relaxed"
                   />
                </div>
             </div>

             {/* Right Column: Logistics & Governance */}
             <div className="space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                      <FiSettings className="text-gray-300" /> Display Order
                    </label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                      className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                      <FiHash className="text-gray-300" /> Number of rules
                    </label>
                    <input
                      type="number"
                      disabled
                      value={formData.rules}
                      className="w-full px-5 py-3 bg-gray-50/20 border border-gray-100 rounded-2xl text-sm font-bold text-gray-400 cursor-not-allowed outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                     <FiLayout className="text-gray-300" /> Limited to stores
                   </label>
                   <select
                     value={formData.limited}
                     onChange={(e) => setFormData({ ...formData, limited: e.target.value })}
                     className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 outline-none cursor-pointer appearance-none shadow-sm"
                   >
                     <option>All stores</option>
                   </select>
                </div>

                <div className="flex items-center justify-between p-6 bg-gray-50/50 rounded-3xl border border-gray-100 mt-2">
                  <div className="space-y-1">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No additional charges</h4>
                    <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-[0.2em]">Live Pricing Logic</p>
                  </div>
                  <button 
                    onClick={() => handleToggle('noCharges')}
                    className={`w-14 h-8 rounded-full transition-all relative flex items-center ${
                      formData.noCharges ? 'bg-[#6b2bd9]' : 'bg-gray-200'
                    }`}
                  >
                    <div className={`w-6 h-6 bg-white rounded-full shadow-sm absolute transition-all ${
                      formData.noCharges ? 'right-1' : 'left-1'
                    }`} />
                  </button>
                </div>
             </div>
           </div>
         </div>
       </div>
     </motion.div>
   );
};

const Countries = ({ onBack, onAdd, onEdit, onDelete }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    name: '',
    code: '',
    billing: 'All',
    shipping: 'All',
    vat: 'All',
    published: 'All'
  });

  const [initialCountries] = useState([]);

  const filteredCountries = React.useMemo(() => {
    return initialCountries.filter(c => {
      const matchesName = !filters.name || c.name.toLowerCase().includes(filters.name.toLowerCase());
      const matchesCode = !filters.code || c.code.toLowerCase().includes(filters.code.toLowerCase());
      const matchesBilling = filters.billing === 'All' || (filters.billing === 'Yes' ? c.billing : !c.billing);
      const matchesShipping = filters.shipping === 'All' || (filters.shipping === 'Yes' ? c.shipping : !c.shipping);
      const matchesVat = filters.vat === 'All' || (filters.vat === 'Yes' ? c.vat : !c.vat);
      const matchesPublished = filters.published === 'All' || (filters.published === 'Yes' ? c.published : !c.published);
      return matchesName && matchesCode && matchesBilling && matchesShipping && matchesVat && matchesPublished;
    });
  }, [initialCountries, filters]);

  const [selectedIds, setSelectedIds] = useState(new Set());

  const columns = [
    {
      key: 'checkbox',
      label: (
        <input 
          type="checkbox" 
          className="w-4 h-4 rounded border-gray-300 text-[#6b2bd9] focus:ring-[#6b2bd9]"
          checked={selectedIds.size === filteredCountries.length && filteredCountries.length > 0}
          onChange={(e) => {
            if (e.target.checked) setSelectedIds(new Set(filteredCountries.map(c => c.id)));
            else setSelectedIds(new Set());
          }}
        />
      ),
      render: (_, row) => (
        <input 
          type="checkbox" 
          className="w-4 h-4 rounded border-gray-300 text-[#6b2bd9] focus:ring-[#6b2bd9]"
          checked={selectedIds.has(row.id)}
          onChange={() => {
            const newSet = new Set(selectedIds);
            if (newSet.has(row.id)) newSet.delete(row.id);
            else newSet.add(row.id);
            setSelectedIds(newSet);
          }}
        />
      )
    },
    { key: 'name', label: 'Name', render: (v) => <span className="font-bold text-gray-700">{v}</span> },
    { key: 'code', label: 'Code', render: (v) => <span className="text-gray-500 font-medium">{v}</span> },
    { key: 'code3', label: 'ISO-3', render: (v) => <span className="text-gray-400 font-medium">{v}</span> },
    { key: 'iso', label: 'ISO-N', render: (v) => <span className="text-gray-400 font-bold text-[10px] tracking-widest">{v}</span> },
    { 
      key: 'billing', 
      label: 'Billing', 
      render: (v) => v ? <FiCheck className="text-green-500 mx-auto" size={16} /> : <FiMinus className="text-gray-200 mx-auto" size={16} /> 
    },
    { 
      key: 'shipping', 
      label: 'Shipping', 
      render: (v) => v ? <FiCheck className="text-green-500 mx-auto" size={16} /> : <FiMinus className="text-gray-200 mx-auto" size={16} /> 
    },
    { 
      key: 'vat', 
      label: 'VAT', 
      render: (v) => v ? <FiCheck className="text-green-500 mx-auto" size={16} /> : <FiMinus className="text-gray-200 mx-auto" size={16} /> 
    },
    { 
      key: 'published', 
      label: 'Pub.', 
      render: (v) => (
        <div className="flex justify-center">
          {v ? <div className="p-1 bg-green-50 text-green-500 rounded-full"><FiCheck size={12} /></div> : <div className="p-1 bg-red-50 text-red-400 rounded-full"><FiPlus className="rotate-45" size={12} /></div>}
        </div>
      )
    },
    { key: 'order', label: 'Order', render: (v) => <span className="text-gray-500 font-black text-[10px]">{v}</span> },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onEdit(row)}
            className="p-2 bg-purple-50 text-[#6b2bd9] rounded-xl hover:bg-[#6b2bd9] hover:text-white transition-all shadow-sm active:scale-95"
          >
            <FiEdit3 size={14} />
          </button>
          <button 
             onClick={() => onDelete(row.id)}
             className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-95"
          >
            <FiTrash2 size={14} />
          </button>
        </div>
      )
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-gray-400 hover:text-[#6b2bd9] shadow-sm"
          >
            <FiArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Countries</h1>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.2em] mt-1">
              Regional Availability & Tax Matrix
            </p>
          </div>
        </div>
        <button 
          onClick={onAdd}
          className="px-8 py-2.5 bg-[#6b2bd9] text-white rounded-2xl hover:bg-[#5b24b7] transition-all text-sm font-bold flex items-center gap-2 shadow-lg shadow-purple-200/50 active:scale-95"
        >
          <FiPlus size={18} />
          <span>Add New</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
        {/* Table Header / Actions Consolidated */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 pr-4 border-r border-gray-100 mr-2">
                <div className="p-1.5 bg-primary-50 text-[#6b2bd9] rounded-lg">
                   <FiGlobe size={16} />
                </div>
                <span className="text-sm font-bold text-gray-700 tracking-tight">Countries</span>
             </div>
          </div>
          
          <div className="flex items-center gap-4">
             <button 
                disabled={selectedIds.size === 0}
                className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all px-4 ${
                  selectedIds.size > 0 ? 'text-red-500 hover:text-red-600' : 'text-gray-300 pointer-events-none'
                }`}
              >
                <FiTrash2 size={14} />
                <span>Delete selected ({selectedIds.size})</span>
             </button>
             <button 
               onClick={() => setShowFilters(!showFilters)}
               className={`px-8 py-2.5 rounded-2xl transition-all text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg active:scale-95 ${
                 showFilters ? 'bg-[#6b2bd9] text-white shadow-purple-100' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm'
               }`}
             >
                <FiFilter size={16} />
                <span>Filter</span>
             </button>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-b border-gray-100 bg-gray-50/30"
            >
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-1 text-left block">Name</label>
                  <input
                    type="text"
                    placeholder="Search by name..."
                    value={filters.name}
                    onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                    className="w-full px-5 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] outline-none transition-all shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 text-left block">Country Code (2 characters)</label>
                  <input
                    type="text"
                    placeholder="Search by code..."
                    value={filters.code}
                    onChange={(e) => setFilters({ ...filters, code: e.target.value })}
                    className="w-full px-5 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] outline-none transition-all shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 text-left block">Allows Billing</label>
                  <select
                    value={filters.billing}
                    onChange={(e) => setFilters({ ...filters, billing: e.target.value })}
                    className="w-full px-5 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] outline-none transition-all shadow-sm appearance-none cursor-pointer"
                  >
                    <option value="All">All</option>
                    <option value="Yes">Yes Only</option>
                    <option value="No">No Only</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 text-left block">Allows Shipping</label>
                  <select
                    value={filters.shipping}
                    onChange={(e) => setFilters({ ...filters, shipping: e.target.value })}
                    className="w-full px-5 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] outline-none transition-all shadow-sm appearance-none cursor-pointer"
                  >
                    <option value="All">All</option>
                    <option value="Yes">Yes Only</option>
                    <option value="No">No Only</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 text-left block">Subject to VAT</label>
                  <select
                    value={filters.vat}
                    onChange={(e) => setFilters({ ...filters, vat: e.target.value })}
                    className="w-full px-5 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] outline-none transition-all shadow-sm appearance-none cursor-pointer"
                  >
                    <option value="All">All</option>
                    <option value="Yes">Yes Only</option>
                    <option value="No">No Only</option>
                  </select>
                </div>
                <div className="flex items-end pb-1 gap-4">
                  <div className="flex-1 space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 text-left block">Published</label>
                    <select
                      value={filters.published}
                      onChange={(e) => setFilters({ ...filters, published: e.target.value })}
                      className="w-full px-5 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] outline-none transition-all shadow-sm appearance-none cursor-pointer"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Yes">Published Only</option>
                      <option value="No">Unpublished Only</option>
                    </select>
                  </div>
                  <button 
                    onClick={() => setFilters({ name: '', code: '', billing: 'All', shipping: 'All', vat: 'All', published: 'All' })}
                    className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] hover:text-[#6b2bd9] transition-colors"
                  >
                    RESET FILTERS
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-0 overflow-x-auto flex-1 bg-white">
          <DataTable 
            data={filteredCountries}
            columns={columns}
            pagination={true}
            itemsPerPage={10}
            className="border-none shadow-none rounded-none"
          />
          {filteredCountries.length === 0 && (
            <div className="py-24 text-center">
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No matching countries found</p>
            </div>
          )}
        </div>

        {/* Custom Footer Details mapping image */}
        <div className="px-6 py-4 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 bg-gray-50/30">
           <div className="flex items-center gap-8">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                Displaying 1 - {filteredCountries.length} of {filteredCountries.length} items
              </p>
              <div className="flex items-center gap-2">
                 <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Items per page:</span>
                 <select className="bg-transparent text-[10px] font-bold text-gray-600 uppercase tracking-widest outline-none cursor-pointer">
                    <option>10</option>
                    <option>25</option>
                    <option>50</option>
                 </select>
              </div>
           </div>
        </div>
      </div>
    </motion.div>
  );
};

const ShippingRates = ({ onBack }) => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [providers, setProviders] = useState([
    { id: 'Smartstore.ShippingByWeight', name: 'Shipping by weight', description: 'Provides shipping methods for computation based on weight.', active: false },
    { id: 'Shipping.FixedRate', name: 'Fixed rate shipping', description: 'Simplified logistics calculation with standardized pricing.', active: true },
    { id: 'Shipping.ByTotal', name: 'Shipping by total', description: 'Logistics computation based on the cumulative order value.', active: false },
  ]);

  const toggleStatus = (id) => {
    setProviders(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-gray-400 hover:text-[#6b2bd9] shadow-sm"
          >
            <FiArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Shipping rate computation methods</h1>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.2em] mt-1">
              Logistics Calculation Logic & Providers
            </p>
          </div>
        </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         {providers.map(provider => (
            <motion.div
              layout
              key={provider.id}
              className={`bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-xl hover:shadow-purple-100/20 group relative ${
                provider.active ? 'ring-2 ring-[#6b2bd9]/10 bg-purple-50/20' : ''
              }`}
            >
               {/* Color Accent Bar */}
               <div className={`h-1.5 w-full bg-gradient-to-r ${provider.active ? 'from-[#6b2bd9] to-[#8b5cf6]' : 'from-gray-100 to-gray-200'}`} />

               <div className="p-8 flex-1 space-y-6">
                  <div className="flex items-start justify-between">
                     <div className={`p-4 rounded-2xl shadow-lg border-2 ${
                        provider.active 
                        ? 'bg-gradient-to-br from-[#6b2bd9] to-[#8b5cf6] text-white border-white/20' 
                        : 'bg-white text-gray-400 border-gray-50 shadow-gray-100'
                     }`}>
                        <FiCpu size={32} />
                     </div>
                     <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100">
                        <div className={`w-1.5 h-1.5 rounded-full ${provider.active ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">
                           {provider.active ? 'Operational' : 'Disabled'}
                        </span>
                     </div>
                  </div>

                  <div className="space-y-2">
                     <h3 className="text-base font-bold text-gray-800 tracking-tight group-hover:text-[#6b2bd9] transition-colors">
                        {provider.name}
                     </h3>
                     <p className="text-[9px] font-bold text-[#6b2bd9]/40 uppercase tracking-widest leading-relaxed">
                        ID: {provider.id}
                     </p>
                  </div>

                  <p className="text-[11px] font-medium text-gray-400 leading-relaxed min-h-[44px]">
                     {provider.description}
                  </p>
               </div>

               <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between relative">
                  <button 
                     onClick={() => toggleStatus(provider.id)}
                     className={`px-8 py-3 rounded-2xl transition-all text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 active:scale-95 shadow-lg ${
                        provider.active 
                        ? 'bg-white border border-gray-200 text-gray-500 hover:bg-white shadow-none' 
                        : 'bg-[#6b2bd9] text-white shadow-purple-200/50 hover:bg-[#5b24b7]'
                     }`}
                  >
                     {provider.active ? (
                        <>
                           <span>Deactivate</span>
                        </>
                     ) : (
                        <>
                           <FiCheck size={14} />
                           <span>Activate</span>
                        </>
                     )}
                  </button>
                  
                  <div className="relative">
                    <button 
                      onClick={() => setActiveDropdown(activeDropdown === provider.id ? null : provider.id)}
                      className="p-3 bg-white text-gray-400 rounded-xl hover:text-[#6b2bd9] hover:bg-purple-50 transition-all shadow-sm border border-gray-100 active:scale-95"
                    >
                       <FiSettings size={18} className={`${activeDropdown === provider.id ? 'rotate-90' : ''} transition-transform duration-300`} />
                    </button>

                    <AnimatePresence>
                      {activeDropdown === provider.id && (
                        <>
                          {/* Backdrop to close */}
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setActiveDropdown(null)}
                          />
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            className="absolute bottom-full right-0 mb-4 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-20 overflow-hidden"
                          >
                             <button className="w-full px-5 py-3 text-left text-xs font-bold text-gray-600 hover:bg-purple-50 hover:text-[#6b2bd9] transition-all flex items-center gap-3 group">
                                <FiSettings size={14} className="text-gray-300 group-hover:text-[#6b2bd9]" />
                                <span>Configure</span>
                             </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
               </div>
            </motion.div>
         ))}
      </div>
    </motion.div>
  );
};

const TaxProviders = ({ onBack }) => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [primaryProvider, setPrimaryProvider] = useState('Tax.FixedRate');
  const [providers] = useState([
    { id: 'Tax.Free', name: 'Free tax rate provider', description: 'Zero-rate fiscal calculation logic for tax-exempt regions.' },
    { id: 'Tax.FixedRate', name: 'Fixed Tax Rate', description: 'Standardized fiscal computation with unified tax brackets.' },
    { id: 'Tax.CountryStateZip', name: 'Tax By Region', description: 'Granular tax calculation based on geographical identifiers.' },
  ]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-gray-400 hover:text-[#6b2bd9] shadow-sm"
          >
            <FiArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Tax providers</h1>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.2em] mt-1">
              Fiscal Governance & Calculation Logic
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         {providers.map(provider => (
            <motion.div
              layout
              key={provider.id}
              className={`bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-xl hover:shadow-purple-100/20 group relative ${
                primaryProvider === provider.id ? 'ring-2 ring-emerald-500/10 bg-emerald-50/5' : ''
              }`}
            >
               {/* Color Accent Bar */}
               <div className={`h-1.5 w-full bg-gradient-to-r ${primaryProvider === provider.id ? 'from-emerald-400 to-green-500' : 'from-gray-100 to-gray-200'}`} />

               <div className="p-8 flex-1 space-y-6">
                  <div className="flex items-start justify-between">
                     <div className={`p-4 rounded-2xl shadow-lg border-2 ${
                        primaryProvider === provider.id 
                        ? 'bg-gradient-to-br from-emerald-500 to-green-600 text-white border-white/20' 
                        : 'bg-white text-gray-300 border-gray-50 shadow-gray-100'
                     }`}>
                        <FiShield size={32} />
                     </div>
                     <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100">
                        <div className={`w-1.5 h-1.5 rounded-full ${primaryProvider === provider.id ? 'bg-amber-500' : 'bg-gray-300'}`} />
                        <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">
                           {primaryProvider === provider.id ? 'Primary Provider' : 'Secondary'}
                        </span>
                     </div>
                  </div>

                  <div className="space-y-2">
                     <h3 className="text-base font-bold text-gray-800 tracking-tight">
                        {provider.name}
                     </h3>
                     <p className="text-[9px] font-bold text-[#6b2bd9]/40 uppercase tracking-widest leading-relaxed">
                        ID: {provider.id}
                     </p>
                  </div>

                  <p className="text-[11px] font-medium text-gray-400 leading-relaxed min-h-[44px]">
                     {provider.description}
                  </p>
               </div>

               <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between relative">
                  <button 
                     disabled={primaryProvider === provider.id}
                     onClick={() => setPrimaryProvider(provider.id)}
                     className={`px-6 py-3 rounded-2xl transition-all text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 active:scale-95 shadow-lg ${
                        primaryProvider === provider.id 
                        ? 'bg-white border border-gray-200 text-gray-400 cursor-default shadow-none' 
                        : 'bg-emerald-600 text-white shadow-emerald-200/50 hover:bg-emerald-700'
                     }`}
                  >
                     {primaryProvider === provider.id ? (
                        <>
                           <span>Is primary provider</span>
                        </>
                     ) : (
                        <>
                           <FiCheck size={14} />
                           <span>Mark as primary provider</span>
                        </>
                     )}
                  </button>
                  
                  <div className="relative">
                    <button 
                      onClick={() => setActiveDropdown(activeDropdown === provider.id ? null : provider.id)}
                      className="p-3 bg-white text-gray-400 rounded-xl hover:text-[#6b2bd9] hover:bg-purple-50 transition-all shadow-sm border border-gray-100 active:scale-95"
                    >
                       <FiSettings size={18} className={`${activeDropdown === provider.id ? 'rotate-90' : ''} transition-transform duration-300`} />
                    </button>

                    <AnimatePresence>
                      {activeDropdown === provider.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)} />
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            className="absolute bottom-full right-0 mb-4 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-20 overflow-hidden"
                          >
                             <button className="w-full px-5 py-3 text-left text-xs font-bold text-gray-600 hover:bg-purple-50 hover:text-[#6b2bd9] transition-all flex items-center gap-3 group">
                                <FiSettings size={14} className="text-gray-300 group-hover:text-[#6b2bd9]" />
                                <span>Configure</span>
                             </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
               </div>
            </motion.div>
         ))}
      </div>
    </motion.div>
  );
};

const TaxCategories = ({ onBack, onAdd, onEdit, onDelete, onDeleteSelected, data }) => {
  const [selectedIds, setSelectedIds] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ name: '', order: '' });
  
  const handleSelectItem = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === data.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(data.map(item => item.id));
    }
  };

  const filteredData = data.filter(item => {
    return (
      item.name.toLowerCase().includes(filters.name.toLowerCase()) &&
      (filters.order === '' || item.order.toString().includes(filters.order))
    );
  });

  const columns = [
    {
      key: 'checkbox',
      label: (
        <input 
          type="checkbox" 
          checked={data.length > 0 && selectedIds.length === data.length}
          onChange={handleSelectAll}
          className="w-4 h-4 rounded border-gray-300 text-[#6b2bd9] focus:ring-[#6b2bd9] cursor-pointer" 
        />
      ),
      render: (_, row) => (
        <input 
          type="checkbox" 
          checked={selectedIds.includes(row.id)}
          onChange={() => handleSelectItem(row.id)}
          className="w-4 h-4 rounded border-gray-300 text-[#6b2bd9] focus:ring-[#6b2bd9] cursor-pointer" 
        />
      )
    },
    { key: 'name', label: 'Name', render: (v) => <span className="font-bold text-gray-800">{v}</span> },
    { key: 'order', label: 'Display order', render: (v) => <span className="text-gray-500 font-bold text-[10px]">{v}</span> },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-2">
          <button 
             onClick={() => onEdit(row)}
             className="p-2 bg-purple-50 text-[#6b2bd9] rounded-xl hover:bg-[#6b2bd9] hover:text-white transition-all shadow-sm active:scale-95"
          >
            <FiEdit3 size={14} />
          </button>
          <button 
             onClick={() => onDelete(row.id)}
             className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-95"
          >
            <FiTrash2 size={14} />
          </button>
        </div>
      )
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-gray-400 hover:text-[#6b2bd9] shadow-sm"
          >
            <FiArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Tax categories</h1>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.2em] mt-1">
              Fiscal Classifications & Grouping
            </p>
          </div>
        </div>
        <button 
          onClick={onAdd}
          className="px-8 py-2.5 bg-[#6b2bd9] text-white rounded-2xl hover:bg-[#5b24b7] transition-all text-sm font-bold flex items-center gap-2 shadow-lg shadow-purple-200/50 active:scale-95"
        >
          <FiPlus size={18} />
          <span>Add New</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
        {/* Table Header / Actions Consolidated */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 pr-4 border-r border-gray-100 mr-2">
                <div className="p-1.5 bg-primary-50 text-[#6b2bd9] rounded-lg">
                   <FiList size={16} />
                </div>
                <span className="text-sm font-bold text-gray-700 tracking-tight">Manage Categories</span>
             </div>
          </div>
          
          <div className="flex items-center gap-4">
             <button 
                onClick={() => {
                  onDeleteSelected(selectedIds);
                  setSelectedIds([]);
                }}
                disabled={selectedIds.length === 0}
                className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all px-4 ${
                  selectedIds.length > 0 ? 'text-red-500 hover:text-red-600' : 'text-gray-300 pointer-events-none'
                }`}
              >
                <FiTrash2 size={14} />
                <span>Delete selected ({selectedIds.length})</span>
             </button>
             <button 
               onClick={() => setShowFilters(!showFilters)}
               className={`px-8 py-2.5 rounded-2xl transition-all text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg active:scale-95 ${
                 showFilters ? 'bg-[#6b2bd9] text-white shadow-purple-100' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm'
               }`}
             >
                <FiFilter size={16} />
                <span>Filter</span>
             </button>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-b border-gray-100 bg-gray-50/30"
            >
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-1 text-left block">Name</label>
                  <input
                    type="text"
                    placeholder="Search by name..."
                    value={filters.name}
                    onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                    className="w-full px-5 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] outline-none transition-all shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 text-left block">Display Order</label>
                  <input
                    type="text"
                    placeholder="Search by order..."
                    value={filters.order}
                    onChange={(e) => setFilters({ ...filters, order: e.target.value })}
                    className="w-full px-5 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] outline-none transition-all shadow-sm"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-0 overflow-x-auto flex-1 bg-white">
          <DataTable 
            data={filteredData}
            columns={columns}
            className="border-none shadow-none rounded-none"
          />
          {filteredData.length === 0 && (
            <div className="py-24 text-center">
               <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-200 mx-auto mb-4">
                  <FiList size={32} />
               </div>
               <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No matching categories found</p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 bg-gray-50/30">
           <div className="flex items-center gap-8">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                Displaying 1 - {filteredData.length} of {filteredData.length} items
              </p>
              <div className="flex items-center gap-2">
                 <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Items per page:</span>
                 <select className="bg-transparent text-[10px] font-bold text-gray-600 uppercase tracking-widest outline-none cursor-pointer">
                    <option>10</option>
                    <option>25</option>
                    <option>50</option>
                 </select>
              </div>
           </div>
        </div>
      </div>
    </motion.div>
  );
};

const TaxCategoryForm = ({ onBack, onSave, initialData }) => {
  const isEdit = !!initialData;
  const [formData, setFormData] = useState({
    name: '',
    order: 0,
    ...(initialData || {})
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6 pb-20"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-gray-400 hover:text-[#6b2bd9] shadow-sm active:scale-95"
          >
            <FiArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              {isEdit ? `Edit tax category - ${formData.name}` : 'Add a new tax category'}
            </h1>
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
            className="px-8 py-2.5 bg-[#6b2bd9] text-white rounded-xl hover:bg-[#5b24b7] transition-all text-sm font-bold flex items-center gap-2 shadow-lg shadow-purple-200/50 active:scale-95"
          >
            <FiCheck size={18} />
            <span>Save</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-sm overflow-hidden p-8 lg:p-12 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
           <div className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                  <FiType className="text-gray-300" /> Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] outline-none transition-all placeholder:text-gray-300"
                  placeholder="Enter name..."
                />
              </div>
           </div>

           <div className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                  <FiList className="text-gray-300" /> Display Order
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] outline-none transition-all"
                />
              </div>
           </div>
        </div>
      </div>
    </motion.div>
  );
};

const ShippingMethods = ({ onBack, onAdd, onEdit, onDelete, data, onDeleteSelected }) => {
  const [selectedIds, setSelectedIds] = useState([]);
  
  const handleSelectItem = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === data.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(data.map(item => item.id));
    }
  };

  const columns = [
    {
      key: 'checkbox',
      label: (
        <input 
          type="checkbox" 
          checked={data.length > 0 && selectedIds.length === data.length}
          onChange={handleSelectAll}
          className="w-4 h-4 rounded border-gray-300 text-[#6b2bd9] focus:ring-[#6b2bd9] cursor-pointer" 
        />
      ),
      render: (_, row) => (
        <input 
          type="checkbox" 
          checked={selectedIds.includes(row.id)}
          onChange={() => handleSelectItem(row.id)}
          className="w-4 h-4 rounded border-gray-300 text-[#6b2bd9] focus:ring-[#6b2bd9] cursor-pointer" 
        />
      )
    },
    { key: 'name', label: 'Name', render: (v) => <span className="font-bold text-[#6b2bd9] hover:underline cursor-pointer">{v}</span> },
    { key: 'description', label: 'Description', render: (v) => <span className="text-gray-400 font-medium text-[11px] leading-relaxed max-w-xs block">{v || '—'}</span> },
    { key: 'rules', label: 'Number of rules', render: (v) => <span className="text-gray-500 font-bold text-[10px]">{v}</span> },
    { key: 'limited', label: 'Limited to stores', render: (v) => <span className="text-gray-400 font-black text-[10px] tracking-widest">{v}</span> },
    { 
      key: 'noCharges', 
      label: 'No additional charges', 
      render: (v) => v ? <FiCheck className="text-green-500 mx-auto" size={16} /> : <span className="text-gray-200 mx-auto">—</span> 
    },
    { key: 'order', label: 'Display order', render: (v) => <span className="text-gray-500 font-bold text-[10px]">{v}</span> },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button 
             onClick={() => onEdit(row)}
             title="Edit Method"
             className="p-2 bg-purple-50 text-[#6b2bd9] rounded-xl hover:bg-[#6b2bd9] hover:text-white transition-all shadow-sm active:scale-95"
          >
            <FiEdit3 size={14} />
          </button>
          <button 
             onClick={() => onDelete(row.id)}
             title="Delete Method"
             className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-95"
          >
            <FiTrash2 size={14} />
          </button>
        </div>
      )
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-gray-400 hover:text-[#6b2bd9] shadow-sm"
          >
            <FiArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Shipping Methods</h1>
          </div>
        </div>
        <button 
          onClick={onAdd}
          className="px-8 py-2.5 bg-[#6b2bd9] text-white rounded-2xl hover:bg-[#5b24b7] transition-all text-sm font-bold flex items-center gap-2 shadow-lg shadow-purple-200/50 active:scale-95"
        >
           <FiPlus size={18} />
           <span>Add New</span>
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
        {/* Actions Bar */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 pr-4 border-r border-gray-100 mr-2">
                 <div className="p-1.5 bg-primary-50 text-[#6b2bd9] rounded-lg">
                    <FiBox size={16} />
                 </div>
                 <span className="text-sm font-bold text-gray-700 tracking-tight">Manage Logistics</span>
              </div>
           </div>

           <button 
              onClick={() => {
                 if (selectedIds.length > 0) {
                    onDeleteSelected(selectedIds);
                    setSelectedIds([]);
                 }
              }}
              disabled={selectedIds.length === 0}
              className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all px-4 active:scale-95 group ${
                selectedIds.length > 0 ? 'text-red-500 hover:text-red-600' : 'text-gray-300'
              }`}
           >
              <FiTrash2 size={14} className={selectedIds.length > 0 ? 'group-hover:animate-pulse' : ''} />
              <span>Delete selected</span>
           </button>
        </div>

        <div className="p-4 flex-1">
          <DataTable 
            data={data}
            columns={columns}
            className="border-none shadow-none"
          />
        </div>
      </div>
    </motion.div>
  );
};

const RegionalSettings = () => {
  const [view, setView] = useState('hub');
  const [editingItem, setEditingItem] = useState(null);
  const [currencies, setCurrencies] = useState([]);
  const [shippingMethods, setShippingMethods] = useState([
    { id: 1, name: 'In-Store Pickup', description: 'Pick up your items at the store', rules: 0, limited: '—', noCharges: false, order: 0 },
    { id: 2, name: 'By Ground', description: 'Compared to other shipping methods, like by flight or over seas, ground shipping is carried out closer to the earth', rules: 0, limited: '—', noCharges: false, order: 1 },
    { id: 3, name: 'Free shipping', description: '', rules: 1, limited: '—', noCharges: true, order: 2 },
  ]);

  const [taxCategories, setTaxCategories] = useState([
    { id: 1, name: 'Tax free', order: 0 },
    { id: 2, name: 'Books', order: 1 },
  ]);

  const handleDeleteTaxCategory = (id) => {
    if (window.confirm('Are you sure you want to delete this tax category?')) {
       setTaxCategories(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleDeleteSelectedTaxCategories = (ids) => {
    if (window.confirm(`Are you sure you want to delete ${ids.length} selected tax categories?`)) {
       setTaxCategories(prev => prev.filter(c => !ids.includes(c.id)));
    }
  };

  const handleSaveTaxCategory = (formData, continueEdit) => {
    if (editingItem) {
       setTaxCategories(prev => prev.map(c => c.id === editingItem.id ? { ...formData, id: editingItem.id } : c));
    } else {
       const nextId = Math.max(...taxCategories.map(c => c.id), 0) + 1;
       setTaxCategories(prev => [...prev, { ...formData, id: nextId }]);
    }
    
    if (!continueEdit) {
       setEditingItem(null);
       setView('tax-categories');
    }
  };

  const handleSaveShippingMethod = (formData, continueEdit) => {
    if (editingItem) {
       setShippingMethods(prev => prev.map(m => m.id === editingItem.id ? { ...formData, id: editingItem.id } : m));
    } else {
       const nextId = Math.max(...shippingMethods.map(m => m.id), 0) + 1;
       setShippingMethods(prev => [...prev, { ...formData, id: nextId }]);
    }
    
    if (!continueEdit) {
       setEditingItem(null);
       setView('shipping-methods');
    }
  };

  const handleDeleteShippingMethod = (id) => {
    if (window.confirm('Are you sure you want to delete this shipping method?')) {
       setShippingMethods(prev => prev.filter(m => m.id !== id));
    }
  };

  const handleDeleteSelectedShippingMethods = (ids) => {
    if (window.confirm(`Are you sure you want to delete ${ids.length} selected shipping methods?`)) {
       setShippingMethods(prev => prev.filter(m => !ids.includes(m.id)));
    }
  };

  const handleDeleteCurrency = (id) => {
    if (window.confirm('Are you sure you want to delete this currency?')) {
       setCurrencies(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleDeleteSelectedCurrencies = (ids) => {
    if (window.confirm(`Are you sure you want to delete ${ids.length} selected currencies?`)) {
       setCurrencies(prev => prev.filter(c => !ids.includes(c.id)));
    }
  };

  const handleSaveCurrency = (formData, continueEdit) => {
     if (editingItem) {
        setCurrencies(prev => prev.map(c => c.id === editingItem.id ? { ...formData, id: editingItem.id } : c));
     } else {
        const nextId = Math.max(...currencies.map(c => c.id), 0) + 1;
        setCurrencies(prev => [...prev, { ...formData, id: nextId }]);
     }
     
     if (!continueEdit) {
        setEditingItem(null);
        setView('currencies');
     }
  };

  const sections = [
    {
      title: "Regional & Locale",
      items: [
        { title: "Countries", icon: FiMapPin, onClick: () => setView('countries') },
        { title: "Languages", icon: FiType, onClick: () => setView('languages') },
        { title: "Currencies", icon: FiDollarSign, onClick: () => setView('currencies') },
      ]
    },
    {
      title: "Shipping Configuration",
      items: [
        { title: "Shipping methods", icon: FiBox, onClick: () => setView('shipping-methods') },
        { title: "Shipping rate computation methods", icon: FiCpu, onClick: () => setView('shipping-rates') },
      ]
    },
    {
      title: "Tax Configuration",
      items: [
        { title: "Tax providers", icon: FiShield, onClick: () => setView('tax-providers') },
        { title: "Tax categories", icon: FiList, onClick: () => setView('tax-categories') },
      ]
    }
  ];

  if (view === 'tax-categories') {
    return (
       <TaxCategories 
          onBack={() => setView('hub')}
          onAdd={() => {
            setEditingItem(null);
            setView('tax-category-form');
          }}
          onEdit={(cat) => {
            setEditingItem(cat);
            setView('tax-category-form');
          }}
          onDelete={handleDeleteTaxCategory}
          onDeleteSelected={handleDeleteSelectedTaxCategories}
          data={taxCategories}
       />
    );
  }

  if (view === 'tax-category-form') {
    return (
      <TaxCategoryForm 
        onBack={() => {
          setEditingItem(null);
          setView('tax-categories');
        }}
        onSave={handleSaveTaxCategory}
        initialData={editingItem}
      />
    );
  }

  if (view === 'tax-providers') {
    return (
       <TaxProviders onBack={() => setView('hub')} />
    );
  }

  const handleDeleteCountry = (id) => {
    if (window.confirm('Are you sure you want to delete this country?')) {
        // In a real app, delete via API. For mock:
        console.log('Deleting country with id:', id);
    }
  };

  if (view === 'shipping-rates') {
    return (
      <ShippingRates 
        onBack={() => setView('hub')}
      />
    );
  }

  if (view === 'shipping-methods') {
    return (
      <ShippingMethods 
        onBack={() => setView('hub')}
        onAdd={() => { setEditingItem(null); setView('add-shipping-method'); }}
        onEdit={(item) => { setEditingItem(item); setView('edit-shipping-method'); }}
        onDelete={handleDeleteShippingMethod}
        onDeleteSelected={handleDeleteSelectedShippingMethods}
        data={shippingMethods}
      />
    );
  }

  if (view === 'add-shipping-method' || view === 'edit-shipping-method') {
    return (
      <ShippingMethodForm 
        onBack={() => setView('shipping-methods')}
        onSave={handleSaveShippingMethod}
        initialData={editingItem}
      />
    );
  }

  if (view === 'countries') {
    return (
      <Countries 
        onBack={() => setView('hub')} 
        onAdd={() => { setEditingItem(null); setView('add-country'); }} 
        onEdit={(country) => { setEditingItem(country); setView('edit-country'); }}
        onDelete={handleDeleteCountry}
      />
    );
  }

  if (view === 'languages') {
    return (
      <Languages 
        onBack={() => setView('hub')} 
        onAdd={() => { setEditingItem(null); setView('add-language'); }} 
        onEdit={(lang) => { setEditingItem(lang); setView('edit-language'); }}
      />
    );
  }

  if (view === 'currencies') {
    return (
      <Currencies 
         onBack={() => setView('hub')}
         onAdd={() => { setEditingItem(null); setView('add-currency'); }}
         onEdit={(currency) => { setEditingItem(currency); setView('edit-currency'); }}
         onDelete={handleDeleteCurrency}
         data={currencies}
      />
    );
  }

  if (view === 'add-language' || view === 'edit-language') {
    return <LanguageForm onBack={() => setView('languages')} onSave={() => setView('languages')} initialData={editingItem} />;
  }

  if (view === 'add-country' || view === 'edit-country') {
     return (
       <CountryForm 
          onBack={() => setView('countries')} 
          onSave={() => setView('countries')} 
          initialData={editingItem}
       />
     );
  }

  if (view === 'add-currency' || view === 'edit-currency') {
    return (
      <CurrencyForm 
        onBack={() => setView('currencies')}
        onSave={handleSaveCurrency}
        initialData={editingItem}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10 pb-20"
    >
      {/* Hub View removed main header for cleaner look per user request */}


      {/* Main Container */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden p-8 lg:p-12">
        <div className="space-y-12">
          {sections.map((section, idx) => (
            <SettingGroup 
              key={idx}
              title={section.title}
              items={section.items}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const Currencies = ({ onBack, onAdd, onEdit, onDelete, onDeleteSelected, data }) => {
  const [activeTab, setActiveTab] = useState('Currencies');
  const [selectedIds, setSelectedIds] = useState([]);
  const tabs = ['Currencies', 'Live currency rates'];

  const handleSelectItem = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === data.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(data.map(item => item.id));
    }
  };

  const columns = [
    {
      key: 'checkbox',
      label: (
        <input 
          type="checkbox" 
          checked={data.length > 0 && selectedIds.length === data.length}
          onChange={handleSelectAll}
          className="w-4 h-4 rounded border-gray-300 text-[#6b2bd9] focus:ring-[#6b2bd9] cursor-pointer" 
        />
      ),
      render: (_, row) => (
        <input 
          type="checkbox" 
          checked={selectedIds.includes(row.id)}
          onChange={() => handleSelectItem(row.id)}
          className="w-4 h-4 rounded border-gray-300 text-[#6b2bd9] focus:ring-[#6b2bd9] cursor-pointer" 
        />
      )
    },
    { 
      key: 'name', 
      label: 'Name', 
      render: (v, row) => (
        <div className="flex items-center gap-2">
          {row.isPrimary && (
            <span className="px-2 py-0.5 bg-orange-50 text-orange-600 text-[8px] font-bold uppercase tracking-widest rounded-md border border-orange-100">
              Primary currency
            </span>
          )}
          {row.isExchange && (
            <span className="px-2 py-0.5 bg-teal-50 text-teal-600 text-[8px] font-bold uppercase tracking-widest rounded-md border border-teal-100">
              Exchange rate currency
            </span>
          )}
          <span className="font-bold text-gray-700">{v}</span>
        </div>
      ) 
    },
    { key: 'code', label: 'Currency Code', render: (v) => <span className="text-gray-400 font-medium">{v}</span> },
    { 
      key: 'published', 
      label: 'Published', 
      render: (v) => (
        <div className="flex justify-center">
          {v ? <FiCheck className="text-green-500" size={16} /> : <FiMinus className="text-gray-200" size={16} /> }
        </div>
      )
    },
    { key: 'rate', label: 'Rate', render: (v) => <span className="text-gray-500 font-black text-[10px] tracking-widest">{v}</span> },
    { key: 'order', label: 'Display Order', render: (v) => <span className="text-gray-500 font-bold text-[10px]">{v}</span> },
    { key: 'limited', label: 'Limited to stores', render: (v) => <span className="text-gray-400 font-black text-[10px] tracking-widest">{v || '—'}</span> },
    { key: 'domains', label: 'Domain Endings', render: (v) => <span className="text-gray-400 font-black text-[10px] tracking-widest">{v || '—'}</span> },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button 
             onClick={() => onEdit(row)}
             title="Edit Currency"
             className="p-2 bg-purple-50 text-[#6b2bd9] rounded-xl hover:bg-[#6b2bd9] hover:text-white transition-all shadow-sm active:scale-95"
          >
            <FiEdit3 size={14} />
          </button>
          <button 
             title="Set as Primary Currency"
             className="p-2 bg-orange-50 text-orange-500 rounded-xl hover:bg-orange-500 hover:text-white transition-all shadow-sm active:scale-95"
          >
            <FiStar size={14} />
          </button>
          <button 
             title="Set as Exchange Rate Currency"
             className="p-2 bg-teal-50 text-teal-600 rounded-xl hover:bg-teal-500 hover:text-white transition-all shadow-sm active:scale-95"
          >
            <FiRefreshCw size={14} />
          </button>
          <button 
             onClick={() => onDelete(row.id)}
             title="Delete Currency"
             className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-95"
          >
            <FiTrash2 size={14} />
          </button>
        </div>
      )
    }
  ];

  const liveRateColumns = [
    { key: 'name', label: 'Name', render: (v) => <span className="font-bold text-gray-700">{v}</span> },
    { key: 'code', label: 'Currency Code', render: (v) => <span className="text-gray-400 font-medium">{v}</span> },
    { key: 'rate', label: 'Rate', render: (v) => <span className="text-gray-500 font-black text-[10px] tracking-widest">{v}</span> },
    { key: 'updated', label: 'Updated', render: (v) => <span className="text-gray-400 font-bold text-[10px] uppercase tracking-widest leading-relaxed">{v}</span> },
    {
      key: 'actions',
      label: 'Actions',
      render: () => (
        <button className="px-4 py-2 bg-purple-50 text-[#6b2bd9] rounded-xl hover:bg-[#6b2bd9] hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-sm active:scale-95">
          <FiSettings size={14} />
          <span>Apply Rate</span>
        </button>
      )
    }
  ];

  const liveRateData = [];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-gray-400 hover:text-[#6b2bd9] shadow-sm"
          >
            <FiArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Currencies</h1>
          </div>
        </div>
        <button 
          onClick={onAdd}
          className="px-8 py-2.5 bg-[#6b2bd9] text-white rounded-2xl hover:bg-[#5b24b7] transition-all text-sm font-bold flex items-center gap-2 shadow-lg shadow-purple-200/50 active:scale-95"
        >
           <FiPlus size={18} />
           <span>Add New</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-100 pb-0.5">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-[11px] font-bold uppercase tracking-widest transition-all relative ${
              activeTab === tab ? 'text-[#6b2bd9]' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div 
                layoutId="activeTabUnderline"
                className="absolute bottom-0 left-6 right-6 h-0.5 bg-[#6b2bd9] rounded-full"
              />
            )}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
        {/* Actions Bar */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 pr-4 border-r border-gray-100 mr-2">
                 <div className="p-1.5 bg-primary-50 text-[#6b2bd9] rounded-lg">
                    <FiDollarSign size={16} />
                 </div>
                 <span className="text-sm font-bold text-gray-700 tracking-tight">
                    {activeTab === 'Currencies' ? 'Manage Currencies' : 'Live Market Feed'}
                 </span>
              </div>
           </div>

           {activeTab === 'Currencies' && (
             <button 
                onClick={() => {
                   if (selectedIds.length > 0) {
                      onDeleteSelected(selectedIds);
                      setSelectedIds([]);
                   }
                }}
                className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all px-4 active:scale-95 group ${
                   selectedIds.length > 0 ? 'text-red-500 hover:text-red-600' : 'text-gray-300 cursor-not-allowed'
                }`}
             >
                <FiTrash2 size={14} className={selectedIds.length > 0 ? 'group-hover:animate-pulse' : ''} />
                <span>Delete selected</span>
             </button>
           )}
        </div>

        <div className="p-4 flex-1">
          <DataTable 
            data={activeTab === 'Currencies' ? data : liveRateData}
            columns={activeTab === 'Currencies' ? columns : liveRateColumns}
            className="border-none shadow-none"
          />
        </div>
      </div>
    </motion.div>
  );
};

const CurrencyForm = ({ onBack, onSave, initialData = null }) => {
  const isEdit = !!initialData;
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    rate: 1.00,
    displayLocale: 'en-US',
    customFormatting: '',
    domainEndings: '',
    published: true,
    displayOrder: 0,
    limitedToStores: 'All stores',
    decimals: 2,
    midpointRounding: 'Commercial rounding (recommended)',
    roundAllItemAmounts: 'Unspecified',
    roundTotalAmount: false,
    ...(initialData || {})
  });

  const handleToggle = (field) => {
    setFormData(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6 pb-20"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-gray-400 hover:text-[#6b2bd9] shadow-sm"
          >
            <FiArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              {isEdit ? `Edit currency - ${formData.name}` : 'Add a new currency'}
            </h1>
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
            className="px-8 py-2.5 bg-[#6b2bd9] text-white rounded-xl hover:bg-[#5b24b7] transition-all text-sm font-bold flex items-center gap-2 shadow-lg shadow-purple-200/50 active:scale-95"
          >
            <FiCheck size={18} />
            <span>Save</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-sm overflow-hidden p-8 lg:p-12 space-y-12">
        {/* Basic Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                <FiType className="text-gray-300" /> Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setValue(formData, 'name', e.target.value)}
                className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                <FiCode className="text-gray-300" /> Currency Code
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] outline-none transition-all placeholder:text-gray-300"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                <FiDollarSign className="text-gray-300" /> Rate
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.rate}
                onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                <FiGlobe className="text-gray-300" /> Display Locale
              </label>
              <select
                value={formData.displayLocale}
                onChange={(e) => setFormData({ ...formData, displayLocale: e.target.value })}
                className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] outline-none transition-all cursor-pointer appearance-none"
              >
                <option value="en-US">English (United States) [en-US]</option>
                <option value="en-GB">English (United Kingdom) [en-GB]</option>
                <option value="es-ES">Spanish (Spain) [es-ES]</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                <FiHash className="text-gray-300" /> Custom Formatting
              </label>
              <input
                type="text"
                value={formData.customFormatting}
                onChange={(e) => setFormData({ ...formData, customFormatting: e.target.value })}
                className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                <FiLink className="text-gray-300" /> Domain Endings
              </label>
              <input
                type="text"
                value={formData.domainEndings}
                onChange={(e) => setFormData({ ...formData, domainEndings: e.target.value })}
                className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] outline-none transition-all"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 border-t border-gray-50 pt-10">
          <div className="space-y-8">
            <div className="flex items-center justify-between p-6 bg-gray-50/50 rounded-3xl border border-gray-100">
              <div className="space-y-1">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Published</h4>
                <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-[0.2em]">Live on Storefront</p>
              </div>
              <button 
                onClick={() => handleToggle('published')}
                className={`w-14 h-8 rounded-full transition-all relative flex items-center ${
                  formData.published ? 'bg-orange-400' : 'bg-gray-200'
                }`}
              >
                <div className={`w-6 h-6 bg-white rounded-full shadow-sm absolute transition-all ${
                  formData.published ? 'right-1' : 'left-1'
                }`} />
              </button>
            </div>
          </div>

          <div className="space-y-8">
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Display Order</label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                    className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Limited to stores</label>
                  <select
                    value={formData.limitedToStores}
                    onChange={(e) => setFormData({ ...formData, limitedToStores: e.target.value })}
                    className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 outline-none cursor-pointer appearance-none"
                  >
                    <option>All stores</option>
                  </select>
                </div>
             </div>
          </div>
        </div>

        {/* Round Section */}
        <div className="space-y-10 border-t-2 border-gray-50 pt-12">
           <div className="flex items-center gap-4">
              <div className="p-2.5 bg-blue-50 text-blue-500 rounded-xl shadow-sm border border-blue-100">
                 <FiTarget size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest">Rounding Governance</h3>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.2em] mt-1">
                  Accounting Logic & Precision Calibration
                </p>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                    <FiHash className="text-gray-300" /> Number of decimal digits
                  </label>
                  <input
                    type="number"
                    value={formData.decimals}
                    onChange={(e) => setFormData({ ...formData, decimals: e.target.value })}
                    className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                    <FiLayers className="text-gray-300" /> Midpoint rounding
                  </label>
                  <select
                    value={formData.midpointRounding}
                    onChange={(e) => setFormData({ ...formData, midpointRounding: e.target.value })}
                    className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 outline-none cursor-pointer appearance-none"
                  >
                    <option>Commercial rounding (recommended)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                    <FiArchive className="text-gray-300" /> Round all order item amounts
                  </label>
                  <select
                    value={formData.roundAllItemAmounts}
                    onChange={(e) => setFormData({ ...formData, roundAllItemAmounts: e.target.value })}
                    className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 outline-none cursor-pointer appearance-none"
                  >
                    <option>Unspecified</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-6 bg-gray-50/50 rounded-3xl border border-gray-100 mt-2">
                  <div className="space-y-1">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Round order total amount</h4>
                    <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-[0.2em]">Final Summary Logic</p>
                  </div>
                  <button 
                    onClick={() => handleToggle('roundTotalAmount')}
                    className={`w-14 h-8 rounded-full transition-all relative flex items-center ${
                      formData.roundTotalAmount ? 'bg-[#6b2bd9]' : 'bg-gray-200'
                    }`}
                  >
                    <div className={`w-6 h-6 bg-white rounded-full shadow-sm absolute transition-all ${
                      formData.roundTotalAmount ? 'right-1' : 'left-1'
                    }`} />
                  </button>
                </div>
              </div>
           </div>
        </div>
      </div>
    </motion.div>
  );
};

const LanguageForm = ({ onBack, onSave, initialData = null }) => {
  const isEdit = !!initialData;
  const [formData, setFormData] = useState({
    name: '',
    culture: 'en-US',
    seoCode: 'en',
    flag: '🇺🇸 Afghanistan [af]',
    rtl: false,
    published: true,
    displayOrder: 1,
    limitedToStores: 'All',
    ...(initialData || {})
  });

  const handleToggle = (field) => {
    setFormData(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6 pb-20"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-gray-400 hover:text-[#6b2bd9] shadow-sm"
          >
            <FiArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              {isEdit ? `Edit language - ${formData.name}` : 'Add a new language'}
            </h1>
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
            className="px-8 py-2.5 bg-[#6b2bd9] text-white rounded-xl hover:bg-[#5b24b7] transition-all text-sm font-bold flex items-center gap-2 shadow-lg shadow-purple-200/50 active:scale-95"
          >
            <FiCheck size={18} />
            <span>Save</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-8 lg:p-12 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
             {/* Text Controls */}
             <div className="space-y-8">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                    <FiType className="text-gray-300" /> Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] outline-none transition-all"
                  />
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                    <FiGlobe className="text-gray-300" /> Language Culture
                  </label>
                  <select
                    value={formData.culture}
                    onChange={(e) => setFormData({ ...formData, culture: e.target.value })}
                    className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] outline-none transition-all cursor-pointer appearance-none"
                  >
                    <option value="en-US">English (United States) [en-US]</option>
                    <option value="de-DE">German (Germany) [de-DE]</option>
                    <option value="fr-FR">French (France) [fr-FR]</option>
                  </select>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                    <FiHash className="text-gray-300" /> Unique SEO Code
                  </label>
                  <select
                    value={formData.seoCode}
                    onChange={(e) => setFormData({ ...formData, seoCode: e.target.value })}
                    className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] outline-none transition-all cursor-pointer appearance-none"
                  >
                    <option value="en">English [en]</option>
                    <option value="de">German [de]</option>
                    <option value="fr">French [fr]</option>
                  </select>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                    <FiGlobe className="text-gray-300" /> Flag Image
                  </label>
                  <select
                    value={formData.flag}
                    onChange={(e) => setFormData({ ...formData, flag: e.target.value })}
                    className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] outline-none transition-all cursor-pointer appearance-none"
                  >
                    <option value="🇺🇸 United States [us]">🇺🇸 United States</option>
                    <option value="🇩🇪 Germany [de]">🇩🇪 Germany</option>
                    <option value="🇫🇷 France [fr]">🇫🇷 France</option>
                  </select>
               </div>
             </div>

             {/* Toggles & Numbers */}
             <div className="space-y-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                   {[
                     { id: 'published', label: 'Published', icon: <FiEye /> },
                     { id: 'rtl', label: 'Right-to-Left', icon: <FiLayout /> },
                   ].map(item => (
                     <button
                       key={item.id}
                       onClick={() => handleToggle(item.id)}
                       className={`p-6 rounded-[2rem] border flex flex-col gap-4 transition-all group ${
                         formData[item.id] 
                         ? 'bg-purple-50/50 border-purple-100 ring-2 ring-purple-100/30 shadow-sm shadow-purple-50' 
                         : 'bg-white border-gray-100 hover:border-gray-200'
                       }`}
                     >
                       <div className={`p-4 rounded-2xl w-fit transition-all ${
                         formData[item.id] ? 'bg-[#6b2bd9] text-white shadow-lg shadow-purple-200' : 'bg-gray-50 text-gray-400'
                       }`}>
                         {item.icon}
                       </div>
                       <div className="text-left">
                         <span className={`text-[11px] font-bold uppercase tracking-widest ${
                           formData[item.id] ? 'text-[#6b2bd9]' : 'text-gray-400'
                         }`}>
                           {item.label}
                         </span>
                         <div className="flex items-center gap-2 mt-1">
                            <div className={`w-1.5 h-1.5 rounded-full ${formData[item.id] ? 'bg-[#6b2bd9] animate-pulse' : 'bg-gray-200'}`} />
                            <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">
                              {formData[item.id] ? 'Currently Enabled' : 'Disabled'}
                            </p>
                         </div>
                       </div>
                     </button>
                   ))}
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                      <FiSettings className="text-gray-300" /> Display Order
                    </label>
                    <input
                      type="number"
                      value={formData.displayOrder}
                      onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
                      className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                      <FiList className="text-gray-300" /> Limited to Stores
                    </label>
                    <select
                      value={formData.limitedToStores}
                      onChange={(e) => setFormData({ ...formData, limitedToStores: e.target.value })}
                      className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] outline-none transition-all cursor-pointer appearance-none"
                    >
                      <option value="All">All Stores</option>
                      <option value="Main">Main Store</option>
                      <option value="Regional">Regional Store</option>
                    </select>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Languages = ({ onBack, onAdd, onEdit }) => {
  const installedColumns = [
    { 
      key: 'name', 
      label: 'Name', 
      render: (v, row) => (
        <div className="flex items-center gap-3">
          <span className="text-lg">{row.flag}</span>
          <span className="font-bold text-gray-700">{v}</span>
        </div>
      ) 
    },
    { key: 'culture', label: 'Language Culture', render: (v) => <span className="text-gray-400 font-medium">{v}</span> },
    { key: 'seoCode', label: 'Unique SEO Code', render: (v) => <span className="text-gray-400 font-medium">{v}</span> },
    { 
      key: 'published', 
      label: 'Published', 
      render: (v) => v ? <FiCheck className="text-green-500 mx-auto" size={16} /> : <FiMinus className="text-gray-200 mx-auto" size={16} /> 
    },
    { key: 'lastImport', label: 'Last Import', render: (v) => <span className="text-gray-400 font-black text-[10px] tracking-widest">{v || '—'}</span> },
    { key: 'limited', label: 'Limited to stores', render: (v) => <span className="text-gray-400 font-black text-[10px] tracking-widest">{v || '—'}</span> },
    { key: 'order', label: 'Display Order', render: (v) => <span className="text-gray-500 font-black text-[10px]">{v}</span> },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-purple-50 text-[#6b2bd9] rounded-xl hover:bg-[#6b2bd9] hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-sm active:scale-95">
            <FiType size={14} />
            <span>View string resources</span>
          </button>
          <button 
             onClick={() => onEdit(row)}
             className="p-2 bg-gray-50 text-gray-400 rounded-xl hover:bg-[#6b2bd9] hover:text-white transition-all shadow-sm active:scale-95"
          >
            <FiEdit3 size={14} />
          </button>
        </div>
      )
    }
  ];

  const availableColumns = [
    { 
      key: 'name', 
      label: 'Name', 
      render: (v, row) => (
        <div className="flex items-center gap-3">
          <span className="text-lg">{row.flag}</span>
          <span className="font-bold text-gray-700">{v}</span>
        </div>
      ) 
    },
    { key: 'culture', label: 'Language Culture', render: (v) => <span className="text-gray-400 font-medium">{v}</span> },
    { key: 'seoCode', label: 'Unique SEO Code', render: (v) => <span className="text-gray-400 font-medium">{v}</span> },
    { 
      key: 'published', 
      label: 'Published', 
      render: (v) => v ? <FiCheck className="text-green-500 mx-auto" size={16} /> : <FiMinus className="text-gray-200 mx-auto" size={16} /> 
    },
    { key: 'updated', label: 'Updated', render: (v) => <span className="text-gray-400 font-black text-[10px] tracking-widest">{v}</span> },
    { 
       key: 'translated', 
       label: 'Translated', 
       render: (v) => (
         <div className="flex items-center gap-2">
           <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
             <div className="h-full bg-[#6b2bd9]" style={{ width: v }} />
           </div>
           <span className="text-gray-500 font-black text-[10px]">{v}</span>
         </div>
       )
    },
    {
      key: 'action',
      label: 'Action',
      render: () => (
        <button className="px-5 py-2.5 bg-[#6b2bd9] text-white rounded-2xl hover:bg-[#5b24b7] transition-all text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-purple-100 active:scale-95">
          <FiDownload size={14} />
          <span>Download</span>
        </button>
      )
    }
  ];

  const installedData = [];
  const availableData = [];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-gray-400 hover:text-[#6b2bd9] shadow-sm"
          >
            <FiArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Languages</h1>
          </div>
        </div>
        <button 
          onClick={onAdd}
          className="px-8 py-2.5 bg-[#6b2bd9] text-white rounded-2xl hover:bg-[#5b24b7] transition-all text-sm font-bold flex items-center gap-2 shadow-lg shadow-purple-200/50 active:scale-95"
        >
           <FiPlus size={18} />
           <span>Add New</span>
        </button>
      </div>

      <div className="space-y-12">
        {/* Installed Languages */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 px-2">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest">Installed Languages</h3>
          </div>
          
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-3xl flex items-center gap-4 shadow-sm">
             <div className="p-2.5 bg-white rounded-2xl text-blue-500 shadow-sm ring-4 ring-blue-100/30">
               <FiInfo size={20} />
             </div>
             <p className="text-[11px] font-semibold text-blue-900/60 uppercase tracking-widest leading-relaxed">
               The default language of the shop is <span className="text-blue-900">English</span>. The default is always the first published language.
             </p>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-sm overflow-hidden p-6">
            <DataTable 
              data={installedData}
              columns={installedColumns}
              className="border-none shadow-none"
            />
          </div>
        </section>

        {/* Available Languages */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 px-2">
            <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">Available Languages</h3>
          </div>
          
          <div className="p-4 bg-purple-50 border border-purple-100 rounded-3xl flex items-center gap-4 shadow-sm">
             <div className="p-2.5 bg-white rounded-2xl text-[#6b2bd9] shadow-sm ring-4 ring-purple-100/30">
               <FiInfo size={20} />
             </div>
             <p className="text-[11px] font-bold text-purple-900/60 uppercase tracking-widest leading-relaxed">
               Click <span className="text-[#6b2bd9]">Download</span> to install a new language including all localized resources. On <span className="text-[#6b2bd9] underline cursor-pointer">translate.TruBuy.com</span> you will find more details.
             </p>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-sm overflow-hidden p-6">
            <DataTable 
              data={availableData}
              columns={availableColumns}
              className="border-none shadow-none"
            />
          </div>
        </section>
      </div>
    </motion.div>
  );
};

export default RegionalSettings;
