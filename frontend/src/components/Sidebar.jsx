import React from 'react';

const Sidebar = ({ activePage, setActivePage }) => {
    const [isMobileOpen, setIsMobileOpen] = React.useState(false);

    const menuItems = [
        { id: 'dashboard', name: 'Dashboard', icon: '📊' },
        { id: 'addEntry', name: 'Add Entry', icon: '➕' },
        { id: 'suppliers', name: 'Suppliers', icon: '👥' },
        { id: 'suppliersData', name: 'Suppliers Data', icon: '📋' },
        { id: 'suppliersAmount', name: 'Suppliers Amount', icon: '💰' },
        { id: 'rates', name: 'Rates', icon: '⚙️' },
        { id: 'dailyReport', name: 'Daily Report', icon: '📅' },
        { id: 'monthlyReport', name: 'Monthly Report', icon: '📈' },
    ];

    const handleMenuClick = (id) => {
        setActivePage(id);
        setIsMobileOpen(false);
    };

    return (
        <>
            {/* Mobile menu button - fixed at bottom */}
            <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="md:hidden fixed bottom-4 right-4 bg-dairy-blue text-white p-4 rounded-full shadow-lg z-50"
            >
                {isMobileOpen ? '✖' : '☰'}
            </button>

            {/* Sidebar for desktop */}
            <div className={`fixed md:relative z-40 w-64 bg-dairy-cream min-h-screen p-4 shadow-md transition-transform duration-300 ${
                isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
            }`}>
                <div className="space-y-2">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handleMenuClick(item.id)}
                            className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${
                                activePage === item.id
                                    ? 'bg-dairy-blue text-white'
                                    : 'hover:bg-dairy-blue/20 text-dairy-gray'
                            }`}
                        >
                            <span className="text-xl">{item.icon}</span>
                            <span className="text-sm md:text-base">{item.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Overlay for mobile */}
            {isMobileOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}
        </>
    );
};

export default Sidebar;