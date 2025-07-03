// components/ui/button.tsx
'use client';

import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children: React.ReactNode;
}

export function Button({
  variant = 'default',
  size = 'default',
  className = '',
  disabled,
  children,
  ...props
}: ButtonProps) {
  // Map variant to Bootstrap classes
  const variantClasses = {
    default: 'btn-primary',
    outline: 'btn-outline-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-light',
    link: 'btn-link',
    destructive: 'btn-danger'
  };

  // Map size to Bootstrap classes
  const sizeClasses = {
    default: '',
    sm: 'btn-sm',
    lg: 'btn-lg',
    icon: 'btn-icon' // This might need custom styling
  };

  const buttonClass = `btn ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <button
      className={buttonClass}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;