import { useEffect, useState } from 'react';
import { api, CLIENT_MENU_BASE } from '../api/client';
import { Card, Button, Spinner } from '../components/ui';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [publication, setPublication] = useState(null);
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState(null);

  async function load() {
    const [s, p] = await Promise.all([
      api.get('/api/admin/statistics/overview'),
      api.get('/api/admin/publication'),
    ]);
    setStats(s.last30Days);
    setPublication(p.publication);
  }

  useEffect(() => {
    load();
  }, []);

  async function handlePublish() {
    setPublishing(true);
    setMessage(null);
    try {
      await api.post('/api/admin/publish');
      setMessage('Меню опубликовано');
      load();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setPublishing(false);
    }
  }

  if (!stats) return <Spinner />;

  const cards = [
    { label: 'Просмотры меню', value: stats.menuViews },
    { label: 'Просмотры блюд', value: stats.dishViews },
    { label: 'Сканирования QR', value: stats.qrScans },
    { label: 'Переходы по ссылке', value: stats.linkOpens },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl">Главная</h1>
          <p className="text-sm text-ink/50">Статистика за последние 30 дней</p>
        </div>
        <div className="text-right">
          <Button onClick={handlePublish} disabled={publishing}>
            {publishing ? 'Публикуем…' : 'Опубликовать меню'}
          </Button>
          {publication && (
            <p className="text-xs text-ink/40 mt-1.5">
              Опубликовано: {new Date(publication.publishedAt).toLocaleString('ru-RU')}
            </p>
          )}
          {message && <p className="text-xs text-forest-700 mt-1">{message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {cards.map((c) => (
          <Card key={c.label}>
            <p className="text-2xl font-display">{c.value}</p>
            <p className="text-xs text-ink/50 mt-1">{c.label}</p>
          </Card>
        ))}
      </div>

      <Card>
        <h2 className="font-display text-lg mb-3">Живой предпросмотр черновика</h2>
        <LivePreview />
      </Card>
    </div>
  );
}

function LivePreview() {
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    api.get('/api/admin/preview').then((d) => setPreview(d.preview));
  }, []);

  if (!preview) return <Spinner />;

  const hasContent = preview.dishes.length > 0 || preview.categories.length > 0;

  return (
    <div className="flex flex-wrap gap-6 items-start">
      <div className="w-[280px] shrink-0 rounded-3xl border-8 border-ink bg-cream overflow-hidden shadow-card">
        <div className="h-8 bg-ink flex items-center justify-center">
          <div className="h-1 w-10 bg-cream/30 rounded-full" />
        </div>
        <div className="p-3">
          <div className="rounded-full bg-ink text-cream text-xs font-display px-3 py-2 truncate">
            {preview.cafe.name}
          </div>
          {!hasContent && (
            <div className="mt-3 space-y-2">
              <div className="h-16 rounded-xl bg-ink/5 animate-pulse" />
              <div className="grid grid-cols-2 gap-2">
                <div className="h-24 rounded-xl bg-ink/5 animate-pulse" />
                <div className="h-24 rounded-xl bg-ink/5 animate-pulse" />
              </div>
              <p className="text-[11px] text-ink/35 text-center pt-1">
                Пока пусто — добавьте категории и блюда
              </p>
            </div>
          )}
          {hasContent && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {preview.dishes.slice(0, 4).map((d) => (
                <div key={d.id} className="rounded-xl bg-white shadow-card overflow-hidden">
                  <div className="aspect-square bg-forest-50 flex items-center justify-center text-forest-300 font-display text-lg">
                    {d.photoUrl ? <img src={d.photoUrl} className="w-full h-full object-cover" /> : d.name[0]}
                  </div>
                  <div className="p-1.5">
                    <p className="text-[11px] font-semibold truncate">{d.name}</p>
                    <p className="text-[10px] text-forest-700">{d.price} c.</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 min-w-[200px] text-sm text-ink/60 space-y-1.5">
        <p><b>{preview.categories.length}</b> категорий · <b>{preview.dishes.length}</b> блюд · <b>{preview.menuBlocks.length}</b> блоков</p>
        <p className="text-xs text-ink/40">
          Это черновик — гости видят его только после нажатия «Опубликовать меню».
        </p>
        <p className="text-xs text-ink/40">
         Публичная ссылка: <code className="bg-ink/5 px-1.5 py-0.5 rounded">{CLIENT_MENU_BASE}/{preview.cafe.slug}</code>
        </p>
      </div>
    </div>
  );
}
