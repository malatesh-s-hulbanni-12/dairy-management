import React, { useState, useEffect } from 'react';
import { getEntriesByDateAPI } from '../utils/api';
import { formatCurrency } from '../utils/rateCalculator';

const DailyReport = () => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [entries, setEntries] = useState([]);
    const [summary, setSummary] = useState({ totalMilk: 0, totalAmount: 0 });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadEntries();
    }, [selectedDate]);

    const loadEntries = async () => {
        setLoading(true);
        const result = await getEntriesByDateAPI(selectedDate);
        if (result.success) {
            setEntries(result.entries || []);
            setSummary(result.summary || { totalMilk: 0, totalAmount: 0 });
        }
        setLoading(false);
    };

    return (
        <div className="p-4 md:p-6 pb-20 md:pb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-dairy-gray mb-4 md:mb-6">📅 Daily Report</h2>

            <div className="card p-4 mb-6">
                <label className="block text-dairy-gray font-medium mb-2 text-sm md:text-base">Select Date</label>
                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="input-field max-w-xs text-sm md:text-base"
                />
            </div>

            <div className="card p-4">
                <div className="flex flex-col sm:flex-row justify-between mb-4 gap-2">
                    <h3 className="text-lg md:text-xl font-bold">Entries for {selectedDate}</h3>
                    <div className="text-left sm:text-right">
                        <p className="text-dairy-gray text-sm">Total Milk: <span className="font-bold">{summary.totalMilk} L</span></p>
                        <p className="text-dairy-green font-bold text-base md:text-lg">{formatCurrency(summary.totalAmount)}</p>
                    </div>
                </div>

                {loading ? (
                    <p className="text-center text-dairy-lightgray py-8">Loading...</p>
                ) : entries.length === 0 ? (
                    <p className="text-center text-dairy-lightgray py-8">No entries for this date</p>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-dairy-blue text-white">
                                        <th className="p-3 text-left">Supplier</th>
                                        <th className="p-3 text-left">Degree</th>
                                        <th className="p-3 text-left">Fat%</th>
                                        <th className="p-3 text-left">Qty</th>
                                        <th className="p-3 text-left">Rate</th>
                                        <th className="p-3 text-left">Total</th>
                                        <th className="p-3 text-left">Method</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {entries.map((entry, index) => (
                                        <tr key={entry._id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-dairy-cream'} border-b`}>
                                            <td className="p-3 font-medium">{entry.supplierName}</td>
                                            <td className="p-3">{entry.degree}°</td>
                                            <td className="p-3">{entry.fat ? `${entry.fat}%` : '-'}</td>
                                            <td className="p-3">{entry.quantity}L</td>
                                            <td className="p-3">{formatCurrency(entry.rate)}</td>
                                            <td className="p-3 font-semibold">{formatCurrency(entry.total)}</td>
                                            <td className="p-3 text-xs">{entry.method}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="md:hidden space-y-3">
                            {entries.map((entry) => (
                                <div key={entry._id} className="bg-dairy-cream p-3 rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-dairy-blue">{entry.supplierName}</p>
                                            <p className="text-xs text-dairy-gray mt-1">Degree: {entry.degree}° | Fat: {entry.fat ? `${entry.fat}%` : '-'}</p>
                                            <p className="text-xs text-dairy-gray">Qty: {entry.quantity}L | Method: {entry.method === 'Old Method (Degree only)' ? 'Old' : 'New'}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-dairy-green">{formatCurrency(entry.total)}</p>
                                            <p className="text-xs text-dairy-lightgray">@{formatCurrency(entry.rate)}/L</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default DailyReport;