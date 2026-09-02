import React from 'react';
export function Badge({ children }: { children: React.ReactNode }) {
    return <span className="px-2 py-1 bg-gray-200 text-xs rounded">{children}</span>;
}
