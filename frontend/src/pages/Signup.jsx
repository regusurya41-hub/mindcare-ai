import { motion } from 'framer-motion';
import { Eye, EyeOff, HeartPulse } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Signup() {
  const [show, setShow] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  async function submit(event) {
    event.preventDefault();

    setError('');

    if (
      form.name.trim().length < 2 ||
      !form.email.includes('@') ||
      form.password.length < 8 ||
      !/[A-Za-z]/.test(form.password) ||
      !/[0-9]/.test(form.password)
    ) {
      const message =
        'Use your name, a valid email, and a password with at least 8 characters, one letter, and one number.';

      setError(message);

      toast.error(message);

      return;
    }

    setLoading(true);

    try {
      await signup(form);

      toast.success(
        'Account created successfully!'
      );

      navigate('/app');
    } catch (err) {
      const message =
        err.response?.data?.message ||
        'Unable to create account.';

      setError(message);

      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden px-5 text-ink dark:text-white">

      {/* Background */}
      <div className="ambient-layer">
        <div className="ambient-orb left-[-9rem] top-16 h-80 w-80 animate-float bg-violet/20 dark:bg-violet/10" />

        <div className="ambient-orb right-[-7rem] top-24 h-72 w-72 animate-slow-pulse bg-lagoon/20 dark:bg-lagoon/10" />

        <div className="ambient-orb bottom-[-8rem] left-1/3 h-96 w-96 animate-float bg-indigo/15 dark:bg-indigo/10" />
      </div>

      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
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
              Safe emotional wellness
            </p>
          </div>
        </Link>

        {/* Heading */}
        <div>
          <h1 className="text-3xl font-extrabold sm:text-4xl">
            Create your space
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Private by design, supportive by default.
          </p>
        </div>

        {/* Inputs */}
        <div className="mt-7 grid gap-4">

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-600 dark:text-slate-300">
              Preferred name
            </label>

            <input
              className="field"
              placeholder="Enter your name"
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value
                })
              }
            />
          </div>

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
                placeholder="Create password"
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

            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Minimum 8 characters with one number.
            </p>
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
            <LoadingSpinner label="Creating..." />
          ) : (
            'Create Account'
          )}
        </button>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
          Already registered?{' '}
          <Link
            className="font-bold text-indigo transition hover:text-violet dark:text-indigo-200"
            to="/login"
          >
            Login
          </Link>
        </p>
      </motion.form>
    </div>
  );
}