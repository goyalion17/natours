const express = require('express');
const {
  getAllReviews,
  createReview,
  deleteReview,
} = require('../controllers/reviewController');
const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

// POST /tour/234fgdfd/reviews
// GET /tour/234fgdfd/reviews
// POST /reviews

router
  .route('/')
  .get(getAllReviews)
  .post(protect, restrictTo('user'), createReview);

router.route('/:id').delete(deleteReview);

module.exports = router;
