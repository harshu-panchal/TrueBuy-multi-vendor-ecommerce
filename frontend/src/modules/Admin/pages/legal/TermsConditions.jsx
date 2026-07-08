import { useState, useEffect } from 'react';
import { FiSave, FiFileText } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useSettingsStore } from '../../../../shared/store/settingsStore';

const TermsConditions = () => {
  const { settings, updateSettings, isLoading } = useSettingsStore();
  const [activeTab, setActiveTab] = useState('user');
  
  // Local state to hold the content for all 3 panels while editing
  const [content, setContent] = useState({
    user: '',
    vendor: '',
    delivery: ''
  });

  useEffect(() => {
    if (settings?.content?.termsConditions) {
      // If it's still a string (legacy), convert it safely
      if (typeof settings.content.termsConditions === 'string') {
        setContent({
          user: settings.content.termsConditions,
          vendor: '',
          delivery: ''
        });
      } else {
        setContent(settings.content.termsConditions);
      }
    }
  }, [settings]);

  const handleSave = async () => {
    await updateSettings('content', {
      ...settings.content,
      termsConditions: content
    });
  };

  const tabs = [
    { id: 'user', label: 'User App' },
    { id: 'vendor', label: 'Vendor Portal' },
    { id: 'delivery', label: 'Delivery Partner App' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Terms & Conditions</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage terms and conditions for each panel</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 gradient-green text-white rounded-lg hover:shadow-glow-green transition-all font-semibold text-sm disabled:opacity-50"
        >
          <FiSave />
          <span>{isLoading ? 'Saving...' : 'Save Policy'}</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-primary-500 text-primary-600 bg-white'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <FiFileText className="text-primary-600" />
            <h3 className="font-semibold text-gray-800">
              {tabs.find(t => t.id === activeTab)?.label} Terms Content
            </h3>
          </div>
          <textarea
            value={content[activeTab] || ''}
            onChange={(e) => setContent(prev => ({ ...prev, [activeTab]: e.target.value }))}
            rows={20}
            placeholder={`Enter terms and conditions for ${tabs.find(t => t.id === activeTab)?.label}...`}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default TermsConditions;
