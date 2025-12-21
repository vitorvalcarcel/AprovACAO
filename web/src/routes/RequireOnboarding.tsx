import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AppShellSkeleton from '../components/skeletons/AppShellSkeleton';

export default function RequireOnboarding() {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <AppShellSkeleton />;
    }

    // Se não tem usuário logado, deixa o PrivateRoute lidar (ou redireciona pra login)
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const isOnboardingRoute = location.pathname === '/onboarding';

    // Se tutorial NÃO concluído
    if (!user.tutorialConcluido) {
        // E não está na rota de onboarding, manda pra lá
        if (!isOnboardingRoute) {
            return <Navigate to="/onboarding" replace />;
        }
        // Se já está no onboarding, renderiza
        return <Outlet />;
    }

    // Se tutorial concluído
    if (user.tutorialConcluido) {
        // E tenta acessar onboarding, manda pro app
        if (isOnboardingRoute) {
            return <Navigate to="/app" replace />;
        }
        // Se está em rota normal, renderiza
        return <Outlet />;
    }

    return <Outlet />;
}
