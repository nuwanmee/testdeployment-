// components/ui/badge.tsx
'use client';

import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

interface BadgeProps {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'primary' | 'success' | 'warning' | 'info' | 'dark';
  className?: string;
  children: React.ReactNode;
}

export function Badge({
  variant = 'default',
  className = '',
  children,
  ...props
}: BadgeProps & React.HTMLAttributes<HTMLSpanElement>) {
  // Map variant to Bootstrap badge classes
  const variantClasses = {
    default: 'bg-primary',
    secondary: 'bg-secondary',
    destructive: 'bg-danger',
    outline: 'bg-light text-dark border',
    primary: 'bg-primary',
    success: 'bg-success',
    warning: 'bg-warning',
    info: 'bg-info',
    dark: 'bg-dark'
  };

  const badgeClass = `badge ${variantClasses[variant]} ${className}`;

  return (
    <span
      className={badgeClass}
      {...props}
    >
      {children}
    </span>
  );
}

export default Badge;