import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Card, Spinner, EmptyState } from '../components/ui';
import { useAuth } from '../context/AuthContext';

const ACTION_LABELS = {
  login: 'Вход в систему',
  admin_registered: 'Регистрация кафе',
  category_created: 'Добавлена категория', category_updated: 'Изменена категория', category_deleted: 'Удалена категория',
  dish_created: 'Добавлено блюдо', dish_updated: 'Изменено блюдо', dish_deleted: 'Удалено блюдо',
  menu_block_created: 'Создан блок меню', menu_block_updated: 'Изменён блок меню',
  menu_block_duplicated: 'Блок меню продублирован', menu_block_deleted: 'Удалён блок меню',
  advertisement_created: 'Добавлена реклама', advertisement_updated: 'Изменена реклама', advertisement_deleted: 'Удалена реклама',
  gallery_photo_created: 'Добавлено фото галереи', gallery_photo_updated: 'Изменено фото галереи', gallery_photo_deleted: 'Удалено фото галереи',
  contact_created: 'Добавлен контакт', contact_updated: 'Изменён контакт', contact_deleted: 'Удалён контакт',
  menu_published: 'Меню опубликовано',
  admin_blocked: 'Администратор заблокирован', admin_unblocked: 'Администратор разблокирован',
  admin_deleted: 'Администратор удалён', admin_restored: 'Администратор восстановлен',
  admin_impersonated: 'Вход от имени администратора',
};

export default function AuditLog() {
  const { user } = useAuth();
  const [entries, setEntries] = useState(null);
  const isSuperAdmin = user?.role === 'super_admin';

  useEffect(() => {
    const path = isSuperAdmin ? '/api/superadmin/audit-log' : '/api/admin/audit-log';
    api.get(path).then((d) => setEntries(d.entries));
  }, [isSuperAdmin]);

  if (!entries) return <Spinner />;

  return (
    <div>
      <h1 className="font-display text-2xl mb-1">Журнал действий</h1>
      <p className="text-sm text-ink/50 mb-5">
        {isSuperAdmin ? 'Все действия на платформе' : 'Ваши последние действия в кафе'}
      </p>

      {entries.length === 0 ? (
        <EmptyState text="Пока нет записей" />
      ) : (
        <div className="space-y-1.5">
          {entries.map((e) => (
            <Card key={e.id} className="flex items-center justify-between py-2.5">
              <div>
                <p className="text-sm font-medium">{ACTION_LABELS[e.action] || e.action}</p>
                <p className="text-xs text-ink/45">
                  {e.actor || 'Система'}{isSuperAdmin && e.cafeName ? ` · ${e.cafeName}` : ''}
                </p>
              </div>
              <span className="text-xs text-ink/40 shrink-0">
                {new Date(e.createdAt).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
              </span>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
