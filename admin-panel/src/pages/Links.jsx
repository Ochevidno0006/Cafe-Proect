cat > admin-panel/src/pages/Links.jsx << 'EOF'
import { useEffect, useState } from 'react';
import { api, CLIENT_MENU_BASE } from '../api/client';
import { Card, Spinner, Button } from '../components/ui';

export default function Links() {
  const [preview, setPreview] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.get('/api/admin/preview').then((d) => setPreview(d.preview));
  }, []);

  if (!preview) return <Spinner />;

  const menuUrl = `${CLIENT_MENU_BASE}/${preview.cafe.slug}`;
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(menuUrl)}`;

  function copy() {
    navigator.clipboard.writeText(menuUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div>
      <h1 className="font-display text-2xl mb-1">Ссылки</h1>
      <p className="text-sm text-ink/50 mb-5">Уникальная ссылка и QR-код вашего меню</p>

      <Card className="max-w-sm">
        <div className="rounded-xl overflow-hidden border border-ink/10 mb-4">
          <img src={qrSrc} alt="QR-код меню" className="w-full" />
        </div>
        <p className="text-xs text-ink/50 mb-1">Ссылка на меню</p>
        <p className="text-sm font-medium break-all bg-ink/5 rounded-lg p-2 mb-3">{menuUrl}</p>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={copy}>{copied ? 'Скопировано' : 'Копировать ссылку'}</Button>
          <Button variant="ghost" onClick={() => window.open(menuUrl, '_blank')}>Открыть меню</Button>
          <Button variant="ghost" onClick={() => window.open(qrSrc, '_blank')}>Скачать QR</Button>
        </div>
      </Card>
    </div>
  );
}
EOF