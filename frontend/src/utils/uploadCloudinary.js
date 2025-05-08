// cloudinaryConfig.js

const upload_preset = import.meta.env.VITE_UPLOAD_PRESET;
const cloud_name = import.meta.env.VITE_CLOUD_NAME;

const uploadImageToCloudinary = async (file) => {
  const uploadData = new FormData();

  uploadData.append("file", file);
  uploadData.append("upload_preset", upload_preset);

  // Add transformation parameters for square crop
  const transformation = {
    transformation: [
      { width: 300, height: 300, crop: "fill" }, // Adjust size as needed
    ],
  };

  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
      {
        method: "POST",
        body: uploadData,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        // Include the transformation parameters
        query: new URLSearchParams(transformation).toString(),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error.message || "Error uploading image");
    }

    return data; // Contains `url`, `public_id`, and other details
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error);
    throw error;
  }
};

export default uploadImageToCloudinary;
