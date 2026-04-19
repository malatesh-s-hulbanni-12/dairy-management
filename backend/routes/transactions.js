const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Supplier = require('../models/Supplier');

// GET all transactions
router.get('/', async (req, res) => {
    try {
        const transactions = await Transaction.find().sort({ date: -1, createdAt: -1 });
        console.log('📋 Returning all transactions:', transactions.length);
        res.json({ success: true, transactions });
    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET transactions by supplier
router.get('/supplier/:supplierId', async (req, res) => {
    try {
        const transactions = await Transaction.find({ supplierId: req.params.supplierId }).sort({ date: -1 });
        console.log(`📋 Transactions for ${req.params.supplierId}:`, transactions.length);
        res.json({ success: true, transactions });
    } catch (error) {
        console.error('Get supplier transactions error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST add debit transaction
router.post('/', async (req, res) => {
    try {
        const { supplierId, supplierName, amount, type, reason, date } = req.body;
        
        console.log('=== ADDING TRANSACTION ===');
        console.log('Supplier ID:', supplierId);
        console.log('Amount:', amount);
        console.log('Type:', type);
        console.log('Reason:', reason);
        
        const supplier = await Supplier.findOne({ supplierId });
        if (!supplier) {
            return res.status(404).json({ success: false, message: 'Supplier not found' });
        }
        
        const currentBalance = supplier.balance || 0;
        let newBalance = currentBalance;
        
        if (type === 'debit') {
            if (amount > currentBalance) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Insufficient balance! Available: ${currentBalance}` 
                });
            }
            newBalance = currentBalance - amount;
        } else if (type === 'credit') {
            newBalance = currentBalance + amount;
        }
        
        const transaction = new Transaction({
            supplierId,
            supplierName,
            amount,
            type,
            reason,
            date,
            balanceAfter: newBalance
        });
        
        await transaction.save();
        
        // UPDATE SUPPLIER BALANCE
        supplier.balance = newBalance;
        await supplier.save();
        
        console.log(`💰 Balance updated: ${currentBalance} → ${newBalance} (${type === 'debit' ? '-' : '+'}${amount})`);
        
        res.json({ 
            success: true, 
            message: `${type === 'debit' ? 'Debit' : 'Credit'} of ${amount} processed successfully`,
            newBalance: newBalance,
            transaction 
        });
    } catch (error) {
        console.error('Transaction error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;