const mongoose = require("mongoose");
const schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  price: Number,
  image: {
    filename: String,
    url: {
      type: String,
      default:
        "https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=2865&auto=format&fit=crop",
    },
  },
  gallery: [
    {
       filename: String,
       url: String
    }
  ],
  amenities: [
    {
      type: String,
      enum: ["Wifi", "Kitchen", "Pool", "Free Parking", "AC", "Washing Machine", "TV", "Iron", "Dedicated Workspace", "Self Check-in"]
    }
  ],
  houseRules: [String],
  location: String,
  country: String,
  maxGuests: {
    type: Number,
    default: 2,
  },
  category: {
    type: String,
    enum: ["Trending", "Rooms", "Iconic Cities", "Mountains", "Castles", "Amazing Pools", "Camping", "Farms", "Arctic", "Domes", "Boats"],
  },
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  geometry: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  status: {
    type: String,
    enum: ["Active", "Paused", "Draft"],
    default: "Active"
  }
});

listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
