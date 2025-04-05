import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Fix: Set proper storage parameters for image & video uploads
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folder = "uploads";
    let resource_type = file.mimetype.startsWith("image") ? "image" : "video";

    return {
      folder,
      resource_type,
      allowed_formats: ["jpg", "jpeg", "png", "svg", "mp4", "mov", "avi","webp"], // ✅ Add "svg" here
    };
  },
});



const upload = multer({ storage });

export default upload;
