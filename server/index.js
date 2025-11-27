require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const pidRoutes = require('./routes/pidRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically (for debugging)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/pid', pidRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'AIMS Backend Server is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: true,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AIMS Backend Server running on port ${PORT}`);
  console.log(`📊 P&ID Processing API: http://localhost:${PORT}/api/pid`);
  console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
