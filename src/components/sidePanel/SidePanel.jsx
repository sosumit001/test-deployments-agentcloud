import React from 'react';

export default function SidePanel({ children, open, onClose }) {
    if (!open) return null;
    return (
        <div className="fixed inset-y-0 right-0 w-96 bg-gray-900 shadow-xl border-l border-gray-700 p-4 transform transition-transform">
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                Close
            </button>
            {children}
        </div>
    );
}
