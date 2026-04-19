import React, { useState, useEffect } from 'react';
import { getSuppliers, addMilkEntryAPI, getRates } from '../utils/api';
import { calculateRate, formatCurrency, loadRatesFromAPI } from '../utils/rateCalculator';

const AddEntry = ({ onEntryAdded }) => {
    const [suppliers, setSuppliers] = useState([]);
    const [filteredSuppliers, setFilteredSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [ratesLoaded, setRatesLoaded] = useState(false);
    
    const [formData, setFormData] = useState({
        degree: '',
        fat: '',
        quantity: ''
    });
    
    const [calculatedRate, setCalculatedRate] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [method, setMethod] = useState(null);

    // Load rates from API first
    useEffect(() => {
        const loadRates = async () => {
            const loaded = await loadRatesFromAPI(getRates);
            setRatesLoaded(loaded);
        };
        loadRates();
    }, []);

    // Load suppliers after rates are loaded
    useEffect(() => {
        if (ratesLoaded) {
            loadSuppliers();
        }
    }, [ratesLoaded]);

    const loadSuppliers = async () => {
        const result = await getSuppliers();
        if (result.success) {
            setSuppliers(result.suppliers);
        }
        setLoading(false);
    };

    // Search/filter suppliers - searches in BOTH ID and Name
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredSuppliers([]);
            return;
        }

        const searchLower = searchTerm.toLowerCase();
        const filtered = suppliers.filter(supplier =>
            supplier.supplierId.toLowerCase().includes(searchLower) ||
            supplier.name.toLowerCase().includes(searchLower)
        );
        setFilteredSuppliers(filtered);
    }, [searchTerm, suppliers]);

    const handleSelectSupplier = (supplier) => {
        setSelectedSupplier(supplier);
        setSearchTerm(supplier.supplierId);
        setShowDropdown(false);
        setError(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setError(null);
        setSuccess(null);

        if (name === 'degree' || name === 'fat') {
            const degreeNum = parseFloat(name === 'degree' ? value : formData.degree);
            const fatNum = name === 'fat' ? (value ? parseFloat(value) : null) : (formData.fat ? parseFloat(formData.fat) : null);
            
            if (degreeNum && degreeNum >= 26 && degreeNum <= 34) {
                const result = calculateRate(degreeNum, fatNum);
                if (!result.error) {
                    setCalculatedRate(result.rate);
                    setMethod(result.method);
                } else {
                    setCalculatedRate(null);
                    setError(result.error);
                }
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectedSupplier) {
            setError("Please select a supplier from search results");
            return;
        }
        if (!formData.degree) {
            setError("Please enter degree");
            return;
        }
        if (!formData.quantity) {
            setError("Please enter quantity");
            return;
        }

        const degreeNum = parseFloat(formData.degree);
        const quantityNum = parseFloat(formData.quantity);
        const fatNum = formData.fat ? parseFloat(formData.fat) : null;

        const rateResult = calculateRate(degreeNum, fatNum);
        if (rateResult.error) {
            setError(rateResult.error);
            return;
        }

        const entryData = {
            supplierCustomId: selectedSupplier.supplierId,
            degree: degreeNum,
            fat: fatNum,
            quantity: quantityNum,
            date: new Date().toISOString().split('T')[0]
        };

        const result = await addMilkEntryAPI(entryData);
        
        if (result.success) {
            setSuccess(`✅ ${result.message} | Rate: ${formatCurrency(result.entry.rate)}/L | Total: ${formatCurrency(result.entry.total)}`);
            setFormData({ degree: '', fat: '', quantity: '' });
            setSelectedSupplier(null);
            setSearchTerm('');
            setCalculatedRate(null);
            setMethod(null);
            if (onEntryAdded) onEntryAdded();
            setTimeout(() => setSuccess(null), 3000);
        } else {
            setError(result.message);
        }
    };

    const totalAmount = calculatedRate && formData.quantity 
        ? calculatedRate * parseFloat(formData.quantity) 
        : 0;

    if (loading || !ratesLoaded) return (
        <div className="p-6 text-center text-dairy-gray">
            <div className="animate-pulse">Loading suppliers and rates...</div>
        </div>
    );

    return (
        <div className="p-4 md:p-6 pb-20 md:pb-6 min-h-screen">
            <h2 className="text-2xl md:text-3xl font-bold text-dairy-gray mb-4 md:mb-6">➕ Add Milk Entry</h2>

            <div className="card p-4 md:p-6 max-w-2xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Search Input - Searches both ID and Name */}
                    <div className="relative">
                        <label className="block text-dairy-gray font-medium mb-1 text-sm md:text-base">
                            🔍 Search Supplier (by ID or Name)
                        </label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setShowDropdown(true);
                                setSelectedSupplier(null);
                            }}
                            onFocus={() => setShowDropdown(true)}
                            placeholder="Type MSH1, MSH2... or supplier name..."
                            className="input-field text-sm md:text-base pr-10"
                            autoComplete="off"
                        />
                        {searchTerm && !selectedSupplier && (
                            <div className="absolute right-3 top-9 text-dairy-lightgray text-xs">
                                🔍
                            </div>
                        )}
                        
                        {/* Dropdown Results */}
                        {showDropdown && searchTerm && filteredSuppliers.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                                {filteredSuppliers.map((supplier) => (
                                    <div
                                        key={supplier._id}
                                        onClick={() => handleSelectSupplier(supplier)}
                                        className="p-3 hover:bg-dairy-cream cursor-pointer border-b last:border-b-0 transition-colors"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                                            <div>
                                                <span className="font-bold text-dairy-blue text-sm md:text-base">
                                                    {supplier.supplierId}
                                                </span>
                                                <span className="text-dairy-gray ml-2 text-sm md:text-base">
                                                    {supplier.name}
                                                </span>
                                            </div>
                                            <div className="text-xs text-dairy-lightgray">
                                                📞 {supplier.contact} | 🏠 {supplier.village}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {/* No Results Message */}
                        {showDropdown && searchTerm && filteredSuppliers.length === 0 && suppliers.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-dairy-lightgray text-sm">
                                ❌ No supplier found with "{searchTerm}"
                            </div>
                        )}
                    </div>

                    {/* Selected Supplier Display */}
                    {selectedSupplier && (
                        <div className="bg-dairy-green/10 p-3 md:p-4 rounded-lg border border-dairy-green">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                                <div>
                                    <p className="text-xs text-dairy-green font-semibold">SELECTED SUPPLIER</p>
                                    <p className="font-bold text-dairy-blue text-base md:text-lg mt-1">
                                        {selectedSupplier.supplierId} - {selectedSupplier.name}
                                    </p>
                                    <div className="flex flex-wrap gap-3 mt-2 text-xs md:text-sm text-dairy-gray">
                                        <span>📞 {selectedSupplier.contact}</span>
                                        <span>🏠 {selectedSupplier.village}</span>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedSupplier(null);
                                        setSearchTerm('');
                                    }}
                                    className="text-dairy-red text-sm hover:underline"
                                >
                                    Change
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Degree */}
                    <div>
                        <label className="block text-dairy-gray font-medium mb-1 text-sm md:text-base">
                            📊 Degree (LR) * <span className="text-dairy-lightgray text-xs">(26-34)</span>
                        </label>
                        <input
                            type="number"
                            name="degree"
                            value={formData.degree}
                            onChange={handleInputChange}
                            placeholder="e.g., 30"
                            className="input-field text-sm md:text-base"
                            step="0.5"
                            required
                        />
                    </div>

                    {/* Fat% (Optional) */}
                    <div>
                        <label className="block text-dairy-gray font-medium mb-1 text-sm md:text-base">
                            🧈 Fat% <span className="text-dairy-lightgray text-xs">(Optional - leave blank for old method)</span>
                        </label>
                        <input
                            type="number"
                            name="fat"
                            value={formData.fat}
                            onChange={handleInputChange}
                            placeholder="e.g., 5.0"
                            className="input-field text-sm md:text-base"
                            step="0.1"
                        />
                    </div>

                    {/* Quantity */}
                    <div>
                        <label className="block text-dairy-gray font-medium mb-1 text-sm md:text-base">
                            📥 Quantity (Liters) *
                        </label>
                        <input
                            type="number"
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleInputChange}
                            placeholder="e.g., 10"
                            className="input-field text-sm md:text-base"
                            step="0.5"
                            required
                        />
                    </div>

                    {/* Calculated Results */}
                    {(calculatedRate || method) && (
                        <div className="bg-gradient-to-r from-dairy-blue/10 to-dairy-blue/5 p-3 md:p-4 rounded-lg border border-dairy-blue/20">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center sm:text-left">
                                <div>
                                    <p className="text-xs text-dairy-lightgray">Method</p>
                                    <p className="font-semibold text-dairy-gray text-sm md:text-base">{method}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-dairy-lightgray">Rate per Liter</p>
                                    <p className="font-bold text-dairy-blue text-lg md:text-xl">{formatCurrency(calculatedRate)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-dairy-lightgray">Total Amount</p>
                                    <p className="font-bold text-dairy-green text-lg md:text-xl">{formatCurrency(totalAmount)}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-100 border-l-4 border-dairy-red p-3 rounded-r-lg text-sm text-dairy-red">
                            ⚠️ {error}
                        </div>
                    )}

                    {/* Success Message */}
                    {success && (
                        <div className="bg-green-100 border-l-4 border-dairy-green p-3 rounded-r-lg text-sm text-dairy-green">
                            ✅ {success}
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button type="submit" className="btn-primary flex-1 py-2 md:py-3 text-sm md:text-base">
                            💾 Save Entry
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setFormData({ degree: '', fat: '', quantity: '' });
                                setSelectedSupplier(null);
                                setSearchTerm('');
                                setCalculatedRate(null);
                                setError(null);
                                setMethod(null);
                                setFilteredSuppliers([]);
                            }}
                            className="btn-secondary px-4 py-2 md:px-6 text-sm md:text-base"
                        >
                            Clear
                        </button>
                    </div>
                </form>
            </div>

            {/* Info Box */}
            <div className="mt-4 md:mt-6 bg-dairy-cream p-3 md:p-4 rounded-lg max-w-2xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:justify-between gap-2 text-xs md:text-sm text-dairy-gray">
                    <div>
                        <span className="font-bold">🔍 Search:</span> Type ID (MSH1) OR Name
                    </div>
                    <div>
                        <span className="font-bold">📊 Rate:</span> Degree only → Old | Degree+Fat% → New
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddEntry;