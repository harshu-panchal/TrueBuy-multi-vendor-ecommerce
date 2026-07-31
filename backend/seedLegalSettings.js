import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const SettingsSchema = new mongoose.Schema({
    type: { type: String, required: true },
    content: { type: mongoose.Schema.Types.Mixed, required: true }
});
const Settings = mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);

const userTerms = `Welcome to TrueBuy User Platform!

1. Account Registration
Users must provide accurate information when creating an account.

2. Purchasing Rules
All purchases are subject to availability. Prices may change without notice.

3. Returns and Refunds
Items must be returned within 14 days in original condition.

4. Account Security
You are responsible for keeping your password secure.`;

const vendorTerms = `Welcome to TrueBuy Vendor Platform!

1. Seller Obligations
Vendors must accurately list products and fulfill orders promptly.

2. Commission Fees
TrueBuy takes a standard platform commission on all successful sales as outlined in your vendor agreement.

3. Payouts
Payouts are processed weekly directly to your registered bank account.

4. Prohibited Items
Sellers must not list illegal, counterfeit, or prohibited items on the marketplace.`;

const deliveryTerms = `Welcome to TrueBuy Delivery Partner Platform!

1. Delivery Expectations
Partners are expected to deliver packages safely and on time.

2. Conduct
Partners must maintain professional conduct with all customers and vendors.

3. Earnings
Earnings are calculated per delivery distance and base fare as agreed upon signup.

4. Vehicle Requirements
Partners must maintain their vehicle in good condition and carry valid insurance.`;

const userPrivacy = `User Privacy Policy

1. Data Collection
We collect your name, email, and shipping address when you create an account or make a purchase.

2. Data Usage
We use your data to process orders and improve your shopping experience.

3. Data Sharing
We do not sell your personal data. We share necessary details (like your address) with delivery partners to fulfill your orders.`;

const vendorPrivacy = `Vendor Privacy Policy

1. Business Data
We collect your business registration details and bank account information for payouts.

2. Usage
This data is used to verify your business identity and facilitate your settlements.

3. Public Information
Your store name and products will be publicly visible to customers on the platform.`;

const deliveryPrivacy = `Delivery Partner Privacy Policy

1. Personal Information
We collect your personal details, driver's license, and vehicle information.

2. Location Data
We require access to your live location while on duty to dispatch orders and track deliveries.

3. Data Security
Your financial details for payouts are securely encrypted and never shared.`;

async function seedSettings() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB.');

        let settings = await Settings.findOne({ type: 'legal' });
        
        if (!settings) {
            settings = new Settings({ type: 'legal', content: {} });
        }
        
        if (!settings.content) settings.content = {};
        
        settings.content.termsConditions = {
            user: userTerms,
            vendor: vendorTerms,
            delivery: deliveryTerms
        };
        
        settings.content.privacyPolicy = {
            user: userPrivacy,
            vendor: vendorPrivacy,
            delivery: deliveryPrivacy
        };

        // Needs markModified because it's a Mixed type
        settings.markModified('content');
        await settings.save();
        
        console.log('Successfully seeded legal policies for all panels!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding settings:', error);
        process.exit(1);
    }
}

seedSettings();
