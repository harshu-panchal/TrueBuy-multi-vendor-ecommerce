import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiList, 
  FiClock, 
  FiLayers, 
  FiTarget, 
  FiMaximize, 
  FiTag, 
  FiChevronRight,
  FiArrowLeft,
  FiSettings,
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiCheck,
  FiMinus,
  FiSave,
  FiType,
  FiSearch,
  FiFilter
} from 'react-icons/fi';
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

const QuantityUnitsList = ({ onBack, onAdd, onEdit, onDelete, data }) => {
  const columns = [
    { key: 'id', label: 'ID', render: (v) => <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{v}</span> },
    { key: 'name', label: 'Name', render: (v) => <span className="font-bold text-gray-800">{v}</span> },
    { key: 'namePlural', label: 'Name plural', render: (v) => <span className="font-bold text-gray-400 uppercase text-[10px] tracking-widest">{v}</span> },
    { 
      key: 'description', 
      label: 'Description', 
      render: (v) => <p className="text-[11px] text-gray-400 font-semibold max-w-xs truncate">{v || '—'}</p> 
    },
    { key: 'order', label: 'Display order', render: (v) => <span className="text-[#6b2bd9] font-black text-[10px]">{v}</span> },
    { 
      key: 'isDefault', 
      label: 'Is default', 
      render: (v) => (
        <div className={`p-1 w-fit rounded-full shadow-sm ${v ? 'bg-green-50 text-green-500 shadow-green-100' : 'bg-red-50 text-red-300 shadow-red-100'}`}>
          {v ? <FiCheck size={12} /> : <FiMinus size={12} className="rotate-45" />}
        </div>
      )
    },
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
      className="space-y-6"
    >
       <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-gray-400 hover:text-[#6b2bd9] shadow-sm active:scale-95"
            >
              <FiArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Quantity Units</h1>
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

       <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-sm overflow-hidden p-6 lg:p-8">
          <DataTable 
             data={data}
             columns={columns}
             className="border-none shadow-none"
          />
       </div>
    </motion.div>
  );
};

const DeliveryTimesList = ({ onBack, onAdd, onEdit, onDelete, data }) => {
  const columns = [
    { key: 'id', label: 'ID', render: (v) => <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{v}</span> },
    { key: 'name', label: 'Display name', render: (v) => <span className="font-bold text-gray-800">{v}</span> },
    { 
      key: 'color', 
      label: 'Color', 
      render: (v) => (
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full shadow-inner border border-gray-100" style={{ backgroundColor: v || '#e2e8f0' }} />
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-mono">{v}</span>
        </div>
      )
    },
    { 
      key: 'isDefault', 
      label: 'Is default', 
      render: (v) => (
        <div className={`p-1 w-fit rounded-full shadow-sm ${v ? 'bg-green-50 text-green-500 shadow-green-100' : 'bg-red-50 text-red-300 shadow-red-100'}`}>
          {v ? <FiCheck size={12} /> : <FiMinus size={12} className="rotate-45" />}
        </div>
      )
    },
    { key: 'notBefore', label: 'Delivery not before (in days)', render: (v) => <span className="text-gray-500 font-bold text-[10px]">{v}</span> },
    { key: 'notLater', label: 'Delivery not later than (in days)', render: (v) => <span className="text-gray-500 font-bold text-[10px]">{v}</span> },
    { key: 'order', label: 'Display order', render: (v) => <span className="text-[#6b2bd9] font-black text-[10px]">{v}</span> },
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
      className="space-y-6"
    >
       <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-gray-400 hover:text-[#6b2bd9] shadow-sm active:scale-95"
            >
              <FiArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Delivery Times</h1>
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

       <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-sm overflow-hidden p-6 lg:p-8">
          <DataTable 
             data={data}
             columns={columns}
             className="border-none shadow-none"
          />
       </div>
    </motion.div>
  );
};

const PriceLabelsList = ({ onBack, onAdd, onEdit, onDelete, data }) => {
  const columns = [
    { key: 'id', label: 'ID', render: (v) => <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{v}</span> },
    { key: 'shortName', label: 'Name (short)', render: (v) => <span className="font-bold text-gray-800">{v}</span> },
    { key: 'name', label: 'Name', render: (v) => <span className="font-bold text-gray-400 uppercase text-[10px] tracking-widest">{v}</span> },
    { key: 'description', label: 'Description', render: (v) => <p className="text-[11px] text-gray-400 font-semibold max-w-[120px] truncate">{v || '—'}</p> },
    { key: 'isMsrp', label: 'Is MSRP', render: (v) => <div className={`p-1 w-fit rounded-full shadow-sm ${v ? 'bg-amber-50 text-amber-500 shadow-amber-100' : 'bg-gray-50 text-gray-300 shadow-sm'}`}>{v ? <FiCheck size={12} /> : <FiMinus size={12} className="rotate-45" />}</div> },
    { key: 'displayInList', label: 'Short name in lists', render: (v) => <div className={`p-1 w-fit rounded-full shadow-sm ${v ? 'bg-blue-50 text-blue-500 shadow-blue-100' : 'bg-gray-50 text-gray-300 shadow-sm'}`}>{v ? <FiCheck size={12} /> : <FiMinus size={12} className="rotate-45" />}</div> },
    { key: 'order', label: 'Display order', render: (v) => <span className="text-[#6b2bd9] font-black text-[10px]">{v}</span> },
    { key: 'isComparePriceDefault', label: 'Compare Default', render: (v) => <div className={`p-1 w-fit rounded-full shadow-sm ${v ? 'bg-indigo-50 text-indigo-500 shadow-indigo-100' : 'bg-gray-50 text-gray-300 shadow-sm'}`}>{v ? <FiCheck size={12} /> : <FiMinus size={12} className="rotate-45" />}</div> },
    { key: 'isRegularPriceDefault', label: 'Regular Default', render: (v) => <div className={`p-1 w-fit rounded-full shadow-sm ${v ? 'bg-emerald-50 text-emerald-500 shadow-emerald-100' : 'bg-gray-50 text-gray-300 shadow-sm'}`}>{v ? <FiCheck size={12} /> : <FiMinus size={12} className="rotate-45" />}</div> },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-2">
          <button onClick={() => onEdit(row)} className="p-2 bg-purple-50 text-[#6b2bd9] rounded-xl hover:bg-[#6b2bd9] hover:text-white transition-all shadow-sm active:scale-95"><FiEdit3 size={14} /></button>
          <button onClick={() => onDelete(row.id)} className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-95"><FiTrash2 size={14} /></button>
        </div>
      )
    }
  ];

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
       <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-gray-400 hover:text-[#6b2bd9] shadow-sm active:scale-95"><FiArrowLeft size={20} /></button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Price Labels</h1>
            </div>
          </div>
          <button onClick={onAdd} className="px-8 py-2.5 bg-[#6b2bd9] text-white rounded-2xl hover:bg-[#5b24b7] transition-all text-sm font-bold flex items-center gap-2 shadow-lg shadow-purple-200/50 active:scale-95"><FiPlus size={18} /><span>Add New</span></button>
       </div>
       <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-sm overflow-hidden p-6 lg:p-8">
          <DataTable data={data} columns={columns} className="border-none shadow-none" />
       </div>
    </motion.div>
  );
};

