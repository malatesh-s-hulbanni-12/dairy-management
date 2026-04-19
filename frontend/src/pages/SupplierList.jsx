import React, { useState, useEffect } from 'react';
import { getSuppliers, addSupplierAPI, deleteSupplierAPI, updateSupplierAPI } from '../utils/api';

const SupplierList = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [newSupplier, setNewSupplier] = useState({ name: '', contact: '', village: '' });
    const [editSupplierData, setEditSupplierData] = useState({ name: '', contact: '', village: '' });
    const [message, setMessage] = useState(null);

    useEffect(() => {
        loadSuppliers();
    }, []);

    const loadSuppliers = async () => {
        setLoading(true);
        const result = await getSuppliers();
        if (result.success) {
            setSuppliers(result.suppliers);
        }
        setLoading(false);
    };

    const handleAddSupplier = async () => {
        if (!newSupplier.name || !newSupplier.contact || !newSupplier.village) {
            setMessage({ type: 'error', text: 'Please fill all fields' });
            setTimeout(() => setMessage(null), 3000);
            return;
        }

        const result = await addSupplierAPI(newSupplier);
        if (result.success) {
            setMessage({ type: 'success', text: result.message });
            setNewSupplier({ name: '', contact: '', village: '' });
            setShowForm(false);
            loadSuppliers();
        } else {
            setMessage({ type: 'error', text: result.message || result.error });
        }
        setTimeout(() => setMessage(null), 3000);
    };

    const handleEditClick = (supplier) => {
        setEditingSupplier(supplier);
        setEditSupplierData({
            name: supplier.name,
            contact: supplier.contact,
            village: supplier.village
        });
        setShowEditForm(true);
        setShowForm(false);
    };

    const handleUpdateSupplier = async () => {
        if (!editSupplierData.name || !editSupplierData.contact || !editSupplierData.village) {
            setMessage({ type: 'error', text: 'Please fill all fields' });
            setTimeout(() => setMessage(null), 3000);
            return;
        }

        const result = await updateSupplierAPI(editingSupplier.supplierId, editSupplierData);
        if (result.success) {
            setMessage({ type: 'success', text: result.message });
            setShowEditForm(false);
            setEditingSupplier(null);
            loadSuppliers();
        } else {
            setMessage({ type: 'error', text: result.message || result.error });
        }
        setTimeout(() => setMessage(null), 3000);
    };

    const handleDelete = async (id) => {
        if (confirm(`Delete supplier ${id}? This will also delete all milk entries.`)) {
            const result = await deleteSupplierAPI(id);
            if (result.success) {
                setMessage({ type: 'success', text: result.message });
                loadSuppliers();
            } else {
                setMessage({ type: 'error', text: result.error });
            }
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const cancelEdit = () => {
        setShowEditForm(false);
        setEditingSupplier(null);
        setEditSupplierData({ name: '', contact: '', village: '' });
    };

    return (
        <div className="p-4 md:p-6 pb-20 md:pb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 md:mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-dairy-gray">👥 Suppliers</h2>
                <button 
                    onClick={() => {
                        setShowForm(!showForm);
                        setShowEditForm(false);
                        setEditingSupplier(null);
                    }} 
                    className={`${showForm ? 'btn-danger' : 'btn-secondary'} px-4 py-2 text-sm w-full sm:w-auto`}
                >
                    {showForm ? '✖ Cancel' : '➕ Add Supplier'}
                </button>
            </div>

            {/* Message */}
            {message && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-100 text-dairy-green' : 'bg-red-100 text-dairy-red'}`}>
                    {message.type === 'success' ? '✅' : '⚠️'} {message.text}
                </div>
            )}

            {/* Add Supplier Form */}
            {showForm && (
                <div className="card p-4 mb-6">
                    <h3 className="text-lg md:text-xl font-bold mb-3">New Supplier</h3>
                    <p className="text-xs text-dairy-blue mb-3">ID will be auto-generated as MSH1, MSH2, MSH3...</p>
                    <div className="space-y-3">
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={newSupplier.name}
                            onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})}
                            className="input-field text-sm md:text-base"
                        />
                        <input
                            type="tel"
                            placeholder="Mobile Number"
                            value={newSupplier.contact}
                            onChange={(e) => setNewSupplier({...newSupplier, contact: e.target.value})}
                            className="input-field text-sm md:text-base"
                        />
                        <input
                            type="text"
                            placeholder="Village"
                            value={newSupplier.village}
                            onChange={(e) => setNewSupplier({...newSupplier, village: e.target.value})}
                            className="input-field text-sm md:text-base"
                        />
                        <button onClick={handleAddSupplier} className="btn-primary w-full py-2">
                            Save Supplier
                        </button>
                    </div>
                </div>
            )}

            {/* Edit Supplier Form */}
            {showEditForm && editingSupplier && (
                <div className="card p-4 mb-6">
                    <h3 className="text-lg md:text-xl font-bold mb-3">Edit Supplier: {editingSupplier.supplierId}</h3>
                    <div className="space-y-3">
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={editSupplierData.name}
                            onChange={(e) => setEditSupplierData({...editSupplierData, name: e.target.value})}
                            className="input-field text-sm md:text-base"
                        />
                        <input
                            type="tel"
                            placeholder="Mobile Number"
                            value={editSupplierData.contact}
                            onChange={(e) => setEditSupplierData({...editSupplierData, contact: e.target.value})}
                            className="input-field text-sm md:text-base"
                        />
                        <input
                            type="text"
                            placeholder="Village"
                            value={editSupplierData.village}
                            onChange={(e) => setEditSupplierData({...editSupplierData, village: e.target.value})}
                            className="input-field text-sm md:text-base"
                        />
                        <div className="flex gap-3">
                            <button onClick={handleUpdateSupplier} className="btn-primary flex-1 py-2">
                                💾 Update Supplier
                            </button>
                            <button onClick={cancelEdit} className="btn-danger px-6 py-2">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Suppliers List */}
            {loading ? (
                <p className="text-center text-dairy-lightgray py-8">Loading...</p>
            ) : suppliers.length === 0 ? (
                <p className="text-center text-dairy-lightgray py-8">No suppliers found</p>
            ) : (
                <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block card overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-dairy-blue text-white">
                                    <th className="p-3 text-left">Supplier ID</th>
                                    <th className="p-3 text-left">Name</th>
                                    <th className="p-3 text-left">Contact</th>
                                    <th className="p-3 text-left">Village</th>
                                    <th className="p-3 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {suppliers.map((supplier, index) => (
                                    <tr key={supplier._id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-dairy-cream'} border-b`}>
                                        <td className="p-3 font-mono font-bold text-dairy-blue">{supplier.supplierId}</td>
                                        <td className="p-3 font-medium">{supplier.name}</td>
                                        <td className="p-3">{supplier.contact}</td>
                                        <td className="p-3">{supplier.village}</td>
                                        <td className="p-3">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEditClick(supplier)}
                                                    className="bg-dairy-orange text-white px-3 py-1 rounded text-sm hover:opacity-80"
                                                >
                                                    ✏️ Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(supplier.supplierId)}
                                                    className="bg-dairy-red text-white px-3 py-1 rounded text-sm hover:opacity-80"
                                                >
                                                    🗑️ Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-3">
                        {suppliers.map((supplier) => (
                            <div key={supplier._id} className="card p-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <p className="font-bold text-dairy-blue text-lg">{supplier.supplierId}</p>
                                        <p className="font-semibold text-dairy-gray">{supplier.name}</p>
                                        <p className="text-dairy-gray text-sm mt-1">📞 {supplier.contact}</p>
                                        <p className="text-dairy-lightgray text-sm">🏠 {supplier.village}</p>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={() => handleEditClick(supplier)}
                                            className="bg-dairy-orange text-white px-3 py-1 rounded text-sm"
                                        >
                                            ✏️ Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(supplier.supplierId)}
                                            className="bg-dairy-red text-white px-3 py-1 rounded text-sm"
                                        >
                                            🗑️ Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default SupplierList;