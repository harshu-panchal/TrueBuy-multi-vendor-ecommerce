import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiFileText } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { getPublicLegalSettings } from '../../../shared/services/publicSettingsService';
import PageTransition from '../../../shared/components/PageTransition';

const VendorTerms = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const data = await getPublicLegalSettings();
        setContent(data?.termsConditions?.vendor || 'Terms and Conditions not available.');
      } catch (error) {
        setContent('Error loading terms and conditions.');
      } finally {
        setLoading(false);
      }
    };
    fetchTerms();
  }, []);

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
                  title="Go Back"
                >
                  <FiArrowLeft className="text-xl text-gray-600" />
                </button>
                <Link to="/vendor/login" className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-600 to-secondary-500 flex items-center justify-center text-white font-bold text-lg">
                    T
                  </div>
                  <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-700 to-secondary-600 hidden sm:block">
                    TrueBuy Vendor
                  </span>
                </Link>
              </div>
              
              <div className="flex gap-4">
                <Link to="/vendor/login" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">
                  Login
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
          >
            {/* Cover Header */}
            <div className="bg-slate-900 px-6 py-12 sm:px-12 sm:py-16 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-10">
                <FiFileText className="w-48 h-48 text-white" />
              </div>
              <div className="relative z-10">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Terms & Conditions</h1>
                <p className="text-slate-400">Vendor Platform Agreement</p>
              </div>
            </div>

            <div className="p-6 sm:p-12 text-gray-700">
              <p className="text-sm text-gray-500 mb-8 border-b pb-4">
                Last updated: {new Date().toLocaleDateString()}
              </p>

              <div className="space-y-8">
                {loading ? (
                  <div className="flex justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
                    {content}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-auto py-8">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} TrueBuy. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </PageTransition>
  );
};

export default VendorTerms;
