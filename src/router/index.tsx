import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import Board from '@/pages/Board';
import Dashboard from '@/pages/Dashboard';
import ApplicationDetail from '@/pages/ApplicationDetail';
import Login from '@/pages/Login';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuthStore();
  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export const router = createBrowserRouter([
  { path: '/login',    element: <Login /> },
  { path: '/register', element: <Login /> },
  { path: '/',                  element: <ProtectedRoute><Board /></ProtectedRoute> },
  { path: '/dashboard',         element: <ProtectedRoute><Dashboard /></ProtectedRoute> },
  { path: '/applications/:id',  element: <ProtectedRoute><ApplicationDetail /></ProtectedRoute> },
]);