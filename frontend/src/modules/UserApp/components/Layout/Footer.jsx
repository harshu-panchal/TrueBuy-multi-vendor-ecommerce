import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiGlobe } from 'react-icons/fi';
import api from '../../../../shared/utils/api'; // Or whatever api client is used

const Footer = () => {
  const [footerConfig, setFooterConfig] = useState(null);

  useEffect(() => {
    const fetchFooterSettings = async () => {
      try {
        const response = await api.get('/settings/footer');
        if (response?.data) {
          setFooterConfig(response.data);
        }
      } catch (error) {
        console.error('Error fetching footer settings:', error);
      }
    };

    fetchFooterSettings();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!footerConfig || !footerConfig.columns) {
    return null; // Return null if nothing is loaded or configured yet
  }

  const { columns, bottomInfo } = footerConfig;

  return (
    <footer className="bg-[#0f172a] text-white">
      {/* Back to top button */}
      <div 
        onClick={scrollToTop}
        className="bg-[#1e293b] hover:bg-[#334155] transition-colors cursor-pointer py-4 text-center text-sm text-gray-300 font-medium"
      >
        Back to top
      </div>

      {/* Main Links Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-start lg:justify-items-center">
          {columns.map((col, colIdx) => (
            <div key={col.id || col.title || colIdx} className="flex flex-col">
              <h3 className="font-bold text-base mb-3 text-white">{col.title}</h3>
              <ul className="space-y-2">
                {col.links.map((link, linkIdx) => (
                  <li key={link.id || link.label || linkIdx}>
                    <Link 
                      to={link.url} 
                      className="text-sm text-gray-300 hover:underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Separator line */}
      <div className="border-t border-white/10"></div>

      {/* Footer Bottom Bar */}
      <div className="py-8 flex flex-col items-center space-y-4">
        {/* Brand / Logo Text */}
        <div className="text-2xl font-bold tracking-tight">
          {bottomInfo?.logoText || 'amazon'}
        </div>

        {/* Global Settings (Language, Currency, Region) */}
        <div className="flex flex-wrap justify-center items-center gap-3">
          <button className="flex items-center gap-2 border border-white/20 rounded-md px-4 py-2 text-sm text-gray-300 hover:border-white/40 transition-colors">
            <FiGlobe />
            {bottomInfo?.country || 'English'}
          </button>
          
          <button className="flex items-center gap-2 border border-white/20 rounded-md px-4 py-2 text-sm text-gray-300 hover:border-white/40 transition-colors">
            $
            {bottomInfo?.currency || 'USD - U.S. Dollar'}
          </button>
          
          <button className="flex items-center gap-2 border border-white/20 rounded-md px-4 py-2 text-sm text-gray-300 hover:border-white/40 transition-colors">
            {/* simple emoji flag placeholder */}
            <span role="img" aria-label="flag">🇺🇸</span>
            {bottomInfo?.countryFlag || 'United States'}
          </button>
        </div>
      </div>
      
      {/* Copyright info */}
      <div className="bg-[#020617] py-6 text-center text-xs text-gray-500">
        <p className="space-x-4">
          <span className="hover:text-gray-300 cursor-pointer">Conditions of Use</span>
          <span className="hover:text-gray-300 cursor-pointer">Privacy Notice</span>
          <span className="hover:text-gray-300 cursor-pointer">Consumer Health Data Privacy Disclosure</span>
          <span className="hover:text-gray-300 cursor-pointer">Your Ads Privacy Choices</span>
        </p>
        <p className="mt-3">© {new Date().getFullYear()}, {bottomInfo?.logoText || 'TrueBuy'}, Inc. or its affiliates</p>
      </div>
    </footer>
  );
};

export default Footer;
