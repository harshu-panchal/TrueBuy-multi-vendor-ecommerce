import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiMail, FiPhone, FiMessageSquare, FiClock, FiShield } from 'react-icons/fi';
import { getPublicLegalSettings } from '../services/publicSettingsService';

const FAQItem = ({ icon: Icon, question, answer }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex gap-4 hover:shadow-md transition-shadow">
    <div className="flex-shrink-0 mt-1">
      <Icon className="text-primary-600 text-xl" />
    </div>
    <div>
      <h3 className="font-bold text-gray-800 mb-2 uppercase text-sm tracking-wide">{question}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{answer}</p>
    </div>
  </div>
);

const HelpSupportLayout = ({
  title = "Help & Support",
  subtitle = "TRUEBUY INFORMATION",
  email = "support@truebuy.com",
  phone = "+1 800 123 4567",
  faqs = null,
  content = null,
  loading = false,
  lastUpdated = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}) => {
  const navigate = useNavigate();
  const [contactEmail, setContactEmail] = useState(email);
  const [contactPhone, setContactPhone] = useState(phone);
  const [settingsLoading, setSettingsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getPublicLegalSettings();
        if (data?.contactEmail) setContactEmail(data.contactEmail);
        if (data?.contactPhone) setContactPhone(data.contactPhone);
      } catch (error) {
        console.error("Error fetching contact settings", error);
      } finally {
        setSettingsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <div className="bg-white px-4 py-4 sticky top-0 z-30 flex items-center gap-3 border-b border-gray-100 shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <FiArrowLeft className="text-xl text-gray-800" />
        </button>
        <div className="flex flex-col">
          <h1 className="text-xl font-black text-gray-900 tracking-tight leading-none">{title}</h1>
          <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mt-1">
            {subtitle}
          </span>
        </div>
      </div>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Contact Cards */}
          <div className="space-y-4">
            {/* Email Card */}
            <div className="bg-white rounded-3xl p-6 text-center shadow-sm border border-gray-100 flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-2xl shadow-md border border-gray-50 flex items-center justify-center mb-1">
                <FiMail className="text-primary-600 text-2xl" />
              </div>
              <h2 className="font-black text-gray-900 tracking-wider">EMAIL US</h2>
              {settingsLoading ? (
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse mt-1 mb-1 mx-auto"></div>
              ) : (
                <p className="text-gray-500 font-medium">{contactEmail}</p>
              )}
              <a href={`mailto:${contactEmail}`} className="text-primary-600 font-bold text-sm tracking-wider uppercase mt-2 hover:text-primary-700 transition-colors">
                SEND MESSAGE
              </a>
            </div>

            {/* Call Card */}
            <div className="bg-white rounded-3xl p-6 text-center shadow-sm border border-gray-100 flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-2xl shadow-md border border-gray-50 flex items-center justify-center mb-1">
                <FiPhone className="text-primary-600 text-2xl" />
              </div>
              <h2 className="font-black text-gray-900 tracking-wider">CALL US</h2>
              {settingsLoading ? (
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse mt-1 mb-1 mx-auto"></div>
              ) : (
                <p className="text-gray-500 font-medium">{contactPhone}</p>
              )}
              <a href={`tel:${contactPhone.replace(/\s+/g, '')}`} className="text-primary-600 font-bold text-sm tracking-wider uppercase mt-2 hover:text-primary-700 transition-colors">
                CALL NOW
              </a>
            </div>
          </div>

          {/* Content Section */}
          {faqs && (
            <div className="pt-4">
              <h2 className="text-xl font-black text-gray-900 mb-4 px-1 tracking-tight">
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <FAQItem key={index} {...faq} />
                ))}
              </div>
            </div>
          )}

          {content && (
            <div className="pt-4">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                {loading ? (
                  <div className="flex justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap text-gray-600 text-sm leading-relaxed font-medium">
                    {content}
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="mt-8 pb-8 pt-4">
        <div className="text-center flex flex-col items-center justify-center gap-1">
          <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">
            LAST UPDATED: {lastUpdated.toUpperCase()}
          </span>
          <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">
            © {new Date().getFullYear()} TRUEBUY. ALL RIGHTS RESERVED.
          </span>
        </div>
      </footer>
    </div>
  );
};

export { HelpSupportLayout, FiMessageSquare, FiClock, FiShield };
