'use client';

import { useAuth as useAuthContext } from '@/app/contexts/AuthContext';

export const useAuth = () => {
  return useAuthContext();
};
