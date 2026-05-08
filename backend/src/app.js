import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

// Route imports
import publicRoutes from './routes/public.routes.js';
import userRoutes from './modules/user/routes/user.routes.js';
import adminRoutes from './modules/admin/routes/admin.routes.js';
import vendorRoutes from './modules/vendor/routes/vendor.routes.js';
import deliveryRoutes from './modules/delivery/routes/delivery.routes.js';
import returnRoutes from './modules/returns/routes/return.routes.js';
import exchangeRoutes from './modules/exchange/routes/exchange.routes.js';
import b2bRoutes from './modules/b2b/routes/b2b.routes.js';

// Middleware imports
import { apiLimiter } from './middlewares/rateLimiter.js';
import errorHandler from './middlewares/errorHandler.js';
import notFound from './middlewares/notFound.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsRoot = path.resolve(__dirname, '../uploads');
const deliveryDocsRoot = path.resolve(uploadsRoot, 'delivery-docs');
const jwtSecret = process.env.JWT_SECRET;

const allowedOrigins = String(process.env.CORS_ORIGIN || process.env.CLIENT_URL || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

const isValidDeliveryDocToken = (relativePath, rawToken) => {
    if (!jwtSecret) return false;
    if (!rawToken) return false;
    const [expRaw, providedSignature] = String(rawToken).split('.');
    const exp = Number(expRaw);
    if (!Number.isFinite(exp) || exp <= Date.now() || !providedSignature) return false;

    const payload = `${relativePath}|${exp}`;
    const expectedSignature = crypto
        .createHmac('sha256', jwtSecret)
        .update(payload)
        .digest('hex');

    if (providedSignature.length !== expectedSignature.length) return false;
    return crypto.timingSafeEqual(Buffer.from(providedSignature), Buffer.from(expectedSignature));
};

// ─── Security Middleware ─────────────────────────────────────────────────────
app.use(helmet());
app.use(mongoSanitize());
app.set('trust proxy', process.env.TRUST_PROXY === 'true' ? 1 : 0);
app.use(cors({
    origin: '*',
}));

// ─── Body Parsing ────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Rate Limiting ───────────────────────────────────────────────────────────
app.use('/api', apiLimiter);

// ─── Health Check ────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
    });
});

// ─── API Routes ──────────────────────────────────────────────────────────────
app.use(
    '/uploads/delivery-docs',
    (req, res, next) => {
        const relativePath = `/uploads/delivery-docs${req.path}`;
        const token = req.query.docToken;
        if (!isValidDeliveryDocToken(relativePath, token)) {
            return res.status(403).json({ success: false, message: 'Access denied.' });
        }
        next();
    },
    express.static(deliveryDocsRoot, { fallthrough: false })
);

app.use(
    '/uploads',
    (req, res, next) => {
        if (req.path.startsWith('/delivery-docs/')) {
            return res.status(403).json({ success: false, message: 'Access denied.' });
        }
        next();
    },
    express.static(uploadsRoot)
);
app.use('/api', publicRoutes);            // Public: products, categories, brands, coupons, banners
app.use('/api', returnRoutes);            // Unified returns module: customer/vendor/admin/delivery workflows
app.use('/api', exchangeRoutes);           // Exchange workflows layered on top of returns/order flows
app.use('/api/user', userRoutes);         // Customer: auth, addresses, wishlist, reviews, orders
app.use('/api/admin', adminRoutes);       // Admin: auth, vendors, orders, catalog, analytics
app.use('/api/vendor', vendorRoutes);     // Vendor: auth, products, orders, earnings
app.use('/api/delivery', deliveryRoutes); // Delivery: auth, orders
app.use('/api/b2b', b2bRoutes);           // Vendor wholesale marketplace: products, cart, orders

// ─── Error Handling ──────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
