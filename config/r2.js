const { S3Client } = require('@aws-sdk/client-s3');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create and export an S3 client configured for Cloudflare R2
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
});

module.exports = {
  r2Client,
  BUCKET_NAME: process.env.CLOUDFLARE_R2_BUCKET_NAME,
  CUSTOM_DOMAIN: process.env.CLOUDFLARE_R2_CUSTOM_DOMAIN
}; 