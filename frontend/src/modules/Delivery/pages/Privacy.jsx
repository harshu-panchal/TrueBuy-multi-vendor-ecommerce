import React from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import PageTransition from '../../../shared/components/PageTransition';

const DeliveryPrivacy = () => {
  const navigate = useNavigate();

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

          <h1 className="z-10 text-3xl md:text-4xl font-bold text-white">Privacy Policy</h1>
        </div>

        <div className="w-full max-w-4xl bg-white -mt-16 lg:-mt-16 rounded-[40px] shadow-2xl z-20 px-6 sm:px-10 pt-10 pb-12 mb-10">
          <div className="text-gray-700 space-y-6">
            <p className="text-sm font-semibold text-gray-500">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">1. Information We Collect</h2>
              <p className="leading-relaxed">
                We collect personal information such as your name, contact details, vehicle information, and location data when you use our delivery application. We may also collect document images (like your license) during registration.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">2. How We Use Your Information</h2>
              <p className="leading-relaxed">
                Your information is used to verify your identity, assign delivery orders, track deliveries in real-time, process payouts, and communicate important updates regarding your account.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">3. Location Data</h2>
              <p className="leading-relaxed">
                For the core functionality of the delivery app, we require access to your location data while you are on duty. This helps us optimize routes and update customers on the status of their orders.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">4. Data Security</h2>
              <p className="leading-relaxed">
                We implement industry-standard security measures to protect your personal information from unauthorized access, disclosure, or misuse.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">5. Contact Us</h2>
              <p className="leading-relaxed">
                If you have any questions about this Privacy Policy or our data practices, please contact our delivery partner support team.
              </p>
            </section>
            
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default DeliveryPrivacy;
