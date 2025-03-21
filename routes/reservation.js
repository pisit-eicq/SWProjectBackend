const express = require('express');
const {
  addReservation,
  deleteReservation,
  getReservation,
  getReservations,
  updateReservation,
} = require('../controllers/reservations');

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require('../middleware/auth');

// Add the restaurantId parameter to the route
router
  .route('/')
  .get(protect, getReservations)
  .post(protect, authorize('admin', 'user'), addReservation);

// Add the restaurantId parameter to the route with ID
router
  .route('/:id')
  .get(protect, getReservation)
  .put(protect, authorize('admin', 'user'), updateReservation)
  .delete(protect, authorize('admin', 'user'), deleteReservation);

// Add restaurantId parameter to the beginning of the route.
router.route('/:restaurantId/').post(protect, authorize('admin','user'),addReservation);

module.exports = router;