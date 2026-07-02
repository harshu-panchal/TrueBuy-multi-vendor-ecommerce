import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiUser, FiMail, FiPhone, FiLock, FiEye, FiEyeOff, FiSave, FiCamera, FiArrowLeft, FiPackage, FiMapPin, FiLogOut, FiChevronRight, FiBell, FiCopy, FiGift, FiShare2, FiFileText, FiShield } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import MobileLayout from "../components/Layout/MobileLayout";
import { useAuthStore } from '../../../shared/store/authStore';
import { isValidEmail, isValidPhone } from '../../../shared/utils/helpers';
import api from '../../../shared/utils/api';
import toast from 'react-hot-toast';
import PageTransition from '../../../shared/components/PageTransition';
import PasswordStrengthMeter from '../components/Mobile/PasswordStrengthMeter';
import { useUserNotificationStore } from '../store/userNotificationStore';

const MobileProfile = () => {
  const navigate = useNavigate();
  const { user, fetchProfile, updateProfile, uploadProfileAvatar, changePassword, logout, isLoading } = useAuthStore();
  const menuAvatarInputRef = useRef(null);
  const personalAvatarInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('menu'); // 'menu', 'personal', 'password'
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : false
  );
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [deliveryOtp, setDeliveryOtp] = useState('');
  const [deliveryOtpGeneratedAt, setDeliveryOtpGeneratedAt] = useState(null);
  const [isDeliveryOtpLoading, setIsDeliveryOtpLoading] = useState(false);
  const [showDeliveryOtp, setShowDeliveryOtp] = useState(false);
  const unreadNotificationCount = useUserNotificationStore((state) => state.unreadCount);
  const ensureNotificationHydrated = useUserNotificationStore((state) => state.ensureHydrated);

  const {
    register: registerPersonal,
    handleSubmit: handleSubmitPersonal,
    reset: resetPersonal,
    formState: { errors: personalErrors },
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    watch,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm();

  const newPassword = watch('newPassword');

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    // Fetch latest profile on mount to ensure fresh data (e.g. referralCode)
    fetchProfile();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isDesktop && activeTab === 'menu') {
      setActiveTab('personal');
    }
  }, [isDesktop, activeTab]);

  useEffect(() => {
    resetPersonal({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    });
  }, [user, resetPersonal]);

  useEffect(() => {
    ensureNotificationHydrated();
  }, [ensureNotificationHydrated]);

  const fetchDeliveryOtp = async () => {
    if (isDeliveryOtpLoading) return;
    setIsDeliveryOtpLoading(true);
    try {
      const response = await api.get('/user/auth/delivery-otp');
      const payload = response?.data ?? response ?? {};
      const otp = String(payload?.deliveryOtp || '').trim();
      setDeliveryOtp(otp);
      setDeliveryOtpGeneratedAt(payload?.generatedAt || null);
    } catch {
      // Error toast handled by API interceptor.
    } finally {
      setIsDeliveryOtpLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab !== 'personal') return;
    if (deliveryOtp || isDeliveryOtpLoading) return;
    fetchDeliveryOtp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const copyDeliveryOtp = async () => {
    if (!deliveryOtp || isDeliveryOtpLoading) return;
    try {
      await navigator.clipboard.writeText(deliveryOtp);
      toast.success('Delivery OTP copied');
    } catch {
      toast.error('Could not copy OTP');
    }
  };

  const onPersonalSubmit = async (data) => {
    try {
      await updateProfile({
        name: data?.name,
        phone: data?.phone,
      });
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    }
  };

  const onPasswordSubmit = async (data) => {
    try {
      await changePassword(data.currentPassword, data.newPassword);
      toast.success('Password changed successfully!');
      resetPassword();
    } catch (error) {
      toast.error(error.message || 'Failed to change password');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/home');
    toast.success('Logged out successfully');
  };

  const handleAvatarPick = () => {
    if (activeTab === 'menu') {
      menuAvatarInputRef.current?.click();
    } else {
      personalAvatarInputRef.current?.click();
    }
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isValidType = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type);
    if (!isValidType) {
      toast.error('Only JPEG, PNG, WEBP and GIF images are allowed.');
      event.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be 5MB or less.');
      event.target.value = '';
      return;
    }

    try {
      await uploadProfileAvatar(file);
      toast.success('Profile picture updated successfully!');
    } catch (error) {
      toast.error(error?.message || 'Failed to upload profile picture');
    } finally {
      event.target.value = '';
    }
  };

  const menuOptions = [
    { id: 'personal', label: 'Personal Information', icon: FiUser, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'orders', label: 'My Orders', icon: FiPackage, color: 'text-orange-600', bg: 'bg-orange-50', link: '/orders' },
    { id: 'addresses', label: 'My Addresses', icon: FiMapPin, color: 'text-green-600', bg: 'bg-green-50', link: '/addresses' },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: FiBell,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      link: '/notifications',
      badge: unreadNotificationCount > 0 ? unreadNotificationCount : null,
    },
    { id: 'referral', label: 'Refer & Earn', icon: FiGift, color: 'text-pink-600', bg: 'bg-pink-50' },
    { id: 'password', label: 'Change Password', icon: FiLock, color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 'terms', label: 'Terms & Conditions', icon: FiFileText, color: 'text-gray-600', bg: 'bg-gray-100', link: '/terms' },
    { id: 'privacy', label: 'Privacy Policy', icon: FiShield, color: 'text-gray-600', bg: 'bg-gray-100', link: '/privacy' },
  ];

  return (
    <PageTransition>
      <MobileLayout showBottomNav={true} showCartBar={true}>
          <div className="w-full lg:pb-12 max-w-7xl mx-auto min-h-screen bg-gray-50">
            {/* Desktop Header */}
            <div className="hidden lg:block px-4 py-8">
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
                  <p className="text-gray-500 mt-1">Manage your personal information and security settings</p>
                </div>
              </div>
            </div>

            <div className="lg:hidden px-4 py-4 bg-white border-b border-gray-200 sticky top-0 z-30">
              <div className="flex items-center gap-3">
                {activeTab !== 'menu' && (
                  <button
                    onClick={() => setActiveTab('menu')}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <FiArrowLeft className="text-xl text-gray-700" />
                  </button>
                )}
                <h1 className="text-xl font-bold text-gray-800">
                  {activeTab === 'menu' ? 'My Account' : activeTab === 'personal' ? 'Personal Info' : activeTab === 'referral' ? 'Refer & Earn' : 'Security'}
                </h1>
              </div>
            </div>

            <div className="lg:grid lg:grid-cols-12 lg:gap-8 lg:px-4">
              {/* Desktop Sidebar */}
              <div className="hidden lg:block lg:col-span-3">
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm sticky top-24">
                  <div className="p-2 space-y-1">
                    <button
                      onClick={() => setActiveTab('personal')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left font-medium ${activeTab === 'personal'
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                      <FiUser className="text-lg" />
                      Personal Info
                    </button>
                    <button
                      onClick={() => setActiveTab('referral')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left font-medium ${activeTab === 'referral'
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                      <FiGift className="text-lg" />
                      Refer & Earn
                    </button>
                    <button
                      onClick={() => setActiveTab('password')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left font-medium ${activeTab === 'password'
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                      <FiLock className="text-lg" />
                      Password
                    </button>
                    <Link
                      to="/terms"
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left font-medium text-gray-600 hover:bg-gray-50"
                    >
                      <FiFileText className="text-lg" />
                      Terms & Conditions
                    </Link>
                    <Link
                      to="/privacy"
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left font-medium text-gray-600 hover:bg-gray-50"
                    >
                      <FiShield className="text-lg" />
                      Privacy Policy
                    </Link>
                  </div>
                </div>
              </div>

              {/* Content Area */}
              <div className="px-4 py-4 lg:p-0 lg:col-span-9">
                {/* Dashboard Menu (Mobile Only) */}
                {!isDesktop && activeTab === 'menu' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="lg:hidden space-y-6"
                  >
                    {/* User Profile Summary Card */}
                    <div className="glass-card rounded-2xl p-6 flex flex-col items-center text-center shadow-sm">
                      <div className="relative mb-4">
                        <div className="w-20 h-20 rounded-full gradient-green flex items-center justify-center text-white text-3xl font-bold shadow-lg overflow-hidden">
                          {user?.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user?.name || 'User'}
                              className="w-20 h-20 rounded-full object-cover"
                            />
                          ) : (
                            user?.name?.charAt(0).toUpperCase() || 'U'
                          )}
                        </div>
                        <input
                          ref={menuAvatarInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={handleAvatarPick}
                          disabled={isLoading}
                          className="absolute bottom-0 right-0 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white hover:bg-primary-700 transition-colors shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          <FiCamera className="text-sm" />
                        </button>
                      </div>
                      <h2 className="text-xl font-extrabold text-gray-800 mb-1">{user?.name}</h2>
                      <p className="text-gray-500 text-sm mb-4 font-medium">{user?.email}</p>
                      <div className="flex gap-2 w-full">
                        <button
                          onClick={() => setActiveTab('personal')}
                          className="flex-1 py-3 rounded-xl bg-primary-50 text-primary-600 font-bold text-sm border border-primary-100"
                        >
                          View Profile
                        </button>
                      </div>
                    </div>

                    {/* Menu Options */}
                    <div className="space-y-3">
                      <p className="px-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Account Settings</p>
                      <div className="glass-card rounded-2xl overflow-hidden divide-y divide-gray-50 shadow-sm border border-gray-100">
                        {menuOptions.map((option) => (
                          option.link ? (
                            <Link
                              key={option.id}
                              to={option.link}
                              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors bg-white"
                            >
                              <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl ${option.bg} ${option.color} flex items-center justify-center`}>
                                  <option.icon className="text-lg" />
                                </div>
                                <span className="font-bold text-gray-700 text-sm">{option.label}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {option.badge ? (
                                  <span className="min-w-[20px] h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                                    {option.badge > 99 ? '99+' : option.badge}
                                  </span>
                                ) : null}
                                <FiChevronRight className="text-gray-400" />
                              </div>
                            </Link>
                          ) : (
                            <button
                              key={option.id}
                              onClick={() => setActiveTab(option.id)}
                              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors bg-white"
                            >
                              <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl ${option.bg} ${option.color} flex items-center justify-center`}>
                                  <option.icon className="text-lg" />
                                </div>
                                <span className="font-bold text-gray-700 text-sm">{option.label}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {option.badge ? (
                                  <span className="min-w-[20px] h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                                    {option.badge > 99 ? '99+' : option.badge}
                                  </span>
                                ) : null}
                                <FiChevronRight className="text-gray-400" />
                              </div>
                            </button>
                          )
                        ))}
                      </div>
                    </div>

                    {/* Logout Option */}
                    <div className="pt-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-3 p-4 glass-card rounded-2xl text-red-600 font-bold text-sm shadow-sm border border-red-50 hover:bg-red-50 transition-colors bg-white"
                      >
                        <FiLogOut className="text-lg" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Personal Information Tab */}
                {activeTab === 'personal' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card rounded-2xl p-4 lg:p-8"
                  >
                    {/* Avatar */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full gradient-green flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                          {user?.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user?.name || 'User'}
                              className="w-20 h-20 rounded-full object-cover"
                            />
                          ) : (
                            user?.name?.charAt(0).toUpperCase() || 'U'
                          )}
                        </div>
                        <input
                          ref={personalAvatarInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={handleAvatarPick}
                          disabled={isLoading}
                          className="absolute bottom-0 right-0 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white hover:bg-primary-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          <FiCamera className="text-sm" />
                        </button>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm mb-1">Profile Picture</p>
                        <p className="text-xs text-gray-500">JPG, PNG or GIF. Max size 5MB</p>
                      </div>
                    </div>

                    <form onSubmit={handleSubmitPersonal(onPersonalSubmit)} className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Full Name
                        </label>
                        <div className="relative">
                          <FiUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            {...registerPersonal('name', {
                              required: 'Name is required',
                              minLength: {
                                value: 2,
                                message: 'Name must be at least 2 characters',
                              },
                              pattern: {
                                value: /^[a-zA-Z\s]+$/,
                                message: 'Full name can only contain alphabets and spaces',
                              },
                            })}
                            onInput={(e) => {
                              e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, "");
                            }}
                            className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 ${personalErrors.name
                              ? 'border-red-300 focus:border-red-500'
                              : 'border-gray-200 focus:border-primary-500'
                              } focus:outline-none transition-colors text-base`}
                            placeholder="Your full name"
                          />
                        </div>
                        <AnimatePresence>
                          {personalErrors.name && (
                            <motion.p
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0 }}
                              className="mt-1 text-sm text-red-600"
                            >
                              {personalErrors.name.message}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Email Address
                        </label>
                        <div className="relative">
                          <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="email"
                            {...registerPersonal('email', {
                              required: 'Email is required',
                              validate: (value) =>
                                isValidEmail(value) || 'Please enter a valid email',
                            })}
                            readOnly
                            className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 ${personalErrors.email
                              ? 'border-red-300 focus:border-red-500'
                              : 'border-gray-200 focus:border-primary-500'
                              } focus:outline-none transition-colors text-base bg-gray-50 text-gray-500 cursor-not-allowed`}
                            placeholder="your.email@example.com"
                          />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          Email cannot be changed from profile settings.
                        </p>
                        <AnimatePresence>
                          {personalErrors.email && (
                            <motion.p
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0 }}
                              className="mt-1 text-sm text-red-600"
                            >
                              {personalErrors.email.message}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <div className="relative">
                          <FiPhone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="tel"
                            {...registerPersonal('phone', {
                              required: 'Phone number is required',
                              pattern: {
                                value: /^[0-9]{10}$/,
                                message: 'Phone number must be exactly 10 digits',
                              },
                            })}
                            onInput={(e) => {
                              e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10);
                            }}
                            maxLength="10"
                            className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 ${personalErrors.phone
                              ? 'border-red-300 focus:border-red-500'
                              : 'border-gray-200 focus:border-primary-500'
                              } focus:outline-none transition-colors text-base`}
                            placeholder="1234567890"
                          />
                        </div>
                        <AnimatePresence>
                          {personalErrors.phone && (
                            <motion.p
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0 }}
                              className="mt-1 text-sm text-red-600"
                            >
                              {personalErrors.phone.message}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>

                      <div className="rounded-2xl border border-gray-100 bg-white/70 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-800">My Delivery OTP</p>
                            <p className="mt-1 text-xs text-gray-500">
                              Share this 6-digit OTP with delivery partner at delivery time.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowDeliveryOtp((prev) => !prev)}
                            className="shrink-0 px-3 py-2 rounded-xl border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50"
                          >
                            {showDeliveryOtp ? (
                              <span className="inline-flex items-center gap-1"><FiEyeOff /> Hide</span>
                            ) : (
                              <span className="inline-flex items-center gap-1"><FiEye /> Show</span>
                            )}
                          </button>
                        </div>

                        <div className="mt-3 flex items-center gap-2">
                          <div className="flex-1 rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 font-mono text-lg tracking-[0.35em] text-gray-900">
                            {isDeliveryOtpLoading
                              ? '••••••'
                              : showDeliveryOtp
                                ? (deliveryOtp || '------')
                                : '••••••'}
                          </div>
                          <button
                            type="button"
                            onClick={copyDeliveryOtp}
                            disabled={!deliveryOtp || isDeliveryOtpLoading}
                            className="px-4 py-3 rounded-xl bg-gray-900 text-white text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black"
                          >
                            <span className="inline-flex items-center gap-1"><FiCopy /> Copy</span>
                          </button>
                        </div>

                        <div className="mt-2 flex items-center justify-between text-[11px] text-gray-500">
                          <span>{deliveryOtpGeneratedAt ? `Generated: ${new Date(deliveryOtpGeneratedAt).toLocaleDateString()}` : ''}</span>
                          <button
                            type="button"
                            onClick={fetchDeliveryOtp}
                            disabled={isDeliveryOtpLoading}
                            className="text-primary-700 font-semibold hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Refresh
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full gradient-green text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-glow-green transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FiSave />
                        {isLoading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </form>
                  </motion.div>
                )}

                {/* Change Password Tab */}
                {activeTab === 'password' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card rounded-2xl p-4 lg:p-8"
                  >
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Change Password</h2>

                    <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Current Password
                        </label>
                        <div className="relative">
                          <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type={showCurrentPassword ? 'text' : 'password'}
                            {...registerPassword('currentPassword', {
                              required: 'Current password is required',
                            })}
                            className={`w-full pl-12 pr-12 py-3 rounded-xl border-2 ${passwordErrors.currentPassword
                              ? 'border-red-300 focus:border-red-500'
                              : 'border-gray-200 focus:border-primary-500'
                              } focus:outline-none transition-colors text-sm sm:text-base`}
                            placeholder="Current Password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showCurrentPassword ? <FiEyeOff /> : <FiEye />}
                          </button>
                        </div>
                        {passwordErrors.currentPassword && (
                          <p className="mt-1 text-sm text-red-600">
                            {passwordErrors.currentPassword.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          New Password
                        </label>
                        <div className="relative">
                          <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            {...registerPassword('newPassword', {
                              required: 'New password is required',
                              minLength: {
                                value: 6,
                                message: 'Password must be at least 6 characters',
                              },
                              pattern: {
                                value: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]+$/,
                                message: 'Password must contain at least one letter, one number, and one special character (no spaces)'
                              }
                            })}
                            className={`w-full pl-12 pr-12 py-3 rounded-xl border-2 ${passwordErrors.newPassword
                              ? 'border-red-300 focus:border-red-500'
                              : 'border-gray-200 focus:border-primary-500'
                              } focus:outline-none transition-colors text-sm sm:text-base`}
                            placeholder="New Password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showNewPassword ? <FiEyeOff /> : <FiEye />}
                          </button>
                        </div>
                        {passwordErrors.newPassword && (
                          <motion.p
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="mt-1 text-sm text-red-600"
                          >
                            {passwordErrors.newPassword.message}
                          </motion.p>
                        )}
                        <PasswordStrengthMeter password={newPassword} />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            {...registerPassword('confirmPassword', {
                              required: 'Please confirm your password',
                              validate: (value) =>
                                value === newPassword || 'Passwords do not match',
                            })}
                            className={`w-full pl-12 pr-12 py-3 rounded-xl border-2 ${passwordErrors.confirmPassword
                              ? 'border-red-300 focus:border-red-500'
                              : 'border-gray-200 focus:border-primary-500'
                              } focus:outline-none transition-colors text-sm sm:text-base`}
                            placeholder="Confirm Password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                          </button>
                        </div>
                        {passwordErrors.confirmPassword && (
                          <p className="mt-1 text-sm text-red-600">
                            {passwordErrors.confirmPassword.message}
                          </p>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full gradient-green text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-glow-green transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FiSave />
                        {isLoading ? 'Changing Password...' : 'Change Password'}
                      </button>
                    </form>
                  </motion.div>
                )}

                {/* Refer & Earn Tab */}
                {activeTab === 'referral' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card rounded-2xl p-4 lg:p-8"
                  >
                    <div className="text-center mb-8">
                      <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                        <FiGift className="text-4xl text-pink-500" />
                      </div>
                      <h2 className="text-2xl font-extrabold text-gray-800">Refer & Earn</h2>
                      <p className="text-gray-500 mt-2 text-sm max-w-xs mx-auto">
                        Share your referral code with friends. When they sign up, you earn 50 points!
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-3xl p-6 mb-8 border border-pink-100 flex flex-col items-center relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-pink-200/20 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                      <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-200/20 rounded-full -ml-16 -mb-16 blur-2xl"></div>
                      <p className="text-gray-600 text-sm font-bold mb-2 relative z-10">Your Reward Balance</p>
                      <h3 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 relative z-10 flex items-end gap-1">
                        {user?.referralPoints || 0} <span className="text-lg font-bold text-gray-500 pb-1">Pts</span>
                      </h3>
                    </div>

                    <div className="space-y-4">
                      <label className="block text-sm font-bold text-gray-700">Your Referral Code</label>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 rounded-2xl border-2 border-dashed border-pink-200 bg-pink-50/50 px-4 py-4 text-center font-mono text-xl sm:text-2xl font-bold text-gray-800 uppercase tracking-widest shadow-sm">
                          {user?.referralCode || 'N/A'}
                        </div>
                        <button
                          onClick={() => {
                            if (user?.referralCode) {
                              navigator.clipboard.writeText(user.referralCode);
                              toast.success('Referral code copied!');
                            }
                          }}
                          className="p-4 sm:p-5 rounded-2xl bg-gray-900 text-white hover:bg-black transition-all shadow-md active:scale-95 flex items-center justify-center"
                          title="Copy Code"
                        >
                          <FiCopy className="text-xl" />
                        </button>
                      </div>

                      <button
                        onClick={async () => {
                          if (navigator.share && user?.referralCode) {
                            try {
                              await navigator.share({
                                title: 'Join TrueBuy!',
                                text: `Sign up on TrueBuy using my referral code: ${user.referralCode} to get started!`,
                                url: window.location.origin + '/register',
                              });
                            } catch (err) {
                              console.log('Share error:', err);
                            }
                          } else {
                            toast.error('Sharing not supported on this device');
                          }
                        }}
                        className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition-all mt-6 shadow-xl shadow-pink-500/20 active:scale-[0.98]"
                      >
                        <FiShare2 className="text-xl" />
                        Share with Friends
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
      </MobileLayout>
    </PageTransition>
  );
};

export default MobileProfile;
