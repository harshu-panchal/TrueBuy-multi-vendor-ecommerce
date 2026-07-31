import api from '../utils/api';

export const getPublicLegalSettings = async () => {
    try {
        const response = await api.get('/settings/legal');
        return response.data;
    } catch (error) {
        console.error('Error fetching public legal settings:', error);
        throw error;
    }
};
