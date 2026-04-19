import React from 'react';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const today = new Date().toLocaleDateString('en-IN');

    return (
        <nav className="bg-dairy-blue text-white shadow-lg sticky top-0 z-50">
            <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🥛</span>
                    <h1 className="text-lg md:text-xl font-bold">Dairy Collection</h1>
                </div>
                
                {/* Mobile menu button */}
                <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="md:hidden text-2xl"
                >
                    ☰
                </button>
                
                {/* Desktop date */}
                <div className="hidden md:block text-sm">{today}</div>
            </div>
            
            {/* Mobile menu dropdown */}
            {isMenuOpen && (
                <div className="md:hidden bg-dairy-blue/90 px-4 py-2 text-sm">
                    <p>📅 {today}</p>
                </div>
            )}
        </nav>
    );
};

export default Navbar;