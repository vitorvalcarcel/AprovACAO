import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AppShellSkeleton from '../components/skeletons/AppShellSkeleton';

export default function PrivateRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <AppShellSkeleton />;
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}