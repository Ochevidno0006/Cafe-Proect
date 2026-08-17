import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Card } from '../components/ui';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(phone, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <h1 className="font-display text-2xl mb-1">Вход</h1>
        <p className="text-sm text-ink/50 mb-5">Cafe Menu SaaS — панель управления</p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input label="Телефон" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+992 ..." required />
          <Input label="Пароль" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <p className="text-xs text-clay">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Входим…' : 'Войти'}</Button>
        </form>
        <p className="text-xs text-ink/50 mt-4 text-center">
          Нет кафе? <Link to="/register" className="text-forest-700 font-semibold">Зарегистрировать</Link>
        </p>
      </Card>
    </div>
  );
}
