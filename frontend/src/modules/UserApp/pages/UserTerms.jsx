import React from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import MobileLayout from '../components/Layout/MobileLayout';
import PageTransition from '../../../shared/components/PageTransition';

const TermsAndConditions = () => {
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
              Terms & Conditions
            </h1>
          </div>
          
          <div className="p-5 text-gray-700 space-y-6">
            <p className="text-sm">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-2">1. Introduction</h2>
              <p>
                Welcome to TrueBuy. By accessing or using our platform, you agree to be bound by these Terms and Conditions. Please read them carefully.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-2">2. Use of Service</h2>
              <p>
                You must use this service in compliance with all applicable laws and regulations. You may not use our platform for any illegal or unauthorized purpose.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-2">3. User Accounts</h2>
              <p>
                When you create an account with us, you must provide accurate, complete, and current information. You are responsible for safeguarding the password that you use to access the service and for any activities or actions under your password.
              </p>
            </section>
            
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-2">4. Modifications</h2>
              <p>
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will try to provide at least 30 days' notice prior to any new terms taking effect.
              </p>
            </section>
            
          </div>
        </div>
      </MobileLayout>
    </PageTransition>
  );
};

export default TermsAndConditions;
