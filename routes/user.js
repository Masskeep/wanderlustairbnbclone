const express = require('express');
const router = express.Router();
const User = require('../models/user');
const passport = require('passport');

function isDuplicateUserError(err) {
	return err.name === 'UserExistsError' || err.code === 11000;
}

router.get('/signup', (req, res) => {
	res.render('user/signup', {
		navAction: '<a class="create-btn" href="/listings">Back to Listings</a>'
	});
});

router.get('/login', (req, res) => {
	res.render('user/login', {
		navAction: '<a class="create-btn" href="/listings">Back to Listings</a>'
	});
});

router.post('/signup', async (req, res) => {
	try {
		const { username, email, password } = req.body;
		const user = new User({ username, email });
		await User.register(user, password);
		req.flash('success', 'Account created successfully.');
		res.redirect('/listings');
	} catch (err) {
		if (isDuplicateUserError(err)) {
			req.flash('error', 'User already exists.');
		} else {
			req.flash('error', err.message);
		}
		res.redirect('/signup');
	}
});

router.post('/login', passport.authenticate('local', {
	failureRedirect: '/login',
	failureFlash: 'Invalid username or password.'
}), (req, res) => {
	req.flash('success', 'Welcome back!');
	res.redirect('/listings');
});

router.get('/logout', (req, res, next) => {
	req.logout((err) => {
		if (err) {
			return next(err);
		}

		req.flash('success', 'Signed out successfully.');
		res.redirect('/listings');
	});
});



module.exports = router;    