const DimensionsList = ({ onBack, onAdd, onEdit, onDelete, data }) => {
  const columns = [
    { key: 'name', label: 'Name', render: (v) => <span className="font-bold text-gray-800">{v}</span> },
    { key: 'systemKeyword', label: 'System keyword', render: (v) => <span className="text-[10px] font-mono font-bold text-emerald-500 uppercase tracking-tight bg-emerald-50 px-2 py-1 rounded-md">{v}</span> },
    { key: 'ratio', label: 'Ratio to primary dimension', render: (v) => <span className="text-gray-500 font-bold text-[10px]">{v}</span> },
    { 
      key: 'isPrimary', 
      label: 'Is primary dimension', 
      render: (v) => (
        <div className={`p-1 w-fit rounded-full shadow-sm ${v ? 'bg-purple-50 text-[#6b2bd9] shadow-purple-100' : 'bg-gray-50 text-gray-300 shadow-sm'}`}>
          {v ? <FiCheck size={12} /> : <FiMinus size={12} className="rotate-45" />}
        </div>
      )
    },
    { key: 'order', label: 'Display order', render: (v) => <span className="text-[#6b2bd9] font-black text-[10px]">{v}</span> },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-2">
          <button onClick={() => onEdit(row)} className="p-2 bg-purple-50 text-[#6b2bd9] rounded-xl hover:bg-[#6b2bd9] hover:text-white transition-all shadow-sm active:scale-95"><FiEdit3 size={14} /></button>
          <button onClick={() => onDelete(row.id)} className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-95"><FiTrash2 size={14} /></button>
        </div>
      )
    }
  ];

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
       <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-gray-400 hover:text-[#6b2bd9] shadow-sm active:scale-95"><FiArrowLeft size={20} /></button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dimensions</h1>
            </div>
          </div>
          <button onClick={onAdd} className="px-8 py-2.5 bg-[#6b2bd9] text-white rounded-2xl hover:bg-[#5b24b7] transition-all text-sm font-bold flex items-center gap-2 shadow-lg shadow-purple-200/50 active:scale-95"><FiPlus size={18} /><span>Add New</span></button>
       </div>
       <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-sm overflow-hidden p-6 lg:p-8">
          <DataTable data={data} columns={columns} className="border-none shadow-none" />
       </div>
    </motion.div>
  );
};

