import asyncHandler from '../../../utils/asyncHandler.js';
import ApiResponse from '../../../utils/ApiResponse.js';
import Order from '../../../models/Order.model.js';
import User from '../../../models/User.model.js';
import Vendor from '../../../models/Vendor.model.js';
import Product from '../../../models/Product.model.js';

// GET /api/admin/analytics/dashboard
// GET /api/admin/analytics/dashboard
export const getDashboardStats = asyncHandler(async (req, res) => {
    const { period = 'month' } = req.query;
    const { startDate, endDate } = req.query;
    const activeOrderFilter = { isDeleted: { $ne: true } };

    const now = new Date();
    let currentStart;
    let previousStart;
    let previousEnd;

    // Define periods
    if (period === 'today') {
        currentStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        previousStart = new Date(currentStart);
        previousStart.setDate(previousStart.getDate() - 1);
        previousEnd = new Date(currentStart);
        previousEnd.setMilliseconds(-1);
    } else if (period === 'week') {
        const day = now.getDay() || 7;
        currentStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day + 1);
        previousStart = new Date(currentStart);
        previousStart.setDate(previousStart.getDate() - 7);
        previousEnd = new Date(currentStart);
        previousEnd.setMilliseconds(-1);
    } else if (period === 'year') {
        currentStart = new Date(now.getFullYear(), 0, 1);
        previousStart = new Date(now.getFullYear() - 1, 0, 1);
        previousEnd = new Date(now.getFullYear(), 0, 0, 23, 59, 59, 999);
    } else {
        // Default to Month
        currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
        previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        previousEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    }
    
    let currentRange = {};
    let prevRange = {};
    const isFiltered = !!(startDate && endDate);

    if (isFiltered) {
        const start = new Date(startDate);
        const end = new Date(new Date(endDate).setHours(23, 59, 59, 999));
        const duration = end.getTime() - start.getTime();
        
        const prevStart = new Date(start.getTime() - duration - 1);
        const prevEnd = new Date(start.getTime() - 1);

        currentRange = { $gte: start, $lte: end };
        prevRange = { $gte: prevStart, $lte: prevEnd };
    } else {
        // Default MoM logic if no dates provided
        const now = new Date();
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

        currentRange = { $gte: currentMonthStart };
        prevRange = { $gte: lastMonthStart, $lte: lastMonthEnd };
    }

    const [
        totalOrders, totalUsers, totalVendors, totalProducts, totalRevenueAgg, pendingOrders,
        totalDeliveryBoys,
        currPeriodOrders, prevPeriodOrders,
        currPeriodUsers, prevPeriodUsers,
        currPeriodProducts, prevPeriodProducts,
        currPeriodRevenueAgg, prevPeriodRevenueAgg
        totalOrdersCount, totalUsersCount, totalVendorsCount, totalProductsCount, lifetimeRevenueAgg, pendingOrders,
        periodOrders, prevPeriodOrders,
        periodUsers, prevPeriodUsers,
        periodProducts, prevPeriodProducts,
        periodRevenueAgg, prevPeriodRevenueAgg
    ] = await Promise.all([
        Order.countDocuments(activeOrderFilter),
        User.countDocuments({ role: 'customer' }),
        Vendor.countDocuments({ status: 'approved' }),
        Product.countDocuments({ isActive: true }),
        Order.aggregate([{ $match: { ...activeOrderFilter, status: { $ne: 'cancelled' } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
        Order.countDocuments({ ...activeOrderFilter, status: 'pending' }),
        User.countDocuments({ role: 'delivery' }),

        // Current Period stats
        Order.countDocuments({ ...activeOrderFilter, createdAt: { $gte: currentStart } }),
        Order.countDocuments({ ...activeOrderFilter, createdAt: { $gte: previousStart, $lte: previousEnd } }),
        User.countDocuments({ role: 'customer', createdAt: { $gte: currentStart } }),
        User.countDocuments({ role: 'customer', createdAt: { $gte: previousStart, $lte: previousEnd } }),
        Product.countDocuments({ isActive: true, createdAt: { $gte: currentStart } }),
        Product.countDocuments({ isActive: true, createdAt: { $gte: previousStart, $lte: previousEnd } }),
        
        // Period stats
        Order.countDocuments({ ...activeOrderFilter, createdAt: currentRange }),
        Order.countDocuments({ ...activeOrderFilter, createdAt: prevRange }),
        User.countDocuments({ role: 'customer', createdAt: currentRange }),
        User.countDocuments({ role: 'customer', createdAt: prevRange }),
        Product.countDocuments({ isActive: true, createdAt: currentRange }),
        Product.countDocuments({ isActive: true, createdAt: prevRange }),
        Order.aggregate([
            { $match: { ...activeOrderFilter, status: { $ne: 'cancelled' }, createdAt: { $gte: currentStart } } },
            { $match: { ...activeOrderFilter, status: { $ne: 'cancelled' }, createdAt: currentRange } },
            { $group: { _id: null, total: { $sum: '$total' } } }
        ]),
        Order.aggregate([
            { $match: { ...activeOrderFilter, status: { $ne: 'cancelled' }, createdAt: { $gte: previousStart, $lte: previousEnd } } },
            { $match: { ...activeOrderFilter, status: { $ne: 'cancelled' }, createdAt: prevRange } },
            { $group: { _id: null, total: { $sum: '$total' } } }
        ]),
    ]);

    const calculateChange = (current, previous) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return Number((((current - previous) / previous) * 100).toFixed(1));
    };

    const currRev = currPeriodRevenueAgg[0]?.total || 0;
    const prevRev = prevPeriodRevenueAgg[0]?.total || 0;
    const periodRev = periodRevenueAgg[0]?.total || 0;
    const prevRev = prevPeriodRevenueAgg[0]?.total || 0;

    res.status(200).json(new ApiResponse(200, {
        // Global totals (optional, can be filtered if needed)
        allTimeOrders: totalOrders,
        allTimeRevenue: totalRevenueAgg[0]?.total || 0,
        
        // Filtered stats for the cards
        totalOrders: currPeriodOrders,
        totalRevenue: currRev,
        totalCustomers: currPeriodUsers,
        totalProducts: currPeriodProducts,
        
        // Contextual info
        totalVendors,
        totalDeliveryBoys,
        // When filtered, return period-specific totals. Otherwise return lifetime totals.
        totalOrders: isFiltered ? periodOrders : totalOrdersCount,
        totalUsers: isFiltered ? periodUsers : totalUsersCount,
        totalVendors: totalVendorsCount,
        totalProducts: isFiltered ? periodProducts : totalProductsCount,
        totalRevenue: isFiltered ? periodRev : (lifetimeRevenueAgg[0]?.total || 0),
        
        pendingOrders,
        
        // Percentage changes
        ordersChange: calculateChange(currPeriodOrders, prevPeriodOrders),
        customersChange: calculateChange(currPeriodUsers, prevPeriodUsers),
        productsChange: calculateChange(currPeriodProducts, prevPeriodProducts),
        revenueChange: calculateChange(currRev, prevRev),
        
        // Compatibility
        totalUsers: currPeriodUsers
        ordersChange: calculateChange(periodOrders, prevPeriodOrders),
        customersChange: calculateChange(periodUsers, prevPeriodUsers),
        productsChange: calculateChange(periodProducts, prevPeriodProducts),
        revenueChange: calculateChange(periodRev, prevRev)
    }, 'Dashboard stats fetched.'));
});

// GET /api/admin/analytics/revenue
export const getRevenueData = asyncHandler(async (req, res) => {
    const { period = 'monthly', startDate, endDate } = req.query;
    const groupFormat = period === 'daily' ? '%Y-%m-%d' : period === 'weekly' ? '%Y-%U' : '%Y-%m';
    const match = { isDeleted: { $ne: true }, status: { $ne: 'cancelled' } };
    if (startDate || endDate) {
        match.createdAt = {};
        if (startDate) match.createdAt.$gte = new Date(startDate);
        if (endDate) match.createdAt.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
    }

    const pipeline = [
        { $match: match },
        { $group: { _id: { $dateToString: { format: groupFormat, date: '$createdAt' } }, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
    ];
    if (!startDate && !endDate) {
        pipeline.push({ $sort: { _id: -1 } }, { $limit: 12 });
    }
    pipeline.push({ $sort: { _id: 1 } });

    const revenue = await Order.aggregate(pipeline);

    res.status(200).json(new ApiResponse(200, revenue, 'Revenue data fetched.'));
});

// GET /api/admin/analytics/order-status
export const getOrderStatusBreakdown = asyncHandler(async (req, res) => {
    const breakdown = await Order.aggregate([
        { $match: { isDeleted: { $ne: true } } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
    ]);

    const result = breakdown.map(item => ({ status: item._id, count: item.count }));
    res.status(200).json(new ApiResponse(200, result, 'Order status breakdown fetched.'));
});

// GET /api/admin/analytics/top-products
export const getTopProducts = asyncHandler(async (req, res) => {
    const topProducts = await Order.aggregate([
        { $match: { isDeleted: { $ne: true }, status: { $ne: 'cancelled' } } },
        { $unwind: '$items' },
        { $group: { _id: '$items.productId', totalSold: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
        { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
        {
            $project: {
                name: { $ifNull: ['$product.name', 'Unknown Product'] },
                image: {
                    $ifNull: [{ $arrayElemAt: ['$product.images', 0] }, '$product.image']
                },
                totalSold: 1,
                revenue: 1
            }
        },
    ]);

    res.status(200).json(new ApiResponse(200, topProducts, 'Top products fetched.'));
});

// GET /api/admin/analytics/customer-growth
export const getCustomerGrowth = asyncHandler(async (req, res) => {
    const { period = 'monthly' } = req.query;
    const groupFormat = period === 'daily' ? '%Y-%m-%d' : period === 'weekly' ? '%Y-%U' : '%Y-%m';

    const growth = await User.aggregate([
        { $match: { role: 'customer' } },
        { $group: { _id: { $dateToString: { format: groupFormat, date: '$createdAt' } }, newUsers: { $sum: 1 } } },
        { $sort: { _id: -1 } },
        { $limit: 12 },
        { $sort: { _id: 1 } },
    ]);

    res.status(200).json(new ApiResponse(200, growth, 'Customer growth fetched.'));
});

// GET /api/admin/analytics/recent-orders
export const getRecentOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ isDeleted: { $ne: true } })
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();

    res.status(200).json(new ApiResponse(200, orders, 'Recent orders fetched.'));
});

// GET /api/admin/analytics/sales
export const getSalesData = asyncHandler(async (req, res) => {
    const { period = 'monthly', startDate, endDate } = req.query;
    const groupFormat = period === 'daily' ? '%Y-%m-%d' : period === 'weekly' ? '%Y-%U' : '%Y-%m';
    const match = { isDeleted: { $ne: true }, status: { $ne: 'cancelled' } };
    if (startDate || endDate) {
        match.createdAt = {};
        if (startDate) match.createdAt.$gte = new Date(startDate);
        if (endDate) match.createdAt.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
    }

    const pipeline = [
        { $match: match },
        { $group: { _id: { $dateToString: { format: groupFormat, date: '$createdAt' } }, sales: { $sum: '$total' }, orders: { $sum: 1 } } },
    ];
    if (!startDate && !endDate) {
        pipeline.push({ $sort: { _id: -1 } }, { $limit: 12 });
    }
    pipeline.push({ $sort: { _id: 1 } });

    const sales = await Order.aggregate(pipeline);

    res.status(200).json(new ApiResponse(200, sales, 'Sales data fetched.'));
});

// GET /api/admin/analytics/finance-summary
export const getFinancialSummary = asyncHandler(async (req, res) => {
    const { period = 'monthly', startDate, endDate } = req.query;
    const groupFormat = period === 'daily' ? '%Y-%m-%d' : period === 'weekly' ? '%Y-%U' : '%Y-%m';
    const match = { isDeleted: { $ne: true }, status: { $ne: 'cancelled' } };
    if (startDate || endDate) {
        match.createdAt = {};
        if (startDate) match.createdAt.$gte = new Date(startDate);
        if (endDate) match.createdAt.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
    }

    const pipeline = [
        { $match: match },
        {
            $group: {
                _id: { $dateToString: { format: groupFormat, date: '$createdAt' } },
                revenue: { $sum: '$total' },
                subtotal: { $sum: '$subtotal' },
                tax: { $sum: '$tax' },
                delivery: { $sum: '$shipping' },
                discount: { $sum: '$discount' },
                orders: { $sum: 1 }
            }
        },
    ];
    if (!startDate && !endDate) {
        pipeline.push({ $sort: { _id: -1 } }, { $limit: 12 });
    }
    pipeline.push({ $sort: { _id: 1 } });

    const summary = await Order.aggregate(pipeline);

    res.status(200).json(new ApiResponse(200, summary, 'Financial summary fetched.'));
});

// GET /api/admin/analytics/inventory-stats
export const getInventoryStats = asyncHandler(async (req, res) => {
    const [totalProducts, outOfStock, lowStock] = await Promise.all([
        Product.countDocuments(),
        Product.countDocuments({ stock: 'out_of_stock' }),
        Product.countDocuments({ stock: 'low_stock' })
    ]);

    res.status(200).json(new ApiResponse(200, {
        totalProducts,
        outOfStock,
        lowStock,
        activeProducts: await Product.countDocuments({ isActive: true })
    }, 'Inventory stats fetched.'));
});

// GET /api/admin/analytics/top-customers
export const getTopCustomers = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, search } = req.query;
    const numericPage = Number.parseInt(page, 10) || 1;
    const numericLimit = Number.parseInt(limit, 10) || 20;
    const skip = (numericPage - 1) * numericLimit;

    const match = { isDeleted: { $ne: true }, status: { $ne: 'cancelled' } };
    
    const topCustomers = await Order.aggregate([
        { $match: match },
        {
            $group: {
                _id: '$userId',
                orderTotal: { $sum: '$total' },
                ordersCount: { $sum: 1 },
                lastOrderDate: { $max: '$createdAt' }
            }
        },
        { $sort: { orderTotal: -1 } },
        { $skip: skip },
        { $limit: numericLimit },
        {
            $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'user'
            }
        },
        { $unwind: '$user' },
        {
            $project: {
                id: '$_id',
                email: '$user.email',
                name: '$user.name',
                active: '$user.isActive',
                lastActivity: '$lastOrderDate',
                ordersCount: 1,
                orderTotal: 1
            }
        }
    ]);

    res.status(200).json(new ApiResponse(200, topCustomers, 'Top customers fetched.'));
});

