const Rental = require('../models/rental');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
    const rental = await Rental.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    rental.reviews.push(review);
    await review.save();
    await rental.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/rentals/${rental._id}`);
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Rental.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/rentals/${id}`);
}
