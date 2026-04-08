const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const passportLocalMongoose = require('passport-local-mongoose').default;

// User schema defines how user data is stored in MongoDB.
const userSchema = new Schema({
    // Username and password will be added by passport-local-mongoose plugin.
  email:{
    type: String,
    required: true,
    unique: true
  }
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);