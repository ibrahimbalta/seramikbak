import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary using credentials from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

/**
 * Uploads a file (file path, base64 string, or remote URL) to Cloudinary.
 * @param {string} file - The file to upload.
 * @param {object} options - Custom Cloudinary upload options.
 * @returns {Promise<object>} Cloudinary API response.
 */
export async function uploadImage(file, options = {}) {
  try {
    const defaultOptions = {
      folder: 'seramikbak',
      resource_type: 'auto', // Auto-detect image vs other file types
    };
    const result = await cloudinary.uploader.upload(file, {
      ...defaultOptions,
      ...options,
    });
    return result;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
}

/**
 * Uploads a buffer directly to Cloudinary (useful for API routes handling file streams).
 * @param {Buffer} buffer - File buffer to upload.
 * @param {object} options - Custom Cloudinary upload options.
 * @returns {Promise<object>} Cloudinary API response.
 */
export async function uploadBuffer(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const defaultOptions = {
      folder: 'seramikbak',
      resource_type: 'auto',
    };
    const uploadStream = cloudinary.uploader.upload_stream(
      { ...defaultOptions, ...options },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
}

export default cloudinary;
