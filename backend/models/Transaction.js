const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    supplierId: {
        type: String,
        required: true
    },
    supplierName: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['debit', 'credit'],
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    balanceAfter: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Transaction', transactionSchema);