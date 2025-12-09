import { Navigate, Outlet } from 'react-router-dom';

export default function PrivateRoute() {
  // Verifica se existe o token no navegador
  const token = localStorage.getItem('token');

  // Se tem token, deixa passar (renderiza o Outlet/Conteúdo)
  // Se não tem, joga para o /login
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}