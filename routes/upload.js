const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { r2Client, BUCKET_NAME, CUSTOM_DOMAIN } = require('../config/r2');
const { protect } = require('../middleware/auth');

// Set up memory storage for temporary file handling
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  // Accept image files (JPEG, JPG, PNG)
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, JPG, and PNG image files are allowed!'), false);
  }
};

// Set up multer with storage and file filter
const upload = multer({ 
  storage: storage, 
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  }
});

// Upload image route
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }
    
    // Generate unique filename
    const fileExtension = path.extname(req.file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;
    
    // Upload to Cloudflare R2
    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };
    
    await r2Client.send(new PutObjectCommand(uploadParams));
    
    // Generate custom URL using the domain
    const customUrl = `${CUSTOM_DOMAIN}/${fileName}`;
    
    // Generate a signed URL as fallback if needed
    const getCommand = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
    });
    
    const signedUrl = await getSignedUrl(r2Client, getCommand, { expiresIn: 604800 }); // 7 days in seconds
    
    res.status(200).json({
      success: true,
      message: 'File uploaded successfully to Cloudflare R2',
      url: customUrl,
      signedUrl: signedUrl, // Include signed URL as fallback
      key: fileName,
      originalname: req.file.originalname
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'An error occurred during upload'
    });
  }
});

// Delete image route
router.delete('/:key', protect, async (req, res) => {
  try {
    const key = req.params.key;
    
    // Validate key to prevent injection attacks
    if (!key || key.includes('..') || key.includes('/')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file key'
      });
    }
    
    // Delete from Cloudflare R2
    const deleteParams = {
      Bucket: BUCKET_NAME,
      Key: key,
    };
    
    await r2Client.send(new DeleteObjectCommand(deleteParams));
    
    res.status(200).json({
      success: true,
      message: 'File deleted successfully from Cloudflare R2'
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'An error occurred while deleting the file'
    });
  }
});

module.exports = router; 