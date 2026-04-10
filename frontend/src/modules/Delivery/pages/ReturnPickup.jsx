import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCamera, FiCheckCircle, FiShield, FiUploadCloud, FiTrash2, FiMapPin, FiPhone, FiShoppingBag, FiImage, FiArrowRight } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '../../../shared/components/PageTransition';
import { formatPrice } from '../../../shared/utils/helpers';
import toast from 'react-hot-toast';
import { useReturnStore } from '../../../shared/store/returnStore';

const ReturnPickup = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchReturnRequestById, markAsPickedUp, updateReturnStatus } = useReturnStore();
  const [returnReq, setReturnReq] = useState(null);
  const [step, setStep] = useState(1);
  const [images, setImages] = useState([]);
  const [sellerOtp, setSellerOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checklist, setChecklist] = useState({
    correctProduct: false,
    nameMatch: false,
    conditionMatch: false,
    noMissingParts: false
  });

  React.useEffect(() => {
    const loadRequest = async () => {
      const data = await fetchReturnRequestById(id);
      if (data) {
        setReturnReq(data);
      } else {
        toast.error("Pickup task not found");
        navigate('/delivery/dashboard');
      }
    };
    loadRequest();
  }, [id, fetchReturnRequestById, navigate]);


  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 3) {
      toast.error('Maximum 3 images allowed for proof');
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

  const handleStep1Complete = async () => {
    if (Object.values(checklist).some(val => !val)) {
      toast.error('Please verify all checklist items before pickup');
      return;
    }
    if (images.length === 0) {
      toast.error('Please upload at least one image of the item');
      return;
    }
    setIsSubmitting(true);
    const success = await markAsPickedUp(id, images.map(img => img.preview));
    setIsSubmitting(false);
    
    if (success) {
      setStep(2);
      toast.success('Pickup proof recorded. Head to the seller.');
    }
  };

  const handleRejectPickup = async () => {
    const reason = window.prompt("Reason for Rejecting Pickup:");
    if (!reason) return;
    
    setIsSubmitting(true);
    // - [x] **Logistics & Delivery**
    // - [x] Update `ReturnPickup.jsx` with a "Condition Verification" checklist
    // - [x] Implement "Pickup Failed" handling
    // - [/] **Verification & Mock Data**
    // - [ ] Seed `returnStore.js` with an active exchange example
    // - [ ] End-to-end verification of the full lifecycle
    const success = await updateReturnStatus(id, { 
      status: 'pickup_failed',
      rejectionReason: reason,
      updatedAt: new Date().toISOString()
    });
    setIsSubmitting(false);
    
    if (success) {
      toast.error('Pickup data updated as REJECTED');
      navigate('/delivery/dashboard');
    }
  };

  const handleFinalSubmit = async () => {
    if (sellerOtp.length !== 4) {
      toast.error('Please enter valid 4-digit Seller OTP');
      return;
    }
    setIsSubmitting(true);
    // Mark as delivered to seller
    const success = await updateReturnStatus(id, { 
      status: 'shipped', // or 'delivered_to_seller'
      deliveredToSellerAt: new Date().toISOString()
    });
    
    if (success) {
      setIsSubmitting(false);
      toast.success('Return Pickup Completed Successfully!');
      navigate('/delivery/dashboard');
    } else {
      setIsSubmitting(false);
    }
  };

  if (!returnReq) {
    return (
      <PageTransition>
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 font-medium">Loading pickup details...</p>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="bg-gray-50 min-h-screen pb-12">
        {/* Header */}
        <div className="bg-white px-4 py-4 flex items-center gap-4 sticky top-0 z-30 shadow-sm">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
            <FiArrowLeft className="text-xl text-gray-700" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Return Pickup</h1>
            <p className="text-xs text-primary-600 font-bold tracking-tighter">TASK #{id}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between relative">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold z-10 transition-colors ${step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
            <div className={`flex-1 h-1 mx-2 rounded-full transition-colors ${step >= 2 ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold z-10 transition-colors ${step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
          </div>
          <div className="flex justify-between mt-2 px-1">
            <span className={`text-[10px] font-bold uppercase ${step >= 1 ? 'text-primary-600' : 'text-gray-400'}`}>Item Pickup</span>
            <span className={`text-[10px] font-bold uppercase ${step >= 2 ? 'text-primary-600' : 'text-gray-400'}`}>Seller Verification</span>
          </div>
        </div>

        <div className="px-4 space-y-4">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div 
                key="step1" 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                {/* Pickup & Delivery Overview */}
                <div className="grid grid-cols-1 gap-3">
                  {/* Pickup From */}
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <h2 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <FiMapPin className="text-primary-600" />
                      Pickup From
                    </h2>
                    <p className="font-bold text-gray-800">{returnReq.customer?.name || returnReq.customerName}</p>
                    <p className="text-xs text-gray-600 mt-1">{returnReq.pickupAddress?.address || returnReq.customerAddress}</p>
                    <button onClick={() => window.open(`tel:${returnReq.customer?.phone || returnReq.customerPhone}`)} className="mt-3 flex items-center gap-2 text-primary-600 text-xs font-bold bg-primary-50 px-3 py-2 rounded-lg">
                      <FiPhone /> Call Customer
                    </button>
                  </div>

                  {/* Return To (Destination Summary) */}
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 border-l-4 border-l-amber-400">
                    <h2 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                      <FiArrowRight className="text-amber-500" />
                      Deliver To (Seller)
                    </h2>
                    <div className="space-y-2">
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{returnReq.vendor?.storeName || returnReq.sellerName}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">{returnReq.vendor?.address || returnReq.sellerAddress}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => window.open(`tel:${returnReq.vendor?.phone || returnReq.sellerPhone}`)} 
                          className="flex items-center gap-2 text-amber-600 text-[10px] font-bold bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100 transition-colors hover:bg-amber-100"
                        >
                          <FiPhone size={10} /> Call Seller
                        </button>
                        <span className="text-[10px] font-bold text-gray-400">{returnReq.vendor?.phone || returnReq.sellerPhone}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product Detail & Customer Images */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <div className="flex gap-4 mb-4">
                    <img src={returnReq.product?.image || returnReq.items?.[0]?.image} className="w-16 h-16 object-cover rounded-xl border border-gray-100" />
                    <div>
                      <h3 className="font-bold text-gray-800 text-sm line-clamp-2">{returnReq.product?.name || returnReq.items?.[0]?.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">Value: {formatPrice(returnReq.refundAmount)}</p>
                    </div>
                  </div>

                  {/* Customer Evidence */}
                  {returnReq.images && returnReq.images.length > 0 && (
                    <div className="pt-4 border-t border-gray-50">
                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <FiImage size={12} /> Images from Customer
                      </h4>
                      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {returnReq.images.map((img, idx) => (
                          <div 
                            key={idx} 
                            className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100"
                            onClick={() => window.open(img, '_blank')}
                          >
                            <img src={img} alt="customer proof" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                      <p className="text-[9px] text-amber-600 font-bold mt-1 italic leading-tight">Match the physical item condition with these photos before picking up.</p>
                    </div>
                  )}
                </div>

                {/* Proof Upload */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <h2 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2 uppercase tracking-wider">
                    <FiCamera className="text-primary-600" />
                    Capture Item Proof
                  </h2>
                  <div className="grid grid-cols-4 gap-3">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative w-full aspect-square rounded-xl overflow-hidden border border-gray-200">
                        <img src={img.preview} className="w-full h-full object-cover" />
                        <button onClick={() => removeImage(idx)} className="absolute top-1 right-1 p-1 bg-white/80 rounded-full text-red-600 opacity-80 shadow-sm"><FiTrash2 size={12} /></button>
                      </div>
                    ))}
                    {images.length < 3 && (
                      <label className="w-full aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-gray-50 bg-gray-50/50">
                        <FiUploadCloud className="text-gray-400 text-xl" />
                        <span className="text-[9px] text-gray-400 font-bold uppercase">Add</span>
                        <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-400 mt-3 font-medium italic">Upload clear photos showing the item condition and serial number if applicable.</p>
                </div>

                {/* On-Site Verification Checklist */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <h2 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2 uppercase tracking-wider">
                    <FiCheckCircle className="text-primary-600" />
                    Verification Checklist
                  </h2>
                  <div className="space-y-3">
                    {Object.entries({
                      correctProduct: 'Item matches customer images',
                      nameMatch: 'Product name & model match',
                      conditionMatch: 'No extra physical damage',
                      noMissingParts: 'All box contents present'
                    }).map(([key, label]) => (
                      <label key={key} className="flex items-center gap-3 p-3 rounded-xl border border-gray-50 bg-gray-50/30 cursor-pointer hover:bg-gray-50 transition-colors">
                        <input 
                          type="checkbox"
                          checked={checklist[key]}
                          onChange={(e) => setChecklist({...checklist, [key]: e.target.checked})}
                          className="w-5 h-5 rounded text-primary-600 focus:ring-primary-500 border-gray-300"
                        />
                        <span className="text-xs text-gray-700 font-semibold">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button 
                    onClick={handleStep1Complete}
                    disabled={Object.values(checklist).some(v => !v) || images.length === 0 || isSubmitting}
                    className="w-full py-4 gradient-green text-white rounded-2xl font-bold shadow-glow-success active:scale-[0.98] transition-all disabled:opacity-50 disabled:shadow-none"
                  >
                    Confirm Pickup
                  </button>
                  <button 
                    onClick={handleRejectPickup}
                    className="w-full py-4 bg-red-50 text-red-600 border border-red-100 rounded-2xl font-bold active:scale-[0.98] transition-all"
                  >
                    Reject Pickup
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="step2" 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {/* Seller Details */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <h2 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2 uppercase tracking-wider">
                    <FiShoppingBag className="text-primary-600" />
                    Deliver to Seller
                  </h2>
                  <p className="font-bold text-gray-800">{returnReq.vendor?.storeName || returnReq.sellerName}</p>
                  <p className="text-xs text-gray-600 mt-1">{returnReq.vendor?.address || returnReq.sellerAddress}</p>
                  <button onClick={() => window.open(`tel:${returnReq.vendor?.phone || returnReq.sellerPhone}`)} className="mt-3 flex items-center gap-2 text-primary-600 text-xs font-bold bg-primary-50 px-3 py-2 rounded-lg">
                    <FiPhone /> Call Seller
                  </button>
                </div>

                {/* Seller OTP Verification */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
                  <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-600">
                    <FiShield size={32} />
                  </div>
                  <h2 className="text-lg font-bold text-gray-800 mb-1">Seller OTP</h2>
                  <p className="text-xs text-gray-500 mb-6">Enter the 4-digit OTP provided by the seller to complete the return handover.</p>
                  
                  <div className="flex justify-center gap-3">
                    <input 
                      type="text" 
                      maxLength={4}
                      value={sellerOtp}
                      onChange={(e) => setSellerOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="0000"
                      className="w-32 text-center text-3xl font-bold tracking-[10px] py-3 bg-gray-50 border-2 border-primary-100 rounded-2xl focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10 placeholder-gray-200"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3">
                   <FiCheckCircle className="text-blue-600 mt-0.5 flex-shrink-0" />
                   <p className="text-[11px] text-blue-800 font-medium">Verify that the seller has inspected the item before entering the OTP. Once submitted, the return is marked as successful.</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setStep(1)}
                    className="py-4 bg-gray-200 text-gray-700 rounded-2xl font-bold active:scale-[0.98] transition-all"
                  >
                    Back
                  </button>
                  <button 
                    onClick={handleFinalSubmit}
                    disabled={isSubmitting || sellerOtp.length < 4}
                    className="py-4 gradient-green text-white rounded-2xl font-bold shadow-glow-success disabled:opacity-50 active:scale-[0.98] transition-all"
                  >
                    {isSubmitting ? 'Verifying...' : 'Complete Return'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
};

export default ReturnPickup;
