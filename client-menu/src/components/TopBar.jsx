const STATUS_LABEL = {
  open: { text: 'Открыто', dot: 'bg-forest-500', bg: 'bg-forest-50 text-forest-700' },
  closed: { text: 'Закрыто', dot: 'bg-clay', bg: 'bg-clay/10 text-clay' },
  temporarily_closed: { text: 'Временно закрыто', dot: 'bg-amber-500', bg: 'bg-amber-400/15 text-amber-600' },
};

export default function TopBar({ name, status }) {
  const s = STATUS_LABEL[status] || STATUS_LABEL.open;
  return (
    <div className="sticky top-0 z-30 px-3 pt-3">
      <div className="mx-auto max-w-xl rounded-full bg-ink/95 backdrop-blur px-5 py-3.5 shadow-card flex items-center justify-between">
        <h1 className="font-display text-cream text-lg tracking-tight truncate pr-3">{name}</h1>
        <span className={`shrink-0 inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${s.bg}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
          {s.text}
        </span>
      </div>
    </div>
  );
}
