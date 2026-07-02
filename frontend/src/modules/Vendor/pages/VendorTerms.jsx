import React from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import PageTransition from '../../../shared/components/PageTransition';

const VendorTerms = () => {
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
                Welcome to TrueBuy Vendor Platform. By registering as a vendor and using our platform, you agree to be bound by these Terms and Conditions. Please read them carefully.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">2. Vendor Accounts</h2>
              <p className="leading-relaxed">
                When you create a vendor account, you must provide accurate business information. You are responsible for safeguarding your credentials and for all activities under your account. We reserve the right to suspend or terminate accounts that violate our policies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">3. Product Listings and Sales</h2>
              <p className="leading-relaxed">
                You agree to list products accurately, maintaining true representations of stock, price, and condition. You are responsible for honoring all sales, managing inventory diligently, and providing support for your products.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">4. Fees and Payments</h2>
              <p className="leading-relaxed">
                By selling on our platform, you agree to our commission structures and payment schedules. Settlements are processed according to our standard payment cycles, minus applicable fees and taxes.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">5. Modifications</h2>
              <p className="leading-relaxed">
                We reserve the right to modify these terms at any time. Vendors will be notified of significant changes, and continued use of the platform constitutes acceptance of the new terms.
              </p>
            </section>
            
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default VendorTerms;
