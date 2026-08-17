import { resolveImage } from '../api';
import { translateDish } from './DishCard';

const ATTR_LABELS = {
  ingredients: 'Состав',
  weight: 'Вес',
  calories: 'Калорийность',
  allergens: 'Аллергены',
  spiciness: 'Острота',
  prep_time: 'Время приготовления',
};

export default function DishModal({ dish, lang, onClose }) {
  if (!dish) return null;
  const visibleAttrs = (dish.attributes || []).filter((a) => a.isVisible && a.value);
  const { name, description } = translateDish(dish, lang);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm animate-fadeIn" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-cream rounded-t-3xl sm:rounded-3xl shadow-card max-h-[85vh] overflow-y-auto animate-slideUp">
        <div className="sticky top-0 flex justify-center pt-2.5 pb-1 bg-cream/90 backdrop-blur">
          <div className="h-1 w-10 rounded-full bg-ink/15" />
        </div>
        <button
          onClick={onClose}
          className="absolute right-3 top-3 h-8 w-8 rounded-full bg-ink/85 text-cream flex items-center justify-center text-sm"
          aria-label="Закрыть"
        >
          ✕
        </button>

        {dish.photoUrl && (
          <div className="aspect-[4/3] bg-forest-50">
            <img src={resolveImage(dish.photoUrl)} alt={dish.name} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="p-5">
          <h2 className="font-display text-2xl text-ink">{name}</h2>
          {dish.rating > 0 && (
            <div className="flex gap-0.5 mt-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={i < dish.rating ? 'text-amber-500' : 'text-ink/15'}>★</span>
              ))}
            </div>
          )}
          {description && <p className="mt-3 text-sm text-ink/70 leading-relaxed">{description}</p>}

          {visibleAttrs.length > 0 && (
            <dl className="mt-4 grid grid-cols-2 gap-3">
              {visibleAttrs.map((a) => (
                <div key={a.key} className="bg-white rounded-xl p-2.5 shadow-card">
                  <dt className="text-[10px] uppercase tracking-wide text-ink/45 font-semibold">
                    {ATTR_LABELS[a.key]}
                  </dt>
                  <dd className="text-sm font-medium text-ink mt-0.5">{a.value}</dd>
                </div>
              ))}
            </dl>
          )}

          <div className="mt-5 flex items-center justify-between">
            <span className="font-display text-2xl text-forest-700">{Number(dish.price).toFixed(0)} c.</span>
            {!dish.isAvailable && (
              <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-clay/10 text-clay">Нет в наличии</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
