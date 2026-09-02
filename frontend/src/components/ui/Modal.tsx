import React from 'react';
export function Modal({ children }: { children: React.ReactNode }) {
    return <div className="fixed inset-0 bg-black/50 p-4">{children}</div>;
}
