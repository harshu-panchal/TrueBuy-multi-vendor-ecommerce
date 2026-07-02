import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { FiMapPin, FiEdit, FiTrash2, FiPlus, FiCheck, FiX, FiArrowLeft, FiNavigation } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import MobileLayout from "../components/Layout/MobileLayout";
import toast from 'react-hot-toast';
import PageTransition from '../../../shared/components/PageTransition';
import ProtectedRoute from '../../../shared/components/Auth/ProtectedRoute';
import { useAddressStore } from '../../../shared/store/addressStore';
import { useAuthStore } from '../../../shared/store/authStore';
import { useJsApiLoader } from '@react-google-maps/api';

const libraries = ['places', 'geometry'];

const MobileAddresses = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { addresses, addAddress, updateAddress, deleteAddress, setDefaultAddress, fetchAddresses, isLoading } =
    useAddressStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchAddresses().catch(() => null);
  }, [isAuthenticated, fetchAddresses]);

  const onSubmit = async (data) => {
    try {
      if (editingAddress) {
        await updateAddress(editingAddress.id, data);
        toast.success('Address updated successfully!');
      } else {
        await addAddress(data);
        toast.success('Address added successfully!');
      }
      reset();
      setIsFormOpen(false);
      setEditingAddress(null);
    } catch (error) {
      toast.error(error?.message || 'Failed to save address');
    }
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    reset(address);
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await deleteAddress(id);
        toast.success('Address deleted successfully!');
      } catch (error) {
        toast.error(error?.message || 'Failed to delete address');
      }
    }
  };

  const handleCancel = () => {
    reset();
    setIsFormOpen(false);
    setEditingAddress(null);
  };

  return (
    <ProtectedRoute>
      <PageTransition>
        <MobileLayout showBottomNav={true} showCartBar={true}>
          <div className="w-full">
            {/* Header */}
            <div className="px-4 py-4 bg-white border-b border-gray-200 sticky top-1 z-30">
              <div className="flex items-center gap-3 mb-3">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FiArrowLeft className="text-xl text-gray-700" />
                </button>
                <h1 className="text-xl font-bold text-gray-800 flex-1">Saved Addresses</h1>
                <button
                  onClick={() => setIsFormOpen(true)}
                  className="p-2 gradient-green text-white rounded-xl hover:shadow-glow-green transition-all"
                >
                  <FiPlus className="text-xl" />
                </button>
              </div>
            </div>

            {/* Addresses List */}
            <div className="px-4 py-4">
              {isLoading ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">Loading addresses...</p>
                </div>
              ) : addresses.length === 0 ? (
                <div className="text-center py-12">
                  <FiMapPin className="text-6xl text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-800 mb-2">No addresses saved</h3>
                  <p className="text-gray-600 mb-6">Add your first address to get started</p>
                  <button
                    onClick={() => setIsFormOpen(true)}
                    className="gradient-green text-white px-6 py-3 rounded-xl font-semibold"
                  >
                    Add Address
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <motion.div
                      key={address.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass-card rounded-2xl p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3 flex-1">
                          <FiMapPin className="text-primary-600 text-xl mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-gray-800 text-base">{address.name}</h3>
                              {address.isDefault && (
                                <span className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded text-xs font-semibold">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-1">{address.fullName}</p>
                            <p className="text-sm text-gray-600 mb-1">{address.address}</p>
                            <p className="text-sm text-gray-600">
                              {address.city}, {address.state} {address.zipCode}
                            </p>
                            <p className="text-sm text-gray-600">{address.country}</p>
                            <p className="text-sm text-gray-600 mt-1">Phone: {address.phone}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-3 border-t border-gray-200">
                        {!address.isDefault && (
                          <button
                            onClick={async () => {
                              try {
                                await setDefaultAddress(address.id);
                                toast.success('Default address updated');
                              } catch (error) {
                                toast.error(error?.message || 'Failed to set default address');
                              }
                            }}
                            className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors"
                          >
                            Set as Default
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(address)}
                          className="p-2 bg-primary-50 text-primary-600 rounded-xl hover:bg-primary-100 transition-colors"
                        >
                          <FiEdit className="text-base" />
                        </button>
                        <button
                          onClick={() => handleDelete(address.id)}
                          className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                        >
                          <FiTrash2 className="text-base" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Address Form Modal */}
          <AnimatePresence>
            {isFormOpen && (
              <AddressFormModal
                onSubmit={onSubmit}
                onCancel={handleCancel}
                editingAddress={editingAddress}
                register={register}
                handleSubmit={handleSubmit}
                setValue={setValue}
                errors={errors}
                user={user}
              />
            )}
          </AnimatePresence>
        </MobileLayout>
      </PageTransition>
    </ProtectedRoute>
  );
};

// Address Form Modal Component
const AddressFormModal = ({
  onSubmit,
  onCancel,
  editingAddress,
  register,
  handleSubmit,
  setValue,
  errors,
  user,
}) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    libraries: libraries
  });

  const addressInputRef = useRef(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const { ref: registerAddressRef, ...registerAddressRest } = register('address', { required: 'Address is required' });

  const handleDetectLocation = () => {
    // Auto-fill user details from profile
    if (user) {
      if (user.name || user.fullName) {
        setValue('fullName', user.name || user.fullName, { shouldValidate: true });
      }
      if (user.phone) {
        setValue('phone', user.phone, { shouldValidate: true });
      }
    }

    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        if (!isLoaded || !window.google || !window.google.maps || !window.google.maps.Geocoder) {
          toast.error("Google Maps API not loaded");
          setIsDetecting(false);
          return;
        }

        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
          if (status === "OK" && results[0]) {
            const place = results[0];
            let streetNumber = '';
            let route = '';
            let city = '';
            let state = '';
            let zip = '';
            let country = '';

            for (const component of place.address_components) {
              const type = component.types[0];
              if (type === 'street_number') streetNumber = component.long_name;
              if (type === 'route') route = component.long_name;
              if (type === 'locality' || type === 'postal_town') city = component.long_name;
              if (type === 'administrative_area_level_1') state = component.long_name;
              if (type === 'postal_code') zip = component.long_name;
              if (type === 'country') country = component.long_name;
            }

            let fullAddress = `${streetNumber} ${route}`.trim();
            if (!fullAddress && place.formatted_address) {
              fullAddress = place.formatted_address.split(',')[0];
            }
            setValue('address', fullAddress, { shouldValidate: true });
            if (city) setValue('city', city, { shouldValidate: true });
            if (state) setValue('state', state, { shouldValidate: true });
            if (zip) setValue('zipCode', zip, { shouldValidate: true });
            if (country) setValue('country', country, { shouldValidate: true });
            toast.success("Location detected successfully!");
          } else {
            toast.error("Could not determine address");
          }
          setIsDetecting(false);
        });
      },
      (error) => {
        console.error(error);
        toast.error("Failed to get location. Please enable location permissions.");
        setIsDetecting(false);
      },
      { enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    if (!isLoaded || !window.google || !window.google.maps || !window.google.maps.places) return;
    if (!addressInputRef.current) return;

    const autocomplete = new window.google.maps.places.Autocomplete(addressInputRef.current, {
      fields: ["address_components", "formatted_address", "name"],
      types: ["address"]
    });

    const listener = autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place.address_components) {
        setValue('address', place.name || '');
        return;
      }

      let streetNumber = '';
      let route = '';
      let city = '';
      let state = '';
      let zip = '';
      let country = '';

      for (const component of place.address_components) {
        const type = component.types[0];
        if (type === 'street_number') streetNumber = component.long_name;
        if (type === 'route') route = component.long_name;
        if (type === 'locality' || type === 'postal_town') city = component.long_name;
        if (type === 'administrative_area_level_1') state = component.long_name;
        if (type === 'postal_code') zip = component.long_name;
        if (type === 'country') country = component.long_name;
      }

      let fullAddress = `${streetNumber} ${route}`.trim();
      if (!fullAddress && place.formatted_address) {
        fullAddress = place.formatted_address.split(',')[0];
      }
      setValue('address', fullAddress, { shouldValidate: true });
      if (city) setValue('city', city, { shouldValidate: true });
      if (state) setValue('state', state, { shouldValidate: true });
      if (zip) setValue('zipCode', zip, { shouldValidate: true });
      if (country) setValue('country', country, { shouldValidate: true });
    });

    return () => {
      window.google.maps.event.removeListener(listener);
    };
  }, [isLoaded, setValue]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-[10000] flex items-end"
      onClick={onCancel}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-t-3xl p-5 sm:p-6 w-full max-h-[85vh] overflow-y-auto pb-12 sm:pb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            {editingAddress ? 'Edit Address' : 'Add New Address'}
          </h2>
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full">
            <FiX className="text-xl" />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={isDetecting}
            className="w-full bg-blue-50 text-blue-600 border border-blue-200 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors disabled:opacity-70 mb-1 shadow-sm text-sm sm:text-base"
          >
            <FiNavigation className={isDetecting ? "animate-pulse text-lg" : "text-lg"} />
            {isDetecting ? 'Detecting Location...' : 'Use Current Location'}
          </button>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Address Label</label>
            <input
              type="text"
              {...register('name', { required: 'Address label is required' })}
              className={`w-full px-3 py-2.5 rounded-xl border-2 ${errors.name ? 'border-red-300' : 'border-gray-200'
                } focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm`}
              placeholder="Home, Work, etc."
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
            <input
              type="text"
              {...register('fullName', { required: 'Full name is required' })}
              className={`w-full px-3 py-2.5 rounded-xl border-2 ${errors.fullName ? 'border-red-300' : 'border-gray-200'
                } focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm`}
            />
            {errors.fullName && (
              <p className="mt-1 text-xs text-red-600">{errors.fullName.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
            <input
              type="tel"
              {...register('phone', { required: 'Phone number is required' })}
              className={`w-full px-3 py-2.5 rounded-xl border-2 ${errors.phone ? 'border-red-300' : 'border-gray-200'
                } focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm`}
            />
            {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Street Address</label>
            <input
              type="text"
              {...registerAddressRest}
              ref={(e) => {
                registerAddressRef(e);
                addressInputRef.current = e;
              }}
              className={`w-full px-3 py-2.5 rounded-xl border-2 ${errors.address ? 'border-red-300' : 'border-gray-200'
                } focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm`}
              placeholder="Search or enter your address..."
            />
            {errors.address && (
              <p className="mt-1 text-xs text-red-600">{errors.address.message}</p>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">City</label>
              <input
                type="text"
                {...register('city', { required: 'City is required' })}
                className={`w-full px-3 py-2.5 rounded-xl border-2 ${errors.city ? 'border-red-300' : 'border-gray-200'
                  } focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm`}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">State</label>
              <input
                type="text"
                {...register('state', { required: 'State is required' })}
                className={`w-full px-3 py-2.5 rounded-xl border-2 ${errors.state ? 'border-red-300' : 'border-gray-200'
                  } focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm`}
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Zip Code</label>
              <input
                type="text"
                {...register('zipCode', { required: 'Zip code is required' })}
                className={`w-full px-3 py-2.5 rounded-xl border-2 ${errors.zipCode ? 'border-red-300' : 'border-gray-200'
                  } focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm`}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Country</label>
            <input
              type="text"
              {...register('country', { required: 'Country is required' })}
              className={`w-full px-3 py-2.5 rounded-xl border-2 ${errors.country ? 'border-red-300' : 'border-gray-200'
                } focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm`}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 gradient-green text-white py-3 rounded-xl font-semibold hover:shadow-glow-green transition-all"
            >
              {editingAddress ? 'Update Address' : 'Add Address'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default MobileAddresses;

