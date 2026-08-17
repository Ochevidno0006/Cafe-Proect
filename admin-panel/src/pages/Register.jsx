import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Card } from '../components/ui';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '', lastName: '', phone: '', cafeName: '', password: '', passwordConfirm: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  function set(field) {
    return (e) => setForm((s) => ({ ...s, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.details ? Object.values(err.details).flat().join(' ') : err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-sm">
        <h1 className="font-display text-2xl mb-1">Регистрация кафе</h1>
        <p className="text-sm text-ink/50 mb-5">Создайте своё пространство за минуту</p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Имя" value={form.firstName} onChange={set('firstName')} required />
            <Input label="Фамилия" value={form.lastName} onChange={set('lastName')} required />
          </div>
          <Input label="Телефон" value={form.phone} onChange={set('phone')} placeholder="+992 ..." required />
          <Input label="Название кафе" value={form.cafeName} onChange={set('cafeName')} required />
          <Input label="Пароль" type="password" value={form.password} onChange={set('password')} required />
          <Input label="Повтор пароля" type="password" value={form.passwordConfirm} onChange={set('passwordConfirm')} required />
          {error && <p className="text-xs text-clay">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Создаём…' : 'Создать кафе'}</Button>
        </form>
        <p className="text-xs text-ink/50 mt-4 text-center">
          Уже есть аккаунт? <Link to="/login" className="text-forest-700 font-semibold">Войти</Link>
        </p>
      </Card>
    </div>
  );
}
