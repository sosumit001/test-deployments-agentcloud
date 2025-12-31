import React from 'react';

export default function NoTelephonyCalls({ title, description, primaryButtonText, onPrimaryClick }) {
    return (
        <div className="flex flex-col items-center justify-center h-64 text-center">
            <h3 className="text-lg font-medium text-gray-300">{title}</h3>
            <p className="mt-1 text-sm text-gray-500">{description}</p>
            <button
                onClick={onPrimaryClick}
                className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
                {primaryButtonText}
            </button>
        </div>
    );
}
