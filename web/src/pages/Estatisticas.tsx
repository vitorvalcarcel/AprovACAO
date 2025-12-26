import { useState, useEffect } from 'react';
import { Target, BookOpen, Trophy } from 'lucide-react';
import api from '../services/api';
import Filtros, { type FiltrosState } from '../components/Filtros';
import GraficoEvolucao from '../components/GraficoEvolucao';
import StatsSkeleton from '../components/skeletons/StatsSkeleton';

interface DashboardData {
  segundosLiquidos: number;
  questoesFeitas: number;
  taxaAcertos: number;
  evolucaoDiaria: any[];
}

export default function Estatisticas() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const [filtrosAtivos, setFiltrosAtivos] = useState<FiltrosState>({
    dataInicio: '', dataFim: '', concursoIds: [], materiaIds: [], topicoIds: [], tipoEstudoIds: []
  });

  const handleFiltrosChange = (novosFiltros: FiltrosState) => {
    setFiltrosAtivos(novosFiltros);
  };

  useEffect(() => {
    const carregarDados = async () => {
      setLoading(true);
      try {
        const params: any = {};
        if (filtrosAtivos.dataInicio) params.inicio = filtrosAtivos.dataInicio + 'T00:00:00';
        if (filtrosAtivos.dataFim) params.fim = filtrosAtivos.dataFim + 'T23:59:59';
        if (filtrosAtivos.materiaIds.length) params.materias = filtrosAtivos.materiaIds.join(',');
        if (filtrosAtivos.concursoIds.length) params.concursos = filtrosAtivos.concursoIds.join(',');
        if (filtrosAtivos.tipoEstudoIds.length) params.tipos = filtrosAtivos.tipoEstudoIds.join(',');
        if (filtrosAtivos.topicoIds.length) params.topicos = filtrosAtivos.topicoIds.join(',');

        const response = await api.get<DashboardData>('/dashboard', { params });
        setData(response.data);
      } catch (error) {
        console.error("Erro", error);
      } finally {
        setLoading(false);
      }
    };
    carregarDados();
  }, [filtrosAtivos]);

  const formatarHoras = (segundos: number) => {
    if (!segundos) return "0h";
    const h = Math.floor(segundos / 3600);
    const m = Math.floor((segundos % 3600) / 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  if (loading && !data) {
    return <StatsSkeleton />;
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-10">

      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Estatísticas</h1>
          <p className="text-gray-500 text-sm">Análise detalhada do seu desempenho</p>
        </div>
      </div>

      <Filtros onChange={handleFiltrosChange} />

      {/* CARDS DE RESUMO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-blue-50 p-3 rounded-xl text-blue-600"><Target size={28} /></div>
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Horas Líquidas</p>
            <h3 className="text-3xl font-bold text-gray-800">{formatarHoras(data?.segundosLiquidos || 0)}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-purple-50 p-3 rounded-xl text-purple-600"><BookOpen size={28} /></div>
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Questões</p>
            <h3 className="text-3xl font-bold text-gray-800">{data?.questoesFeitas || 0}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className={`p-3 rounded-xl ${(data?.taxaAcertos || 0) >= 80 ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
            <Trophy size={28} />
          </div>
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Desempenho</p>
            <h3 className="text-3xl font-bold text-gray-800">{data?.taxaAcertos || 0}%</h3>
          </div>
        </div>
      </div>

      {/* GRÁFICO */}
      <GraficoEvolucao dados={data?.evolucaoDiaria || []} loading={loading} />
    </div>
  );
}