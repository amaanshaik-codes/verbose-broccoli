
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, icon, ...props }, ref) => {
    const hasIcon = icon !== undefined;

    return (
        <div className="relative">
            {hasIcon && <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 dark:text-gray-500">{icon}</span>}
            <input
                type={type}
                className={`w-full ${hasIcon ? 'pl-10' : 'pl-4'} pr-4 py-3 text-base bg-gray-200/50 dark:bg-dark-card border border-gray-300 dark:border-dark-border rounded-lg text-gray-900 dark:text-dark-text placeholder:text-gray-500 dark:placeholder:text-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-apple-blue focus:border-transparent transition-colors duration-200 ${className}`}
                ref={ref}
                {...props}
            />
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
