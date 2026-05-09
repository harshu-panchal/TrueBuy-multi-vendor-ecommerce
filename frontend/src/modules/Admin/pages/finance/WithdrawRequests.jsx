import { useState, useEffect } from 'react';
import { 
  FiDollarSign, 
  FiCheck, 
  FiX, 
  FiClock, 
  FiFilter, 
  FiSearch, 
  FiUser, 
  FiTruck, 
  FiShoppingBag,
  FiExternalLink,
  FiAlertCircle
} from 'react-icons/fi';
import { 
  getAdminWithdrawRequests, 
  getAdminFinanceStats, 
  processWithdrawRequest 
} from '../../services/adminService';
import { formatPrice } from '../../../../shared/utils/helpers';
import Badge from '../../../../shared/components/Badge';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const WithdrawRequests = () => {
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Action Modal State
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionType, setActionType] = useState(null); // 'approve', 'reject', 'complete'
  const [adminNote, setAdminNote] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reqs, financeStats] = await Promise.all([
        getAdminWithdrawRequests({ status: filter }),
        getAdminFinanceStats()
      ]);
      setRequests(reqs?.requests || []);
      setStats(financeStats);
    } catch (err) {
      console.error('Error loading admin finance data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filter]);

  const handleAction = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;

    setIsProcessing(true);
    try {
      const payload = { 
        adminNote,
        ...(actionType === 'complete' && { transactionId })
      };
      
      await processWithdrawRequest(selectedRequest._id, actionType, payload);
      toast.success(`Request ${actionType}ed successfully!`);
      setSelectedRequest(null);
      setAdminNote('');
      setTransactionId('');
      loadData();
    } catch (err) {
      // Error handled by api
    } finally {
      setIsProcessing(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Vendor': return <FiShoppingBag className="text-blue-500" />;
      case 'DeliveryBoy': return <FiTruck className="text-purple-500" />;
      default: return <FiUser />;
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Money Withdrawal Requests</h1>
          <p className="text-sm text-gray-500">Manage payouts for Vendors and Delivery Partners</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
           {['pending', 'approved', 'completed', 'rejected'].map((s) => (
             <button
               key={s}
               onClick={() => setFilter(s)}
               className={`px-4 py-2 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${
                 filter === s 
                  ? 'bg-primary-600 text-white shadow-md' 
                  : 'text-gray-500 hover:bg-gray-100'
               }`}
             >
               {s}
             </button>
           ))}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <StatCard 
            title="Pending Payouts" 
            value={formatPrice(stats?.pendingTotal || 0)} 
            count={stats?.pendingCount || 0}
            icon={<FiClock className="text-amber-500" />}
            color="amber"
         />
         <StatCard 
            title="Approved (To be Paid)" 
            value={formatPrice(stats?.approvedTotal || 0)} 
            count={stats?.approvedCount || 0}
            icon={<FiCheck className="text-blue-500" />}
            color="blue"
         />
         <StatCard 
            title="Total Settled" 
            value={formatPrice(stats?.completedTotal || 0)} 
            count={stats?.completedCount || 0}
            icon={<FiCheckCircle className="text-emerald-500" />}
            color="emerald"
         />
         <StatCard 
            title="Rejected" 
            value={formatPrice(stats?.rejectedTotal || 0)} 
            count={stats?.rejectedCount || 0}
            icon={<FiX className="text-rose-500" />}
            color="rose"
         />
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
         <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
               <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
               <input 
                 type="text" 
                 placeholder="Search by name or email..."
                 className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
               <FiFilter /> More Filters
            </button>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                     <th className="px-6 py-4">Partner</th>
                     <th className="px-6 py-4">Amount</th>
                     <th className="px-6 py-4">Request Date</th>
                     <th className="px-6 py-4">Balance Info</th>
                     <th className="px-6 py-4">Status</th>
                     <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    [1,2,3,4,5].map(i => <tr key={i} className="animate-pulse">
                      <td colSpan="6" className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-full"></div></td>
                    </tr>)
                  ) : requests.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                         <FiDollarSign className="mx-auto text-4xl mb-2 opacity-20" />
                         No withdrawal requests found for this filter.
                      </td>
                    </tr>
                  ) : (
                    requests.filter(r => 
                      r.requester?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      r.requester?.email?.toLowerCase().includes(searchTerm.toLowerCase())
                    ).map(req => (
                      <tr key={req._id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600 relative">
                                 {req.requester?.name?.charAt(0)}
                                 <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-sm">
                                    {getRoleIcon(req.requesterModel)}
                                 </div>
                              </div>
                              <div>
                                 <p className="text-sm font-bold text-gray-800">{req.requester?.name}</p>
                                 <p className="text-[10px] text-gray-500">{req.requester?.email}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <p className="text-sm font-black text-primary-700">{formatPrice(req.amount)}</p>
                        </td>
                        <td className="px-6 py-4">
                           <p className="text-xs text-gray-600">{new Date(req.createdAt).toLocaleDateString()}</p>
                           <p className="text-[10px] text-gray-400">{new Date(req.createdAt).toLocaleTimeString()}</p>
                        </td>
                        <td className="px-6 py-4">
                           <div className="space-y-1">
                              <p className="text-[10px] text-gray-400 flex items-center justify-between gap-4">
                                 Total Earned: <span className="font-bold text-gray-600">{formatPrice(req.requester?.totalEarnings || 0)}</span>
                              </p>
                              <div className="w-24 h-1 bg-gray-100 rounded-full overflow-hidden">
                                 <div 
                                    className="h-full bg-primary-500" 
                                    style={{ width: `${Math.min(100, ((req.requester?.totalWithdrawn || 0) / (req.requester?.totalEarnings || 1)) * 100)}%` }}
                                 />
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <Badge variant={
                              req.status === 'completed' ? 'success' : 
                              req.status === 'pending' ? 'warning' : 
                              req.status === 'approved' ? 'info' : 'error'
                           }>
                              {req.status}
                           </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <div className="flex items-center justify-end gap-2">
                              {req.status === 'pending' && (
                                <>
                                  <button 
                                    onClick={() => { setSelectedRequest(req); setActionType('approve'); }}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Approve Request"
                                  >
                                    <FiCheck />
                                  </button>
                                  <button 
                                    onClick={() => { setSelectedRequest(req); setActionType('reject'); }}
                                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                    title="Reject Request"
                                  >
                                    <FiX />
                                  </button>
                                </>
                              )}
                              {req.status === 'approved' && (
                                <button 
                                  onClick={() => { setSelectedRequest(req); setActionType('complete'); }}
                                  className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-100"
                                >
                                  SETTLE NOW
                                </button>
                              )}
                              <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
                                 <FiExternalLink />
                              </button>
                           </div>
                        </td>
                      </tr>
                    ))
                  )}
               </tbody>
            </table>
         </div>
      </div>

      {/* Action Modal */}
      <AnimatePresence>
        {selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setSelectedRequest(null)}
               className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
             />
             <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.9, opacity: 0, y: 20 }}
               className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
             >
                <div className={`p-6 text-white ${
                  actionType === 'approve' ? 'bg-blue-600' : 
                  actionType === 'reject' ? 'bg-rose-600' : 'bg-emerald-600'
                }`}>
                   <h3 className="text-xl font-bold flex items-center gap-2 capitalize">
                      {actionType} Payout Request
                   </h3>
                   <p className="text-white/80 text-sm mt-1">
                      Request ID: {selectedRequest._id}
                   </p>
                </div>

                <form onSubmit={handleAction} className="p-6 space-y-6">
                   <div className="bg-gray-50 p-4 rounded-xl space-y-2">
                      <div className="flex justify-between text-xs">
                         <span className="text-gray-500">Partner:</span>
                         <span className="font-bold text-gray-800">{selectedRequest.requester?.name}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                         <span className="text-gray-500">Amount:</span>
                         <span className="font-black text-gray-900 text-base">{formatPrice(selectedRequest.amount)}</span>
                      </div>
                   </div>

                   {actionType === 'complete' && (
                     <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Transaction ID / Ref</label>
                        <input 
                           type="text"
                           value={transactionId}
                           onChange={(e) => setTransactionId(e.target.value)}
                           placeholder="Enter Bank Transfer ID"
                           className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                           required
                        />
                     </div>
                   )}

                   <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                        {actionType === 'reject' ? 'Reason for Rejection' : 'Admin Note (Optional)'}
                      </label>
                      <textarea 
                         value={adminNote}
                         onChange={(e) => setAdminNote(e.target.value)}
                         placeholder={actionType === 'reject' ? "Please explain why..." : "Any message for the partner?"}
                         className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none h-24 focus:ring-2 outline-none"
                         required={actionType === 'reject'}
                      />
                   </div>

                   {actionType === 'approve' && (
                     <div className="flex gap-3 bg-blue-50 p-4 rounded-xl">
                        <FiAlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" />
                        <p className="text-[10px] text-blue-800 leading-normal">
                           Approving this will lock the amount in the partner's wallet. 
                           You will still need to manually transfer funds and mark as completed.
                        </p>
                     </div>
                   )}

                   <div className="flex gap-3 pt-4 border-t border-gray-100">
                      <button 
                         type="button"
                         onClick={() => setSelectedRequest(null)}
                         className="flex-1 px-4 py-3 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
                      >
                         CANCEL
                      </button>
                      <button 
                         type="submit"
                         disabled={isProcessing}
                         className={`flex-1 px-4 py-3 text-sm font-bold text-white rounded-xl shadow-lg transition-all active:scale-95 ${
                            actionType === 'approve' ? 'bg-blue-600 shadow-blue-100' : 
                            actionType === 'reject' ? 'bg-rose-600 shadow-rose-100' : 'bg-emerald-600 shadow-emerald-100'
                         }`}
                      >
                         {isProcessing ? 'Processing...' : `CONFIRM ${actionType.toUpperCase()}`}
                      </button>
                   </div>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StatCard = ({ title, value, count, icon, color }) => {
  const colors = {
    amber: 'bg-amber-50 border-amber-100 text-amber-600',
    blue: 'bg-blue-50 border-blue-100 text-blue-600',
    emerald: 'bg-emerald-50 border-emerald-100 text-emerald-600',
    rose: 'bg-rose-50 border-rose-100 text-rose-600',
  };

  return (
    <div className={`p-5 rounded-2xl border ${colors[color]} flex flex-col justify-between`}>
       <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-white rounded-lg shadow-sm">{icon}</div>
          <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{count} Requests</span>
       </div>
       <div>
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">{title}</p>
          <p className="text-xl font-black">{value}</p>
       </div>
    </div>
  );
};

const FiCheckCircle = ({ className }) => (
  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className={className} height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

export default WithdrawRequests;
