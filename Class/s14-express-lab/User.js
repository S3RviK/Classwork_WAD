import mongoose from 'mongoose';

const USER_ROLES = ['user', 'admin', 'superuser'];

const userSchema = new mongoose.Schema(
    {
        username: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, enum: USER_ROLES, default: 'user' }
    }, 
    { timestamps: true, _strict: true }
);
 
export const User = mongoose.model('User', userSchema);