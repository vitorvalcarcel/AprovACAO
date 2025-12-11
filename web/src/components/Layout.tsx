import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Book, Target, History, LogOut, GraduationCap, Menu, X, BarChart2, Tag } from 'lucide-react'; // <--- Adicionei 'Tag' aqui
import { useState } from 'react';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/login');
  };

  const menuItems = [
    { label: 'Ciclo de Estudos', icon: LayoutDashboard, path: '/app' },
    { label: 'Estatísticas', icon: BarChart2, path: '/app/estatisticas' },
    { label: 'Concursos', icon: Target, path: '/app/concursos' },
    { label: 'Matérias & Assuntos', icon: Book, path: '/app/materias' },
    { label: 'Histórico', icon: History, path: '/app/historico' },
    { label: 'Tipos de Estudo', icon: Tag, path: '/app/tipos-estudo' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      
      {/* MENU MOBILE (Overlay) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:block
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-gray-100">
            <GraduationCap className="text-blue-600 mr-2" size={28} />
            <span className="text-xl font-bold text-gray-800">Aprov<span className="text-blue-600">AÇÃO</span></span>
            <button onClick={() => setMobileMenuOpen(false)} className="ml-auto lg:hidden text-gray-500">
              <X size={24} />
            </button>
          </div>

          {/* Links */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    active 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon size={20} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Footer Sidebar */}
          <div className="p-4 border-t border-gray-100">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              Sair
            </button>
          </div>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden h-screen">
        
        {/* Header Mobile */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 lg:hidden flex-shrink-0">
          <button onClick={() => setMobileMenuOpen(true)} className="text-gray-600 p-2">
            <Menu size={24} />
          </button>
          <span className="ml-2 font-bold text-gray-800">AprovAÇÃO</span>
        </header>

        {/* Área de Scroll */}
        <div className="flex-1 overflow-auto p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}