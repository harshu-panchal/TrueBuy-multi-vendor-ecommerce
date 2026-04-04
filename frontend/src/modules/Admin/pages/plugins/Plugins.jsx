import React from 'react';
import { motion } from 'framer-motion';
import { FiCpu, FiPlus, FiBox } from 'react-icons/fi';

const Plugins = () => {
  const plugins = [
    { name: 'Payment Gateway', status: 'Active', version: '1.0.0' },
    { name: 'Email Provider', status: 'Active', version: '1.2.3' },
    { name: 'Tax Calculator', status: 'Inactive', version: '0.9.5' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-20"
    >
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Action Bar */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
              <FiCpu size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">System Plugins</h2>
              <p className="text-xs text-gray-500 font-semibold tracking-tight">Manage and configure your system extensions</p>
            </div>
          </div>

          <button className="px-6 py-2.5 bg-[#7e3af2] text-white rounded-xl hover:bg-[#6c2bd9] transition-all text-sm font-semibold flex items-center gap-2 shadow-lg shadow-purple-100 active:scale-95">
            <FiPlus className="text-lg" />
            <span>Install New Plugin</span>
          </button>
        </div>

        {/* Table Section */}
        <div className="p-0">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Plugin Name</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Version</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {plugins.map((plugin, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-gray-100 rounded-lg text-gray-500">
                        <FiBox size={14} />
                      </div>
                      <span className="text-sm font-bold text-gray-800">{plugin.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-semibold text-gray-500 tracking-widest">{plugin.version}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest ${
                      plugin.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {plugin.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-primary-600 text-xs font-bold hover:underline tracking-widest uppercase">Configure</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {plugins.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="p-6 bg-white rounded-full shadow-sm border border-gray-100 text-gray-300">
                <FiCpu size={48} />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-sm font-semibold text-gray-800 tracking-widest">No Plugins Installed</h3>
                <p className="text-xs text-gray-500 font-semibold tracking-tight">Get started by installing your first extension.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Meta */}
        <div className="p-4 px-6 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="text-[10px] font-semibold text-gray-500 tracking-widest uppercase">3 Plugins Loaded Successfully</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Plugins;
