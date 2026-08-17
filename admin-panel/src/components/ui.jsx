export function Toggle({ checked, onChange, label }) {
  return (
    <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
      <span
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition-colors shrink-0 ${
          checked ? 'bg-forest-500' : 'bg-ink/15'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-5' : ''
          }`}
        />
      </span>
      {label && <span className="text-sm text-ink/80">{label}</span>}
    </label>
  );
}

export function Button({ children, variant = 'primary', className = '', ...props }) {
  const variants = {
    primary: 'bg-forest-600 text-cream hover:bg-forest-700',
    ghost: 'bg-ink/5 text-ink hover:bg-ink/10',
    danger: 'bg-clay/10 text-clay hover:bg-clay/20',
  };
  return (
    <button
      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Input({ label, error, ...props }) {
  return (
    <label className="block">
      {label && <span className="block text-xs font-semibold text-ink/60 mb-1">{label}</span>}
      <input
        className={`w-full rounded-xl border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-400 ${
          error ? 'border-clay' : 'border-ink/10'
        }`}
        {...props}
      />
      {error && <span className="block text-xs text-clay mt-1">{error}</span>}
    </label>
  );
}

export function Card({ children, className = '' }) {
  return <div className={`bg-white rounded-2xl shadow-card p-4 ${className}`}>{children}</div>;
}

export function Spinner() {
  return <div className="h-6 w-6 rounded-full border-2 border-forest-500 border-t-transparent animate-spin" />;
}

export function EmptyState({ text }) {
  return <p className="text-sm text-ink/40 py-8 text-center">{text}</p>;
}
