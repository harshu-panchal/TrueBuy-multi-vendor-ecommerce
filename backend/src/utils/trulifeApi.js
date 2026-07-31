import axios from 'axios';

/**
 * Registers a user or vendor as an affiliate on TruLifeIndia
 * @param {Object} data
 * @param {string} data.referralCode - Sponsor's referral code (if any)
 * @param {string} data.fullName - User's full name
 * @param {string} data.email - User's email
 * @param {string} data.mobileNo - User's phone number
 * @param {string} data.password - Plain text password
 * @param {string} data.role - 'User' or 'Vendor'
 * @returns {Promise<string|null>} - Returns the generated referral code from TruLife if successful, or null.
 */
export const registerAffiliateOnTruLife = async ({
    referralCode,
    fullName,
    email,
    mobileNo,
    password,
    role
}) => {
    try {
        const payload = {
            referralCode: referralCode || "DEFAULT_ADMIN", // TruLife requires a sponsor, replace if needed
            fullName: fullName || "N/A",
            email: email || "",
            mobileNo: mobileNo || "0000000000",
            state: "N/A",
            city: "N/A",
            loginId: email || mobileNo || `user_${Date.now()}`,
            password: password || "123456", // They require a password
            source: "TruBuy",
            role: role || "User"
        };

        const response = await axios.post('https://trulifeindia.com/api/User/users/registeraffiliate', payload, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 10000 // 10 second timeout so we don't block registration
        });

        if (response.status === 200 && response.data) {
            // Attempt to extract the generated referral code.
            // Adjust these property names based on the actual TruLife API response!
            const generatedCode = response.data.referralCode || response.data.userName || response.data.data?.referralCode;
            
            if (generatedCode) {
                console.log(`[TruLife API] Successfully registered affiliate. Got code: ${generatedCode}`);
                return generatedCode;
            } else {
                console.warn(`[TruLife API] Registered successfully, but no referral code found in response. Response:`, response.data);
            }
        }
    } catch (error) {
        console.error(`[TruLife API Error] Failed to register affiliate:`, error.response?.data || error.message);
    }
    
    // Return null if failed or code not found, 
    // the models (User/Vendor) will fallback to generating their own TRB/VND codes.
    return null;
};
