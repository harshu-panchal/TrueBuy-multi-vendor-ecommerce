import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiTruck } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useDeliveryAuthStore } from '../store/deliveryStore';
import toast from 'react-hot-toast';
import { appLogo } from '../../../data/logos';
import PageTransition from '../../../shared/components/PageTransition';

const DeliveryLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading } = useDeliveryAuthStore();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    const hasDeliveryToken = Boolean(localStorage.getItem('delivery-token'));
    if (isAuthenticated && hasDeliveryToken) {
      const from = location.state?.from?.pathname || '/delivery/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await login(formData.email, formData.password, rememberMe);
      toast.success('Login successful!');
      // Redirect is handled by auth effect above to avoid duplicate navigation.
    } catch (error) {
      toast.error(error.message || 'Invalid credentials');
    }
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
          <div className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(45deg, #444 25%, transparent 25%, transparent 75%, #444 75%, #444), 
                                  linear-gradient(45deg, #444 25%, transparent 25%, transparent 75%, #444 75%, #444)`,
              backgroundSize: '60px 60px',
              backgroundPosition: '0 0, 30px 30px'
            }}>
          </div>

        </div>

        {/* Login Card */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-lg bg-white -mt-16 lg:-mt-32 rounded-t-[40px] shadow-2xl z-20 px-8 pt-10 lg:pt-8 pb-12 flex-1 mb-8"
        >
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900">Delivery Partner</h1>
            <p className="text-gray-500 text-sm mt-2">Sign in to manage your deliveries</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600 block px-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="delivery@delivery.com"
                className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 transition-all outline-none text-gray-900"
                required
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600 block px-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 transition-all outline-none text-gray-900"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-black transition-colors"
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-5 h-5 rounded-lg border-gray-300 text-black focus:ring-black transition-all cursor-pointer"
                />
                <span className="text-sm text-gray-600 group-hover:text-black transition-colors">Remember me</span>
              </label>
              <Link
                to="/delivery/forgot-password"
                className="text-sm font-medium text-gray-900 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 space-y-6">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#111111] text-white py-4 rounded-2xl font-bold text-lg hover:bg-black transition-all shadow-lg active:scale-[0.98] disabled:opacity-50"
              >
                {isLoading ? 'Signing in...' : 'Sign In to Dashboard'}
              </button>

              {/* Demo Credentials */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-sm text-gray-700 font-semibold mb-2">Demo Credentials:</p>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 flex justify-between">
                    <span>Email:</span>
                    <span className="font-medium text-gray-700">delivery@delivery.com</span>
                  </p>
                  <p className="text-xs text-gray-500 flex justify-between">
                    <span>Password:</span>
                    <span className="font-medium text-gray-700">delivery123</span>
                  </p>
                </div>
              </div>

              <div className="text-center">
                <p className="text-gray-500 text-sm">
                  New delivery partner?{' '}
                  <Link to="/delivery/register" className="text-black font-bold hover:underline">
                    Register here
                  </Link>
                </p>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default DeliveryLogin;
