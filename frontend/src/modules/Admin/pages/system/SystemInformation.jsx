import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiServer, 
  FiInfo, 
  FiCpu, 
  FiDatabase, 
  FiChevronDown, 
  FiChevronUp,
  FiRefreshCw,
  FiChevronRight,
  FiArrowUp
} from 'react-icons/fi';

const InfoRow = ({ label, value, action, isExpandable }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="py-4 border-b border-gray-100 last:border-0 flex flex-col sm:flex-row sm:items-center">
      <div className="w-full sm:w-1/3 mb-2 sm:mb-0">
        <span className="text-[11px] font-black font-bold uppercase text-gray-500 tracking-widest">{label}</span>
      </div>
      <div className="w-full sm:w-2/3 flex flex-wrap items-center gap-4">
        {value && <span className="text-sm font-bold text-gray-800 tracking-tight">{value}</span>}
        
        {action && (
          <button className="text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors">
            {action}
          </button>
        )}

        {isExpandable && (
          <div className="w-full sm:w-auto mt-2 sm:mt-0">
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-4 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <FiChevronDown className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
              {isExpandable}
            </button>
            
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="w-full mt-3 overflow-hidden"
                >
                  <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-500 font-mono overflow-auto max-h-48">
                    // Internal system mapping data for {label} would render here
                    <br />
                    Data matrix expansion placeholder...
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

const SystemInformation = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-20 text-left max-w-6xl mx-auto"
    >
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 overflow-hidden">
        {/* Core Info Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h3 className="text-[11px] font-bold uppercase text-gray-500 tracking-widest flex items-center gap-2">
            <FiInfo className="text-blue-500" /> General Application Telemetry
          </h3>
          <button className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 text-gray-400 hover:text-gray-600 transition-colors">
            <FiRefreshCw size={10} /> Sync
          </button>
        </div>
        
        <div className="p-6 sm:p-8">
          <InfoRow label="TruBuy version" value="5.1.0.0" action="Check for update" />
          <InfoRow label="Created on" value="Tuesday, February 17, 2026 5:57:46 PM" />
          <InfoRow label="IP address" value="70.39.90.73" />
          <InfoRow label="Server time zone" value="Pacific Standard Time" />
          <InfoRow label="Server local time" value="Friday, April 3, 2026 4:27:10 AM" />
          <InfoRow label="Greenwich Mean Time (GMT/UTC)" value="Friday, April 3, 2026 11:27:10 AM" />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h3 className="text-[11px] font-bold uppercase text-gray-500 tracking-widest flex items-center gap-2">
            <FiCpu className="text-emerald-500" /> Host Environment
          </h3>
        </div>
        
        <div className="p-6 sm:p-8">
          <InfoRow label="Operating system" value="Microsoft Windows 10.0.20348 (x64)" />
          <InfoRow label="ASP.NET info" value=".NET 8.0.10" />
          <InfoRow 
            label="Used memory (RAM)" 
            value={
              <span className="flex items-center gap-1">
                393.9 MB <FiArrowUp className="text-red-500" size={14} />
              </span>
            } 
            action="Collect" 
          />
          <InfoRow label="HTTP Header" isExpandable="Show" />
          <InfoRow label="Environment variables" isExpandable="Show" />
          <InfoRow label="Loaded assemblies" isExpandable="Show (394)" />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h3 className="text-[11px] font-bold uppercase text-gray-500 tracking-widest flex items-center gap-2">
            <FiDatabase className="text-orange-500" /> Database Engine
          </h3>
        </div>
        
        <div className="p-6 sm:p-8">
          <InfoRow 
            label="Database" 
            value={
              <div className="max-w-2xl leading-relaxed">
                Microsoft SQL Server 2022 (RTM) - 16.0.1000.6 (X64) Oct 8 2022 05:58:25 Copyright (C) 2022 Microsoft Corporation Web Edition (64-bit) on Windows Server 2022 Standard 10.0 &lt;X64&gt; (Build 20348: ) (Hypervisor)
              </div>
            }
          />
          <InfoRow label="Size of database" value="268.3 MB" action="Shrink" />
          <InfoRow label="Table statistics" isExpandable="Show" />
        </div>
      </div>
      
    </motion.div>
  );
};

export default SystemInformation;
