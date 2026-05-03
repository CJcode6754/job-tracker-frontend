import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { useThemeStore, THEMES } from '@/store/useThemeStore';
import { toast } from 'sonner';

const loginSchema = z.object({
  email:    z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
  name:                  z.string().min(1, 'Name is required'),
  email:                 z.string().email('Invalid email'),
  password:              z.string().min(8, 'At least 8 characters'),
  password_confirmation: z.string().min(1, 'Please confirm your password'),
}).refine((d) => d.password === d.password_confirmation, {
  message: "Passwords don't match",
  path: ['password_confirmation'],
});

type LoginData    = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerSchema>;

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <fieldset className="fieldset">
      <legend className="fieldset-legend">{label}</legend>
      {children}
      {error && <p className="fieldset-label text-error">{error}</p>}
    </fieldset>
  );
}

export default function Login() {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const { login, register } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const navigate = useNavigate();

  const loginForm    = useForm<LoginData>({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm<RegisterData>({ resolver: zodResolver(registerSchema) });

  const handleLogin = async (data: LoginData) => {
    try {
      await login(data.email, data.password);
      navigate('/');
    } catch {
      toast.error('Incorrect email or password.');
    }
  };

  const handleRegister = async (data: RegisterData) => {
    try {
      await register(data.name, data.email, data.password, data.password_confirmation);
      navigate('/');
    } catch {
      toast.error('Could not create account. Try again.');
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-5/12 bg-primary flex-col justify-between p-12">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary-content/20 flex items-center justify-center">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <span className="text-primary-content font-semibold text-sm">HireSight</span>
        </div>

        <div className="space-y-5">
          <h1 className="text-4xl font-bold text-primary-content leading-tight">
            Your job search,<br />organized.
          </h1>
          <p className="text-primary-content/70 text-sm leading-relaxed">
            Stop losing track of applications in spreadsheets. One board, all your opportunities.
          </p>
          <div className="space-y-3">
            {[
              'Kanban board for your pipeline',
              'AI cover letter generator',
              'Interview round tracking',
              'Pipeline analytics',
            ].map((f) => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-primary-content/20 flex items-center justify-center shrink-0">
                  <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-primary-content/80 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-primary-content/30 text-xs">© 2025 HireSight</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-5">
          {/* Top bar */}
          <div className="flex items-center justify-between">
            <div className="lg:hidden flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center">
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <span className="font-semibold text-sm">HireSight</span>
            </div>
            <div className="dropdown dropdown-end ml-auto">
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
          </div>

          <div>
            <h2 className="text-2xl font-bold">{tab === 'login' ? 'Sign in' : 'Create account'}</h2>
            <p className="text-sm text-base-content/50 mt-1">
              {tab === 'login' ? 'Good to have you back.' : 'Free forever, no credit card needed.'}
            </p>
          </div>

          {/* Tabs */}
          <div role="tablist" className="tabs tabs-box">
            <button role="tab" onClick={() => setTab('login')} className={`tab ${tab === 'login' ? 'tab-active' : ''}`}>Sign In</button>
            <button role="tab" onClick={() => setTab('register')} className={`tab ${tab === 'register' ? 'tab-active' : ''}`}>Register</button>
          </div>

          {/* Login */}
          {tab === 'login' && (
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-3">
              <Field label="Email" error={loginForm.formState.errors.email?.message}>
                <input className="input input-bordered w-full" type="email" placeholder="you@example.com" {...loginForm.register('email')} />
              </Field>
              <Field label="Password" error={loginForm.formState.errors.password?.message}>
                <input className="input input-bordered w-full" type="password" placeholder="••••••••" {...loginForm.register('password')} />
              </Field>
              <button type="submit" disabled={loginForm.formState.isSubmitting} className="btn btn-primary w-full mt-1">
                {loginForm.formState.isSubmitting ? <span className="loading loading-spinner loading-sm" /> : 'Sign In'}
              </button>
              <p className="text-center text-xs text-base-content/50">
                No account?{' '}
                <button type="button" onClick={() => setTab('register')} className="link link-primary">Register free</button>
              </p>
            </form>
          )}

          {/* Register */}
          {tab === 'register' && (
            <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-3">
              <Field label="Full name" error={registerForm.formState.errors.name?.message}>
                <input className="input input-bordered w-full" type="text" placeholder="Jane Smith" {...registerForm.register('name')} />
              </Field>
              <Field label="Email" error={registerForm.formState.errors.email?.message}>
                <input className="input input-bordered w-full" type="email" placeholder="you@example.com" {...registerForm.register('email')} />
              </Field>
              <Field label="Password" error={registerForm.formState.errors.password?.message}>
                <input className="input input-bordered w-full" type="password" placeholder="Min. 8 characters" {...registerForm.register('password')} />
              </Field>
              <Field label="Confirm password" error={registerForm.formState.errors.password_confirmation?.message}>
                <input className="input input-bordered w-full" type="password" placeholder="••••••••" {...registerForm.register('password_confirmation')} />
              </Field>
              <button type="submit" disabled={registerForm.formState.isSubmitting} className="btn btn-primary w-full mt-1">
                {registerForm.formState.isSubmitting ? <span className="loading loading-spinner loading-sm" /> : 'Create Account'}
              </button>
              <p className="text-center text-xs text-base-content/50">
                Have an account?{' '}
                <button type="button" onClick={() => setTab('login')} className="link link-primary">Sign in</button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
