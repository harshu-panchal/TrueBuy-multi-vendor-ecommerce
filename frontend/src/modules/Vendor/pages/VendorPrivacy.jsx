import React, { useState, useEffect } from 'react';
import PageTransition from '../../../shared/components/PageTransition';
import { HelpSupportLayout } from '../../../shared/components/HelpSupportLayout';
import { getPublicLegalSettings } from '../../../shared/services/publicSettingsService';

const VendorPrivacy = () => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrivacy = async () => {
      try {
        const data = await getPublicLegalSettings();
        setContent(data?.privacyPolicy?.vendor || 'Privacy Policy not available.');
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
      <HelpSupportLayout
        title="Privacy Policy"
        subtitle="TRUEBUY VENDOR INFORMATION"
        email="privacy@truebuy.com"
        phone="+1 800 123 4567"
        content={content}
        loading={loading}
      />
    </PageTransition>
  );
};

export default VendorPrivacy;
