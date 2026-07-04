import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiMapPin,
  FiCreditCard,
  FiTruck,
  FiCheck,
  FiX,
  FiPlus,
  FiArrowLeft,
  FiShoppingBag,
  FiTag,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { FiLock } from "react-icons/fi";
import { useCartStore } from "../../../shared/store/useStore";
import { useAuthStore } from "../../../shared/store/authStore";
import { useAddressStore } from "../../../shared/store/addressStore";
import { useOrderStore } from "../../../shared/store/orderStore";
import { formatPrice } from "../../../shared/utils/helpers";
import api from "../../../shared/utils/api";
import toast from "react-hot-toast";
import MobileLayout from "../components/Layout/MobileLayout";
import MobileCheckoutSteps from "../components/Mobile/MobileCheckoutSteps";
import PageTransition from "../../../shared/components/PageTransition";
import OrderSummary from "../components/Mobile/CheckoutOrderSummary";
import { useJsApiLoader, Autocomplete } from "@react-google-maps/api";
import { FiNavigation } from "react-icons/fi";

const updateFormDataFromPlace = (place, setFormData) => {
  if (!place || !place.address_components) return;
  
  let streetNumber = "";
  let route = "";
  let city = "";
  let state = "";
  let zipCode = "";
  let country = "";

  place.address_components.forEach((component) => {
    const types = component.types;
    if (types.includes("street_number")) streetNumber = component.long_name;
    if (types.includes("route")) route = component.long_name;
    if (types.includes("locality") || types.includes("postal_town")) city = component.long_name;
    if (types.includes("administrative_area_level_1")) state = component.long_name;
    if (types.includes("postal_code")) zipCode = component.long_name;
    if (types.includes("country")) country = component.long_name;
  });

  const address = `${streetNumber} ${route}`.trim() || place.formatted_address || place.name || "";

  const lat = place.geometry?.location?.lat() || null;
  const lng = place.geometry?.location?.lng() || null;

  setFormData((prev) => ({
    ...prev,
    address: address,
    city: city || prev.city,
    state: state || prev.state,
    zipCode: zipCode || prev.zipCode,
    country: country || prev.country,
    lat: lat || prev.lat,
    lng: lng || prev.lng,
  }));
};

const RAZORPAY_SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";
const CHECKOUT_AUTOFILL_STORAGE_PREFIX = "truebuy:checkout:shippingAutofill:v1:";

const getCheckoutAutofillKey = (user) => {
  const id = user?.id || user?._id || user?.email || "guest";
  return `${CHECKOUT_AUTOFILL_STORAGE_PREFIX}${String(id)}`;
};

const sanitizeAutofillFormData = (value) => {
  const source = value && typeof value === "object" ? value : {};
  const safeText = (v) => String(v ?? "");
  return {
    name: safeText(source.name),
    email: safeText(source.email),
    phone: safeText(source.phone),
    address: safeText(source.address),
    city: safeText(source.city),
    zipCode: safeText(source.zipCode),
    state: safeText(source.state),
    country: safeText(source.country),
    paymentMethod: safeText(source.paymentMethod || "online") || "online",
  };
};

const libraries = ["places"];

