import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore();

  if (loading) return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center flex-col gap-3">
      <span className="loading loading-spinner loading-md text-primary" />
      <p className="text-sm text-base-content/50">Loading...</p>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
