import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    icon?: React.ReactNode;
}

export function Input({ icon, className = '', ...props }: InputProps) {
    return (
        <div className="relative w-full">
            <input 
                className={`min-h-[52px] w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all ${icon ? 'pr-12' : ''} ${className}`} 
                {...props} 
            />
            {icon && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                    {icon}
                </div>
            )}
        </div>
    );
}
