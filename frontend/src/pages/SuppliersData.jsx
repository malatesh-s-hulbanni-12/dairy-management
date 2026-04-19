import React, { useState, useEffect } from 'react';
import { getSuppliers, getAllEntries, getTransactions } from '../utils/api';
import { formatCurrency } from '../utils/rateCalculator';

const SuppliersData = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [supplierAmounts, setSupplierAmounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [totalBalance, setTotalBalance] = useState(0);
    const [totalMilk, setTotalMilk] = useState(0);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            
            // Fetch transactions first
            const transactionsResult = await getTransactions();
            let transactionList = [];
            if (transactionsResult.success) {
                transactionList = transactionsResult.transactions || [];
                console.log(`✅ Loaded ${transactionList.length} transactions`);
            }
            
            // Fetch suppliers
            const suppliersResult = await getSuppliers();
            if (!suppliersResult.success) {
                setLoading(false);
                return;
            }
            
            const allSuppliers = suppliersResult.suppliers || [];
            setSuppliers(allSuppliers);
            console.log(`✅ Loaded ${allSuppliers.length} suppliers`);
            
            // Fetch all milk entries
            const entriesResult = await getAllEntries();
            
            let amounts = [];
            let grandBalance = 0;
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
                
                for (const supplier of allSuppliers) {
                    const supplierData = supplierMilkSummary[supplier.name];
                    const milkQuantity = supplierData ? supplierData.totalMilk : 0;
                    const milkAmountTotal = supplierData ? supplierData.milkAmount : 0;
                    
                    // Calculate total debit for this supplier
                    const debitTransactions = transactionList.filter(t => 
                        t && t.supplierId === supplier.supplierId && t.type === 'debit'
                    );
                    const totalDebit = debitTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
                    
                    // Current Balance = Milk Amount - Debits
                    const currentBalance = milkAmountTotal - totalDebit;
                    
                    console.log(`Supplier ${supplier.supplierId}: Milk=${milkAmountTotal}, Debit=${totalDebit}, Balance=${currentBalance}`);
                    
                    amounts.push({
                        ...supplier,
                        totalMilk: milkQuantity,
                        milkAmount: milkAmountTotal,
                        debitAmount: totalDebit,
                        balance: currentBalance
                    });
                    
                    grandBalance += currentBalance;
                    grandMilk += milkQuantity;
                }
                
                // Sort by balance (highest first)
                amounts.sort((a, b) => b.balance - a.balance);
            } else {
                for (const supplier of allSuppliers) {
                    amounts.push({
                        ...supplier,
                        totalMilk: 0,
                        milkAmount: 0,
                        debitAmount: 0,
                        balance: 0
                    });
                }
            }
            
            setSupplierAmounts(amounts);
            setTotalBalance(grandBalance);
            setTotalMilk(grandMilk);
            console.log('✅ Data loaded successfully');
            
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    // Filter suppliers based on search
    const filteredSuppliers = supplierAmounts.filter(supplier =>
        (supplier.supplierId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (supplier.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (supplier.contact || '').includes(searchTerm) ||
        (supplier.village || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading && suppliers.length === 0) return (
        <div className="p-6 text-center text-dairy-gray">
            <div className="animate-pulse">Loading suppliers data...</div>
        </div>
    );

    return (
        <div className="p-4 md:p-6 pb-20 md:pb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 md:mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-dairy-gray">📋 Suppliers Data</h2>
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
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
                <div className="card p-4 bg-dairy-orange/10">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-dairy-lightgray text-xs md:text-sm">Total Balance (All Time)</p>
                            <p className="text-2xl md:text-3xl font-bold text-dairy-orange">{formatCurrency(totalBalance)}</p>
                        </div>
                        <span className="text-3xl">💰</span>
                    </div>
                </div>
            </div>

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
                                <th className="p-3 text-right">Current Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSuppliers.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-dairy-lightgray">
                                        No suppliers found
                                    </td>
                                </tr>
                            ) : (
                                filteredSuppliers.map((supplier, index) => (
                                    <tr key={supplier._id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-dairy-cream'} border-b`}>
                                        <td className="p-3 font-mono font-bold text-dairy-blue">{supplier.supplierId}</td>
                                        <td className="p-3 font-medium">{supplier.name}</td>
                                        <td className="p-3">{supplier.contact}</td>
                                        <td className="p-3">{supplier.village}</td>
                                        <td className="p-3">
                                            <span className="font-semibold">{supplier.totalMilk} L</span>
                                        </td>
                                        <td className="p-3 text-right">
                                            <span className="font-bold text-dairy-green">{formatCurrency(supplier.balance || 0)}</span>
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
                        <div key={supplier._id} className="card p-4">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <p className="font-bold text-dairy-blue text-lg">{supplier.supplierId}</p>
                                    <p className="font-semibold text-dairy-gray text-base mt-1">{supplier.name}</p>
                                    <div className="mt-2 space-y-1">
                                        <p className="text-dairy-gray text-sm">📞 {supplier.contact}</p>
                                        <p className="text-dairy-gray text-sm">🏠 {supplier.village}</p>
                                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-dairy-cream">
                                            <p className="text-dairy-gray text-sm">🥛 Total Milk:</p>
                                            <p className="font-semibold text-dairy-blue">{supplier.totalMilk} L</p>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <p className="text-dairy-gray text-sm">💰 Current Balance:</p>
                                            <p className="font-bold text-dairy-green">{formatCurrency(supplier.balance || 0)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default SuppliersData;