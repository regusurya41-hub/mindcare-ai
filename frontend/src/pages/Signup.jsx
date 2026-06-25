import { motion } from 'framer-motion';
import { Check, Eye, EyeOff, HeartPulse, ShieldCheck, X } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const PW_CHECKS = [
  { label: '8+ characters', test: (p) => p.length >= 8 },
  { label: 'One letter',    test: (p) => /[A-Za-z]/.test(p) },
  { label: 'One number',    test: (p) => /[0-9]/.test(p) },
];

const STRENGTH_COLORS  = ['#ef4444', '#f59e0b', '#6366f1', '#10b981'];
const STRENGTH_LABELS  = ['Weak', 'Fair', 'Good', 'Strong'];

function PasswordMeter({ password }) {
  if (!password) return null;
  const score = PW_CHECKS.filter((c) => c.test(password)).length;
  return (
    <div className="mt-2.5 space-y-2">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ background: i < score ? STRENGTH_COLORS[score] : 'rgba(255,255,255,0.10)' }} />
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        {PW_CHECKS.map(({ label, test }) => {
          const ok = test(password);
          return (
            <span key={label} className="flex items-center gap-1 text-xs font-medium"
              style={{ color: ok ? '#34d399' : 'rgba(255,255,255,0.30)' }}>
              {ok ? <Check size={10} /> : <X size={10} />}
              {label}
            </span>
          );
        })}
        <span className="ml-auto text-xs font-bold" style={{ color: STRENGTH_COLORS[score] }}>
          {STRENGTH_LABELS[score]}
        </span>
      </div>
    </div>
  );
}

const inputBase = `w-full rounded-2xl px-4 py-3 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/20`;
const inputStyle = (err) => ({
  background: err ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.06)',
  border: err ? '1.5px solid rgba(239,68,68,0.5)' : '1.5px solid rgba(255,255,255,0.08)',
});
const focusIn  = (err) => (e) => {
  if (!err) { e.target.style.border = '1.5px solid rgba(99,102,241,0.7)'; e.target.style.background = 'rgba(255,255,255,0.09)'; }
};
const focusOut = (err) => (e) => {
  if (!err) { e.target.style.border = '1.5px solid rgba(255,255,255,0.08)'; e.target.style.background = 'rgba(255,255,255,0.06)'; }
};

