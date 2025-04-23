'use client';

import { useState } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import { supabase } from '@/app/lib/supabase/client';
import { User } from '@/app/types';

export const useUser = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getUserProfile = async (): Promise<User | null> => {
    if (!user) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) {
        setError(error.message);
        return null;
      }
      
      return data as User;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = async (userData: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from('users')
        .update(userData)
        .eq('id', user.id);
        
      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }
      
      return { success: true };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    getUserProfile,
    updateUserProfile,
    isLoading,
    error,
  };
};