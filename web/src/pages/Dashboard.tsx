import { useState, useEffect } from 'react';
import { Target, CheckCircle, BarChart2, AlertCircle, Plus, BookOpen, Trophy, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import RegistroRapido from '../components/RegistroRapido';
import Filtros, { type FiltrosState } from '../components/Filtros';
import GraficoEvolucao from '../components/GraficoEvolucao';

interface ItemProgresso {
  nomeMateria: string;
  // Horas
  metaHoras: number;
  segundosRealizados: number;
  saldoSegundos: number;
  percentualHoras: number;
  // Questões
  metaQuestoes: number;
  questoesRealizadas: number;
  saldoQuestoes: number;
  percentualQuestoes: number;
}

interface DashboardData {
  horasLiquidas: number;
  questoesFeitas: number;
  taxaAcertos: number;
  cicloId: number | null;
  nomeConcurso: string | null;
  progressoGeral: number;
  evolucaoDiaria: any[];
  itens: ItemProgresso[];
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [filtrosAtivos, setFiltrosAtivos] = useState<FiltrosState>({
    dataInicio: '', dataFim: '', concursoIds: [], materiaIds: [], topicoIds: [], tipoEstudoIds: []
  });

  const handleFiltrosChange = (novosFiltros: FiltrosState) => {
    setFiltrosAtivos(novosFiltros);
  };

  useEffect(() => { carregarDashboard(); }, [filtrosAtivos]);

  const carregarDashboard = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filtrosAtivos.dataInicio) params.inicio = filtrosAtivos.dataInicio + 'T00:00:00';
      if (filtrosAtivos.dataFim) params.fim = filtrosAtivos.dataFim + 'T23:59:59';
      if (filtrosAtivos.materiaIds.length) params.materias = filtrosAtivos.materiaIds.join(',');
      if (filtrosAtivos.concursoIds.length) params.concursos = filtrosAtivos.concursoIds.join(',');
      if (filtrosAtivos.tipoEstudoIds.length) params.tipos = filtrosAtivos.tipoEstudoIds.join(',');

      const response = await api.get<DashboardData>('/dashboard', { params });
      setData(response.data);
    } catch (error) {
      console.error("Erro ao carregar dashboard", error);
    } finally {
      setLoading(false);
    }
  };

  const formatarHorasSimples = (val: number) => {
    if (!val) return "0h";
    const h = Math.floor(val);
    const m = Math.round((val - h) * 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  const formatarTempo = (totalSegundos: number) => {
    const total = Math.abs(totalSegundos);
    const h = Math.floor(total / 3600).toString().padStart(2, '0');
    const m = Math.floor((total % 3600) / 60).toString().padStart(2, '0');
    const s = (total % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start pb-10">
      
      <div className="flex-1 space-y-6 w-full min-w-0">
        
        {/* 1. MEU CICLO ATIVO */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="bg-white p-1.5 rounded-md shadow-sm text-blue-600">
                <BarChart2 size={20}/> 
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-sm">Meu Ciclo Atual</h3>
                {data?.nomeConcurso && (
                  <p className="text-xs text-gray-500 font-medium">{data.nomeConcurso}</p>
                )}
              </div>
            </div>

            {data?.cicloId && (
              <div className="flex flex-col items-end gap-1 w-1/3">
                <span className="text-xs font-bold text-blue-800">{data.progressoGeral}% Concluído</span>
                <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${data.progressoGeral}%` }} />
                </div>
              </div>
            )}
          </div>

          <div className="p-0">
            {loading ? (
              <p className="text-center text-gray-400 py-8 text-sm">Carregando...</p>
            ) : !data?.cicloId ? (
              <div className="text-center py-8 px-4">
                <div className="bg-gray-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                  <AlertCircle size={24} />
                </div>
                <p className="text-gray-600 text-sm font-medium mb-1">Nenhum ciclo ativo encontrado.</p>
                <Link to="/app/concursos" className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm mt-3">
                  <Plus size={16} /> Criar Novo Ciclo
                </Link>
              </div>
            ) : (
              // LISTA DE ITENS DO CICLO
              <div className="max-h-[420px] overflow-y-auto scrollbar-thin">
                <div className="divide-y divide-gray-50">
                  {data.itens.map((item, idx) => (
                    <div key={idx} className="group px-5 py-4 hover:bg-blue-50/40 transition-colors">
                      
                      {/* Título da Matéria */}
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-bold text-gray-700 truncate">{item.nomeMateria}</span>
                        {/* Status Geral (Se ambos concluídos) */}
                        {item.saldoSegundos <= 0 && item.saldoQuestoes <= 0 && (
                          <span className="text-xs text-green-600 font-bold flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-full">
                            <CheckCircle size={12}/> Matéria Fechada!
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        
                        {/* BARRA DE HORAS (Azul) */}
                        <div>
                          <div className="flex justify-between items-end mb-1">
                            <span className="text-[10px] text-gray-500 flex items-center gap-1">
                              <Clock size={10} className="text-blue-500"/> Teoria ({item.metaHoras}h)
                            </span>
                            <span className={`text-[10px] font-bold ${item.saldoSegundos > 0 ? 'text-blue-600' : 'text-green-600'}`}>
                              {item.saldoSegundos > 0 ? `${formatarTempo(item.segundosRealizados)}` : 'Concluído'}
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-1.5 rounded-full transition-all duration-700" style={{ width: `${item.percentualHoras}%` }} />
                          </div>
                        </div>

                        {/* BARRA DE QUESTÕES (Roxa) - Só aparece se tiver meta */}
                        {item.metaQuestoes > 0 && (
                          <div>
                            <div className="flex justify-between items-end mb-1">
                              <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                <BookOpen size={10} className="text-purple-500"/> Questões ({item.metaQuestoes})
                              </span>
                              <span className={`text-[10px] font-bold ${item.saldoQuestoes > 0 ? 'text-purple-600' : 'text-green-600'}`}>
                                {item.questoesRealizadas} feitas
                              </span>
                            </div>
                            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-purple-500 h-1.5 rounded-full transition-all duration-700" style={{ width: `${item.percentualQuestoes}%` }} />
                            </div>
                          </div>
                        )}

                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 2. FILTROS */}
        <Filtros onChange={handleFiltrosChange} />

        {/* 3. GRÁFICO DE EVOLUÇÃO */}
        <GraficoEvolucao dados={data?.evolucaoDiaria || []} loading={loading} />

        {/* 4. CARDS DE RESUMO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Horas Líquidas</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1">
                {loading ? '...' : formatarHorasSimples(data?.horasLiquidas || 0)}
              </h3>
            </div>
            <div className="bg-blue-50 p-3 rounded-full text-blue-600"><Target size={24} /></div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Questões</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1">
                {loading ? '...' : (data?.questoesFeitas || 0)}
              </h3>
            </div>
            <div className="bg-purple-50 p-3 rounded-full text-purple-600"><BookOpen size={24} /></div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Taxa de Acertos</p>
              <h3 className={`text-3xl font-bold mt-1 ${
                (data?.taxaAcertos || 0) >= 80 ? 'text-green-600' : 
                (data?.taxaAcertos || 0) >= 60 ? 'text-yellow-600' : 'text-gray-800'
              }`}>
                {loading ? '...' : (data?.taxaAcertos || 0)}%
              </h3>
            </div>
            <div className="bg-green-50 p-3 rounded-full text-green-600"><Trophy size={24} /></div>
          </div>
        </div>

      </div>

      <div className="w-full lg:w-96 shrink-0 sticky top-4">
        <RegistroRapido onRegistroSalvo={carregarDashboard} />
      </div>

    </div>
  );
}