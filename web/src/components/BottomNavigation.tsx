import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, History, BarChart2, Menu, Plus } from 'lucide-react';

interface BottomNavigationProps {
  onOpenMenu: () => void;
  onOpenRegistro: () => void;
}

export default function BottomNavigation({ onOpenMenu, onOpenRegistro }: BottomNavigationProps) {
  const location = useLocation();
  const path = location.pathname;

  const isActive = (route: string) => path === route;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 pb-safe">
      <div className="flex items-center justify-between px-2 h-16">
        
        {/* 1. Home */}
        <Link to="/app" className={`flex-1 flex flex-col items-center gap-1 p-2 ${isActive('/app') ? 'text-blue-600' : 'text-gray-400'}`}>
          <LayoutDashboard size={24} strokeWidth={isActive('/app') ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Home</span>
        </Link>

        {/* 2. Histórico */}
        <Link to="/app/historico" className={`flex-1 flex flex-col items-center gap-1 p-2 ${isActive('/app/historico') ? 'text-blue-600' : 'text-gray-400'}`}>
          <History size={24} strokeWidth={isActive('/app/historico') ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Histórico</span>
        </Link>

        {/* 3. FAB (Registro Rápido) - Central e Elevado */}
        <div className="relative -top-5">
          <button 
            onClick={onOpenRegistro}
            className="w-14 h-14 bg-blue-600 rounded-full shadow-lg shadow-blue-300 flex items-center justify-center text-white hover:bg-blue-700 transition-transform active:scale-95"
          >
            <Plus size={32} />
          </button>
        </div>

        {/* 4. Estatísticas */}
        <Link to="/app/estatisticas" className={`flex-1 flex flex-col items-center gap-1 p-2 ${isActive('/app/estatisticas') ? 'text-blue-600' : 'text-gray-400'}`}>
          <BarChart2 size={24} strokeWidth={isActive('/app/estatisticas') ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Stats</span>
        </Link>

        {/* 5. Menu Completo (Drawer) */}
        <button onClick={onOpenMenu} className="flex-1 flex flex-col items-center gap-1 p-2 text-gray-400 hover:text-gray-600">
          <Menu size={24} />
          <span className="text-[10px] font-medium">Menu</span>
        </button>

      </div>
    </div>
  );
}