const PriceLabelForm = ({ onBack, onSave, initialData = null }) => {
  const isEdit = !!initialData;
  const [formData, setFormData] = useState({
    shortName: '', name: '', description: '', isMsrp: false, displayInList: true, order: 0, isComparePriceDefault: false, isRegularPriceDefault: false,
    ...(initialData || {})
  });

  const toggles = [
    { id: 'isMsrp', label: 'Is MSRP', icon: FiTag, color: 'bg-amber-50 text-amber-500' },
    { id: 'displayInList', label: 'Display Short Name', icon: FiType, color: 'bg-blue-50 text-blue-500' },
    { id: 'isComparePriceDefault', label: 'Compare Default', icon: FiTarget, color: 'bg-indigo-50 text-indigo-500' },
    { id: 'isRegularPriceDefault', label: 'Regular Default', icon: FiCheck, color: 'bg-emerald-50 text-emerald-500' },
  ];

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-gray-400 hover:text-[#6b2bd9] shadow-sm"><FiArrowLeft size={20} /></button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{isEdit ? `Edit price label - ${formData.shortName}` : 'Add a new price label'}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => onSave(formData, true)} className="px-6 py-2.5 bg-white border border-[#6b2bd9]/20 text-[#6b2bd9] rounded-xl hover:bg-purple-50 transition-all text-sm font-bold flex items-center gap-2 shadow-sm"><FiSave size={16} /><span>Save and Continue</span></button>
          <button onClick={() => onSave(formData, false)} className="px-8 py-2.5 bg-[#6b2bd9] text-white rounded-xl hover:bg-[#5b24b7] transition-all text-sm font-bold flex items-center gap-2 shadow-lg shadow-purple-200/50"><FiCheck size={18} /><span>Save</span></button>
        </div>
      </div>
      <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-sm overflow-hidden p-8 lg:p-12 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10">
           <div className="space-y-2">
             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Name (short)</label>
             <input type="text" value={formData.shortName} onChange={(e) => setFormData({ ...formData, shortName: e.target.value })} className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:border-[#6b2bd9] outline-none" />
           </div>
           <div className="space-y-2">
             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Full Name</label>
             <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:border-[#6b2bd9] outline-none" />
           </div>
           <div className="space-y-2">
             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Display order</label>
             <input type="number" value={formData.order} onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })} className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:border-[#6b2bd9] outline-none" />
           </div>
           <div className="md:col-span-2 space-y-2">
             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Description</label>
             <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:border-[#6b2bd9] outline-none resize-none" />
           </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t border-gray-50">
          {toggles.map(t => (
            <button key={t.id} onClick={() => setFormData({ ...formData, [t.id]: !formData[t.id] })} className={`p-4 rounded-3xl border flex flex-col gap-3 transition-all ${formData[t.id] ? 'bg-purple-50/50 border-purple-100 ring-2 ring-purple-100/30' : 'bg-white border-gray-100 hover:border-gray-200 shadow-sm'}`}>
              <div className={`p-2.5 rounded-2xl w-fit ${formData[t.id] ? 'bg-[#6b2bd9] text-white' : t.color}`}>{<t.icon size={14}/>}</div>
              <div className="text-left"><span className={`text-[10px] font-bold uppercase tracking-widest ${formData[t.id] ? 'text-[#6b2bd9]' : 'text-gray-400'}`}>{t.label}</span></div>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const DimensionForm = ({ onBack, onSave, initialData = null }) => {
  const isEdit = !!initialData;
  const [formData, setFormData] = useState({
    name: '',
    systemKeyword: '',
    ratio: 1,
    order: 0,
    isPrimary: false,
    ...(initialData || {})
  });

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-gray-400 hover:text-[#6b2bd9] shadow-sm active:scale-95"><FiArrowLeft size={20} /></button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{isEdit ? `Edit dimension unit - ${formData.name}` : 'Add a new dimension unit'}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => onSave(formData, true)} className="px-6 py-2.5 bg-white border border-[#6b2bd9]/20 text-[#6b2bd9] rounded-xl hover:bg-purple-50 transition-all text-sm font-bold flex items-center gap-2 active:scale-95 shadow-sm"><FiSave size={16} /><span>Save and Continue</span></button>
          <button onClick={() => onSave(formData, false)} className="px-8 py-2.5 bg-[#6b2bd9] text-white rounded-xl hover:bg-[#5b24b7] transition-all text-sm font-bold flex items-center gap-2 shadow-lg shadow-purple-200/50 active:scale-95"><FiCheck size={18} /><span>Save</span></button>
        </div>
      </div>
      <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-sm overflow-hidden p-8 lg:p-12 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10">
           <div className="space-y-2">
             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Name</label>
             <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold outline-none border focus:border-[#6b2bd9] transition-all" placeholder="e.g. Centimeter" />
           </div>
           <div className="space-y-2">
             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">System keyword</label>
             <input type="text" value={formData.systemKeyword} onChange={(e) => setFormData({ ...formData, systemKeyword: e.target.value })} className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold outline-none border focus:border-[#6b2bd9] transition-all font-mono" placeholder="cm" />
           </div>
           <div className="space-y-2">
             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Ratio to primary unit</label>
             <input type="number" value={formData.ratio} onChange={(e) => setFormData({ ...formData, ratio: parseFloat(e.target.value) || 0 })} className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold outline-none border focus:border-[#6b2bd9] transition-all" />
           </div>
           <div className="space-y-2">
             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Display order</label>
             <input type="number" value={formData.order} onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })} className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold outline-none border focus:border-[#6b2bd9] transition-all" />
           </div>
           <div className="space-y-2">
             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Status</label>
             <button onClick={() => setFormData({ ...formData, isPrimary: !formData.isPrimary })} className={`w-full p-4 rounded-2xl border flex items-center justify-between transition-all ${formData.isPrimary ? 'bg-purple-50/50 border-purple-100 ring-2 ring-purple-100/30' : 'bg-white border-gray-100 shadow-sm'}`}><span className={`text-[11px] font-bold uppercase tracking-widest ${formData.isPrimary ? 'text-[#6b2bd9]' : 'text-gray-400'}`}>Is Primary unit</span><div className={`w-8 h-4 rounded-full relative transition-all ${formData.isPrimary ? 'bg-[#6b2bd9]/20' : 'bg-gray-100'}`}><div className={`absolute top-1 w-2 h-2 rounded-full transition-all ${formData.isPrimary ? 'right-1 bg-[#6b2bd9]' : 'left-1 bg-gray-300'}`} /></div></button>
           </div>
        </div>
      </div>
    </motion.div>
  );
};

const WeightsList = ({ onBack, onAdd, onEdit, onDelete, data }) => {
  const columns = [
    { key: 'name', label: 'Name', render: (v) => <span className="font-bold text-gray-800">{v}</span> },
    { key: 'systemKeyword', label: 'System keyword', render: (v) => <span className="text-[10px] font-mono font-bold text-blue-500 uppercase tracking-tight bg-blue-50 px-2 py-1 rounded-md">{v}</span> },
    { key: 'ratio', label: 'Ratio to primary weight', render: (v) => <span className="text-gray-500 font-bold text-[10px]">{v}</span> },
    { 
      key: 'isPrimary', 
      label: 'Is primary weight', 
      render: (v) => (
        <div className={`p-1 w-fit rounded-full shadow-sm ${v ? 'bg-purple-50 text-[#6b2bd9] shadow-purple-100' : 'bg-gray-50 text-gray-300 shadow-sm'}`}>
          {v ? <FiCheck size={12} /> : <FiMinus size={12} className="rotate-45" />}
        </div>
      )
    },
    { key: 'order', label: 'Display order', render: (v) => <span className="text-[#6b2bd9] font-black text-[10px]">{v}</span> },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-2">
          <button onClick={() => onEdit(row)} className="p-2 bg-purple-50 text-[#6b2bd9] rounded-xl hover:bg-[#6b2bd9] hover:text-white transition-all shadow-sm active:scale-95"><FiEdit3 size={14} /></button>
          <button onClick={() => onDelete(row.id)} className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-95"><FiTrash2 size={14} /></button>
        </div>
      )
    }
  ];

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
       <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-gray-400 hover:text-[#6b2bd9] shadow-sm"><FiArrowLeft size={20} /></button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Weights</h1>
            </div>
          </div>
          <button onClick={onAdd} className="px-8 py-2.5 bg-[#6b2bd9] text-white rounded-2xl hover:bg-[#5b24b7] transition-all text-sm font-bold flex items-center gap-2 shadow-lg shadow-purple-200/50"><FiPlus size={18} /><span>Add New</span></button>
       </div>
       <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-sm overflow-hidden p-6 lg:p-8">
          <DataTable data={data} columns={columns} className="border-none shadow-none" />
       </div>
    </motion.div>
  );
};

const WeightForm = ({ onBack, onSave, initialData = null }) => {
  const isEdit = !!initialData;
  const [formData, setFormData] = useState({
    name: '',
    systemKeyword: '',
    ratio: 1,
    order: 0,
    isPrimary: false,
    ...(initialData || {})
  });

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-gray-400 hover:text-[#6b2bd9] shadow-sm"><FiArrowLeft size={20} /></button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{isEdit ? `Edit weight unit - ${formData.name}` : 'Add a new weight unit'}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => onSave(formData, true)} className="px-6 py-2.5 bg-white border border-[#6b2bd9]/20 text-[#6b2bd9] rounded-xl hover:bg-purple-50 transition-all text-sm font-bold flex items-center gap-2 shadow-sm"><FiSave size={16} /><span>Save and Continue</span></button>
          <button onClick={() => onSave(formData, false)} className="px-8 py-2.5 bg-[#6b2bd9] text-white rounded-xl hover:bg-[#5b24b7] transition-all text-sm font-bold flex items-center gap-2 shadow-lg shadow-purple-200/50"><FiCheck size={18} /><span>Save</span></button>
        </div>
      </div>
      <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-sm overflow-hidden p-8 lg:p-12 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10">
           <div className="space-y-2">
             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Name</label>
             <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold outline-none border focus:border-[#6b2bd9]" placeholder="e.g. Kilogram" />
           </div>
           <div className="space-y-2">
             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">System keyword</label>
             <input type="text" value={formData.systemKeyword} onChange={(e) => setFormData({ ...formData, systemKeyword: e.target.value })} className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold outline-none border focus:border-[#6b2bd9] font-mono" placeholder="kg" />
           </div>
           <div className="space-y-2">
             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Ratio to primary unit</label>
             <input type="number" value={formData.ratio} onChange={(e) => setFormData({ ...formData, ratio: parseFloat(e.target.value) || 0 })} className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold outline-none border focus:border-[#6b2bd9]" />
           </div>
           <div className="space-y-2">
             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Display order</label>
             <input type="number" value={formData.order} onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })} className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold outline-none border focus:border-[#6b2bd9]" />
           </div>
           <div className="space-y-2">
             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Status</label>
             <button onClick={() => setFormData({ ...formData, isPrimary: !formData.isPrimary })} className={`w-full p-4 rounded-2xl border flex items-center justify-between transition-all ${formData.isPrimary ? 'bg-purple-50/50 border-purple-100 ring-2 ring-purple-100/30' : 'bg-white border-gray-100 shadow-sm'}`}><span className={`text-[11px] font-bold uppercase tracking-widest ${formData.isPrimary ? 'text-[#6b2bd9]' : 'text-gray-400'}`}>Is Primary unit</span><div className={`w-8 h-4 rounded-full relative transition-all ${formData.isPrimary ? 'bg-[#6b2bd9]/20' : 'bg-gray-100'}`}><div className={`absolute top-1 w-2 h-2 rounded-full transition-all ${formData.isPrimary ? 'right-1 bg-[#6b2bd9]' : 'left-1 bg-gray-300'}`} /></div></button>
           </div>
        </div>
      </div>
    </motion.div>
  );
};

const QuantityUnitForm = ({ onBack, onSave, initialData = null }) => {
  const isEdit = !!initialData;
  const [formData, setFormData] = useState({
    name: '',
    namePlural: '',
    description: '',
    isDefault: false,
    order: 0,
    ...(initialData || {})
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6 pb-20"
    >
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
              {isEdit ? `Edit quantity unit - ${formData.name}` : 'Add a new quantity unit'}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10">
           <div className="space-y-2">
             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Name</label>
             <input
               type="text"
               value={formData.name}
               onChange={(e) => setFormData({ ...formData, name: e.target.value })}
               className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] outline-none transition-all"
               placeholder="e.g. piece"
             />
           </div>
           <div className="space-y-2">
             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Name plural</label>
             <input
               type="text"
               value={formData.namePlural}
               onChange={(e) => setFormData({ ...formData, namePlural: e.target.value })}
               className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] outline-none transition-all"
               placeholder="e.g. pieces"
             />
           </div>
           <div className="space-y-2">
             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Display order</label>
             <input
               type="number"
               value={formData.order}
               onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
               className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] outline-none transition-all"
             />
           </div>
           <div className="md:col-span-2 space-y-2">
             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Description</label>
             <textarea
               value={formData.description}
               onChange={(e) => setFormData({ ...formData, description: e.target.value })}
               rows={3}
               className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] outline-none transition-all resize-none"
               placeholder="Optional description of this unit..."
             />
           </div>
           <div className="space-y-2">
             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Status</label>
             <button
               onClick={() => setFormData({ ...formData, isDefault: !formData.isDefault })}
               className={`w-full p-4 rounded-2xl border flex items-center justify-between transition-all ${
                 formData.isDefault ? 'bg-purple-50/50 border-purple-100 ring-2 ring-purple-100/30' : 'bg-white border-gray-100 shadow-sm'
               }`}
             >
               <span className={`text-[11px] font-bold uppercase tracking-widest ${formData.isDefault ? 'text-[#6b2bd9]' : 'text-gray-400'}`}>
                 Is Default Unit
               </span>
               <div className={`w-8 h-4 rounded-full relative transition-all ${formData.isDefault ? 'bg-[#6b2bd9]/20' : 'bg-gray-100'}`}>
                 <div className={`absolute top-1 w-2 h-2 rounded-full transition-all ${formData.isDefault ? 'right-1 bg-[#6b2bd9]' : 'left-1 bg-gray-300'}`} />
               </div>
             </button>
           </div>
        </div>
      </div>
    </motion.div>
  );
};

const DeliveryTimeForm = ({ onBack, onSave, initialData = null }) => {
  const isEdit = !!initialData;
  const [formData, setFormData] = useState({
    name: '',
    color: '#6366f1',
    isDefault: false,
    notBefore: 0,
    notLater: 0,
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
              {isEdit ? `Edit delivery window - ${formData.name}` : 'Add a new delivery time'}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10">
           <div className="space-y-2">
             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
               <FiType className="text-gray-300" /> Display Name
             </label>
             <input
               type="text"
               value={formData.name}
               onChange={(e) => setFormData({ ...formData, name: e.target.value })}
               className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] outline-none transition-all placeholder:text-gray-300"
               placeholder="Standard Delivery..."
             />
           </div>

           <div className="space-y-2">
             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: formData.color }} /> Color (Hex)
             </label>
             <input
               type="text"
               value={formData.color}
               onChange={(e) => setFormData({ ...formData, color: e.target.value })}
               className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] outline-none transition-all font-mono"
               placeholder="#000000"
             />
           </div>

           <div className="space-y-2">
             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
               <FiSettings className="text-gray-300" /> Display Order
             </label>
             <input
               type="number"
               value={formData.order}
               onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
               className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] outline-none transition-all"
             />
           </div>

           <div className="space-y-2">
             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
               <FiClock className="text-gray-300" /> Not Before (Days)
             </label>
             <input
               type="number"
               value={formData.notBefore}
               onChange={(e) => setFormData({ ...formData, notBefore: parseInt(e.target.value) || 0 })}
               className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] outline-none transition-all"
             />
           </div>

           <div className="space-y-2">
             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
               <FiClock className="text-gray-300" /> Not Later Than (Days)
             </label>
             <input
               type="number"
               value={formData.notLater}
               onChange={(e) => setFormData({ ...formData, notLater: parseInt(e.target.value) || 0 })}
               className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] outline-none transition-all"
             />
           </div>

           <div className="space-y-2">
             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">
               Status Configuration
             </label>
             <button
               onClick={() => setFormData({ ...formData, isDefault: !formData.isDefault })}
               className={`w-full p-4 rounded-2xl border flex items-center justify-between transition-all group ${
                 formData.isDefault 
                 ? 'bg-purple-50/50 border-purple-100 ring-2 ring-purple-100/30' 
                 : 'bg-white border-gray-100 hover:border-gray-200 shadow-sm'
               }`}
             >
               <div className="flex items-center gap-3">
                 <div className={`p-2 rounded-xl transition-all ${
                   formData.isDefault ? 'bg-[#6b2bd9] text-white shadow-md' : 'bg-gray-50 text-gray-400'
                 }`}>
                   <FiCheck size={14} />
                 </div>
                 <span className={`text-[11px] font-bold uppercase tracking-widest ${
                   formData.isDefault ? 'text-[#6b2bd9]' : 'text-gray-400'
                 }`}>
                   Is Default
                 </span>
               </div>
               <div className={`w-8 h-4 rounded-full relative transition-all ${formData.isDefault ? 'bg-[#6b2bd9]/20' : 'bg-gray-100'}`}>
                 <div className={`absolute top-1 w-2 h-2 rounded-full transition-all ${
                   formData.isDefault ? 'right-1 bg-[#6b2bd9]' : 'left-1 bg-gray-300'
                 }`} />
               </div>
             </button>
           </div>
        </div>
      </div>
    </motion.div>
  );
};

