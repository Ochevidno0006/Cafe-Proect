import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Card, Button, Spinner } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function SuperAdminDashboard() {
  const [admins, setAdmins] = useState(null);
  const [cafes, setCafes] = useState(null);
  const { loginAs } = useAuth();
  const navigate = useNavigate();

  async function load() {
    const [a, c] = await Promise.all([api.get('/api/superadmin/admins'), api.get('/api/superadmin/cafes')]);
    setAdmins(a.admins);
    setCafes(c.cafes);
  }
  useEffect(() => { load(); }, []);

  async function toggleBlock(admin) {
    const action = admin.status === 'blocked' ? 'unblock' : 'block';
    await api.post(`/api/superadmin/admins/${admin.id}/${action}`);
    load();
  }

  async function impersonate(admin) {
    const data = await api.post(`/api/superadmin/admins/${admin.id}/impersonate`);
    loginAs(data.accessToken, data.user);
    navigate('/');
  }

  if (!admins || !cafes) return <Spinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl mb-1">Кафе и администраторы</h1>
        <p className="text-sm text-ink/50">{cafes.length} кафе · {admins.length} администраторов на платформе</p>
      </div>

      <div className="space-y-2">
        {admins.map((admin) => {
          const cafe = cafes.find((c) => c.ownerUserId === admin.id);
          return (
            <Card key={admin.id} className="flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{admin.firstName} {admin.lastName}</p>
                <p className="text-xs text-ink/50">{admin.phone} · {cafe?.name || '—'}</p>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                admin.status === 'blocked' ? 'bg-clay/10 text-clay' : 'bg-forest-50 text-forest-700'
              }`}>
                {admin.status === 'blocked' ? 'Заблокирован' : 'Активен'}
              </span>
              <Button variant="ghost" onClick={() => impersonate(admin)}>Войти как админ</Button>
              <Button variant={admin.status === 'blocked' ? 'primary' : 'danger'} onClick={() => toggleBlock(admin)}>
                {admin.status === 'blocked' ? 'Разблокировать' : 'Заблокировать'}
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
