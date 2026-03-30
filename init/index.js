const mongoose = require('mongoose');

const data = require('./data');
const Listing = require('../models/listing');

const initDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/wanderlust');
        console.log('Connected to MongoDB');

        await Listing.deleteMany({});
        console.log('Existing listings cleared');

        await Listing.insertMany(data);
        console.log('Sample listings inserted successfully');
    } catch (err) {
        console.error('Error initializing database:', err);
    } finally {
        mongoose.connection.close();
    }
};

initDB();
