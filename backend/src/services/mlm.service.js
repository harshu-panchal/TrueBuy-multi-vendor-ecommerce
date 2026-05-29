/**
 * Verifies a referral code with the external MLM system.
 * 
 * @param {string} referralCode - The referral code to verify.
 * @returns {Promise<{valid: boolean, data?: object, error?: string}>}
 */
export const verifyReferralCode = async (referralCode) => {
    if (!referralCode) {
        return { valid: false, error: 'Referral code is required' };
    }

    const baseUrl = process.env.MLM_API_BASE_URL;
    if (!baseUrl) {
        console.warn('MLM_API_BASE_URL is not defined in environment variables, using fallback');
        return { valid: true, data: { isFallback: true, referralCode } };
    }

    // Prepare timeout using AbortController
    const controller = new AbortController();
    const timeout = setTimeout(() => {
        controller.abort();
    }, 10000); // 10 second timeout

    try {
        const url = `${baseUrl.replace(/\/$/, '')}/api/User/users/get-member-details-by-ref/${encodeURIComponent(referralCode)}`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
            signal: controller.signal
        });

        clearTimeout(timeout);

        if (!response.ok) {
            // MLM API typically returns 400/404 for invalid member code
            if (response.status === 404 || response.status === 400) {
                return { valid: false, error: 'Invalid referral code' };
            }
            throw new Error(`MLM API responded with status ${response.status}`);
        }

        const data = await response.json();
        
        return {
            valid: true,
            data: data
        };
    } catch (error) {
        clearTimeout(timeout);
        
        if (error.name === 'AbortError') {
            console.error('MLM API request timed out for code:', referralCode);
            return { valid: false, error: 'MLM service timeout. Please try again.' };
        }

        console.error('Error verifying referral code:', error.message);
        return { valid: false, error: 'Failed to verify referral code due to a network or server error.' };
    }
};

export default {
    verifyReferralCode
};
