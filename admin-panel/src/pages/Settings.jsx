import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Card, Toggle, Spinner, Button } from '../components/ui';

const DAYS = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
const STATUS_OPTIONS = [
  { value: 'open', label: 'Открыто' },
  { value: 'closed', label: 'Закрыто' },
  { value: 'temporarily_closed', label: 'Временно закрыто' },
];

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [hours, setHours] = useState(null);
  const [languages, setLanguages] = useState(null);

  async function load() {
    const [s, h, l] = await Promise.all([
      api.get('/api/admin/settings'),
      api.get('/api/admin/working-hours'),
      api.get('/api/admin/languages'),
    ]);
    setSettings(s.settings);
    setHours(h.workingHours);
    setLanguages(l.languages);
  }
  useEffect(() => { load(); }, []);

  async function patchSettings(patch) {
    const { settings: updated } = await api.patch('/api/admin/settings', patch);
    setSettings(updated);
  }

  async function saveHours() {
    const { workingHours } = await api.put('/api/admin/working-hours', { days: hours });
    setHours(workingHours);
  }

  async function saveLanguages(next) {
    setLanguages(next);
    await api.put('/api/admin/languages', { languages: next.map((l) => ({ code: l.code, isEnabled: l.isEnabled })) });
  }

  if (!settings || !hours || !languages) return <Spinner />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl mb-1">Настройки</h1>
        <p className="text-sm text-ink/50">Функции клиентского меню, часы работы, языки</p>
      </div>

      <Card>
        <p className="text-xs font-semibold text-ink/60 mb-3">Статус кафе</p>
        <div className="flex gap-2">
          {STATUS_OPTIONS.map((o) => (
            <button
              key={o.value}
              onClick={() => patchSettings({ status: o.value })}
              className={`px-3 py-2 rounded-xl text-sm font-medium ${
                settings.status === o.value ? 'bg-forest-600 text-cream' : 'bg-ink/5 text-ink/70'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </Card>

      <Card className="space-y-3">
        <p className="text-xs font-semibold text-ink/60">Функции меню</p>
        <Toggle checked={settings.searchEnabled} onChange={(v) => patchSettings({ searchEnabled: v })} label="Поиск блюд" />
        <Toggle checked={settings.favoritesEnabled} onChange={(v) => patchSettings({ favoritesEnabled: v })} label="Избранное" />
        <Toggle checked={settings.shareEnabled} onChange={(v) => patchSettings({ shareEnabled: v })} label="Поделиться меню" />
        <Toggle checked={settings.labelsEnabled} onChange={(v) => patchSettings({ labelsEnabled: v })} label="Специальные метки" />
      </Card>

      <Card>
        <p className="text-xs font-semibold text-ink/60 mb-3">Языки меню</p>
        <div className="flex gap-2">
          {languages.map((l) => (
            <button
              key={l.code}
              onClick={() => saveLanguages(languages.map((x) => (x.code === l.code ? { ...x, isEnabled: !x.isEnabled } : x)))}
              className={`px-3 py-2 rounded-xl text-sm font-medium ${
                l.isEnabled ? 'bg-forest-600 text-cream' : 'bg-ink/5 text-ink/70'
              }`}
            >
              {l.name}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <p className="text-xs font-semibold text-ink/60 mb-3">Часы работы</p>
        <div className="space-y-2">
          {hours.map((h, i) => (
            <div key={h.dayOfWeek} className="flex items-center gap-3">
              <span className="w-8 text-sm font-medium">{DAYS[h.dayOfWeek]}</span>
              <select
                className="rounded-lg border border-ink/10 text-sm px-2 py-1.5 bg-white"
                value={h.mode}
                onChange={(e) => setHours((arr) => arr.map((x, j) => (j === i ? { ...x, mode: e.target.value } : x)))}
              >
                <option value="workday">Рабочий день</option>
                <option value="day_off">Выходной</option>
                <option value="24h">Круглосуточно</option>
              </select>
              {h.mode === 'workday' && (
                <>
                  <input
                    type="time"
                    value={h.openTime?.slice(0, 5) || '09:00'}
                    onChange={(e) => setHours((arr) => arr.map((x, j) => (j === i ? { ...x, openTime: e.target.value } : x)))}
                    className="rounded-lg border border-ink/10 text-sm px-2 py-1.5"
                  />
                  <span className="text-ink/40">—</span>
                  <input
                    type="time"
                    value={h.closeTime?.slice(0, 5) || '22:00'}
                    onChange={(e) => setHours((arr) => arr.map((x, j) => (j === i ? { ...x, closeTime: e.target.value } : x)))}
                    className="rounded-lg border border-ink/10 text-sm px-2 py-1.5"
                  />
                </>
              )}
            </div>
          ))}
        </div>
        <Button className="mt-3" onClick={saveHours}>Сохранить часы работы</Button>
      </Card>
    </div>
  );
}
