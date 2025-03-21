const User = require('../models/User');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

dotenv.config({path:'../config/config.env'});

//@desc Register user
//@route POST /api/v1/auth/register
//@access Public
exports.register=async (req,res,next)=>{
    try{
        const {username, email, password, role} = req.body;
        const user = await User.create({
            username,
            email,
            password,
            role
        });
        sendTokenResponse(user,200,res);
    }catch(err){
        res.status(400).json({success:false});
        console.log(err.stack);
    }
}

//@decs Login user
//@route POST/api/v1/auth/login
//@access Public
exports.login=async (req,res,next)=>{
    try{
    const {email, password} = req.body;
    console.log(email,password);
    //validate email and password
    if(!email || !password){
        return res.status(400).json({success:false,msg:'Please provide an email and password'});
    }
    //check
    const user = await User.findOne({email}).select('+password');
    if(!user){
        return res.status(400).json({success:false,msg:'Invalid credentials'});
    }

    // Check if user is banned
    if (user.banned) {
        return res.status(403).json({ success: false, message: 'This user account is banned.' });
    }

    //check if password math
    const isMatch = await user.matchPassword(password);
    if(!isMatch){
        return res.status(400).json({success:false,msg:'Invalid credentials'});
    }
    sendTokenResponse(user,200,res);
    }catch(err){
        console.log(err.stack);
        return res.status(401).json({success:false,msg:'Cannot convert email or password to string'});
    }
}

const sendTokenResponse=(user,statuscode,res)=>{
    //create token
    const token = user.getSignedJwtToken();

    const options = {
        expires:new Date(Date.now()+process.env.JWT_COOKIE_EXPIRE*24*60*60*1000),
        httpOnly:true
    };
    if(process.env.NODE_ENV === 'production'){
        options.secure=true;
    }
    res.status(statuscode).cookie('token',token,options).json({
        success:true,
        data:user,
        token
    })
}


//@desc Get current login user
//@route GET /api/v1/auth/me
//@access Private
exports.getMe=async (req,res,next)=>{
    const user = await User.findById(req.user.id);
    res.status(200).json({success:true,data:user});
};

//@desc Log user out / clear cookie
//@route Get /api/v1/auth/logout
//@access Private
exports.logout = async(req,res,next)=>{
    res.cookie('token','none',{
        expires : new Date(Date.now() + 10*1000),
        httpOnly:true
    });
    res.status(200).json({success:true,data:{}});
};

//@desc Ban a user
//@route PUT /api/v1/auth/users/:id/ban
//@access Private/Admin
exports.banUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { banned: true }, {
            new: true,
            runValidators: true
        });

        if (!user) {
            return res.status(404).json({ success: false, message: `No user found with id ${req.params.id}` });
        }

        res.status(200).json({ success: true, data: user, message: `User ${user.username} has been banned.` });

    } catch (err) {
        console.error(err); // Use console.error for errors
        return res.status(500).json({ success: false, message: 'Cannot ban user' });
    }
};


//@desc Unban a user
//@route PUT /api/v1/auth/users/:id/unban
//@access Private/Admin
exports.unbanUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { banned: false }, {
            new: true,
            runValidators: true
        });

        if (!user) {
            return res.status(404).json({ success: false, message: `No user found with id ${req.params.id}` });
        }

        res.status(200).json({ success: true, data: user, message: `User ${user.username} has been unbanned.` });

    } catch (err) {
        console.error(err); // Use console.error for errors
        return res.status(500).json({ success: false, message: 'Cannot unban user' });
    }
};