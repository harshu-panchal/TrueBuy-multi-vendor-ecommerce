import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TruBuyLogo from '../../../../assets/tru_buy-removebg-preview.png';
import {
  FiPlus,
  FiTrash2,
  FiEdit3,
  FiFilter,
  FiCheck,
  FiSave,
  FiMail,
  FiGlobe,
  FiUsers,
  FiCode,
  FiEye,
  FiType,
  FiArrowLeft,
  FiSettings,
  FiChevronDown,
  FiLayers,
  FiSend,
  FiUser,
  FiRefreshCw,
  FiInfo,
  FiMessageSquare,
  FiSearch,
  FiMaximize2
} from 'react-icons/fi';
import DataTable from '../../components/DataTable';

const TableSwitch = ({ active, onChange, label }) => (
  <div className="flex items-center justify-between py-2 group cursor-pointer" onClick={() => onChange(!active)}>
    <span className="text-[11px] font-bold text-gray-600 transition-colors group-hover:text-gray-900">{label}</span>
    <div className={`w-10 h-5 rounded-full transition-all relative ${active ? 'bg-[#6b2bd9]' : 'bg-gray-200'}`}>
      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${active ? 'left-6' : 'left-1'}`} />
    </div>
  </div>
);

const ColumnCheckbox = ({ active, onChange, label }) => (
  <div className="flex items-center gap-2 py-1.5 cursor-pointer group" onClick={() => onChange(!active)}>
    <div className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${active ? 'bg-[#6b2bd9] border-[#6b2bd9]' : 'border-gray-300 group-hover:border-gray-400'}`}>
      {active && <FiCheck size={10} className="text-white shadow-sm" />}
    </div>
    <span className={`text-[10px] sm:text-[11px] font-bold transition-colors uppercase tracking-tight ${active ? 'text-gray-800' : 'text-gray-400 font-medium'}`}>{label}</span>
  </div>
);

