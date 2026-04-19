const Supplier = require('../models/Supplier');
const MilkEntry = require('../models/MilkEntry');

// Generate next supplier ID (MSH1, MSH2, MSH3...)
const generateNextSupplierId = async () => {
    try {
        const lastSupplier = await Supplier.findOne().sort({ createdAt: -1 });
        
        if (!lastSupplier) {
            return 'MSH1';
        }
        
        const lastId = lastSupplier.supplierId;
        console.log('Last ID:', lastId);
        
        if (!lastId || typeof lastId !== 'string') {
            return 'MSH1';
        }
        
        const match = lastId.match(/MSH(\d+)/);
        if (!match) {
            return 'MSH1';
        }
        const lastNumber = parseInt(match[1]);
        const nextNumber = lastNumber + 1;
        return `MSH${nextNumber}`;
    } catch (error) {
        console.error('Error generating ID:', error);
        return 'MSH1';
    }
};

// Get all suppliers
const getSuppliers = async (req, res) => {
    try {
        const suppliers = await Supplier.find().sort({ createdAt: -1 });
        res.json({ success: true, suppliers });
    } catch (error) {
        console.error('Get suppliers error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get supplier by custom ID
const getSupplierByCustomId = async (req, res) => {
    try {
        const { id } = req.params;
        const supplier = await Supplier.findOne({ supplierId: id });
        if (!supplier) {
            return res.status(404).json({ success: false, message: 'Supplier not found' });
        }
        res.json({ success: true, supplier });
    } catch (error) {
        console.error('Get supplier by ID error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Add new supplier
const addSupplier = async (req, res) => {
    try {
        const { name, contact, village } = req.body;
        
        console.log('Received data:', { name, contact, village });
        
        if (!name || !contact || !village) {
            return res.status(400).json({ 
                success: false, 
                message: 'Missing required fields: name, contact, village are required' 
            });
        }
        
        const existing = await Supplier.findOne({ contact });
        if (existing) {
            return res.status(400).json({ 
                success: false, 
                message: `❌ Contact number ${contact} already exists for supplier: ${existing.name}` 
            });
        }
        
        const supplierId = await generateNextSupplierId();
        
        const supplier = new Supplier({ 
            supplierId, 
            name: name.trim(), 
            contact: contact.trim(), 
            village: village.trim(),
            balance: 0
        });
        
        await supplier.save();
        
        console.log('Supplier saved:', supplier);
        
        res.json({ 
            success: true, 
            message: `✅ Supplier added successfully with ID: ${supplierId}`,
            supplier
        });
    } catch (error) {
        console.error('Add supplier error:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Internal server error' 
        });
    }
};

// UPDATE supplier
const updateSupplier = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, contact, village } = req.body;
        
        console.log('Updating supplier:', { id, name, contact, village });
        
        if (!name || !contact || !village) {
            return res.status(400).json({ 
                success: false, 
                message: 'Missing required fields: name, contact, village are required' 
            });
        }
        
        const supplier = await Supplier.findOne({ supplierId: id });
        
        if (!supplier) {
            return res.status(404).json({ 
                success: false, 
                message: `Supplier with ID ${id} not found` 
            });
        }
        
        if (contact !== supplier.contact) {
            const existing = await Supplier.findOne({ 
                contact: contact, 
                supplierId: { $ne: id } 
            });
            if (existing) {
                return res.status(400).json({ 
                    success: false, 
                    message: `❌ Contact number ${contact} already exists for supplier: ${existing.name} (ID: ${existing.supplierId})` 
                });
            }
        }
        
        supplier.name = name.trim();
        supplier.contact = contact.trim();
        supplier.village = village.trim();
        await supplier.save();
        
        await MilkEntry.updateMany(
            { supplierCustomId: id },
            { supplierName: name.trim() }
        );
        
        console.log('Supplier updated:', supplier);
        
        res.json({ 
            success: true, 
            message: `✅ Supplier ${id} updated successfully`,
            supplier
        });
    } catch (error) {
        console.error('Update supplier error:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Internal server error' 
        });
    }
};

// Delete supplier
const deleteSupplier = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Deleting supplier:', id);
        
        const supplier = await Supplier.findOne({ supplierId: id });
        
        if (!supplier) {
            return res.status(404).json({ success: false, message: 'Supplier not found' });
        }
        
        await MilkEntry.deleteMany({ supplierCustomId: id });
        await Supplier.findOneAndDelete({ supplierId: id });
        
        console.log('Supplier deleted:', id);
        
        res.json({ success: true, message: `✅ Supplier ${id} and all entries deleted successfully` });
    } catch (error) {
        console.error('Delete supplier error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Verify supplier login (NEW FUNCTION)
const verifySupplier = async (req, res) => {
    try {
        const { supplierId, contact } = req.body;
        
        console.log('🔐 Verify login request:', { supplierId, contact });
        
        if (!supplierId || !contact) {
            return res.status(400).json({ 
                success: false, 
                message: 'Supplier ID and Contact number are required' 
            });
        }
        
        const supplier = await Supplier.findOne({ 
            supplierId: supplierId.toUpperCase(), 
            contact: contact 
        });
        
        if (!supplier) {
            console.log('❌ Supplier not found:', supplierId, contact);
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid Supplier ID or Contact Number' 
            });
        }
        
        console.log('✅ Supplier found:', supplier.supplierId);
        
        res.json({ 
            success: true, 
            message: 'Login successful',
            supplier: {
                supplierId: supplier.supplierId,
                name: supplier.name,
                contact: supplier.contact,
                village: supplier.village,
                balance: supplier.balance || 0
            }
        });
    } catch (error) {
        console.error('Verify error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getSuppliers,
    getSupplierByCustomId,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    verifySupplier  // ADD THIS
};