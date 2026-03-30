const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Cloudinary will automatically pick up the CLOUDINARY_URL from the .env file
cloudinary.config();

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "majorproject_DEV",
        allowedFormats: ["png", "jpg", "jpeg"],
    },
});

module.exports = {
    cloudinary,
    storage,
};
