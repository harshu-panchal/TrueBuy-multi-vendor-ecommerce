import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSettings, 
  FiEdit2, 
  FiZap, 
  FiChevronDown,
  FiShield,
  FiExternalLink,
  FiMoreVertical,
  FiCheckCircle,
  FiLogOut
} from 'react-icons/fi';
import { 
  FaXTwitter, 
  FaMicrosoft, 
  FaGoogle, 
  FaFacebook 
} from 'react-icons/fa6';

const ExternalAuthenticationMethods = () => {
  const [activeMenu, setActiveMenu] = useState(null);

  const authMethods = [
    {
      id: "Smartstore.Twitter.Auth",
      name: "X (Twitter) Login",
      description: "Adds X (Twitter) authentication to the store.",
      icon: <FaXTwitter className="text-black" />,
      theme: "bg-black",
      lightTheme: "bg-gray-50",
      accent: "text-black"
    },
    {
      id: "Smartstore.Microsoft.Auth",
      name: "Microsoft Login",
      description: "Adds Microsoft authentication to the store.",
      icon: <FaMicrosoft className="text-[#00a1f1]" />,
      theme: "bg-[#00a1f1]",
      lightTheme: "bg-blue-50",
      accent: "text-blue-600"
    },
    {
      id: "Smartstore.Google.Auth",
      name: "Google Login",
      description: "Adds Google authentication to the store.",
      icon: <FaGoogle className="text-[#ea4335]" />,
      theme: "bg-[#ea4335]",
      lightTheme: "bg-red-50",
      accent: "text-red-600"
    },
    {
      id: "Smartstore.Facebook.Auth",
      name: "Facebook Login",
      description: "Adds Facebook authentication to the store.",
      icon: <FaFacebook className="text-[#1877f2]" />,
      theme: "bg-[#1877f2]",
      lightTheme: "bg-blue-50",
      accent: "text-blue-700"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Mobile Header */}
      <div className="lg:hidden">
        <h1 className="text-2xl font-bold text-gray-800">External Authentication</h1>
        <p className="text-sm text-gray-500">Configure third-party login providers</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary-600">
            <div className="p-2 bg-primary-50 rounded-lg"><FiShield /></div>
            <span className="text-sm font-bold text-gray-600">Authentication Gateways</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black text-gray-300 uppercase tracking-widest">
            {authMethods.length} Methods Available
          </div>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {authMethods.map((method, index) => (
            <motion.div
              key={method.id}
              variants={itemVariants}
              className="group bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-primary-100 transition-all duration-500 flex flex-col h-full relative"
            >
              {/* Card Header Background Pattern */}
              <div className={`h-24 ${method.lightTheme} relative overflow-hidden flex items-center justify-center`}>
                <div className="absolute inset-0 opacity-[0.03] transition-transform duration-700 group-hover:scale-110">
                   <div className="grid grid-cols-4 gap-2 rotate-12 -translate-y-4">
                      {[...Array(12)].map((_, i) => (
                        <div key={i} className="w-8 h-8 rounded-full bg-current" />
                      ))}
                   </div>
                </div>
                <div className="relative text-4xl p-4 bg-white rounded-2xl shadow-lg transform group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500">
                  {method.icon}
                </div>
              </div>

              <div className="p-5 flex flex-col flex-1 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-gray-800 uppercase tracking-tight">{method.name}</h3>
                  <div className="flex items-center gap-1.5">
                     <span className="text-[10px] font-mono font-black text-gray-300 bg-gray-50 px-1.5 py-0.5 rounded tracking-tighter">ID:</span>
                     <span className="text-[10px] font-mono font-bold text-gray-400">{method.id}</span>
                  </div>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed min-h-[40px]">
                  {method.description}
                </p>

                <div className="pt-4 border-t border-gray-50 flex items-center gap-2 mt-auto">
                  <button className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary-700 transition-all shadow-lg shadow-primary-100 active:scale-95 flex items-center justify-center gap-2">
                    <FiZap size={14} />
                    Activate
                  </button>

                  <div className="relative">
                    <button 
                      onClick={() => setActiveMenu(activeMenu === index ? null : index)}
                      className={`p-2.5 rounded-xl border transition-all ${activeMenu === index ? 'bg-gray-100 border-gray-300 text-gray-800' : 'bg-gray-50 border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                    >
                      <FiSettings size={16} />
                    </button>

                    <AnimatePresence>
                      {activeMenu === index && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setActiveMenu(null)} />
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="absolute bottom-full right-0 mb-3 w-40 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 p-1.5"
                          >
                            <button className="w-full text-left px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-600 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors flex items-center gap-2">
                              <FiEdit2 size={12} /> Edit
                            </button>
                            <button className="w-full text-left px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-600 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors flex items-center gap-2">
                              <FiSettings size={12} /> Configure
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="absolute top-3 right-3">
                 <div className="w-2 h-2 rounded-full bg-gray-300 ring-4 ring-white" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between px-6">
           <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <FiCheckCircle className="text-gray-200" /> Secure OAuth2 Implementation
           </div>
           <button className="text-[10px] font-black text-primary-600 uppercase tracking-widest hover:underline flex items-center gap-1.5">
              Documentation <FiExternalLink />
           </button>
        </div>
      </div>
    </div>
  );
};

export default ExternalAuthenticationMethods;
