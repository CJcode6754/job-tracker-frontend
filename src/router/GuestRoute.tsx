import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';

export default function GuestRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore();
  
  if (loading) return null; // Wait for initialization
  if (user) return <Navigate to="/" replace />;
  
  return <>{children}</>;
}
