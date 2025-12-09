import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  GraduationCap, 
  Library, 
  LogOut, 
  User,
  Tags,
  CheckSquare
} from 'lucide-react';

export default function Layout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Estilo base para os links do menu
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
      isActive 
        ? 'bg-blue-600 text-white shadow-md' 
        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
    }`;

  return (
    <div className="flex min-h-screen bg-gray-100">
      
      {/* === BARRA LATERAL (SIDEBAR) === */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col fixed h-full shadow-xl">
        
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            NomeAÇÃO
          </h1>
          <p className="text-xs text-gray-500 mt-1">Sua vaga, sua estratégia.</p>
        </div>

        {/* Menu de Navegação */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          
          <NavLink to="/app" end className={linkClass}>
            <LayoutDashboard size={20} />
            Início
          </NavLink>

          <NavLink to="/app/registros" className={linkClass}>
            <CheckSquare size={20} />
            Meus Registros
          </NavLink>

          {/* GRUPO: CADASTROS / INVENTÁRIO */}
          <div className="pt-6 pb-2">
            <p className="px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
              Inventário
            </p>
          </div>

          <NavLink to="/app/concursos" className={linkClass}>
            <GraduationCap size={20} />
            Concursos
          </NavLink>

          <NavLink to="/app/materias" className={linkClass}>
            <Library size={20} />
            Matérias
          </NavLink>

          <NavLink to="/app/topicos" className={linkClass}>
            <Tags size={20} />
            Tópicos
          </NavLink>

          <NavLink to="/app/tipos-estudo" className={linkClass}>
            <BookOpen size={20} />
            Tipos de Estudo
          </NavLink>

        </nav>

        {/* Rodapé do Menu */}
        <div className="p-4 border-t border-gray-800 space-y-2">
          <NavLink to="/app/perfil" className={linkClass}>
            <User size={20} />
            Meu Perfil
          </NavLink>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-red-400 hover:bg-red-900/20 hover:text-red-300 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            Sair
          </button>
        </div>

      </aside>

      {/* === ÁREA DE CONTEÚDO (MAIN) === */}
      {/* margin-left para não ficar escondido atrás da sidebar fixa */}
      <main className="flex-1 ml-64 p-8">
        <Outlet /> {/* Aqui é onde as telas (Dashboard, Matérias) aparecem */}
      </main>

    </div>
  );
}