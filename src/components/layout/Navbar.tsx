import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { useThemeStore, THEMES } from '@/store/useThemeStore';
import { toast } from 'sonner';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div className="navbar bg-base-100 border-b border-base-200 min-h-[52px] px-4 shrink-0">
      {/* Brand + nav links */}
      <div className="navbar-start gap-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <span className="font-semibold text-sm tracking-tight">JobTracker</span>
        </div>

        <div className="flex items-center gap-1">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `btn btn-ghost btn-sm text-sm ${isActive ? 'bg-primary/10 text-primary font-semibold' : 'text-base-content/60'}`
            }
          >
            Board
          </NavLink>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `btn btn-ghost btn-sm text-sm ${isActive ? 'bg-primary/10 text-primary font-semibold' : 'text-base-content/60'}`
            }
          >
            Dashboard
          </NavLink>
        </div>
      </div>

      {/* Right side */}
      <div className="navbar-end gap-2">
        {/* Theme picker */}
        <div className="dropdown dropdown-end">
          <button tabIndex={0} className="btn btn-ghost btn-sm btn-circle" title="Change theme">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </button>
          <ul tabIndex={0} className="dropdown-content menu p-2 shadow-lg bg-base-100 border border-base-200 rounded-box w-40 max-h-72 overflow-y-auto flex-nowrap z-50">
            {THEMES.map((t) => (
              <li key={t}>
                <button
                  className={`capitalize text-sm justify-between ${theme === t ? 'bg-primary/10 text-primary font-medium' : ''}`}
                  onClick={() => setTheme(t)}
                >
                  {t}
                  {theme === t && (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="w-px h-5 bg-base-200 mx-1" />

        {/* Avatar + name + logout */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
            {initials}
          </div>
          <span className="text-sm text-base-content/70 hidden sm:block">{user?.name}</span>
        </div>

        <button onClick={handleLogout} className="btn btn-ghost btn-sm text-error hover:bg-error/10">
          Logout
        </button>
      </div>
    </div>
  );
}
