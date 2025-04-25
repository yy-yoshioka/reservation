'use client';

import { useAuth } from '@/app/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/app/lib/utils';

interface AuthLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function AuthLayout({ children, className }: AuthLayoutProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (user) {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="text-xl font-bold text-blue-600">
            Reservation System
          </Link>
        </div>
      </header>

      <main className={cn('flex-grow flex items-center justify-center', className)}>
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">{children}</div>
      </main>

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
