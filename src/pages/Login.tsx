import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';

const loginSchema = z.object({
  email:    z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
  name:                  z.string().min(1, 'Name is required'),
  email:                 z.string().email('Invalid email'),
  password:              z.string().min(8, 'Password must be at least 8 characters'),
  password_confirmation: z.string().min(1, 'Please confirm your password'),
}).refine((d) => d.password === d.password_confirmation, {
  message: "Passwords don't match",
  path: ['password_confirmation'],
});

type LoginData    = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerSchema>;

export default function Login() {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const { login, register } = useAuthStore();
  const navigate = useNavigate();

  const loginForm = useForm<LoginData>({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm<RegisterData>({ resolver: zodResolver(registerSchema) });

  const handleLogin = async (data: LoginData) => {
    try {
      await login(data.email, data.password);
      navigate('/');
    } catch {
      toast.error('Invalid email or password.');
    }
  };

  const handleRegister = async (data: RegisterData) => {
    try {
      await register(data.name, data.email, data.password, data.password_confirmation);
      navigate('/');
    } catch {
      toast.error('Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-center mb-2">Job Tracker</h1>
        <p className="text-sm text-gray-500 text-center mb-6">Manage your entire job search pipeline</p>

        {/* Tabs */}
        <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
          <button
            onClick={() => setTab('login')}
            className={`flex-1 text-sm py-2 rounded-md font-medium transition-colors ${
              tab === 'login' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setTab('register')}
            className={`flex-1 text-sm py-2 rounded-md font-medium transition-colors ${
              tab === 'register' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Register
          </button>
        </div>

        {/* Login Form */}
        {tab === 'login' && (
          <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                {...loginForm.register('email')}
                type="email"
                placeholder="you@example.com"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {loginForm.formState.errors.email && (
                <p className="text-red-500 text-xs mt-1">{loginForm.formState.errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                {...loginForm.register('password')}
                type="password"
                placeholder="••••••••"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {loginForm.formState.errors.password && (
                <p className="text-red-500 text-xs mt-1">{loginForm.formState.errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loginForm.formState.isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {loginForm.formState.isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>

            <p className="text-center text-xs text-gray-500">
              Don't have an account?{' '}
              <button type="button" onClick={() => setTab('register')} className="text-indigo-600 hover:underline">
                Register
              </button>
            </p>
          </form>
        )}

        {/* Register Form */}
        {tab === 'register' && (
          <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                {...registerForm.register('name')}
                type="text"
                placeholder="John Doe"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {registerForm.formState.errors.name && (
                <p className="text-red-500 text-xs mt-1">{registerForm.formState.errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                {...registerForm.register('email')}
                type="email"
                placeholder="you@example.com"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {registerForm.formState.errors.email && (
                <p className="text-red-500 text-xs mt-1">{registerForm.formState.errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                {...registerForm.register('password')}
                type="password"
                placeholder="Min. 8 characters"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {registerForm.formState.errors.password && (
                <p className="text-red-500 text-xs mt-1">{registerForm.formState.errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Confirm Password</label>
              <input
                {...registerForm.register('password_confirmation')}
                type="password"
                placeholder="••••••••"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {registerForm.formState.errors.password_confirmation && (
                <p className="text-red-500 text-xs mt-1">{registerForm.formState.errors.password_confirmation.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={registerForm.formState.isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {registerForm.formState.isSubmitting ? 'Creating account...' : 'Create Account'}
            </button>

            <p className="text-center text-xs text-gray-500">
              Already have an account?{' '}
              <button type="button" onClick={() => setTab('login')} className="text-indigo-600 hover:underline">
                Sign In
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
