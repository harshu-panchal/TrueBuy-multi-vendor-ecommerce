import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiPhone, FiArrowLeft } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../../shared/store/authStore';
import { isValidEmail, isValidPhone } from '../../../shared/utils/helpers';
import toast from 'react-hot-toast';
import MobileLayout from "../components/Layout/MobileLayout";
import PageTransition from '../../../shared/components/PageTransition';

const MobileRegister = () => {
  const navigate = useNavigate();
  const { register: registerUser, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [formMode, setFormMode] = useState('signup'); // 'signup' or 'login'

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password');

  const handleModeChange = (mode) => {
    setFormMode(mode);
    if (mode === 'login') {
      navigate('/login');
    }
  };

  const onSubmit = async (data) => {
    try {
      // Combine first name and last name
      const fullName = `${data.firstName} ${data.lastName}`;
      // Backend stores a normalized 10-digit phone value.
      const phone = data.phone;

      await registerUser(fullName, data.email, data.password, phone);
      toast.success('Registration successful!');
      // Navigate to verification page
      navigate('/verification', { state: { email: data.email } });
    } catch (error) {
      toast.error(error.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 flex flex-col items-center">
        {/* Dark Header with Pattern */}
        <div className="w-full bg-[#111111] relative overflow-hidden h-64 lg:h-56 flex flex-col items-center justify-center">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="absolute top-8 left-8 p-3 text-white hover:bg-white/10 rounded-full transition-colors z-30"
          >
            <FiArrowLeft size={24} />
          </button>

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

          <h1 className="z-10 text-4xl font-bold text-white lg:hidden">Sign Up</h1>
        </div>

        {/* Register Card */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-lg bg-white -mt-16 lg:-mt-32 rounded-t-[40px] shadow-2xl z-20 px-8 pt-10 lg:pt-8 pb-12 flex-1 mb-8"
        >
          <div className="text-center mb-10 hidden lg:block">
            <h1 className="text-3xl font-bold text-gray-900">Sign Up</h1>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name Fields Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600 block px-1">First name</label>
                <input
                  type="text"
                  {...register('firstName', { required: 'First name is required' })}
                  className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 transition-all outline-none text-gray-900"
                  placeholder="Vijay"
                />
                {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600 block px-1">Last name</label>
                <input
                  type="text"
                  {...register('lastName', { required: 'Last name is required' })}
                  className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 transition-all outline-none text-gray-900"
                  placeholder="Bhuva"
                />
                {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName.message}</p>}
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600 block px-1">Email</label>
              <input
                type="email"
                {...register('email', {
                  required: 'Email is required',
                  validate: (value) => isValidEmail(value) || 'Please enter a valid email',
                })}
                className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 transition-all outline-none text-gray-900"
                placeholder="vijaybhuva901@gmail.com"
              />
              {errors.email && <p className="text-xs text-red-500 mt-1 px-2">{errors.email.message}</p>}
            </div>

            {/* Phone Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600 block px-1">Phone Number</label>
              <div className="flex gap-3">
                <select
                  {...register('countryCode', { required: true })}
                  className="w-24 px-4 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-black transition-all outline-none text-sm text-gray-900"
                >
                  <option value="+91">+91</option>
                  <option value="+1">+1</option>
                  <option value="+44">+44</option>
                  <option value="+880">+880</option>
                </select>
                <input
                  type="tel"
                  {...register('phone', {
                    required: 'Phone number is required',
                    validate: (value) => isValidPhone(value) || 'Please enter a valid phone number',
                  })}
                  className="flex-1 px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 transition-all outline-none text-gray-900"
                  placeholder="9876543210"
                />
              </div>
              {errors.phone && <p className="text-xs text-red-500 mt-1 px-2">{errors.phone.message}</p>}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600 block px-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Minimum 6 characters' },
                  })}
                  className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 transition-all outline-none text-gray-900"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-black transition-colors"
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1 px-2">{errors.password.message}</p>}
            </div>

            {/* Action Buttons */}
            <div className="pt-6 space-y-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#111111] text-white py-4 rounded-2xl font-bold text-lg hover:bg-black transition-all shadow-lg active:scale-[0.98] disabled:opacity-50"
              >
                {isLoading ? 'Creating Account...' : 'Sign Up'}
              </button>

              <div className="text-center pt-2">
                <p className="text-gray-500 text-sm">
                  Already have any account?{' '}
                  <Link to="/login" className="text-black font-bold hover:underline">
                    Sign In
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

export default MobileRegister;
