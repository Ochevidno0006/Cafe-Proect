import { resolveImage } from '../api';

const LABEL_META = {
  popular: { text: 'Популярное', cls: 'bg-amber-400/90 text-ink' },
  new: { text: 'Новинка', cls: 'bg-forest-500 text-cream' },
  recommended: { text: 'Рекомендуем', cls: 'bg-ink text-cream' },
  spicy: { text: 'Острое', cls: 'bg-clay text-cream' },
  vegetarian: { text: 'Вегетарианское', cls: 'bg-forest-100 text-forest-700' },
  promo: { text: 'Акция', cls: 'bg-amber-500 text-cream' },
};

export function translateDish(dish, lang) {
  if (!lang) return { name: dish.name, description: dish.description };
  const t = dish.translations?.find((x) => x.languageCode === lang);
  return { name: t?.name || dish.name, description: t?.description || dish.description };
}

export default function DishCard({ dish, lang, onOpen, isFavorite, onToggleFavorite, favoritesEnabled }) {
  const label = dish.labels?.[0];
  const { name } = translateDish(dish, lang);

  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden flex flex-col animate-fadeIn">
      <button onClick={() => onOpen(dish)} className="text-left active:scale-[0.98] transition-transform w-full">
        <div className="relative aspect-square bg-forest-50">
          {dish.photoUrl ? (
            <img src={resolveImage(dish.photoUrl)} alt={name} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-display text-3xl text-forest-300">
              {name[0]}
            </div>
          )}
          {label && (
            <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-1 rounded-full ${LABEL_META[label].cls}`}>
              {LABEL_META[label].text}
            </span>
          )}
          {favoritesEnabled && (
            <span
              role="button"
              onClick={(e) => { e.stopPropagation(); onToggleFavorite(dish.id); }}
              className="absolute top-2 right-2 h-7 w-7 rounded-full bg-ink/50 backdrop-blur flex items-center justify-center text-sm text-cream"
            >
              {isFavorite ? '♥' : '♡'}
            </span>
          )}
          {!dish.isAvailable && (
            <div className="absolute inset-0 bg-ink/55 flex items-center justify-center">
              <span className="text-cream text-xs font-bold px-3 py-1 rounded-full bg-ink/70">Нет в наличии</span>
            </div>
          )}
        </div>
        <div className="p-3 flex flex-col gap-1 flex-1">
          <h3 className="font-display text-[15px] leading-snug text-ink line-clamp-2">{name}</h3>
          {dish.rating > 0 && (
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={i < dish.rating ? 'text-amber-500' : 'text-ink/15'}>★</span>
              ))}
            </div>
          )}
          <div className="mt-auto pt-1 font-semibold text-forest-700">{Number(dish.price).toFixed(0)} c.</div>
        </div>
      </button>
    </div>
  );
}
