require("dotenv").config();
const mongoose = require("mongoose");
const Listing = require("../models/listing");
const User = require("../models/user");

const dbUrl = process.env.ATLAS_URL || "mongodb://127.0.0.1:27017/wonderlust";

const indianProperties = [
    {
        title: "Luxury Beachfront Villa",
        description: "Wake up to the sound of crashing waves in this immaculate beachfront villa. Features a private infinity pool sunset deck.",
        price: 15000,
        location: "Candolim, Goa",
        country: "India",
        category: "Amazing Pools",
        geometry: { type: "Point", coordinates: [73.7661, 15.5188] },
        image: {
            filename: "goa_villa",
            url: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=1920&h=1080"
        }
    },
    {
        title: "Heritage Haveli Retreat",
        description: "Experience royal Rajasthani hospitality in a restored 18th-century Haveli with hand-painted frescoes and a central courtyard.",
        price: 8500,
        location: "Jaipur, Rajasthan",
        country: "India",
        category: "Iconic Cities",
        geometry: { type: "Point", coordinates: [75.7873, 26.9124] },
        image: {
            filename: "jaipur_haveli",
            url: "https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&q=80&w=1920&h=1080"
        }
    },
    {
        title: "Cloud Nine Tea Estate Bungalow",
        description: "Perched high in the Western Ghats, surrounded by endless rolling tea estates. Cozy fireplaces and antique colonial furniture.",
        price: 6000,
        location: "Munnar, Kerala",
        country: "India",
        category: "Mountains",
        geometry: { type: "Point", coordinates: [77.0595, 10.0889] },
        image: {
            filename: "munnar_tea",
            url: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&q=80&w=1920&h=1080"
        }
    },
    {
        title: "Royal Lakefront Palace Room",
        description: "Wake up to the shimmering views of Lake Pichola. Opulent interiors, classic archways, and a deep-soaking marble tub.",
        price: 24000,
        location: "Udaipur, Rajasthan",
        country: "India",
        category: "Castles",
        geometry: { type: "Point", coordinates: [73.6828, 24.5854] },
        image: {
            filename: "udaipur_palace",
            url: "https://images.unsplash.com/photo-1627894483216-2138af692e32?auto=format&fit=crop&q=80&w=1920&h=1080"
        }
    },
    {
        title: "Himalayan A-Frame Cabin",
        description: "A cozy, minimalist wooden A-frame nestled in towering pine forests with spectacular panoramic views of snow-capped peaks.",
        price: 4500,
        location: "Manali, Himachal Pradesh",
        country: "India",
        category: "Mountains",
        geometry: { type: "Point", coordinates: [77.1887, 32.2396] },
        image: {
            filename: "manali_cabin",
            url: "https://images.unsplash.com/photo-1521401830884-6c03c1c87ebb?auto=format&fit=crop&q=80&w=1920&h=1080"
        }
    },
    {
        title: "Luxury Desert Glamping",
        description: "Spend the night under a million stars in the magnificent Thar Desert. Premium air-conditioned tents with authentic folk music.",
        price: 9000,
        location: "Jaisalmer, Rajasthan",
        country: "India",
        category: "Camping",
        geometry: { type: "Point", coordinates: [70.9042, 26.9157] },
        image: {
            filename: "jaisalmer_camp",
            url: "https://images.unsplash.com/photo-1534880606858-29b0e8a24e8d?auto=format&fit=crop&q=80&w=1920&h=1080"
        }
    },
    {
        title: "Tranquil Backwater Houseboat",
        description: "Drift peacefully through palm-fringed backwaters on a traditional Kettuvallam perfectly outfitted with modern luxuries.",
        price: 12000,
        location: "Alleppey, Kerala",
        country: "India",
        category: "Boats",
        geometry: { type: "Point", coordinates: [76.3388, 9.4981] },
        image: {
            filename: "kerala_boat",
            url: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&q=80&w=1920&h=1080"
        }
    },
    {
        title: "Boutique French Quarter Studio",
        description: "Bright, airy bohemian studio located in the iconic White Town. Perfect for exploring the vibrant cafes and Promenade beach.",
        price: 3500,
        location: "Pondicherry",
        country: "India",
        category: "Trending",
        geometry: { type: "Point", coordinates: [79.8083, 11.9416] },
        image: {
            filename: "pondi_studio",
            url: "https://images.unsplash.com/photo-1505664063603-28e46ca404be?auto=format&fit=crop&q=80&w=1920&h=1080"
        }
    },
    {
        title: "Treehouse In The Jungle",
        description: "Unplug completely in this incredible treehouse suspended above the forest floor. Built sustainably without sacrificing comfort.",
        price: 7500,
        location: "Wayanad, Kerala",
        country: "India",
        category: "Camping",
        geometry: { type: "Point", coordinates: [76.0856, 11.6854] },
        image: {
            filename: "wayanad_tree",
            url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=1920&h=1080"
        }
    },
    {
        title: "Spiritual Ganges Retreat",
        description: "Find your inner peace in this sanctuary overlooking the holy Ganges. Daily yoga sessions and a strict vegetarian gourmet menu.",
        price: 5000,
        location: "Rishikesh, Uttarakhand",
        country: "India",
        category: "Trending",
        geometry: { type: "Point", coordinates: [78.3266, 30.0869] },
        image: {
            filename: "rishikesh_retreat",
            url: "https://images.unsplash.com/photo-1596700877906-e17f27af47a9?auto=format&fit=crop&q=80&w=1920&h=1080"
        }
    }
];

mongoose.connect(dbUrl)
    .then(() => {
        console.log("Connected to DB for Property Injection...");
        seedIndianData();
    })
    .catch((err) => console.log("DB Connection Error:", err));

async function seedIndianData() {
    try {
        // Fetch an admin user (or any user) to assign ownership
        const owner = await User.findOne({});
        
        if (!owner) {
            console.error("❌ Cannot seed listings: No users found in database to assign as owner.");
            process.exit();
        }

        // Apply ownership to all listings
        const mappedListings = indianProperties.map(listing => ({
            ...listing,
            owner: owner._id
        }));

        // Insert new listings directly (append rather than delete to keep user's existing stuff)
        const result = await Listing.insertMany(mappedListings);
        
        console.log(`✅ Success! Injected ${result.length} authentic Indian properties into the database.`);
    } catch (err) {
        console.error("❌ Error seeding properties:", err);
    } finally {
        mongoose.connection.close();
        process.exit();
    }
}
