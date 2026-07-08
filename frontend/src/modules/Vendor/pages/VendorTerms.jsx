import React, { useState, useEffect } from 'react';
import PageTransition from '../../../shared/components/PageTransition';
import { HelpSupportLayout } from '../../../shared/components/HelpSupportLayout';
import { getPublicLegalSettings } from '../../../shared/services/publicSettingsService';

const VendorTerms = () => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const data = await getPublicLegalSettings();
        setContent(data?.termsConditions?.vendor || 'Support Information not available.');
      } catch (error) {
        setContent('Error loading support information.');
      } finally {
        setLoading(false);
      }
    };
    fetchTerms();
  }, []);

  return (
    <PageTransition>
      <HelpSupportLayout
        title="Help & Support"
        subtitle="TRUEBUY VENDOR INFORMATION"
        content={content}
        loading={loading}
      />
    </PageTransition>
  );
};

export default VendorTerms;
