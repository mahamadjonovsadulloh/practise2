const dns = require('dns');
const mongoose = require('mongoose');

// Configure public DNS servers fallback for Windows SRV record resolution
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {
  // Ignore if not supported in this runtime
}

/**
 * Connect to MongoDB Atlas.
 * Validates that MONGO_URI is defined and is not a local fallback.
 */
const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri || mongoUri.trim() === '') {
    console.error('====================================================');
    console.error('❌ MONGODB CONFIGURATION ERROR:');
    console.error('MONGO_URI is missing from your backend/.env file!');
    console.error('Please configure your MongoDB Atlas connection string:');
    console.error('MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority');
    console.error('====================================================');
    throw new Error('MONGO_URI environment variable is required.');
  }

  // Prevent accidental fallback to local MongoDB instance
  if (mongoUri.includes('localhost:27017') || mongoUri.includes('127.0.0.1:27017')) {
    console.error('====================================================');
    console.error('❌ MONGODB VALIDATION ERROR:');
    console.error('Localhost connection (localhost:27017) is not allowed.');
    console.error('Please provide a valid MongoDB Atlas connection string in backend/.env.');
    console.error('====================================================');
    throw new Error('Defaulting to localhost:27017 is prohibited. Please use MongoDB Atlas.');
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host} (DB: ${conn.connection.name})`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    if (error.message.includes('whitelist') || error.message.includes('Could not connect to any servers')) {
      console.error('👉 TIP: Ensure your current IP address is whitelisted in MongoDB Atlas:');
      console.error('   Network Access -> Add IP Address -> Allow Access From Anywhere (0.0.0.0/0)');
    }
    throw error;
  }
};

module.exports = connectDB;
