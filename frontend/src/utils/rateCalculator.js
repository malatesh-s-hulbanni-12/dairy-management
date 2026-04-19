// Rate calculator
let cachedRates = {
    old: {},  // For degree only (fat = null) - OLD METHOD
    new: {}   // For degree + specific fat% - NEW METHOD
};

export const loadRatesFromAPI = async (getRatesFunction) => {
    try {
        const result = await getRatesFunction();
        if (result.success) {
            // Clear existing cache
            cachedRates = { old: {}, new: {} };
            
            result.rates.forEach(rate => {
                // Check if this is Old Method (fat is null OR method is 'old')
                if (rate.method === 'old' || rate.fat === null) {
                    // Old method: degree only
                    cachedRates.old[rate.degree] = rate.rate;
                    console.log(`Loaded OLD rate: Degree ${rate.degree} → ₹${rate.rate}`);
                } else {
                    // New method: degree + fat%
                    const key = `${rate.degree},${rate.fat}`;
                    cachedRates.new[key] = rate.rate;
                    console.log(`Loaded NEW rate: Degree ${rate.degree} + Fat ${rate.fat}% → ₹${rate.rate}`);
                }
            });
            
            console.log('Final cached rates:', cachedRates);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error loading rates:', error);
        return false;
    }
};

export const calculateRate = (degree, fat) => {
    console.log(`Calculating rate: Degree=${degree}, Fat=${fat}`);
    
    // Old method: No fat% entered (fat is null, empty, or undefined)
    if (!fat || fat === '' || fat === null) {
        const rate = cachedRates.old[degree];
        console.log(`Looking for OLD rate: Degree ${degree} → ${rate}`);
        if (!rate) {
            return { rate: 0, error: `Rate not found for Degree ${degree} (Old Method)`, method: null };
        }
        return { rate, error: null, method: "Old Method (Degree only)" };
    } 
    // New method: Fat% entered
    else {
        // Round fat to 1 decimal place for matching
        const roundedFat = Math.round(fat * 10) / 10;
        const key = `${degree},${roundedFat}`;
        const rate = cachedRates.new[key];
        console.log(`Looking for NEW rate: ${key} → ${rate}`);
        
        if (!rate) {
            // If specific fat% rate not found, try to use old method as fallback
            const oldRate = cachedRates.old[degree];
            if (oldRate) {
                console.log(`No NEW rate found, using OLD rate as fallback: ${oldRate}`);
                return { rate: oldRate, error: null, method: "Old Method (Fallback)" };
            }
            return { rate: 0, error: `Rate not found for Degree ${degree} + Fat ${roundedFat}%`, method: null };
        }
        return { rate, error: null, method: "New Method (Degree + Fat%)" };
    }
};

export const formatCurrency = (amount) => {
    // Handle undefined, null, or NaN
    if (amount === undefined || amount === null || isNaN(amount)) {
        return '₹0';
    }
    return `₹${amount.toLocaleString('en-IN')}`;
};