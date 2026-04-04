const Listing = require("../models/listing");
const Booking = require("../models/booking");
// Geoapify setup (no specific client needed, using native fetch)
if (!process.env.MAP_TOKEN) {
    console.warn("WARNING: MAP_TOKEN is missing in .env. Geocoding will be skipped.");
}

module.exports.index = async (req, res) => {
    const { q, category, minPrice, maxPrice, sort, checkIn, checkOut, adults, children, amenities, status } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = 9;
    const skip = (page - 1) * limit;

    let query = { $or: [{ status: "Active" }, { status: { $exists: false } }] }; // Show Active + legacy listings


    // 1. Algorithmic Availability Filter (Feature 3)
    if (checkIn && checkOut) {
        const requestedIn = new Date(checkIn);
        const requestedOut = new Date(checkOut);
        
        // Find all Bookings that conflict with this range
        const overlappingBookings = await Booking.find({
            status: { $ne: "Cancelled" },
            $or: [
                { checkIn: { $lt: requestedOut }, checkOut: { $gt: requestedIn } }
            ]
        }).select("listing");

        const busyListingIds = overlappingBookings.map(b => b.listing);
        query._id = { $nin: busyListingIds };
    }

    // 2. Capacity Constraints (maxGuests)
    const totalGuests = parseInt(adults || 0) + parseInt(children || 0);
    if (totalGuests > 0) {
        query.maxGuests = { $gte: totalGuests };
    }

    if (category && category !== "All") {
        query.category = category;
    }

    if (q) {
        // Use $and to combine text search with the existing status $or — avoids overwriting it
        query.$and = [
            { $or: [{ status: "Active" }, { status: { $exists: false } }] },
            { $or: [
                { title: { $regex: q, $options: "i" } },
                { location: { $regex: q, $options: "i" } },
                { country: { $regex: q, $options: "i" } }
            ]}
        ];
        // Remove the top-level $or since $and now handles status
        delete query.$or;
    }


    if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = parseInt(minPrice);
        if (maxPrice) query.price.$lte = parseInt(maxPrice);
    }

    // 3. Amenities Filter (Parametric Search)
    if (amenities) {
        const amenitiesArray = Array.isArray(amenities) ? amenities : [amenities];
        query.amenities = { $all: amenitiesArray };
    }

    let sortOption = { _id: -1 }; // Default: Newest
    if (sort === 'price_low') sortOption = { price: 1 };
    else if (sort === 'price_high') sortOption = { price: -1 };

    // Optimize with Promise.all and .lean() for faster DB execution
    const [totalListings, allListings, allListingsMap] = await Promise.all([
        Listing.countDocuments(query),
        Listing.find(query).sort(sortOption).skip(skip).limit(limit).lean(),
        Listing.find(query).select('title geometry price location image').lean()
    ]);
    const totalPages = Math.ceil(totalListings / limit);

    if (allListings.length === 0 && page === 1 && !req.query.mode) {
        if (category || q || minPrice || maxPrice || amenities) {
            req.flash("error", "No listings found matching your criteria.");
            return res.redirect("/listings");
        }
    }

    // Pass all query params for pagination links
    let queryString = `?`;
    if (q) queryString += `&q=${q}`;
    if (category) queryString += `&category=${category}`;
    if (minPrice) queryString += `&minPrice=${minPrice}`;
    if (maxPrice) queryString += `&maxPrice=${maxPrice}`;
    if (sort) queryString += `&sort=${sort}`;
    if (amenities) {
        const arr = Array.isArray(amenities) ? amenities : [amenities];
        arr.forEach(a => queryString += `&amenities=${a}`);
    }

    // JSON API response for infinite scroll or Map View Refresh
    if (req.query.mode === 'api') {
        return res.json({
            listings: allListings.map(l => ({
                _id: l._id,
                title: l.title,
                location: l.location,
                country: l.country,
                price: l.price,
                category: l.category,
                image: l.image,
                geometry: l.geometry,
            })),
            currentPage: page,
            totalPages,
            hasMore: page < totalPages,
            allListingsMap: allListingsMap, // Updated map markers too
        });
    }

    res.render("listings/index.ejs", {
        allListings,
        allListingsMap,
        currentPage: page,
        totalPages,
        category,
        q,
        queryString,
        mapToken: process.env.MAP_TOKEN
    });
};

