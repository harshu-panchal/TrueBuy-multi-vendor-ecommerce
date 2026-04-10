import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FiArrowLeft, FiCamera, FiMapPin, FiCheck, FiInfo, FiTrash2, FiAlertCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import MobileLayout from "../components/Layout/MobileLayout";
import PageTransition from '../../../shared/components/PageTransition';
import { formatPrice } from '../../../shared/utils/helpers';
import { useAddressStore } from '../../../shared/store/addressStore';
import toast from 'react-hot-toast';
import { useReturnStore } from '../../../shared/store/returnStore';

const ReturnRequest = () => {
  const { orderId, productId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addresses, fetchAddresses } = useAddressStore();
  
  // States
  const [item, setItem] = useState(location.state?.item || null);
  const [orderDate, setOrderDate] = useState(location.state?.orderDate || null);
  const [returnReason, setReturnReason] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [images, setImages] = useState([]);
  const [pickupAddress, setPickupAddress] = useState(null);
  const [refundMethod, setRefundMethod] = useState('original');
  const [bankDetails, setBankDetails] = useState({
    accountName: '',
    accountNumber: '',
    ifscCode: '',
    bankName: ''
  });
  const { submitReturnRequest } = useReturnStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isReRequest = location.state?.isReRequest || false;
  const [isReturnWindowValid, setIsReturnWindowValid] = useState(true);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  useEffect(() => {
    if (addresses.length > 0 && !pickupAddress) {
      setPickupAddress(addresses.find(a => a.isDefault) || addresses[0]);
    }
  }, [addresses, pickupAddress]);

  // Mock return window validation (e.g., 7 days)
  useEffect(() => {
    if (orderDate) {
      const deliveredDate = new Date(orderDate);
      const today = new Date();
      const diffTime = Math.abs(today - deliveredDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 7) {
        setIsReturnWindowValid(false);
      }
    }
  }, [orderDate]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }
    
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setImages([...images, ...newImages]);
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleSubmit = async () => {
    if (!returnReason) {
      toast.error('Please select a return reason');
      return;
    }
    
    setIsSubmitting(true);
    const success = await submitReturnRequest({
      orderId,
      productIds: [productId],
      vendorId: item.vendorId || item.vendor?._id || 'VEND-DEFAULT', // Ensure vendor ID is captured
      reason: returnReason,
      description: additionalDetails,
      images: images.map(img => img.preview), // In real app, upload first
      pickupAddress,
      refundMethod,
      bankDetails: refundMethod === 'bank' ? bankDetails : null,
      customer: {
        name: 'John Doe', // Replace with auth user name
        email: 'john@example.com'
      },
      items: [item],
      refundAmount: item.price
    });

    setIsSubmitting(false);
    if (success) {
      navigate(`/orders/${orderId}`);
    }
  };

  const reasons = [
    "Damaged product",
    "Wrong item received",
    "Size/fit issue",
    "Quality not as expected",
    "Other"
  ];

  if (!item) return <div className="p-8 text-center text-gray-500">Product not found</div>;

  return (
    <PageTransition>
      <MobileLayout showBottomNav={false} showCartBar={false}>
        <div className="w-full pb-24 bg-gray-50 min-h-screen">
          {/* Header */}
          <div className="px-4 py-4 bg-white border-b border-gray-200 sticky top-1 z-30 flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
              <FiArrowLeft className="text-xl text-gray-700" />
            </button>
            <h1 className="text-lg font-bold text-gray-800">Return Item</h1>
          </div>

          <div className="p-4 space-y-4">
            {isReRequest && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
                <FiInfo className="text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-blue-800 font-bold text-sm">Re-requesting Return</p>
                  <p className="text-blue-700 text-xs">Your previous request was rejected. Please address the feedback or provide clearer information/photos for this attempt.</p>
                </div>
              </div>
            )}
            
            {/* 1. Product Summary Card */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 text-sm line-clamp-2">{item.name}</h3>
                  <p className="text-primary-600 font-bold mt-1 text-base">{formatPrice(item.price)}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-gray-500">Order ID: {orderId}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      isReturnWindowValid ? 'bg-success-50 text-success-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {isReturnWindowValid ? 'Return available' : 'Return window closed'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Return Reason Section */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <h2 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider">Why are you returning this item?</h2>
              <div className="space-y-3">
                {reasons.map((reason) => (
                  <label key={reason} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                    <input 
                      type="radio" 
                      name="reason" 
                      value={reason} 
                      checked={returnReason === reason}
                      onChange={(e) => setReturnReason(e.target.value)}
                      className="w-5 h-5 text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                    <span className="text-sm text-gray-700 font-medium">{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 3. Additional Details */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <h2 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider">Additional Details</h2>
              <textarea 
                placeholder="Describe the issue in a few words"
                value={additionalDetails}
                onChange={(e) => setAdditionalDetails(e.target.value)}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[100px]"
              />
              
              <div className="mt-4">
                <label className="text-xs font-bold text-gray-500 block mb-3 uppercase tracking-wider">Upload Product Images (Max 5)</label>
                <div className="flex flex-wrap gap-3">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 group">
                      <img src={img.preview} alt="preview" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-white/80 rounded-full text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  ))}
                  {images.length < 5 && (
                    <label className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-gray-50 transition-colors">
                      <FiCamera className="text-gray-400 text-xl" />
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Add</span>
                      <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* 4. Pickup Address */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Pickup Address</h2>
                <button onClick={() => navigate('/addresses')} className="text-primary-600 text-xs font-bold hover:underline">Edit</button>
              </div>
              {pickupAddress ? (
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex gap-3">
                  <FiMapPin className="text-primary-600 mt-1 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-800">{pickupAddress.name}</p>
                    <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">{pickupAddress.address}, {pickupAddress.city}, {pickupAddress.state} - {pickupAddress.zipCode}</p>
                    <p className="text-[10px] text-gray-500 mt-1 font-bold">CONTACT: {pickupAddress.phone}</p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic">No address found. Please add one.</p>
              )}
            </div>

            {/* 5. Refund Method */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <h2 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider">Refund Method</h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                  <input 
                    type="radio" 
                    name="refund" 
                    value="original" 
                    checked={refundMethod === 'original'}
                    onChange={(e) => setRefundMethod(e.target.value)}
                    className="w-5 h-5 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <div className="flex-1">
                    <span className="text-sm text-gray-700 font-bold block">Original Payment Method</span>
                    <span className="text-[10px] text-gray-500">Refund will be sent to your original card/account</span>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors">
                  <input 
                    type="radio" 
                    name="refund" 
                    value="bank" 
                    checked={refundMethod === 'bank'}
                    onChange={(e) => setRefundMethod(e.target.value)}
                    className="w-5 h-5 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <div className="flex-1">
                    <span className="text-sm text-gray-700 font-bold block">UPI / Bank Transfer</span>
                    <span className="text-[10px] text-gray-500">Enter details below for direct transfer</span>
                  </div>
                </label>
              </div>

              <AnimatePresence>
                {refundMethod === 'bank' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mt-4 pt-4 border-t border-gray-100 space-y-3"
                  >
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Account Holder Name</label>
                        <input 
                          type="text"
                          value={bankDetails.accountName}
                          onChange={(e) => setBankDetails({...bankDetails, accountName: e.target.value})}
                          placeholder="Full name on passbook"
                          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none mt-1"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                         <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">IFSC Code</label>
                            <input 
                              type="text"
                              value={bankDetails.ifscCode}
                              onChange={(e) => setBankDetails({...bankDetails, ifscCode: e.target.value.toUpperCase()})}
                              placeholder="SBIN00XXXX"
                              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none mt-1"
                            />
                         </div>
                         <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Bank Name</label>
                            <input 
                              type="text"
                              value={bankDetails.bankName}
                              onChange={(e) => setBankDetails({...bankDetails, bankName: e.target.value})}
                              placeholder="e.g. SBI, HDFC"
                              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none mt-1"
                            />
                         </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Account Number</label>
                        <input 
                          type="text"
                          value={bankDetails.accountNumber}
                          onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                          placeholder="Your account number"
                          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none mt-1"
                        />
                      </div>
                    </div>
                    <div className="flex items-start gap-2 p-2 bg-amber-50 rounded-lg">
                       <FiAlertCircle className="text-amber-600 mt-0.5" size={12} />
                       <p className="text-[10px] text-amber-800 font-medium italic">Please double check your bank details. Incorrect details may lead to refund failure.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 6. Important Notes */}
            <div className="bg-primary-50 rounded-2xl p-4 border border-primary-100 space-y-3">
              <div className="flex items-start gap-3">
                <FiInfo className="text-primary-600 mt-0.5 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-xs text-primary-900 font-medium">Return will be picked up within 2–3 days after approval</p>
                  <p className="text-xs text-primary-900 font-medium">Refund will be processed after successful pickup and verification</p>
                </div>
              </div>
            </div>

            {!isReturnWindowValid && (
              <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold animate-pulse">
                <FiAlertCircle />
                Return window expired for this item.
              </div>
            )}

            {/* 7. Submit Button */}
            <button 
              onClick={handleSubmit}
              disabled={!returnReason || isSubmitting || !isReturnWindowValid}
              className="w-full py-4 gradient-green text-white rounded-2xl font-bold shadow-glow-green disabled:opacity-50 disabled:shadow-none transition-all active:scale-[0.98]"
            >
              {isSubmitting ? 'Submitting Request...' : 'Submit Return Request'}
            </button>
          </div>
        </div>
      </MobileLayout>
    </PageTransition>
  );
};

export default ReturnRequest;
