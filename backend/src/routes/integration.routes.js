import express from 'express';
import { Vendor } from '../models/Vendor.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const router = express.Router();

// Simple API Key middleware
const verifyApiKey = (req, res, next) => {
    // Check headers or query parameters for the API key
    const apiKey = req.headers['x-api-key'] || req.query.apiKey;
    
    // In production, set INTEGRATION_API_KEY in your .env file
    const expectedApiKey = process.env.INTEGRATION_API_KEY || 'my_secret_integration_key_123';
    
    if (!apiKey || apiKey !== expectedApiKey) {
        throw new ApiError(401, 'Unauthorized: Invalid or missing API Key');
    }
    next();
};

// GET /api/integration/vendors
// Fetch registered vendors for another project
router.get('/vendors', verifyApiKey, asyncHandler(async (req, res) => {
    const { status, limit = 50, page = 1 } = req.query;
    
    const filter = { isDeleted: false };
    if (status) {
        filter.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    // Fetch vendors, excluding highly sensitive auth data like passwords and OTPs
    const vendors = await Vendor.find(filter)
        .select('-password -otp -resetOtp -refreshTokenHash -bankDetails.accountNumber') 
        .sort({ createdAt: -1 }) // Newest first
        .skip(skip)
        .limit(Number(limit));

    const total = await Vendor.countDocuments(filter);

    res.status(200).json(new ApiResponse(200, {
        vendors,
        pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            pages: Math.ceil(total / Number(limit))
        }
    }, 'Vendors fetched for integration.'));
}));

export default router;