module.exports.getByBounds = async (req, res) => {
    const { sw, ne, category } = req.query;
    if (!sw || !ne) return res.status(400).json({ error: "Bounds required" });

    const swCoords = sw.split(',').map(Number);
    const neCoords = ne.split(',').map(Number);

    let query = {
        status: "Active",
        geometry: {
            $geoWithin: {
                $box: [
                    [swCoords[1], swCoords[0]], // [lon, lat]
                    [neCoords[1], neCoords[0]]
                ]
            }
        }
    };

    if (category && category !== "All" && category !== "Trending") {
        query.category = category;
    }

    try {
        const listings = await Listing.find(query).select('title geometry price location image _id');
        res.json(listings);
    } catch (err) {
        res.status(500).json({ error: "Map discovery failed" });
    }
};

module.exports.searchDestinations = async (req, res) => {
    const { q } = req.query;
    if (!q || q.length < 1) {
        return res.json([]);
    }

    try {
        const results = await Listing.find({
            $or: [
                { title: { $regex: q, $options: "i" } },
                { location: { $regex: q, $options: "i" } },
                { country: { $regex: q, $options: "i" } }
            ]
        }).select("title location country image _id category").limit(8);

        res.json(results);
    } catch (err) {
        res.status(500).json({ error: "Search failed" });
    }
};

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs", { mapToken: process.env.MAP_TOKEN });
};

// Duplicate Import clean-up: Moving Booking to top of file for search algorithm support.
// module.exports.showListing already has access.

module.exports.showListing = async (req, res) => {
    let { id } = req.params;

    // Sanitize ID: Mobile share integrations sometimes append text directly to the URL route.
    // Since MongoDB ObjectIDs are strictly 24 hex characters, we truncate it.
    if (id && id.length > 24) {
        id = id.substring(0, 24);
    }

    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
            },
        })
        .populate("owner");

    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }

    // Mock orphaned listing owner to prevent EJS crashes if User was deleted
    if (!listing.owner) {
        listing.owner = {
            _id: listing._id,
            username: "StayNest Host",
            image: { url: "/images/default-user.jpg" }
        };
    }

    // Fetch confirmed bookings for this listing to block dates
    const bookings = await Booking.find({ listing: id, status: { $ne: "Cancelled" } }).select("checkIn checkOut");

    // Fetch Similar Listings
    const similarListings = await Listing.find({
        category: listing.category,
        _id: { $ne: listing._id }
    }).limit(3);

    res.render("listings/show.ejs", { listing, bookings, mapToken: process.env.MAP_TOKEN, similarListings });
};

