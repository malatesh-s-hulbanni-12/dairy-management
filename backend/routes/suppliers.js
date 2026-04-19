const express = require('express');
const router = express.Router();
const {
    getSuppliers,
    getSupplierByCustomId,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    verifySupplier  // ADD THIS
} = require('../controllers/supplierController');
const Supplier = require('../models/Supplier');
const MilkEntry = require('../models/MilkEntry');

// Make sure all functions are properly imported
console.log('Available functions:', { getSuppliers, getSupplierByCustomId, addSupplier, updateSupplier, deleteSupplier, verifySupplier });

router.get('/', getSuppliers);
router.get('/id/:id', getSupplierByCustomId);
router.post('/', addSupplier);
router.put('/:id', updateSupplier);
router.delete('/:id', deleteSupplier);
router.post('/verify', verifySupplier);  // ADD THIS ROUTE

// TEMPORARY: Fix existing supplier balances
router.post('/fix-balance', async (req, res) => {
    try {
        const suppliers = await Supplier.find();
        
        for (const supplier of suppliers) {
            const entries = await MilkEntry.find({ supplierCustomId: supplier.supplierId });
            
            let totalBalance = 0;
            for (const entry of entries) {
                totalBalance += entry.total;
            }
            
            const Transaction = require('../models/Transaction');
            const transactions = await Transaction.find({ supplierId: supplier.supplierId, type: 'debit' });
            for (const transaction of transactions) {
                totalBalance -= transaction.amount;
            }
            
            supplier.balance = totalBalance;
            await supplier.save();
            console.log(`Updated ${supplier.supplierId}: ${supplier.name} - Balance: ${totalBalance}`);
        }
        
        res.json({ success: true, message: 'All supplier balances fixed!' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;