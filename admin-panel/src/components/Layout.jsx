import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ADMIN_NAV = [
  { to: '/', label: 'Главная', icon: '🏠', end: true },
  { to: '/categories', label: 'Категории', icon: '🗂️' },
  { to: '/dishes', label: 'Блюда', icon: '🍽️' },
  { to: '/menu-blocks', label: 'Блоки меню', icon: '📋' },
  { to: '/advertisements', label: 'Реклама', icon: '📣' },
  { to: '/gallery', label: 'Галерея', icon: '🖼️' },
  { to: '/contacts', label: 'Контакты', icon: '📞' },
  { to: '/design', label: 'Дизайн', icon: '🎨' },
  { to: '/settings', label: 'Настройки', icon: '⚙️' },
  { to: '/links', label: 'Ссылки', icon: '🔗' },
  { to: '/audit-log', label: 'Журнал', icon: '🕒' },
];

const SUPERADMIN_NAV = [
  { to: '/', label: 'Кафе и админы', icon: '🏢', end: true },
  { to: '/audit-log', label: 'Журнал платформы', icon: '🕒' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const nav = user?.role === 'super_admin' ? SUPERADMIN_NAV : ADMIN_NAV;

  return (
    <div className="min-h-screen flex">
      <aside className="w-60 shrink-0 bg-ink text-cream flex flex-col">
        <div className="px-5 py-5">
          <p className="font-display text-lg leading-tight">Cafe Menu</p>
          <p className="text-[11px] text-cream/50 mt-0.5">
            {user?.role === 'super_admin' ? 'Super Admin' : 'Панель кафе'}
          </p>
        </div>
        <nav className="flex-1 px-2.5 space-y-0.5">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? 'bg-forest-600 text-cream' : 'text-cream/70 hover:bg-white/5 hover:text-cream'
                }`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10">
          <p className="px-2 text-xs text-cream/50 truncate">{user?.firstName} {user?.lastName}</p>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="mt-1.5 w-full text-left px-2 py-2 rounded-xl text-sm text-cream/70 hover:bg-white/5 hover:text-cream"
          >
            Выйти
          </button>
        </div>
      </aside>
      <main className="flex-1 min-w-0 bg-cream">
        <div className="max-w-5xl mx-auto p-6 sm:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
