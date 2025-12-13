import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { User, LayoutDashboard, Book, Target, History, LogOut, GraduationCap, X, BarChart2, Tag, List } from 'lucide-react';
import { useState } from 'react';
import AvisoExpiracao from './AvisoExpiracao';
import BottomNavigation from './BottomNavigation';
import Modal from './Modal';
import RegistroRapido from './RegistroRapido';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Controle do Menu Mobile (Drawer)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Controle Global do Modal de Registro Rápido (Acessível pelo FAB)
  const [registroModalOpen, setRegistroModalOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/login');
  };

  const menuItems = [
    { label: 'Ciclo de Estudos', icon: LayoutDashboard, path: '/app' },
    { label: 'Estatísticas', icon: BarChart2, path: '/app/estatisticas' },
    { label: 'Concursos', icon: Target, path: '/app/concursos' },
    { label: 'Meus Ciclos', icon: List, path: '/app/ciclos' },
    { label: 'Matérias & Assuntos', icon: Book, path: '/app/materias' },
    { label: 'Histórico', icon: History, path: '/app/historico' },
    { label: 'Tipos de Estudo', icon: Tag, path: '/app/tipos-estudo' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      
      {/* Overlay do Menu Mobile */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 lg:hidden backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar - Desktop (Fixo) & Mobile (Drawer) */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:flex lg:flex-col
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          <div className="h-20 flex items-center px-6 border-b border-gray-100 justify-between lg:justify-start">
            <div className="flex items-center">
              <GraduationCap className="text-blue-600 mr-2" size={32} />
              <span className="text-xl font-bold text-gray-800">Aprov<span className="text-blue-600">AÇÃO</span></span>
            </div>
            {/* Botão Fechar Menu no Mobile */}
            <button onClick={() => setMobileMenuOpen(false)} className="lg:hidden text-gray-400">
              <X size={24} />
            </button>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-colors ${
                    active ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon size={22} strokeWidth={active ? 2.5 : 2} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-100 space-y-1 bg-gray-50/50">
            <Link
              to="/app/perfil"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                location.pathname === '/app/perfil' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <User size={20} />
              Minha Conta
            </Link>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            >
              <LogOut size={20} />
              Sair
            </button>
          </div>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden h-screen relative">
        {/* pb-24 é necessário no mobile para o conteúdo não ficar atrás da navbar */}
        <div className="flex-1 overflow-auto p-4 lg:p-8 pb-24 lg:pb-8">
          <Outlet />
          <AvisoExpiracao />
        </div>
      </main>

      {/* Navegação Inferior (Mobile Only) */}
      <BottomNavigation 
        onOpenMenu={() => setMobileMenuOpen(true)} 
        onOpenRegistro={() => setRegistroModalOpen(true)} 
      />

      {/* Modal Global de Registro Rápido */}
      <Modal isOpen={registroModalOpen} onClose={() => setRegistroModalOpen(false)} title="Registrar Estudo">
        <RegistroRapido onRegistroSalvo={() => {
          setRegistroModalOpen(false);
          // O Dashboard atualiza automaticamente ao detectar foco ou mudança, 
          // mas idealmente dispararíamos um evento de refresh global aqui.
          // Como MVP, recarregar a janela garante sincronia:
          window.location.reload(); 
        }} />
      </Modal>

    </div>
  );
}