const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Rest of your API functions...

// ============ SUPPLIER APIS ============

export const getSuppliers = async () => {
    try {
        const response = await fetch(`${API_URL}/suppliers`);
        const data = await response.json();
        return data;
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getSupplierByCustomId = async (id) => {
    try {
        const response = await fetch(`${API_URL}/suppliers/id/${id}`);
        const data = await response.json();
        return data;
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const addSupplierAPI = async (supplier) => {
    try {
        const response = await fetch(`${API_URL}/suppliers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(supplier)
        });
        const data = await response.json();
        return data;
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// UPDATE supplier API
export const updateSupplierAPI = async (id, supplier) => {
    try {
        const response = await fetch(`${API_URL}/suppliers/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(supplier)
        });
        const data = await response.json();
        return data;
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const deleteSupplierAPI = async (id) => {
    try {
        const response = await fetch(`${API_URL}/suppliers/${id}`, {
            method: 'DELETE'
        });
        const data = await response.json();
        return data;
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// ============ MILK ENTRY APIS ============

export const addMilkEntryAPI = async (entry) => {
    try {
        const response = await fetch(`${API_URL}/entries`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entry)
        });
        const data = await response.json();
        return data;
    } catch (error) {
        return { success: false, message: error.message };
    }
};

export const getTodayEntriesAPI = async () => {
    try {
        const response = await fetch(`${API_URL}/entries/today`);
        const data = await response.json();
        return data;
    } catch (error) {
        return { success: false, message: error.message };
    }
};

export const getEntriesByDateAPI = async (date) => {
    try {
        const response = await fetch(`${API_URL}/entries/date/${date}`);
        const data = await response.json();
        return data;
    } catch (error) {
        return { success: false, message: error.message };
    }
};

export const getEntriesByMonthAPI = async (yearMonth) => {
    try {
        const response = await fetch(`${API_URL}/entries/month/${yearMonth}`);
        const data = await response.json();
        return data;
    } catch (error) {
        return { success: false, message: error.message };
    }
};




// Add these to your existing API file

// ============ RATE APIS ============

export const getRates = async () => {
    try {
        const response = await fetch(`${API_URL}/rates`);
        const data = await response.json();
        return data;
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const updateRate = async (id, rate) => {
    try {
        const response = await fetch(`${API_URL}/rates/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rate })
        });
        const data = await response.json();
        return data;
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const resetRates = async () => {
    try {
        const response = await fetch(`${API_URL}/rates/reset`, {
            method: 'POST'
        });
        const data = await response.json();
        return data;
    } catch (error) {
        return { success: false, error: error.message };
    }
};




// ============ RATE APIS (Add these) ============

export const addRate = async (rateData) => {
    try {
        const response = await fetch(`${API_URL}/rates`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(rateData)
        });
        const data = await response.json();
        return data;
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const deleteRate = async (id) => {
    try {
        const response = await fetch(`${API_URL}/rates/${id}`, {
            method: 'DELETE'
        });
        const data = await response.json();
        return data;
    } catch (error) {
        return { success: false, error: error.message };
    }
};





// ============ TRANSACTION APIS ============

export const getTransactions = async () => {
    try {
        const response = await fetch(`${API_URL}/transactions`);
        const data = await response.json();
        return data;
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const addTransaction = async (transaction) => {
    try {
        const response = await fetch(`${API_URL}/transactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(transaction)
        });
        const data = await response.json();
        return data;
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getSupplierTransactions = async (supplierId) => {
    try {
        const response = await fetch(`${API_URL}/transactions/supplier/${supplierId}`);
        const data = await response.json();
        return data;
    } catch (error) {
        return { success: false, error: error.message };
    }
};


// GET all entries (no date filter)
export const getAllEntries = async () => {
    try {
        const response = await fetch(`${API_URL}/entries/all`);
        const data = await response.json();
        return data;
    } catch (error) {
        return { success: false, message: error.message };
    }
};