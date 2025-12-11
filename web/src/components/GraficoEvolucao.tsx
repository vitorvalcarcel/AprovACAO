import { BarChart2 } from 'lucide-react';

interface DadosGrafico {
  label: string;
  valor: number;
}

interface GraficoEvolucaoProps {
  dados: DadosGrafico[];
  loading?: boolean;
}

export default function GraficoEvolucao({ dados, loading }: GraficoEvolucaoProps) {
  const maxValor = Math.max(...dados.map(d => d.valor), 1);

  if (loading) return <div className="h-48 flex items-center justify-center text-gray-400">Carregando...</div>;
  
  if (dados.length === 0) {
    return (
      <div className="h-48 flex flex-col items-center justify-center text-gray-400 text-sm bg-gray-50 rounded-lg border border-dashed border-gray-200">
        <BarChart2 size={24} className="mb-2 opacity-50" />
        Nenhum dado no período.
      </div>
    );
  }

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-sm font-bold text-gray-700 mb-6 flex items-center gap-2">
        <BarChart2 size={16} className="text-blue-500" />
        Evolução Diária (Horas)
      </h3>
      
      <div className="flex items-end justify-between h-40 gap-2">
        {dados.map((dado, idx) => {
          const altura = Math.max((dado.valor / maxValor) * 100, 5); 
          return (
            <div key={idx} className="flex-1 flex flex-col items-center group">
              <div className="mb-1 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded absolute -mt-8">
                {dado.valor}h
              </div>
              <div 
                className="w-full max-w-[40px] bg-blue-500 rounded-t-sm hover:bg-blue-600 transition-all duration-500 relative"
                style={{ height: `${altura}%` }}
              ></div>
              <span className="text-[10px] text-gray-400 mt-2 font-medium">{dado.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}