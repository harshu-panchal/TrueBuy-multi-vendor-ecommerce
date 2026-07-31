import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './src/models/Admin.model.js';
import connectDB from './src/config/db.js';

dotenv.config();

const resetPassword = async () => {
    try {
        await connectDB();
        const admin = await Admin.findOne({ email: 'admin@admin.com' });
        if (admin) {
            admin.password = 'Admin!@#123';
            await admin.save();
            console.log('Password updated successfully');
        } else {
            console.log('Admin not found');
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.connection.close();
    }
};

resetPassword();
