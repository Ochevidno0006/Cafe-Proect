import { useEffect, useMemo, useState } from 'react';
import { fetchMenu, recordEvent } from './api';
import { useFavorites } from './hooks/useFavorites';
import TopBar from './components/TopBar';
import AdCarousel from './components/AdCarousel';
import CategoryScroller from './components/CategoryScroller';
import DishGridSection from './components/DishGridSection';
import DishModal from './components/DishModal';
import FloatingOrderButton from './components/FloatingOrderButton';
import { ContactsSection, GallerySection } from './components/ContactsGallery';
import { LanguageSwitcher, SearchBar, FavoritesToggle, ShareButton } from './components/MenuControls';
import { translateDish } from './components/DishCard';
import MenuSkeleton from './components/MenuSkeleton';

const SLUG = import.meta.env.VITE_CAFE_SLUG || window.location.pathname.split('/').filter(Boolean)[0];

export default function App() {
  const [menu, setMenu] = useState(null);
  const [error, setError] = useState(null);
  const [openDish, setOpenDish] = useState(null);
  const [lang, setLang] = useState(null);
  const [query, setQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [shareMessage, setShareMessage] = useState(null);
  const { favoriteIds, toggleFavorite } = useFavorites(SLUG);

  useEffect(() => {
    fetchMenu(SLUG)
      .then(setMenu)
      .catch(() => setError('Меню не найдено или ещё не опубликовано'));
  }, []);

  function handleOpenDish(dish) {
    setOpenDish(dish);
    recordEvent(SLUG, 'dish_view', dish.id);
  }

  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: menu.cafe.name, url });
      } catch {
        /* cancelled */
      }
    } else {
      await navigator.clipboard.writeText(url);
      setShareMessage('Ссылка скопирована');
      setTimeout(() => setShareMessage(null), 1800);
    }
  }

  const filteredDishes = useMemo(() => {
    if (!menu) return [];
    let list = menu.dishes;
    if (showFavoritesOnly) list = list.filter((d) => favoriteIds.includes(d.id));
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((d) => translateDish(d, lang).name.toLowerCase().includes(q));
    }
    return list;
  }, [menu, showFavoritesOnly, favoriteIds, query, lang]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 text-center">
        <div>
          <p className="font-display text-2xl text-ink mb-2">Меню недоступно</p>
          <p className="text-ink/60 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!menu) return <MenuSkeleton />;

  const dishesByCategory = {};
  for (const dish of filteredDishes) {
    const key = dish.categoryId || 'other';
    (dishesByCategory[key] ||= []).push(dish);
  }
  const isFiltering = showFavoritesOnly || query.trim().length > 0;

  const gridProps = {
    lang,
    onOpen: handleOpenDish,
    favoritesEnabled: menu.settings?.favoritesEnabled,
    favoriteIds,
    onToggleFavorite: toggleFavorite,
  };

  return (
    <div className="min-h-screen pb-28">
      <TopBar name={menu.cafe.name} status={menu.settings?.status} />
      <LanguageSwitcher languages={menu.languages} active={lang} onChange={(c) => setLang(lang === c ? null : c)} />

      {(menu.settings?.searchEnabled || menu.settings?.favoritesEnabled || menu.settings?.shareEnabled) && (
        <div className="flex items-center gap-2 px-3 mt-3 overflow-x-auto no-scrollbar">
          {menu.settings?.searchEnabled && <SearchBar value={query} onChange={setQuery} />}
          {menu.settings?.favoritesEnabled && (
            <FavoritesToggle active={showFavoritesOnly} onToggle={() => setShowFavoritesOnly((v) => !v)} count={favoriteIds.length} />
          )}
          {menu.settings?.shareEnabled && <ShareButton onShare={handleShare} />}
        </div>
      )}
      {shareMessage && <p className="px-3 mt-2 text-xs text-forest-700 font-semibold">{shareMessage}</p>}

      {!isFiltering && <AdCarousel ads={menu.advertisements} />}
      {!isFiltering && (
        <CategoryScroller
          categories={menu.categories}
          activeId={null}
          onSelect={(id) => document.getElementById(`cat-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
        />
      )}

      {isFiltering ? (
        <DishGridSection title={showFavoritesOnly ? 'Избранное' : `Результаты по запросу «${query}»`} dishes={filteredDishes} {...gridProps} />
      ) : (
        <>
          {menu.menuBlocks?.map((block) => (
            <DishGridSection
              key={block.id}
              title={block.name}
              dishes={block.dishIds.map((id) => menu.dishes.find((d) => d.id === id)).filter(Boolean)}
              {...gridProps}
            />
          ))}
          {menu.categories.map((cat) => (
            <div key={cat.id} id={`cat-${cat.id}`}>
              <DishGridSection title={cat.name} dishes={dishesByCategory[cat.id]} {...gridProps} />
            </div>
          ))}
        </>
      )}

      {!isFiltering && <GallerySection gallery={menu.gallery} />}
      {!isFiltering && <ContactsSection contacts={menu.contacts} />}

      <FloatingOrderButton count={0} />
      <DishModal dish={openDish} lang={lang} onClose={() => setOpenDish(null)} />
    </div>
  );
}
