const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
    supplierId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    contact: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    village: {
        type: String,
        required: true,
        trim: true
    },
    balance: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Supplier', supplierSchema);