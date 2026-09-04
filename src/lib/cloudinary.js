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

/**
 * Transforms a raw image or Cloudinary URL into an optimized 2K/1K seamless 3D tile texture URL.
 * Applies auto-format (f_auto), high quality (q_auto:best), and resolution constraints.
 * @param {string} url - Original image/texture URL
 * @param {object} options - Optional width, height, format settings
 * @returns {string} Optimized URL
 */
export function getOptimizedTextureUrl(url, options = {}) {
  if (!url) return '/textures/calacatta_gold.jpg';
  const width = options.width || 1024;
  const height = options.height || 1024;

  if (url.includes('res.cloudinary.com')) {
    // Inject Cloudinary transformations before '/upload/'
    const transformation = `f_auto,q_auto:best,w_${width},h_${height},c_fill,g_center/`;
    if (url.includes('/upload/') && !url.includes('/upload/f_auto')) {
      return url.replace('/upload/', `/upload/${transformation}`);
    }
  }
  return url;
}

export default cloudinary;

