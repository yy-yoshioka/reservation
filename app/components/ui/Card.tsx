'use client';

import { cn } from '@/app/lib/utils';
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export function Card({ 
  children, 
  className,
  onClick,
  hoverable = false,
}: CardProps) {
  return (
    <div 
      className={cn(
        "bg-white border rounded-lg shadow-sm overflow-hidden",
        hoverable && "transition-shadow hover:shadow-md",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn("px-6 py-4 border-b", className)}>
      {children}
    </div>
  );
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function CardTitle({ children, className }: CardTitleProps) {
  return (
    <h3 className={cn("text-lg font-medium text-gray-900", className)}>
      {children}
    </h3>
  );
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return (
    <div className={cn("px-6 py-4", className)}>
      {children}
    </div>
  );
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={cn("px-6 py-4 bg-gray-50 border-t", className)}>
      {children}
    </div>
  );
}

export default Object.assign(Card, {
  Header: CardHeader,
  Title: CardTitle,
  Content: CardContent,
  Footer: CardFooter,
});