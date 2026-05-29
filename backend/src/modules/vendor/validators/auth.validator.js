import Joi from 'joi';

export const registerSchema = Joi.object({
    name: Joi.string().trim().min(2).max(50).pattern(/^[a-zA-Z\s]+$/).required().messages({
        'string.pattern.base': 'Name can only contain alphabets and spaces.',
    }),
    email: Joi.string().trim().pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|in|org)$/).lowercase().required().messages({
        'string.pattern.base': 'Email must be in a valid format and end with .com, .in, or .org',
    }),
    password: Joi.string().min(6).required(),
    phone: Joi.string().pattern(/^[0-9]{10}$/).required().messages({
        'string.pattern.base': 'Phone number must be exactly 10 digits.',
    }),
    storeName: Joi.string().trim().min(2).max(100).required(),
    storeDescription: Joi.string().trim().max(500).allow('').optional(),
    gstNumber: Joi.string().trim().pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i).allow('').optional().messages({
        'string.pattern.base': 'Invalid GST number format (e.g., 22AAAAA0000A1Z5)',
    }),
    address: Joi.object({
        street: Joi.string().allow('').optional(),
        city: Joi.string().allow('').optional(),
        state: Joi.string().allow('').optional(),
        zipCode: Joi.string().allow('').optional(),
        country: Joi.string().allow('').optional(),
    }).optional(),
});

export const loginSchema = Joi.object({
    email: Joi.string().trim().pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|in|org)$/).lowercase().required().messages({
        'string.pattern.base': 'Invalid email format.',
    }),
    password: Joi.string().required(),
});

export const verifyOtpSchema = Joi.object({
    email: Joi.string().email().lowercase().required(),
    otp: Joi.string().pattern(/^\d{6}$/).required(),
});

export const resendOtpSchema = Joi.object({
    email: Joi.string().email().lowercase().required(),
});

export const refreshTokenSchema = Joi.object({
    refreshToken: Joi.string().required(),
});

export const logoutSchema = Joi.object({
    refreshToken: Joi.string().allow('').optional(),
});

export const forgotPasswordSchema = Joi.object({
    email: Joi.string().email().lowercase().required(),
});

export const verifyResetOtpSchema = Joi.object({
    email: Joi.string().email().lowercase().required(),
    otp: Joi.string().pattern(/^\d{6}$/).required(),
});

export const resetPasswordSchema = Joi.object({
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
        'any.only': 'Confirm password must match password.',
    }),
});

export const updateBankDetailsSchema = Joi.object({
    accountName: Joi.string().trim().min(2).max(100).pattern(/^[^\d]+$/).required().messages({
        'string.empty': 'Account holder name is required.',
        'string.min': 'Account holder name must be at least 2 characters.',
        'string.pattern.base': 'Account holder name should not contain digits.',
    }),
    accountNumber: Joi.string().pattern(/^\d+$/).required().messages({
        'string.pattern.base': 'Account number must contain only digits.',
        'string.empty': 'Account number is required.',
    }),
    bankName: Joi.string().trim().min(2).max(100).pattern(/^[^\d]+$/).required().messages({
        'string.empty': 'Bank name is required.',
        'string.pattern.base': 'Bank name should not contain digits.',
    }),
    ifscCode: Joi.string().pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/).required().messages({
        'string.pattern.base': 'Invalid IFSC format: 4 alphabets, 5th "0", last 6 alphanumeric (e.g., SBIN0001234).',
        'string.empty': 'IFSC code is required.',
        'string.length': 'IFSC code must be exactly 11 characters.',
    }),
    upiId: Joi.string().trim().pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+$/).allow('').optional().messages({
        'string.pattern.base': 'Invalid UPI ID format (e.g., user@upi). Must contain one @ and no spaces.',
    }),
    paypalEmail: Joi.string().trim().pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/).allow('').optional().messages({
        'string.pattern.base': 'Invalid PayPal email format.',
    }),
    paymentMethods: Joi.object({
        bankTransfer: Joi.boolean(),
        upi: Joi.boolean(),
        paypal: Joi.boolean(),
    }).optional(),
});

export const updateVendorProfileSchema = Joi.object({
    name: Joi.string().trim().min(2).max(50).pattern(/^[a-zA-Z\s]+$/).optional().messages({
        'string.pattern.base': 'Full name can only contain alphabets and spaces.',
    }),
    storeName: Joi.string().trim().min(2).max(100).optional(),
    storeLogo: Joi.string().trim().pattern(/^[^\d]+$/).allow('').optional().messages({
        'string.pattern.base': 'Store logo URL should not contain digits.',
    }),
    storeDescription: Joi.string().trim().max(500).allow('').optional(),
    gstNumber: Joi.string().trim().pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i).allow(null, '').optional().messages({
        'string.pattern.base': 'Invalid GST number format (e.g., 22AAAAA0000A1Z5)',
    }),
    phone: Joi.string().pattern(/^[0-9]{10}$/).required().messages({
        'string.pattern.base': 'Phone number must be exactly 10 digits.',
    }),
    address: Joi.object({
        street: Joi.string().trim().allow('').optional(),
        city: Joi.string().trim().allow('').optional(),
        state: Joi.string().trim().allow('').optional(),
        zipCode: Joi.string().trim().allow('').optional(),
        country: Joi.string().trim().allow('').optional(),
    }).optional(),
    socialMedia: Joi.object({
        facebook: Joi.string().trim().pattern(/^\S*$/).allow('').optional().messages({
            'string.pattern.base': 'Facebook URL should not contain spaces.',
        }),
        instagram: Joi.string().trim().pattern(/^\S*$/).allow('').optional().messages({
            'string.pattern.base': 'Instagram URL should not contain spaces.',
        }),
        twitter: Joi.string().trim().pattern(/^\S*$/).allow('').optional().messages({
            'string.pattern.base': 'Twitter URL should not contain spaces.',
        }),
        linkedin: Joi.string().trim().pattern(/^\S*$/).allow('').optional().messages({
            'string.pattern.base': 'LinkedIn URL should not contain spaces.',
        }),
    }).optional(),
});

export const verifyReferralSchema = Joi.object({
    vendorId: Joi.string().required().messages({
        'string.empty': 'Vendor ID is required.',
    }),
    referralCode: Joi.string().trim().required().messages({
        'string.empty': 'Referral code is required.',
    }),
});
