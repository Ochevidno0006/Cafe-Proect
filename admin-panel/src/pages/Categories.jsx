import ResourceManager from '../components/ResourceManager';

export default function Categories() {
  return (
    <div>
      <h1 className="font-display text-2xl mb-1">Категории</h1>
      <p className="text-sm text-ink/50 mb-5">Круглые карточки меню — стрелками меняйте порядок</p>
      <ResourceManager
        config={{
          listPath: '/api/admin/categories',
          createPath: '/api/admin/categories',
          itemPath: (id) => `/api/admin/categories/${id}`,
          reorderPath: '/api/admin/categories/reorder',
          resourceKey: 'categories',
          emptyText: 'Категорий пока нет',
          fields: [
            { name: 'name', label: 'Название', required: true, placeholder: 'Например, Горячее' },
            { name: 'imageUrl', label: 'Изображение', type: 'image', default: '' },
          ],
          renderRow: (item) => (
            <div className="flex items-center gap-3">
              {item.imageUrl && <img src={item.imageUrl} className="h-9 w-9 rounded-full object-cover" alt="" />}
              <span className="font-medium text-sm">{item.name}</span>
            </div>
          ),
        }}
      />
    </div>
  );
}
