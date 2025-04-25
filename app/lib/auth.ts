import { createClient } from '@/app/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';

// Use cache to prevent multiple calls to getSession during a single render
export const getSession = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getSession();
  return data.session;
});

// Get the current user
export const getUser = cache(async () => {
  const session = await getSession();
  return session?.user ?? null;
});

// Check if user is authenticated
export const requireAuth = async (redirectTo = '/login') => {
  const session = await getSession();

  if (!session) {
    redirect(redirectTo);
  }

  return session;
};

// Check if user has a specific role
export const requireRole = async (allowedRoles: string[], redirectTo = '/unauthorized') => {
  const session = await requireAuth();
  const user = session.user;

  // Get user role from metadata
  const userRole = user.user_metadata?.role || 'user';

  if (!allowedRoles.includes(userRole)) {
    redirect(redirectTo);
  }

  return { session, role: userRole };
};

// Helper to check if user has admin role
export const requireAdmin = async (redirectTo = '/unauthorized') => {
  return requireRole(['admin'], redirectTo);
};

// Helper to check if user has staff role or higher
export const requireStaff = async (redirectTo = '/unauthorized') => {
  return requireRole(['admin', 'staff'], redirectTo);
};

// Helper to get user role
export const getUserRole = async (defaultRole = 'customer') => {
  const user = await getUser();
  return user?.user_metadata?.role || defaultRole;
};

// Check if user can access a specific resource
export const canAccess = async (resourceOwnerId: string) => {
  const user = await getUser();
  if (!user) return false;

  // Admin can access all resources
  if (user.user_metadata?.role === 'admin') return true;

  // Staff can access all resources
  if (user.user_metadata?.role === 'staff') return true;

  // Users can only access their own resources
  return user.id === resourceOwnerId;
};
