import { useEffect, useState } from 'react';
import { api, API_BASE } from '../api/client';
import { Card, Button, Input, Toggle, Spinner, EmptyState } from '../components/ui';

const ATTR_META = [
  { key: 'weight', label: 'Вес' },
  { key: 'calories', label: 'Калории' },
  { key: 'ingredients', label: 'Состав' },
  { key: 'allergens', label: 'Аллергены' },
  { key: 'spiciness', label: 'Острота' },
  { key: 'prep_time', label: 'Время приготовления' },
];
const LABEL_META = [
  { key: 'popular', label: 'Популярное' },
  { key: 'new', label: 'Новинка' },
  { key: 'recommended', label: 'Рекомендуем' },
  { key: 'spicy', label: 'Острое' },
  { key: 'vegetarian', label: 'Вегетарианское' },
  { key: 'promo', label: 'Акция' },
];

export default function Dishes() {
  const [dishes, setDishes] = useState(null);
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);

  async function load() {
    const [d, c] = await Promise.all([api.get('/api/admin/dishes'), api.get('/api/admin/categories')]);
    setDishes(d.dishes);
    setCategories(c.categories);
  }
  useEffect(() => { load(); }, []);

  if (!dishes) return <Spinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-display text-2xl">Блюда</h1>
          <p className="text-sm text-ink/50">{dishes.length} блюд</p>
        </div>
        <Button onClick={() => setCreating(true)}>+ Добавить блюдо</Button>
      </div>

      {dishes.length === 0 ? (
        <EmptyState text="Блюд пока нет" />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {dishes.map((d) => (
            <Card key={d.id} className="cursor-pointer" >
              <div onClick={() => setEditing(d)}>
                <div className="aspect-video rounded-xl bg-forest-50 mb-2 overflow-hidden flex items-center justify-center text-forest-300 font-display text-2xl">
                  {d.photoUrl ? <img src={d.photoUrl} className="w-full h-full object-cover" /> : d.name[0]}
                </div>
                <p className="font-semibold text-sm">{d.name}</p>
                <p className="text-xs text-ink/50">{categories.find((c) => c.id === d.categoryId)?.name || 'Без категории'}</p>
                <p className="text-forest-700 font-semibold text-sm mt-1">{d.price} c.</p>
              </div>
              {!d.isEnabled && <p className="text-[10px] text-clay mt-1">Скрыто</p>}
            </Card>
          ))}
        </div>
      )}

      {(editing || creating) && (
        <DishEditor
          dish={editing}
          categories={categories}
          onClose={() => { setEditing(null); setCreating(false); }}
          onSaved={() => { setEditing(null); setCreating(false); load(); }}
        />
      )}
    </div>
  );
}

