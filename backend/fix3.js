import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import SubOrder from './src/models/SubOrder.model.js';

async function fix() {
    await mongoose.connect(process.env.MONGO_URI);
    
    const res = await SubOrder.updateOne(
        { subOrderId: 'ORD-B6TKEMDH-V1' }, 
        { $set: { deliveryDistanceKm: 5.7, deliveryEarnings: 105.5 } }
    );
    console.log('Fixed order ORD-B6TKEMDH-V1:', res);
    
    process.exit(0);
}

fix();
