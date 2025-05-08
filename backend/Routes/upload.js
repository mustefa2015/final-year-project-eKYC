// upload.js

import express from "express";
import cloudinary from "cloudinary";
import multer from "multer";
import dotenv from "dotenv";

const router = express.Router();

dotenv.config();

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer setup for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", upload.single("file"), (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  // Upload the file to Cloudinary with transformations
  cloudinary.v2.uploader
    .upload_stream(
      {
        upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
        transformation: [
          { width: 300, height: 300, crop: "fill" }, // Adjust size as needed
        ],
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary error:", error);
          return res.status(500).json({ error: "Cloudinary upload failed" });
        }

        res.json({ secure_url: result.secure_url });
      }
    )
    .end(file.buffer);
});

export default router;
