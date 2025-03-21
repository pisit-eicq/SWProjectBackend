const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt= require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config({path:'../config/config.env'});
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please add a username']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        index: true, // Added index for faster email lookups
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please add a valid email'
        ]
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now
    },
    banned: { // Add the 'banned' field
        type: Boolean,
        default: false // Users are not banned by default
    }
});

UserSchema.pre('save',async function(next){
    if (!this.isModified('password')) { // Only hash password if it's modified
        next();
        return;
    }
    const salt =await bcrypt.genSalt(10);
    this.password=await bcrypt.hash(this.password,salt);
});

UserSchema.methods.getSignedJwtToken=function(){
    return jwt.sign({id:this._id},process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRE
    });
}
UserSchema.methods.matchPassword=async function(enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password);
}
module.exports = mongoose.model('User',UserSchema);