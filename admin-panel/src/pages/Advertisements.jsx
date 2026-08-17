import ResourceManager from '../components/ResourceManager';

export default function Advertisements() {
  return (
    <div>
      <h1 className="font-display text-2xl mb-1">Реклама</h1>
      <p className="text-sm text-ink/50 mb-5">Баннеры, которые гость листает горизонтально</p>
      <ResourceManager
        config={{
          listPath: '/api/admin/advertisements',
          createPath: '/api/admin/advertisements',
          itemPath: (id) => `/api/admin/advertisements/${id}`,
          reorderPath: '/api/admin/advertisements/reorder',
          resourceKey: 'advertisements',
          emptyText: 'Баннеров пока нет',
          fields: [{ name: 'imageUrl', label: 'Изображение баннера', type: 'image', required: true, default: '' }],
          renderRow: (item) => (
            <div className="flex items-center gap-3">
              <img src={item.imageUrl} className="h-9 w-16 rounded-lg object-cover" alt="" />
              <span className="text-xs text-ink/50 truncate">{item.imageUrl}</span>
            </div>
          ),
        }}
      />
    </div>
  );
}
