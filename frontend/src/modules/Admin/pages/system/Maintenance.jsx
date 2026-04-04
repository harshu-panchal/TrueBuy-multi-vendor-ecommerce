import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiTrash2,
  FiCalendar,
  FiTool,
  FiAlertTriangle,
  FiPlus,
  FiUpload,
  FiZap,
  FiServer,
  FiImage,
  FiUsers,
  FiFileText,
  FiDatabase
} from 'react-icons/fi';

const MaintenanceCard = ({ title, icon: Icon, actionButton, children }) => (
  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm flex flex-col">
    <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white rounded-xl border border-gray-100 shadow-sm text-primary-500">
          <Icon size={18} />
        </div>
        <h3 className="text-sm font-bold text-gray-800">{title}</h3>
      </div>
      {actionButton && <div>{actionButton}</div>}
    </div>
    <div className="p-6">
      {children}
    </div>
  </div>
);

const Maintenance = () => {
  const [guestForm, setGuestForm] = useState({ start: '', end: '2026-03-27', withoutCart: true });
  const [exportForm, setExportForm] = useState({ start: '', end: '' });
  const [sqlQuery, setSqlQuery] = useState('');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-20 text-left max-w-7xl mx-auto"
    >
      <div className="grid grid-cols-1 gap-6">
        
        {/* Clear Image Cache */}
        <MaintenanceCard
          title="Clear image cache"
          icon={FiImage}
          actionButton={
            <button className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-xs font-bold flex items-center gap-2 border border-gray-200 shadow-sm">
              <FiTrash2 size={14} className="text-gray-500" /> Clear cache
            </button>
          }
        >
          <div className="flex items-center gap-12">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">File count</p>
              <p className="text-lg font-bold text-gray-800">459</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total file size</p>
              <p className="text-lg font-bold text-gray-800">9.8 MB</p>
            </div>
          </div>
        </MaintenanceCard>

        {/* Deleting Guest Customers */}
        <MaintenanceCard
          title="Deleting guest customers"
          icon={FiUsers}
          actionButton={
            <button className="px-5 py-2 bg-gray-100 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-gray-700 rounded-lg transition-colors text-xs font-bold flex items-center gap-2 border border-gray-200 shadow-sm">
              <FiTrash2 size={14} className="text-gray-500" /> Delete
            </button>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-800 uppercase tracking-widest px-1">Start date</label>
              <div className="relative group">
                <FiCalendar className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  value={guestForm.start}
                  onChange={(e) => setGuestForm({ ...guestForm, start: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-500/20 outline-none transition-all shadow-sm text-gray-600"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-800 uppercase tracking-widest px-1">End date</label>
              <div className="relative group">
                <FiCalendar className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  value={guestForm.end}
                  onChange={(e) => setGuestForm({ ...guestForm, end: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-500/20 outline-none transition-all shadow-sm text-gray-600"
                />
              </div>
            </div>
            <div className="flex items-center gap-4 h-[46px] pb-2">
              <span className="text-[11px] font-bold text-gray-800">Only without shopping cart</span>
              <div 
                className={`w-11 h-6 rounded-full cursor-pointer relative transition-all duration-300 shadow-inner ${guestForm.withoutCart ? 'bg-orange-500' : 'bg-gray-200'}`}
                onClick={() => setGuestForm({ ...guestForm, withoutCart: !guestForm.withoutCart })}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${guestForm.withoutCart ? 'left-6' : 'left-1'}`} />
              </div>
            </div>
          </div>
        </MaintenanceCard>

        {/* Deleting Old Exported Files */}
        <MaintenanceCard
          title="Deleting old exported files"
          icon={FiFileText}
          actionButton={
            <button className="px-5 py-2 bg-gray-100 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-gray-700 rounded-lg transition-colors text-xs font-bold flex items-center gap-2 border border-gray-200 shadow-sm">
              <FiTrash2 size={14} className="text-gray-500" /> Delete
            </button>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-end">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-800 uppercase tracking-widest px-1">Start date</label>
              <div className="relative group">
                <FiCalendar className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  value={exportForm.start}
                  onChange={(e) => setExportForm({ ...exportForm, start: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-500/20 outline-none transition-all shadow-sm text-gray-600"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-800 uppercase tracking-widest px-1">End date</label>
              <div className="relative group">
                <FiCalendar className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  value={exportForm.end}
                  onChange={(e) => setExportForm({ ...exportForm, end: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary-500/20 outline-none transition-all shadow-sm text-gray-600"
                />
              </div>
            </div>
          </div>
        </MaintenanceCard>

        {/* Tree paths */}
        <MaintenanceCard
          title="Tree paths"
          icon={FiTool}
          actionButton={
            <button className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-xs font-bold flex items-center gap-2 border border-gray-200 shadow-sm">
              <FiTool size={14} className="text-gray-500" /> Check & repair
            </button>
          }
        >
          <p className="text-xs text-gray-500 leading-relaxed max-w-5xl">
            Tree paths provide quick access to hierarchically organized data records, such as product categories. In very rare cases, gaps can occur here, e.g. due to faulty migrations or imports. Problems with missing paths include products appearing in categories to which they are not assigned. If you experience such problems in your shop, you can generate the missing paths here.
          </p>
        </MaintenanceCard>

        {/* Database backups */}
        <MaintenanceCard
          title="Database backups"
          icon={FiDatabase}
        >
          <div className="space-y-6">
            <div className="p-4 bg-yellow-50 border border-yellow-200/60 rounded-xl flex items-start gap-4 shadow-sm">
               <div className="w-10 h-10 bg-orange-400 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm">
                  <span className="font-bold text-lg">!</span>
               </div>
               <p className="text-xs font-bold text-yellow-800 leading-relaxed pt-2">
                 Backing up and restoring databases is only possible if the database server (e.g. MS SQL Server or MySQL) and the physical location of the store installation are on the same server.
               </p>
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
               <div className="bg-gray-50/50 p-3 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <button className="text-xs font-bold text-gray-700 flex items-center gap-1.5 hover:text-primary-600 transition-colors">
                        <FiPlus size={14} /> Create backup
                     </button>
                     <button className="text-xs font-bold text-gray-700 flex items-center gap-1.5 hover:text-primary-600 transition-colors">
                        <FiUpload size={14} /> Upload backup
                     </button>
                  </div>
                  <button className="text-xs py-1 px-2 font-bold text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1.5">
                     <FiTrash2 size={12} /> Delete selected
                  </button>
               </div>
               <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs bg-white">
                     <thead>
                        <tr className="border-b border-gray-100">
                           <th className="px-4 py-3 font-bold text-gray-800">File name</th>
                           <th className="px-4 py-3 font-bold text-gray-800">Current version</th>
                           <th className="px-4 py-3 font-bold text-gray-800 flex items-center gap-1">TruBuy version ↓</th>
                           <th className="px-4 py-3 font-bold text-gray-800 flex items-center gap-1">Created on ↓</th>
                           <th className="px-4 py-3 font-bold text-gray-800">File size</th>
                        </tr>
                     </thead>
                     <tbody>
                        <tr>
                           <td colSpan="5" className="px-4 py-8 text-center text-gray-300 font-bold tracking-tight">No data</td>
                        </tr>
                     </tbody>
                  </table>
               </div>
               <div className="bg-gray-50 border-t border-gray-200 p-2 flex items-center justify-between text-gray-400">
                  <button className="p-1 hover:text-gray-600 transition-colors rounded"><svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><polyline points="1 4 1 10 7 10"></polyline><polyline points="23 20 23 14 17 14"></polyline><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path></svg></button>
                  <button className="p-1 hover:text-gray-600 transition-colors rounded"><svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg></button>
               </div>
            </div>
          </div>
        </MaintenanceCard>

        {/* Execute SQL Query directly on database */}
        <MaintenanceCard
          title="Execute SQL query directly on database"
          icon={FiZap}
          actionButton={
            <button className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-xs font-bold flex items-center gap-2 border border-gray-200 shadow-sm">
              <FiZap size={14} className="text-gray-500" /> Execute
            </button>
          }
        >
          <textarea
            value={sqlQuery}
            onChange={(e) => setSqlQuery(e.target.value)}
            placeholder="SQL Query"
            className="w-full h-48 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all shadow-sm font-mono resize-y placeholder:text-gray-400 placeholder:font-sans"
          />
        </MaintenanceCard>
        
      </div>
    </motion.div>
  );
};

export default Maintenance;
