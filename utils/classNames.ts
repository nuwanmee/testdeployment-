// src/utils/classNames.ts
export function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
  }