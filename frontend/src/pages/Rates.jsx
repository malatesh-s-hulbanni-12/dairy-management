import React, { useState, useEffect } from 'react';
import { getRates, updateRate, resetRates, addRate, deleteRate } from '../utils/api';
import { formatCurrency } from '../utils/rateCalculator';

const Rates = () => {
    const [rates, setRates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editingValue, setEditingValue] = useState('');
    const [message, setMessage] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newRate, setNewRate] = useState({
        degree: '',
        fat: '',
        rate: '',
        method: 'old'
    });

    useEffect(() => {
        loadRates();
    }, []);

    const loadRates = async () => {
        setLoading(true);
        const result = await getRates();
        if (result.success) {
            const sorted = result.rates.sort((a, b) => {
                if (a.method !== b.method) return a.method === 'old' ? -1 : 1;
                if (a.degree !== b.degree) return a.degree - b.degree;
                if (a.fat === null && b.fat !== null) return -1;
                if (a.fat !== null && b.fat === null) return 1;
                return (a.fat || 0) - (b.fat || 0);
            });
            setRates(sorted);
        }
        setLoading(false);
    };

    const handleEdit = (rate) => {
        setEditingId(rate._id);
        setEditingValue(rate.rate);
    };

    const handleSave = async (id) => {
        if (!editingValue || editingValue < 0) {
            setMessage({ type: 'error', text: 'Please enter a valid rate' });
            setTimeout(() => setMessage(null), 3000);
            return;
        }
        const result = await updateRate(id, parseFloat(editingValue));
        if (result.success) {
            setMessage({ type: 'success', text: 'Rate updated successfully!' });
            loadRates();
        } else {
            setMessage({ type: 'error', text: result.message });
        }
        setEditingId(null);
        setEditingValue('');
        setTimeout(() => setMessage(null), 3000);
    };

    const handleDelete = async (id, degree, fat, method) => {
        const confirmMsg = method === 'new' 
            ? `Delete rate for Degree ${degree}° + Fat ${fat}%?` 
            : `Delete base rate for Degree ${degree}°?`;
        if (confirm(confirmMsg)) {
            const result = await deleteRate(id);
            if (result.success) {
                setMessage({ type: 'success', text: 'Rate deleted successfully!' });
                loadRates();
            } else {
                setMessage({ type: 'error', text: result.message });
            }
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const handleReset = async () => {
        if (confirm('Reset all rates to default values? This will lose any custom changes.')) {
            const result = await resetRates();
            if (result.success) {
                setMessage({ type: 'success', text: 'Rates reset to default!' });
                loadRates();
            } else {
                setMessage({ type: 'error', text: result.message });
            }
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const handleAddRate = async () => {
        // Validation
        if (!newRate.degree) {
            setMessage({ type: 'error', text: 'Please enter degree' });
            setTimeout(() => setMessage(null), 3000);
            return;
        }
        if (!newRate.rate || newRate.rate <= 0) {
            setMessage({ type: 'error', text: 'Please enter a valid rate' });
            setTimeout(() => setMessage(null), 3000);
            return;
        }

        const degreeNum = parseFloat(newRate.degree);
        if (degreeNum < 26 || degreeNum > 34) {
            setMessage({ type: 'error', text: 'Degree must be between 26 and 34' });
            setTimeout(() => setMessage(null), 3000);
            return;
        }

        // IMPORTANT: Determine method based on selection
        let fatNum = null;
        let selectedMethod = newRate.method; // Use the selected method from state
        
        if (selectedMethod === 'new') {
            if (!newRate.fat || newRate.fat.trim() === '') {
                setMessage({ type: 'error', text: 'Please enter Fat% for New Method' });
                setTimeout(() => setMessage(null), 3000);
                return;
            }
            fatNum = parseFloat(newRate.fat);
            if (fatNum < 2 || fatNum > 10) {
                setMessage({ type: 'error', text: 'Fat% must be between 2 and 10' });
                setTimeout(() => setMessage(null), 3000);
                return;
            }
        } else {
            // Old method: fat is null
            fatNum = null;
        }

        const rateData = {
            degree: degreeNum,
            fat: fatNum,
            rate: parseFloat(newRate.rate),
            method: selectedMethod  // Use the selected method
        };

        console.log('Saving rate:', rateData); // Debug log

        const result = await addRate(rateData);
        if (result.success) {
            setMessage({ type: 'success', text: 'Rate added successfully!' });
            setNewRate({ degree: '', fat: '', rate: '', method: 'old' });
            setShowAddForm(false);
            loadRates();
        } else {
            setMessage({ type: 'error', text: result.message });
        }
        setTimeout(() => setMessage(null), 3000);
    };

    if (loading) return (
        <div className="p-6 text-center text-dairy-gray">
            <div className="animate-pulse">Loading rates...</div>
        </div>
    );

    return (
        <div className="p-4 md:p-6 pb-20 md:pb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 md:mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-dairy-gray">💰 Rate Calculator</h2>
                <div className="flex gap-2 w-full sm:w-auto">
                    <button 
                        onClick={() => setShowAddForm(!showAddForm)} 
                        className={`${showAddForm ? 'btn-danger' : 'btn-secondary'} px-4 py-2 text-sm flex-1 sm:flex-none`}
                    >
                        {showAddForm ? '✖ Cancel' : '➕ Add New Rate'}
                    </button>
                    <button onClick={handleReset} className="btn-warning px-4 py-2 text-sm flex-1 sm:flex-none">
                        🔄 Reset
                    </button>
                </div>
            </div>

            {/* Message */}
            {message && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-100 text-dairy-green' : 'bg-red-100 text-dairy-red'}`}>
                    {message.type === 'success' ? '✅' : '⚠️'} {message.text}
                </div>
            )}

            {/* Add New Rate Form */}
            {showAddForm && (
                <div className="card p-4 mb-6">
                    <h3 className="text-lg md:text-xl font-bold mb-3">Add New Rate</h3>
                    
                    {/* Method Selection */}
                    <div className="mb-4">
                        <label className="block text-dairy-gray font-medium mb-2 text-sm">Select Method</label>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setNewRate({...newRate, method: 'old', fat: ''})}
                                className={`flex-1 py-2 px-4 rounded-lg transition-all ${
                                    newRate.method === 'old' 
                                        ? 'bg-dairy-blue text-white' 
                                        : 'bg-gray-200 text-dairy-gray'
                                }`}
                            >
                                📊 Old Method (Degree only)
                            </button>
                            <button
                                type="button"
                                onClick={() => setNewRate({...newRate, method: 'new', fat: ''})}
                                className={`flex-1 py-2 px-4 rounded-lg transition-all ${
                                    newRate.method === 'new' 
                                        ? 'bg-dairy-blue text-white' 
                                        : 'bg-gray-200 text-dairy-gray'
                                }`}
                            >
                                🆕 New Method (Degree + Fat%)
                            </button>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input
                            type="number"
                            placeholder="Degree (26-34)"
                            value={newRate.degree}
                            onChange={(e) => setNewRate({...newRate, degree: e.target.value})}
                            className="input-field text-sm"
                            step="0.5"
                        />
                        {newRate.method === 'new' && (
                            <input
                                type="number"
                                placeholder="Fat% (2-10)"
                                value={newRate.fat}
                                onChange={(e) => setNewRate({...newRate, fat: e.target.value})}
                                className="input-field text-sm"
                                step="0.1"
                            />
                        )}
                        <input
                            type="number"
                            placeholder="Rate (₹ per liter)"
                            value={newRate.rate}
                            onChange={(e) => setNewRate({...newRate, rate: e.target.value})}
                            className="input-field text-sm"
                            step="1"
                        />
                    </div>
                    <button onClick={handleAddRate} className="btn-primary w-full py-2 mt-3">
                        💾 Save New Rate
                    </button>
                </div>
            )}

            {/* Rates Table - Desktop View */}
            <div className="hidden md:block card overflow-hidden">
                <div className="bg-dairy-blue text-white p-3">
                    <h3 className="font-bold text-center">Degree + Fat% → Rate (₹ per liter)</h3>
                    <p className="text-xs text-center opacity-80 mt-1">Old Method = Degree only | New Method = Degree + Fat%</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-dairy-cream">
                                <th className="p-3 text-left">Method</th>
                                <th className="p-3 text-left">Degree (LR)</th>
                                <th className="p-3 text-left">Fat%</th>
                                <th className="p-3 text-left">Current Rate (₹/L)</th>
                                <th className="p-3 text-left">Actions</th>
                             </tr>
                        </thead>
                        <tbody>
                            {rates.map((rate, index) => (
                                <tr key={rate._id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-dairy-cream'} border-b`}>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 rounded text-xs ${
                                            rate.method === 'old' 
                                                ? 'bg-dairy-blue/20 text-dairy-blue' 
                                                : 'bg-dairy-green/20 text-dairy-green'
                                        }`}>
                                            {rate.method === 'old' ? 'Old Method' : 'New Method'}
                                        </span>
                                    </td>
                                    <td className="p-3 font-bold text-dairy-blue">{rate.degree}°</td>
                                    <td className="p-3">
                                        {rate.fat ? (
                                            <span className="font-medium">{rate.fat}%</span>
                                        ) : (
                                            <span className="text-dairy-lightgray italic">(No Fat)</span>
                                        )}
                                    </td>
                                    <td className="p-3">
                                        {editingId === rate._id ? (
                                            <input
                                                type="number"
                                                value={editingValue}
                                                onChange={(e) => setEditingValue(e.target.value)}
                                                className="input-field w-32 text-sm"
                                                step="1"
                                            />
                                        ) : (
                                            <span className="font-semibold">{formatCurrency(rate.rate)}</span>
                                        )}
                                    </td>
                                    <td className="p-3">
                                        {editingId === rate._id ? (
                                            <div className="flex gap-2">
                                                <button onClick={() => handleSave(rate._id)} className="bg-dairy-green text-white px-3 py-1 rounded text-sm">Save</button>
                                                <button onClick={() => setEditingId(null)} className="bg-gray-400 text-white px-3 py-1 rounded text-sm">Cancel</button>
                                            </div>
                                        ) : (
                                            <div className="flex gap-2">
                                                <button onClick={() => handleEdit(rate)} className="bg-dairy-orange text-white px-3 py-1 rounded text-sm">✏️ Edit</button>
                                                <button onClick={() => handleDelete(rate._id, rate.degree, rate.fat, rate.method)} className="bg-dairy-red text-white px-3 py-1 rounded text-sm">🗑️ Delete</button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Rates Cards - Mobile View */}
            <div className="md:hidden space-y-3">
                {rates.map((rate) => (
                    <div key={rate._id} className="card p-4">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <span className={`px-2 py-1 rounded text-xs ${
                                    rate.method === 'old' 
                                        ? 'bg-dairy-blue/20 text-dairy-blue' 
                                        : 'bg-dairy-green/20 text-dairy-green'
                                }`}>
                                    {rate.method === 'old' ? 'Old' : 'New'}
                                </span>
                                <p className="font-bold text-dairy-blue text-lg mt-2">{rate.degree}°</p>
                                <p className="text-dairy-gray text-sm">
                                    {rate.fat ? `Fat: ${rate.fat}%` : 'No Fat (Base Rate)'}
                                </p>
                            </div>
                            <div className="text-right">
                                {editingId === rate._id ? (
                                    <input
                                        type="number"
                                        value={editingValue}
                                        onChange={(e) => setEditingValue(e.target.value)}
                                        className="input-field w-28 text-sm"
                                        step="1"
                                    />
                                ) : (
                                    <p className="font-bold text-dairy-green text-xl">{formatCurrency(rate.rate)}</p>
                                )}
                            </div>
                        </div>
                        {editingId === rate._id ? (
                            <div className="flex gap-2">
                                <button onClick={() => handleSave(rate._id)} className="btn-primary flex-1 py-2 text-sm">Save</button>
                                <button onClick={() => setEditingId(null)} className="btn-secondary flex-1 py-2 text-sm">Cancel</button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <button onClick={() => handleEdit(rate)} className="bg-dairy-orange text-white flex-1 py-2 rounded text-sm">✏️ Edit</button>
                                <button onClick={() => handleDelete(rate._id, rate.degree, rate.fat, rate.method)} className="bg-dairy-red text-white flex-1 py-2 rounded text-sm">🗑️ Delete</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Info Box */}
            <div className="mt-6 bg-dairy-cream p-4 rounded-lg">
                <p className="text-sm text-dairy-gray">
                    <span className="font-bold">📌 How it works:</span><br/>
                    • <strong>Old Method:</strong> Degree only (Fat% empty) → Used when no fat% is entered in Add Entry<br/>
                    • <strong>New Method:</strong> Degree + Specific Fat% → Used when exact fat% is entered<br/>
                    • Click <strong>Add New Rate</strong> and select method to create rates<br/>
                    • Changes automatically reflect in <strong>Add Entry</strong> page
                </p>
            </div>
        </div>
    );
};

export default Rates;