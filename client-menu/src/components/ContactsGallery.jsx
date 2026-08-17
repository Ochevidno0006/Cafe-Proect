import { resolveImage } from '../api';

const CONTACT_ICON = {
  phone: '📞', whatsapp: '🟢', telegram: '✈️', instagram: '📷',
  address: '📍', delivery: '🛵', email: '✉️', other: '🔗',
};

export function ContactsSection({ contacts }) {
  if (!contacts || contacts.length === 0) return null;
  return (
    <section className="px-3 mt-8">
      <h2 className="font-display text-xl text-ink mb-3">Контакты</h2>
      <div className="bg-white rounded-2xl shadow-card divide-y divide-ink/5">
        {contacts.map((c) => (
          <div key={c.id} className="flex items-center gap-3 px-4 py-3">
            <span className="text-lg">{CONTACT_ICON[c.type] || '🔗'}</span>
            <span className="text-sm text-ink/80">{c.value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function GallerySection({ gallery }) {
  if (!gallery || gallery.length === 0) return null;
  return (
    <section className="px-3 mt-8">
      <h2 className="font-display text-xl text-ink mb-3">Галерея</h2>
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
        {gallery.map((g) => (
          <div key={g.id} className="shrink-0 w-28 h-28 rounded-xl overflow-hidden shadow-card bg-forest-50">
            <img src={resolveImage(g.imageUrl)} alt="" className="w-full h-full object-cover" loading="lazy" />
          </div>
        ))}
      </div>
    </section>
  );
}
