import { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  format, parseISO, startOfWeek, startOfMonth 
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BarChart2, Calendar } from 'lucide-react';

interface DadosGrafico {
  label: string; // Esperado formato ISO "yyyy-MM-dd"
  valor: number;
}

interface GraficoEvolucaoProps {
  dados: DadosGrafico[];
  loading?: boolean;
}

type TipoAgrupamento = 'auto' | 'dia' | 'semana' | 'mes';

export default function GraficoEvolucao({ dados, loading }: GraficoEvolucaoProps) {
  const [agrupamento, setAgrupamento] = useState<TipoAgrupamento>('auto');

  // Função para formatar horas decimais em "Xh Ym"
  const formatarTempo = (valorDecimal: number) => {
    if (valorDecimal === 0) return "0h";
    
    const totalMinutos = Math.round(valorDecimal * 60);
    const h = Math.floor(totalMinutos / 60);
    const m = totalMinutos % 60;

    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
  };

  // Processamento e Agrupamento de Dados
  const dadosProcessados = useMemo(() => {
    if (!dados || dados.length === 0) return [];

    // 1. Converter para objetos Date
    const dadosData = dados.map(d => ({
      data: parseISO(d.label),
      valor: d.valor
    })).sort((a, b) => a.data.getTime() - b.data.getTime());

    // 2. Decidir modo automático
    let modoAtual = agrupamento;
    if (agrupamento === 'auto') {
      const dias = dadosData.length;
      if (dias <= 35) modoAtual = 'dia';
      else if (dias <= 120) modoAtual = 'semana';
      else modoAtual = 'mes';
    }

    // 3. Agrupar
    if (modoAtual === 'dia') {
      return dadosData.map(d => ({
        label: format(d.data, 'dd/MM', { locale: ptBR }),
        fullLabel: format(d.data, "dd 'de' MMMM", { locale: ptBR }),
        valor: d.valor
      }));
    }

    const grupos = new Map<string, { dataRef: Date, valor: number }>();

    dadosData.forEach(d => {
      let chave = '';
      let dataRef = d.data;

      if (modoAtual === 'semana') {
        dataRef = startOfWeek(d.data, { weekStartsOn: 0 });
        chave = format(dataRef, 'yyyy-ww');
      } else { // mes
        dataRef = startOfMonth(d.data);
        chave = format(dataRef, 'yyyy-MM');
      }

      const atual = grupos.get(chave);
      if (atual) {
        atual.valor += d.valor;
      } else {
        grupos.set(chave, { dataRef, valor: d.valor });
      }
    });

    return Array.from(grupos.values()).map(g => ({
      label: modoAtual === 'semana' 
        ? format(g.dataRef, 'dd/MM', { locale: ptBR }) // Início da semana
        : format(g.dataRef, 'MMM/yy', { locale: ptBR }), // Mês
      fullLabel: modoAtual === 'semana'
        ? `Semana de ${format(g.dataRef, 'dd/MM')}`
        : format(g.dataRef, 'MMMM yyyy', { locale: ptBR }),
      valor: Math.round(g.valor * 100) / 100
    }));

  }, [dados, agrupamento]);

  if (loading) {
    return (
      <div className="h-[400px] flex items-center justify-center bg-gray-50 rounded-xl border border-gray-100 animate-pulse">
        <p className="text-gray-400 font-medium">Carregando gráfico...</p>
      </div>
    );
  }
  
  if (dados.length === 0) {
    return (
      <div className="h-[400px] flex flex-col items-center justify-center text-gray-400 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">
        <BarChart2 size={32} className="mb-3 opacity-30" />
        <p>Nenhum dado de estudo no período selecionado.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[400px]">
      
      {/* HEADER E CONTROLES */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
           <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Calendar size={20} className="text-blue-600"/> Constância e Volume
          </h3>
          <p className="text-xs text-gray-500 mt-1">Total de horas líquidas estudadas por período</p>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-lg">
          {(['auto', 'dia', 'semana', 'mes'] as const).map((tipo) => (
            <button
              key={tipo}
              onClick={() => setAgrupamento(tipo)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                agrupamento === tipo 
                  ? 'bg-white text-blue-700 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tipo === 'auto' ? 'Auto' : tipo.charAt(0).toUpperCase() + tipo.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      {/* GRÁFICO DE BARRAS */}
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dadosProcessados} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="label" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 12 }} 
              dy={10}
              minTickGap={30}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 12 }} 
              tickFormatter={(value) => `${value}h`}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              cursor={{ fill: '#f8fafc' }} 
              formatter={(value: number) => [formatarTempo(value), 'Tempo de Estudo']}
              labelFormatter={(label, payload) => {
                if(payload && payload.length > 0) {
                    return payload[0].payload.fullLabel;
                }
                return label;
              }}
            />
            <Bar 
              dataKey="valor" 
              fill="#3b82f6" 
              radius={[4, 4, 0, 0]} 
              maxBarSize={60}
              animationDuration={1000}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}