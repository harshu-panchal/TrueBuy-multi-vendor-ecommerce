import asyncHandler from '../../../utils/asyncHandler.js';
import ApiResponse from '../../../utils/ApiResponse.js';
import ApiError from '../../../utils/ApiError.js';
import Affiliate from '../../../models/Affiliate.model.js';

// GET /api/admin/affiliates
export const getAllAffiliates = asyncHandler(async (req, res) => {
    const { page = 1, limit = 50, search, active } = req.query;
    const numericPage = Number(page) || 1;
    const numericLimit = Number(limit) || 50;
    const skip = (numericPage - 1) * numericLimit;

    const filter = {};

    if (active !== undefined && active !== 'all') {
        filter.isActive = active === 'true' || active === true;
    }

    if (search) {
        const q = search.toLowerCase();
        filter.$or = [
            { firstName: { $regex: q, $options: 'i' } },
            { lastName: { $regex: q, $options: 'i' } },
            { email: { $regex: q, $options: 'i' } },
            { company: { $regex: q, $options: 'i' } },
            { friendlyUrlName: { $regex: q, $options: 'i' } },
        ];
    }

    const [affiliates, total] = await Promise.all([
        Affiliate.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(numericLimit)
            .lean(),
        Affiliate.countDocuments(filter),
    ]);

    const formatted = affiliates.map((a) => ({
        ...a,
        id: a._id,
        active: a.isActive,
    }));

    res.status(200).json(
        new ApiResponse(
            200,
            {
                affiliates: formatted,
                total,
                page: numericPage,
                pages: Math.ceil(total / numericLimit),
            },
            'Affiliates fetched successfully'
        )
    );
});

// GET /api/admin/affiliates/:id
export const getAffiliateById = asyncHandler(async (req, res) => {
    const affiliate = await Affiliate.findById(req.params.id).lean();
    if (!affiliate) {
        throw new ApiError(404, 'Affiliate not found');
    }

    res.status(200).json(
        new ApiResponse(
            200,
            {
                ...affiliate,
                id: affiliate._id,
                active: affiliate.isActive,
            },
            'Affiliate fetched successfully'
        )
    );
});

// POST /api/admin/affiliates
export const createAffiliate = asyncHandler(async (req, res) => {
    const {
        firstName,
        lastName,
        email,
        company,
        phone,
        fax,
        address1,
        address2,
        city,
        state,
        country,
        zipCode,
        friendlyUrlName,
        commissionRate,
        active,
        isActive,
    } = req.body;

    if (!firstName || !lastName || !email) {
        throw new ApiError(400, 'First name, last name, and email are required');
    }

    const existing = await Affiliate.findOne({ email: email.toLowerCase() });
    if (existing) {
        throw new ApiError(409, 'An affiliate with this email already exists');
    }

    const affiliate = new Affiliate({
        firstName,
        lastName,
        email: email.toLowerCase(),
        company: company || '',
        phone: phone || '',
        fax: fax || '',
        address1: address1 || '',
        address2: address2 || '',
        city: city || '',
        state: state || '',
        country: country || 'India',
        zipCode: zipCode || '',
        friendlyUrlName: friendlyUrlName || '',
        commissionRate: Number(commissionRate) || 5,
        isActive: active !== undefined ? active : (isActive !== undefined ? isActive : true),
    });

    await affiliate.save();

    res.status(201).json(
        new ApiResponse(
            201,
            {
                ...affiliate.toObject(),
                id: affiliate._id,
                active: affiliate.isActive,
            },
            'Affiliate created successfully'
        )
    );
});

// PUT /api/admin/affiliates/:id
export const updateAffiliate = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { active, isActive, ...updateFields } = req.body;

    if (active !== undefined) {
        updateFields.isActive = active;
    } else if (isActive !== undefined) {
        updateFields.isActive = isActive;
    }

    const affiliate = await Affiliate.findByIdAndUpdate(
        id,
        { $set: updateFields },
        { new: true, runValidators: true }
    ).lean();

    if (!affiliate) {
        throw new ApiError(404, 'Affiliate not found');
    }

    res.status(200).json(
        new ApiResponse(
            200,
            {
                ...affiliate,
                id: affiliate._id,
                active: affiliate.isActive,
            },
            'Affiliate updated successfully'
        )
    );
});

// DELETE /api/admin/affiliates/:id
export const deleteAffiliate = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const affiliate = await Affiliate.findByIdAndDelete(id);
    if (!affiliate) {
        throw new ApiError(404, 'Affiliate not found');
    }

    res.status(200).json(new ApiResponse(200, null, 'Affiliate deleted successfully'));
});
