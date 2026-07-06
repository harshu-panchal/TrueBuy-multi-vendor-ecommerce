import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import SubOrder from './src/models/SubOrder.model.js';

async function fix() {
    await mongoose.connect(process.env.MONGO_URI);
    const res = await SubOrder.updateMany(
        { status: 'delivered', deliveryDistanceKm: 0 }, 
        { $set: { deliveryDistanceKm: 1.3, deliveryEarnings: 39.5 } }
    );
    console.log('Fixed orders:', res);
    process.exit(0);
}

fix();
