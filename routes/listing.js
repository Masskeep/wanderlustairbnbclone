const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Listing = require('../models/listing');
const wrapAsync = require('../utils/wrapasync');
const expressError = require('../utils/expresserror');
const { listingSchema } = require('../schema');
const { isLoggedIn } = require('../middleware');

// Validation middleware to check incoming listing data against Joi schema.
const validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
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

// Index route: fetch all listings and render listing grid page.
router.get('/', wrapAsync(async (req, res) => {
    const listings = await Listing.find({});
    res.render('listings', { listings, navAction: null });
}));

// New route: show form for creating a listing.
router.get('/new', isLoggedIn, (req, res) => {
    res.render('new', {
        navAction: '<a class="create-btn" href="/listings">Back to Listings</a>'
    });
});

// Edit route: show form for editing a listing.
router.get('/:id/edit', wrapAsync(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return redirectListingNotFound(req, res);
    }

    const listing = await Listing.findById(req.params.id);

    if (!listing) {
        return redirectListingNotFound(req, res);
    }

    res.render('edit', {
        listing,
        navAction: `<a class="create-btn" href="/listings/${listing._id}">Back to Property</a>`
    });
}));

// Create route: receive form data, save listing, then open its show page.
router.post('/', isLoggedIn, validateListing, wrapAsync(async (req, res) => {
    // Form fields are posted as listing[title], listing[price], etc.
    const listingData = req.body.listing || {};
    const listing = new Listing(listingData);
    await listing.save();

    req.flash('success', 'New listing created successfully.');
    res.redirect('/listings');
}));

// Update route: receive edited form data and update existing listing.
router.put('/:id', validateListing, wrapAsync(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return redirectListingNotFound(req, res);
    }

    const listingData = req.body.listing || {};
    const updatedListing = await Listing.findByIdAndUpdate(
        req.params.id,
        listingData,
        { runValidators: true, new: true }
    );

    if (!updatedListing) {
        return redirectListingNotFound(req, res);
    }

    res.redirect(`/listings/${updatedListing._id}`);
}));

// Delete route: remove a listing by ID and redirect to listings.
router.delete('/:id', wrapAsync(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return redirectListingNotFound(req, res);
    }

    const deletedListing = await Listing.findByIdAndDelete(req.params.id);

    if (!deletedListing) {
        return redirectListingNotFound(req, res);
    }

    req.flash('success', 'Property deleted successfully.');
    res.redirect('/listings');
}));

// Show route: display one listing by MongoDB ObjectId, with its reviews populated.
router.get('/:id', wrapAsync(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return redirectListingNotFound(req, res);
    }

    const listing = await Listing.findById(req.params.id).populate('reviews');

    if (!listing) {
        return redirectListingNotFound(req, res);
    }

    res.render('show', {
        listing,
        navAction: `<a class="edit-link" href="/listings/${listing._id}/edit">Edit property</a><a class="back-link" href="/listings">Back to listings</a>`
    });
}));

module.exports = router;
