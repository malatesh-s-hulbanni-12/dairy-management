import React, { useState } from 'react';
import { verifySupplier } from '../utils/api';

const Login = ({ onLoginSuccess }) => {
    const [supplierId, setSupplierId] = useState('');
    const [contact, setContact] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!supplierId.trim() || !contact.trim()) {
            setError('Please enter both Supplier ID and Contact Number');
            return;
        }
        
        setLoading(true);
        setError('');
        
        const result = await verifySupplier(supplierId, contact);
        
        if (result.success) {
            localStorage.setItem('supplierLoggedIn', 'true');
            localStorage.setItem('supplierId', result.supplier.supplierId);
            localStorage.setItem('supplierName', result.supplier.name);
            localStorage.setItem('supplierContact', result.supplier.contact);
            localStorage.setItem('supplierVillage', result.supplier.village);
            localStorage.setItem('supplierBalance', result.supplier.balance);
            
            onLoginSuccess(result.supplier);
        } else {
            setError(result.message || 'Invalid Supplier ID or Contact Number');
        }
        
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1E88E5]/20 to-[#FFF8E1] p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 md:p-8">
                <div className="text-center mb-6">
                    <div className="text-6xl mb-3">🥛</div>
                    <h1 className="text-2xl md:text-3xl font-bold text-[#37474F]">Supplier Login</h1>
                    <p className="text-[#666666] text-sm mt-2">Enter your credentials to view your milk collection details</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-[#37474F] font-medium mb-1 text-sm">
                            Supplier ID *
                        </label>
                        <input
                            type="text"
                            value={supplierId}
                            onChange={(e) => setSupplierId(e.target.value.toUpperCase())}
                            placeholder="e.g., MSH1, MSH2..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#1E88E5] bg-gray-50 text-sm"
                            autoCapitalize="characters"
                            required
                        />
                        <p className="text-xs text-[#666666] mt-1">Enter your unique Supplier ID (e.g., MSH1)</p>
                    </div>
                    
                    <div>
                        <label className="block text-[#37474F] font-medium mb-1 text-sm">
                            Contact Number *
                        </label>
                        <input
                            type="tel"
                            value={contact}
                            onChange={(e) => setContact(e.target.value)}
                            placeholder="e.g., 9876543210"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#1E88E5] bg-gray-50 text-sm"
                            required
                        />
                        <p className="text-xs text-[#666666] mt-1">Enter the mobile number registered with us</p>
                    </div>
                    
                    {error && (
                        <div className="bg-red-100 border-l-4 border-[#E53935] p-3 rounded-r-lg text-sm text-[#E53935]">
                            ⚠️ {error}
                        </div>
                    )}
                    
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full bg-[#1E88E5] text-white py-2 rounded-lg transition-all ${
                            loading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
                        }`}
                    >
                        {loading ? 'Verifying...' : '🔐 Login'}
                    </button>
                </form>
                
                <div className="mt-6 pt-4 border-t text-center">
                    <p className="text-xs text-[#666666]">
                        Having trouble logging in? Contact the dairy administrator.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;