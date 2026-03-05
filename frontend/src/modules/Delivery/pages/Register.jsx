import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiPhone, FiTruck, FiMapPin, FiFileText } from 'react-icons/fi';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { appLogo } from '../../../data/logos';
import { useDeliveryAuthStore } from '../store/deliveryStore';

const DeliveryRegister = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useDeliveryAuthStore();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    vehicleType: 'Bike',
    vehicleNumber: '',
    password: '',
    confirmPassword: '',
    drivingLicense: null,
    aadharCard: null,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'drivingLicense' || name === 'aadharCard') {
      setFormData((prev) => ({ ...prev, [name]: files?.[0] || null }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (!formData.drivingLicense || !formData.aadharCard) {
      toast.error('Driving License and Aadhar Card are required');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      const result = await register({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        vehicleType: formData.vehicleType,
        vehicleNumber: formData.vehicleNumber.trim(),
        password: formData.password,
        drivingLicense: formData.drivingLicense,
        aadharCard: formData.aadharCard,
      });
      toast.success(result.message || 'Registration submitted');
      navigate('/delivery/login', { replace: true });
    } catch (error) {
      toast.error(error.message || 'Registration failed');
    }
  };

  return (
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

        {/* Title for Mobile */}
        <div className="z-10 text-center lg:hidden">
          <h1 className="text-3xl font-bold text-white mb-2">Join as Delivery Partner</h1>
          <p className="text-gray-400 text-sm">Register your account</p>
        </div>
      </div>

      {/* Registration Card */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="w-full max-w-4xl bg-white -mt-16 lg:-mt-32 rounded-t-[40px] shadow-2xl z-20 px-6 lg:px-12 pt-10 lg:pt-12 pb-12 flex-1 mb-8"
      >
        <div className="hidden lg:block text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">Join as Delivery Partner</h1>
          <p className="text-gray-500 mt-2">Create your account and become a Tru Buy Partner</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          {/* Personal Information */}
          <section>
            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-2">
              <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm">01</span>
              <h3 className="text-xl font-bold text-gray-900">Personal Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600 block px-1">Full Name *</label>
                <div className="relative">
                  <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" required className="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 transition-all outline-none text-gray-900" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600 block px-1">Email Address *</label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="delivery@example.com" required className="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 transition-all outline-none text-gray-900" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600 block px-1">Phone Number *</label>
                <div className="relative">
                  <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+1234567890" required className="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 transition-all outline-none text-gray-900" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600 block px-1">Address</label>
                <div className="relative">
                  <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="City, State" className="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 transition-all outline-none text-gray-900" />
                </div>
              </div>
            </div>
          </section>

          {/* Vehicle Information */}
          <section>
            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-2">
              <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm">02</span>
              <h3 className="text-xl font-bold text-gray-900">Vehicle Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600 block px-1">Vehicle Type</label>
                <select name="vehicleType" value={formData.vehicleType} onChange={handleChange} className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 transition-all outline-none text-gray-900 appearance-none cursor-pointer">
                  <option value="Bike">Bike</option>
                  <option value="Scooter">Scooter</option>
                  <option value="Car">Car</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600 block px-1">Vehicle Number</label>
                <div className="relative">
                  <FiTruck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" name="vehicleNumber" value={formData.vehicleNumber} onChange={handleChange} placeholder="ABC-1234" className="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 transition-all outline-none text-gray-900" />
                </div>
              </div>
            </div>
          </section>

          {/* Document Upload */}
          <section>
            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-2">
              <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm">03</span>
              <h3 className="text-xl font-bold text-gray-900">Document Upload</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600 block px-1">Driving License *</label>
                <div className="relative group">
                  <FiFileText className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-black transition-colors" />
                  <input type="file" name="drivingLicense" onChange={handleChange} accept=".pdf,image/*" required className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 hover:border-black transition-all outline-none text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800 cursor-pointer" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600 block px-1">Aadhar Card *</label>
                <div className="relative group">
                  <FiFileText className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-black transition-colors" />
                  <input type="file" name="aadharCard" onChange={handleChange} accept=".pdf,image/*" required className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 hover:border-black transition-all outline-none text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800 cursor-pointer" />
                </div>
              </div>
            </div>
          </section>

          {/* Account Security */}
          <section>
            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-2">
              <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm">04</span>
              <h3 className="text-xl font-bold text-gray-900">Account Security</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600 block px-1">Password *</label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="Minimum 6 characters" required className="w-full pl-12 pr-12 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 transition-all outline-none text-gray-900" />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors">{showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}</button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-600 block px-1">Confirm Password *</label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Re-enter password" required className="w-full pl-12 pr-12 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 transition-all outline-none text-gray-900" />
                  <button type="button" onClick={() => setShowConfirmPassword((v) => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors">{showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}</button>
                </div>
              </div>
            </div>
          </section>

          {/* Note and Submit */}
          <div className="pt-8 space-y-8">
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex gap-3">
                <div className="mt-1 w-5 h-5 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold">!</div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  <strong>Note:</strong> Your registration will be sent to admin for approval. You will receive an email once your account has been reviewed.
                </p>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-[#111111] text-white py-4 rounded-2xl font-bold text-lg hover:bg-black transition-all shadow-lg active:scale-[0.98] disabled:opacity-50">
              {isLoading ? 'Registering...' : 'Register as Tru Buy Partner'}
            </button>

            <div className="text-center">
              <p className="text-gray-500 text-sm">
                Already have an account?{' '}
                <Link to="/delivery/login" className="text-black font-bold hover:underline">
                  Login here
                </Link>
              </p>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default DeliveryRegister;
