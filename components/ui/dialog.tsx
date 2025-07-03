'use client';

import React, { useState, useEffect, createContext, useContext, forwardRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

// Create context for dialog state management
const DialogContext = createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
}>({
  open: false,
  setOpen: () => {},
});

interface DialogProps {
  children: React.ReactNode;
  className?: string;
  onOpenChange?: (open: boolean) => void;
}

export function Dialog({ children, className = '', onOpenChange }: DialogProps) {
  const [open, setOpen] = useState(false);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
  };

  return (
    <DialogContext.Provider value={{ open, setOpen: handleOpenChange }}>
      <div className={className}>
        {children}
      </div>
    </DialogContext.Provider>
  );
}

interface DialogTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

export const DialogTrigger = forwardRef<
  HTMLDivElement, 
  DialogTriggerProps & React.HTMLAttributes<HTMLDivElement>
>(({ children, asChild = false, ...props }, ref) => {
  const { setOpen } = useContext(DialogContext);
  
  const triggerElement = asChild 
    ? React.cloneElement(children as React.ReactElement, {
        onClick: (e: React.MouseEvent) => {
          e.preventDefault();
          setOpen(true);
          if ((children as React.ReactElement).props.onClick) {
            (children as React.ReactElement).props.onClick(e);
          }
        },
      })
    : (
        <div 
          onClick={() => setOpen(true)}
          style={{ cursor: 'pointer' }}
          ref={ref}
          {...props}
        >
          {children}
        </div>
      );
  
  return triggerElement;
});

DialogTrigger.displayName = 'DialogTrigger';

interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
}

export function DialogContent({ children, className = '' }: DialogContentProps) {
  const { open, setOpen } = useContext(DialogContext);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.classList.add('modal-open');
      setTimeout(() => setMounted(true), 10);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.classList.remove('modal-open');
    };
  }, [open, setOpen]);

  if (!open) {
    return null;
  }

  const backdropClass = `modal-backdrop fade ${mounted ? 'show' : ''}`;
  const modalClass = `modal fade ${mounted ? 'show d-block' : ''}`;
  
  return (
    <>
      <div className={backdropClass} onClick={() => setOpen(false)}></div>
      <div 
        className={modalClass}
        style={{ display: 'block' }}
        tabIndex={-1}
        role="dialog"
      >
        <div className={`modal-dialog modal-dialog-centered ${className}`}>
          <div className="modal-content">
            <div className="modal-header">
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setOpen(false)}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

interface DialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function DialogHeader({ children, className = '' }: DialogHeaderProps) {
  return (
    <div className={`modal-header border-0 p-0 mb-4 ${className}`}>
      {children}
    </div>
  );
}

interface DialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function DialogTitle({ children, className = '' }: DialogTitleProps) {
  return (
    <h5 className={`modal-title ${className}`}>
      {children}
    </h5>
  );
}