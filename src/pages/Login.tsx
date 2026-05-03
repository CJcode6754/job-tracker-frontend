import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { useThemeStore, THEMES } from '@/store/useThemeStore';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'At least 8 characters'),
  password_confirmation: z.string().min(1, 'Please confirm your password'),
}).refine((d) => d.password === d.password_confirmation, {
  message: "Passwords don't match",
  path: ['password_confirmation'],
});

type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerSchema>;

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="form-control w-full">
      <label className="label py-1">
        <span className="label-text font-medium text-xs uppercase tracking-wider opacity-60">{label}</span>
      </label>
      {children}
      {error && (
        <label className="label py-0.5">
          <span className="label-text-alt text-error font-medium">{error}</span>
        </label>
      )}
    </div>
  );
}

export default function Login() {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { login, register } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const navigate = useNavigate();

  const loginForm = useForm<LoginData>({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm<RegisterData>({ resolver: zodResolver(registerSchema) });

  const handleLogin = async (data: LoginData) => {
    try {
      await login(data.email, data.password);
      navigate('/');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Connection error. Is the server running?';
      toast.error(msg);
    }
  };

  const handleRegister = async (data: RegisterData) => {
    try {
      await register(data.name, data.email, data.password, data.password_confirmation);
      navigate('/');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Could not create account. Try again.';
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-base-300 flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      {/* Decorative background blur */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 blur-[120px] rounded-full" />

      <div className="w-full max-w-5xl flex bg-base-100 rounded-4xl shadow-2xl overflow-hidden border border-base-content/5 relative z-10 min-h-150">

        {/* Left Side: Visual/Hero */}
        <div className="hidden lg:flex w-1/2 bg-linear-to-br from-[#0a0a0a] to-[#1a1a1a] p-12 flex-col justify-between relative overflow-hidden">
          {/* Subtle mesh effect */}
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)', backgroundSize: '24px 24px' }} />

          <div className="relative z-10 flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="text-white font-bold text-lg tracking-tight">HireSight</span>
          </div>

          <div className="relative z-10 space-y-6">
            <h1 className="text-5xl font-black text-white leading-tight">
              Master your <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-purple-400">career journey.</span>
            </h1>
            <p className="text-white/70 text-lg max-w-md font-light leading-relaxed">
              The only platform designed for high-performance job seekers. Organize, automate, and land your dream role.
            </p>

            <div className="flex flex-wrap gap-3 pt-4">
              {[
                'Privacy Focused',
                'AI Powered',
                'Visual Pipeline',
                'Interview Tracking',
              ].map((f) => (
                <div key={f} className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 px-3 py-1.5 rounded-full">
                  <svg className="w-3 h-3 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-white/70 text-[11px] font-bold uppercase tracking-wider">{f}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-4 text-white/40 text-[10px] tracking-widest uppercase">
            <span>© 2026 HireSight Labs</span>
            <div className="w-1 h-1 bg-white/20 rounded-full" />
            <span>Built for Builders</span>
          </div>
        </div>

        <div className="flex-1 p-8 sm:p-12 flex flex-col relative bg-base-100">

          <div className="absolute top-6 right-6">
            <div className="dropdown dropdown-end">
              <button tabIndex={0} className="btn btn-ghost btn-sm btn-circle opacity-40 hover:opacity-100">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </button>
              <ul tabIndex={0} className="dropdown-content menu p-2 shadow-2xl bg-base-100 border border-base-content/5 rounded-2xl w-48 max-h-80 overflow-y-auto z-50">
                {THEMES.map((t) => (
                  <li key={t}>
                    <button
                      className={`capitalize text-sm justify-between ${theme === t ? 'bg-primary text-primary-content' : ''}`}
                      onClick={() => setTheme(t)}
                    >
                      {t}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
            <div className="mb-10 lg:hidden text-center">
              <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h2 className="text-xl font-bold tracking-tight">HireSight</h2>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-black tracking-tight">{tab === 'login' ? 'Welcome Back' : 'Get Started'}</h2>
              <p className="text-base-content/50 text-sm mt-2">
                {tab === 'login' ? 'Continue where you left off.' : 'Start tracking your future today.'}
              </p>
            </div>

            <div className="flex p-1 bg-base-200 rounded-2xl mb-8">
              <button
                onClick={() => setTab('login')}
                className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${tab === 'login' ? 'bg-base-100 shadow-sm text-primary' : 'text-base-content/40 hover:text-base-content'}`}
              >
                Sign In
              </button>
              <button
                onClick={() => setTab('register')}
                className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${tab === 'register' ? 'bg-base-100 shadow-sm text-primary' : 'text-base-content/40 hover:text-base-content'}`}
              >
                Register
              </button>
            </div>

            {tab === 'login' ? (
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-5">
                <Field label="Email Address" error={loginForm.formState.errors.email?.message}>
                  <input
                    className="input input-lg bg-base-200 border-none focus:ring-2 focus:ring-primary/20 rounded-2xl w-full text-sm font-medium"
                    type="email"
                    placeholder="name@company.com"
                    {...loginForm.register('email')}
                  />
                </Field>
                <Field label="Password" error={loginForm.formState.errors.password?.message}>
                  <div className="relative">
                    <input
                      className="input input-lg bg-base-200 border-none focus:ring-2 focus:ring-primary/20 rounded-2xl w-full text-sm font-medium pr-12"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...loginForm.register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-base-content/20 hover:text-primary transition-colors"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </Field>
                <button
                  type="submit"
                  disabled={loginForm.formState.isSubmitting}
                  className="btn btn-primary btn-lg rounded-2xl w-full font-bold shadow-xl shadow-primary/20 border-none"
                >
                  {loginForm.formState.isSubmitting ? <span className="loading loading-spinner" /> : 'Continue to Dashboard'}
                </button>
              </form>
            ) : (
              <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                <Field label="Full Name" error={registerForm.formState.errors.name?.message}>
                  <input className="input bg-base-200 border-none focus:ring-2 focus:ring-primary/20 rounded-2xl w-full text-sm font-medium" type="text" placeholder="Jane Smith" {...registerForm.register('name')} />
                </Field>
                <Field label="Email Address" error={registerForm.formState.errors.email?.message}>
                  <input className="input bg-base-200 border-none focus:ring-2 focus:ring-primary/20 rounded-2xl w-full text-sm font-medium" type="email" placeholder="jane@example.com" {...registerForm.register('email')} />
                </Field>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Password" error={registerForm.formState.errors.password?.message}>
                    <div className="relative">
                      <input
                        className="input input-lg bg-base-200 border-none focus:ring-2 focus:ring-primary/20 rounded-2xl w-full text-sm font-medium pr-12"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...registerForm.register('password')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-base-content/20 hover:text-primary transition-colors"
                      >
                        {showPassword ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </Field>

                  <Field label="Confirm" error={registerForm.formState.errors.password_confirmation?.message}>
                    <div className="relative">
                      <input
                        className="input input-lg bg-base-200 border-none focus:ring-2 focus:ring-primary/20 rounded-2xl w-full text-sm font-medium pr-12"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...registerForm.register('password_confirmation')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-base-content/20 hover:text-primary transition-colors"
                      >
                        {showConfirmPassword ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </Field>
                </div>
                <button
                  type="submit"
                  disabled={registerForm.formState.isSubmitting}
                  className="btn btn-primary btn-lg rounded-2xl w-full font-bold shadow-xl shadow-primary/20 border-none mt-4"
                >
                  {registerForm.formState.isSubmitting ? <span className="loading loading-spinner" /> : 'Create Account'}
                </button>
              </form>
            )}

            <div className="mt-8 pt-8 border-t border-base-200 text-center">
              <p className="text-xs text-base-content/40 leading-relaxed">
                By continuing, you agree to our <span className="underline cursor-pointer">Terms of Service</span> and <span className="underline cursor-pointer">Privacy Policy</span>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
