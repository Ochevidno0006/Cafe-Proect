import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';
import Dishes from './pages/Dishes';
import MenuBlocks from './pages/MenuBlocks';
import Advertisements from './pages/Advertisements';
import Gallery from './pages/Gallery';
import Contacts from './pages/Contacts';
import Design from './pages/Design';
import Settings from './pages/Settings';
import Links from './pages/Links';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import AuditLog from './pages/AuditLog';
import { Spinner } from './components/ui';

function PrivateRoutes() {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>;
  if (!user) return <Navigate to="/login" replace />;

  if (user.role === 'super_admin') {
    return (
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<SuperAdminDashboard />} />
          <Route path="/audit-log" element={<AuditLog />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/dishes" element={<Dishes />} />
        <Route path="/menu-blocks" element={<MenuBlocks />} />
        <Route path="/advertisements" element={<Advertisements />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/design" element={<Design />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/links" element={<Links />} />
        <Route path="/audit-log" element={<AuditLog />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();
  if (!loading && user) {
    return (
      <Routes>
        <Route path="/*" element={<PrivateRoutes />} />
      </Routes>
    );
  }
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/*" element={<PrivateRoutes />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
