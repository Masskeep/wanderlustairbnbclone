// Import core libraries and project files.
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const engine = require('ejs-mate');
const path = require('path');
const methodOverride = require('method-override');
const wrapAsync = require('./utils/wrapasync');
const expressError = require('./utils/expresserror');
const listingRouter = require('./routes/listing');
const reviewRouter = require('./routes/review');
const expressSession = require('express-session');
const connectflash = require('connect-flash');
const localPassport = require('passport-local');
const User = require('./models/user');
const passport = require('passport');
const { setCurrentUser } = require('./middleware');

const userRouter = require('./routes/user');

// Configure Passport.js for user authentication.

// Configure session management for flash messages and user sessions.
app.use(expressSession({
    secret: 'wanderlustsecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1 week
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localPassport(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(connectflash());
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});
app.use(setCurrentUser);


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

// Mount listing routes.
app.use('/listings', listingRouter);

// Mount review routes (nested under listings).
app.use('/listings/:id/reviews', reviewRouter);
app.use('/', userRouter);

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
app.use((req, res, next) => {
    next(new expressError('Page Not Found', 404));
});

// Global error handler: catch all errors and send status code + message.

app.use((err, req, res, next) => {
    const { statusCode = 500, message = 'Something went wrong. Please try again.' } = err;
    res.status(statusCode).render('error', { statusCode, message, navAction: null });
});

app.listen(8080, () => {
    // Start HTTP server on localhost:8080.
    console.log('Server is running on port 8080');
});