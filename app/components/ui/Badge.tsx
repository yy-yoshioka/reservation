'use client';

import { cn } from '@/app/lib/utils';
import React from 'react';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
}

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  className,
}: BadgeProps) {
  const variantStyles = {
    default: "bg-gray-100 text-gray-800",
    primary: "bg-blue-100 text-blue-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    danger: "bg-red-100 text-red-800",
    info: "bg-indigo-100 text-indigo-800",
  };
  
  const sizeStyles = {
    sm: "text-xs px-2 py-0.5",
    md: "text-xs px-2.5 py-0.5",
    lg: "text-sm px-3 py-1",
  };
  
  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
}