module.exports.createListing = async (req, res, next) => {
    let response;

    try {
        const geoUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(req.body.listing.location)}&apiKey=${process.env.MAP_TOKEN}`;
        const result = await fetch(geoUrl);
        const data = await result.json();
        if (data.features && data.features.length > 0) {
            response = { body: data };
        }
    } catch (e) {
        console.error("Geocoding Error:", e);
    }

    // Handle different request formats
    let listingData;

    if (req.body.listing && typeof req.body.listing === "object") {
        // HTML form data or properly nested JSON: { listing: { title: "...", ... } }
        listingData = req.body.listing;
    } else if (
        req.body["listing[title]"] ||
        Object.keys(req.body).some((key) => key.startsWith("listing["))
    ) {
        // Form-urlencoded data: listing[title]=value, listing[price]=value, etc.
        listingData = {};
        for (let key in req.body) {
            if (key.startsWith("listing[") && key.endsWith("]")) {
                const fieldName = key.slice(8, -1); // Extract field name from listing[fieldName]
                listingData[fieldName] = req.body[key];
            }
        }
    } else {
        // Flat JSON data: { title: "...", price: "...", ... }
        listingData = req.body;
    }

    // Set image from file upload or use default
    if (req.file) {
        listingData.image = {
            url: req.file.path,
            filename: req.file.filename,
        };
    } else if (!listingData.image || listingData.image.trim() === "") {
        listingData.image = {
            url: "/images/placeholder.jpg",
            filename: "default",
        };
    } else {
        // Handle case where image was provided as text (backwards compatibility or specific flow)
        listingData.image = {
            url: listingData.image,
            filename: "userupload",
        };
    }

    const newListing = new Listing(listingData);
    newListing.owner = req.user._id;

    // Add geometry if available
    if (response) {
        newListing.geometry = response.body.features[0].geometry;
    } else {
        if (!process.env.MAP_TOKEN || process.env.MAP_TOKEN === "your_mapbox_access_token_here") {
            // Dummy data for dev
            newListing.geometry = { type: 'Point', coordinates: [77.209, 28.6139] };
        }
    }

    await newListing.save();
    req.flash("success", "New Listing Created!");

    // Send JSON response for API requests, redirect for form submissions
    if (
        req.get("Content-Type") &&
        req.get("Content-Type").includes("application/json")
    ) {
        res.status(201).json({
            success: true,
            message: "Listing created successfully",
            listing: newListing,
        });
    } else {
        res.redirect("/listings");
    }
};

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    res.render("listings/edit.ejs", { listing, originalImageUrl, mapToken: process.env.MAP_TOKEN });
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;

    // Handle different request formats
    let listingData;

    if (req.body.listing && typeof req.body.listing === "object") {
        // HTML form data or properly nested JSON
        listingData = req.body.listing;
    } else if (
        req.body["listing[title]"] ||
        Object.keys(req.body).some((key) => key.startsWith("listing["))
    ) {
        // Form-urlencoded data: listing[title]=value, listing[price]=value, etc.
        listingData = {};
        for (let key in req.body) {
            if (key.startsWith("listing[") && key.endsWith("]")) {
                const fieldName = key.slice(8, -1); // Extract field name from listing[fieldName]
                listingData[fieldName] = req.body[key];
            }
        }
    } else {
        // Flat JSON data
        listingData = req.body;
    }

    if (req.file) {
        listingData.image = {
            url: req.file.path,
            filename: req.file.filename,
        };
    }

    // Geocoding Logic for Update
    if (listingData.location) {
        let response;
        try {
            const geoUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(listingData.location)}&apiKey=${process.env.MAP_TOKEN}`;
            const result = await fetch(geoUrl);
            const data = await result.json();
            if (data.features && data.features.length > 0) {
                response = { body: data };
            }
        } catch (e) {
            console.error("Geocoding failed:", e.message);
        }

        if (response && response.body.features.length > 0) {
            listingData.geometry = response.body.features[0].geometry;
        } else if (!process.env.MAP_TOKEN || process.env.MAP_TOKEN === "your_mapbox_access_token_here") {
            // Fallback for Dev/Missing Token
            listingData.geometry = { type: 'Point', coordinates: [77.209, 28.6139] };
        }
    } else {
        // If location didn't change, we still need to ensure geometry exists if it was missing?
        // But we don't know if it's missing without fetching. 
        // We'll trust that existing docs match schema, or the update won't touch geometry.
        // However, runValidators checks the WHOLE doc.
        // If the doc is invalid, we must fix it.
        // Let's create a partial fix: If we are updating, we update.
        // We can't easily fix "existing" invalid data here without fetching first. 
    }

    let listing = await Listing.findByIdAndUpdate(id, listingData, {
        new: true,
        runValidators: true,
    });

    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }

    req.flash("success", "Listing Updated!");

    // Send JSON response for API requests, redirect for form submissions
    if (
        req.get("Content-Type") &&
        req.get("Content-Type").includes("application/json")
    ) {
        res.json({
            message: "Listing updated successfully",
        });
    } else {
        res.redirect(`/listings/${id}`);
    }
};

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    if (!deletedListing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};
