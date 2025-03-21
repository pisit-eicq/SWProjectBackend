const express = require('express');
const {createRestaurant,deleteRestaurant,getRestaurant,getRestaurants,updateRestaurant} = require('../controllers/restaurants');

//include other resource routers
const reservationRouter = require('./reservation');

const router = express.Router();
const {protect,authorize} = require('../middleware/auth');

//reroute into other resource routers
router.use('/:restaurantId/reservations/',reservationRouter);

router.route('/').get(getRestaurants).post(protect,authorize('admin'),createRestaurant);
router.route('/:id').get(getRestaurant).put(protect,authorize('admin'),updateRestaurant).delete(protect,authorize('admin'),deleteRestaurant);


module.exports = router;