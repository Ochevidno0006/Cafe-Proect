import ResourceManager from '../components/ResourceManager';

const TYPE_OPTIONS = [
  { value: 'phone', label: 'Телефон' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'address', label: 'Адрес' },
  { value: 'delivery', label: 'Доставка' },
  { value: 'email', label: 'Email' },
  { value: 'other', label: 'Другое' },
];

export default function Contacts() {
  return (
    <div>
      <h1 className="font-display text-2xl mb-1">Контакты</h1>
      <p className="text-sm text-ink/50 mb-5">Отображаются гостю, только если включены</p>
      <ResourceManager
        config={{
          listPath: '/api/admin/contacts',
          createPath: '/api/admin/contacts',
          itemPath: (id) => `/api/admin/contacts/${id}`,
          reorderPath: '/api/admin/contacts/reorder',
          resourceKey: 'contacts',
          emptyText: 'Контактов пока нет',
          fields: [
            { name: 'type', label: 'Тип', type: 'select', options: TYPE_OPTIONS, default: 'phone' },
            { name: 'value', label: 'Значение', required: true, placeholder: '+992 ...' },
          ],
          renderRow: (item) => (
            <div>
              <span className="text-xs font-semibold text-forest-700">{TYPE_OPTIONS.find((o) => o.value === item.type)?.label}</span>
              <p className="text-sm">{item.value}</p>
            </div>
          ),
        }}
      />
    </div>
  );
}
