export default function StatCard({
  icon: Icon,
  label,
  value,
  hint
}) {
  return (
    <div className="panel">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-300">
            {label}
          </p>

          <h3 className="mt-2 text-3xl font-extrabold">
            {value}
          </h3>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-indigo to-violet p-3 text-white shadow-lg shadow-indigo/20">
          <Icon size={22} />
        </div>
      </div>

      <p className="mt-4 text-sm text-slate-500 dark:text-slate-300">
        {hint}
      </p>
    </div>
  );
}