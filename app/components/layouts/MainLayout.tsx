'use client';

import { useAuth } from '@/app/hooks/useAuth';
import Navbar from '@/app/components/navigation/Navbar';
import { cn } from '@/app/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function MainLayout({ children, className }: MainLayoutProps) {
  const { user, isLoading } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className={cn('flex-grow container mx-auto px-4 py-8', className)}>{children}</main>

      <footer className="bg-gray-100 border-t">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-gray-600 text-sm">
            &copy; {new Date().getFullYear()} Reservation System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
