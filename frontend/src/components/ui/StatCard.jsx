export default function StatCard({ label, value, hint, icon: Icon }) {
  return (
    <div className="panel">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-300">{label}</p>
          <p className="mt-2 text-3xl font-extrabold">{value}</p>
        </div>
        {Icon && (
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-lavender text-indigo dark:bg-white/10 dark:text-indigo-200">
            <Icon size={22} />
          </div>
        )}
      </div>
      {hint && <p className="mt-3 text-sm text-slate-500 dark:text-slate-300">{hint}</p>}
    </div>
  );
}
