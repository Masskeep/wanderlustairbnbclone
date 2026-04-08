const express = require('express');
const router = express.Router({ mergeParams: true });
const mongoose = require('mongoose');
const Review = require('../models/review');
const Listing = require('../models/listing');
const wrapAsync = require('../utils/wrapasync');
const expressError = require('../utils/expresserror');
const { reviewSchema } = require('../schema');

// Validation middleware to check incoming review data against Joi schema.
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(', ');
        throw new expressError(msg, 400);
    } else {
        next();
    }
};

const redirectListingNotFound = (req, res) => {
    req.flash('error', 'Listing does not exist.');
    return res.redirect('/listings');
};

// Create review route: saves the review and links it to the listing.
router.post('/', validateReview, wrapAsync(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return redirectListingNotFound(req, res);
    }

    const listing = await Listing.findById(req.params.id);
    if (!listing) {
        return redirectListingNotFound(req, res);
    }
    const review = new Review({ ...req.body.review, listing: listing._id });
    await review.save();
    listing.reviews.push(review._id);
    await listing.save();
    req.flash('success', 'Review added successfully.');
    res.redirect(`/listings/${listing._id}`);
}));

// Delete review route: removes a review and de-links it from the listing.
router.delete('/:reviewId', wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;

    if (!mongoose.isValidObjectId(id)) {
        return redirectListingNotFound(req, res);
    }

    const listing = await Listing.findById(id);

    if (!listing) {
        return redirectListingNotFound(req, res);
    }

    await Review.findByIdAndDelete(reviewId);
    listing.reviews.pull(reviewId);
    await listing.save();

    res.redirect(`/listings/${id}`);
}));

module.exports = router;