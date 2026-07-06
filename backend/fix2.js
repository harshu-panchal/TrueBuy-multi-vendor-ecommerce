import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import SubOrder from './src/models/SubOrder.model.js';

async function fix() {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Update the specific order that had 3.7 km
    const res = await SubOrder.updateOne(
        { _id: '6a48ec938cae0df71556c047' }, 
        { $set: { deliveryDistanceKm: 3.7, deliveryEarnings: 75.5 } }
    );
    console.log('Fixed order 6a48ec938cae0df71556c047:', res);
    
    process.exit(0);
}

fix();
