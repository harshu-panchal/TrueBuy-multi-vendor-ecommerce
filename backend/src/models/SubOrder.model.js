import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', index: true },
    name: String,
    image: String,
    price: Number,
    quantity: Number,
    variant: { type: mongoose.Schema.Types.Mixed, default: {} },
    variantKey: String,
});

const subOrderSchema = new mongoose.Schema(
    {
        subOrderId: { type: String, required: true, unique: true, index: true },
        parentOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
        vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true, index: true },
        vendorName: String,
        
        items: [orderItemSchema],
        
        subtotal: { type: Number, default: 0, min: 0 },
        shipping: { type: Number, default: 0, min: 0 },
        tax: { type: Number, default: 0, min: 0 },
        discount: { type: Number, default: 0, min: 0 },
        total: { type: Number, default: 0, min: 0 },
        
        status: {
            type: String,
            enum: ['pending', 'processing', 'assigned_for_delivery', 'ready', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'],
            default: 'pending',
            index: true,
        },
        
        // Delivery assignment fields (moved from main Order)
        deliveryBoyId: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryBoy', index: true, default: null },
        deliveryOtpHash: { type: String, select: false },
        deliveryOtpExpiry: { type: Date, select: false },
        deliveryOtpSentAt: { type: Date, select: false },
        deliveryOtpVerifiedAt: Date,
        deliveryOtpAttempts: { type: Number, default: 0, select: false },
        
        // Delivery calculations (locked at time of delivery)
        vendorPickupOtp: { 
            type: String, 
            default: () => Math.floor(100000 + Math.random() * 900000).toString(),
        },
        vendorPickupOtpVerifiedAt: Date,

        deliveryDistanceKm: { type: Number, default: 0 },
        deliveryEarnings: { type: Number, default: 0 },
        
        // Tracking
        trackingNumber: { type: String, unique: true, sparse: true },
        estimatedDelivery: Date,
        deliveredAt: Date,
        cancelledAt: Date,
        cancellationReason: String,
        
        // Addresses (frozen at checkout)
        pickupAddress: {
            street: String,
            city: String,
            state: String,
            zipCode: String,
            country: String,
            lat: Number,
            lng: Number,
        },
        dropoffAddress: {
            name: String,
            email: String,
            phone: String,
            address: String,
            city: String,
            state: String,
            zipCode: String,
            country: String,
            lat: Number,
            lng: Number,
        },

        statusTimeline: [
            {
                status: String,
                timestamp: { type: Date, default: Date.now },
                updatedBy: { type: mongoose.Schema.Types.ObjectId }, // User, Vendor, Admin, or DeliveryBoy
                updatedByType: { type: String, enum: ['User', 'Vendor', 'Admin', 'DeliveryBoy', 'System'] },
                note: String,
            }
        ],

        // OTP fields for Delivery
        vendorPickupOtp: { type: String },
        vendorPickupOtpVerifiedAt: { type: Date },
        deliveryOtpHash: { type: String, select: false },
        deliveryOtpExpiry: { type: Date, select: false },
        deliveryOtpSentAt: { type: Date, select: false },
        deliveryOtpAttempts: { type: Number, default: 0, select: false },
        deliveryOtpDebug: { type: String, select: false },
        deliveryOtpVerifiedAt: { type: Date },
    },
    { timestamps: true }
);

// Pre-save hook to add status timeline
subOrderSchema.pre('save', function (next) {
    if (this.isModified('status')) {
        this.statusTimeline.push({
            status: this.status,
            timestamp: new Date(),
            updatedByType: 'System' // Can be explicitly overridden in controllers
        });
    }
    next();
});

const SubOrder = mongoose.model('SubOrder', subOrderSchema);
export { SubOrder };
export default SubOrder;
