import React from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import PageTransition from '../../../shared/components/PageTransition';

const DeliveryTerms = () => {
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

          <h1 className="z-10 text-3xl md:text-4xl font-bold text-white">Terms & Conditions</h1>
        </div>

        <div className="w-full max-w-4xl bg-white -mt-16 lg:-mt-16 rounded-[40px] shadow-2xl z-20 px-6 sm:px-10 pt-10 pb-12 mb-10">
          <div className="text-gray-700 space-y-6">
            <p className="text-sm font-semibold text-gray-500">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">1. Introduction</h2>
              <p className="leading-relaxed">
                Welcome to TrueBuy Delivery Partner Platform. By registering as a delivery partner and using our platform, you agree to be bound by these Terms and Conditions. Please read them carefully.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">2. Partner Accounts</h2>
              <p className="leading-relaxed">
                When you create a delivery account, you must provide accurate personal and vehicle information. You are responsible for safeguarding your credentials and for all activities under your account.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">3. Delivery Responsibilities</h2>
              <p className="leading-relaxed">
                You agree to deliver orders safely and promptly, maintaining true representations of order statuses. You are responsible for handling goods carefully, collecting cash diligently (for COD orders), and providing a good customer experience.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">4. Fees and Payments</h2>
              <p className="leading-relaxed">
                By delivering on our platform, you agree to our earning structures and payout schedules. Settlements are processed according to our standard payment cycles, minus applicable fees and taxes.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">5. Modifications</h2>
              <p className="leading-relaxed">
                We reserve the right to modify these terms at any time. Delivery partners will be notified of significant changes, and continued use of the platform constitutes acceptance of the new terms.
              </p>
            </section>
            
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default DeliveryTerms;
