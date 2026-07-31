import { useState, useEffect } from 'react';
import { FiSave, FiUser, FiLock, FiShield, FiTrash2, FiEye, FiEyeOff } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useVendorAuthStore } from "../../store/vendorAuthStore";
import toast from 'react-hot-toast';

const ProfileSettings = () => {
  const navigate = useNavigate();
  const { vendor, updateProfile, logout, deleteAccount, isLoading } = useVendorAuthStore();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    gstNumber: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [activeSection, setActiveSection] = useState('profile');
  const [isInitialized, setIsInitialized] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  useEffect(() => {
    if (vendor && !isInitialized) {
      setFormData((prev) => ({
        ...prev,
        name: vendor.name || '',
        phone: vendor.phone || '',
        gstNumber: vendor.gstNumber || '',
      }));
      setIsInitialized(true);
    }
  }, [vendor, isInitialized]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!vendor) return;

    try {
      await updateProfile({
        name: formData.name,
        phone: formData.phone,
        gstNumber: formData.gstNumber,
      });
      toast.success('Profile updated successfully');
    } catch {
      // api.js shows toast
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!vendor) return;

    if (!formData.currentPassword) {
      toast.error('Please enter your current password');
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      // In a real app, this would be an API call to change password
      toast.success('Password changed successfully');
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      toast.error('Failed to change password');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/vendor/login');
    toast.success('Logged out successfully');
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword.trim()) {
      toast.error('Please enter your password to confirm');
      return;
    }

    setIsDeletingAccount(true);
    try {
      await deleteAccount(deletePassword);
      setShowDeleteModal(false);
      setDeletePassword('');
      toast.success('Account deleted successfully');
      navigate('/vendor/login');
    } catch {
      // Error toast handled by API interceptor.
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const sections = [
    { id: 'profile', label: 'Profile Info', icon: FiUser },
    { id: 'password', label: 'Change Password', icon: FiLock },
    { id: 'security', label: 'Security', icon: FiShield },
  ];

  if (!vendor) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Loading vendor information...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-full overflow-x-hidden"
    >
      <div className="lg:hidden">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Profile Settings</h1>
        <p className="text-sm sm:text-base text-gray-600">Manage your profile and account security</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 max-w-full overflow-x-hidden">
        <div className="border-b border-gray-200 overflow-x-hidden">
          <div className="flex overflow-x-auto scrollbar-hide -mx-1 px-1">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b-2 transition-colors whitespace-nowrap text-xs sm:text-sm ${activeSection === section.id
                    ? 'border-purple-600 text-purple-600 font-semibold'
                    : 'border-transparent text-gray-600 hover:text-gray-800'
                    }`}
                >
                  <Icon className="text-base sm:text-lg" />
                  <span>{section.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-3 sm:p-4 md:p-6">
          {activeSection === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onInput={(e) => {
                      e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, "");
                    }}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={vendor.email || ''}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone || ""}
                    onChange={handleChange}
                    onInput={(e) => {
                      e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10);
                    }}
                    maxLength="10"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    GST Number
                  </label>
                  <input
                    type="text"
                    name="gstNumber"
                    value={formData.gstNumber || ''}
                    onChange={handleChange}
                    placeholder="22AAAAA0000A1Z5"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all uppercase"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 sm:px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all font-semibold text-sm sm:text-base disabled:opacity-50"
                >
                  <FiSave />
                  Save Profile
                </button>
              </div>
            </form>
          )}

          {activeSection === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Current Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    New Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm New Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 sm:px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all font-semibold text-sm sm:text-base"
                >
                  <FiSave />
                  Change Password
                </button>
              </div>
            </form>
          )}

          {activeSection === 'security' && (
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-sm font-semibold text-blue-800 mb-2">Account Status</h3>
                <div className="space-y-2 text-sm text-blue-700">
                  <div className="flex items-center justify-between">
                    <span>Status:</span>
                    <span className="font-semibold capitalize">{vendor.status || 'pending'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Verified:</span>
                    <span className="font-semibold">{vendor.isVerified ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Joined:</span>
                    <span className="font-semibold">{new Date(vendor.joinDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="text-sm font-semibold text-yellow-800 mb-2">Security Recommendations</h3>
                <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                  <li>Use a strong, unique password</li>
                  <li>Enable two-factor authentication when available</li>
                  <li>Never share your login credentials</li>
                  <li>Log out from shared devices</li>
                </ul>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-semibold text-sm sm:text-base"
                >
                  Logout
                </button>
              </div>

              <div className="p-4 border border-red-200 rounded-lg bg-red-50/60">
                <h3 className="text-sm font-semibold text-red-800 mb-1">Danger Zone</h3>
                <p className="text-sm text-red-700 mb-4">
                  Deleting your account suspends your vendor profile, deactivates all products, and signs you out.
                  Active orders must be completed or cancelled first. This cannot be undone from the app.
                </p>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-4 sm:px-6 py-2 bg-white text-red-700 border border-red-300 rounded-lg hover:bg-red-100 transition-all font-semibold text-sm sm:text-base"
                >
                  <FiTrash2 />
                  Delete Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => {
              if (!isDeletingAccount) {
                setShowDeleteModal(false);
                setDeletePassword('');
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-white rounded-xl shadow-xl p-5 sm:p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                  <FiTrash2 className="text-lg" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Delete Account</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Enter your password to confirm. Your store will be suspended and products deactivated.
                  </p>
                </div>
              </div>

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm with your password
              </label>
              <div className="relative mb-5">
                <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type={showDeletePassword ? 'text' : 'password'}
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  disabled={isDeletingAccount}
                  className="w-full pl-12 pr-12 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowDeletePassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showDeletePassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
                <button
                  type="button"
                  disabled={isDeletingAccount}
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletePassword('');
                  }}
                  className="px-4 py-2.5 rounded-lg border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeletingAccount}
                  onClick={handleDeleteAccount}
                  className="px-4 py-2.5 rounded-lg bg-red-600 text-white font-semibold text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeletingAccount ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProfileSettings;
