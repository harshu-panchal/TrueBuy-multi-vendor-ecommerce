import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiUserPlus, FiArrowRight, FiSkipForward } from 'react-icons/fi';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import PageTransition from '../../../shared/components/PageTransition';
import api from '../../../shared/utils/api';

const VendorReferral = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [referralCode, setReferralCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const email = location.state?.email;
  const vendorId = location.state?.vendorId;

  // Ensure they have registered first
  if (!email || !vendorId) {
    // If accessed directly without registration state, redirect to register
    navigate('/vendor/register');
    return null;
  }

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!referralCode.trim()) {
      toast.error('Please enter a referral code');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/vendor/auth/verify-referral', {
        vendorId,
        referralCode: referralCode.trim()
      });

      toast.success(response.data?.message || 'Referral code verified successfully!');
      // Navigate to verification/otp page
      navigate('/vendor/verification', { state: { email } });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid referral code or verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    // Navigate straight to verification page
    navigate('/vendor/verification', { state: { email } });
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 flex flex-col items-center">
        {/* Dark Header with Pattern */}
        <div className="w-full bg-[#111111] relative overflow-hidden h-64 lg:h-56 flex flex-col items-center justify-center">
          {/* Geometric Pattern Overlay */}
          <div className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle at 10px 10px, #333 2px, transparent 0)`,
              backgroundSize: '30px 30px'
            }}>
          </div>
          <h1 className="z-10 text-4xl font-bold text-white">Referral Verification</h1>
          <p className="z-10 text-gray-400 mt-2">Optional Step</p>
        </div>

        {/* Referral Card */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md bg-white -mt-16 lg:-mt-24 rounded-[40px] shadow-2xl z-20 px-8 pt-10 pb-12"
        >
          <div className="flex justify-center mb-6 text-[#111111]">
            <FiUserPlus size={48} />
          </div>
          
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Have a Referral Code?</h2>
            <p className="text-gray-500 text-sm">
              If you were referred by another member, please enter their code below. This step is optional.
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-600 px-1">Referral Code</label>
              <input
                type="text"
                name="referralCode"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                placeholder="Enter Code (e.g. REF123)"
                className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 transition-all outline-none text-gray-900 uppercase"
              />
            </div>

            <div className="space-y-4 pt-2">
              <button
                type="submit"
                disabled={isLoading || !referralCode.trim()}
                className="w-full flex items-center justify-center gap-2 bg-[#111111] text-white py-4 rounded-2xl font-bold text-lg hover:bg-black transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
              >
                {isLoading ? 'Verifying...' : 'Verify Code'}
                {!isLoading && <FiArrowRight />}
              </button>
              
              <button
                type="button"
                onClick={handleSkip}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-transparent text-gray-600 hover:text-black py-4 rounded-2xl font-bold text-lg transition-colors active:scale-[0.98] border-2 border-gray-100 hover:border-gray-200"
              >
                Skip for now
                <FiSkipForward />
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default VendorReferral;
