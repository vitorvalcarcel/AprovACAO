import RegistroRapido from '../components/RegistroRapido';

export default function Dashboard() {
  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-theme(spacing.24))]"> {/* Altura ajustada */}
      
      {/* Coluna Principal (Esquerda - Gráficos e Resumos) */}
      <div className="flex-1 space-y-6">
        
        {/* Cards de Resumo (Placeholder por enquanto) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-gray-500 text-sm font-medium">Horas Hoje</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">0h 00m</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-gray-500 text-sm font-medium">Questões</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">0</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-gray-500 text-sm font-medium">Acertos</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">-%</p>
          </div>
        </div>

        {/* Área para Futuros Gráficos */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-64 flex items-center justify-center text-gray-400">
          Gráfico de Desempenho Semanal (Em Breve)
        </div>

      </div>

      {/* Coluna Lateral (Direita - Registro Rápido) */}
      <div className="w-full lg:w-96 shrink-0">
        <RegistroRapido />
      </div>

    </div>
  );
}