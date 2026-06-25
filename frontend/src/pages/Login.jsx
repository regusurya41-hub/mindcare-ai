import { motion } from 'framer-motion';
import { Eye, EyeOff, HeartPulse, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const [show, setShow]       = useState(false);
  const [form, setForm]       = useState({ email: '', password: '' });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const { login }  = useAuth();
  const navigate   = useNavigate();

  function validate() {
    const e = {};
    if (!form.email.includes('@')) e.email    = 'Enter a valid email.';
    if (!form.password.trim())     e.password = 'Password is required.';
    setErrors(e);
    return !Object.keys(e).length;
  }

  async function submit(ev) {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login(form);
      toast.success('Welcome back! 👋');
      navigate('/app');
    } catch (err) {
      const msg = err.response?.data?.message ?? 'Wrong email or password.';
      setErrors({ general: msg });
    } finally { setLoading(false); }
  }

  const set = (k) => (e) => { setForm({ ...form, [k]: e.target.value }); setErrors((p) => ({ ...p, [k]: '' })); };

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: '#070b17' }}>

      {/* ── Ambient blobs ── */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)', filter: 'blur(80px)' }} />
        <div className="absolute -right-32 bottom-0 h-[400px] w-[400px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent 70%)', filter: 'blur(80px)' }} />
        <div className="absolute bottom-1/4 left-1/3 h-[350px] w-[350px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #14b8a6, transparent 70%)', filter: 'blur(80px)' }} />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0,  scale: 1    }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[420px]"
        >
          {/* Card */}
          <div
            className="relative overflow-hidden rounded-[32px] p-8"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.09)',
              boxShadow: '0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
              backdropFilter: 'blur(40px)',
            }}
          >
            {/* Top glow */}
            <div aria-hidden
              className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full opacity-40"
              style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)', filter: 'blur(40px)' }}
            />

            <div className="relative z-10">
              {/* Logo */}
              <Link to="/" className="mb-8 flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 8px 24px rgba(99,102,241,0.35)' }}>
                  <HeartPulse size={20} className="text-white" aria-hidden />
                </div>
                <div>
                  <p className="text-base font-bold text-white">MindCare AI</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Emotional wellness</p>
                </div>
              </Link>

              <h1 className="text-3xl font-black text-white" style={{ letterSpacing: '-0.03em' }}>
                Welcome back
              </h1>
              <p className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Sign in to your private wellness space.
              </p>

              <form onSubmit={submit} className="mt-7 space-y-4" noValidate>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider"
                    style={{ color: 'rgba(255,255,255,0.45)' }}>
                    Email
                  </label>
                  <input
                    id="email" type="email" autoComplete="email"
                    placeholder="Enter your email"
                    value={form.email} onChange={set('email')}
                    className="w-full rounded-2xl px-4 py-3 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/20"
                    style={{
                      background: errors.email ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.06)',
                      border: errors.email ? '1.5px solid rgba(239,68,68,0.5)' : '1.5px solid rgba(255,255,255,0.08)',
                    }}
                    onFocus={e => { if (!errors.email) e.target.style.border = '1.5px solid rgba(99,102,241,0.7)'; e.target.style.background = 'rgba(255,255,255,0.09)'; }}
                    onBlur={e  => { if (!errors.email) e.target.style.border = '1.5px solid rgba(255,255,255,0.08)'; e.target.style.background = 'rgba(255,255,255,0.06)'; }}
                  />
                  {errors.email && <p className="mt-1.5 text-xs font-semibold text-red-400">{errors.email}</p>}
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider"
                    style={{ color: 'rgba(255,255,255,0.45)' }}>
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password" type={show ? 'text' : 'password'} autoComplete="current-password"
                      placeholder="Enter your password"
                      value={form.password} onChange={set('password')}
                      className="w-full rounded-2xl px-4 py-3 pr-12 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/20"
                      style={{
                        background: errors.password ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.06)',
                        border: errors.password ? '1.5px solid rgba(239,68,68,0.5)' : '1.5px solid rgba(255,255,255,0.08)',
                      }}
                      onFocus={e => { if (!errors.password) e.target.style.border = '1.5px solid rgba(99,102,241,0.7)'; e.target.style.background = 'rgba(255,255,255,0.09)'; }}
                      onBlur={e  => { if (!errors.password) e.target.style.border = '1.5px solid rgba(255,255,255,0.08)'; e.target.style.background = 'rgba(255,255,255,0.06)'; }}
                    />
                    <button type="button" onClick={() => setShow(!show)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 transition-colors"
                      style={{ color: 'rgba(255,255,255,0.35)' }}
                      aria-label="Toggle password"
                    >
                      {show ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1.5 text-xs font-semibold text-red-400">{errors.password}</p>}
                  <div className="mt-2 flex justify-end">
                    <Link to="/forgot-password" className="text-xs font-semibold transition-colors"
                      style={{ color: 'rgba(139,92,246,0.8)' }}
                      onMouseEnter={e => e.target.style.color = '#a78bfa'}
                      onMouseLeave={e => e.target.style.color = 'rgba(139,92,246,0.8)'}
                    >
                      Forgot password?
                    </Link>
                  </div>
                </div>

                {/* General error */}
                {errors.general && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl px-4 py-3 text-sm font-semibold text-red-300"
                    style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.20)' }}
                    role="alert"
                  >
                    {errors.general}
                  </motion.div>
                )}

                {/* Submit */}
                <button type="submit" disabled={loading}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-white transition-all duration-200 disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    boxShadow: '0 8px 32px rgba(99,102,241,0.35)',
                  }}
                  onMouseEnter={e => !loading && (e.currentTarget.style.transform = 'translateY(-1px)', e.currentTarget.style.boxShadow = '0 12px 40px rgba(99,102,241,0.45)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)', e.currentTarget.style.boxShadow = '0 8px 32px rgba(99,102,241,0.35)')}
                >
                  {loading ? <LoadingSpinner label="Signing in..." /> : 'Login'}
                </button>
              </form>

              {/* Trust + footer */}
              <div className="mt-6 flex items-center justify-center gap-1.5 text-xs"
                style={{ color: 'rgba(255,255,255,0.25)' }}>
                <ShieldCheck size={12} aria-hidden />
                Encrypted · Anonymous · No ads
              </div>

              <p className="mt-4 text-center text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                New here?{' '}
                <Link to="/signup" className="font-bold transition-colors"
                  style={{ color: '#a78bfa' }}
                  onMouseEnter={e => e.target.style.color = '#c4b5fd'}
                  onMouseLeave={e => e.target.style.color = '#a78bfa'}
                >
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}