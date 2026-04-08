const mongoose = require('mongoose');

const Schema = mongoose.Schema;


// Review schema defines how each review is stored in MongoDB.
const reviewSchema = new Schema({
    // Rating is numeric so we can calculate averages later.
    rating: { type: Number, required: true, min: 1, max: 5 },

    // Text content of the review.
    comment: { type: String, required: true },

    // Reference to the listing being reviewed.
    listing: { type: Schema.Types.ObjectId, ref: 'Listing', required: true },
   //crateadAt field to store the date and time when the review was created.
    createdAt: { type: Date, default: Date.now }

});

// Create model from schema.
const Review = mongoose.model('Review', reviewSchema);

// Export model for use in routes.
module.exports = Review;    