import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import VerificarEmail from './pages/VerificarEmail';
import ConfirmarConta from './pages/ConfirmarConta';
import EsqueciSenha from './pages/EsqueciSenha';
import RedefinirSenha from './pages/RedefinirSenha';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './routes/PrivateRoute';
import PublicRoute from './routes/PublicRoute';
import Layout from './components/Layout';
import Materias from './pages/Materias';
import Concursos from './pages/Concursos';
import Historico from './pages/Historico';
import TiposEstudo from './pages/TiposEstudo';
import Estatisticas from './pages/Estatisticas';
import Perfil from './pages/Perfil';
import MeusCiclos from './pages/MeusCiclos';
import Manutencao from './pages/Manutencao';
import { ToastProvider } from './components/Toast/ToastContext';
import { TimerProvider } from './contexts/TimerContext';
import { AuthProvider } from './contexts/AuthContext';
import { OnboardingProvider } from './contexts/OnboardingContext';
import RequireOnboarding from './routes/RequireOnboarding';
import Onboarding from './pages/Onboarding';

// Componente interno
function AppContent() {
  // REMOVIDO: O bloqueio "if (loading)" foi retirado.
  // O app vai renderizar as rotas imediatamente se tiver token no localStorage,
  // restaurando a sensação de velocidade e mostrando a Sidebar.

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/manutencao" element={<Manutencao />} />

        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/verificar-email" element={<VerificarEmail />} />
          <Route path="/confirmar" element={<ConfirmarConta />} />
          <Route path="/esqueci-senha" element={<EsqueciSenha />} />
          <Route path="/redefinir-senha" element={<RedefinirSenha />} />
        </Route>

        {/* Rotas Privadas (Requer Autenticação) */}
        <Route element={<PrivateRoute />}>

          {/* Verifica se precisa do tutorial */}
          <Route element={<RequireOnboarding />}>

            {/* Rota do Tutorial */}
            <Route path="/onboarding" element={<Onboarding />} />

            {/* App Principal (Só acessa se tutorial concluído) */}
            <Route element={<Layout />}>
              <Route path="/app" element={<Dashboard />} />
              <Route path="/app/materias" element={<Materias />} />
              <Route path="/app/concursos" element={<Concursos />} />
              <Route path="/app/ciclos" element={<MeusCiclos />} />
              <Route path="/app/historico" element={<Historico />} />
              <Route path="/app/tipos-estudo" element={<TiposEstudo />} />
              <Route path="/app/estatisticas" element={<Estatisticas />} />
              <Route path="/app/perfil" element={<Perfil />} />
            </Route>

            <Route path="/" element={<Navigate to="/app" replace />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <TimerProvider>
          <OnboardingProvider>
            <AppContent />
          </OnboardingProvider>
        </TimerProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;