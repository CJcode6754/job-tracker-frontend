import { createBrowserRouter } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import GuestRoute from './GuestRoute';
import Board from '@/pages/Board';
import Dashboard from '@/pages/Dashboard';
import ApplicationDetail from '@/pages/ApplicationDetail';
import Login from '@/pages/Login';
import About from '@/pages/About';

export const router = createBrowserRouter([
  { path: '/login',    element: <GuestRoute><Login /></GuestRoute> },
  { path: '/register', element: <GuestRoute><Login /></GuestRoute> },
  { path: '/',                 element: <ProtectedRoute><Board /></ProtectedRoute> },
  { path: '/dashboard',        element: <ProtectedRoute><Dashboard /></ProtectedRoute> },
  { path: '/applications/:id', element: <ProtectedRoute><ApplicationDetail /></ProtectedRoute> },
  { path: '/about',            element: <ProtectedRoute><About /></ProtectedRoute> },
]);
