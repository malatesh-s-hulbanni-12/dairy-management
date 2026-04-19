import React, { useState, useEffect } from 'react';
import { getTodayEntriesAPI } from '../utils/api';
import { formatCurrency } from '../utils/rateCalculator';

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [entries, setEntries] = useState([]);
    const [summary, setSummary] = useState({ totalMilk: 0, totalAmount: 0 });

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        setLoading(true);
        const result = await getTodayEntriesAPI();
        if (result.success) {
            setEntries(result.entries || []);
            setSummary(result.summary || { totalMilk: 0, totalAmount: 0 });
        }
        setLoading(false);
    };

    return (
        <div className="p-4 md:p-6 pb-20 md:pb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-dairy-gray mb-4 md:mb-6">Dashboard</h2>

            {/* Stats Cards - Mobile responsive grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="card p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-dairy-lightgray text-xs md:text-sm">Today's Milk</p>
                            <p className="text-2xl md:text-3xl font-bold text-dairy-blue">
                                {summary.totalMilk} L
                            </p>
                        </div>
                        <span className="text-3xl md:text-4xl">🥛</span>
                    </div>
                </div>

                <div className="card p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-dairy-lightgray text-xs md:text-sm">Today's Amount</p>
                            <p className="text-2xl md:text-3xl font-bold text-dairy-green">
                                {formatCurrency(summary.totalAmount)}
                            </p>
                        </div>
                        <span className="text-3xl md:text-4xl">💰</span>
                    </div>
                </div>

                <div className="card p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-dairy-lightgray text-xs md:text-sm">Entries</p>
                            <p className="text-2xl md:text-3xl font-bold text-dairy-orange">
                                {entries.length}
                            </p>
                        </div>
                        <span className="text-3xl md:text-4xl">📋</span>
                    </div>
                </div>
            </div>

            {/* Recent Entries - Mobile responsive table */}
            <div className="card p-4">
                <h3 className="text-lg md:text-xl font-bold text-dairy-gray mb-3">Today's Entries</h3>
                
                {loading ? (
                    <p className="text-center text-dairy-lightgray py-8">Loading...</p>
                ) : entries.length === 0 ? (
                    <p className="text-center text-dairy-lightgray py-8">No entries today</p>
                ) : (
                    <div className="overflow-x-auto">
                        {/* Desktop Table View */}
                        <div className="hidden md:block">
                            <table className="w-full text-sm md:text-base">
                                <thead>
                                    <tr className="bg-dairy-blue text-white">
                                        <th className="p-2 md:p-3 text-left">Supplier</th>
                                        <th className="p-2 md:p-3 text-left">Degree</th>
                                        <th className="p-2 md:p-3 text-left">Fat%</th>
                                        <th className="p-2 md:p-3 text-left">Qty (L)</th>
                                        <th className="p-2 md:p-3 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {entries.slice(0, 10).map((entry, index) => (
                                        <tr key={entry._id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-dairy-cream'} border-b`}>
                                            <td className="p-2 md:p-3 font-medium">{entry.supplierName}</td>
                                            <td className="p-2 md:p-3">{entry.degree}°</td>
                                            <td className="p-2 md:p-3">
                                                {entry.fat ? `${entry.fat}%` : <span className="text-dairy-lightgray">-</span>}
                                            </td>
                                            <td className="p-2 md:p-3">{entry.quantity} L</td>
                                            <td className="p-2 md:p-3 text-right font-semibold">{formatCurrency(entry.total)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden space-y-3">
                            {entries.slice(0, 10).map((entry) => (
                                <div key={entry._id} className="bg-dairy-cream p-3 rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <p className="font-bold text-dairy-blue">{entry.supplierName}</p>
                                            <div className="grid grid-cols-2 gap-1 mt-2 text-xs">
                                                <p className="text-dairy-gray">Degree:</p>
                                                <p className="font-semibold">{entry.degree}°</p>
                                                <p className="text-dairy-gray">Fat%:</p>
                                                <p className="font-semibold">{entry.fat ? `${entry.fat}%` : '-'}</p>
                                                <p className="text-dairy-gray">Quantity:</p>
                                                <p className="font-semibold">{entry.quantity} L</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-dairy-green text-lg">{formatCurrency(entry.total)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;