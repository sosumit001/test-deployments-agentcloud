import React from 'react';

export default function NoDataTable({ message }) {
    return (
        <div className="flex items-center justify-center h-64 text-gray-400">
            {message || "No data available"}
        </div>
    );
}
