const Listing = require('./models/listing');
const Review = require('./models/review');
module.exports.isLoggedIn = (req, res, next) => {
    // Custom auth logic: Check if req.user is set by our app.js middleware
    if (!req.user) {
        req.session.returnTo = req.originalUrl;
        req.flash("error", "You must be logged in to access this!");
        return res.redirect("/login");
    }
    next();
};

module.exports.saveReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
};

module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!res.locals.currUser || !listing.owner.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not the owner of this listing!");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);
    if (!res.locals.currUser || !review.author.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not the author of this review!");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

module.exports.isAdmin = (req, res, next) => {
    if (!req.user || !req.user.isAdmin) {
        req.flash("error", "Access denied! Admins only.");
        return res.redirect("/listings");
    }
    next();
};