const MobileCheckout = () => {
  const navigate = useNavigate();
  const { items, getTotal, clearCart, getItemsByVendor } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const { addresses, getDefaultAddress, addAddress, fetchAddresses } = useAddressStore();
  const { createOrder } = useOrderStore();

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const autocompleteRef = useRef(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const handlePlaceChanged = () => {
    if (autocompleteRef.current !== null) {
      const place = autocompleteRef.current.getPlace();
      updateFormDataFromPlace(place, setFormData);
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        if (!window.google) {
          setIsDetectingLocation(false);
          toast.error("Google Maps not loaded yet.");
          return;
        }
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
          if (status === "OK" && results[0]) {
            updateFormDataFromPlace(results[0], setFormData);
            toast.success("Location detected successfully!");
          } else {
            toast.error("Failed to detect address");
          }
          setIsDetectingLocation(false);
        });
      },
      (error) => {
        setIsDetectingLocation(false);
        toast.error("Failed to get location. Please allow location access.");
      },
      { timeout: 10000 }
    );
  };

  // Group items by vendor
  const itemsByVendor = useMemo(
    () => getItemsByVendor(),
    [items, getItemsByVendor]
  );

  const [step, setStep] = useState(() => {
    if (typeof window !== "undefined") {
      const savedStep = sessionStorage.getItem("checkoutStep");
      return savedStep ? parseInt(savedStep, 10) : 1;
    }
    return 1;
  });

  useEffect(() => {
    sessionStorage.setItem("checkoutStep", step);
  }, [step]);

  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [shippingOption, setShippingOption] = useState("standard");
  const [estimatedShipping, setEstimatedShipping] = useState(null);
  const [isEstimatingShipping, setIsEstimatingShipping] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
    state: "",
    country: "",
    lat: null,
    lng: null,
    paymentMethod: "online",
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|in|org)$/;
    const phoneRegex = /^[0-9]{10}$/;
    const zipRegex = /^[0-9]{5,6}$/;
    const nameRegex = /^[a-zA-Z\s.]+$/;

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    } else if (!nameRegex.test(formData.name.trim())) {
      newErrors.name = "Name should only contain letters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    const cleanPhone = formData.phone.replace(/\D/g, "");
    if (!cleanPhone) {
      newErrors.phone = "Phone number is required";
    } else if (!phoneRegex.test(cleanPhone)) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    } else if (formData.address.trim().length < 10) {
      newErrors.address = "Please enter a complete address";
    }

    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    } else if (!nameRegex.test(formData.state.trim())) {
      newErrors.state = "State should only contain letters";
    }

    if (!formData.zipCode.trim()) {
      newErrors.zipCode = "ZIP code is required";
    } else if (!zipRegex.test(formData.zipCode.trim())) {
      newErrors.zipCode = "Enter a valid 5 or 6 digit ZIP code";
    }

    if (!formData.country.trim()) {
      newErrors.country = "Country is required";
    } else if (!nameRegex.test(formData.country.trim())) {
      newErrors.country = "Country should only contain letters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkoutAutofillKey = useMemo(() => getCheckoutAutofillKey(user), [user]);
  const autofillLoadedKeyRef = useRef(null);

  useEffect(() => {
    autofillLoadedKeyRef.current = null;

    if (typeof window === "undefined") {
      return;
    }

    try {
      const raw = localStorage.getItem(checkoutAutofillKey);
      if (!raw) {
        autofillLoadedKeyRef.current = checkoutAutofillKey;
        return;
      }

      const payload = JSON.parse(raw);
      const nextFormData = sanitizeAutofillFormData(payload?.formData);
      setFormData((prev) => ({ ...prev, ...nextFormData }));

      const nextShippingOption = payload?.shippingOption;
      if (typeof nextShippingOption === "string" && nextShippingOption.trim()) {
        setShippingOption(nextShippingOption);
      }
    } catch {
      // Ignore storage issues and keep default behavior.
    } finally {
      autofillLoadedKeyRef.current = checkoutAutofillKey;
    }
  }, [checkoutAutofillKey]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (autofillLoadedKeyRef.current !== checkoutAutofillKey) {
      return;
    }

    try {
      const payload = {
        v: 1,
        updatedAt: new Date().toISOString(),
        formData: sanitizeAutofillFormData(formData),
        shippingOption,
      };
      localStorage.setItem(checkoutAutofillKey, JSON.stringify(payload));
    } catch {
      // Ignore quota/private mode errors.
    }
  }, [checkoutAutofillKey, formData, shippingOption]);

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const existing = document.querySelector(`script[src="${RAZORPAY_SCRIPT_URL}"]`);
      if (existing) {
        existing.addEventListener("load", () => resolve(true), { once: true });
        existing.addEventListener("error", () => resolve(false), { once: true });
        return;
      }
      const script = document.createElement("script");
      script.src = RAZORPAY_SCRIPT_URL;
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  useEffect(() => {
    if (isAuthenticated) {
      fetchAddresses().catch(() => null);
    }
  }, [isAuthenticated, fetchAddresses]);

  useEffect(() => {
    let cancelled = false;
    const fetchCoupons = async () => {
      try {
        const response = await api.get("/coupons/available");
        const payload = response?.data ?? response;
        if (!cancelled) {
          setAvailableCoupons(Array.isArray(payload) ? payload : []);
        }
      } catch {
        if (!cancelled) {
          setAvailableCoupons([]);
        }
      }
    };

    fetchCoupons();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      }));

      const defaultAddress = getDefaultAddress();
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
        setFormData((prev) => ({
          ...prev,
          name: defaultAddress.fullName || user.name || "",
          email: user.email || "",
          phone: defaultAddress.phone || user.phone || "",
          address: defaultAddress.address || "",
          city: defaultAddress.city || "",
          zipCode: defaultAddress.zipCode || "",
          state: defaultAddress.state || "",
          country: defaultAddress.country || "",
        }));
      }
    }
  }, [isAuthenticated, user, getDefaultAddress, addresses]);

  const calculateShippingFallback = () => {
    const total = getTotal();
    if (appliedCoupon?.type === "freeship") {
      return 0;
    }
    if (total >= 100) {
      return 0;
    }
    if (shippingOption === "express") {
      return 100;
    }
    return 50;
  };

  const total = getTotal();
  const shipping =
    typeof estimatedShipping === "number"
      ? estimatedShipping
      : calculateShippingFallback();
  const discount = appliedCoupon ? appliedDiscount : 0;
  const taxableAmount = Math.max(0, total - discount);
  const tax = taxableAmount * 0.18;
  const finalTotal = Math.max(0, total + shipping + tax - discount);

  useEffect(() => {
    if (appliedCoupon) {
      setAppliedCoupon(null);
      setAppliedDiscount(0);
      toast.error("Cart total changed, please re-apply your coupon.");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total]);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      const validItems = items
        .map((item) => ({
          productId: item?.id,
          quantity: Number(item?.quantity || 1),
          variant: item?.variant || undefined,
        }))
        .filter((item) => item.productId);

      if (!validItems.length) {
        if (active) setEstimatedShipping(0);
        return;
      }

      setIsEstimatingShipping(true);
      try {
        const response = await api.post("/shipping/estimate", {
          items: validItems,
          shippingAddress: {
            country: String(formData.country || "").trim(),
          },
          shippingOption,
          couponType: appliedCoupon?.type || null,
        });

        const payload = response?.data ?? response;
        const nextShipping = Number(payload?.shipping);
        if (active) {
          setEstimatedShipping(Number.isFinite(nextShipping) ? nextShipping : null);
        }
      } catch {
        if (active) {
          setEstimatedShipping(null);
        }
      } finally {
        if (active) {
          setIsEstimatingShipping(false);
        }
      }
    }, 250);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [items, formData.country, shippingOption, appliedCoupon?.type]);

  const handleApplyCoupon = async (codeOverride = "") => {
    const normalizedCode = String(codeOverride || couponCode).trim().toUpperCase();
    if (!normalizedCode) {
      toast.error("Please enter a coupon code");
      return;
    }

    setIsApplyingCoupon(true);
    try {
      const response = await api.post("/coupons/validate", {
        code: normalizedCode,
        cartTotal: total,
      });
      const payload = response?.data ?? response;
      const coupon = payload?.coupon;
      const discountAmount = Number(payload?.discount || 0);

      if (!coupon) {
        throw new Error("Invalid coupon response");
      }

      setCouponCode(coupon.code || normalizedCode);
      setAppliedCoupon(coupon);
      setAppliedDiscount(discountAmount);
      toast.success(`Coupon "${coupon.code}" applied!`);
    } catch {
      setAppliedCoupon(null);
      setAppliedDiscount(0);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleSelectAddress = (address) => {
    setSelectedAddressId(address.id);
    setFormData((prev) => ({
      ...prev,
      name: address.fullName,
      phone: address.phone,
      address: address.address,
      city: address.city,
      zipCode: address.zipCode,
      state: address.state,
      country: address.country,
    }));
  };

  const handleNewAddress = async (addressData) => {
    try {
      const newAddress = await addAddress(addressData);
      handleSelectAddress(newAddress);
      setShowAddressForm(false);
      toast.success("Address added and selected!");
    } catch (error) {
      toast.error(error?.message || "Failed to add address");
    }
  };

  if (items.length === 0) {
    return (
      <PageTransition>
        <MobileLayout showBottomNav={false} showCartBar={false}>
          <div className="flex items-center justify-center min-h-[60vh] px-4">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Your cart is empty
              </h2>
              <button
                onClick={() => navigate("/home")}
                className="gradient-green text-white px-6 py-3 rounded-xl font-semibold">
                Continue Shopping
              </button>
            </div>
          </div>
        </MobileLayout>
      </PageTransition>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (step === 1) {
      if (!validateForm()) {
        toast.error("Please fix the errors in the form.");
        return;
      }
    }

    const normalizedShipping = {
      name: String(formData.name || "").trim(),
      email: String(formData.email || "").trim().toLowerCase(),
      phone: String(formData.phone || "").replace(/\D/g, "").slice(-10),
      address: String(formData.address || "").trim(),
      city: String(formData.city || "").trim(),
      zipCode: String(formData.zipCode || "").trim(),
      state: String(formData.state || "").trim(),
      country: String(formData.country || "").trim(),
    };

    if (step === 2 && isApplyingCoupon) {
      toast.error("Please wait for coupon validation to complete.");
      return;
    }
    if (step === 2 && isPlacingOrder) {
      return;
    }

    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setIsPlacingOrder(true);
      try {
        const isOnlinePayment = formData.paymentMethod === "online";
        const order = await createOrder({
          userId: isAuthenticated ? user?.id : null,
          items: items,
          shippingAddress: normalizedShipping,
          paymentMethod: isOnlinePayment ? "card" : "cod",
          subtotal: total,
          shipping: shipping,
          tax: tax,
          discount: discount,
          total: finalTotal,
          couponCode: appliedCoupon ? (appliedCoupon.code || couponCode.trim().toUpperCase()) : null,
          shippingOption,
        });

        if (isOnlinePayment) {
          const loaded = await loadRazorpayScript();
          if (!loaded || !window.Razorpay) {
            throw new Error("Unable to load Razorpay checkout.");
          }

          const [keyResponse, razorpayOrderResponse] = await Promise.all([
            api.get("/user/payments/razorpay/key"),
            api.post(`/user/orders/${order.id}/payments/razorpay/order`),
          ]);

          const keyPayload = keyResponse?.data ?? keyResponse;
          const rzpPayload = razorpayOrderResponse?.data ?? razorpayOrderResponse;
          const key = keyPayload?.key;
          const razorpayOrderId = rzpPayload?.razorpayOrderId;
          const amount = Number(rzpPayload?.amount || 0);
          const currency = rzpPayload?.currency || "INR";

          if (!key || !razorpayOrderId || amount <= 0) {
            throw new Error("Unable to initialize Razorpay payment.");
          }

          await new Promise((resolve, reject) => {
            const razorpay = new window.Razorpay({
              key,
              amount,
              currency,
              name: "Tru Buy",
              description: `Order #${order.id}`,
              order_id: razorpayOrderId,
              prefill: {
                name: normalizedShipping.name,
                email: normalizedShipping.email,
                contact: normalizedShipping.phone,
              },
              notes: {
                appOrderId: String(order.id),
              },
              theme: {
                color: "#10B981",
              },
              handler: async (response) => {
                try {
                  await api.post(`/user/orders/${order.id}/payments/razorpay/verify`, response);
                  resolve(true);
                } catch (verifyError) {
                  reject(verifyError);
                }
              },
              modal: {
                ondismiss: () => {
                  reject(new Error("Payment was cancelled."));
                },
              },
            });
            razorpay.open();
          });
        }

        clearCart();
        toast.success("Order placed successfully!");
        navigate(`/order-confirmation/${order.id}`);
      } catch (error) {
        toast.error(error?.message || "Failed to place order");
      } finally {
        setIsPlacingOrder(false);
      }
    }
  };

  return (
    <PageTransition>
      <MobileLayout showBottomNav={false} showCartBar={false}>
        <div className="w-full min-h-screen bg-gray-50">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
            {/* Title Bar */}
            <div className="px-4 py-3 flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <FiArrowLeft className="text-xl text-gray-700" />
              </button>
              <h1 className="text-xl font-bold text-gray-800">Checkout</h1>
            </div>
            {/* Steps Bar */}
            <div className="px-4 pb-3">
              <MobileCheckoutSteps currentStep={step} totalSteps={2} />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="lg:px-4 lg:py-6 pb-32 lg:pb-6">
            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
              {/* Left Column - Steps */}
              <div className="lg:col-span-8 space-y-6">
                {/* Step 1: Shipping Information */}
                {step === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="px-4 py-4 lg:p-0">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <FiTruck className="text-primary-600" />
                      Shipping Information
                    </h2>

                    {/* Saved Addresses */}
                    {isAuthenticated && addresses.length > 0 && (
                      <div className="mb-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">
                          Saved Addresses
                        </h3>
                        <div className="space-y-2 mb-3">
                          {addresses.map((address) => (
                            <div
                              key={address.id}
                              onClick={() => handleSelectAddress(address)}
                              className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedAddressId === address.id
                                ? "border-primary-500 bg-primary-50"
                                : "border-gray-200"
                                }`}>
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-2 flex-1">
                                  <FiMapPin className="text-primary-600 mt-0.5 flex-shrink-0" />
                                  <div className="flex-1">
                                    <h4 className="font-bold text-gray-800 text-sm">
                                      {address.name}
                                    </h4>
                                    <p className="text-xs text-gray-600">
                                      {address.fullName}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                      {address.address}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                      {address.city}, {address.state}{" "}
                                      {address.zipCode}
                                    </p>
                                  </div>
                                </div>
                                {selectedAddressId === address.id && (
                                  <FiCheck className="text-primary-600 text-xl flex-shrink-0" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowAddressForm(true)}
                          className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold text-sm">
                          <FiPlus />
                          Add New Address
                        </button>
                      </div>
                    )}

                    {/* Address Form */}
                    <div className="space-y-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm lg:p-6">
                      <div className="flex justify-end mb-2">
                        <button
                          type="button"
                          onClick={handleDetectLocation}
                          disabled={!isLoaded || isDetectingLocation}
                          className="flex items-center gap-2 text-sm font-semibold text-primary-600 bg-primary-50 px-4 py-2 rounded-lg hover:bg-primary-100 transition-colors disabled:opacity-50"
                        >
                          <FiNavigation className={isDetectingLocation ? "animate-pulse" : ""} />
                          {isDetectingLocation ? "Detecting..." : "Detect Current Location"}
                        </button>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 text-base ${errors.name
                            ? "border-red-500 focus:ring-red-200"
                            : "border-gray-200 focus:ring-primary-500"
                            }`}
                        />
                        {errors.name && (
                          <p className="text-red-500 text-xs mt-1 ml-1">{errors.name}</p>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Email
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 text-base ${errors.email
                              ? "border-red-500 focus:ring-red-200"
                              : "border-gray-200 focus:ring-primary-500"
                              }`}
                          />
                          {errors.email && (
                            <p className="text-red-500 text-xs mt-1 ml-1">{errors.email}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                            className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 text-base ${errors.phone
                              ? "border-red-500 focus:ring-red-200"
                              : "border-gray-200 focus:ring-primary-500"
                              }`}
                          />
                          {errors.phone && (
                            <p className="text-red-500 text-xs mt-1 ml-1">{errors.phone}</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Address
                        </label>
                        {isLoaded ? (
                          <Autocomplete
                            onLoad={(autocomplete) => { autocompleteRef.current = autocomplete; }}
                            onPlaceChanged={handlePlaceChanged}
                          >
                            <input
                              type="text"
                              name="address"
                              value={formData.address}
                              onChange={handleInputChange}
                              required
                              className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 text-base ${errors.address
                                ? "border-red-500 focus:ring-red-200"
                                : "border-gray-200 focus:ring-primary-500"
                                }`}
                            />
                          </Autocomplete>
                        ) : (
                          <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            required
                            className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 text-base ${errors.address
                              ? "border-red-500 focus:ring-red-200"
                              : "border-gray-200 focus:ring-primary-500"
                              }`}
                          />
                        )}
                        {errors.address && (
                          <p className="text-red-500 text-xs mt-1 ml-1">{errors.address}</p>
                        )}
                        {formData.lat && formData.lng && (
                          <p className="text-green-600 text-xs mt-1 ml-1 font-medium">
                            ✓ Coordinates matched: {Number(formData.lat).toFixed(5)}, {Number(formData.lng).toFixed(5)}
                          </p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            City
                          </label>
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            required
                            className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 text-base ${errors.city
                              ? "border-red-500 focus:ring-red-200"
                              : "border-gray-200 focus:ring-primary-500"
                              }`}
                          />
                          {errors.city && (
                            <p className="text-red-500 text-xs mt-1 ml-1">{errors.city}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            State
                          </label>
                          <input
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            required
                            className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 text-base ${errors.state
                              ? "border-red-500 focus:ring-red-200"
                              : "border-gray-200 focus:ring-primary-500"
                              }`}
                          />
                          {errors.state && (
                            <p className="text-red-500 text-xs mt-1 ml-1">{errors.state}</p>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            ZIP Code
                          </label>
                          <input
                            type="text"
                            name="zipCode"
                            value={formData.zipCode}
                            onChange={handleInputChange}
                            required
                            className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 text-base ${errors.zipCode
                              ? "border-red-500 focus:ring-red-200"
                              : "border-gray-200 focus:ring-primary-500"
                              }`}
                          />
                          {errors.zipCode && (
                            <p className="text-red-500 text-xs mt-1 ml-1">{errors.zipCode}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Country
                          </label>
                          <input
                            type="text"
                            name="country"
                            value={formData.country}
                            onChange={handleInputChange}
                            required
                            className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 text-base ${errors.country
                              ? "border-red-500 focus:ring-red-200"
                              : "border-gray-200 focus:ring-primary-500"
                              }`}
                          />
                          {errors.country && (
                            <p className="text-red-500 text-xs mt-1 ml-1">{errors.country}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Payment */}
                {step === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="px-4 py-4 lg:p-0">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <FiCreditCard className="text-primary-600" />
                      Payment Method
                    </h2>
                    <div className="space-y-3 mb-6">
                      {["online", "cod"].map((method) => (
                        <label
                          key={method}
                          className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.paymentMethod === method
                            ? "border-primary-500 bg-primary-50"
                            : "border-gray-200"
                            }`}>
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method}
                            checked={formData.paymentMethod === method}
                            onChange={handleInputChange}
                            className="w-5 h-5 text-primary-500"
                          />
                          <span className="font-semibold text-gray-800 capitalize text-base">
                            {method === "online" ? "Online Payment" : "Cash On Delivery"}
                          </span>
                        </label>
                      ))}
                    </div>

                    {/* Shipping Options */}
                    {total < 100 && (
                      <div className="mb-6">
                        <h3 className="text-base font-semibold text-gray-800 mb-3">
                          Shipping Options
                        </h3>
                        <div className="space-y-3">
                          <label
                            className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${shippingOption === "standard"
                              ? "border-primary-500 bg-primary-50"
                              : "border-gray-200"
                              }`}>
                            <div>
                              <input
                                type="radio"
                                name="shippingOption"
                                value="standard"
                                checked={shippingOption === "standard"}
                                onChange={(e) => setShippingOption(e.target.value)}
                                className="w-5 h-5 text-primary-500 mr-3"
                              />
                              <span className="font-semibold text-gray-800 text-base">
                                Standard Shipping
                              </span>
                              <p className="text-xs text-gray-600">
                                5-7 business days
                              </p>
                            </div>
                            <span className="font-bold text-gray-800">
                              {formatPrice(50)}
                            </span>
                          </label>
                          <label
                            className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${shippingOption === "express"
                              ? "border-primary-500 bg-primary-50"
                              : "border-gray-200"
                              }`}>
                            <div>
                              <input
                                type="radio"
                                name="shippingOption"
                                value="express"
                                checked={shippingOption === "express"}
                                onChange={(e) => setShippingOption(e.target.value)}
                                className="w-5 h-5 text-primary-500 mr-3"
                              />
                              <span className="font-semibold text-gray-800 text-base">
                                Express Shipping
                              </span>
                              <p className="text-xs text-gray-600">
                                2-3 business days
                              </p>
                            </div>
                            <span className="font-bold text-gray-800">
                              {formatPrice(100)}
                            </span>
                          </label>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          {isEstimatingShipping
                            ? "Updating shipping estimate..."
                            : `Estimated shipping: ${formatPrice(shipping)}`}
                        </p>
                      </div>
                    )}

                    {/* Coupon Code */}
                    <div className="mb-6">
                      <h3 className="text-base font-semibold text-gray-800 mb-3">
                        Coupon Code
                      </h3>
                      {!appliedCoupon ? (
                        <>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={couponCode}
                              onChange={(e) => setCouponCode(e.target.value)}
                              placeholder="Enter code"
                              className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-base"
                            />
                            <button
                              type="button"
                              onClick={() => handleApplyCoupon()}
                              disabled={isApplyingCoupon}
                              className="px-4 py-3 gradient-green text-white rounded-xl font-semibold hover:shadow-glow-green transition-all">
                              {isApplyingCoupon ? "Applying..." : "Apply"}
                            </button>
                          </div>
                          {availableCoupons.length > 0 && (
                            <div className="mt-3 bg-gray-50 rounded-xl p-3 border border-gray-200">
                              <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                <FiTag className="text-primary-600" />
                                Available coupons
                              </h4>
                              <div className="space-y-2 max-h-40 overflow-y-auto">
                                {availableCoupons.slice(0, 8).map((coupon) => (
                                  <button
                                    key={coupon._id || coupon.code}
                                    type="button"
                                    onClick={() => handleApplyCoupon(coupon.code)}
                                    disabled={isApplyingCoupon}
                                    className="w-full text-left p-2 bg-white rounded-lg border border-gray-200 hover:border-primary-300 transition-colors"
                                  >
                                    <div className="flex items-center justify-between">
                                      <p className="text-sm font-semibold text-gray-800">{coupon.code}</p>
                                      <p className="text-xs font-semibold text-primary-700">
                                        {coupon.type === "percentage"
                                          ? `${coupon.value}% OFF`
                                          : coupon.type === "fixed"
                                            ? `${formatPrice(coupon.value)} OFF`
                                            : "Free Shipping"}
                                      </p>
                                    </div>
                                    <p className="text-xs text-gray-600">
                                      Min order: {formatPrice(coupon.minOrderValue || 0)}
                                    </p>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                          <div>
                            <p className="text-sm font-semibold text-green-800">
                              {appliedCoupon.code || "Coupon"} Applied
                            </p>
                            <p className="text-xs text-green-600">
                              Code: {couponCode}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setAppliedCoupon(null);
                              setAppliedDiscount(0);
                              setCouponCode("");
                            }}
                            className="text-red-600 hover:text-red-700">
                            <FiX className="text-lg" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Order Summary (Mobile Only) */}
                    <div className="glass-card rounded-xl p-4 lg:hidden">
                      <OrderSummary
                        itemsByVendor={itemsByVendor}
                        total={total}
                        discount={discount}
                        shipping={shipping}
                        tax={tax}
                        finalTotal={finalTotal}
                        formatPrice={formatPrice}
                      />
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Right Column - Desktop Order Summary */}
              <div className="hidden lg:block lg:col-span-4">
                <div className="sticky top-24 space-y-4">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <OrderSummary
                      itemsByVendor={itemsByVendor}
                      total={total}
                      discount={discount}
                      shipping={shipping}
                      tax={tax}
                      finalTotal={finalTotal}
                      formatPrice={formatPrice}
                    />
                    <div className="p-4 border-t border-gray-100 bg-gray-50">
                      <button
                        type="submit"
                        disabled={step === 2 && isPlacingOrder}
                        className="w-full gradient-green text-white py-3.5 rounded-xl font-bold text-lg shadow-lg hover:shadow-glow-green transition-all duration-300 transform hover:-translate-y-0.5">
                        {step === 2 ? (isPlacingOrder ? "Placing Order..." : "Place Order") : "Continue to Payment"}
                      </button>
                      {step === 2 && (
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="w-full mt-3 py-2 text-gray-500 font-semibold hover:text-gray-700 transition-colors text-sm">
                          Back to Shipping
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Trust Badges or Info */}
                  <div className="flex justify-center gap-4 text-gray-400 text-2xl pt-2 opacity-70">
                    <FiLock className="w-6 h-6" />
                    <span className="text-xs text-gray-500">Secure Checkout</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Buttons (Mobile Fixed Bottom) */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40 safe-area-bottom lg:hidden">
              <div className="flex gap-3">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors">
                    Back
                  </button>
                )}
                <button
                  type="submit"
                  disabled={step === 2 && isPlacingOrder}
                  className="flex-1 gradient-green text-white py-3 rounded-xl font-semibold hover:shadow-glow-green transition-all duration-300">
                  {step === 2 ? (isPlacingOrder ? "Placing..." : "Place Order") : "Continue"}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Address Form Modal */}
        <AnimatePresence>
          {showAddressForm && (
            <AddressFormModal
              onSubmit={handleNewAddress}
              onCancel={() => setShowAddressForm(false)}
              isLoaded={isLoaded}
            />
          )}
        </AnimatePresence>
      </MobileLayout>
    </PageTransition>
  );
};

// Address Form Modal Component
const AddressFormModal = ({ onSubmit, onCancel, isLoaded }) => {
  const [formData, setFormData] = useState({
    name: "",
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    const phoneRegex = /^[0-9]{10}$/;
    const zipRegex = /^[0-9]{5,6}$/;
    const nameRegex = /^[a-zA-Z\s.]+$/;

    if (!formData.name.trim()) newErrors.name = "Label is required";
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (!nameRegex.test(formData.fullName.trim())) {
      newErrors.fullName = "Name should only contain letters";
    }

    const cleanPhone = formData.phone.replace(/\D/g, "");
    if (!cleanPhone) {
      newErrors.phone = "Phone is required";
    } else if (!phoneRegex.test(cleanPhone)) {
      newErrors.phone = "Enter valid 10-digit number";
    }

    if (!formData.address.trim()) newErrors.address = "Street address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    } else if (!nameRegex.test(formData.state.trim())) {
      newErrors.state = "State should only contain letters";
    }

    if (!formData.zipCode.trim()) {
      newErrors.zipCode = "Zip code is required";
    } else if (!zipRegex.test(formData.zipCode.trim())) {
      newErrors.zipCode = "Invalid zip code";
    }

    if (!formData.country.trim()) {
      newErrors.country = "Country is required";
    } else if (!nameRegex.test(formData.country.trim())) {
      newErrors.country = "Country should only contain letters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    } else {
      toast.error("Please fill all fields correctly");
    }
  };

  const autocompleteRef = useRef(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const handlePlaceChanged = () => {
    if (autocompleteRef.current !== null) {
      const place = autocompleteRef.current.getPlace();
      updateFormDataFromPlace(place, setFormData);
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        if (!window.google) {
          setIsDetectingLocation(false);
          toast.error("Google Maps not loaded yet.");
          return;
        }
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
          if (status === "OK" && results[0]) {
            updateFormDataFromPlace(results[0], setFormData);
            toast.success("Location detected successfully!");
          } else {
            toast.error("Failed to detect address");
          }
          setIsDetectingLocation(false);
        });
      },
      (error) => {
        setIsDetectingLocation(false);
        toast.error("Failed to get location. Please allow location access.");
      },
      { timeout: 10000 }
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-end"
      onClick={onCancel}>
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-t-3xl p-6 w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">Add New Address</h3>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full">
            <FiX className="text-xl" />
          </button>
        </div>
        <div className="flex justify-end mb-4">
          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={!isLoaded || isDetectingLocation}
            className="flex items-center gap-2 text-sm font-semibold text-primary-600 bg-primary-50 px-4 py-2 rounded-lg hover:bg-primary-100 transition-colors disabled:opacity-50"
          >
            <FiNavigation className={isDetectingLocation ? "animate-pulse" : ""} />
            {isDetectingLocation ? "Detecting..." : "Detect Current Location"}
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Address Label
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 text-base ${errors.name
                ? "border-red-500 focus:ring-red-200"
                : "border-gray-200 focus:ring-primary-500"
                }`}
              placeholder="Home, Work, etc."
            />
            {errors.name && <p className="text-red-500 text-xs mt-1 ml-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 text-base ${errors.fullName
                ? "border-red-500 focus:ring-red-200"
                : "border-gray-200 focus:ring-primary-500"
                }`}
            />
            {errors.fullName && <p className="text-red-500 text-xs mt-1 ml-1">{errors.fullName}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 text-base ${errors.phone
                ? "border-red-500 focus:ring-red-200"
                : "border-gray-200 focus:ring-primary-500"
                }`}
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1 ml-1">{errors.phone}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Street Address
            </label>
            {isLoaded ? (
              <Autocomplete
                onLoad={(autocomplete) => { autocompleteRef.current = autocomplete; }}
                onPlaceChanged={handlePlaceChanged}
              >
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 text-base ${errors.address
                    ? "border-red-500 focus:ring-red-200"
                    : "border-gray-200 focus:ring-primary-500"
                    }`}
                />
              </Autocomplete>
            ) : (
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 text-base ${errors.address
                  ? "border-red-500 focus:ring-red-200"
                  : "border-gray-200 focus:ring-primary-500"
                  }`}
              />
            )}
            {errors.address && <p className="text-red-500 text-xs mt-1 ml-1">{errors.address}</p>}
            {formData.lat && formData.lng && (
              <p className="text-green-600 text-xs mt-1 ml-1 font-medium">
                ✓ Coordinates matched: {Number(formData.lat).toFixed(5)}, {Number(formData.lng).toFixed(5)}
              </p>
            )}
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 text-base ${errors.city
                  ? "border-red-500 focus:ring-red-200"
                  : "border-gray-200 focus:ring-primary-500"
                  }`}
              />
              {errors.city && <p className="text-red-500 text-xs mt-1 ml-1">{errors.city}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                State
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 text-base ${errors.state
                  ? "border-red-500 focus:ring-red-200"
                  : "border-gray-200 focus:ring-primary-500"
                  }`}
              />
              {errors.state && <p className="text-red-500 text-xs mt-1 ml-1">{errors.state}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Zip Code
              </label>
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 text-base ${errors.zipCode
                  ? "border-red-500 focus:ring-red-200"
                  : "border-gray-200 focus:ring-primary-500"
                  }`}
              />
              {errors.zipCode && <p className="text-red-500 text-xs mt-1 ml-1">{errors.zipCode}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Country
            </label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
              className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 text-base ${errors.country
                ? "border-red-500 focus:ring-red-200"
                : "border-gray-200 focus:ring-primary-500"
                }`}
            />
            {errors.country && <p className="text-red-500 text-xs mt-1 ml-1">{errors.country}</p>}
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 gradient-green text-white py-3 rounded-xl font-semibold hover:shadow-glow-green transition-all">
              Add Address
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default MobileCheckout;
