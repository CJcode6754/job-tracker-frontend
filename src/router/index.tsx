import { createBrowserRouter } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Board from '@/pages/Board';
import Dashboard from '@/pages/Dashboard';
import ApplicationDetail from '@/pages/ApplicationDetail';
import Login from '@/pages/Login';

export const router = createBrowserRouter([
  { path: '/login',    element: <Login /> },
  { path: '/register', element: <Login /> },
  { path: '/',                 element: <ProtectedRoute><Board /></ProtectedRoute> },
  { path: '/dashboard',        element: <ProtectedRoute><Dashboard /></ProtectedRoute> },
  { path: '/applications/:id', element: <ProtectedRoute><ApplicationDetail /></ProtectedRoute> },
]);
