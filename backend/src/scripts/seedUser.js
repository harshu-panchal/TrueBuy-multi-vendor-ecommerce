import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.model.js';

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error('❌ MONGO_URI not set in .env');
    process.exit(1);
}

const seedUser = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const email = 'user@example.com';
        const password = 'user123';
        const name = 'John Doe';

        const existing = await User.findOne({ email });

        if (existing) {
            existing.password = password;
            existing.name = name;
            existing.isVerified = true;
            existing.isActive = true;
            await existing.save();
            console.log(`✅ User credentials updated: ${email} / ${password}`);
        } else {
            await User.create({
                name,
                email,
                password,
                isVerified: true,
                isActive: true,
                role: 'customer'
            });
            console.log(`✅ User created: ${email} / ${password}`);
        }
    } catch (err) {
        console.error('❌ Seed failed:', err.message);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
        process.exit(0);
    }
};

seedUser();
