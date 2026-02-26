import React, { useState, useEffect } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import InventoryIcon from '@mui/icons-material/Inventory';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SaveIcon from '@mui/icons-material/Save';

interface AddOperationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (data: any) => void;
    type: 'inventory' | 'library' | 'transport';
    initialData?: any;
}

export default function AddOperationModal({ isOpen, onClose, onAdd, type, initialData }: AddOperationModalProps) {
    const [formData, setFormData] = useState<any>({});

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData(initialData);
            } else {
                // Reset form based on type
                if (type === 'inventory') {
                    setFormData({ name: '', category: 'Stationary', quantity: 10, reorderLevel: 5, unitPrice: 0 });
                } else if (type === 'library') {
                    setFormData({ title: '', author: '', isbn: '', category: 'General', totalCopies: 1, availableCopies: 1 });
                } else {
                    setFormData({ plateNumber: '', model: '', capacity: 14, driverName: '', driverPhone: '', status: 'Active' });
                }
            }
        }
    }, [isOpen, type, initialData]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd(formData);
        onClose();
    };

    const getTitle = () => {
        const action = initialData ? 'Edit' : 'Add';
        if (type === 'inventory') return `${action} Inventory Item`;
        if (type === 'library') return `${action} Library Book`;
        return `${action} Transport Vehicle`;
    };

    const getIcon = () => {
        if (type === 'inventory') return <InventoryIcon />;
        if (type === 'library') return <MenuBookIcon />;
        return <LocalShippingIcon />;
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content animate-in" style={{ maxWidth: 500 }}>
                <div className="modal-header">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                            {getIcon()}
                        </div>
                        <h3>{getTitle()}</h3>
                    </div>
                    <button className="close-btn" onClick={onClose}><CloseIcon /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid gap-4">
                        {type === 'inventory' && (
                            <>
                                <div className="form-group">
                                    <label>Item Name</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        value={formData.name} 
                                        onChange={e => setFormData({...formData, name: e.target.value})} 
                                        required 
                                        placeholder="e.g. Chalk Box"
                                    />
                                </div>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label>Category</label>
                                        <select 
                                            className="form-control" 
                                            value={formData.category} 
                                            onChange={e => setFormData({...formData, category: e.target.value})}
                                        >
                                            <option value="Stationary">Stationary</option>
                                            <option value="Furniture">Furniture</option>
                                            <option value="Labs">Lab Equipment</option>
                                            <option value="Sports">Sports Gear</option>
                                            <option value="Other">Other Assets</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Unit Price (KES)</label>
                                        <input 
                                            type="number" 
                                            className="form-control" 
                                            value={formData.unitPrice} 
                                            onChange={e => setFormData({...formData, unitPrice: parseFloat(e.target.value)})} 
                                            required 
                                        />
                                    </div>
                                </div>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label>Current Stock</label>
                                        <input 
                                            type="number" 
                                            className="form-control" 
                                            value={formData.quantity} 
                                            onChange={e => setFormData({...formData, quantity: parseInt(e.target.value)})} 
                                            required 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Reorder Level</label>
                                        <input 
                                            type="number" 
                                            className="form-control" 
                                            value={formData.reorderLevel} 
                                            onChange={e => setFormData({...formData, reorderLevel: parseInt(e.target.value)})} 
                                            required 
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {type === 'library' && (
                            <>
                                <div className="form-group">
                                    <label>Book Title</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        value={formData.title} 
                                        onChange={e => setFormData({...formData, title: e.target.value})} 
                                        required 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Author</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        value={formData.author} 
                                        onChange={e => setFormData({...formData, author: e.target.value})} 
                                        required 
                                    />
                                </div>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label>ISBN / Reference</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            value={formData.isbn} 
                                            onChange={e => setFormData({...formData, isbn: e.target.value})} 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Total Copies</label>
                                        <input 
                                            type="number" 
                                            className="form-control" 
                                            value={formData.totalCopies} 
                                            onChange={e => {
                                                const val = parseInt(e.target.value);
                                                setFormData({...formData, totalCopies: val, availableCopies: val});
                                            }} 
                                            required 
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {type === 'transport' && (
                            <>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label>Plate Number</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            value={formData.plateNumber} 
                                            onChange={e => setFormData({...formData, plateNumber: e.target.value.toUpperCase()})} 
                                            required 
                                            placeholder="KAA 001A"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Vehicle Model</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            value={formData.model} 
                                            onChange={e => setFormData({...formData, model: e.target.value})} 
                                            placeholder="Toyota Coaster"
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Capacity (Seats)</label>
                                    <input 
                                        type="number" 
                                        className="form-control" 
                                        value={formData.capacity} 
                                        onChange={e => setFormData({...formData, capacity: parseInt(e.target.value)})} 
                                        required 
                                    />
                                </div>
                                <div className="grid-2">
                                    <div className="form-group">
                                        <label>Driver Name</label>
                                        <input 
                                            type="text" 
                                            className="form-control" 
                                            value={formData.driverName} 
                                            onChange={e => setFormData({...formData, driverName: e.target.value})} 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Driver Phone</label>
                                        <input 
                                            type="tel" 
                                            className="form-control" 
                                            value={formData.driverPhone} 
                                            onChange={e => setFormData({...formData, driverPhone: e.target.value})} 
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="modal-footer mt-6">
                        <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px' }}>
                            <SaveIcon className="mr-2" /> {initialData ? 'Update Record' : 'Save Record'}
                        </button>
                    </div>
                </form>
            </div>
            <style jsx>{`
                .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
                .mt-6 { margin-top: 24px; }
                .close-btn { background: none; border: none; font-size: 24px; cursor: pointer; color: #64748b; }
            `}</style>
        </div>
    );
}
