const express = require('express');
const router = express.Router();
const {
    addEntry,
    getEntriesByDate,
    getEntriesByMonth,
    getTodayEntries,
    getAllEntries,
    getEntriesBySupplier
} = require('../controllers/entryController');

router.post('/', addEntry);
router.get('/today', getTodayEntries);
router.get('/date/:date', getEntriesByDate);
router.get('/month/:yearMonth', getEntriesByMonth);
router.get('/all', getAllEntries);
router.get('/supplier/:supplierId', getEntriesBySupplier);

module.exports = router;