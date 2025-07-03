import * as React from 'react';
import { cn } from '@/lib/utils';

const Switch = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      'inline-flex items-center h-6 rounded-full w-11 transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      'disabled:opacity-50 disabled:pointer-events-none',
      className
    )}
    {...props}
  />
));
Switch.displayName = 'Switch';

export { Switch };