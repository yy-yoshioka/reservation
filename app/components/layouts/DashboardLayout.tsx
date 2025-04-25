'use client';

import { useAuth } from '@/app/hooks/useAuth';
import Navbar from '@/app/components/navigation/Navbar';
import Sidebar from '@/app/components/navigation/Sidebar';
import { cn } from '@/app/lib/utils';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function DashboardLayout({ children, className }: DashboardLayoutProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-grow flex flex-col md:flex-row">
        <Sidebar />

        <main className={cn('flex-grow p-4 md:p-8', className)}>{children}</main>
      </div>

      <footer className="bg-gray-100 border-t">
        <div className="container mx-auto px-4 py-4">
          <p className="text-center text-gray-600 text-sm">
            &copy; {new Date().getFullYear()} Reservation System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
