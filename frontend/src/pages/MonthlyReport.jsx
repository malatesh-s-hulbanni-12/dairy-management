import React, { useState, useEffect } from 'react';
import { getEntriesByMonthAPI } from '../utils/api';
import { formatCurrency } from '../utils/rateCalculator';

const MonthlyReport = () => {
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
    const [supplierSummary, setSupplierSummary] = useState({});
    const [summary, setSummary] = useState({ totalMilk: 0, totalAmount: 0 });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadReport();
    }, [selectedMonth]);

    const loadReport = async () => {
        setLoading(true);
        const result = await getEntriesByMonthAPI(selectedMonth);
        if (result.success) {
            setSupplierSummary(result.supplierSummary || {});
            setSummary(result.summary || { totalMilk: 0, totalAmount: 0 });
        }
        setLoading(false);
    };

    const formatMonth = (yearMonth) => {
        const [year, month] = yearMonth.split('-');
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${monthNames[parseInt(month) - 1]} ${year}`;
    };

    return (
        <div className="p-4 md:p-6 pb-20 md:pb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-dairy-gray mb-4 md:mb-6">📈 Monthly Report</h2>

            <div className="card p-4 mb-6">
                <label className="block text-dairy-gray font-medium mb-2 text-sm md:text-base">Select Month</label>
                <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="input-field max-w-xs text-sm md:text-base"
                />
            </div>

            <div className="card p-4">
                <div className="flex flex-col sm:flex-row justify-between mb-4 gap-2">
                    <h3 className="text-lg md:text-xl font-bold">{formatMonth(selectedMonth)} Summary</h3>
                    <div className="text-left sm:text-right">
                        <p className="text-dairy-gray text-sm">Total Milk: <span className="font-bold">{summary.totalMilk} L</span></p>
                        <p className="text-dairy-green font-bold text-base md:text-lg">{formatCurrency(summary.totalAmount)}</p>
                    </div>
                </div>

                {loading ? (
                    <p className="text-center text-dairy-lightgray py-8">Loading...</p>
                ) : Object.keys(supplierSummary).length === 0 ? (
                    <p className="text-center text-dairy-lightgray py-8">No entries for this month</p>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-dairy-blue text-white">
                                        <th className="p-3 text-left">Supplier Name</th>
                                        <th className="p-3 text-left">Total Milk (L)</th>
                                        <th className="p-3 text-left">Total Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(supplierSummary).map(([name, data], index) => (
                                        <tr key={name} className={`${index % 2 === 0 ? 'bg-white' : 'bg-dairy-cream'} border-b`}>
                                            <td className="p-3 font-medium">{name}</td>
                                            <td className="p-3">{data.totalMilk} L</td>
                                            <td className="p-3 font-semibold text-dairy-green">{formatCurrency(data.totalAmount)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="md:hidden space-y-3">
                            {Object.entries(supplierSummary).map(([name, data]) => (
                                <div key={name} className="bg-dairy-cream p-4 rounded-lg">
                                    <p className="font-bold text-dairy-blue text-base">{name}</p>
                                    <div className="flex justify-between mt-2">
                                        <p className="text-dairy-gray">Total Milk:</p>
                                        <p className="font-semibold">{data.totalMilk} L</p>
                                    </div>
                                    <div className="flex justify-between mt-1">
                                        <p className="text-dairy-gray">Total Amount:</p>
                                        <p className="font-bold text-dairy-green">{formatCurrency(data.totalAmount)}</p>
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

export default MonthlyReport;