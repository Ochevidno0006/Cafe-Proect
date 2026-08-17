import DishCard from './DishCard';

export default function DishGridSection({ title, dishes, lang, onOpen, favoritesEnabled, favoriteIds, onToggleFavorite }) {
  if (!dishes || dishes.length === 0) return null;
  return (
    <section className="px-3 mt-7">
      {title && <h2 className="font-display text-xl text-ink mb-3">{title}</h2>}
      <div className="grid grid-cols-2 gap-3">
        {dishes.map((dish) => (
          <DishCard
            key={dish.id}
            dish={dish}
            lang={lang}
            onOpen={onOpen}
            favoritesEnabled={favoritesEnabled}
            isFavorite={favoriteIds?.includes(dish.id)}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
    </section>
  );
}
