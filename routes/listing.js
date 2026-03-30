const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner } = require("../middleware.js");

// Joi validation function with field-specific errors
const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        // Create field-specific error messages
        let fieldErrors = {};
        error.details.forEach((detail) => {
            let fieldPath = detail.path.join(".");
            // Remove 'listing.' prefix if present to get clean field name
            let fieldName = fieldPath.replace("listing.", "");
            fieldErrors[fieldName] = detail.message;
        });

        // Create a descriptive error message showing all field errors
        let errorMessages = Object.entries(fieldErrors)
            .map(([field, message]) => {
                return `${field}: ${message}`;
            })
            .join(", ");

        throw new ExpressError(400, errorMessages);
    } else {
        next();
    }
};

const multer = require('multer');
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

const listingController = require("../controllers/listing.js");

//Index Route
router
    .route("/")
    .get(wrapAsync(listingController.index))
    .post(
        isLoggedIn,
        upload.single('listing[image]'),
        validateListing,
        wrapAsync(listingController.createListing)
    );

//New Route
router.get("/new", isLoggedIn, listingController.renderNewForm);

//Search Route
router.get("/search", wrapAsync(listingController.searchDestinations));


router
    .route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put(
        isLoggedIn,
        isOwner,
        upload.single('listing[image]'),
        validateListing,
        wrapAsync(listingController.updateListing)
    )
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

//Edit Route
router.get(
    "/:id/edit",
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.renderEditForm)
);

module.exports = router;
