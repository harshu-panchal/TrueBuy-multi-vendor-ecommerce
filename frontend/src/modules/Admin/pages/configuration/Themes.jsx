import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiLayout, 
  FiPlus, 
  FiSave, 
  FiRefreshCw, 
  FiUpload, 
  FiChevronDown, 
  FiEye, 
  FiEdit3, 
  FiCheck,
  FiSettings,
  FiImage,
  FiLink,
  FiArrowLeft,
  FiInfo
} from 'react-icons/fi';

const ThemeCard = ({ theme, isActive, onActivate }) => {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className={`bg-white rounded-3xl border ${isActive ? 'border-[#6b2bd9] ring-2 ring-[#6b2bd9]/10' : 'border-gray-100'} overflow-hidden shadow-sm hover:shadow-xl transition-all group`}
    >
      <div className="aspect-[4/3] bg-gray-50 relative overflow-hidden">
        <img 
          src={theme.preview} 
          alt={theme.name}
          className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700"
        />
        {isActive && (
          <div className="absolute top-4 right-4 p-2 bg-[#6b2bd9] text-white rounded-xl shadow-lg ring-4 ring-white">
            <FiCheck size={16} />
          </div>
        )}
      </div>

      <div className="p-6 space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-black text-gray-800 tracking-tight">{theme.name}</h3>
            {theme.parent && (
               <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  <FiLink size={10} />
                  <span>{theme.parent}</span>
               </div>
            )}
          </div>
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
             Author: <span className="text-gray-600">{theme.author}</span>, Version: <span className="text-gray-600">{theme.version}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isActive ? (
            <button className="flex-1 py-2.5 bg-gray-50 text-gray-400 border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 cursor-default">
               <FiCheck size={14} className="text-green-500" />
               <span>Active</span>
            </button>
          ) : (
            <button 
              onClick={() => onActivate(theme.id)}
              className="flex-1 py-2.5 bg-[#4a90e2] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#357abd] transition-all shadow-md active:scale-95"
            >
               Activate
            </button>
          )}
          
          <div className="flex items-center gap-2">
            <button className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-[#6b2bd9] hover:border-[#6b2bd9]/20 transition-all shadow-sm active:scale-95">
              <FiEye size={16} />
            </button>
            <button className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-[#6b2bd9] hover:border-[#6b2bd9]/20 transition-all shadow-sm active:scale-95">
              <FiEdit3 size={16} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Themes = () => {
  const [activeTab, setActiveTab] = useState('Settings');
  const [activeThemeId, setActiveThemeId] = useState(1);
  const [store, setStore] = useState('TruBuy');
  const [settings, setSettings] = useState({
    allowCustomerSelect: true,
    saveChoiceInCookie: false,
    assetBundling: 'Auto (Recommended)',
    assetCaching: 'Yes (Recommended)'
  });

  const handleToggle = (field) => {
    setSettings(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const themes = [
    { id: 1, name: 'Flex', author: 'SmartStore AG', version: '1.0', parent: null, preview: 'https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&q=80&w=600' },
    { id: 2, name: 'Flex Blue', author: 'SmartStore AG', version: '1.0', parent: 'Flex', preview: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=600' },
    { id: 3, name: 'Flex Black', author: 'SmartStore AG', version: '1.0', parent: 'Flex', preview: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=600' },
  ];

  return (
    <div className="space-y-6 pb-20 text-left">
      {/* Header Orchestration synchronized with Plans.jsx */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-visible relative">
        <div className="p-4 border-b border-gray-100 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3 pr-4 border-r border-gray-100">
              <div className="p-2 bg-purple-50 text-[#6b2bd9] rounded-lg shadow-sm">
                <FiLayout size={20} />
              </div>
              <div>
                <h1 className="text-sm font-bold text-gray-600 tracking-tight">Themes</h1>
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Presentation & Branding</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <button className="px-6 py-2 bg-[#6b2bd9] text-white rounded-xl hover:bg-[#5b24b7] transition-all text-sm font-bold flex items-center gap-2 shadow-sm active:scale-95">
                <FiSave size={16} />
                <span>Save</span>
             </button>
             <button className="px-6 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all text-sm font-bold flex items-center gap-2 shadow-sm active:scale-95">
                <FiRefreshCw size={16} className="text-[#6b2bd9]" />
                <span>Reload themes</span>
             </button>
             <button className="px-6 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all text-sm font-bold flex items-center gap-2 shadow-sm active:scale-95">
                <FiUpload size={16} className="text-[#6b2bd9]" />
                <span>Upload theme</span>
             </button>
          </div>
        </div>

        {/* Store Selection */}
        <div className="p-6 sm:p-10 border-b border-gray-50 bg-gray-50/10">
          <div className="flex items-center justify-center">
            <div className="w-full max-w-4xl flex items-center gap-6 group">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest min-w-[60px]">Store</label>
               <div className="relative flex-1">
                  <select 
                    value={store}
                    onChange={(e) => setStore(e.target.value)}
                    className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-[#6b2bd9]/10 focus:border-[#6b2bd9] outline-none shadow-sm appearance-none cursor-pointer group-hover:border-[#6b2bd9]/20 transition-all"
                  >
                    <option value="TruBuy">TruBuy</option>
                    <option value="Global Store">Global Store</option>
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <FiChevronDown size={18} />
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-10 flex items-center gap-8 border-b border-gray-100 h-16">
          {['Themes', 'Settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative h-full flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                activeTab === tab ? 'text-[#6b2bd9]' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab === 'Themes' ? <FiImage size={14} /> : <FiSettings size={14} />}
              <span>{tab}</span>
              {activeTab === tab && (
                <motion.div 
                  layoutId="tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-[#6b2bd9] rounded-t-full shadow-[0_-2px_10px_rgba(107,43,217,0.3)]"
                />
              )}
            </button>
          ))}
        </div>

        {/* Dynamic Content */}
        <div className="p-10 min-h-[500px]">
          <AnimatePresence mode="wait">
            {activeTab === 'Themes' ? (
              <motion.div
                key="themes-grid"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                 <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black text-gray-800 tracking-tight">Installed themes</h2>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {themes.map(theme => (
                      <ThemeCard 
                        key={theme.id} 
                        theme={theme} 
                        isActive={theme.id === activeThemeId}
                        onActivate={setActiveThemeId}
                      />
                    ))}
                 </div>
              </motion.div>
            ) : (
              <motion.div
                key="settings-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-10 max-w-5xl text-left"
              >
                <div className="space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center py-6 border-b border-gray-100">
                    <div className="col-span-1 md:col-span-1">
                       <h3 className="text-sm font-bold text-gray-700 tracking-wider">Allow customers to select a theme</h3>
                    </div>
                    <div className="col-span-1 md:col-span-2 flex justify-start">
                       <button
                         onClick={() => handleToggle('allowCustomerSelect')}
                         className={`w-12 h-6 rounded-full relative transition-all shadow-inner ${settings.allowCustomerSelect ? 'bg-[#f39c12]' : 'bg-gray-200 border border-gray-300'}`}
                       >
                         <div className={`absolute top-1 w-4 h-4 rounded-full transition-all shadow-sm ${settings.allowCustomerSelect ? 'bg-white left-7' : 'bg-white border border-gray-300 left-1'}`} />
                       </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center py-6 border-b border-gray-100">
                    <div className="col-span-1 md:col-span-1">
                       <h3 className="text-sm font-bold text-gray-700 tracking-wider">Save theme choice in cookie</h3>
                    </div>
                    <div className="col-span-1 md:col-span-2 flex justify-start">
                       <button
                         onClick={() => handleToggle('saveChoiceInCookie')}
                         className={`w-12 h-6 rounded-full relative transition-all shadow-inner ${settings.saveChoiceInCookie ? 'bg-[#f39c12]' : 'bg-gray-100 border border-gray-200'}`}
                       >
                         <div className={`absolute top-0.5 w-5 h-5 rounded-full transition-all shadow-sm ${settings.saveChoiceInCookie ? 'bg-white left-[22px]' : 'bg-white border border-gray-200 left-0.5'}`} />
                       </button>
                    </div>
                  </div>
                </div>

                <div className="rounded-md overflow-hidden shadow-sm flex mt-8">
                   <div className="bg-[#337ab7] p-6 flex flex-col items-center justify-start text-white">
                      <div className="font-serif italic text-2xl font-bold leading-none">i</div>
                   </div>
                   <div className="bg-[#d9edf7] p-6 flex-1 flex flex-col justify-center">
                      <h4 className="text-[15px] font-semibold text-[#31708f] mb-1">Design & Test</h4>
                      <p className="text-[13px] text-[#31708f]">Disable resource bundling and caching in order to test and debug theme changes more easily.</p>
                   </div>
                </div>

                <div className="space-y-2 mt-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center py-6 border-b border-gray-100">
                    <div className="col-span-1">
                       <h3 className="text-sm font-bold text-gray-700 tracking-wider">Enable asset bundling</h3>
                    </div>
                    <div className="col-span-1 md:col-span-2 relative">
                       <select 
                         value={settings.assetBundling}
                         onChange={(e) => setSettings({...settings, assetBundling: e.target.value})}
                         className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-md text-sm text-gray-500 font-semibold focus:ring-2 focus:ring-blue-100 focus:border-[#357abd] outline-none shadow-sm appearance-none cursor-pointer transition-all hover:border-gray-300"
                       >
                         <option value="Auto (Recommended)">Auto (Recommended)</option>
                         <option value="Always">Always</option>
                         <option value="Never">Never</option>
                       </select>
                       <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                         <FiChevronDown size={14} />
                       </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center py-6 border-b border-gray-100">
                    <div className="col-span-1">
                       <h3 className="text-sm font-bold text-gray-700 tracking-wider">Enable asset caching</h3>
                    </div>
                    <div className="col-span-1 md:col-span-2 relative">
                       <select 
                         value={settings.assetCaching}
                         onChange={(e) => setSettings({...settings, assetCaching: e.target.value})}
                         className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-md text-sm text-gray-500 font-semibold focus:ring-2 focus:ring-blue-100 focus:border-[#357abd] outline-none shadow-sm appearance-none cursor-pointer transition-all hover:border-gray-300"
                       >
                         <option value="Yes (Recommended)">Yes (Recommended)</option>
                         <option value="No">No</option>
                       </select>
                       <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                         <FiChevronDown size={14} />
                       </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center py-6">
                     <div className="col-span-1"></div>
                     <div className="col-span-1 md:col-span-2 flex justify-start">
                        <button className="px-5 py-2 bg-[#d33a10] text-white rounded-md hover:bg-[#b0300c] transition-all text-sm font-bold shadow-sm active:scale-95">
                           Clear asset cache
                        </button>
                     </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Themes;
