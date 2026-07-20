import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FiDollarSign,
  FiTrendingUp,
  FiClock,
  FiCheckCircle,
  FiFileText,
  FiCreditCard,
  FiPlus,
  FiAlertCircle,
  FiArrowRight,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import Badge from "../../../shared/components/Badge";
import ExportButton from "../../Admin/components/ExportButton";
import AnimatedSelect from "../../Admin/components/AnimatedSelect";
import { formatPrice } from "../../../shared/utils/helpers";
import { useVendorAuthStore } from "../store/vendorAuthStore";
import { 
  getVendorEarnings, 
  getVendorFinanceSummary, 
  getVendorWithdrawRequests, 
  createVendorWithdrawRequest 
} from "../services/vendorService";
import { toast } from "react-hot-toast";

const Earnings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { vendor } = useVendorAuthStore();

  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes("/commission-history")) return "commission";
    if (path.includes("/settlement-history")) return "settlement";
    if (path.includes("/withdrawals")) return "withdrawals";
    return "overview";
  };

  const [activeTab, setActiveTab] = useState(getActiveTab());
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [commissions, setCommissions] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [withdrawRequests, setWithdrawRequests] = useState([]);
  const [earningsSummary, setEarningsSummary] = useState(null);
  const [financeSummary, setFinanceSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Withdrawal Modal State
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawNotes, setWithdrawNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setActiveTab(getActiveTab());
  }, [location.pathname]);

  const vendorId = vendor?.id || vendor?._id;

  const fetchData = async () => {
    if (!vendorId) return;
    setIsLoading(true);
    try {
      const [earningsRes, financeRes, requestsRes] = await Promise.all([
        getVendorEarnings(),
        getVendorFinanceSummary(),
        getVendorWithdrawRequests()
      ]);
      
      const earningsData = earningsRes?.data ?? earningsRes;
      setCommissions(earningsData?.commissions ?? []);
      setSettlements(earningsData?.settlements ?? []);
      setEarningsSummary(earningsData?.summary ?? null);

      const financeData = financeRes?.data ?? financeRes;
      setFinanceSummary(financeData);

      const requestsData = requestsRes?.data ?? requestsRes;
      setWithdrawRequests(requestsData?.requests ?? []);
    } catch (err) {
      console.error("Error fetching finance data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [vendorId]);

  const filteredCommissions = useMemo(() => {
    if (selectedStatus === "all") return commissions;
    return commissions.filter(
      (c) => (c.effectiveStatus || c.status) === selectedStatus
    );
  }, [commissions, selectedStatus]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "overview") {
      navigate("/vendor/earnings");
    } else if (tab === "commission") {
      navigate("/vendor/earnings/commission-history");
    } else if (tab === "settlement") {
      navigate("/vendor/earnings/settlement-history");
    } else if (tab === "withdrawals") {
      navigate("/vendor/earnings/withdrawals");
    }
  };

  const handleWithdrawRequest = async (e) => {
    e.preventDefault();
    if (!withdrawAmount || Number(withdrawAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (Number(withdrawAmount) > (financeSummary?.withdrawableBalance || 0)) {
      toast.error("Amount exceeds withdrawable balance");
      return;
    }

    setIsSubmitting(true);
    try {
      await createVendorWithdrawRequest({
        amount: Number(withdrawAmount),
        notes: withdrawNotes
      });
      toast.success("Withdrawal request submitted");
      setIsWithdrawModalOpen(false);
      setWithdrawAmount("");
      setWithdrawNotes("");
      fetchData(); // Refresh data
    } catch (err) {
      // Error handled by api.js toast
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenWithdrawModal = () => {
    if (!financeSummary?.withdrawableBalance || financeSummary.withdrawableBalance <= 0) {
      toast.error("You have no available balance to withdraw.");
      return;
    }
    setIsWithdrawModalOpen(true);
  };

  if (!vendorId) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please log in to view earnings</p>
      </div>
    );
  }

  if (isLoading && !earningsSummary) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Loading earnings data...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            Earnings & Finance
          </h1>
          <p className="text-gray-600">
            Manage your earnings, payouts and withdrawals
          </p>
        </div>
        <button
          onClick={handleOpenWithdrawModal}
          className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2.5 rounded-xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 font-medium group">
          <FiDollarSign className="group-hover:scale-110 transition-transform" />
          <span>Request Payout</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50/50">
          <div className="flex overflow-x-auto scrollbar-hide px-2">
            {[
              { id: "overview", label: "Overview", icon: FiDollarSign },
              { id: "commission", label: "Commissions", icon: FiFileText },
              { id: "settlement", label: "Settlements", icon: FiCheckCircle },
              { id: "withdrawals", label: "Withdrawals", icon: FiCreditCard },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-all whitespace-nowrap text-sm font-medium ${activeTab === tab.id
                  ? "border-purple-600 text-purple-600 bg-white"
                  : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-100/50"
                  }`}>
                <tab.icon className={activeTab === tab.id ? "text-purple-600" : "text-gray-400"} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {/* Earnings Summary Cards */}
          {(activeTab === "overview" || activeTab === "withdrawals") && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <FiTrendingUp className="text-green-600 text-xl" />
                  </div>
                  <Badge variant="success">Total</Badge>
                </div>
                <p className="text-sm text-green-700 font-medium mb-1">Total Earned</p>
                <h3 className="text-2xl font-bold text-green-900">
                  {formatPrice(earningsSummary?.totalEarnings || 0)}
                </h3>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-100 shadow-sm relative overflow-hidden group">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                    <FiDollarSign className="text-xl" />
                  </div>
                  <button 
                    onClick={handleOpenWithdrawModal}
                    className="text-xs bg-purple-600 text-white px-2 py-1 rounded-md hover:bg-purple-700 transition-colors">
                    Withdraw
                  </button>
                </div>
                <p className="text-sm text-purple-700 font-medium mb-1">Withdrawable</p>
                <h3 className="text-2xl font-bold text-purple-900">
                  {formatPrice(financeSummary?.withdrawableBalance || 0)}
                </h3>
                <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
                   <FiDollarSign size={80} />
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl p-6 border border-yellow-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <FiClock className="text-yellow-600 text-xl" />
                  </div>
                  <Badge variant="warning">Locked</Badge>
                </div>
                <p className="text-sm text-yellow-700 font-medium mb-1">Pending Payouts</p>
                <h3 className="text-2xl font-bold text-yellow-900">
                  {formatPrice(financeSummary?.pendingWithdrawal || 0)}
                </h3>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    <FiCheckCircle className="text-xl" />
                  </div>
                  <Badge variant="info">Paid</Badge>
                </div>
                <p className="text-sm text-blue-700 font-medium mb-1">Total Withdrawn</p>
                <h3 className="text-2xl font-bold text-blue-900">
                  {formatPrice(financeSummary?.totalWithdrawn || 0)}
                </h3>
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <div className="min-h-[400px]">
            {activeTab === "overview" && (
               <div className="space-y-6">
                  <div className="flex items-center justify-between">
                     <h2 className="text-xl font-bold text-gray-800">Recent Commissions</h2>
                     <button onClick={() => handleTabChange("commission")} className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center gap-1 group">
                        View All <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                     </button>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {commissions.slice(0, 5).map((commission) => (
                      <div key={commission._id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:border-purple-200 transition-all flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center">
                            <FiFileText className="text-gray-400" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">{commission.orderDisplayId || commission.orderId?.orderId || "Order #" + commission.orderId}</p>
                            <p className="text-xs text-gray-500">{new Date(commission.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">{formatPrice(commission.vendorEarnings)}</p>
                          <Badge variant={commission.status === "paid" ? "success" : "warning"}>{commission.status.toUpperCase()}</Badge>
                        </div>
                      </div>
                    ))}
                    {commissions.length === 0 && <p className="text-center py-10 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">No recent commissions found.</p>}
                  </div>
               </div>
            )}

            {activeTab === "commission" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                   <h2 className="text-xl font-bold text-gray-800">Commission History</h2>
                   <div className="flex items-center gap-3">
                     <AnimatedSelect
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        options={[
                          { value: "all", label: "All Status" },
                          { value: "pending", label: "Pending" },
                          { value: "paid", label: "Paid" },
                          { value: "cancelled", label: "Cancelled" },
                        ]}
                        className="min-w-[140px]"
                      />
                      <ExportButton
                        data={filteredCommissions}
                        headers={[
                          { label: "Order", accessor: (row) => row.orderDisplayId || (row.orderId?.orderId || row.orderId) },
                          { label: "Date", accessor: (row) => new Date(row.createdAt).toLocaleDateString() },
                          { label: "Subtotal", accessor: (row) => formatPrice(row.subtotal) },
                          { label: "Commission", accessor: (row) => formatPrice(row.commission) },
                          { label: "Your Earnings", accessor: (row) => formatPrice(row.vendorEarnings) },
                          { label: "Status", accessor: (row) => row.status },
                        ]}
                        filename="vendor-commissions"
                      />
                   </div>
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Order ID</th>
                          <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Subtotal</th>
                          <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Comm.</th>
                          <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right text-green-600">Earnings</th>
                          <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCommissions.map(c => (
                          <tr key={c._id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                            <td className="px-4 py-4 font-medium text-gray-800">{c.orderDisplayId || c.orderId?.orderId || "Order"}</td>
                            <td className="px-4 py-4 text-sm text-gray-600">{new Date(c.createdAt).toLocaleDateString()}</td>
                            <td className="px-4 py-4 text-sm text-gray-800 text-right">{formatPrice(c.subtotal)}</td>
                            <td className="px-4 py-4 text-sm text-red-500 text-right">-{formatPrice(c.commission)}</td>
                            <td className="px-4 py-4 font-bold text-green-600 text-right">{formatPrice(c.vendorEarnings)}</td>
                            <td className="px-4 py-4 text-center">
                               <Badge variant={c.status === 'paid' ? 'success' : c.status === 'pending' ? 'warning' : 'error'}>{c.status.toUpperCase()}</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                   </table>
                   {filteredCommissions.length === 0 && <p className="text-center py-20 text-gray-500">No records found for the selected status.</p>}
                </div>
              </div>
            )}

            {activeTab === "settlement" && (
               <div className="space-y-6">
                 <h2 className="text-xl font-bold text-gray-800">Settlement History</h2>
                 <div className="grid grid-cols-1 gap-4">
                    {settlements.map(s => (
                       <div key={s._id} className="bg-emerald-50/50 border border-emerald-100 p-5 rounded-2xl flex flex-wrap items-center justify-between gap-6">
                          <div className="space-y-1">
                             <p className="text-xs text-emerald-600 font-bold uppercase tracking-widest">Transaction ID</p>
                             <p className="font-mono text-gray-800">{s.transactionId || s._id}</p>
                          </div>
                          <div className="space-y-1">
                             <p className="text-xs text-emerald-600 font-bold uppercase tracking-widest">Date</p>
                             <p className="font-medium text-gray-800">{new Date(s.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="space-y-1 text-right">
                             <p className="text-xs text-emerald-600 font-bold uppercase tracking-widest">Amount Paid</p>
                             <p className="text-2xl font-black text-emerald-700">{formatPrice(s.amount)}</p>
                          </div>
                       </div>
                    ))}
                    {settlements.length === 0 && (
                      <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                        <FiCheckCircle className="mx-auto text-5xl text-gray-300 mb-4" />
                        <p className="text-gray-500 font-medium">No settlements found yet.</p>
                        <p className="text-sm text-gray-400">Once admin processes your payout, it will appear here.</p>
                      </div>
                    )}
                 </div>
               </div>
            )}

            {activeTab === "withdrawals" && (
               <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-800">Withdrawal Requests</h2>
                    <button 
                      onClick={handleOpenWithdrawModal}
                      className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-bold text-sm bg-purple-50 px-4 py-2 rounded-lg transition-all">
                      <FiPlus /> New Request
                    </button>
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-gray-200">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-gray-50">
                        <tr className="border-b border-gray-200">
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Request Date</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Amount</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-center">Status</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Bank Account</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {withdrawRequests.map((req) => (
                          <tr key={req._id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                            <td className="px-6 py-4">
                              <p className="font-medium text-gray-800">{new Date(req.createdAt).toLocaleDateString()}</p>
                              <p className="text-xs text-gray-500">{new Date(req.createdAt).toLocaleTimeString()}</p>
                            </td>
                            <td className="px-6 py-4 text-right font-bold text-purple-700">
                              {formatPrice(req.amount)}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <Badge variant={
                                req.status === 'completed' ? 'success' : 
                                req.status === 'pending' ? 'warning' : 
                                req.status === 'approved' ? 'info' : 'error'
                              }>
                                {req.status.toUpperCase()}
                              </Badge>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm font-medium text-gray-800">{req.bankDetails?.bankName}</p>
                              <p className="text-xs text-gray-500">****{req.bankDetails?.accountNumber?.slice(-4)}</p>
                            </td>
                            <td className="px-6 py-4">
                               {req.status === 'rejected' && (
                                 <button 
                                  title={req.rejectionReason}
                                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                   <FiAlertCircle />
                                 </button>
                               )}
                               {req.status === 'completed' && (
                                 <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                                    <FiCheckCircle /> Paid
                                 </div>
                               )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {withdrawRequests.length === 0 && (
                      <div className="text-center py-20">
                        <FiCreditCard className="mx-auto text-5xl text-gray-300 mb-4" />
                        <p className="text-gray-500">No withdrawal requests found.</p>
                      </div>
                    )}
                  </div>
               </div>
            )}
          </div>
        </div>
      </div>

      {/* Withdrawal Request Modal */}
      {createPortal(
        <AnimatePresence>
          {isWithdrawModalOpen && (
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsWithdrawModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
              <div className="bg-purple-600 p-6 sm:p-8 text-white relative flex-shrink-0">
                 <div className="relative z-10">
                    <h2 className="text-xl sm:text-2xl font-bold mb-2">Request Payout</h2>
                    <p className="text-purple-100 text-sm">Enter the amount you want to withdraw to your bank account.</p>
                 </div>
                 <div className="absolute right-0 top-0 p-8 opacity-10 hidden sm:block">
                    <FiDollarSign size={80} />
                 </div>
              </div>
              
              <form onSubmit={handleWithdrawRequest} className="flex flex-col flex-1 min-h-0 w-full">
                <div className="p-5 sm:p-8 space-y-4 sm:space-y-6 overflow-y-auto flex-1 min-h-0 custom-scrollbar">
                  <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 flex items-center justify-between">
                     <span className="text-sm text-purple-700 font-medium">Available Balance</span>
                     <span className="text-lg sm:text-xl font-bold text-purple-900">{formatPrice(financeSummary?.withdrawableBalance || 0)}</span>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Withdraw Amount (₹)</label>
                    <div className="relative">
                       <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                       <input
                        type="number"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        placeholder="0.00"
                        className={`w-full pl-8 pr-4 py-3 sm:py-4 bg-gray-50 border rounded-2xl focus:ring-2 focus:border-transparent outline-none transition-all font-bold text-lg sm:text-xl ${
                          Number(withdrawAmount) > (financeSummary?.withdrawableBalance || 0)
                            ? 'border-red-500 focus:ring-red-500 text-red-600'
                            : 'border-gray-200 focus:ring-purple-500 text-gray-800'
                        }`}
                        required
                        max={financeSummary?.withdrawableBalance}
                      />
                    </div>
                    {Number(withdrawAmount) > (financeSummary?.withdrawableBalance || 0) && (
                      <p className="text-red-500 text-xs mt-2 font-medium flex items-center gap-1">
                        <FiAlertCircle /> Amount cannot exceed available balance.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Notes (Optional)</label>
                    <textarea
                      value={withdrawNotes}
                      onChange={(e) => setWithdrawNotes(e.target.value)}
                      placeholder="e.g. Urgent business expense"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-none h-20 sm:h-24"
                    />
                  </div>

                  <div className="p-3 sm:p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-2 sm:gap-3">
                     <FiAlertCircle className="text-amber-600 mt-1 flex-shrink-0" />
                     <p className="text-xs text-amber-700 leading-relaxed">
                       Payouts are processed within 2-3 business days. Ensure <strong>Bank Details</strong> are correct.
                     </p>
                  </div>
                </div>

                <div className="p-4 sm:p-6 bg-white border-t border-gray-100 flex gap-2 sm:gap-3 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsWithdrawModalOpen(false)}
                    className="flex-1 px-4 py-3 sm:px-6 sm:py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-colors text-sm sm:text-base">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !withdrawAmount || Number(withdrawAmount) <= 0 || Number(withdrawAmount) > (financeSummary?.withdrawableBalance || 0)}
                    className="flex-[2] px-4 py-3 sm:px-6 sm:py-4 bg-purple-600 text-white rounded-2xl font-bold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-purple-200 text-sm sm:text-base">
                    {isSubmitting ? "Processing..." : "Submit Request"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </motion.div>
  );
};

export default Earnings;
