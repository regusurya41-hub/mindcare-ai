import { Bell, Download, Lock, Moon, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

function ToggleRow({ icon: Icon, title, text, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-[24px] bg-mist p-4 dark:bg-white/10">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-indigo dark:bg-white/10 dark:text-indigo-200"><Icon size={19} /></div>
        <div>
          <p className="font-extrabold">{title}</p>
          <p className="text-sm text-slate-600 dark:text-slate-300">{text}</p>
        </div>
      </div>
      <button className={`h-7 w-12 rounded-full p-1 transition ${checked ? 'bg-indigo' : 'bg-slate-300'}`} onClick={onChange} aria-label={title}>
        <span className={`block h-5 w-5 rounded-full bg-white transition ${checked ? 'translate-x-5' : ''}`} />
      </button>
    </div>
  );
}

export default function Settings() {
  const { user, setUser } = useAuth();
  const { dark, toggleDark } = useTheme();
  const [settings, setSettings] = useState(user?.settings || {});

  async function update(key, value) {
    if (key === 'notifications' && value && 'Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
    const next = { ...settings, [key]: value };
    setSettings(next);
    const { data } = await api.patch('/settings', next);
    setUser(data.user);
    localStorage.setItem('mindcare_user', JSON.stringify(data.user));
  }

  async function toggleSavedDarkMode() {
    toggleDark();
    await update('darkMode', !dark);
  }

  return (
    <div className="panel max-w-4xl">
      <p className="text-sm font-bold text-indigo dark:text-indigo-200">Settings</p>
      <h2 className="text-2xl font-extrabold">Privacy and preferences</h2>
      <div className="mt-6 grid gap-4">
        <ToggleRow icon={Moon} title="Dark mode" text="Use a lower-light interface." checked={dark} onChange={toggleSavedDarkMode} />
        <ToggleRow icon={Bell} title="Daily notifications" text="Receive gentle motivational reminders." checked={settings.notifications ?? true} onChange={() => update('notifications', !(settings.notifications ?? true))} />
        <ToggleRow icon={Lock} title="Anonymous community" text="Hide identity on community posts." checked={settings.anonymousCommunity ?? true} onChange={() => update('anonymousCommunity', !(settings.anonymousCommunity ?? true))} />
        <ToggleRow icon={Download} title="Data export" text="Prepare account data for export." checked={settings.dataExport ?? false} onChange={() => update('dataExport', !(settings.dataExport ?? false))} />
      </div>
      <div className="mt-6 rounded-[24px] border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/20">
        <div className="flex items-center gap-3 text-red-700 dark:text-red-200">
          <Trash2 size={20} />
          <p className="font-extrabold">Account management</p>
        </div>
        <p className="mt-2 text-sm text-red-700 dark:text-red-200">Production deletion flows should include re-authentication, export options, and a waiting period.</p>
      </div>
    </div>
  );
}
