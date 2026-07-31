import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { SubOrder } from '../models/SubOrder.model.js';

dotenv.config({ path: '.env' });

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const orders = await SubOrder.find({ status: 'delivered', deliveryEarnings: { $in: [0, null, undefined] } });
    let updated = 0;
    
    for (const order of orders) {
      // Old formula was baseFee + shipping. Base fee was hardcoded to 40.
      const earnings = 40 + (order.shipping || 0);
      order.deliveryEarnings = earnings;
      await order.save();
      updated++;
    }
    
    console.log('Migrated old deliveries to lock in historical earnings. Updated:', updated);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

run();
