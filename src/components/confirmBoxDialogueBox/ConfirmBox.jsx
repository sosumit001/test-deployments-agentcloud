import React from 'react';

export default function ConfirmBox({ open, onClose, onConfirm, title, message }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded shadow-xl">
                <h3 className="text-lg font-bold">{title}</h3>
                <p className="mt-2">{message}</p>
                <div className="mt-4 flex justify-end space-x-2">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                    <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded">Confirm</button>
                </div>
            </div>
        </div>
    );
}
