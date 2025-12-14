import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, History, BarChart2, Menu, Clock, Timer, Edit3 } from 'lucide-react';
import { useTimer } from '../contexts/TimerContext';

interface BottomNavigationProps {
  onOpenMenu: () => void;
  onOpenRegistro: (mode: 'timer' | 'manual') => void;
}

export default function BottomNavigation({ onOpenMenu, onOpenRegistro }: BottomNavigationProps) {
  const location = useLocation();
  const path = location.pathname;
  const { isActive, startTimer } = useTimer();
  const [fabOpen, setFabOpen] = useState(false);

  const isActiveRoute = (route: string) => path === route;

  const handleFabClick = () => {
    if (isActive) {
        // Se já está rodando, não abre menu, abre direto o modal do timer
        onOpenRegistro('timer');
    } else {
        // Se não está rodando, abre o menu de opções
        setFabOpen(!fabOpen);
    }
  };

  const handleAction = (action: 'timer' | 'manual') => {
    setFabOpen(false); 
    
    if (action === 'timer') {
        startTimer(); // Inicia PiP
    } else {
        onOpenRegistro('manual');
    }
  };

  return (
    <>
      {fabOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden backdrop-blur-sm" onClick={() => setFabOpen(false)} />
      )}

      {/* Menu Speed Dial - Só aparece se fabOpen for true (o que só acontece se timer !isActive) */}
      <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 flex flex-col gap-3 items-center z-40 transition-all duration-300 lg:hidden ${fabOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-90 pointer-events-none'}`}>
        
        <button onClick={() => handleAction('manual')} className="flex items-center gap-3 bg-white text-gray-700 px-5 py-3 rounded-full shadow-xl font-bold border border-gray-100 active:scale-95 transition-transform w-48 justify-center">
            <Edit3 size={20} /> Manual
        </button>

        <button onClick={() => handleAction('timer')} className="flex items-center gap-3 bg-blue-600 text-white px-5 py-3 rounded-full shadow-xl font-bold active:scale-95 transition-transform w-48 justify-center">
            <Timer size={20} /> Iniciar Agora
        </button>

      </div>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 pb-safe">
        <div className="flex items-center justify-between px-2 h-16">
          
          <Link to="/app" className={`flex-1 flex flex-col items-center gap-1 p-2 ${isActiveRoute('/app') ? 'text-blue-600' : 'text-gray-400'}`}>
            <LayoutDashboard size={24} strokeWidth={isActiveRoute('/app') ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Home</span>
          </Link>

          <Link to="/app/historico" className={`flex-1 flex flex-col items-center gap-1 p-2 ${isActiveRoute('/app/historico') ? 'text-blue-600' : 'text-gray-400'}`}>
            <History size={24} strokeWidth={isActiveRoute('/app/historico') ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Histórico</span>
          </Link>

          {/* Botão FAB Central */}
          <div className="relative -top-5">
            <button 
              onClick={handleFabClick}
              className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white transition-all duration-300 ${
                fabOpen 
                  ? 'bg-gray-700 rotate-45 shadow-gray-400' 
                  : isActive 
                    ? 'bg-white border-4 border-blue-600 text-blue-600 shadow-blue-200 animate-pulse' // Estilo quando ativo
                    : 'bg-blue-600 shadow-blue-300'
              }`}
            >
              {isActive ? <Timer size={28} strokeWidth={2.5} /> : <Clock size={32} />}
            </button>
          </div>

          <Link to="/app/estatisticas" className={`flex-1 flex flex-col items-center gap-1 p-2 ${isActiveRoute('/app/estatisticas') ? 'text-blue-600' : 'text-gray-400'}`}>
            <BarChart2 size={24} strokeWidth={isActiveRoute('/app/estatisticas') ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Stats</span>
          </Link>

          <button onClick={onOpenMenu} className="flex-1 flex flex-col items-center gap-1 p-2 text-gray-400 hover:text-gray-600">
            <Menu size={24} />
            <span className="text-[10px] font-medium">Menu</span>
          </button>

        </div>
      </div>
    </>
  );
}