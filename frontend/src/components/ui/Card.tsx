import React from 'react';
export function Card({ children }: { children: React.ReactNode }) {
    return <div className="border rounded shadow-sm p-4">{children}</div>;
}
