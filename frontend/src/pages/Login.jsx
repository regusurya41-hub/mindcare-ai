import { Eye, EyeOff, HeartPulse } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function submit(event) {
    event.preventDefault();
    setError('');
    if (!form.email.includes('@') || !form.password.trim()) return setError('Enter a valid email and password.');
    setLoading(true);
    try {
      await login(form);
      navigate('/app');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to log in.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center px-5 text-ink dark:text-white">
      <form onSubmit={submit} className="glass w-full max-w-md rounded-[32px] p-6">
        <Link to="/" className="mb-8 flex items-center gap-3 font-extrabold">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-indigo to-violet text-white shadow-lg shadow-indigo/20"><HeartPulse size={20} /></span>
          MindCare AI
        </Link>
        <h1 className="text-3xl font-extrabold">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Sign in to your private wellness space.</p>
        <div className="mt-6 grid gap-4">
          <input className="field" type="email" placeholder="Email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <div className="relative">
            <input className="field pr-12" type={show ? 'text' : 'password'} placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <button type="button" className="absolute right-3 top-3 rounded-full p-1" onClick={() => setShow(!show)} aria-label="Toggle password visibility">
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        {error && <p className="mt-4 rounded-2xl bg-coral/15 px-4 py-3 text-sm font-semibold text-red-700 dark:text-red-200">{error}</p>}
        <button className="btn-primary mt-6 w-full" disabled={loading}>{loading ? 'Signing in...' : 'Login'}</button>
        <p className="mt-5 text-center text-sm text-slate-600 dark:text-slate-300">New here? <Link className="font-bold text-indigo dark:text-indigo-200" to="/signup">Create an account</Link></p>
      </form>
    </div>
  );
}
