require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const integrationRoutes = require('./src/routes/integrationRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ==================== MIDDLEWARE ====================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ==================== DATABASE CONNECTION ====================
connectDB();

// ==================== ROUTES ====================
app.get('/', (req, res) => {
  res.json({
    message: '🚀 HR Data Middleware API',
    version: '1.0.0',
    status: 'operational',
    endpoints: {
      upload: 'POST /api/upload',
      stats: 'GET /api/stats',
    },
  });
});

app.use('/api', integrationRoutes);

// ==================== ERROR HANDLING ====================
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// ==================== SERVER START ====================
app.listen(PORT, () => {
  console.log(`\n🌟 ================================`);
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 API: http://localhost:${PORT}`);
  console.log(`🌟 ================================\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('⚠️ SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});