const Lists = () => {
  const [activeView, setActiveView] = useState('menu');
  const [editingItem, setEditingItem] = useState(null);
  const [deliveryTimes, setDeliveryTimes] = useState([
    { id: 1, name: 'Standard Delivery', color: '#6366f1', isDefault: true, notBefore: 3, notLater: 5, order: 0 },
    { id: 2, name: 'Express Delivery', color: '#f59e0b', isDefault: false, notBefore: 1, notLater: 2, order: 1 },
    { id: 3, name: 'Hyper-Local', color: '#10b981', isDefault: false, notBefore: 0, notLater: 1, order: 2 },
  ]);

  const [quantityUnits, setQuantityUnits] = useState([
    { id: 1, name: 'piece', namePlural: 'pieces', description: 'Standard unit for individual items', order: 0, isDefault: true },
    { id: 2, name: 'kilogram', namePlural: 'kilograms', description: 'Weight-based measurement', order: 1, isDefault: false },
    { id: 3, name: 'liter', namePlural: 'liters', description: 'Volume-based measurement', order: 2, isDefault: false },
  ]);

  const [weights, setWeights] = useState([
    { id: 1, name: 'Kilogram', systemKeyword: 'kg', ratio: 1, order: 0, isPrimary: true },
    { id: 2, name: 'Gram', systemKeyword: 'g', ratio: 1000, order: 1, isPrimary: false },
    { id: 3, name: 'Pound', systemKeyword: 'lb', ratio: 2.20462, order: 2, isPrimary: false },
  ]);

  const [dimensions, setDimensions] = useState([
    { id: 1, name: 'Centimeter', systemKeyword: 'cm', ratio: 1, order: 0, isPrimary: true },
    { id: 2, name: 'Meter', systemKeyword: 'm', ratio: 0.01, order: 1, isPrimary: false },
    { id: 3, name: 'Inch', systemKeyword: 'in', ratio: 0.393701, order: 2, isPrimary: false },
  ]);

  const [priceLabels, setPriceLabels] = useState([
    { id: 1, shortName: 'MSRP', name: 'Manufacturer Suggested Retail Price', description: 'Standard industry benchmark price', isMsrp: true, displayInList: true, order: 0, isComparePriceDefault: false, isRegularPriceDefault: false },
    { id: 2, shortName: 'Sale', name: 'Sale Price', description: 'Discounted promotional price', isMsrp: false, displayInList: true, order: 1, isComparePriceDefault: true, isRegularPriceDefault: false },
    { id: 3, shortName: 'Retail', name: 'Standard Retail Price', description: 'Standard selling price', isMsrp: false, displayInList: true, order: 2, isComparePriceDefault: false, isRegularPriceDefault: true },
  ]);

  const groups = [
    {
      title: 'Unit Configuration',
      items: [
        { title: 'Quantity Units', icon: FiLayers, onClick: () => setActiveView('quantity-units') },
        { title: 'Weights', icon: FiTarget, onClick: () => setActiveView('weights') },
        { title: 'Dimensions', icon: FiMaximize, onClick: () => setActiveView('dimensions') },
      ]
    },
    {
      title: 'Logistics & Pricing',
      items: [
        { title: 'Delivery Times', icon: FiClock, onClick: () => setActiveView('delivery-times') },
        { title: 'Price Labels', icon: FiTag, onClick: () => setActiveView('price-labels') },
      ]
    }
  ];

  const handleDeletePriceLabel = (id) => {
    if (window.confirm('Are you sure you want to delete this price label?')) {
      setPriceLabels(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleSavePriceLabel = (formData, continueEditing) => {
    if (editingItem) {
      setPriceLabels(prev => prev.map(p => p.id === editingItem.id ? { ...formData, id: editingItem.id } : p));
    } else {
      const nextId = Math.max(...priceLabels.map(p => p.id), 0) + 1;
      setPriceLabels(prev => [...prev, { ...formData, id: nextId }]);
    }
    if (!continueEditing) {
      setEditingItem(null);
      setActiveView('price-labels');
    }
  };

  const handleDeleteDimension = (id) => {
    if (window.confirm('Are you sure you want to delete this dimension unit?')) {
      setDimensions(prev => prev.filter(d => d.id !== id));
    }
  };

  const handleSaveDimension = (formData, continueEditing) => {
    if (editingItem) {
      setDimensions(prev => prev.map(d => d.id === editingItem.id ? { ...formData, id: editingItem.id } : d));
    } else {
      const nextId = Math.max(...dimensions.map(d => d.id), 0) + 1;
      setDimensions(prev => [...prev, { ...formData, id: nextId }]);
    }
    if (!continueEditing) {
      setEditingItem(null);
      setActiveView('dimensions');
    }
  };

  const handleDeleteWeight = (id) => {
    if (window.confirm('Are you sure you want to delete this weight unit?')) {
      setWeights(prev => prev.filter(w => w.id !== id));
    }
  };

  const handleSaveWeight = (formData, continueEditing) => {
    if (editingItem) {
      setWeights(prev => prev.map(w => w.id === editingItem.id ? { ...formData, id: editingItem.id } : w));
    } else {
      const nextId = Math.max(...weights.map(w => w.id), 0) + 1;
      setWeights(prev => [...prev, { ...formData, id: nextId }]);
    }
    if (!continueEditing) {
      setEditingItem(null);
      setActiveView('weights');
    }
  };

  const handleDeleteQuantityUnit = (id) => {
    if (window.confirm('Are you sure you want to delete this quantity unit?')) {
      setQuantityUnits(prev => prev.filter(q => q.id !== id));
    }
  };

  const handleSaveQuantityUnit = (formData, continueEditing) => {
    if (editingItem) {
      setQuantityUnits(prev => prev.map(q => q.id === editingItem.id ? { ...formData, id: editingItem.id } : q));
    } else {
      const nextId = Math.max(...quantityUnits.map(q => q.id), 0) + 1;
      setQuantityUnits(prev => [...prev, { ...formData, id: nextId }]);
    }
    if (!continueEditing) {
      setEditingItem(null);
      setActiveView('quantity-units');
    }
  };

  const handleDeleteDeliveryTime = (id) => {
    if (window.confirm('Are you sure you want to delete this delivery time index?')) {
      setDeliveryTimes(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleSaveDeliveryTime = (formData, continueEditing) => {
    if (editingItem) {
      setDeliveryTimes(prev => prev.map(item => item.id === editingItem.id ? { ...formData, id: editingItem.id } : item));
    } else {
      const nextId = Math.max(...deliveryTimes.map(c => c.id), 0) + 1;
      setDeliveryTimes(prev => [...prev, { ...formData, id: nextId }]);
    }
    
    if (!continueEditing) {
      setEditingItem(null);
      setActiveView('delivery-times');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-10 pb-20"
    >
      <AnimatePresence mode="wait">
        {activeView === 'menu' ? (
          <motion.div
            key="menu"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-10"
          >
            {/* Hub view main header removed for cleaner look per user request */}


            {/* Main Container */}
            <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-sm overflow-hidden p-8 lg:p-10 space-y-12">
              {groups.map((group, idx) => (
                <SettingGroup 
                  key={idx}
                  title={group.title}
                  items={group.items}
                />
              ))}
            </div>
          </motion.div>
        ) : activeView === 'delivery-times' ? (
           <DeliveryTimesList 
              onBack={() => setActiveView('menu')}
              onAdd={() => {
                setEditingItem(null);
                setActiveView('delivery-time-form');
              }}
              onEdit={(item) => {
                setEditingItem(item);
                setActiveView('delivery-time-form');
              }}
              onDelete={handleDeleteDeliveryTime}
              data={deliveryTimes}
           />
        ) : activeView === 'delivery-time-form' ? (
          <DeliveryTimeForm 
            onBack={() => {
              setEditingItem(null);
              setActiveView('delivery-times');
            }}
            onSave={handleSaveDeliveryTime}
            initialData={editingItem}
          />
        ) : activeView === 'quantity-units' ? (
          <QuantityUnitsList 
            onBack={() => setActiveView('menu')}
            onAdd={() => {
              setEditingItem(null);
              setActiveView('quantity-unit-form');
            }}
            onEdit={(q) => {
              setEditingItem(q);
              setActiveView('quantity-unit-form');
            }}
            onDelete={handleDeleteQuantityUnit}
            data={quantityUnits}
          />
        ) : activeView === 'quantity-unit-form' ? (
          <QuantityUnitForm 
            onBack={() => {
              setEditingItem(null);
              setActiveView('quantity-units');
            }}
            onSave={handleSaveQuantityUnit}
            initialData={editingItem}
          />
        ) : activeView === 'weights' ? (
          <WeightsList 
            onBack={() => setActiveView('menu')}
            onAdd={() => {
              setEditingItem(null);
              setActiveView('weight-form');
            }}
            onEdit={(w) => {
              setEditingItem(w);
              setActiveView('weight-form');
            }}
            onDelete={handleDeleteWeight}
            data={weights}
          />
        ) : activeView === 'weight-form' ? (
          <WeightForm 
            onBack={() => {
              setEditingItem(null);
              setActiveView('weights');
            }}
            onSave={handleSaveWeight}
            initialData={editingItem}
          />
        ) : activeView === 'dimensions' ? (
          <DimensionsList 
            onBack={() => setActiveView('menu')}
            onAdd={() => {
              setEditingItem(null);
              setActiveView('dimension-form');
            }}
            onEdit={(d) => {
              setEditingItem(d);
              setActiveView('dimension-form');
            }}
            onDelete={handleDeleteDimension}
            data={dimensions}
          />
        ) : activeView === 'dimension-form' ? (
          <DimensionForm 
            onBack={() => {
              setEditingItem(null);
              setActiveView('dimensions');
            }}
            onSave={handleSaveDimension}
            initialData={editingItem}
          />
        ) : activeView === 'price-labels' ? (
          <PriceLabelsList 
            onBack={() => setActiveView('menu')}
            onAdd={() => {
              setEditingItem(null);
              setActiveView('price-label-form');
            }}
            onEdit={(p) => {
              setEditingItem(p);
              setActiveView('price-label-form');
            }}
            onDelete={handleDeletePriceLabel}
            data={priceLabels}
          />
        ) : activeView === 'price-label-form' ? (
          <PriceLabelForm 
            onBack={() => {
              setEditingItem(null);
              setActiveView('price-labels');
            }}
            onSave={handleSavePriceLabel}
            initialData={editingItem}
          />
        ) : (
          <motion.div
            key="sub-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
             <div className="flex items-center gap-4">
                <button 
                  onClick={() => setActiveView('menu')}
                  className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-gray-400 hover:text-[#6b2bd9] shadow-sm active:scale-95"
                >
                  <FiArrowLeft size={20} />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight capitalize">
                    {activeView.replace('-', ' ')}
                  </h1>
                </div>
             </div>

             <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-sm overflow-hidden p-8 lg:p-12 min-h-[400px] flex items-center justify-center">
                <div className="flex flex-col items-center gap-6 opacity-30">
                    <FiSettings size={64} className="text-gray-200 animate-spin-slow" />
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">Initialising Sub-module...</p>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Lists;