const MessageTemplateForm = ({
  mode = 'add',
  initialData = {},
  onClose,
  onSave,
  onDelete
}) => {
  const data = initialData || {};
  const [showPreview, setShowPreview] = useState(false);
  const isEdit = mode === 'edit';
  const [formData, setFormData] = useState({
    name: data.name || '',
    subject: data.subject || '',
    isActive: data.isActive ?? true,
    onlySendManually: data.onlySendManually ?? false,
    limitedToStores: data.limitedToStores || 'All Stores',
    emailAccount: data.emailAccount || 'Primary Account',
    to: data.to || '',
    replyTo: data.replyTo || '',
    bcc: data.bcc || '',
    attachment1: data.attachment1 || '',
    attachment2: data.attachment2 || '',
    attachment3: data.attachment3 || '',
    body: data.body || '',
    ...data
  });


  const handleToggle = (field) => {
    setFormData(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const resolveTokens = (str) => {
    const mocks = {
      'Customer.FullName': 'John Smith John Smith LLC',
      'Product.Name': 'Prince of Persia "The Forgotten Sands"',
      'Product.Url': '#',
      'Order.Number': 'ORD-2024-001',
      'Store.Name': 'TruBuy Store',
      'Order.OrderNumber': 'ORD-2024-001',
      'Store.Email': 'test@mail.com'
    };
    let resolved = str;
    Object.entries(mocks).forEach(([key, val]) => {
      resolved = resolved.split(`{{ ${key} }}`).join(val);
      resolved = resolved.split(`{{${key}}}`).join(val); 
    });
    return resolved;
  };

  const cleanBody = (body) => {
    if (!body) return '';
    let cleaned = body;
    cleaned = cleaned.replace(/{%\s*extends\s*['"].*['"]\s*%}/g, '');
    cleaned = cleaned.replace(/{%\s*block\s*['"].*['"]\s*%}/g, '');
    cleaned = cleaned.replace(/{%\s*endblock\s*%}/g, '');
    return resolveTokens(cleaned);
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
              {isEdit ? 'Edit Message Template' : 'Add Message Template'}
            </h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">
              Communication Engineering & Automation
            </p>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <button
            onClick={() => setShowPreview(true)}
            className="px-5 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all text-xs font-bold flex items-center gap-2 active:scale-95 shadow-sm"
          >
            <FiEye size={16} className="text-[#6b2bd9]" />
            <span>Preview</span>
          </button>
          
          <button
            onClick={() => {
              const { id, ...copiedData } = formData;
              onSave({ ...copiedData, name: `${formData.name} (Copy)` }, false);
            }}
            className="px-5 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all text-xs font-bold flex items-center gap-2 active:scale-95 shadow-sm"
          >
            <FiPlus size={16} className="text-green-500" />
            <span>Copy Template</span>
          </button>

          {isEdit && (
            <button
              onClick={onDelete}
              className="px-5 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all text-xs font-bold flex items-center gap-2 active:scale-95"
            >
              <FiTrash2 size={16} />
              <span>Delete</span>
            </button>
          )}

          <div className="h-6 w-px bg-gray-200 mx-1" />

          <button
            onClick={() => onSave(formData, true)}
            className="px-5 py-2.5 bg-white border border-[#6b2bd9]/20 text-[#6b2bd9] rounded-xl hover:bg-purple-50 transition-all text-xs font-bold flex items-center gap-2 active:scale-95 shadow-sm"
          >
            <FiSave size={16} />
            <span>Save & Continue Editing</span>
          </button>
          <button
            onClick={() => onSave(formData, false)}
            className="px-6 py-2.5 bg-[#6b2bd9] text-white rounded-xl hover:bg-[#5b24b7] transition-all text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-100 active:scale-95"
          >
            <FiCheck size={16} />
            <span>Save</span>
          </button>
        </div>
      </div>


      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-8 lg:p-12 space-y-12">
          {/* Section: Basic Settings */}
          <div className="space-y-10">
            <div className="flex items-center gap-4">
              <div className="h-8 w-1 bg-[#6b2bd9] rounded-full" />
              <h2 className="text-lg font-black text-gray-900 tracking-tight">General Info</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                  <FiType className="text-gray-300" /> Template Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] focus:bg-white outline-none transition-all"
                  placeholder="OrderPlaced.CustomerNotification"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                  <FiGlobe className="text-gray-300" /> Limited to stores
                </label>
                <select
                  value={formData.limitedToStores}
                  onChange={(e) => setFormData({ ...formData, limitedToStores: e.target.value })}
                  className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] focus:bg-white outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="All Stores">All Stores</option>
                  <option value="Store 1">Store 1</option>
                  <option value="Store 2">Store 2</option>
                </select>
              </div>
            </div>

            {/* Section: Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { id: 'isActive', label: 'Active Status', icon: <FiCheck />, sub: 'Automated send' },
                { id: 'onlySendManually', label: 'Manual Trigger', icon: <FiSend />, sub: 'Require manual action' }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => handleToggle(item.id)}
                  className={`p-5 rounded-3xl border flex flex-col gap-3 transition-all group ${formData[item.id] ? 'bg-purple-50 border-purple-100' : 'bg-white border-gray-100 hover:border-gray-200 shadow-sm'
                    }`}
                >
                  <div className={`p-3 rounded-2xl w-fit transition-all ${formData[item.id] ? 'bg-[#6b2bd9] text-white' : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100'
                    }`}>
                    {item.icon}
                  </div>
                  <div className="text-left">
                    <h3 className={`text-[10px] font-black uppercase tracking-widest ${formData[item.id] ? 'text-[#6b2bd9]' : 'text-gray-400'}`}>
                      {item.label}
                    </h3>
                    <p className="text-[8px] font-bold text-gray-300 uppercase tracking-tighter mt-0.5">
                      {formData[item.id] ? `${item.sub} ON` : `${item.sub} OFF`}
                    </p>
                  </div>
                </button>
              ))}
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                  <FiSettings className="text-gray-300" /> Email Account
                </label>
                <select
                  value={formData.emailAccount}
                  onChange={(e) => setFormData({ ...formData, emailAccount: e.target.value })}
                  className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] focus:bg-white outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="Primary Account">Primary Account</option>
                  <option value="Support Account">Support Account</option>
                  <option value="Sales Account">Sales Account</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section: Email Routing */}
          <div className="space-y-10">
            <div className="flex items-center gap-4">
              <div className="h-8 w-1 bg-[#6b2bd9] rounded-full" />
              <h2 className="text-lg font-black text-gray-900 tracking-tight">Email Details</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                  <FiUser className="text-gray-300" /> To
                </label>
                <input
                  type="text"
                  value={formData.to}
                  onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                  className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] outline-none transition-all shadow-sm"
                  placeholder="{{ Customer.Email }}"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                  <FiRefreshCw className="text-gray-300" /> Reply To
                </label>
                <input
                  type="text"
                  value={formData.replyTo}
                  onChange={(e) => setFormData({ ...formData, replyTo: e.target.value })}
                  className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] outline-none transition-all shadow-sm"
                  placeholder="{{ Store.Email }}"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                  <FiCode className="text-gray-300" /> BCC
                </label>
                <input
                  type="text"
                  value={formData.bcc}
                  onChange={(e) => setFormData({ ...formData, bcc: e.target.value })}
                  className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] outline-none transition-all shadow-sm"
                  placeholder="admin@trubuy.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                <FiMail className="text-gray-300" /> Subject
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] outline-none transition-all shadow-sm"
                placeholder="New Order Received - {{ Order.Number }}"
              />
            </div>
          </div>

          {/* Section: Attachments */}
          <div className="space-y-10">
            <div className="flex items-center gap-4">
              <div className="h-8 w-1 bg-[#6b2bd9] rounded-full" />
              <h2 className="text-lg font-black text-gray-900 tracking-tight">Attachments</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map(num => (
                <div key={num} className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                    <FiLayers className="text-gray-300" /> Attachment {num}
                  </label>
                  <div className="relative group">
                    <input
                      type="text"
                      value={formData[`attachment${num}`]}
                      onChange={(e) => setFormData({ ...formData, [`attachment${num}`]: e.target.value })}
                      className="w-full pl-5 pr-12 py-3.5 bg-gray-50/30 border border-gray-100 rounded-2xl text-[13px] font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] focus:bg-white outline-none transition-all shadow-sm group-hover:border-gray-200"
                      placeholder="e.g. invoice_template.pdf"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 group-hover:text-[#6b2bd9] transition-all">
                      <FiLayers size={14} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Message Body */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-8 w-1 bg-[#6b2bd9] rounded-full" />
                <h2 className="text-lg font-black text-gray-900 tracking-tight">Template Content</h2>
              </div>
              <div className="flex items-center gap-2">
                <FiInfo className="text-purple-400" size={14} />
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Tokens are supported (e.g. {'{{ Order.Number }}'})</span>
              </div>
            </div>

            <div className="border border-gray-200 rounded-[2.5rem] overflow-hidden focus-within:ring-2 focus-within:ring-[#6b2bd9]/10 focus-within:border-[#6b2bd9] transition-all bg-gray-50/20">
              <div className="px-8 py-4 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <FiCode /> HTML Rich Editor
                  </span>
                </div>
              </div>
              <textarea
                rows={18}
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                className="w-full px-10 py-10 text-[13px] font-medium text-gray-700 outline-none resize-none leading-relaxed font-mono bg-transparent"
                placeholder={"{% extends 'master' %}\n\n{% block 'body' %}\n<h1>Hello {{ Customer.FullName }},</h1>\n<p>Your order {{ Order.OrderNumber }} has been placed.</p>\n{% endblock %}"}
              />
            </div>
          </div>

          </div>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 text-[#6b2bd9] rounded-2xl shadow-sm">
                    <FiEye size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-gray-900 tracking-tight">Email Preview</h3>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Live visualization of your template</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-red-500 hover:border-red-100 transition-all active:scale-90"
                >
                  <FiPlus className="rotate-45" size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto bg-gray-50 flex flex-col">
                {/* Email Header Mockup */}
                <div className="bg-[#5a6268] text-white p-6 space-y-3 shadow-md z-10">
                   <div className="flex items-center gap-4 text-xs font-bold">
                     <span className="text-gray-400 w-12 uppercase tracking-widest text-[9px]">From:</span>
                     <span className="text-gray-100 italic">"{formData.emailAccount || 'Store Name'}" &lt;test@mail.com&gt;</span>
                   </div>
                   <div className="flex items-center gap-4 text-xs font-bold">
                     <span className="text-gray-400 w-12 uppercase tracking-widest text-[9px]">To:</span>
                     <span className="text-gray-100 italic">"{resolveTokens('{{ Customer.FullName }}') || 'Recipient'}" &lt;{formData.to || 'recipient@mail.com'}&gt;</span>
                   </div>
                   <div className="flex items-start gap-4 pt-4 border-t border-white/10">
                     <div className="text-sm font-black text-white flex-1 leading-snug">
                       {resolveTokens(formData.subject) || '(No Subject)'}
                     </div>
                     <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-300 group cursor-pointer hover:text-white transition-all">
                       Test-E-mail to... <FiChevronDown />
                     </div>
                   </div>
                </div>

                {/* Email Content Frame */}
                <div className="p-8 lg:p-16 flex justify-center">
                  <div className="w-full max-w-2xl bg-white shadow-xl rounded-3xl overflow-hidden border border-gray-200">
                    <div className="px-10 py-12 space-y-12 min-h-[500px]">
                      <div className="flex justify-center border-b border-gray-50 pb-8">
                        <img src={TruBuyLogo} alt="TruBuy Logo" className="h-10 transition-opacity whitespace-normal" />
                      </div>
                      
                      <div 
                        className="email-content-preview text-gray-700 leading-relaxed space-y-6"
                        dangerouslySetInnerHTML={{ __html: cleanBody(formData.body) || '<div class="text-gray-300 text-center py-20 font-black uppercase tracking-widest">Template is empty</div>' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-8 py-6 border-t border-gray-100 bg-gray-50/50 flex justify-end">
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-8 py-3 bg-[#6b2bd9] text-white rounded-2xl hover:bg-[#5b24b7] transition-all text-xs font-black uppercase tracking-widest shadow-lg shadow-purple-100"
                >
                  Close Preview
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const MessageTemplates = () => {
  const [view, setView] = useState('list');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [editingTemplate, setEditingTemplate] = useState(null);

  const [filters, setFilters] = useState({
    name: '',
    subject: '',
    store: 'All'
  });

  const [showSettings, setShowSettings] = useState(false);
  const [tableSettings, setTableSettings] = useState({
    rowLines: true,
    columnLines: false,
    striped: false,
    hover: true,
  });

  const [visibleColumns, setVisibleColumns] = useState({
    name: true,
    subject: true,
    limitedToStores: true,
    to: true,
    replyTo: true,
    bcc: true,
    isActive: true,
    onlySendManually: true,
  });

  const [templates, setTemplates] = useState([
    {
      id: '1',
      name: 'OrderPlaced.CustomerNotification',
      subject: 'New Order Received - {{ Order.Number }}',
      isActive: true,
      onlySendManually: false,
      limitedToStores: 'All Stores',
      to: '{{ Customer.Email }}',
      replyTo: '{{ Store.Email }}',
      bcc: 'admin@trubuy.com',
      body: `{% extends 'master' %}

{% block 'body' %}
<h1>
  Order Received - {{ Order.Number }}
</h1>
<p>
  Hello {{ Customer.FullName }}, your order has been successfully placed.
</p>
{% endblock %}`
    },
    {
      id: '2',
      name: 'ShipmentDelivered.CustomerNotification',
      subject: 'Your order has been delivered!',
      isActive: true,
      onlySendManually: false,
      limitedToStores: 'All Stores',
      to: '{{ Customer.Email }}',
      replyTo: '{{ Store.Email }}',
      bcc: '',
      body: `{% extends 'master' %}

{% block 'body' %}
<h1>
  Shipment Delivered
</h1>
<p>
  Great news {{ Customer.FullName }}, your shipment has arrived!
</p>
{% endblock %}`
    },
    {
      id: '3',
      name: 'Welcome.CustomerNotification',
      subject: 'Welcome to TruBuy!',
      isActive: true,
      onlySendManually: true,
      limitedToStores: 'All Stores',
      to: '{{ Customer.Email }}',
      replyTo: '{{ Store.Email }}',
      bcc: '',
      body: `{% extends 'master' %}

{% block 'body' %}
<h1>
  Welcome to TruBuy, {{ Customer.FullName }}!
</h1>
<p>
  We are excited to have you with us.
</p>
{% endblock %}`
    }
  ]);

  const filteredTemplates = useMemo(() => {
    return templates.filter(t => {
      const matchesName = !filters.name || t.name.toLowerCase().includes(filters.name.toLowerCase());
      const matchesSubject = !filters.subject || t.subject.toLowerCase().includes(filters.subject.toLowerCase());
      const matchesStore = filters.store === 'All' || t.limitedToStores === filters.store;
      return matchesName && matchesSubject && matchesStore;
    });
  }, [templates, filters]);

  const handleDelete = (id) => {
    if (window.confirm('Permanently delete this template?')) {
      setTemplates(templates.filter(t => t.id !== id));
      const newSelected = new Set(selectedIds);
      newSelected.delete(id);
      setSelectedIds(newSelected);
    }
  };

  const handleDeleteSelected = () => {
    if (window.confirm(`Permanently delete ${selectedIds.size} selected templates?`)) {
      setTemplates(templates.filter(t => !selectedIds.has(t.id)));
      setSelectedIds(new Set());
    }
  };

  const handleSaveTemplate = (data, continueEditing) => {
    if (editingTemplate) {
      setTemplates(templates.map(t => t.id === editingTemplate.id ? { ...data, id: t.id } : t));
    } else {
      const newTemplate = { ...data, id: Date.now().toString() };
      setTemplates([newTemplate, ...templates]);
    }

    if (!continueEditing) {
      setView('list');
      setEditingTemplate(null);
    }
  };

  const columns = [
    {
      key: 'checkbox',
      label: (
        <input
          type="checkbox"
          checked={selectedIds.size === filteredTemplates.length && filteredTemplates.length > 0}
          onChange={(e) => {
            if (e.target.checked) setSelectedIds(new Set(filteredTemplates.map(t => t.id)));
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
      key: 'name',
      label: 'Name',
      render: (v) => (
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gray-50 rounded-lg text-gray-400 group-hover:text-[#6b2bd9] transition-colors shadow-sm">
            <FiMail size={12} />
          </div>
          <span className="font-bold text-gray-800 tracking-tight">{v}</span>
        </div>
      )
    },
    {
      key: 'subject',
      label: 'Subject',
      render: (v) => <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest line-clamp-1">{v}</span>
    },
    {
      key: 'isActive',
      label: 'Active',
      render: (v) => (
        <div className="flex items-center justify-center">
          {v ? (
            <div className="p-1 bg-green-50 text-green-500 rounded-full"><FiCheck size={12} /></div>
          ) : (
            <div className="p-1 bg-red-50 text-red-400 rounded-full"><FiPlus className="rotate-45" size={12} /></div>
          )}
        </div>
      )
    },
    {
      key: 'onlySendManually',
      label: 'Only Send Manually',
      render: (v) => (
        <div className="flex items-center justify-center">
          {v ? (
            <div className="p-1 bg-purple-50 text-[#6b2bd9] rounded-full"><FiSend size={12} /></div>
          ) : (
            <span className="text-[10px] font-black text-gray-200 uppercase tracking-widest">—</span>
          )}
        </div>
      )
    },
    {
      key: 'limitedToStores',
      label: 'Stores',
      render: (v) => (
        <div className="flex items-center gap-2">
          <div className="p-1 bg-gray-50 rounded text-gray-400"><FiGlobe size={10} /></div>
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{v}</span>
        </div>
      )
    },
    {
      key: 'to',
      label: 'To',
      render: (v) => (
        <div className="flex items-center gap-2">
          <div className="p-1 bg-gray-50 rounded text-gray-400"><FiUser size={10} /></div>
          <span className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.1em]">{v}</span>
        </div>
      )
    },
    {
      key: 'replyTo',
      label: 'Reply To',
      render: (v) => (
        <div className="flex items-center gap-2">
          <div className="p-1 bg-gray-50 rounded text-gray-400"><FiRefreshCw size={10} /></div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">{v || '—'}</span>
        </div>
      )
    },
    {
      key: 'bcc',
      label: 'BCC',
      render: (v) => (
        <div className="flex items-center gap-2">
          <div className="p-1 bg-gray-50 rounded text-gray-400"><FiCode size={10} /></div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">{v || '—'}</span>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Action',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditingTemplate(row);
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

  const activeColumns = useMemo(() => {
    return columns.filter(col =>
      col.key === 'checkbox' ||
      col.key === 'actions' ||
      visibleColumns[col.key]
    );
  }, [columns, visibleColumns]);

  const resetSettings = () => {
    setTableSettings({
      rowLines: true,
      columnLines: false,
      striped: false,
      hover: true,
    });
    setVisibleColumns({
      name: true,
      subject: true,
      limitedToStores: true,
      to: true,
      replyTo: true,
      bcc: true,
      isActive: true,
      onlySendManually: true,
    });
  };

  if (view === 'add' || view === 'edit') {
    return (
      <MessageTemplateForm
        mode={view}
        initialData={editingTemplate}
        onClose={() => {
          setView('list');
          setEditingTemplate(null);
        }}
        onSave={handleSaveTemplate}
        onDelete={() => handleDelete(editingTemplate.id)}
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
                <FiLayers />
              </div>
              <div>
                <h1 className="text-sm font-bold text-gray-600 tracking-tight">Message Templates</h1>
              </div>
            </div>


            <AnimatePresence>
              {selectedIds.size > 0 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={handleDeleteSelected}
                  className="px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-red-100 active:scale-95 border-none"
                >
                  <FiTrash2 size={14} />
                  <span>Delete Selected ({selectedIds.size})</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-8 py-2.5 rounded-xl transition-all text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2 border active:scale-95 shadow-lg ${showFilters ? 'bg-[#6b2bd9] border-[#6b2bd9] text-white shadow-purple-100' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
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
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Name</label>
                  <input
                    type="text"
                    placeholder="Search by name..."
                    value={filters.name}
                    onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] outline-none transition-all shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Subject</label>
                  <input
                    type="text"
                    placeholder="Search by subject..."
                    value={filters.subject}
                    onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] outline-none transition-all shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Store</label>
                  <select
                    value={filters.store}
                    onChange={(e) => setFilters({ ...filters, store: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] outline-none shadow-sm appearance-none cursor-pointer"
                  >
                    <option value="All">All Stores</option>
                    <option value="Store 1">Store 1</option>
                    <option value="Store 2">Store 2</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-0 overflow-x-auto min-h-[400px]">
          <DataTable
            data={filteredTemplates}
            columns={activeColumns}
            pagination={true}
            itemsPerPage={10}
            rowLines={tableSettings.rowLines}
            columnLines={tableSettings.columnLines}
            striped={tableSettings.striped}
            hover={tableSettings.hover}
            className="border-none shadow-none rounded-none"
          />

          {filteredTemplates.length === 0 && (
            <div className="flex flex-col items-center justify-center p-24 bg-gray-50/20 space-y-4">
              <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 text-gray-200">
                <FiMail size={48} />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">No templates found</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Adjust filters or create a new message template</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-gray-50/10 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4 text-[10px] font-black text-gray-300 uppercase tracking-widest relative">
            <span>Displaying {filteredTemplates.length} templates</span>
          </div>
          <div className="relative">
            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.98 }}
                  className="absolute bottom-full right-0 mb-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 z-50 overflow-hidden"
                >
                  <div className="space-y-0.5 mb-4">
                    <TableSwitch label="Row lines" active={tableSettings.rowLines} onChange={(v) => setTableSettings({ ...tableSettings, rowLines: v })} />
                    <TableSwitch label="Column lines" active={tableSettings.columnLines} onChange={(v) => setTableSettings({ ...tableSettings, columnLines: v })} />
                    <TableSwitch label="Striped" active={tableSettings.striped} onChange={(v) => setTableSettings({ ...tableSettings, striped: v })} />
                    <TableSwitch label="Hover" active={tableSettings.hover} onChange={(v) => setTableSettings({ ...tableSettings, hover: v })} />
                  </div>

                  <div className="flex items-center gap-2 mb-6">
                    <button onClick={resetSettings} className="flex-1 py-1.5 text-[9px] font-black uppercase tracking-[0.1em] text-gray-500 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-100">
                      Reset
                    </button>
                    <button className="flex-1 py-1.5 text-[9px] font-black uppercase tracking-[0.1em] text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors border border-gray-200 flex items-center justify-center gap-1.5">
                      <FiMaximize2 size={10} /> Fit columns
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {Object.entries({
                      name: 'Name',
                      subject: 'Subject',
                      limitedToStores: 'Stores',
                      to: 'To',
                      replyTo: 'Reply To',
                      bcc: 'BCC',
                      isActive: 'Active',
                      onlySendManually: 'Manually'
                    }).map(([key, label]) => (
                      <ColumnCheckbox
                        key={key}
                        label={label}
                        active={visibleColumns[key]}
                        onChange={(v) => setVisibleColumns({ ...visibleColumns, [key]: v })}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-xl transition-all border shadow-sm active:scale-95 ${showSettings ? 'bg-[#6b2bd9] border-[#6b2bd9] text-white' : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50'}`}
            >
              <FiSettings size={18} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MessageTemplates;

