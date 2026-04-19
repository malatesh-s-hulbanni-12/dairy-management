const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const supplierRoutes = require('./routes/suppliers');
const entryRoutes = require('./routes/entries');
const rateRoutes = require('./routes/rates');
const transactionRoutes = require('./routes/transactions');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration - Allow multiple origins (including Vercel)
const allowedOrigins = [
    'http://localhost:5173', 
    'http://localhost:5174', 
    'http://127.0.0.1:5173', 
    'http://127.0.0.1:5174',
    'https://*.vercel.app'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        
        let allowed = false;
        for (const allowedOrigin of allowedOrigins) {
            if (allowedOrigin.includes('*')) {
                const regex = new RegExp('^' + allowedOrigin.replace('*', '.*') + '$');
                if (regex.test(origin)) {
                    allowed = true;
                    break;
                }
            } else if (allowedOrigin === origin) {
                allowed = true;
                break;
            }
        }
        
        if (!allowed) {
            console.log('Blocked origin:', origin);
            return callback(new Error('CORS not allowed'), false);
        }
        console.log('Allowed origin:', origin);
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('Request body:', req.body);
    }
    next();
});

// Routes
app.use('/api/suppliers', supplierRoutes);
app.use('/api/entries', entryRoutes);
app.use('/api/rates', rateRoutes);
app.use('/api/transactions', transactionRoutes);

// Root route
app.get('/', (req, res) => {
    res.json({ message: 'Dairy Milk Collection API is running' });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.method} ${req.url} not found` });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Global error:', err);
    res.status(500).json({ success: false, message: err.message });
});

// Connect to MongoDB - ALWAYS connect (even on Vercel)
const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            console.error('❌ MONGODB_URI is not defined in environment variables');
            return;
        }
        
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 30000
        });
        console.log('✅ Connected to MongoDB Cloud (Atlas)');
    } catch (err) {
        console.error('❌ MongoDB connection error:', err.message);
    }
};

// Monitor connection events
mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected');
});

// Call connectDB for both local and Vercel
connectDB();

// For local development server
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📍 API available at http://localhost:${PORT}`);
    });
}

// For Vercel serverless - export the app
module.exports = app;