import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useDeliveryAuthStore } from '../store/deliveryStore';
import { FiUser, FiMail, FiPhone, FiTruck, FiEdit2, FiSave, FiX, FiLogOut, FiCreditCard, FiCamera, FiShield, FiFileText } from 'react-icons/fi';
import PageTransition from '../../../shared/components/PageTransition';
import toast from 'react-hot-toast';
import { formatPrice } from '../../../shared/utils/helpers';
import { SERVER_URL } from '../../../shared/utils/constants';

const DeliveryProfile = () => {
  const navigate = useNavigate();
  const { deliveryBoy, updateProfile, updateAvatar, fetchProfile, fetchProfileSummary, isLoading, logout } = useDeliveryAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const formRef = useRef(null);
  
  const handleEditClick = () => {
    setIsEditing(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };
  
  const [profileMetrics, setProfileMetrics] = useState({
    totalDeliveries: 0,
    completedToday: 0,
    earnings: 0,
  });
  const [formData, setFormData] = useState({
    name: deliveryBoy?.name || '',
    email: deliveryBoy?.email || '',
    phone: deliveryBoy?.phone || '',
    vehicleType: deliveryBoy?.vehicleType || '',
    vehicleNumber: deliveryBoy?.vehicleNumber || '',
    bankDetails: {
      accountHolderName: deliveryBoy?.bankDetails?.accountHolderName || '',
      accountNumber: deliveryBoy?.bankDetails?.accountNumber || '',
      ifscCode: deliveryBoy?.bankDetails?.ifscCode || '',
      bankName: deliveryBoy?.bankDetails?.bankName || '',
    },
  });

  const loadProfile = useCallback(async () => {
    try {
      setLoadFailed(false);
      const profile = await fetchProfile();
      try {
        const summary = await fetchProfileSummary();
        setProfileMetrics({
          totalDeliveries: Number(summary?.totalDeliveries || 0),
          completedToday: Number(summary?.completedToday || 0),
          earnings: Number(summary?.earnings || 0),
        });
      } catch {
        setProfileMetrics({
          totalDeliveries: Number(profile?.totalDeliveries || 0),
          completedToday: 0,
          earnings: 0,
        });
      }
    } catch {
      setLoadFailed(true);
    }
  }, [fetchProfile, fetchProfileSummary]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    setFormData({
      name: deliveryBoy?.name || '',
      email: deliveryBoy?.email || '',
      phone: deliveryBoy?.phone || '',
      vehicleType: deliveryBoy?.vehicleType || '',
      vehicleNumber: deliveryBoy?.vehicleNumber || '',
      bankDetails: {
        accountHolderName: deliveryBoy?.bankDetails?.accountHolderName || '',
        accountNumber: deliveryBoy?.bankDetails?.accountNumber || '',
        ifscCode: deliveryBoy?.bankDetails?.ifscCode || '',
        bankName: deliveryBoy?.bankDetails?.bankName || '',
      },
    });
  }, [deliveryBoy]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('bank.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        bankDetails: {
          ...formData.bankDetails,
          [field]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSave = async () => {
    if (!formData.name?.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!formData.email?.trim()) {
      toast.error('Email is required');
      return;
    }
    if (!formData.phone?.trim()) {
      toast.error('Phone is required');
      return;
    }
    if (!formData.vehicleNumber?.trim()) {
      toast.error('Vehicle number is required');
      return;
    }
    const vehicleNumberRegex = /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/i;
    if (!vehicleNumberRegex.test(formData.vehicleNumber.trim())) {
      toast.error('Invalid Vehicle Number! Format: MH01AB1234');
      return;
    }
    try {
      await updateProfile({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        vehicleType: formData.vehicleType?.trim() || '',
        vehicleNumber: formData.vehicleNumber?.trim().toUpperCase() || '',
        bankDetails: formData.bankDetails,
      });
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch {
      // Error toast handled by API interceptor.
    }
  };

  const handleCancel = () => {
    setFormData({
      name: deliveryBoy?.name || '',
      email: deliveryBoy?.email || '',
      phone: deliveryBoy?.phone || '',
      vehicleType: deliveryBoy?.vehicleType || '',
      vehicleNumber: deliveryBoy?.vehicleNumber || '',
      bankDetails: {
        accountHolderName: deliveryBoy?.bankDetails?.accountHolderName || '',
        accountNumber: deliveryBoy?.bankDetails?.accountNumber || '',
        ifscCode: deliveryBoy?.bankDetails?.ifscCode || '',
        bankName: deliveryBoy?.bankDetails?.bankName || '',
      },
    });
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/delivery/login');
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      await updateAvatar(formData);
      toast.success('Profile photo updated');
    } catch {
      // Error toast handled by API interceptor
    }
  };

  const getAvatarUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    // Since we added a proxy for /uploads in vite.config.js, we can use relative paths
    if (path.startsWith('/uploads')) return path;
    const baseUrl = SERVER_URL || 'http://localhost:5000';
    return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  const stats = [
    { label: 'Total Deliveries', value: Number(profileMetrics.totalDeliveries || 0) },
    { label: 'Completed Today', value: Number(profileMetrics.completedToday || 0) },
    { label: 'Rating', value: Number(deliveryBoy?.rating || 0).toFixed(1) },
    { label: 'Earnings', value: formatPrice(Number(profileMetrics.earnings || 0)) },
  ];

  return (
    <PageTransition>
      <div className="px-4 py-6 space-y-6">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">My Profile</h1>
              {loadFailed && (
                <button
                  onClick={loadProfile}
                  className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-lg font-semibold"
                >
                  Retry
                </button>
              )}
            {!isEditing ? (
              <button
                onClick={handleEditClick}
                className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30"
              >
                <FiEdit2 />
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30"
                >
                  <FiSave />
                </button>
                <button
                  onClick={handleCancel}
                  className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30"
                >
                  <FiX />
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-3xl font-bold border-2 border-white/30 overflow-hidden">
                {deliveryBoy?.avatar ? (
                  <img 
                    src={getAvatarUrl(deliveryBoy.avatar)} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    onLoad={(e) => { e.target.style.opacity = 1; }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      // If it fails, we might want to show the initial, but since we hide the img,
                      // the parent div will show the initial if we handle it there.
                    }}
                    style={{ opacity: 0, transition: 'opacity 0.3s' }}
                  />
                ) : null}
                {(!deliveryBoy?.avatar || !getAvatarUrl(deliveryBoy.avatar)) && (deliveryBoy?.name?.charAt(0) || 'D')}
              </div>
              {isEditing && (
                <label className="absolute bottom-0 right-0 p-1.5 bg-white text-primary-600 rounded-full shadow-lg cursor-pointer hover:bg-gray-100 transition-colors border-2 border-primary-600">
                  <FiCamera className="text-xs" />
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleAvatarChange}
                    disabled={isLoading}
                  />
                </label>
              )}
            </div>
            <div>
              <p className="text-xl font-semibold">{deliveryBoy?.name || 'Delivery Boy'}</p>
              <p className="text-primary-100 text-sm">{deliveryBoy?.email || 'email@example.com'}</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-4 shadow-sm"
            >
              <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Profile Information */}
        <motion.div
          ref={formRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-4 shadow-sm space-y-4"
        >
          <h2 className="text-lg font-bold text-gray-800 mb-4">Personal Information</h2>

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <FiUser />
              Full Name
            </label>
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none"
              />
            ) : (
              <p className="px-4 py-3 bg-gray-50 rounded-xl text-gray-800">{formData.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <FiMail />
              Email Address
            </label>
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none"
              />
            ) : (
              <p className="px-4 py-3 bg-gray-50 rounded-xl text-gray-800">{formData.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <FiPhone />
              Phone Number
            </label>
            {isEditing ? (
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none"
              />
            ) : (
              <p className="px-4 py-3 bg-gray-50 rounded-xl text-gray-800">{formData.phone}</p>
            )}
          </div>
        </motion.div>

        {/* Vehicle Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-4 shadow-sm space-y-4"
        >
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FiTruck />
            Vehicle Information
          </h2>

          {/* Vehicle Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Vehicle Type</label>
            {isEditing ? (
              <select
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none"
              >
                <option value="Bike">Bike</option>
                <option value="Car">Car</option>
                <option value="Scooter">Scooter</option>
                <option value="Van">Van</option>
              </select>
            ) : (
              <p className="px-4 py-3 bg-gray-50 rounded-xl text-gray-800">{formData.vehicleType}</p>
            )}
          </div>

          {/* Vehicle Number */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Vehicle Number</label>
            {isEditing ? (
              <input
                type="text"
                name="vehicleNumber"
                value={formData.vehicleNumber}
                onChange={handleChange}
                placeholder="MH01AB1234"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none"
              />
            ) : (
              <p className="px-4 py-3 bg-gray-50 rounded-xl text-gray-800">{formData.vehicleNumber}</p>
            )}
          </div>
        </motion.div>

        {/* Bank Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white rounded-2xl p-4 shadow-sm space-y-4"
        >
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FiCreditCard className="text-primary-600" />
            Bank Details
          </h2>

          <div className="grid grid-cols-1 gap-4">
            {/* Account Holder */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Account Holder Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="bank.accountHolderName"
                  value={formData.bankDetails.accountHolderName}
                  onChange={handleChange}
                  placeholder="As per bank records"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none"
                />
              ) : (
                <p className="px-4 py-3 bg-gray-50 rounded-xl text-gray-800">{formData.bankDetails.accountHolderName || 'Not added'}</p>
              )}
            </div>

            {/* Bank Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Bank Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="bank.bankName"
                  value={formData.bankDetails.bankName}
                  onChange={handleChange}
                  placeholder="e.g. HDFC Bank"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none"
                />
              ) : (
                <p className="px-4 py-3 bg-gray-50 rounded-xl text-gray-800">{formData.bankDetails.bankName || 'Not added'}</p>
              )}
            </div>

            {/* Account Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Account Number</label>
              {isEditing ? (
                <input
                  type="text"
                  name="bank.accountNumber"
                  value={formData.bankDetails.accountNumber}
                  onChange={handleChange}
                  placeholder="Enter account number"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none"
                />
              ) : (
                <p className="px-4 py-3 bg-gray-50 rounded-xl text-gray-800">{formData.bankDetails.accountNumber || 'Not added'}</p>
              )}
            </div>

            {/* IFSC Code */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">IFSC Code</label>
              {isEditing ? (
                <input
                  type="text"
                  name="bank.ifscCode"
                  value={formData.bankDetails.ifscCode}
                  onChange={handleChange}
                  placeholder="e.g. HDFC0001234"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:outline-none uppercase"
                />
              ) : (
                <p className="px-4 py-3 bg-gray-50 rounded-xl text-gray-800 uppercase">{formData.bankDetails.ifscCode || 'Not added'}</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Legal & Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38 }}
          className="bg-white rounded-2xl p-4 shadow-sm space-y-4"
        >
          <h2 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
            <FiShield className="text-gray-600" />
            Legal & Support
          </h2>
          
          <div className="space-y-1">
            <Link to="/delivery/terms" className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <FiFileText className="text-gray-400" />
                <span className="font-medium text-gray-700">Terms & Conditions</span>
              </div>
            </Link>
            
            <Link to="/delivery/privacy" className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <FiShield className="text-gray-400" />
                <span className="font-medium text-gray-700">Privacy Policy</span>
              </div>
            </Link>
          </div>
        </motion.div>

        {/* Logout Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-4 shadow-sm"
        >
          <button
            onClick={handleLogout}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition-colors"
          >
            <FiLogOut className="text-xl" />
            <span>Logout</span>
          </button>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default DeliveryProfile;

