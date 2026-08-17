import { useEffect, useState } from 'react';
import { api, API_BASE } from '../api/client';
import { Button, Card, Spinner, EmptyState, Toggle } from './ui';

/**
 * Generic manager for simple cafe-scoped resources (advertisements, gallery,
 * contacts, categories): list + create form + per-row toggle/reorder/delete.
 * `config` describes the resource; each concrete page just supplies fields.
 */
export default function ResourceManager({ config }) {
  const { listPath, createPath, itemPath, reorderPath, resourceKey, singularKey, fields, renderRow, emptyText } = config;
  const [items, setItems] = useState(null);
  const [form, setForm] = useState(() => Object.fromEntries(fields.map((f) => [f.name, f.default ?? ''])));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);

  async function load() {
    const data = await api.get(listPath);
    setItems(data[resourceKey]);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.post(createPath, form);
      setForm(Object.fromEntries(fields.map((f) => [f.name, f.default ?? ''])));
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(item) {
    await api.patch(itemPath(item.id), { isEnabled: !item.isEnabled });
    load();
  }

  async function handleDelete(item) {
    if (!confirm('Удалить?')) return;
    await api.del(itemPath(item.id));
    load();
  }

  async function move(index, dir) {
    const next = [...items];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
    await api.post(reorderPath, { orderedIds: next.map((i) => i.id) });
  }

  const [dragIndex, setDragIndex] = useState(null);

  async function commitOrder(next) {
    setItems(next);
    await api.post(reorderPath, { orderedIds: next.map((i) => i.id) });
  }

  function handleDrop(targetIndex) {
    if (dragIndex === null || dragIndex === targetIndex) return;
    const next = [...items];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(targetIndex, 0, moved);
    setDragIndex(null);
    commitOrder(next);
  }

  async function handleFileChange(e, fieldName) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await api.upload('/api/admin/uploads', file);
      setForm((f) => ({ ...f, [fieldName]: `${API_BASE}${url}` }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  if (!items) return <Spinner />;

  return (
    <div className="space-y-6">
      <Card>
        <form onSubmit={handleCreate} className="grid sm:grid-cols-2 gap-3 items-end">
          {fields.map((f) => (
            <div key={f.name} className={f.type === 'image' ? 'sm:col-span-2' : ''}>
              <label className="block text-xs font-semibold text-ink/60 mb-1">{f.label}</label>
              {f.type === 'select' ? (
                <select
                  className="w-full rounded-xl border border-ink/10 px-3 py-2 text-sm bg-white"
                  value={form[f.name]}
                  onChange={(e) => setForm((s) => ({ ...s, [f.name]: e.target.value }))}
                >
                  {f.options.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              ) : f.type === 'image' ? (
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => handleFileChange(e, f.name)}
                    className="text-xs"
                  />
                  {uploading && <Spinner />}
                  {form[f.name] && <img src={form[f.name]} alt="" className="h-10 w-10 rounded-lg object-cover" />}
                </div>
              ) : (
                <input
                  type={f.type || 'text'}
                  required={f.required}
                  className="w-full rounded-xl border border-ink/10 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-forest-400"
                  value={form[f.name]}
                  onChange={(e) => setForm((s) => ({ ...s, [f.name]: e.target.value }))}
                  placeholder={f.placeholder}
                />
              )}
            </div>
          ))}
          <Button type="submit" disabled={saving}>{saving ? 'Добавляю…' : 'Добавить'}</Button>
        </form>
        {error && <p className="text-xs text-clay mt-2">{error}</p>}
      </Card>

      {items.length === 0 ? (
        <EmptyState text={emptyText} />
      ) : (
        <div className="space-y-2">
          {items.map((item, i) => (
            <Card
              key={item.id}
              className={`flex items-center gap-3 transition-opacity ${dragIndex === i ? 'opacity-40' : ''}`}
              draggable
              onDragStart={() => setDragIndex(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(i)}
              onDragEnd={() => setDragIndex(null)}
            >
              <div className="flex flex-col items-center gap-0.5 cursor-grab active:cursor-grabbing text-ink/30">
                <span className="text-sm leading-none">⠿</span>
                <div className="flex flex-col">
                  <button onClick={() => move(i, -1)} className="hover:text-ink text-[10px]" disabled={i === 0}>▲</button>
                  <button onClick={() => move(i, 1)} className="hover:text-ink text-[10px]" disabled={i === items.length - 1}>▼</button>
                </div>
              </div>
              <div className="flex-1 min-w-0">{renderRow(item)}</div>
              <Toggle checked={item.isEnabled} onChange={() => handleToggle(item)} />
              <Button variant="danger" onClick={() => handleDelete(item)}>Удалить</Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
