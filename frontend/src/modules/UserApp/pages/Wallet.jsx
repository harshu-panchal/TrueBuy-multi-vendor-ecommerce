import React, { useEffect, useState } from 'react';
import { useWalletStore } from '../../../shared/store/useWalletStore';
import { FiDollarSign, FiArrowUpRight, FiArrowDownLeft, FiX } from 'react-icons/fi';
import { formatPrice } from '../../../shared/utils/helpers';
import toast from 'react-hot-toast';
import MobileLayout from '../components/Layout/MobileLayout';
import PageTransition from '../../../shared/components/PageTransition';

const Wallet = () => {
  const { balance, transactions, loading, fetchWallet, requestWithdrawal } = useWalletStore();
  
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!withdrawAmount || Number(withdrawAmount) <= 0) return toast.error('Enter valid amount');
    if (Number(withdrawAmount) > balance) return toast.error('Insufficient balance');
    
    try {
      setIsSubmitting(true);
      await requestWithdrawal(Number(withdrawAmount), { accountNumber });
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      setAccountNumber('');
    } catch (error) {
      // handled in store
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MobileLayout showBottomNav={true} showCartBar={true}>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <PageTransition>
      <MobileLayout showBottomNav={true} showCartBar={true}>
        <div className="p-4 space-y-4 pb-24">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-emerald-50">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">My Wallet</h2>
        <p className="text-sm text-gray-600 mb-4">Available balance for your next purchases</p>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-emerald-100 rounded-full text-emerald-600">
              <FiDollarSign size={32} />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{formatPrice(balance)}</p>
              <p className="text-sm text-emerald-700 font-medium">Available Balance</p>
            </div>
          </div>
          {balance > 0 && (
            <button
              onClick={() => setShowWithdrawModal(true)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors self-start sm:self-auto"
            >
              Withdraw Funds
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Transaction History</h3>
        
        {transactions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No transactions yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((t) => (
              <div key={t._id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${t.type === 'credit' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                    {t.type === 'credit' ? <FiArrowDownLeft size={20} /> : <FiArrowUpRight size={20} />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{t.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(t.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${t.type === 'credit' ? 'text-emerald-600' : 'text-gray-900'}`}>
                    {t.type === 'credit' ? '+' : '-'}{formatPrice(t.amount)}
                  </p>
                  <p className="text-xs text-gray-500">Bal: {formatPrice(t.balanceAfter)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
        </div>
        </div>

        {/* Withdraw Modal */}
        {showWithdrawModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden relative">
              <button 
                onClick={() => setShowWithdrawModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <FiX size={24} />
              </button>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Withdraw Funds</h3>
                <form onSubmit={handleWithdraw} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount to Withdraw</label>
                    <input
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder={`Max: ${formatPrice(balance)}`}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                      required
                      min="1"
                      max={balance}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bank Account Number (Optional)</label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="Enter account number or UPI"
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      'Submit Request'
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </MobileLayout>
    </PageTransition>
  );
};

export default Wallet;
