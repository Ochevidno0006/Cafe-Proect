export function LanguageSwitcher({ languages, active, onChange }) {
  if (!languages || languages.length < 2) return null;
  return (
    <div className="flex gap-1.5 px-3 mt-3">
      {languages.map((l) => (
        <button
          key={l.code}
          onClick={() => onChange(l.code)}
          className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
            active === l.code ? 'bg-ink text-cream' : 'bg-ink/5 text-ink/60'
          }`}
        >
          {l.code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

export function SearchBar({ value, onChange, placeholder = 'Найти блюдо…' }) {
  return (
    <div className="px-3 mt-3">
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/35 text-sm">⌕</span>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-full bg-white shadow-card pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-400"
        />
      </div>
    </div>
  );
}

export function FavoritesToggle({ active, onToggle, count }) {
  return (
    <button
      onClick={onToggle}
      className={`shrink-0 text-xs font-semibold px-3 py-2.5 rounded-full transition-colors flex items-center gap-1 ${
        active ? 'bg-clay text-cream' : 'bg-white shadow-card text-ink/60'
      }`}
    >
      <span>{active ? '♥' : '♡'}</span>
      Избранное{count > 0 ? ` (${count})` : ''}
    </button>
  );
}

export function ShareButton({ onShare }) {
  return (
    <button
      onClick={onShare}
      className="shrink-0 text-xs font-semibold px-3 py-2.5 rounded-full bg-white shadow-card text-ink/60 flex items-center gap-1"
    >
      <span>⤴</span> Поделиться
    </button>
  );
}