// GET /api/admin/analytics/registered-customers-count
export const getRegisteredCustomersCount = asyncHandler(async (req, res) => {
    const now = new Date();
    const periods = [
        { label: 'In the last 7 days', days: 7 },
        { label: 'In the last 14 days', days: 14 },
        { label: 'In the last month', days: 30 },
        { label: 'In the last year', days: 365 }
    ];

    const results = await Promise.all(periods.map(async (p) => {
        const date = new Date(now);
        date.setDate(date.getDate() - p.days);
        const count = await User.countDocuments({ 
            role: 'customer', 
            createdAt: { $gte: date } 
        });
        return { period: p.label, count };
    }));

    res.status(200).json(new ApiResponse(200, results, 'Registered customers count fetched.'));
});

// GET /api/admin/analytics/online-customers
export const getOnlineCustomers = asyncHandler(async (req, res) => {
    // Simulating online customers by returning most recent active customers
    // In a real app, this would use session tracking or websocket connections
    const onlineCustomers = await User.find({ role: 'customer', isActive: true })
        .sort({ updatedAt: -1 })
        .limit(20)
        .select('name email createdAt updatedAt')
        .lean();

    const formatted = onlineCustomers.map(user => ({
        id: user._id,
        customerInfo: user.name,
        customerNumber: user.email,
        active: true,
        ipAddress: '192.168.1.' + Math.floor(Math.random() * 255),
        location: 'India',
        lastActivity: user.updatedAt,
        createdOn: user.createdAt,
        lastVisitedPage: '/'
    }));

    res.status(200).json(new ApiResponse(200, formatted, 'Online customers fetched.'));
});
