import React, { useState, useEffect } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import MobileLayout from '../components/Layout/MobileLayout';
import PageTransition from '../../../shared/components/PageTransition';
import { getPublicLegalSettings } from '../../../shared/services/publicSettingsService';

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrivacy = async () => {
      try {
        const data = await getPublicLegalSettings();
        setContent(data?.privacyPolicy?.user || 'Privacy Policy not available.');
      } catch (error) {
        setContent('Error loading privacy policy.');
      } finally {
        setLoading(false);
      }
    };
    fetchPrivacy();
  }, []);

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
      </MobileLayout>
    </PageTransition>
  );
};

export default PrivacyPolicy;
