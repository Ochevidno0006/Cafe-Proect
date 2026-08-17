import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Card, Button, Input, Toggle, Spinner, EmptyState } from '../components/ui';

export default function MenuBlocks() {
  const [blocks, setBlocks] = useState(null);
  const [dishes, setDishes] = useState([]);
  const [name, setName] = useState('');
  const [editing, setEditing] = useState(null);

  async function load() {
    const [b, d] = await Promise.all([api.get('/api/admin/menu-blocks'), api.get('/api/admin/dishes')]);
    setBlocks(b.menuBlocks);
    setDishes(d.dishes);
  }
  useEffect(() => { load(); }, []);

  async function handleCreate(e) {
    e.preventDefault();
    if (!name.trim()) return;
    await api.post('/api/admin/menu-blocks', { name });
    setName('');
    load();
  }

  async function toggle(block) {
    await api.patch(`/api/admin/menu-blocks/${block.id}`, { isEnabled: !block.isEnabled });
    load();
  }

  async function duplicate(block) {
    await api.post(`/api/admin/menu-blocks/${block.id}/duplicate`);
    load();
  }

  async function remove(block) {
    if (!confirm('Удалить блок?')) return;
    await api.del(`/api/admin/menu-blocks/${block.id}`);
    load();
  }

  async function move(index, dir) {
    const next = [...blocks];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setBlocks(next);
    await api.post('/api/admin/menu-blocks/reorder', { orderedIds: next.map((b) => b.id) });
  }

  const [dragIndex, setDragIndex] = useState(null);
  async function handleDrop(targetIndex) {
    if (dragIndex === null || dragIndex === targetIndex) return;
    const next = [...blocks];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(targetIndex, 0, moved);
    setDragIndex(null);
    setBlocks(next);
    await api.post('/api/admin/menu-blocks/reorder', { orderedIds: next.map((b) => b.id) });
  }

  if (!blocks) return <Spinner />;

  return (
    <div>
      <h1 className="font-display text-2xl mb-1">Блоки меню</h1>
      <p className="text-sm text-ink/50 mb-5">Например «Популярное сейчас», «Новинки», «Акции»</p>

      <Card className="mb-5">
        <form onSubmit={handleCreate} className="flex gap-3">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Название блока" className="flex-1" />
          <Button type="submit">Добавить</Button>
        </form>
      </Card>

      {blocks.length === 0 ? (
        <EmptyState text="Блоков пока нет" />
      ) : (
        <div className="space-y-2">
          {blocks.map((block, i) => (
            <Card key={block.id} className={dragIndex === i ? 'opacity-40' : ''}
              draggable onDragStart={() => setDragIndex(i)} onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(i)} onDragEnd={() => setDragIndex(null)}>
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center gap-0.5 cursor-grab active:cursor-grabbing text-ink/30">
                  <span className="text-sm leading-none">⠿</span>
                  <div className="flex flex-col">
                    <button onClick={() => move(i, -1)} className="hover:text-ink text-[10px]" disabled={i === 0}>▲</button>
                    <button onClick={() => move(i, 1)} className="hover:text-ink text-[10px]" disabled={i === blocks.length - 1}>▼</button>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{block.name}</p>
                  <p className="text-xs text-ink/50">{block.dishIds.length} блюд</p>
                </div>
                <Button variant="ghost" onClick={() => setEditing(block)}>Состав</Button>
                <Button variant="ghost" onClick={() => duplicate(block)}>Дублировать</Button>
                <Toggle checked={block.isEnabled} onChange={() => toggle(block)} />
                <Button variant="danger" onClick={() => remove(block)}>Удалить</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {editing && (
        <BlockDishPicker
          block={editing}
          dishes={dishes}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}
    </div>
  );
}

function BlockDishPicker({ block, dishes, onClose, onSaved }) {
  const [selected, setSelected] = useState(block.dishIds);
  const [saving, setSaving] = useState(false);

  function toggle(id) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  async function handleSave() {
    setSaving(true);
    await api.put(`/api/admin/menu-blocks/${block.id}/dishes`, { dishIds: selected });
    setSaving(false);
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40" onClick={onClose}>
      <div className="bg-cream rounded-2xl shadow-card max-w-md w-full max-h-[80vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-display text-xl mb-1">Состав блока «{block.name}»</h2>
        <p className="text-xs text-ink/50 mb-4">Выберите блюда, входящие в этот блок</p>
        <div className="space-y-1.5 max-h-96 overflow-y-auto">
          {dishes.map((d) => (
            <label key={d.id} className="flex items-center gap-3 bg-white rounded-xl p-2.5 shadow-card cursor-pointer">
              <input type="checkbox" checked={selected.includes(d.id)} onChange={() => toggle(d.id)} />
              <span className="text-sm flex-1">{d.name}</span>
              <span className="text-xs text-forest-700 font-semibold">{d.price} c.</span>
            </label>
          ))}
        </div>
        <div className="flex gap-2 mt-4">
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Сохраняем…' : 'Сохранить'}</Button>
          <Button variant="ghost" onClick={onClose}>Отмена</Button>
        </div>
      </div>
    </div>
  );
}
