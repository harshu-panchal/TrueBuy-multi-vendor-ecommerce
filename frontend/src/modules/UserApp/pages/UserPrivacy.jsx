import React from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import MobileLayout from '../components/Layout/MobileLayout';
import PageTransition from '../../../shared/components/PageTransition';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <PageTransition>
      <MobileLayout showBottomNav={false} showCartBar={false}>
        <div className="w-full lg:pb-12 max-w-4xl mx-auto min-h-screen bg-white">
          {/* Header */}
          <div className="px-4 py-4 bg-white border-b border-gray-200 sticky top-0 z-30 flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FiArrowLeft className="text-xl text-gray-700" />
            </button>
            <h1 className="text-xl font-bold text-gray-800">
              Privacy Policy
            </h1>
          </div>
          
          <div className="p-5 text-gray-700 space-y-6">
            <p className="text-sm">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-2">1. Data Collection</h2>
              <p>
                We collect personal information that you provide to us, such as your name, email address, phone number, and payment information when you register, make a purchase, or interact with our platform.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-2">2. How We Use Your Data</h2>
              <p>
                We use your information to provide and improve our services, process transactions, send notifications, and personalize your shopping experience.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-2">3. Data Sharing</h2>
              <p>
                We do not sell your personal data. We may share information with trusted third-party service providers who assist us in operating our platform, conducting business, or serving you, provided they agree to keep this information confidential.
              </p>
            </section>
            
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-2">4. Your Rights</h2>
              <p>
                You have the right to access, update, or delete your personal information. You can manage your account settings from your Profile or contact us for assistance.
              </p>
            </section>
            
          </div>
        </div>
      </MobileLayout>
    </PageTransition>
  );
};

export default PrivacyPolicy;
