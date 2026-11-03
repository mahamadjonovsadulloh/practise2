const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const customerRoutes = require('./routes/customerRoutes');
const orderRoutes = require('./routes/orderRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

// 1. Load environment variables
dotenv.config();

// 2. Initialize Express App
const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// 3. Security & Parser Middlewares
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true, // Allow cookies to be sent across origins
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 4. Static folder for uploaded files (images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 5. Health Check Endpoint
// Returns server status, database connection status, and current timestamp
app.get('/api/health', (req, res) => {
  const dbStatusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const dbState = mongoose.connection.readyState;

  res.status(200).json({
    status: 'ok',
    message: 'E-Commerce Backend API is active',
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatusMap[dbState] || 'unknown',
      readyState: dbState,
      name: mongoose.connection.name || null,
    },
    environment: process.env.NODE_ENV || 'development',
  });
});

// Root friendly welcome endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Full-Stack E-Commerce API',
    healthCheck: '/api/health',
    version: '1.0.0',
  });
});

// 6. Application REST API Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);

// 7. Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

// 8. Connect to MongoDB and Start Server
// The server starts only after validating MongoDB connection
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}`);
      console.log(`📡 Health endpoint available at: http://localhost:${PORT}/api/health`);
      console.log(`📦 Catalog endpoints at: /api/products, /api/categories`);
      console.log(`👥 Customer & Order endpoints at: /api/customers, /api/orders`);
    });
  } catch (error) {
    console.error('❌ Failed to start server due to database connection error.');
    console.error(error.message);
    process.exit(1);
  }
};

startServer();