function DishEditor({ dish, categories, onClose, onSaved }) {
  const isNew = !dish;
  const [form, setForm] = useState({
    name: dish?.name || '',
    price: dish?.price || 0,
    description: dish?.description || '',
    categoryId: dish?.categoryId || '',
    photoUrl: dish?.photoUrl || '',
    rating: dish?.rating || 0,
    isAvailable: dish?.isAvailable ?? true,
    isEnabled: dish?.isEnabled ?? true,
  });
  const [attributes, setAttributes] = useState(
    ATTR_META.map((a) => {
      const existing = dish?.attributes?.find((x) => x.key === a.key);
      return { key: a.key, value: existing?.value || '', isVisible: existing?.isVisible || false };
    })
  );
  const [labels, setLabels] = useState(dish?.labels || []);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [autosaveStatus, setAutosaveStatus] = useState(null); // null | 'saving' | 'saved'

  function set(field) {
    return (e) => setForm((s) => ({ ...s, [field]: e.target.value }));
  }

  // Autosave: only once a dish already exists (editing, not the initial
  // creation — a brand-new dish needs a name before there's anything to
  // save). Debounced so we don't fire a request on every keystroke.
  useEffect(() => {
    if (isNew) return;
    setAutosaveStatus('saving');
    const timer = setTimeout(async () => {
      try {
        await api.patch(`/api/admin/dishes/${dish.id}`, {
          ...form,
          price: Number(form.price) || 0,
          rating: Number(form.rating) || 0,
          categoryId: form.categoryId || null,
        });
        await api.put(`/api/admin/dishes/${dish.id}/attributes`, { attributes });
        await api.put(`/api/admin/dishes/${dish.id}/labels`, { labels });
        setAutosaveStatus('saved');
      } catch {
        setAutosaveStatus(null);
      }
    }, 700);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, attributes, labels]);

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await api.upload('/api/admin/uploads', file);
      setForm((s) => ({ ...s, photoUrl: `${API_BASE}${url}` }));
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        rating: Number(form.rating),
        categoryId: form.categoryId || null,
      };
      let dishId = dish?.id;
      if (isNew) {
        const created = await api.post('/api/admin/dishes', payload);
        dishId = created.dish.id;
      } else {
        await api.patch(`/api/admin/dishes/${dishId}`, payload);
      }
      await api.put(`/api/admin/dishes/${dishId}/attributes`, { attributes });
      await api.put(`/api/admin/dishes/${dishId}/labels`, { labels });
      onSaved();
    } catch (err) {
      setError(err.details ? Object.values(err.details).flat().join(' ') : err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Удалить блюдо?')) return;
    await api.del(`/api/admin/dishes/${dish.id}`);
    onSaved();
  }

  function toggleLabel(key) {
    setLabels((ls) => (ls.includes(key) ? ls.filter((l) => l !== key) : [...ls, key]));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40" onClick={onClose}>
      <div className="bg-cream rounded-2xl shadow-card max-w-lg w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-display text-xl mb-4">{isNew ? 'Новое блюдо' : 'Редактирование блюда'}</h2>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleUpload} className="text-xs" />
            {uploading && <Spinner />}
            {form.photoUrl && <img src={form.photoUrl} className="h-12 w-12 rounded-lg object-cover" />}
          </div>
          <Input label="Название" value={form.name} onChange={set('name')} required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Цена" type="number" value={form.price} onChange={set('price')} />
            <Input label="Рейтинг (0–5)" type="number" min="0" max="5" value={form.rating} onChange={set('rating')} />
          </div>
          <label className="block">
            <span className="block text-xs font-semibold text-ink/60 mb-1">Категория</span>
            <select className="w-full rounded-xl border border-ink/10 px-3 py-2 text-sm bg-white" value={form.categoryId} onChange={set('categoryId')}>
              <option value="">Без категории</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="block text-xs font-semibold text-ink/60 mb-1">Описание</span>
            <textarea className="w-full rounded-xl border border-ink/10 px-3 py-2 text-sm bg-white" rows={2} value={form.description} onChange={set('description')} />
          </label>

          <div className="flex gap-6">
            <Toggle checked={form.isAvailable} onChange={(v) => setForm((s) => ({ ...s, isAvailable: v }))} label="В наличии" />
            <Toggle checked={form.isEnabled} onChange={(v) => setForm((s) => ({ ...s, isEnabled: v }))} label="Показывать в меню" />
          </div>

          <div>
            <p className="text-xs font-semibold text-ink/60 mb-2">Характеристики</p>
            <div className="grid grid-cols-2 gap-2">
              {attributes.map((a, i) => (
                <div key={a.key} className="bg-white rounded-xl p-2 shadow-card">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium">{ATTR_META.find((m) => m.key === a.key).label}</span>
                    <Toggle
                      checked={a.isVisible}
                      onChange={(v) => setAttributes((arr) => arr.map((x, j) => (j === i ? { ...x, isVisible: v } : x)))}
                    />
                  </div>
                  <input
                    className="w-full text-xs border-b border-ink/10 bg-transparent focus:outline-none"
                    value={a.value}
                    onChange={(e) => setAttributes((arr) => arr.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))}
                    placeholder="значение"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-ink/60 mb-2">Метки</p>
            <div className="flex flex-wrap gap-1.5">
              {LABEL_META.map((l) => (
                <button
                  key={l.key}
                  onClick={() => toggleLabel(l.key)}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                    labels.includes(l.key) ? 'bg-forest-500 text-cream' : 'bg-ink/5 text-ink/60'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-xs text-clay">{error}</p>}

          <div className="flex items-center justify-between pt-2">
            <div className="flex gap-2 items-center">
              {isNew ? (
                <Button onClick={handleSave} disabled={saving}>{saving ? 'Создаём…' : 'Создать блюдо'}</Button>
              ) : (
                <>
                  <Button variant="ghost" onClick={onSaved}>Готово</Button>
                  <span className="text-xs text-ink/40">
                    {autosaveStatus === 'saving' && 'Сохраняем…'}
                    {autosaveStatus === 'saved' && 'Сохранено'}
                  </span>
                </>
              )}
              {isNew && <Button variant="ghost" onClick={onClose}>Отмена</Button>}
            </div>
            {!isNew && <Button variant="danger" onClick={handleDelete}>Удалить</Button>}
          </div>
        </div>
      </div>
    </div>
  );
}
