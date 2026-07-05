// POST /api/upload   multipart form field name: "images" (up to 4)
// Returns the Cloudinary URLs to plug into ForumPost.images before/with post creation.
exports.uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No images uploaded' });
    }

    const urls = req.files.map((file) => file.path); // multer-storage-cloudinary sets .path to the secure_url

    res.json({ urls });
  } catch (err) {
    res.status(500).json({ message: 'Failed to upload images', error: err.message });
  }
};