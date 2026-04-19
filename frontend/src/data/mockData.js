export const suppliers = [
  { id: 1, name: "Ram Singh", contact: "9876543210", village: "Gokalpur" },
  { id: 2, name: "Shyam Das", contact: "9876543211", village: "Gokalpur" },
  { id: 3, name: "Mohan Lal", contact: "9876543212", village: "Badarpur" },
  { id: 4, name: "Sohan Singh", contact: "9876543213", village: "Badarpur" },
  { id: 5, name: "Ramesh Kumar", contact: "9876543214", village: "Nangloi" },
];

export const milkEntries = [
  {
    id: 1,
    supplierId: 1,
    supplierName: "Ram Singh",
    degree: 32,
    fat: 6.0,
    quantity: 10,
    rate: 78,
    total: 780,
    date: new Date().toISOString().split('T')[0],
    method: "New Method"
  },
  {
    id: 2,
    supplierId: 2,
    supplierName: "Shyam Das",
    degree: 30,
    fat: null,
    quantity: 8,
    rate: 66,
    total: 528,
    date: new Date().toISOString().split('T')[0],
    method: "Old Method"
  },
  {
    id: 3,
    supplierId: 3,
    supplierName: "Mohan Lal",
    degree: 28,
    fat: 4.0,
    quantity: 12,
    rate: 54,
    total: 648,
    date: new Date().toISOString().split('T')[0],
    method: "New Method"
  },
];

let nextEntryId = 4;
let nextSupplierId = 6;

export const addEntry = (entry) => {
  const newEntry = { ...entry, id: nextEntryId++ };
  milkEntries.unshift(newEntry);
  return newEntry;
};

export const addSupplier = (supplier) => {
  const newSupplier = { ...supplier, id: nextSupplierId++ };
  suppliers.push(newSupplier);
  return newSupplier;
};

export const deleteSupplier = (id) => {
  const index = suppliers.findIndex(s => s.id === id);
  if (index !== -1) suppliers.splice(index, 1);
};