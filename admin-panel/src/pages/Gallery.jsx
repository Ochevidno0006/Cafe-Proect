import ResourceManager from '../components/ResourceManager';

const CATEGORY_OPTIONS = [
  { value: 'interior', label: 'Интерьер' },
  { value: 'hall', label: 'Зал' },
  { value: 'dishes', label: 'Блюда' },
  { value: 'atmosphere', label: 'Атмосфера' },
];

export default function Gallery() {
  return (
    <div>
      <h1 className="font-display text-2xl mb-1">Галерея</h1>
      <p className="text-sm text-ink/50 mb-5">Фото интерьера, зала, блюд, атмосферы</p>
      <ResourceManager
        config={{
          listPath: '/api/admin/gallery',
          createPath: '/api/admin/gallery',
          itemPath: (id) => `/api/admin/gallery/${id}`,
          reorderPath: '/api/admin/gallery/reorder',
          resourceKey: 'gallery',
          emptyText: 'Фото пока нет',
          fields: [
            { name: 'imageUrl', label: 'Фото', type: 'image', required: true, default: '' },
            { name: 'category', label: 'Категория', type: 'select', options: CATEGORY_OPTIONS, default: 'interior' },
          ],
          renderRow: (item) => (
            <div className="flex items-center gap-3">
              <img src={item.imageUrl} className="h-9 w-9 rounded-lg object-cover" alt="" />
              <span className="text-xs text-ink/50">{CATEGORY_OPTIONS.find((o) => o.value === item.category)?.label}</span>
            </div>
          ),
        }}
      />
    </div>
  );
}
