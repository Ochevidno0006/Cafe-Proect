import { resolveImage } from '../api';

export default function CategoryScroller({ categories, activeId, onSelect }) {
  if (!categories || categories.length === 0) return null;
  return (
    <div className="mt-5 px-3">
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1">
        {categories.map((cat) => {
          const active = cat.id === activeId;
          return (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              className="flex flex-col items-center gap-1.5 shrink-0 w-[64px] group"
            >
              <span
                className={`h-16 w-16 rounded-full overflow-hidden ring-2 transition-all ${
                  active ? 'ring-forest-500 scale-105' : 'ring-transparent'
                } shadow-card bg-forest-100 flex items-center justify-center`}
              >
                {cat.imageUrl ? (
                  <img src={resolveImage(cat.imageUrl)} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="font-display text-forest-600 text-lg">{cat.name[0]}</span>
                )}
              </span>
              <span className={`text-[11px] font-semibold text-center leading-tight ${active ? 'text-forest-700' : 'text-ink/70'}`}>
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
