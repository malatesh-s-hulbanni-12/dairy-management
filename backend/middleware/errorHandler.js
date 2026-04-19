const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    
    // Mongoose duplicate key error
    if (err.code === 11000) {
        return res.status(400).json({
            success: false,
            message: 'Duplicate entry - this record already exists'
        });
    }
    
    res.status(500).json({
        success: false,
        message: err.message || 'Internal server error'
    });
};

module.exports = errorHandler;