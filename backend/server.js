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
    'https://*.vercel.app'  // ADDED for Vercel deployment
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        
        // Check if origin matches any allowed pattern
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
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
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

// Health check endpoint for Vercel
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

// Connect to MongoDB (only if not in Vercel serverless environment)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    mongoose.connect(process.env.MONGODB_URI)
        .then(() => {
            console.log('✅ Connected to MongoDB Cloud (Atlas)');
            app.listen(PORT, () => {
                console.log(`🚀 Server running on port ${PORT}`);
                console.log(`📍 API available at http://localhost:${PORT}`);
                console.log('\n📋 Available endpoints:');
                console.log('   GET    /api/suppliers');
                console.log('   POST   /api/suppliers');
                console.log('   PUT    /api/suppliers/:id');
                console.log('   DELETE /api/suppliers/:id');
                console.log('   POST   /api/suppliers/verify');
                console.log('   POST   /api/entries');
                console.log('   GET    /api/entries/today');
                console.log('   GET    /api/entries/date/:date');
                console.log('   GET    /api/entries/month/:yearMonth');
                console.log('   GET    /api/entries/supplier/:supplierId');
                console.log('   GET    /api/rates');
                console.log('   POST   /api/rates');
                console.log('   PUT    /api/rates/:id');
                console.log('   DELETE /api/rates/:id');
                console.log('   POST   /api/rates/reset');
                console.log('   GET    /api/transactions');
                console.log('   POST   /api/transactions');
                console.log('   GET    /api/transactions/supplier/:supplierId\n');
            });
        })
        .catch((err) => {
            console.error('❌ MongoDB connection error:', err.message);
            process.exit(1);
        });
}

// For Vercel serverless - export the app
module.exports = app;