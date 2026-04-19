const mongoose = require('mongoose');

const milkEntrySchema = new mongoose.Schema({
    supplierCustomId: {
        type: String,
        required: true
    },
    supplierName: {
        type: String,
        required: true
    },
    degree: {
        type: Number,
        required: true,
        min: 26,
        max: 34
    },
    fat: {
        type: Number,
        default: null
    },
    quantity: {
        type: Number,
        required: true,
        min: 0.1
    },
    rate: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    method: {
        type: String,
        enum: ['Old Method (Degree only)', 'New Method (Degree + Fat%)'],
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('MilkEntry', milkEntrySchema);