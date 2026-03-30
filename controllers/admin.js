const Listing = require("../models/listing");
const User = require("../models/user");
const Booking = require("../models/booking");

module.exports.renderDashboard = async (req, res) => {
    // Fetch system-wide stats
    const totalListings = await Listing.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalBookings = await Booking.countDocuments();

    // Fetch recent data (limited)
    const recentListings = await Listing.find().sort({ _id: -1 }).limit(5).populate('owner');
    const recentUsers = await User.find().sort({ _id: -1 }).limit(5);

    // === ANALYTICS DATA FOR CHART.JS === //
    
    // 1. Revenue Over Time (Aggregating Confirmed Bookings)
    const allBookings = await Booking.find({ status: "Confirmed" });
    const revenueMap = {};
    let totalRevenue = 0;
    
    allBookings.forEach(booking => {
        totalRevenue += booking.price;
        // Group by Month (e.g. "Jan", "Feb")
        const month = booking.createdAt ? booking.createdAt.toLocaleString('default', { month: 'short' }) : 'Modern';
        revenueMap[month] = (revenueMap[month] || 0) + booking.price;
    });
    
    const revenueData = {
        labels: Object.keys(revenueMap), // ["Jan", "Feb", ...]
        data: Object.values(revenueMap)  // [5000, 12000, ...]
    };

    // 2. Listing Category Distribution
    const allListings = await Listing.find({}).select("category");
    const categoryMap = {};
    allListings.forEach(listing => {
        const cat = listing.category || "Uncategorized";
        categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });
    
    const categoryData = {
        labels: Object.keys(categoryMap),
        data: Object.values(categoryMap)
    };

    res.render("admin/dashboard.ejs", { 
        totalListings, 
        totalUsers, 
        totalBookings, 
        recentListings, 
        recentUsers,
        totalRevenue,
        revenueData: JSON.stringify(revenueData), // Pass to frontend as string
        categoryData: JSON.stringify(categoryData)
    });
};

module.exports.deleteListing = async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing deleted by Admin.");
    res.redirect("/admin");
};

module.exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    // Also delete user's listings and bookings? (Cascade delete usually handled in Schema hooks or here)
    // For now simple delete.
    req.flash("success", "User deleted by Admin.");
    res.redirect("/admin");
};

module.exports.renderUsers = async (req, res) => {
    const users = await User.find({});
    res.render("admin/users.ejs", { users });
};

module.exports.renderListings = async (req, res) => {
    const listings = await Listing.find({}).populate("owner");
    res.render("admin/listings.ejs", { listings });
};

module.exports.renderBookings = async (req, res) => {
    const bookings = await Booking.find({}).populate("user").populate("listing");
    res.render("admin/bookings.ejs", { bookings });
};
