import React, { useState, useEffect } from 'react';
import { getSupplierEntries, getSupplierTransactions, getSupplierBalance } from '../utils/api';

const formatCurrency = (amount) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
        return '₹0';
    }
    return `₹${amount.toLocaleString('en-IN')}`;
};

const Dashboard = ({ supplier }) => {
    const [entries, setEntries] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [balance, setBalance] = useState(supplier.balance || 0);
    const [loading, setLoading] = useState(true);
    const [totalMilk, setTotalMilk] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        
        // Get milk entries
        const entriesResult = await getSupplierEntries(supplier.supplierId);
        if (entriesResult.success) {
            setEntries(entriesResult.entries || []);
            const milkTotal = entriesResult.entries.reduce((sum, e) => sum + e.quantity, 0);
            const amountTotal = entriesResult.entries.reduce((sum, e) => sum + e.total, 0);
            setTotalMilk(milkTotal);
            setTotalAmount(amountTotal);
        }
        
        // Get transactions
        const transactionsResult = await getSupplierTransactions(supplier.supplierId);
        if (transactionsResult.success) {
            setTransactions(transactionsResult.transactions || []);
        }
        
        // Get latest balance
        const balanceResult = await getSupplierBalance(supplier.supplierId);
        if (balanceResult.success) {
            setBalance(balanceResult.balance);
        }
        
        setLoading(false);
    };

    const totalDebit = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    const finalBalance = totalAmount - totalDebit;

    if (loading) {
        return (
            <div className="p-6 text-center text-gray-500">
                <div className="animate-pulse">Loading your data...</div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6">
            {/* Welcome Card - Fixed colors */}
            <div className="bg-blue-600 text-white rounded-xl p-4 md:p-6 mb-6 shadow-lg">
                <h2 className="text-xl md:text-2xl font-bold">Welcome, {supplier.name}! 👋</h2>
                <p className="text-blue-100 text-sm mt-1">ID: {supplier.supplierId} | Village: {supplier.village}</p>
                <p className="text-blue-100 text-sm">Contact: {supplier.contact}</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-yellow-50 rounded-xl p-4 shadow-md border border-yellow-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-xs">Total Milk Delivered</p>
                            <p className="text-2xl font-bold text-blue-600">{totalMilk} L</p>
                        </div>
                        <span className="text-3xl">🥛</span>
                    </div>
                </div>
                
                <div className="bg-green-50 rounded-xl p-4 shadow-md border border-green-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-xs">Total Amount Earned</p>
                            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalAmount)}</p>
                        </div>
                        <span className="text-3xl">💰</span>
                    </div>
                </div>
                
                <div className="bg-orange-50 rounded-xl p-4 shadow-md border border-orange-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-xs">Current Balance</p>
                            <p className="text-2xl font-bold text-orange-600">{formatCurrency(finalBalance)}</p>
                        </div>
                        <span className="text-3xl">💳</span>
                    </div>
                </div>
            </div>

            {/* Recent Milk Entries */}
            <div className="bg-white rounded-xl shadow-md p-4 mb-6">
                <h3 className="text-lg font-bold text-gray-700 mb-3">📋 Recent Milk Entries</h3>
                {entries.length === 0 ? (
                    <p className="text-center text-gray-400 py-4">No milk entries found</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-blue-600 text-white">
                                    <th className="p-2 text-left rounded-l-lg">Date</th>
                                    <th className="p-2 text-left">Degree</th>
                                    <th className="p-2 text-left">Fat%</th>
                                    <th className="p-2 text-left">Qty (L)</th>
                                    <th className="p-2 text-left">Rate</th>
                                    <th className="p-2 text-right rounded-r-lg">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {entries.slice(0, 10).map((entry, index) => (
                                    <tr key={entry._id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b`}>
                                        <td className="p-2">{entry.date}</td>
                                        <td className="p-2">{entry.degree}°</td>
                                        <td className="p-2">{entry.fat ? `${entry.fat}%` : '-'}</td>
                                        <td className="p-2">{entry.quantity}</td>
                                        <td className="p-2">{formatCurrency(entry.rate)}</td>
                                        <td className="p-2 text-right font-semibold text-green-600">{formatCurrency(entry.total)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Debit Transactions History */}
            <div className="bg-white rounded-xl shadow-md p-4">
                <h3 className="text-lg font-bold text-gray-700 mb-3">💰 Debit / Payment History</h3>
                {transactions.length === 0 ? (
                    <p className="text-center text-gray-400 py-4">No payment history found</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-orange-500 text-white">
                                    <th className="p-2 text-left rounded-l-lg">Date</th>
                                    <th className="p-2 text-left">Amount</th>
                                    <th className="p-2 text-left rounded-r-lg">Reason</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((transaction, index) => (
                                    <tr key={transaction._id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b`}>
                                        <td className="p-2">{transaction.date}</td>
                                        <td className="p-2 text-red-600 font-semibold">{formatCurrency(transaction.amount)}</td>
                                        <td className="p-2">{transaction.reason}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;