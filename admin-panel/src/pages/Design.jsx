import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Card, Button, Spinner } from '../components/ui';

const PRESETS = [
  { value: 'modern', label: 'Modern' }, { value: 'elegant', label: 'Elegant' },
  { value: 'minimal', label: 'Minimal' }, { value: 'dark', label: 'Dark' },
  { value: 'classic', label: 'Classic' }, { value: 'restaurant', label: 'Restaurant' },
];

export default function Design() {
  const [theme, setTheme] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/api/admin/theme').then((d) => setTheme(d.theme));
  }, []);

  async function save(patch) {
    setSaving(true);
    const { theme: updated } = await api.patch('/api/admin/theme', patch);
    setTheme(updated);
    setSaving(false);
  }

  if (!theme) return <Spinner />;

  return (
    <div>
      <h1 className="font-display text-2xl mb-1">Дизайн</h1>
      <p className="text-sm text-ink/50 mb-5">Готовый стиль и цвета клиентского меню</p>

      <Card className="mb-4">
        <p className="text-xs font-semibold text-ink/60 mb-2">Готовый стиль</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.value}
              onClick={() => save({ preset: p.value })}
              className={`px-4 py-2 rounded-xl text-sm font-medium ${
                theme.preset === p.value ? 'bg-forest-600 text-cream' : 'bg-ink/5 text-ink/70'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <p className="text-xs font-semibold text-ink/60 mb-3">Цвета и форма</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { key: 'primaryColor', label: 'Основной' },
            { key: 'buttonColor', label: 'Кнопки' },
            { key: 'backgroundColor', label: 'Фон' },
            { key: 'textColor', label: 'Текст' },
          ].map((c) => (
            <label key={c.key} className="block">
              <span className="block text-xs text-ink/50 mb-1">{c.label}</span>
              <input
                type="color"
                value={theme[c.key] || '#3F7D3D'}
                onChange={(e) => setTheme((s) => ({ ...s, [c.key]: e.target.value }))}
                onBlur={(e) => save({ [c.key]: e.target.value })}
                className="w-full h-9 rounded-lg border border-ink/10"
              />
            </label>
          ))}
        </div>
        <label className="block mt-4 max-w-xs">
          <span className="block text-xs text-ink/50 mb-1">Радиус карточек: {theme.cardRadius}px</span>
          <input
            type="range" min="0" max="32"
            value={theme.cardRadius}
            onChange={(e) => setTheme((s) => ({ ...s, cardRadius: Number(e.target.value) }))}
            onMouseUp={(e) => save({ cardRadius: Number(e.target.value) })}
            className="w-full"
          />
        </label>
        {saving && <p className="text-xs text-ink/40 mt-2">Сохраняем…</p>}
      </Card>
    </div>
  );
}
