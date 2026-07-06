import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiDollarSign, 
  FiClock, 
  FiCheckCircle, 
  FiArrowLeft, 
  FiPlus, 
  FiAlertCircle,
  FiCreditCard,
  FiCalendar,
  FiExternalLink
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useDeliveryAuthStore } from '../store/deliveryStore';
import PageTransition from '../../../shared/components/PageTransition';
import { formatPrice } from '../../../shared/utils/helpers';
import Badge from '../../../shared/components/Badge';
import { toast } from 'react-hot-toast';
import api from '../../../shared/utils/api';

const Finance = () => {
  const navigate = useNavigate();
  const { fetchFinanceSummary, fetchWithdrawRequests, createWithdrawRequest } = useDeliveryAuthStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [financeSummary, setFinanceSummary] = useState(null);
  const [withdrawRequests, setWithdrawRequests] = useState([]);
  const [earningsHistory, setEarningsHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('earnings'); // 'earnings' | 'withdrawals'
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [summary, requests, earningsRes] = await Promise.all([
        fetchFinanceSummary(),
        fetchWithdrawRequests(),
        api.get('/delivery/orders', { params: { status: 'delivered', limit: 20 } })
      ]);
      setFinanceSummary(summary);
      setWithdrawRequests(requests?.requests || []);
      
      const payload = earningsRes?.data || {};
      const rawOrders = payload?.data?.orders || payload?.orders || [];
      setEarningsHistory(Array.isArray(rawOrders) ? rawOrders : []);
    } catch (err) {
      console.error('Error loading finance data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    const numAmount = Number(amount);
    
    if (!numAmount || numAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (numAmount > (financeSummary?.withdrawableBalance || 0)) {
      toast.error('Amount exceeds available balance');
      return;
    }

    setIsSubmitting(true);
    try {
      await createWithdrawRequest({ amount: numAmount, notes });
      toast.success('Withdrawal request submitted!');
      setIsModalOpen(false);
      setAmount('');
      setNotes('');
      loadData();
    } catch (err) {
      // Error handled by store/api
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && !financeSummary) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="pb-24">
        {/* Header */}
        <div className="bg-white px-4 py-4 border-b border-gray-100 flex items-center gap-4 sticky top-0 z-20">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <FiArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Earnings & Payouts</h1>
        </div>

        <div className="p-4 space-y-6">
          {/* Main Balance Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden"
          >
            <div className="relative z-10">
              <p className="text-primary-100 text-sm font-medium mb-2 uppercase tracking-wider">Available for Withdrawal</p>
              <h2 className="text-4xl font-black mb-6">{formatPrice(financeSummary?.withdrawableBalance || 0)}</h2>
              
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/20">
                <div>
                  <p className="text-primary-100 text-[10px] uppercase font-bold mb-1">Total Earned</p>
                  <p className="text-lg font-bold">{formatPrice(financeSummary?.totalEarned || 0)}</p>
                </div>
                <div className="text-right">
                  <p className="text-primary-100 text-[10px] uppercase font-bold mb-1">Total Withdrawn</p>
                  <p className="text-lg font-bold">{formatPrice(financeSummary?.totalWithdrawn || 0)}</p>
                </div>
              </div>
            </div>
            
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <FiDollarSign size={120} />
            </div>
          </motion.div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                   <FiClock className="text-amber-600" />
                   <Badge variant="warning" className="text-[8px]">Pending</Badge>
                </div>
                <p className="text-[10px] text-amber-700 font-bold uppercase mb-1">Payout Locked</p>
                <p className="text-lg font-black text-amber-900">{formatPrice(financeSummary?.pendingWithdrawal || 0)}</p>
             </div>
             <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                   <FiCheckCircle className="text-emerald-600" />
                   <Badge variant="success" className="text-[8px]">Done</Badge>
                </div>
                <p className="text-[10px] text-emerald-700 font-bold uppercase mb-1">Last Payout</p>
                <p className="text-lg font-black text-emerald-900">{formatPrice(financeSummary?.lastWithdrawalAmount || 0)}</p>
             </div>
          </div>

          {/* Action Button */}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-primary-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary-200 active:scale-95 transition-transform"
          >
            <FiPlus /> Request Payout
          </button>

          {/* Tabs */}
          <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
             <button 
               onClick={() => setActiveTab('earnings')}
               className={`flex-1 py-2 px-4 rounded-lg font-bold text-sm transition-all ${activeTab === 'earnings' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500'}`}
             >
               Earnings
             </button>
             <button 
               onClick={() => setActiveTab('withdrawals')}
               className={`flex-1 py-2 px-4 rounded-lg font-bold text-sm transition-all ${activeTab === 'withdrawals' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500'}`}
             >
               Payouts
             </button>
          </div>

          {/* History Lists */}
          <div className="space-y-4">
            
            {activeTab === 'withdrawals' ? (
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
                  <FiCalendar className="text-primary-600" /> Payout History
                </h3>
                {withdrawRequests.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <FiCreditCard className="mx-auto text-4xl text-gray-300 mb-2" />
                    <p className="text-gray-500 text-sm">No payout requests yet.</p>
                  </div>
                ) : (
                  withdrawRequests.map((req, idx) => (
                    <motion.div 
                      key={req._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm"
                    >
                      <div className="space-y-1">
                        <p className="text-xs text-gray-400 font-medium">{new Date(req.createdAt).toLocaleDateString()}</p>
                        <p className="font-bold text-gray-800">{formatPrice(req.amount)}</p>
                      </div>
                      <div className="text-right">
                         <Badge variant={
                           req.status === 'completed' ? 'success' : 
                           req.status === 'pending' ? 'warning' : 
                           req.status === 'approved' ? 'info' : 'error'
                         }>
                           {req.status.toUpperCase()}
                         </Badge>
                         {req.status === 'completed' && req.transactionId && (
                           <div className="mt-2 text-right">
                             <p className="text-[10px] text-gray-500">Ref: <span className="font-mono text-gray-700 font-bold">{req.transactionId}</span></p>
                             {req.receiptUrl && (
                               <a 
                                 href={req.receiptUrl} 
                                 target="_blank" 
                                 rel="noreferrer"
                                 className="text-[10px] font-bold text-primary-600 hover:underline inline-flex items-center gap-1 mt-0.5"
                               >
                                 <FiExternalLink /> View Receipt
                               </a>
                             )}
                           </div>
                         )}
                         {req.status === 'rejected' && (
                           <p className="text-[10px] text-red-500 mt-1 max-w-[100px] truncate">{req.rejectionReason}</p>
                         )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
                  <FiDollarSign className="text-primary-600" /> Earnings History
                </h3>
                {earningsHistory.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <FiDollarSign className="mx-auto text-4xl text-gray-300 mb-2" />
                    <p className="text-gray-500 text-sm">No earnings recorded yet.</p>
                  </div>
                ) : (
                  earningsHistory.map((order, idx) => (
                    <motion.div 
                      key={order._id || order.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => navigate(`/delivery/orders/${order.id || order._id}`)}
                      className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm cursor-pointer hover:border-primary-200"
                    >
                      <div className="space-y-1">
                        <p className="text-xs text-gray-400 font-medium">{new Date(order.deliveredAt || order.updatedAt).toLocaleDateString()}</p>
                        <p className="font-bold text-gray-800">Order #{String(order.subOrderId || order._id).slice(-6)}</p>
                      </div>
                      <div className="text-right">
                         <p className="font-black text-primary-600 text-lg">
                           {formatPrice(order.deliveryEarnings || 0)}
                         </p>
                         <p className="text-[10px] text-gray-400">
                           {Number(order.deliveryDistanceKm || 0).toFixed(1)} km
                         </p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}
            
          </div>
        </div>

        {/* Request Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
               <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
               />
               <motion.div 
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
               >
                 <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-xl font-bold">Request Money</h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">×</button>
                 </div>
                 
                 <form onSubmit={handleRequestSubmit} className="p-6 space-y-6">
                    <div className="bg-primary-50 p-4 rounded-2xl flex items-center justify-between">
                       <span className="text-sm text-primary-700 font-medium">Withdrawable Balance</span>
                       <span className="text-xl font-bold text-primary-900">{formatPrice(financeSummary?.withdrawableBalance || 0)}</span>
                    </div>

                    <div>
                       <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Amount to Withdraw</label>
                       <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-gray-400">₹</span>
                          <input 
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Enter amount"
                            className="w-full pl-10 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-2xl font-black outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                            required
                          />
                       </div>
                    </div>

                    <div>
                       <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Note (Optional)</label>
                       <textarea 
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Why do you need this payout?"
                        className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl resize-none h-24 outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                       />
                    </div>

                    <div className="flex gap-3 bg-amber-50 p-4 rounded-2xl border border-amber-100">
                       <FiAlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" />
                       <p className="text-[10px] text-amber-800 leading-normal font-medium">
                         Money will be transferred to your registered bank account. 
                         Ensure your bank details are correct in your profile settings.
                       </p>
                    </div>

                    <button 
                      type="submit"
                      disabled={isSubmitting || !amount}
                      className="w-full bg-primary-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-primary-200 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Processing...' : 'CONFIRM WITHDRAWAL'}
                    </button>
                 </form>
               </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
};

export default Finance;
