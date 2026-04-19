import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import AddEntry from './pages/AddEntry';
import Suppliers from './pages/SupplierList';
import SuppliersData from './pages/SuppliersData';
import SuppliersAmount from './pages/SuppliersAmount';
import Rates from './pages/Rates';
import DailyReport from './pages/DailyReport';
import MonthlyReport from './pages/MonthlyReport';

function App() {
    const [activePage, setActivePage] = useState('dashboard');
    const [refreshKey, setRefreshKey] = useState(0);

    const handleEntryAdded = () => {
        setRefreshKey(prev => prev + 1);
    };

    const renderPage = () => {
        switch(activePage) {
            case 'dashboard':
                return <Dashboard key={refreshKey} />;
            case 'addEntry':
                return <AddEntry onEntryAdded={handleEntryAdded} />;
            case 'suppliers':
                return <Suppliers />;
            case 'suppliersData':
                return <SuppliersData />;
            case 'suppliersAmount':
                return <SuppliersAmount />;
            case 'rates':
                return <Rates />;
            case 'dailyReport':
                return <DailyReport />;
            case 'monthlyReport':
                return <MonthlyReport />;
            default:
                return <Dashboard key={refreshKey} />;
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <div className="flex flex-1 relative">
                <Sidebar activePage={activePage} setActivePage={setActivePage} />
                <main className="flex-1 bg-white pb-16 md:pb-0">
                    {renderPage()}
                </main>
            </div>
            <Footer />
        </div>
    );
}

export default App;