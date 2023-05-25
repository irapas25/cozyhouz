const express = require('express');
const router = express.Router();
const rentals = require('../controllers/rentals');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateRental } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const Rental = require('../models/rental');

router.route('/')
    .get(catchAsync(rentals.index))
    .post(isLoggedIn, upload.array('image'), validateRental, catchAsync(rentals.createRental))


router.get('/new', isLoggedIn, rentals.renderNewForm)

router.route('/:id')
    .get(catchAsync(rentals.showRental))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateRental, catchAsync(rentals.updateRental))
    .delete(isLoggedIn, isAuthor, catchAsync(rentals.deleteRental));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(rentals.renderEditForm))



module.exports = router;