import { Navigate, Outlet } from 'react-router-dom';

export default function PublicRoute() {
  // Verifica se existe o token no navegador
  const token = localStorage.getItem('token');

  // Lógica Inversa ao PrivateRoute:
  // Se TEM token, manda pro Dashboard (não deixa ver login)
  // Se NÃO TEM token, deixa passar (mostra login/cadastro)
  return token ? <Navigate to="/app" replace /> : <Outlet />;
}