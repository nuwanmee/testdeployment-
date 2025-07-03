// components/ui/Card.tsx
'use client'

import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-lg border bg-card text-card-foreground shadow-sm',
        className
      )}
      {...props}
    />
  )
)
Card.displayName = 'Card'

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 p-6', className)}
      {...props}
    />
  )
)
CardHeader.displayName = 'CardHeader'

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

const CardTitle = forwardRef<HTMLParagraphElement, CardTitleProps>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        'text-2xl font-semibold leading-none tracking-tight',
        className
      )}
      {...props}
    />
  )
)
CardTitle.displayName = 'CardTitle'

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  )
)
CardContent.displayName = 'CardContent'

export { Card, CardHeader, CardTitle, CardContent }



// 'use client';

// import React from 'react';
// import 'bootstrap/dist/css/bootstrap.min.css';

// interface CardProps {
//   className?: string;
//   children: React.ReactNode;
// }

// export function Card({ className = '', children }: CardProps) {
//   return (
//     <div className={`card ${className}`}>
//       {children}
//     </div>
//   );
// }

// interface CardHeaderProps {
//   className?: string;
//   children: React.ReactNode;
// }

// export function CardHeader({ className = '', children }: CardHeaderProps) {
//   return (
//     <div className={`card-header ${className}`}>
//       {children}
//     </div>
//   );
// }

// interface CardContentProps {
//   className?: string;
//   children: React.ReactNode;
// }

// export function CardContent({ className = '', children }: CardContentProps) {
//   return (
//     <div className={`card-body ${className}`}>
//       {children}
//     </div>
//   );
// }

// interface CardFooterProps {
//   className?: string;
//   children: React.ReactNode;
// }

// export function CardFooter({ className = '', children }: CardFooterProps) {
//   return (
//     <div className={`card-footer ${className}`}>
//       {children}
//     </div>
//   );
// }