import { useEffect, useState } from 'react';

export function useFavorites(slug) {
  const key = `favorites:${slug}`;
  const [ids, setIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(ids));
  }, [ids, key]);

  function toggle(dishId) {
    setIds((prev) => (prev.includes(dishId) ? prev.filter((id) => id !== dishId) : [...prev, dishId]));
  }

  return { favoriteIds: ids, toggleFavorite: toggle };
}