export default function Signup() {
  const [show, setShow]       = useState(false);
  const [form, setForm]       = useState({ name: '', email: '', password: '' });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate   = useNavigate();

  function validate() {
    const e = {};
    if (form.name.trim().length < 2)           e.name     = 'Name must be at least 2 characters.';
    if (!form.email.includes('@'))             e.email    = 'Enter a valid email.';
    if (form.password.length < 8)             e.password = 'Minimum 8 characters.';
    else if (!/[A-Za-z]/.test(form.password)) e.password = 'Include at least one letter.';
    else if (!/[0-9]/.test(form.password))    e.password = 'Include at least one number.';
    setErrors(e);
    return !Object.keys(e).length;
  }

  async function submit(ev) {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await signup(form);
      toast.success('Account created! Welcome 💜');
      navigate('/app/onboarding');
    } catch (err) {
      const msg = err.response?.data?.message ?? 'Unable to create account.';
      setErrors({ general: msg });
    } finally { setLoading(false); }
  }

  const set = (k) => (e) => { setForm({ ...form, [k]: e.target.value }); setErrors((p) => ({ ...p, [k]: '' })); };

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: '#070b17' }}>

      {/* ── Ambient blobs ── */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-20 h-[500px] w-[500px] rounded-full opacity-25"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)', filter: 'blur(80px)' }} />
        <div className="absolute -right-32 top-1/3 h-[400px] w-[400px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent 70%)', filter: 'blur(80px)' }} />
        <div className="absolute -bottom-40 left-1/4 h-[450px] w-[450px] rounded-full opacity-15"
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
          <div className="relative overflow-hidden rounded-[32px] p-8"
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
                <div className="grid h-11 w-11 place-items-center rounded-2xl"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 8px 24px rgba(99,102,241,0.35)' }}>
                  <HeartPulse size={20} className="text-white" aria-hidden />
                </div>
                <div>
                  <p className="text-base font-bold text-white">MindCare AI</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Safe emotional wellness</p>
                </div>
              </Link>

              <h1 className="text-3xl font-black text-white" style={{ letterSpacing: '-0.03em' }}>
                Create your space
              </h1>
              <p className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Private by design. Supportive by default.
              </p>

              <form onSubmit={submit} className="mt-7 space-y-4" noValidate>

                {/* Name */}
                <div>
                  <label htmlFor="name" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider"
                    style={{ color: 'rgba(255,255,255,0.45)' }}>Preferred name</label>
                  <input id="name" autoComplete="name" placeholder="Enter your name"
                    value={form.name} onChange={set('name')}
                    className={inputBase} style={inputStyle(!!errors.name)}
                    onFocus={focusIn(!!errors.name)} onBlur={focusOut(!!errors.name)}
                  />
                  {errors.name && <p className="mt-1.5 text-xs font-semibold text-red-400">{errors.name}</p>}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider"
                    style={{ color: 'rgba(255,255,255,0.45)' }}>Email</label>
                  <input id="email" type="email" autoComplete="email" placeholder="Enter your email"
                    value={form.email} onChange={set('email')}
                    className={inputBase} style={inputStyle(!!errors.email)}
                    onFocus={focusIn(!!errors.email)} onBlur={focusOut(!!errors.email)}
                  />
                  {errors.email && <p className="mt-1.5 text-xs font-semibold text-red-400">{errors.email}</p>}
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider"
                    style={{ color: 'rgba(255,255,255,0.45)' }}>Password</label>
                  <div className="relative">
                    <input id="password" type={show ? 'text' : 'password'} autoComplete="new-password"
                      placeholder="Create password"
                      value={form.password} onChange={set('password')}
                      className={`${inputBase} pr-12`} style={inputStyle(!!errors.password)}
                      onFocus={focusIn(!!errors.password)} onBlur={focusOut(!!errors.password)}
                    />
                    <button type="button" onClick={() => setShow(!show)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 transition-colors"
                      style={{ color: 'rgba(255,255,255,0.35)' }} aria-label="Toggle password">
                      {show ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <PasswordMeter password={form.password} />
                  {errors.password && <p className="mt-1.5 text-xs font-semibold text-red-400">{errors.password}</p>}
                </div>

                {/* General error */}
                {errors.general && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl px-4 py-3 text-sm font-semibold text-red-300"
                    style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.20)' }}
                    role="alert">{errors.general}
                  </motion.div>
                )}

                {/* Submit */}
                <button type="submit" disabled={loading}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-white transition-all duration-200 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', boxShadow: '0 8px 32px rgba(99,102,241,0.35)' }}
                  onMouseEnter={e => !loading && (e.currentTarget.style.transform = 'translateY(-1px)', e.currentTarget.style.boxShadow = '0 12px 40px rgba(99,102,241,0.45)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)', e.currentTarget.style.boxShadow = '0 8px 32px rgba(99,102,241,0.35)')}
                >
                  {loading ? <LoadingSpinner label="Creating..." /> : 'Create Account'}
                </button>
              </form>

              <div className="mt-6 flex items-center justify-center gap-1.5 text-xs"
                style={{ color: 'rgba(255,255,255,0.25)' }}>
                <ShieldCheck size={12} aria-hidden />
                Anonymous · Encrypted · No ads ever
              </div>

              <p className="mt-4 text-center text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Already registered?{' '}
                <Link to="/login" className="font-bold transition-colors" style={{ color: '#a78bfa' }}
                  onMouseEnter={e => e.target.style.color = '#c4b5fd'}
                  onMouseLeave={e => e.target.style.color = '#a78bfa'}>
                  Login
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}