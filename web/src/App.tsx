import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
        </Route>

        <Route element={<PrivateRoute />}>
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

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;