import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    fullWidth?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export function Button({ children, variant = 'primary', fullWidth, size = 'md', className = '', ...props }: ButtonProps) {
    const baseStyle = "inline-flex items-center justify-center font-semibold rounded-full transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none";
    
    let variantStyle = "";
    switch (variant) {
        case 'primary':
            variantStyle = "bg-primary text-on-primary hover:bg-primary-container shadow-sm";
            break;
        case 'secondary':
            variantStyle = "bg-secondary text-on-secondary hover:bg-secondary/90 shadow-sm";
            break;
        case 'outline':
            variantStyle = "border-2 border-outline-variant text-on-surface hover:bg-surface-container-low";
            break;
        case 'ghost':
            variantStyle = "text-on-surface hover:bg-surface-container-low";
            break;
    }

    let sizeStyle = "";
    switch (size) {
        case 'sm':
            sizeStyle = "min-h-[40px] px-4 py-2 text-sm";
            break;
        case 'md':
            sizeStyle = "min-h-[52px] px-6 py-3";
            break;
        case 'lg':
            sizeStyle = "min-h-[56px] px-8 py-4 text-lg";
            break;
    }

    const widthStyle = fullWidth ? "w-full" : "";

    return (
        <button className={`${baseStyle} ${variantStyle} ${sizeStyle} ${widthStyle} ${className}`} {...props}>
            {children}
        </button>
    );
}
