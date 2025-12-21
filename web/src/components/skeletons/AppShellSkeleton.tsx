import { GraduationCap, LayoutDashboard, BarChart2, Target, List, Book, History, Tag, User, MessageSquarePlus, LogOut } from 'lucide-react';
import DashboardSkeleton from './DashboardSkeleton';

export default function AppShellSkeleton() {
  // Itens de menu estáticos apenas para visual
  const menuItems = [
    { icon: LayoutDashboard, label: 'Ciclo de Estudos' },
    { icon: BarChart2, label: 'Estatísticas' },
    { icon: Target, label: 'Concursos' },
    { icon: List, label: 'Meus Ciclos' },
    { icon: Book, label: 'Matérias & Assuntos' },
    { icon: History, label: 'Histórico' },
    { icon: Tag, label: 'Tipos de Estudo' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      
      {/* --- SIDEBAR SKELETON (Falso Layout) --- */}
      <aside className="hidden lg:flex w-72 bg-white border-r border-gray-200 flex-col fixed inset-y-0 left-0 z-50">
        <div className="h-20 flex items-center px-6 border-b border-gray-100">
          <div className="flex items-center opacity-50 grayscale">
            <GraduationCap className="text-gray-400 mr-2" size={32} />
            <span className="text-xl font-bold text-gray-400">Aprov<span className="text-gray-400">AÇÃO</span></span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {menuItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium text-gray-300"
            >
              <item.icon size={22} className="text-gray-200" />
              <div className="h-4 w-24 bg-gray-100 rounded animate-pulse"></div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100 space-y-1 bg-gray-50/50">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-300">
            <User size={20} className="text-gray-200" />
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-300">
            <MessageSquarePlus size={20} className="text-gray-200" />
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-300">
            <LogOut size={20} className="text-gray-200" />
            <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </aside>

      {/* --- CONTEÚDO PRINCIPAL --- */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden h-screen relative lg:pl-72 transition-all duration-300">
        <div className="flex-1 overflow-auto p-4 lg:p-8 pb-32 lg:pb-8">
          
          {/* Aqui carregamos o Skeleton do Dashboard que você já tem */}
          <DashboardSkeleton />
          
        </div>
      </main>
    </div>
  );
}