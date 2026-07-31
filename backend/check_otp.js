import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Vendor from './src/models/Vendor.model.js';
import connectDB from './src/config/db.js';

dotenv.config();

const checkStatus = async () => {
    try {
        await connectDB();
        const vendor = await Vendor.findOne({ email: 'asifmansoori076@gmail.com' });
        if (vendor) {
            console.log('Is Verified?', vendor.isVerified);
            console.log('Status:', vendor.status);
        } else {
            console.log('Vendor not found');
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.connection.close();
    }
};

checkStatus();
