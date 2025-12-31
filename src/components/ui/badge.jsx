import React from 'react';

export function Badge({ children, className, type }) {
    const colors = {
        success: 'bg-green-100 text-green-800',
        danger: 'bg-red-100 text-red-800',
        primary: 'bg-blue-100 text-blue-800',
        default: 'bg-gray-100 text-gray-800'
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[type] || colors.default} ${className}`}>
            {children}
        </span>
    );
}
