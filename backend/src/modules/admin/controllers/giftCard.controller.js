import asyncHandler from '../../../utils/asyncHandler.js';
import ApiResponse from '../../../utils/ApiResponse.js';
import ApiError from '../../../utils/ApiError.js';
import GiftCard from '../../../models/GiftCard.model.js';

const generateGiftCardCode = () => {
    const part1 = Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase();
    const part2 = Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase();
    return `GC-${part1}-${part2}`;
};

// GET /api/admin/gift-cards
export const getAllGiftCards = asyncHandler(async (req, res) => {
    const { status, page = 1, limit = 20, search } = req.query;
    const numericPage = Number(page) || 1;
    const numericLimit = Number(limit) || 20;
    const skip = (numericPage - 1) * numericLimit;
    const filter = {};

    if (status && status !== 'all') {
        if (status === 'activated') filter.isActivated = true;
        if (status === 'deactivated') filter.isActivated = false;
    }

    if (search) {
        const regex = new RegExp(search, 'i');
        filter.$or = [
            { couponCode: regex },
            { recipientName: regex },
            { recipientEmail: regex },
            { senderName: regex },
            { senderEmail: regex },
        ];
    }

    const [giftCards, total] = await Promise.all([
        GiftCard.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(numericLimit)
            .lean(),
        GiftCard.countDocuments(filter),
    ]);

    res.status(200).json(new ApiResponse(200, {
        giftCards,
        total,
        page: numericPage,
        pages: Math.ceil(total / numericLimit),
    }, 'Gift cards fetched successfully.'));
});

// POST /api/admin/gift-cards
export const createGiftCard = asyncHandler(async (req, res) => {
    const { 
        couponCode, 
        type = 'Virtual', 
        initialValue, 
        isActivated = true,
        recipientName,
        recipientEmail,
        senderName,
        senderEmail,
        message,
        expiresAt
    } = req.body;

    if (!initialValue || Number(initialValue) <= 0) {
        throw new ApiError(400, 'Initial value must be greater than zero.');
    }

    const finalCode = (couponCode && couponCode.trim()) ? couponCode.trim().toUpperCase() : generateGiftCardCode();

    const existing = await GiftCard.findOne({ couponCode: finalCode });
    if (existing) {
        throw new ApiError(409, `Gift card code ${finalCode} already exists.`);
    }

    const giftCard = await GiftCard.create({
        couponCode: finalCode,
        type,
        initialValue: Number(initialValue),
        remainingAmount: Number(initialValue),
        isActivated: Boolean(isActivated),
        recipientName,
        recipientEmail,
        senderName,
        senderEmail,
        message,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        createdBy: req.user?.id || req.user?._id,
    });

    res.status(201).json(new ApiResponse(201, giftCard, 'Gift card created successfully.'));
});

// PATCH /api/admin/gift-cards/:id/status
export const updateGiftCardStatus = asyncHandler(async (req, res) => {
    const { isActivated } = req.body;
    const giftCard = await GiftCard.findById(req.params.id);
    if (!giftCard) throw new ApiError(404, 'Gift card not found.');

    giftCard.isActivated = Boolean(isActivated);
    await giftCard.save();

    res.status(200).json(new ApiResponse(200, giftCard, `Gift card ${giftCard.isActivated ? 'activated' : 'deactivated'} successfully.`));
});

// DELETE /api/admin/gift-cards/:id
export const deleteGiftCard = asyncHandler(async (req, res) => {
    const giftCard = await GiftCard.findByIdAndDelete(req.params.id);
    if (!giftCard) throw new ApiError(404, 'Gift card not found.');

    res.status(200).json(new ApiResponse(200, null, 'Gift card deleted successfully.'));
});
