const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Listing schema defines how each property is stored in MongoDB.
const listingSchema = new Schema({
    // Basic listing text fields.
    title: { type: String, required: true },
    description: { type: String, required: true },

    // Price is numeric so we can sort/filter later.
    price: { type: Number, required: true },

    // Location fields shown in card + detail pages.
    location: { type: String, required: true },

    // Store images as array so one listing can have multiple photos.
    images: { type: [String], 
        // If no image is provided, this default image will be used.
        default: ["https://images.unsplash.com/photo-1448630360428-65456885c650?q=80&w=1167&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"],

        // Setter normalizes incoming form data to always become an array.
        set: (v) => {
            // Empty value -> fallback to default image.
            if (!v || v === "") {
                return ["https://images.unsplash.com/photo-1448630360428-65456885c650?q=80&w=1167&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"];
            }

            // If already array, keep as-is.
            if (Array.isArray(v)) {
                return v;
            }

            // If comma-separated string, convert to array of URLs.
            if (typeof v === "string") {
                return v.split(",");
            }

            // Any other type is converted to string and wrapped.
            return [String(v)];
        }
    },
    country : { type: String, required: true },
    reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }]
});

// Create model from schema.
const Listing = mongoose.model('Listing', listingSchema);

// Export model for use in routes.
module.exports = Listing;