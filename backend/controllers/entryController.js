const MilkEntry = require('../models/MilkEntry');
const Supplier = require('../models/Supplier');
const Rate = require('../models/Rate');

// Calculate rate from database
const calculateRateFromDB = async (degree, fat) => {
    try {
        let rateData;
        
        if (!fat || fat === null || fat === '') {
            rateData = await Rate.findOne({ degree: degree, fat: null });
        } else {
            const roundedFat = Math.round(fat * 10) / 10;
            rateData = await Rate.findOne({ degree: degree, fat: roundedFat });
        }
        
        if (!rateData) {
            return { rate: 0, error: `Rate not found for Degree ${degree}${fat ? ` + ${fat}%` : ''}`, method: null };
        }
        
        return { rate: rateData.rate, error: null, method: fat ? "New Method (Degree + Fat%)" : "Old Method (Degree only)" };
    } catch (error) {
        console.error('Rate calculation error:', error);
        return { rate: 0, error: error.message, method: null };
    }
};

// Add milk entry
const addEntry = async (req, res) => {
    try {
        const { supplierCustomId, degree, fat, quantity, date } = req.body;
        
        console.log('=== ADDING MILK ENTRY ===');
        console.log('Supplier ID:', supplierCustomId);
        console.log('Degree:', degree);
        console.log('Fat:', fat);
        console.log('Quantity:', quantity);
        
        const supplier = await Supplier.findOne({ supplierId: supplierCustomId });
        if (!supplier) {
            return res.status(404).json({ success: false, message: 'Supplier not found with this ID' });
        }
        
        const rateResult = await calculateRateFromDB(parseFloat(degree), fat ? parseFloat(fat) : null);
        if (rateResult.error) {
            return res.status(400).json({ success: false, message: rateResult.error });
        }
        
        const rate = rateResult.rate;
        const total = rate * parseFloat(quantity);
        const method = rateResult.method;
        
        console.log(`Rate: ${rate}, Total: ${total}, Method: ${method}`);
        
        const entry = new MilkEntry({
            supplierCustomId: supplier.supplierId,
            supplierName: supplier.name,
            degree: parseFloat(degree),
            fat: fat ? parseFloat(fat) : null,
            quantity: parseFloat(quantity),
            rate,
            total,
            date: date || new Date().toISOString().split('T')[0],
            method
        });
        
        await entry.save();
        console.log('Milk entry saved');
        
        // UPDATE SUPPLIER BALANCE - Add to balance
        const currentBalance = supplier.balance || 0;
        const newBalance = currentBalance + total;
        supplier.balance = newBalance;
        await supplier.save();
        
        console.log(`💰 Balance updated: ${currentBalance} → ${newBalance} (+${total})`);
        
        res.json({
            success: true,
            message: 'Milk entry saved successfully',
            entry: {
                rate,
                total,
                method
            },
            newBalance: newBalance
        });
    } catch (error) {
        console.error('Error in addEntry:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get entries by date
const getEntriesByDate = async (req, res) => {
    try {
        const { date } = req.params;
        const entries = await MilkEntry.find({ date }).sort({ createdAt: -1 });
        
        const totalMilk = entries.reduce((sum, e) => sum + e.quantity, 0);
        const totalAmount = entries.reduce((sum, e) => sum + e.total, 0);
        
        res.json({
            success: true,
            entries,
            summary: { totalMilk, totalAmount }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get entries by month
const getEntriesByMonth = async (req, res) => {
    try {
        const { yearMonth } = req.params;
        const entries = await MilkEntry.find({
            date: { $regex: `^${yearMonth}` }
        }).sort({ date: -1 });
        
        const supplierSummary = {};
        entries.forEach(entry => {
            if (!supplierSummary[entry.supplierName]) {
                supplierSummary[entry.supplierName] = {
                    supplierId: entry.supplierCustomId,
                    totalMilk: 0,
                    totalAmount: 0
                };
            }
            supplierSummary[entry.supplierName].totalMilk += entry.quantity;
            supplierSummary[entry.supplierName].totalAmount += entry.total;
        });
        
        const totalMilk = entries.reduce((sum, e) => sum + e.quantity, 0);
        const totalAmount = entries.reduce((sum, e) => sum + e.total, 0);
        
        res.json({
            success: true,
            entries,
            supplierSummary,
            summary: { totalMilk, totalAmount }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get today's entries
const getTodayEntries = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const entries = await MilkEntry.find({ date: today }).sort({ createdAt: -1 }).limit(10);
        
        const totalMilk = entries.reduce((sum, e) => sum + e.quantity, 0);
        const totalAmount = entries.reduce((sum, e) => sum + e.total, 0);
        
        res.json({
            success: true,
            entries,
            summary: { totalMilk, totalAmount }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get ALL entries
const getAllEntries = async (req, res) => {
    try {
        const entries = await MilkEntry.find().sort({ date: -1, createdAt: -1 });
        
        const totalMilk = entries.reduce((sum, e) => sum + e.quantity, 0);
        const totalAmount = entries.reduce((sum, e) => sum + e.total, 0);
        
        res.json({
            success: true,
            entries,
            summary: { totalMilk, totalAmount }
        });
    } catch (error) {
        console.error('Get all entries error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get entries by supplier ID
const getEntriesBySupplier = async (req, res) => {
    try {
        const { supplierId } = req.params;
        const entries = await MilkEntry.find({ supplierCustomId: supplierId }).sort({ date: -1, createdAt: -1 });
        
        const totalMilk = entries.reduce((sum, e) => sum + e.quantity, 0);
        const totalAmount = entries.reduce((sum, e) => sum + e.total, 0);
        
        res.json({
            success: true,
            entries,
            summary: { totalMilk, totalAmount }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    addEntry,
    getEntriesByDate,
    getEntriesByMonth,
    getTodayEntries,
    getAllEntries,
    getEntriesBySupplier
};