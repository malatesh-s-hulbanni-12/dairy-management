const mongoose = require('mongoose');

const rateSchema = new mongoose.Schema({
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
    rate: {
        type: Number,
        required: true,
        min: 0
    },
    method: {
        type: String,
        enum: ['old', 'new'],
        required: true,
        default: 'old'
    }
}, {
    timestamps: true
});

// Compound index for unique combination
rateSchema.index({ degree: 1, fat: 1, method: 1 }, { unique: true });

module.exports = mongoose.model('Rate', rateSchema);