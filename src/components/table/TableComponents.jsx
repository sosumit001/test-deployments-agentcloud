import React from 'react';

export function Table({ children }) {
    return <table className="w-full text-left border-collapse">{children}</table>;
}

export function TableContainer({ children }) {
    return <div className="bg-vsdk-card border border-vsdk-border rounded-2xl overflow-hidden">{children}</div>;
}

export function TableHeader({ columns }) {
    return (
        <thead className="bg-vsdk-bg/30 border-b border-vsdk-border">
            <tr>
                {columns.map((col, i) => (
                    <th key={i} className="px-8 py-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        {col.title || ''}
                    </th>
                ))}
            </tr>
        </thead>
    );
}

export function TableRow({ columns, onMouseEnterAction, onMouseLeaveAction }) {
    return (
        <tr
            onMouseEnter={onMouseEnterAction}
            onMouseLeave={onMouseLeaveAction}
            className="border-b border-vsdk-border hover:bg-white/5 transition-colors group"
        >
            {columns.map((col, i) => (
                <td
                    key={i}
                    className={`px-8 py-5 text-sm ${col.onTextClick ? 'cursor-pointer text-vsdk-primary font-mono' : 'text-gray-300'}`}
                    onClick={col.onTextClick}
                >
                    {col.text || (col.actions ? col.actions.map((Action, j) => <Action key={j} />) : null)}
                </td>
            ))}
        </tr>
    );
}
