import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle, Bell, Check, Download, Eye, EyeOff,
  KeyRound, Lock, Moon, Pencil, Save, Trash2, User, X
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import AnimatedPage from '../components/ui/AnimatedPage.jsx';

function ToggleRow({ icon: Icon, title, text, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[22px] bg-slate-50 p-4 dark:bg-white/[0.04]">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-indigo-500 shadow-sm dark:bg-white/10 dark:text-indigo-300">
          <Icon size={19} aria-hidden />
        </div>
        <div>
          <p className="font-extrabold text-slate-900 dark:text-white">{title}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{text}</p>
        </div>
      </div>
      <button
        className={`h-7 w-12 rounded-full p-1 transition-colors duration-200 ${checked ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-white/10'}`}
        onClick={onChange}
        aria-label={title}
        aria-checked={checked}
        role="switch"
      >
        <span className={`block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-5' : ''}`} />
      </button>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="panel max-w-4xl grid gap-4">
      <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">{title}</h2>
      {children}
    </div>
  );
}

function PasswordStrength({ password }) {
  const checks = [
    { label: '8+ characters', ok: password.length >= 8 },
    { label: 'One letter',    ok: /[A-Za-z]/.test(password) },
    { label: 'One number',    ok: /[0-9]/.test(password) },
    { label: 'One symbol',    ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const color = score <= 1 ? 'bg-rose-400' : score === 2 ? 'bg-amber-400' : score === 3 ? 'bg-indigo-400' : 'bg-emerald-400';
  const label = score <= 1 ? 'Weak' : score === 2 ? 'Fair' : score === 3 ? 'Good' : 'Strong';
  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {[1,2,3,4].map((i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= score ? color : 'bg-slate-200 dark:bg-white/10'}`} />
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        {checks.map(({ label, ok }) => (
          <span key={label} className={`flex items-center gap-1 text-xs font-semibold ${ok ? 'text-emerald-500' : 'text-slate-400'}`}>
            {ok ? <Check size={11} aria-hidden /> : <X size={11} aria-hidden />}
            {label}
          </span>
        ))}
      </div>
      <p className="text-xs font-bold text-slate-500">Strength: {label}</p>
    </div>
  );
}

export default function Settings() {
  const { user, setUser, logout } = useAuth();
  const { dark, toggleDark }      = useTheme();

  const [settings, setSettings]       = useState(user?.settings || {});
  const [profileForm, setProfileForm] = useState({ name: user?.name ?? '', email: user?.email ?? '' });
  const [pwForm, setPwForm]           = useState({ current: '', next: '', confirm: '' });
  const [showPw, setShowPw]           = useState({ current: false, next: false, confirm: false });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw]       = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  async function updateSetting(key, value) {
    if (key === 'notifications' && value && 'Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
    const next = { ...settings, [key]: value };
    setSettings(next);
    try {
      const { data } = await api.patch('/settings', next);
      setUser(data.user);
      localStorage.setItem('mindcare_user', JSON.stringify(data.user));
    } catch {
      toast.error('Could not save setting.');
    }
  }

  async function saveProfile() {
    if (!profileForm.name.trim() || !profileForm.email.includes('@')) {
      toast.error('Enter a valid name and email.');
      return;
    }
    setSavingProfile(true);
    try {
      const { data } = await api.patch('/settings/profile', profileForm);
      setUser(data.user);
      localStorage.setItem('mindcare_user', JSON.stringify(data.user));
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Could not update profile.');
    } finally {
      setSavingProfile(false);
    }
  }

  async function changePassword() {
    if (!pwForm.current || !pwForm.next || pwForm.next.length < 8) {
      toast.error('Fill all fields. New password must be 8+ characters.');
      return;
    }
    if (pwForm.next !== pwForm.confirm) {
      toast.error('Passwords do not match.');
      return;
    }
    setSavingPw(true);
    try {
      await api.patch('/settings/password', { currentPassword: pwForm.current, newPassword: pwForm.next });
      toast.success('Password changed!');
      setPwForm({ current: '', next: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Could not change password.');
    } finally {
      setSavingPw(false);
    }
  }

  async function deleteAccount() {
    if (deleteConfirm !== 'DELETE') return;
    try {
      await api.delete('/settings/account');
      logout();
    } catch {
      toast.error('Could not delete account. Contact support.');
    }
  }

  const togglePw = (key) => setShowPw((s) => ({ ...s, [key]: !s[key] }));

  return (
    <AnimatedPage className="grid gap-5 max-w-4xl">
      <div>
        <p className="text-sm font-bold text-indigo-500 dark:text-indigo-300">Settings</p>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Privacy & preferences</h1>
      </div>

      {/* ── Profile ── */}
      <Section title="👤 Profile">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-600 dark:text-slate-300">
              <User size={13} className="inline mr-1" aria-hidden /> Display name
            </label>
            <input
              className="field"
              value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-600 dark:text-slate-300">
              <Pencil size={13} className="inline mr-1" aria-hidden /> Email
            </label>
            <input
              className="field"
              type="email"
              value={profileForm.email}
              onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
              placeholder="email@example.com"
            />
          </div>
        </div>
        <button
          className="btn-primary mt-2 w-fit px-6 py-2.5 text-sm"
          onClick={saveProfile}
          disabled={savingProfile}
        >
          {savingProfile ? 'Saving...' : <><Save size={15} className="inline mr-1.5" aria-hidden />Save profile</>}
        </button>
      </Section>

      {/* ── Preferences ── */}
      <Section title="⚙️ Preferences">
        <ToggleRow icon={Moon}  title="Dark mode"           text="Use a lower-light interface."              checked={dark}                               onChange={() => { toggleDark(); updateSetting('darkMode', !dark); }} />
        <ToggleRow icon={Bell}  title="Daily reminders"     text="Gentle daily wellness notifications."      checked={settings.notifications ?? true}      onChange={() => updateSetting('notifications', !(settings.notifications ?? true))} />
        <ToggleRow icon={Lock}  title="Anonymous community" text="Hide identity on community posts."         checked={settings.anonymousCommunity ?? true} onChange={() => updateSetting('anonymousCommunity', !(settings.anonymousCommunity ?? true))} />
        <ToggleRow icon={Download} title="Data export"      text="Allow exporting your wellness data."       checked={settings.dataExport ?? false}        onChange={() => updateSetting('dataExport', !(settings.dataExport ?? false))} />
      </Section>

      {/* ── Change password ── */}
      <Section title="🔑 Change password">
        <div className="grid gap-3">
          {[
            { key: 'current', label: 'Current password', placeholder: 'Enter current password' },
            { key: 'next',    label: 'New password',     placeholder: 'At least 8 characters'  },
            { key: 'confirm', label: 'Confirm new',      placeholder: 'Repeat new password'    },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="mb-1.5 block text-sm font-semibold text-slate-600 dark:text-slate-300">{label}</label>
              <div className="relative">
                <input
                  className="field pr-12"
                  type={showPw[key] ? 'text' : 'password'}
                  placeholder={placeholder}
                  value={pwForm[key]}
                  onChange={(e) => setPwForm({ ...pwForm, [key]: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 rounded-full p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  onClick={() => togglePw(key)}
                  aria-label="Toggle visibility"
                >
                  {showPw[key] ? <EyeOff size={17} aria-hidden /> : <Eye size={17} aria-hidden />}
                </button>
              </div>
              {key === 'next' && pwForm.next && <PasswordStrength password={pwForm.next} />}
            </div>
          ))}
        </div>
        <button
          className="btn-primary mt-2 w-fit px-6 py-2.5 text-sm"
          onClick={changePassword}
          disabled={savingPw}
        >
          {savingPw ? 'Changing...' : <><KeyRound size={15} className="inline mr-1.5" aria-hidden />Change password</>}
        </button>
      </Section>

      {/* ── Danger zone ── */}
      <Section title="⚠️ Danger zone">
        <div className="rounded-[22px] border border-red-200 bg-red-50 p-5 dark:border-red-900/40 dark:bg-red-950/20">
          <div className="flex items-center gap-3 text-red-700 dark:text-red-300">
            <Trash2 size={20} aria-hidden />
            <p className="font-extrabold">Delete account</p>
          </div>
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            This permanently deletes all your data — moods, journals, and chat history. This cannot be undone.
          </p>
          <button
            className="mt-4 rounded-2xl border border-red-300 bg-white px-5 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50 dark:border-red-800 dark:bg-transparent dark:text-red-400"
            onClick={() => setShowDeleteModal(true)}
          >
            Delete my account
          </button>
        </div>
      </Section>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowDeleteModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92 }}
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[28px] bg-white p-8 shadow-2xl dark:bg-slate-900"
              role="dialog"
              aria-modal="true"
              aria-label="Confirm account deletion"
            >
              <AlertTriangle className="text-red-500 mx-auto" size={40} aria-hidden />
              <h2 className="mt-4 text-center text-2xl font-extrabold text-slate-900 dark:text-white">Are you absolutely sure?</h2>
              <p className="mt-3 text-center text-sm leading-7 text-slate-500 dark:text-slate-400">
                This will permanently delete your account and all data. Type <strong>DELETE</strong> to confirm.
              </p>
              <input
                className="field mt-5 text-center font-bold tracking-widest"
                placeholder="Type DELETE"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value.toUpperCase())}
              />
              <div className="mt-5 flex gap-3">
                <button
                  className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 py-3 font-bold text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                  onClick={() => { setShowDeleteModal(false); setDeleteConfirm(''); }}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 rounded-2xl bg-red-500 py-3 font-bold text-white transition hover:bg-red-600 disabled:opacity-40"
                  onClick={deleteAccount}
                  disabled={deleteConfirm !== 'DELETE'}
                >
                  Delete forever
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </AnimatedPage>
  );
}