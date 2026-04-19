import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import './index.css';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [supplier, setSupplier] = useState(null);

    useEffect(() => {
        // Check if supplier is already logged in
        const loggedIn = localStorage.getItem('supplierLoggedIn');
        if (loggedIn === 'true') {
            const supplierData = {
                supplierId: localStorage.getItem('supplierId'),
                name: localStorage.getItem('supplierName'),
                contact: localStorage.getItem('supplierContact'),
                village: localStorage.getItem('supplierVillage'),
                balance: parseFloat(localStorage.getItem('supplierBalance')) || 0
            };
            setSupplier(supplierData);
            setIsLoggedIn(true);
        }
    }, []);

    const handleLoginSuccess = (supplierData) => {
        setSupplier(supplierData);
        setIsLoggedIn(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('supplierLoggedIn');
        localStorage.removeItem('supplierId');
        localStorage.removeItem('supplierName');
        localStorage.removeItem('supplierContact');
        localStorage.removeItem('supplierVillage');
        localStorage.removeItem('supplierBalance');
        setIsLoggedIn(false);
        setSupplier(null);
    };

    if (!isLoggedIn) {
        return <Login onLoginSuccess={handleLoginSuccess} />;
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-[#1E88E5] text-white shadow-lg">
                <div className="flex justify-between items-center px-4 py-3">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🥛</span>
                        <h1 className="text-lg font-bold">Supplier Portal</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm">{supplier.name}</span>
                        <button
                            onClick={handleLogout}
                            className="bg-white/20 px-3 py-1 rounded-lg text-sm hover:bg-white/30 transition-all"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>
            
            {/* Main Content */}
            <main>
                <Dashboard supplier={supplier} />
            </main>
            
            {/* Footer */}
            <footer className="text-center py-4 text-[#666666] text-xs">
                © 2026 Dairy Management System | Supplier Portal
            </footer>
        </div>
    );
}

export default App;