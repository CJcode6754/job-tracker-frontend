import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <span className="font-bold text-indigo-600">Job Tracker</span>
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `text-sm font-medium ${isActive ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-800'}`
          }
        >
          Board
        </NavLink>
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `text-sm font-medium ${isActive ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-800'}`
          }
        >
          Dashboard
        </NavLink>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500">{user?.name}</span>
        <button
          onClick={handleLogout}
          className="text-sm text-red-500 hover:text-red-700 font-medium"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
