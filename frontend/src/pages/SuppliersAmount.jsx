import React, { useState, useEffect } from 'react';
import { getSuppliers, getAllEntries, getTransactions, addTransaction } from '../utils/api';
import { formatCurrency } from '../utils/rateCalculator';

const SuppliersAmount = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [supplierAmounts, setSupplierAmounts] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [totalMilk, setTotalMilk] = useState(0);
    
    // Debit popup states
    const [showDebitPopup, setShowDebitPopup] = useState(false);
    const [selectedSupplierForDebit, setSelectedSupplierForDebit] = useState(null);
    const [debitAmount, setDebitAmount] = useState('');
    const [debitReason, setDebitReason] = useState('');
    const [debitError, setDebitError] = useState('');
    const [debitSuccess, setDebitSuccess] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    
    // Transactions popup states
    const [showTransactionsPopup, setShowTransactionsPopup] = useState(false);
    const [selectedSupplierForTransactions, setSelectedSupplierForTransactions] = useState(null);
    const [transactionSearchTerm, setTransactionSearchTerm] = useState('');
    const [supplierTransactions, setSupplierTransactions] = useState([]);

    // Load all data on mount
    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            
            // Fetch transactions first
            const transactionsResult = await getTransactions();
            console.log('Transactions loaded:', transactionsResult);
            
            let transactionList = [];
            if (transactionsResult.success) {
                transactionList = transactionsResult.transactions || [];
                setTransactions(transactionList);
                console.log(`✅ Loaded ${transactionList.length} transactions`);
                
                // Log debit transactions
                const debitTxn = transactionList.filter(t => t.type === 'debit');
                console.log(`💰 Found ${debitTxn.length} DEBIT transactions:`, debitTxn);
            }
            
            // Fetch suppliers
            const suppliersResult = await getSuppliers();
            if (!suppliersResult.success) {
                setError('Failed to load suppliers');
                setLoading(false);
                return;
            }
            
            const allSuppliers = suppliersResult.suppliers || [];
            setSuppliers(allSuppliers);
            console.log(`✅ Loaded ${allSuppliers.length} suppliers`);
            
            // Fetch milk entries
            const entriesResult = await getAllEntries();
            
            let amounts = [];
            let grandMilk = 0;
            
            if (entriesResult.success && entriesResult.entries) {
                console.log(`✅ Found ${entriesResult.entries.length} milk entries`);
                
                // Group milk entries by supplier
                const supplierMilkSummary = {};
                entriesResult.entries.forEach(entry => {
                    if (!supplierMilkSummary[entry.supplierName]) {
                        supplierMilkSummary[entry.supplierName] = {
                            supplierId: entry.supplierCustomId,
                            totalMilk: 0,
                            milkAmount: 0
                        };
                    }
                    supplierMilkSummary[entry.supplierName].totalMilk += entry.quantity;
                    supplierMilkSummary[entry.supplierName].milkAmount += entry.total;
                });
                
                console.log('Milk summary:', supplierMilkSummary);
                
                // Calculate amounts for each supplier using the transactionList we fetched
                for (const supplier of allSuppliers) {
                    const supplierData = supplierMilkSummary[supplier.name];
                    const milkQuantity = supplierData ? supplierData.totalMilk : 0;
                    const milkAmountTotal = supplierData ? supplierData.milkAmount : 0;
                    
                    // Calculate total debit for this supplier from transactionList
                    const debitTransactions = transactionList.filter(t => 
                        t && t.supplierId === supplier.supplierId && t.type === 'debit'
                    );
                    const totalDebit = debitTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
                    
                    const currentBalance = supplier.balance || 0;
                    
                    console.log(`Supplier ${supplier.supplierId}: Milk=${milkAmountTotal}, Debit=${totalDebit}, Balance=${currentBalance}`);
                    
                    amounts.push({
                        supplierId: supplier.supplierId,
                        name: supplier.name,
                        contact: supplier.contact,
                        village: supplier.village,
                        totalMilk: milkQuantity,
                        milkAmount: milkAmountTotal,
                        debitAmount: totalDebit,
                        balance: currentBalance
                    });
                    
                    grandMilk += milkQuantity;
                }
                
                amounts.sort((a, b) => b.balance - a.balance);
            }
            
            setSupplierAmounts(amounts);
            setTotalMilk(grandMilk);
            console.log('✅ Data loaded successfully');
            
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Error loading data: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDebitClick = (supplier) => {
        console.log('Debit clicked for supplier:', supplier);
        setSelectedSupplierForDebit(supplier);
        setDebitAmount('');
        setDebitReason('');
        setDebitError('');
        setDebitSuccess('');
        setShowDebitPopup(true);
    };

    const handleDebitSubmit = async () => {
        console.log('=== SUBMITTING DEBIT ===');
        
        if (!debitAmount || parseFloat(debitAmount) <= 0) {
            setDebitError('Please enter a valid amount');
            return;
        }
        
        if (!debitReason) {
            setDebitError('Please enter a reason for debit');
            return;
        }
        
        const amount = parseFloat(debitAmount);
        
        if (amount > selectedSupplierForDebit.balance) {
            setDebitError(`Insufficient balance! Available: ${formatCurrency(selectedSupplierForDebit.balance)}`);
            return;
        }
        
        setIsProcessing(true);
        
        const transactionData = {
            supplierId: selectedSupplierForDebit.supplierId,
            supplierName: selectedSupplierForDebit.name,
            amount: amount,
            type: 'debit',
            reason: debitReason,
            date: new Date().toISOString().split('T')[0]
        };
        
        console.log('Sending transaction:', transactionData);
        
        try {
            const result = await addTransaction(transactionData);
            console.log('Transaction result:', result);
            
            if (result.success) {
                setDebitSuccess(`✅ ${formatCurrency(amount)} deducted. New balance: ${formatCurrency(result.newBalance)}`);
                
                // Refresh all data
                await fetchAllData();
                
                setTimeout(() => {
                    setShowDebitPopup(false);
                    setDebitSuccess('');
                    setIsProcessing(false);
                }, 2000);
            } else {
                setDebitError(result.message || 'Transaction failed');
                setIsProcessing(false);
            }
        } catch (err) {
            console.error('Debit error:', err);
            setDebitError('Error processing debit: ' + err.message);
            setIsProcessing(false);
        }
    };

    const handleTransactionsClick = (supplier) => {
        console.log('View transactions for supplier:', supplier.supplierId);
        
        const supplierTrans = transactions.filter(t => t && t.supplierId === supplier.supplierId);
        console.log(`Found ${supplierTrans.length} transactions`);
        
        setSelectedSupplierForTransactions(supplier);
        setTransactionSearchTerm('');
        setSupplierTransactions(supplierTrans);
        setShowTransactionsPopup(true);
    };

    const filterTransactions = () => {
        if (!transactionSearchTerm) return supplierTransactions;
        
        const searchLower = transactionSearchTerm.toLowerCase();
        return supplierTransactions.filter(t =>
            (t.supplierId || '').toLowerCase().includes(searchLower) ||
            (t.supplierName || '').toLowerCase().includes(searchLower) ||
            (t.reason || '').toLowerCase().includes(searchLower)
        );
    };

    // Filter suppliers based on search
    const filteredSuppliers = supplierAmounts.filter(supplier =>
        (supplier.supplierId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (supplier.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (supplier.contact || '').includes(searchTerm) ||
        (supplier.village || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="p-6 text-center text-dairy-gray">
            <div className="animate-pulse">Loading supplier amounts...</div>
        </div>
    );

    if (error) return (
        <div className="p-6 text-center text-dairy-red">
            <p>❌ {error}</p>
            <button 
                onClick={() => fetchAllData()}
                className="mt-4 btn-primary px-4 py-2 text-sm"
            >
                Retry
            </button>
        </div>
    );

    return (
        <div className="p-4 md:p-6 pb-20 md:pb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 md:mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-dairy-gray">💰 Suppliers Amount</h2>
                <div className="w-full sm:w-80">
                    <input
                        type="text"
                        placeholder="🔍 Search by ID, Name, Contact or Village..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-field text-sm"
                    />
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="card p-4 bg-dairy-blue/10">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-dairy-lightgray text-xs md:text-sm">Total Suppliers</p>
                            <p className="text-2xl md:text-3xl font-bold text-dairy-blue">{suppliers.length}</p>
                        </div>
                        <span className="text-3xl">👥</span>
                    </div>
                </div>
                <div className="card p-4 bg-dairy-green/10">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-dairy-lightgray text-xs md:text-sm">Total Milk (All Time)</p>
                            <p className="text-2xl md:text-3xl font-bold text-dairy-green">{totalMilk} L</p>
                        </div>
                        <span className="text-3xl">🥛</span>
                    </div>
                </div>
            </div>

            {/* Title */}
            <h3 className="text-lg md:text-xl font-bold text-dairy-gray mb-3">All Time Summary</h3>

            {/* Desktop Table View */}
            <div className="hidden md:block card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-dairy-blue text-white">
                                <th className="p-3 text-left">Supplier ID</th>
                                <th className="p-3 text-left">Name</th>
                                <th className="p-3 text-left">Contact</th>
                                <th className="p-3 text-left">Village</th>
                                <th className="p-3 text-left">Total Milk (L)</th>
                                <th className="p-3 text-left">Milk Amount</th>
                                <th className="p-3 text-left">Debit Amount</th>
                                <th className="p-3 text-left">Current Balance</th>
                                <th className="p-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSuppliers.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="p-8 text-center text-dairy-lightgray">
                                        No suppliers found
                                    </td>
                                </tr>
                            ) : (
                                filteredSuppliers.map((supplier, index) => (
                                    <tr key={supplier.supplierId} className={`${index % 2 === 0 ? 'bg-white' : 'bg-dairy-cream'} border-b`}>
                                        <td className="p-3 font-mono font-bold text-dairy-blue">{supplier.supplierId}</td>
                                        <td className="p-3 font-medium">{supplier.name}</td>
                                        <td className="p-3">{supplier.contact}</td>
                                        <td className="p-3">{supplier.village}</td>
                                        <td className="p-3">{supplier.totalMilk} L</td>
                                        <td className="p-3">{formatCurrency(supplier.milkAmount || 0)}</td>
                                        <td className="p-3 text-dairy-red">{formatCurrency(supplier.debitAmount || 0)}</td>
                                        <td className="p-3 font-bold text-dairy-green">{formatCurrency(supplier.balance || 0)}</td>
                                        <td className="p-3 text-center">
                                            <div className="flex gap-2 justify-center">
                                                <button
                                                    onClick={() => handleDebitClick(supplier)}
                                                    className="bg-dairy-orange text-white px-3 py-1 rounded text-sm hover:opacity-80 transition-all"
                                                >
                                                    💸 Debit
                                                </button>
                                                <button
                                                    onClick={() => handleTransactionsClick(supplier)}
                                                    className="bg-dairy-blue text-white px-3 py-1 rounded text-sm hover:opacity-80 transition-all"
                                                >
                                                    📋 Transactions
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
                {filteredSuppliers.length === 0 ? (
                    <div className="card p-8 text-center text-dairy-lightgray">
                        No suppliers found
                    </div>
                ) : (
                    filteredSuppliers.map((supplier) => (
                        <div key={supplier.supplierId} className="card p-4">
                            <div className="flex flex-col gap-2">
                                <div>
                                    <p className="font-bold text-dairy-blue text-lg">{supplier.supplierId}</p>
                                    <p className="font-semibold text-dairy-gray">{supplier.name}</p>
                                    <p className="text-dairy-gray text-sm mt-1">📞 {supplier.contact}</p>
                                    <p className="text-dairy-lightgray text-sm">🏠 {supplier.village}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-2 border-t pt-2">
                                    <div>
                                        <p className="text-xs text-dairy-lightgray">Total Milk</p>
                                        <p className="font-semibold text-dairy-blue">{supplier.totalMilk} L</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-dairy-lightgray">Milk Amount</p>
                                        <p className="font-semibold text-dairy-blue">{formatCurrency(supplier.milkAmount || 0)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-dairy-lightgray">Debit Amount</p>
                                        <p className="font-semibold text-dairy-red">{formatCurrency(supplier.debitAmount || 0)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-dairy-lightgray">Current Balance</p>
                                        <p className="font-bold text-dairy-green text-lg">{formatCurrency(supplier.balance || 0)}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-2">
                                    <button
                                        onClick={() => handleDebitClick(supplier)}
                                        className="bg-dairy-orange text-white flex-1 py-2 rounded text-sm"
                                    >
                                        💸 Debit
                                    </button>
                                    <button
                                        onClick={() => handleTransactionsClick(supplier)}
                                        className="bg-dairy-blue text-white flex-1 py-2 rounded text-sm"
                                    >
                                        📋 Transactions
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Debit Popup Modal */}
            {showDebitPopup && selectedSupplierForDebit && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-dairy-blue">💸 Debit Amount</h3>
                            <button
                                onClick={() => setShowDebitPopup(false)}
                                className="text-dairy-gray hover:text-dairy-red text-2xl"
                            >
                                ✖
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="bg-dairy-cream p-3 rounded-lg">
                                <p className="text-sm text-dairy-gray">Supplier</p>
                                <p className="font-bold text-dairy-blue">{selectedSupplierForDebit.supplierId} - {selectedSupplierForDebit.name}</p>
                                <div className="mt-2 space-y-1">
                                    <p className="text-sm text-dairy-gray">Total Milk Amount: {formatCurrency(selectedSupplierForDebit.milkAmount || 0)}</p>
                                    <p className="text-sm text-dairy-red">Already Debited: {formatCurrency(selectedSupplierForDebit.debitAmount || 0)}</p>
                                    <p className="text-sm text-dairy-green font-bold">Current Balance: {formatCurrency(selectedSupplierForDebit.balance || 0)}</p>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-dairy-gray font-medium mb-1 text-sm">Amount to Debit *</label>
                                <input
                                    type="number"
                                    value={debitAmount}
                                    onChange={(e) => setDebitAmount(e.target.value)}
                                    placeholder="Enter amount"
                                    className="input-field text-sm"
                                    step="1"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-dairy-gray font-medium mb-1 text-sm">Reason *</label>
                                <textarea
                                    value={debitReason}
                                    onChange={(e) => setDebitReason(e.target.value)}
                                    placeholder="Enter reason for debit (e.g., Advance payment, Loan, etc.)"
                                    className="input-field text-sm resize-none"
                                    rows="3"
                                />
                            </div>
                            
                            <div className="text-xs text-dairy-lightgray">
                                📅 Date: {new Date().toISOString().split('T')[0]} (Auto)
                            </div>
                            
                            {debitError && (
                                <div className="bg-red-100 border-l-4 border-dairy-red p-3 rounded text-sm text-dairy-red">
                                    ⚠️ {debitError}
                                </div>
                            )}
                            
                            {debitSuccess && (
                                <div className="bg-green-100 border-l-4 border-dairy-green p-3 rounded text-sm text-dairy-green">
                                    ✅ {debitSuccess}
                                </div>
                            )}
                            
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={handleDebitSubmit}
                                    disabled={isProcessing}
                                    className={`btn-primary flex-1 py-2 ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {isProcessing ? 'Processing...' : 'Confirm Debit'}
                                </button>
                                <button
                                    onClick={() => setShowDebitPopup(false)}
                                    className="btn-secondary px-6 py-2"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Transactions Popup Modal */}
            {showTransactionsPopup && selectedSupplierForTransactions && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-dairy-blue">📋 Transactions - {selectedSupplierForTransactions.supplierId}</h3>
                            <button
                                onClick={() => setShowTransactionsPopup(false)}
                                className="text-dairy-gray hover:text-dairy-red text-2xl"
                            >
                                ✖
                            </button>
                        </div>
                        
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="🔍 Search by ID, Name or Reason..."
                                value={transactionSearchTerm}
                                onChange={(e) => setTransactionSearchTerm(e.target.value)}
                                className="input-field text-sm"
                            />
                        </div>
                        
                        <div className="overflow-y-auto flex-1">
                            {filterTransactions().length === 0 ? (
                                <div className="text-center text-dairy-lightgray py-8">
                                    No transactions found
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {filterTransactions().map((transaction, index) => (
                                        <div key={transaction._id || index} className="bg-dairy-cream p-3 rounded-lg">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <p className="text-xs text-dairy-lightgray">{transaction.date || '-'}</p>
                                                    <p className="font-semibold text-dairy-gray mt-1">{transaction.reason || '-'}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-dairy-gray">Amount</p>
                                                    <p className="font-bold text-dairy-red">{formatCurrency(transaction.amount || 0)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        <div className="mt-4 pt-3 border-t">
                            <div className="flex justify-between">
                                <p className="text-dairy-gray">Current Balance:</p>
                                <p className="font-bold text-dairy-green">{formatCurrency(selectedSupplierForTransactions.balance || 0)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuppliersAmount;