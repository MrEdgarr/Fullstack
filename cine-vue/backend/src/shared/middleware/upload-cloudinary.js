const cloudinary = require("../config/cloudinary");
const multer = require("multer");

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadToCloudinary = async (file, folder = "cinema") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `cinema/${folder}`,
        resource_type: "auto",
        transformation: [{ width: 1200, crop: "limit" }],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      },
    );

    uploadStream.end(file.buffer);
  });
};

module.exports = { upload, uploadToCloudinary };
