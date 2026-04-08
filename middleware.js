const isLoggedIn = (req, res, next) => {
	if (!req.isAuthenticated()) {
		req.flash('error', 'You must log in first to create a listing.');
		return res.redirect('/login');
	}

	next();
};

const setCurrentUser = (req, res, next) => {
	res.locals.currentUser = req.user;
	next();
};

module.exports = {
	isLoggedIn,
	setCurrentUser
};