import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export function Card({ children, className = '', ...props }: CardProps) {
    return (
        <div className={`bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm p-4 ${className}`} {...props}>
            {children}
        </div>
    );
}
