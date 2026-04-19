const express = require('express');
const router = express.Router();
const Rate = require('../models/Rate');

// GET all rates
router.get('/', async (req, res) => {
    try {
        const rates = await Rate.find().sort({ degree: 1, fat: 1 });
        res.json({ success: true, rates });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST - Add new rate (FIXED - includes method field)
router.post('/', async (req, res) => {
    try {
        const { degree, fat, rate, method } = req.body;
        
        console.log('POST /api/rates - Received:', { degree, fat, rate, method });
        
        // Validation
        if (!degree || !rate) {
            return res.status(400).json({ 
                success: false, 
                message: 'Degree and Rate are required' 
            });
        }
        
        if (!method || (method !== 'old' && method !== 'new')) {
            return res.status(400).json({ 
                success: false, 
                message: 'Method is required (must be "old" or "new")' 
            });
        }
        
        if (degree < 26 || degree > 34) {
            return res.status(400).json({ 
                success: false, 
                message: 'Degree must be between 26 and 34' 
            });
        }
        
        // For new method, fat is required
        if (method === 'new' && (fat === undefined || fat === null || fat === '')) {
            return res.status(400).json({ 
                success: false, 
                message: 'Fat% is required for New Method' 
            });
        }
        
        // Check if rate already exists based on method
        let existing;
        if (method === 'old') {
            existing = await Rate.findOne({ degree, method: 'old' });
        } else {
            existing = await Rate.findOne({ degree, fat, method: 'new' });
        }
        
        if (existing) {
            return res.status(400).json({ 
                success: false, 
                message: `Rate for Degree ${degree}${fat ? ` + ${fat}%` : ''} (${method} method) already exists` 
            });
        }
        
        // Create new rate with method field
        const newRate = new Rate({ 
            degree, 
            fat: method === 'old' ? null : fat, 
            rate,
            method  // IMPORTANT: Save the method
        });
        
        await newRate.save();
        
        console.log('Rate saved:', newRate);
        
        res.json({ 
            success: true, 
            message: 'Rate added successfully', 
            rate: newRate 
        });
    } catch (error) {
        console.error('POST error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT - Update a rate
router.put('/:id', async (req, res) => {
    try {
        const { rate } = req.body;
        
        if (!rate || rate < 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Valid rate is required' 
            });
        }
        
        const updatedRate = await Rate.findByIdAndUpdate(
            req.params.id,
            { rate },
            { new: true }
        );
        
        if (!updatedRate) {
            return res.status(404).json({ success: false, message: 'Rate not found' });
        }
        
        res.json({ success: true, message: 'Rate updated successfully', rate: updatedRate });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE - Remove a rate
router.delete('/:id', async (req, res) => {
    try {
        const deletedRate = await Rate.findByIdAndDelete(req.params.id);
        if (!deletedRate) {
            return res.status(404).json({ success: false, message: 'Rate not found' });
        }
        res.json({ success: true, message: 'Rate deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST - Reset to default rates (FIXED - includes method field)
router.post('/reset', async (req, res) => {
    try {
        await Rate.deleteMany({});
        
        const defaultRates = [
            // Old Method rates (degree only)
            { degree: 26, fat: null, rate: 30, method: 'old' },
            { degree: 27, fat: null, rate: 48, method: 'old' },
            { degree: 28, fat: null, rate: 54, method: 'old' },
            { degree: 29, fat: null, rate: 60, method: 'old' },
            { degree: 30, fat: null, rate: 66, method: 'old' },
            { degree: 31, fat: null, rate: 72, method: 'old' },
            { degree: 32, fat: null, rate: 78, method: 'old' },
            { degree: 33, fat: null, rate: 84, method: 'old' },
            { degree: 34, fat: null, rate: 90, method: 'old' },
            
            // New Method rates (degree + fat%)
            { degree: 26, fat: 5, rate: 40, method: 'new' },
            { degree: 28, fat: 5, rate: 50, method: 'new' },
            { degree: 30, fat: 5, rate: 66, method: 'new' },
        ];
        
        await Rate.insertMany(defaultRates);
        
        res.json({ success: true, message: 'Rates reset to default successfully' });
    } catch (error) {
        console.error('Reset error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;