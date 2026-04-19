const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Verify supplier login
export const verifySupplier = async (supplierId, contact) => {
    try {
        const response = await fetch(`${API_URL}/suppliers/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ supplierId, contact })
        });
        const data = await response.json();
        return data;
    } catch (error) {
        return { success: false, message: error.message };
    }
};

// Get supplier's milk entries
export const getSupplierEntries = async (supplierId) => {
    try {
        const response = await fetch(`${API_URL}/entries/supplier/${supplierId}`);
        const data = await response.json();
        return data;
    } catch (error) {
        return { success: false, message: error.message };
    }
};

// Get supplier's transactions
export const getSupplierTransactions = async (supplierId) => {
    try {
        const response = await fetch(`${API_URL}/transactions/supplier/${supplierId}`);
        const data = await response.json();
        return data;
    } catch (error) {
        return { success: false, message: error.message };
    }
};

// Get supplier's current balance
export const getSupplierBalance = async (supplierId) => {
    try {
        const response = await fetch(`${API_URL}/suppliers/id/${supplierId}`);
        const data = await response.json();
        if (data.success) {
            return { success: true, balance: data.supplier.balance || 0 };
        }
        return { success: false, message: data.message };
    } catch (error) {
        return { success: false, message: error.message };
    }
};