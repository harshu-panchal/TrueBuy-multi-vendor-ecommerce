import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiEye, FiEyeOff, FiArrowLeft, FiPhone, FiCheckCircle, FiArrowRight } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useVendorAuthStore } from "../store/vendorAuthStore";
import toast from 'react-hot-toast';
import PageTransition from '../../../shared/components/PageTransition';
import api from '../../../shared/utils/api';

const VendorRegister = () => {
  const navigate = useNavigate();
  const { register: registerVendor, isLoading: isRegistering } = useVendorAuthStore();

  const [step, setStep] = useState(1); // 1: Phone OTP, 2: Referral, 3: Details
  
  // Step 1: Phone State
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);

  // Step 2: Referral State
  const [referralCode, setReferralCode] = useState('');
  const [referralVerified, setReferralVerified] = useState(false);
  const [referrerName, setReferrerName] = useState('');
  const [isVerifyingReferral, setIsVerifyingReferral] = useState(false);

  // Step 3: Registration State
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('vendor_register_draft');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return {
      name: '', email: '', password: '', confirmPassword: '',
      storeName: '', storeDescription: '', gstNumber: '',
      address: { street: '', city: '', state: '', zipCode: '', country: '' },
    };
  });

  useEffect(() => {
    localStorage.setItem('vendor_register_draft', JSON.stringify(formData));
  }, [formData]);

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // --- Step 1 Actions ---
  const handleSendOtp = async () => {
    if (!/^[6-9]\d{9}$/.test(phone)) {
      toast.error('Please enter a valid 10-digit mobile number.');
      return;
    }
    setIsSendingOtp(true);
    try {
      const res = await api.post('/vendor/auth/send-phone-otp', { phone });
      toast.success(res.data?.message || 'OTP sent successfully!');
      setOtpSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!/^\d{6}$/.test(otp)) {
      toast.error('Please enter a valid 6-digit OTP.');
      return;
    }
    setIsVerifyingOtp(true);
    try {
      await api.post('/vendor/auth/verify-phone-otp', { phone, otp });
      toast.success('Phone verified successfully!');
      setPhoneVerified(true);
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // --- Step 2 Actions ---
  const handleVerifyReferral = async () => {
    if (!referralCode.trim()) {
      toast.error('Please enter a referral code.');
      return;
    }
    setIsVerifyingReferral(true);
    try {
      const res = await api.get(`/vendor/auth/check-referral/${referralCode.trim()}`);
      setReferrerName(res.data?.fullName || res.data?.name || 'Valid Referral');
      setReferralVerified(true);
      toast.success('Referral code verified!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid referral code.');
      setReferralVerified(false);
      setReferrerName('');
    } finally {
      setIsVerifyingReferral(false);
    }
  };

  const handleContinueToDetails = () => {
    setStep(3);
  };

  const handleSkipReferral = () => {
    setReferralCode('');
    setReferralVerified(false);
    setStep(3);
  };

  // --- Step 3 Actions ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    let sanitizedValue = value;
    if (['address.city', 'address.state', 'address.country'].includes(name)) {
      sanitizedValue = value.replace(/[^A-Za-z\s]/g, '');
    } else if (name === 'address.zipCode') {
      sanitizedValue = value.replace(/[^0-9]/g, '').slice(0, 6);
    } else if (name === 'name') {
      sanitizedValue = value.replace(/[^A-Za-z\s]/g, '');
    }

    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({ ...prev, address: { ...prev.address, [field]: sanitizedValue } }));
      if (errors[`address.${field}`]) setErrors(prev => ({ ...prev, [`address.${field}`]: null }));
    } else {
      setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
      if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    const { name, email, storeName, storeDescription, gstNumber, address, password, confirmPassword } = formData;
    const newErrors = {};

    if (!name || !/^[A-Za-z\s]{2,50}$/.test(name)) newErrors.name = "Please enter a valid full name.";
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Please enter a valid email address.";
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
        phone: phone.trim(),
        storeName: formData.storeName.trim(),
        storeDescription: formData.storeDescription.trim(),
        gstNumber: formData.gstNumber.trim(),
        address: formData.address,
        referralCode: referralVerified ? referralCode.trim() : undefined,
      });

      toast.success(result.message || 'Registration successful!');
      localStorage.removeItem('vendor_register_draft');
      // Navigate straight to verification page to verify email
      navigate('/vendor/verification', { state: { email: formData.email.trim().toLowerCase() } });
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 flex flex-col items-center">
        {/* Header */}
        <div className="w-full bg-[#111111] relative overflow-hidden h-48 lg:h-48 flex flex-col items-center justify-center">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}
            className="absolute top-8 left-8 p-3 text-white hover:bg-white/10 rounded-full transition-colors z-30"
          >
            <FiArrowLeft size={24} />
          </button>
          <div className="absolute inset-0 opacity-20 pointer-events-none"
            style={{ backgroundImage: `radial-gradient(circle at 10px 10px, #333 2px, transparent 0)`, backgroundSize: '30px 30px' }}>
          </div>
          <h1 className="z-10 text-4xl font-bold text-white lg:hidden">Sign Up</h1>
        </div>

        {/* Content Card */}
        <div className="w-full max-w-2xl bg-white -mt-16 lg:-mt-32 rounded-t-[40px] shadow-2xl z-20 px-6 sm:px-10 pt-10 lg:pt-8 pb-12 flex-1 mb-10">
          <div className="text-center mb-8 hidden lg:block">
            <h1 className="text-3xl font-bold text-gray-900">Become a Vendor</h1>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <div className="max-w-md mx-auto space-y-6">
                  <div className="text-center space-y-2 mb-8">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <FiPhone className="text-2xl text-gray-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Verify Phone Number</h2>
                    <p className="text-gray-500 text-sm">We need to verify your number before proceeding.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-600 px-1">Phone Number</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        disabled={otpSent}
                        placeholder="9876543210"
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 transition-all outline-none text-gray-900 disabled:opacity-60"
                      />
                    </div>
                    
                    {otpSent && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-1">
                        <label className="text-sm font-medium text-gray-600 px-1">Enter OTP</label>
                        <input
                          type="text"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="123456"
                          className="w-full px-6 py-4 text-center tracking-widest text-lg font-bold rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 transition-all outline-none text-gray-900"
                        />
                      </motion.div>
                    )}

                    {!otpSent ? (
                      <button onClick={handleSendOtp} disabled={isSendingOtp || phone.length !== 10} className="w-full bg-[#111111] text-white py-4 rounded-2xl font-bold text-lg hover:bg-black transition-all shadow-lg active:scale-[0.98] disabled:opacity-50">
                        {isSendingOtp ? 'Sending OTP...' : 'Send OTP'}
                      </button>
                    ) : (
                      <button onClick={handleVerifyOtp} disabled={isVerifyingOtp || otp.length !== 6} className="w-full bg-[#111111] text-white py-4 rounded-2xl font-bold text-lg hover:bg-black transition-all shadow-lg active:scale-[0.98] disabled:opacity-50">
                        {isVerifyingOtp ? 'Verifying...' : 'Verify OTP'}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <div className="max-w-md mx-auto space-y-6">
                  <div className="text-center space-y-2 mb-8">
                    <h2 className="text-2xl font-bold text-[#FBBF24]">Enter Referral Code</h2>
                    <p className="text-gray-500 text-sm">Optional for new vendor signup</p>
                  </div>

                  <div className="space-y-4">
                    <input
                      type="text"
                      value={referralCode}
                      onChange={(e) => {
                        setReferralCode(e.target.value.toUpperCase());
                        setReferralVerified(false);
                      }}
                      placeholder="e.g. TL000065"
                      className="w-full px-6 py-4 rounded-2xl bg-gray-100 border border-transparent focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 transition-all outline-none text-gray-900 font-medium"
                    />

                    {referralVerified && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#fef3c7] p-4 rounded-xl border border-[#fde68a]">
                        <p className="text-black font-semibold">Referral code verified</p>
                        <p className="text-green-700 text-sm mt-1 flex items-center gap-1">Referred by: {referrerName}</p>
                      </motion.div>
                    )}

                    <div className="pt-4 space-y-3">
                      {!referralVerified ? (
                        <button onClick={handleVerifyReferral} disabled={isVerifyingReferral || !referralCode.trim()} className="w-full bg-[#111111] text-white py-4 rounded-2xl font-bold text-lg hover:bg-black transition-all shadow-lg active:scale-[0.98] disabled:opacity-50">
                          {isVerifyingReferral ? 'Verifying...' : 'Verify Code'}
                        </button>
                      ) : (
                        <button onClick={handleContinueToDetails} className="w-full bg-[#111111] text-white py-4 rounded-2xl font-bold text-lg hover:bg-black transition-all shadow-lg active:scale-[0.98]">
                          Continue
                        </button>
                      )}
                      
                      <button onClick={handleSkipReferral} className="w-full py-4 rounded-2xl font-semibold text-gray-500 hover:text-black transition-all active:scale-[0.98]">
                        Skip
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                <form onSubmit={handleFinalSubmit} className="space-y-8">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-600 px-1">Full Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" className={`w-full px-6 py-4 rounded-2xl bg-gray-50 border ${errors.name ? 'border-red-500' : 'border-transparent'} focus:bg-white focus:border-black outline-none`} required />
                        {errors.name && <p className="text-red-500 text-xs mt-1 px-1">{errors.name}</p>}
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-600 px-1">Email Address</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="vendor@example.com" className={`w-full px-6 py-4 rounded-2xl bg-gray-50 border ${errors.email ? 'border-red-500' : 'border-transparent'} focus:bg-white focus:border-black outline-none`} required />
                        {errors.email && <p className="text-red-500 text-xs mt-1 px-1">{errors.email}</p>}
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-sm font-medium text-gray-600 px-1">Phone Number (Verified)</label>
                        <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-gray-100 border border-transparent text-gray-500">
                           <FiCheckCircle className="text-green-500" />
                           {phone}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Store Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Store Information</h3>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-600 px-1">Store Name</label>
                        <input type="text" name="storeName" value={formData.storeName} onChange={handleChange} placeholder="My Awesome Store" className={`w-full px-6 py-4 rounded-2xl bg-gray-50 border ${errors.storeName ? 'border-red-500' : 'border-transparent'} focus:bg-white focus:border-black outline-none`} required />
                        {errors.storeName && <p className="text-red-500 text-xs mt-1 px-1">{errors.storeName}</p>}
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-600 px-1">Store Description</label>
                        <textarea name="storeDescription" value={formData.storeDescription} onChange={handleChange} placeholder="Describe your store..." rows={3} className={`w-full px-6 py-4 rounded-2xl bg-gray-50 border ${errors.storeDescription ? 'border-red-500' : 'border-transparent'} focus:bg-white focus:border-black outline-none resize-none`} />
                        {errors.storeDescription && <p className="text-red-500 text-xs mt-1 px-1">{errors.storeDescription}</p>}
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-600 px-1">GST Number (Optional)</label>
                        <input type="text" name="gstNumber" value={formData.gstNumber} onChange={handleChange} placeholder="22AAAAA0000A1Z5" className={`w-full px-6 py-4 rounded-2xl bg-gray-50 border ${errors.gstNumber ? 'border-red-500' : 'border-transparent'} focus:bg-white focus:border-black outline-none uppercase`} />
                        {errors.gstNumber && <p className="text-red-500 text-xs mt-1 px-1">{errors.gstNumber}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Address Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Business Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2 space-y-1">
                        <label className="text-sm font-medium text-gray-600 px-1">Street Address</label>
                        <input type="text" name="address.street" value={formData.address.street} onChange={handleChange} placeholder="123 Main Street" className={`w-full px-6 py-4 rounded-2xl bg-gray-50 border ${errors['address.street'] ? 'border-red-500' : 'border-transparent'} focus:bg-white focus:border-black outline-none`} />
                        {errors['address.street'] && <p className="text-red-500 text-xs mt-1 px-1">{errors['address.street']}</p>}
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-600 px-1">City</label>
                        <input type="text" name="address.city" value={formData.address.city} onChange={handleChange} placeholder="New York" className={`w-full px-6 py-4 rounded-2xl bg-gray-50 border ${errors['address.city'] ? 'border-red-500' : 'border-transparent'} focus:bg-white focus:border-black outline-none`} />
                        {errors['address.city'] && <p className="text-red-500 text-xs mt-1 px-1">{errors['address.city']}</p>}
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-600 px-1">State</label>
                        <input type="text" name="address.state" value={formData.address.state} onChange={handleChange} placeholder="NY" className={`w-full px-6 py-4 rounded-2xl bg-gray-50 border ${errors['address.state'] ? 'border-red-500' : 'border-transparent'} focus:bg-white focus:border-black outline-none`} />
                        {errors['address.state'] && <p className="text-red-500 text-xs mt-1 px-1">{errors['address.state']}</p>}
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-600 px-1">Zip Code</label>
                        <input type="text" name="address.zipCode" value={formData.address.zipCode} onChange={handleChange} placeholder="10001" className={`w-full px-6 py-4 rounded-2xl bg-gray-50 border ${errors['address.zipCode'] ? 'border-red-500' : 'border-transparent'} focus:bg-white focus:border-black outline-none`} />
                        {errors['address.zipCode'] && <p className="text-red-500 text-xs mt-1 px-1">{errors['address.zipCode']}</p>}
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-600 px-1">Country</label>
                        <input type="text" name="address.country" value={formData.address.country} onChange={handleChange} placeholder="USA" className={`w-full px-6 py-4 rounded-2xl bg-gray-50 border ${errors['address.country'] ? 'border-red-500' : 'border-transparent'} focus:bg-white focus:border-black outline-none`} />
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
                          <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" className={`w-full px-6 py-4 rounded-2xl bg-gray-50 border ${errors.password ? 'border-red-500' : 'border-transparent'} focus:bg-white focus:border-black outline-none`} required />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-black">
                            {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                          </button>
                        </div>
                        {errors.password && <p className="text-red-500 text-xs mt-1 px-1">{errors.password}</p>}
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-600 px-1">Confirm Password</label>
                        <div className="relative">
                          <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" className={`w-full px-6 py-4 rounded-2xl bg-gray-50 border ${errors.confirmPassword ? 'border-red-500' : 'border-transparent'} focus:bg-white focus:border-black outline-none`} required />
                          <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-black">
                            {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                          </button>
                        </div>
                        {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 px-1">{errors.confirmPassword}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="space-y-1">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input type="checkbox" checked={agreedToTerms} onChange={(e) => { setAgreedToTerms(e.target.checked); if (errors.agreedToTerms) setErrors(prev => ({ ...prev, agreedToTerms: null })); }} className="w-5 h-5 rounded border-gray-300 text-black mt-0.5" />
                      <span className="text-sm text-gray-600 leading-relaxed">I agree to the <Link to="/vendor/support-info" target="_blank" className="text-black font-bold hover:underline">Terms & Conditions</Link> and <Link to="/vendor/privacy" target="_blank" className="text-black font-bold hover:underline">Privacy Policy</Link>.</span>
                    </label>
                    {errors.agreedToTerms && <p className="text-red-500 text-xs mt-1 px-1 ml-8">{errors.agreedToTerms}</p>}
                  </div>

                  <div className="pt-4">
                    <button type="submit" disabled={isRegistering} className="w-full bg-[#111111] text-white py-4 rounded-2xl font-bold text-lg hover:bg-black transition-all shadow-lg active:scale-[0.98] disabled:opacity-50">
                      {isRegistering ? 'Registering...' : 'Register as Vendor'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
};

export default VendorRegister;
