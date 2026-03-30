// Import core libraries and project files.
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const engine = require('ejs-mate');
const path = require('path');
const methodOverride = require('method-override');
const Listing = require('./models/listing');

// Configure EJS-mate layout engine for templating.
app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'boilerplate');

// Configure static files and middleware.
app.use(express.static('public'));

// Parse JSON and HTML form bodies.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Allow HTML forms to simulate PUT/DELETE using ?_method=... or hidden _method field.
app.use(methodOverride('_method'));

// Connect to local MongoDB database.
async function main() {
    await mongoose.connect('mongodb://localhost:27017/wanderlust');
    console.log('Connected to MongoDB');
}

// Start database connection and log result.
main().then(() => {
    console.log('Database connection established');
}).catch(err => {
    console.error('Database connection error:', err);
});

// Home route: redirect users to the listings page.
app.get('/', (req, res) => {
    res.redirect('/listings');
});

// Index route: fetch all listings and render listing grid page.
app.get('/listings', async (req, res) => {
    try {
        const listings = await Listing.find({});
        res.render('listings', { listings, navAction: null });
    } catch (err) {
        console.error('Error fetching listings:', err);
        res.status(500).send('Unable to load listings right now.');
    }
});

// New route: show form for creating a listing.
app.get('/listings/new', (req, res) => {
    res.render('new', {
        navAction: '<a class="create-btn" href="/listings">Back to Listings</a>'
    });
});

// Edit route: show form for editing a listing.
app.get('/listings/:id/edit', async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);

        // Return 404 if ID exists in format but no document is found.
        if (!listing) {
            return res.status(404).send('Listing not found');
        }

        res.render('edit', {
            listing,
            navAction: `<a class="create-btn" href="/listings/${listing._id}">Back to Property</a>`
        });
    } catch (err) {
        console.error('Error fetching listing for edit:', err);
        res.status(500).send('Unable to load listing for editing right now.');
    }
});
// Create route: receive form data, save listing, then open its show page.
app.post('/listings', async (req, res) => {
    try {
        // Form fields are posted as listing[title], listing[price], etc.
        const listingData = req.body.listing || {};
        const listing = new Listing(listingData);
        await listing.save();

        // Redirect to the details page of the newly created listing.
        res.redirect(`/listings/${listing._id}`);
    } catch (err) {
        console.error('Error creating listing:', err);
        res.status(500).send('Unable to create listing right now.');
    }
});

// Update route: receive edited form data and update existing listing.
app.put('/listings/:id', async (req, res) => {
    try {
        const listingData = req.body.listing || {};
        const updatedListing = await Listing.findByIdAndUpdate(
            req.params.id,
            listingData,
            { runValidators: true, new: true }
        );

        if (!updatedListing) {
            return res.status(404).send('Listing not found');
        }

        res.redirect(`/listings/${updatedListing._id}`);
    } catch (err) {
        console.error('Error updating listing:', err);
        res.status(500).send('Unable to update listing right now.');
    }
});

// Delete route: remove a listing by ID and redirect to listings.
app.delete('/listings/:id', async (req, res) => {
    try {
        const deletedListing = await Listing.findByIdAndDelete(req.params.id);

        if (!deletedListing) {
            return res.status(404).send('Listing not found');
        }

        // Redirect back to listings after successful deletion.
        res.redirect('/listings');
    } catch (err) {
        console.error('Error deleting listing:', err);
        res.status(500).send('Unable to delete listing right now.');
    }
});

// Show route: display one listing by MongoDB ObjectId.
app.get('/listings/:id', async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);

        // Return 404 if ID exists in format but no document is found.
        if (!listing) {
            return res.status(404).send('Listing not found');
        }

        res.render('show', {
            listing,
            navAction: `<a class="edit-link" href="/listings/${listing._id}/edit">Edit property</a><a class="back-link" href="/listings">Back to listings</a>`
        });
    } catch (err) {
        console.error('Error fetching listing:', err);
        res.status(500).send('Unable to load listing right now.');
    }
});

// app.get('/listings', async (req, res) => {
//     try {
//         let sampleListing = new Listing({
//             title: "Sample Listing",
//             description: "This is a sample listing for testing.",
//             price: 100,
//             location: "Sample Location",
//             images: "",
//             country: "Sample Country"
//         });
//         await sampleListing.save();
//     } catch (err) {
//         console.error('Error fetching listings:', err);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// });

app.listen(8080, () => {
    // Start HTTP server on localhost:8080.
    console.log('Server is running on port 8080');
});