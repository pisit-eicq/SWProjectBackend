const express = require('express');
const {register,login, getMe,logout, banUser, unbanUser,getAllUsers} = require('../controllers/auth');

const router = express.Router();

const {protect, authorize} = require('../middleware/auth');

router.post('/register',register);
router.post('/login',login);
router.get('/me',protect,getMe);
router.get('/logout',logout);

// Admin ban/unban user routes
router.put('/users/:id/ban', protect, authorize('admin'), banUser);
router.put('/users/:id/unban', protect, authorize('admin'), unbanUser);
router.get('/users', protect, authorize('admin'), getAllUsers);


module.exports=router;