import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCheck, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import AnimatedSelect from '../../components/AnimatedSelect';

const Toggle = ({ name, checked, onChange }) => (
  <button
    type="button"
    onClick={() => onChange({ target: { name, checked: !checked, type: 'checkbox' } })}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${checked ? 'bg-green-600' : 'bg-gray-200'}`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`}
    />
  </button>
);

const NumberInput = ({ name, value, onChange, placeholder }) => {
  const inputRef = useRef(null);

  const handleIncrement = (e) => {
    if (e) e.preventDefault();
    const val = parseFloat(value || 0) + 1;
    onChange({ target: { name, value: val.toString(), type: 'text' } });
    inputRef.current?.focus();
  };

  const handleDecrement = (e) => {
    if (e) e.preventDefault();
    const val = Math.max(0, parseFloat(value || 0) - 1);
    onChange({ target: { name, value: val.toString(), type: 'text' } });
    inputRef.current?.focus();
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      handleIncrement();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      handleDecrement();
    }
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="number"
        name={name}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className={`w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${!value ? 'italic text-gray-400' : 'text-gray-900'}`}
      />
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col items-center">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleIncrement}
          className="hover:bg-gray-100 rounded p-0.5 transition-colors"
        >
          <FiChevronUp className="text-gray-400 text-xs" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleDecrement}
          className="hover:bg-gray-100 rounded p-0.5 transition-colors"
        >
          <FiChevronDown className="text-gray-400 text-xs" />
        </button>
      </div>
    </div>
  );
};

const RoleForm = ({ onBack, onSave }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState({
    name: '',
    systemName: '',
    active: true,
    freeShipping: false,
    minOrderTotal: '',
    maxOrderTotal: '',
    taxDisplayType: '',
    taxExempt: false,
    isSystemRole: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'acl', label: 'Access control list' },
    { id: 'customers', label: 'Customers' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 flex items-center justify-center w-10 h-10 relative z-20"
            title="Back to Roles"
          >
            <FiArrowLeft className="text-xl text-gray-600" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Add a new customer role</h1>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => onSave(formData)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors font-medium text-sm"
          >
            <FiCheck />
            <span>Save</span>
          </button>
          <button
            className="flex-1 sm:flex-none px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors font-medium text-sm"
          >
            Save and Continue Edit
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 text-sm font-semibold transition-colors border-b-2 ${activeTab === tab.id ? 'border-green-600 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
        {activeTab === 'general' && (
          <div className="max-w-4xl space-y-8">
            {/* Name */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              <label className="text-sm font-medium text-gray-700">Name</label>
              <div className="md:col-span-3">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
              </div>
            </div>

            {/* System Name */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              <label className="text-sm font-medium text-gray-700">System name</label>
              <div className="md:col-span-3">
                <input
                  type="text"
                  name="systemName"
                  value={formData.systemName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
              </div>
            </div>

            {/* Active */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              <label className="text-sm font-medium text-gray-700">Active</label>
              <div className="md:col-span-3">
                <Toggle name="active" checked={formData.active} onChange={handleChange} />
              </div>
            </div>

            {/* Free Shipping */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              <label className="text-sm font-medium text-gray-700">Free shipping</label>
              <div className="md:col-span-3">
                <Toggle name="freeShipping" checked={formData.freeShipping} onChange={handleChange} />
              </div>
            </div>

            {/* Minimum Order Total */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              <label className="text-sm font-medium text-gray-700">Minimum order total</label>
              <div className="md:col-span-3">
                <NumberInput
                  name="minOrderTotal"
                  value={formData.minOrderTotal}
                  onChange={handleChange}
                  placeholder="Empty"
                />
              </div>
            </div>

            {/* Maximum Order Total */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              <label className="text-sm font-medium text-gray-700">Maximum order total</label>
              <div className="md:col-span-3">
                <NumberInput
                  name="maxOrderTotal"
                  value={formData.maxOrderTotal}
                  onChange={handleChange}
                  placeholder="Empty"
                />
              </div>
            </div>

            {/* Tax Display Type */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              <label className="text-sm font-medium text-gray-700">Tax display type</label>
              <div className="md:col-span-3">
                <AnimatedSelect
                  name="taxDisplayType"
                  value={formData.taxDisplayType}
                  onChange={handleChange}
                  placeholder="Please select"
                  options={[
                    { value: 'including', label: 'Including Tax' },
                    { value: 'excluding', label: 'Excluding Tax' }
                  ]}
                />
              </div>
            </div>

            {/* Tax Exempt */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              <label className="text-sm font-medium text-gray-700">Tax exempt</label>
              <div className="md:col-span-3">
                <Toggle name="taxExempt" checked={formData.taxExempt} onChange={handleChange} />
              </div>
            </div>

            {/* Is System Role */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center border-t border-gray-50 pt-8 mt-8">
              <label className="text-sm font-medium text-gray-700">Is system role</label>
              <div className="md:col-span-3 text-sm text-gray-600">No</div>
            </div>
          </div>
        )}

        {activeTab === 'acl' && (
          <div className="py-20 text-center text-gray-500 font-medium">
            In order to proceed, the record must be saved first.
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="py-20 text-center text-gray-500 font-medium">
            In order to proceed, the record must be saved first.
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default RoleForm;
