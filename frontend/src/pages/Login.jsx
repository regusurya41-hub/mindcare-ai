import { motion } from 'framer-motion';
import { Eye, EyeOff, HeartPulse } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';

export default function Login() {
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  async function submit(event) {
    event.preventDefault();

    setError('');

    if (!form.email.includes('@') || !form.password.trim()) {
      return setError('Enter a valid email and password.');
    }

    setLoading(true);

    try {
      await login(form);
      navigate('/app');
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Unable to log in.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden px-5 text-ink dark:text-white">

      {/* Background */}
      <div className="ambient-layer">
        <div className="ambient-orb left-[-8rem] top-10 h-80 w-80 animate-float bg-violet/20 dark:bg-violet/10" />
        <div className="ambient-orb right-[-6rem] top-20 h-72 w-72 animate-slow-pulse bg-lagoon/20 dark:bg-lagoon/10" />
        <div className="ambient-orb bottom-[-8rem] left-1/3 h-96 w-96 animate-float bg-indigo/15 dark:bg-indigo/10" />
      </div>

      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 25, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45 }}
        className="glass relative z-10 w-full max-w-md rounded-[34px] p-6 sm:p-8"
      >
        {/* Logo */}
        <Link
          to="/"
          className="mb-8 flex items-center gap-3 font-extrabold"
        >
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-indigo to-violet text-white shadow-lg shadow-indigo/20">
            <HeartPulse size={22} />
          </span>

          <div>
            <p className="text-lg font-extrabold">
              MindCare AI
            </p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-300">
              Emotional wellness space
            </p>
          </div>
        </Link>

        {/* Heading */}
        <div>
          <h1 className="text-3xl font-extrabold sm:text-4xl">
            Welcome back
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Sign in to continue your private wellness journey.
          </p>
        </div>

        {/* Inputs */}
        <div className="mt-7 grid gap-4">

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-600 dark:text-slate-300">
              Email
            </label>

            <input
              className="field"
              type="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value
                })
              }
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-600 dark:text-slate-300">
              Password
            </label>

            <div className="relative">
              <input
                className="field pr-12"
                type={show ? 'text' : 'password'}
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) =>
                  setForm({
                    ...form,
                    password: e.target.value
                  })
                }
              />

              <button
                type="button"
                className="absolute right-3 top-3 rounded-full p-1 text-slate-500 transition hover:bg-black/5 dark:text-slate-300 dark:hover:bg-white/10"
                onClick={() => setShow(!show)}
                aria-label="Toggle password visibility"
              >
                {show ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200"
          >
            {error}
          </motion.p>
        )}

        {/* Button */}
        <button
          className="btn-primary mt-7 w-full justify-center py-3 text-sm font-bold"
          disabled={loading}
        >
          {loading ? (
            <LoadingSpinner label="Signing in..." />
          ) : (
            'Login'
          )}
        </button>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
          New here?{' '}
          <Link
            className="font-bold text-indigo transition hover:text-violet dark:text-indigo-200"
            to="/signup"
          >
            Create an account
          </Link>
        </p>
      </motion.form>
    </div>
  );
}