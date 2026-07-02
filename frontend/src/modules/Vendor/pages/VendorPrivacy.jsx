import React from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import PageTransition from '../../../shared/components/PageTransition';

const VendorPrivacy = () => {
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
                When you register as a vendor on TrueBuy, we collect your business details, contact information, financial information for settlements, and other data necessary to facilitate your use of our platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">2. How We Use Your Information</h2>
              <p className="leading-relaxed">
                We use your data to operate the marketplace, process your settlements, communicate with you regarding your account, and ensure compliance with our platform policies and local laws.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">3. Data Sharing and Disclosure</h2>
              <p className="leading-relaxed">
                We may share your public store information with customers to facilitate sales. We do not sell your personal or business data to third parties. We may share data with service providers (like payment processors) necessary for operating the platform.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">4. Data Security</h2>
              <p className="leading-relaxed">
                We implement robust security measures to protect your account information and business data. However, you are also responsible for keeping your login credentials secure and confidential.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">5. Contact Us</h2>
              <p className="leading-relaxed">
                If you have questions about this Privacy Policy or how your data is handled, please contact our support team.
              </p>
            </section>
            
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default VendorPrivacy;
