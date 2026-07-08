import React, { useState, useEffect } from 'react';
import PageTransition from '../../../shared/components/PageTransition';
import { HelpSupportLayout } from '../../../shared/components/HelpSupportLayout';
import { getPublicLegalSettings } from '../../../shared/services/publicSettingsService';

const UserTerms = () => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const data = await getPublicLegalSettings();
        setContent(data?.termsConditions?.user || 'Support Information not available.');
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
        subtitle="TRUEBUY USER INFORMATION"
        content={content}
        loading={loading}
      />
    </PageTransition>
  );
};

export default UserTerms;
