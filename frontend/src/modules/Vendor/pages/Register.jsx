import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiPhone, FiShoppingBag, FiMapPin, FiArrowLeft } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useVendorAuthStore } from "../store/vendorAuthStore";
import { isValidEmail, isValidPhone } from '../../../shared/utils/helpers';
import toast from 'react-hot-toast';
import { appLogo } from "../../../data/logos";
import PageTransition from '../../../shared/components/PageTransition';

const VendorRegister = () => {
  const navigate = useNavigate();
  const { register: registerVendor, isLoading } = useVendorAuthStore();

  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('vendor_register_draft');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse draft form data', e);
      }
    }
    return {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      storeName: '',
      storeDescription: '',
      gstNumber: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
      },
    };
  });

  useEffect(() => {
    localStorage.setItem('vendor_register_draft', JSON.stringify(formData));
  }, [formData]);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let sanitizedValue = value;

    // Apply strict sanitization based on field name
    if (name === 'phone') {
      sanitizedValue = value.replace(/[^0-9]/g, '').replace(/^[^6-9]+/, '').slice(0, 10);
    } else if (['address.city', 'address.state', 'address.country'].includes(name)) {
      sanitizedValue = value.replace(/[^A-Za-z\s]/g, '');
    } else if (name === 'address.zipCode') {
      sanitizedValue = value.replace(/[^0-9]/g, '').slice(0, 6);
    } else if (name === 'name') {
      sanitizedValue = value.replace(/[^A-Za-z\s]/g, '');
    }

    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [addressField]: sanitizedValue,
        },
      });
      if (errors[`address.${addressField}`]) {
        setErrors(prev => ({ ...prev, [`address.${addressField}`]: null }));
      }
    } else {
      setFormData({
        ...formData,
        [name]: sanitizedValue,
      });
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: null }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { name, email, phone, storeName, storeDescription, gstNumber, address, password, confirmPassword } = formData;
    const newErrors = {};

    if (!name || !/^[A-Za-z\s]{2,50}$/.test(name)) newErrors.name = "Please enter a valid full name.";
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Please enter a valid email address.";
    if (!phone || !/^[6-9]\d{9}$/.test(phone)) newErrors.phone = "Please enter a valid 10-digit mobile number.";
    if (!storeName || !/^[A-Za-z0-9\s&\-.]{3,100}$/.test(storeName)) newErrors.storeName = "Store name must be between 3 and 100 characters.";
    if (!storeDescription || storeDescription.length < 20 || storeDescription.length > 500) newErrors.storeDescription = "Description must be at least 20 characters.";
    if (gstNumber && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{3}$/.test(gstNumber)) newErrors.gstNumber = "Please enter a valid GST number.";
    if (!address.street || address.street.length < 10 || address.street.length > 200) newErrors['address.street'] = "Please enter your complete address.";
    if (!address.city || !/^[A-Za-z\s]{2,50}$/.test(address.city)) newErrors['address.city'] = "Please enter a valid city.";
    if (!address.state || !/^[A-Za-z\s]{2,50}$/.test(address.state)) newErrors['address.state'] = "Please select your state.";
    if (!address.zipCode || !/^[1-9][0-9]{5}$/.test(address.zipCode)) newErrors['address.zipCode'] = "Please enter a valid PIN code.";
    if (!address.country || address.country.trim().length === 0) newErrors['address.country'] = "Please select a country.";
    if (!password || !/^(?=.*[A-Z])(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,32}$/.test(password)) newErrors.password = "Password must be at least 8 characters with 1 uppercase and 1 special character.";
    if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match.";
    if (!agreedToTerms) newErrors.agreedToTerms = "You must agree to the Terms & Conditions and Privacy Policy.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fix the highlighted errors.");
      return;
    }
    
    setErrors({});

    try {
      const result = await registerVendor({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone: formData.phone.trim(),
        storeName: formData.storeName.trim(),
        storeDescription: formData.storeDescription.trim(),
        gstNumber: formData.gstNumber.trim(),
        address: formData.address,
      });

      toast.success(result.message || 'Registration successful!');
      localStorage.removeItem('vendor_register_draft');
      // Navigate to referral verification page first
      navigate('/vendor/referral', { state: { email: formData.email, vendorId: result.vendorId } });
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 flex flex-col items-center">
        {/* Dark Header with Pattern */}
        <div className="w-full bg-[#111111] relative overflow-hidden h-48 lg:h-48 flex flex-col items-center justify-center">
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
          className="w-full max-w-2xl bg-white -mt-16 lg:-mt-32 rounded-t-[40px] shadow-2xl z-20 px-6 sm:px-10 pt-10 lg:pt-8 pb-12 flex-1 mb-10"
        >
          <div className="text-center mb-10 hidden lg:block">
            <h1 className="text-3xl font-bold text-gray-900">Become a Vendor</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-600 px-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className={`w-full px-6 py-4 rounded-2xl bg-gray-50 border ${errors.name ? 'border-red-500' : 'border-transparent'} focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 transition-all outline-none text-gray-900`}
                    required
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1 px-1">{errors.name}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-600 px-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="vendor@example.com"
                    className={`w-full px-6 py-4 rounded-2xl bg-gray-50 border ${errors.email ? 'border-red-500' : 'border-transparent'} focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 transition-all outline-none text-gray-900`}
                    required
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1 px-1">{errors.email}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-600 px-1">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    maxLength="10"
                    placeholder="9876543210"
                    className={`w-full px-6 py-4 rounded-2xl bg-gray-50 border ${errors.phone ? 'border-red-500' : 'border-transparent'} focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 transition-all outline-none text-gray-900`}
                    required
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1 px-1">{errors.phone}</p>}
                </div>
              </div>
            </div>

            {/* Store Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Store Information</h3>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-600 px-1">Store Name</label>
                  <input
                    type="text"
                    name="storeName"
                    value={formData.storeName}
                    onChange={handleChange}
                    placeholder="My Awesome Store"
                    className={`w-full px-6 py-4 rounded-2xl bg-gray-50 border ${errors.storeName ? 'border-red-500' : 'border-transparent'} focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 transition-all outline-none text-gray-900`}
                    required
                  />
                  {errors.storeName && <p className="text-red-500 text-xs mt-1 px-1">{errors.storeName}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-600 px-1">Store Description</label>
                  <textarea
                    name="storeDescription"
                    value={formData.storeDescription}
                    onChange={handleChange}
                    placeholder="Describe your store..."
                    rows={3}
                    className={`w-full px-6 py-4 rounded-2xl bg-gray-50 border ${errors.storeDescription ? 'border-red-500' : 'border-transparent'} focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 transition-all outline-none text-gray-900 resize-none`}
                  />
                  {errors.storeDescription && <p className="text-red-500 text-xs mt-1 px-1">{errors.storeDescription}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-600 px-1">GST Number (Optional)</label>
                  <input
                    type="text"
                    name="gstNumber"
                    value={formData.gstNumber}
                    onChange={handleChange}
                    placeholder="22AAAAA0000A1Z5"
                    className={`w-full px-6 py-4 rounded-2xl bg-gray-50 border ${errors.gstNumber ? 'border-red-500' : 'border-transparent'} focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 transition-all outline-none text-gray-900 uppercase`}
                  />
                  {errors.gstNumber ? (
                    <p className="text-red-500 text-xs mt-1 px-1">{errors.gstNumber}</p>
                  ) : (
                    <p className="text-gray-400 text-xs mt-1 px-1">Example: 27ABCDE1234F1Z5</p>
                  )}
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Business Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-1">
                  <label className="text-sm font-medium text-gray-600 px-1">Street Address</label>
                  <input
                    type="text"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                    placeholder="123 Main Street"
                    className={`w-full px-6 py-4 rounded-2xl bg-gray-50 border ${errors['address.street'] ? 'border-red-500' : 'border-transparent'} focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 transition-all outline-none text-gray-900`}
                  />
                  {errors['address.street'] && <p className="text-red-500 text-xs mt-1 px-1">{errors['address.street']}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-600 px-1">City</label>
                  <input
                    type="text"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                    placeholder="New York"
                    className={`w-full px-6 py-4 rounded-2xl bg-gray-50 border ${errors['address.city'] ? 'border-red-500' : 'border-transparent'} focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 transition-all outline-none text-gray-900`}
                  />
                  {errors['address.city'] && <p className="text-red-500 text-xs mt-1 px-1">{errors['address.city']}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-600 px-1">State</label>
                  <input
                    type="text"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleChange}
                    placeholder="NY"
                    className={`w-full px-6 py-4 rounded-2xl bg-gray-50 border ${errors['address.state'] ? 'border-red-500' : 'border-transparent'} focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 transition-all outline-none text-gray-900`}
                  />
                  {errors['address.state'] && <p className="text-red-500 text-xs mt-1 px-1">{errors['address.state']}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-600 px-1">Zip Code</label>
                  <input
                    type="text"
                    name="address.zipCode"
                    value={formData.address.zipCode}
                    onChange={handleChange}
                    placeholder="10001"
                    className={`w-full px-6 py-4 rounded-2xl bg-gray-50 border ${errors['address.zipCode'] ? 'border-red-500' : 'border-transparent'} focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 transition-all outline-none text-gray-900`}
                  />
                  {errors['address.zipCode'] && <p className="text-red-500 text-xs mt-1 px-1">{errors['address.zipCode']}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-600 px-1">Country</label>
                  <input
                    type="text"
                    name="address.country"
                    value={formData.address.country}
                    onChange={handleChange}
                    placeholder="USA"
                    className={`w-full px-6 py-4 rounded-2xl bg-gray-50 border ${errors['address.country'] ? 'border-red-500' : 'border-transparent'} focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 transition-all outline-none text-gray-900`}
                  />
                  {errors['address.country'] && <p className="text-red-500 text-xs mt-1 px-1">{errors['address.country']}</p>}
                </div>
              </div>
            </div>

            {/* Account Security */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Account Security</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-600 px-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className={`w-full px-6 py-4 rounded-2xl bg-gray-50 border ${errors.password ? 'border-red-500' : 'border-transparent'} focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 transition-all outline-none text-gray-900`}
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
                  {errors.password ? (
                    <p className="text-red-500 text-xs mt-1 px-1">{errors.password}</p>
                  ) : (
                    <p className="text-gray-400 text-xs mt-1 px-1">Min 8 chars, 1 uppercase, 1 special char</p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-600 px-1">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className={`w-full px-6 py-4 rounded-2xl bg-gray-50 border ${errors.confirmPassword ? 'border-red-500' : 'border-transparent'} focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 transition-all outline-none text-gray-900`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-black transition-colors"
                    >
                      {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 px-1">{errors.confirmPassword}</p>}
                </div>
              </div>
            </div>

            {/* Note */}
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 italic">
              <p className="text-xs text-gray-500 leading-relaxed text-center">
                <strong>Note:</strong> You must verify your email first, then your registration will be reviewed by admin.
                You will receive an email when your account is approved or rejected.
              </p>
            </div>

            {/* Terms and Conditions */}
            <div className="space-y-1">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => {
                      setAgreedToTerms(e.target.checked);
                      if (errors.agreedToTerms) setErrors(prev => ({ ...prev, agreedToTerms: null }));
                    }}
                    className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black/20 focus:ring-offset-0 transition-all cursor-pointer peer appearance-none checked:bg-black checked:border-black"
                  />
                  <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 4.5L4.5 8L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-sm text-gray-600 leading-relaxed">
                  I agree to the{' '}
                  <Link to="/vendor/terms" target="_blank" className="text-black font-bold hover:underline">
                    Terms & Conditions
                  </Link>
                  {' '}and{' '}
                  <Link to="/vendor/privacy" target="_blank" className="text-black font-bold hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
              {errors.agreedToTerms && <p className="text-red-500 text-xs mt-1 px-1 ml-8">{errors.agreedToTerms}</p>}
            </div>

            {/* Action Buttons */}
            <div className="pt-4 space-y-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#111111] text-white py-4 rounded-2xl font-bold text-lg hover:bg-black transition-all shadow-lg active:scale-[0.98] disabled:opacity-50"
              >
                {isLoading ? 'Registering...' : 'Register as Vendor'}
              </button>

              <div className="text-center pt-2">
                <p className="text-gray-500 text-sm">
                  Already have an account?{' '}
                  <Link to="/vendor/login" className="text-black font-bold hover:underline">
                    Login
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

export default VendorRegister;

