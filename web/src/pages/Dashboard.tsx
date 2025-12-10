import { useState, useEffect } from 'react';
import { Target, CheckCircle, BarChart2, AlertCircle, Plus, BookOpen, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import RegistroRapido from '../components/RegistroRapido';
import Filtros, { type FiltrosState } from '../components/Filtros';

interface ItemProgresso {
  nomeMateria: string;
  metaHoras: number;
  segundosRealizados: number;
  saldoSegundos: number;
  percentual: number;
}

interface DashboardData {
  horasLiquidas: number;
  questoesFeitas: number;
  taxaAcertos: number;
  cicloId: number | null;
  nomeConcurso: string | null;
  progressoGeral: number;
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

  useEffect(() => {
    carregarDashboard();
  }, [filtrosAtivos]);

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
                  <p className="text-xs text-gray-500 font-medium">
                    {data.nomeConcurso}
                  </p>
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
                <p className="text-gray-400 text-xs mb-4">Crie um plano de estudos para acompanhar seu progresso.</p>
                <Link to="/app/concursos" className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
                  <Plus size={16} /> Criar Novo Ciclo
                </Link>
              </div>
            ) : (
              // AUMENTADO AQUI: max-h-96 (~380px)
              <div className="max-h-96 overflow-y-auto scrollbar-thin">
                <div className="divide-y divide-gray-50">
                  {data.itens.map((item, idx) => (
                    <div key={idx} className="group px-5 py-3 hover:bg-blue-50/40 transition-colors">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-3 overflow-hidden">
                          {/* Nome da Matéria um pouco maior */}
                          <span className="text-sm font-semibold text-gray-700 truncate">{item.nomeMateria}</span>
                          <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                            Meta {item.metaHoras}h
                          </span>
                        </div>
                        
                        <div className="text-right whitespace-nowrap flex items-center justify-end gap-3">
                          <span className="text-sm font-bold text-gray-700 font-mono bg-gray-50 px-2 py-0.5 rounded">
                            {formatarTempo(item.segundosRealizados)}
                          </span>
                          
                          <span className={`text-xs px-2.5 py-1 rounded-md font-bold shadow-sm border flex items-center gap-1 ${
                            item.saldoSegundos > 0 
                              ? 'bg-red-50 text-red-700 border-red-100' 
                              : 'bg-green-50 text-green-700 border-green-100'
                          }`}>
                            {item.saldoSegundos > 0 ? (
                              <>Faltam {formatarTempo(item.saldoSegundos)}</>
                            ) : (
                              <><CheckCircle size={12}/> Concluído</>
                            )}
                          </span>
                        </div>
                      </div>
                      
                      {/* Barra um pouco mais grossa */}
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden relative">
                        <div 
                          className={`h-full rounded-full transition-all duration-700 ${item.percentual >= 100 ? 'bg-green-500' : 'bg-blue-500'}`} 
                          style={{ width: `${item.percentual}%` }} 
                        />
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

        {/* 3. CARDS DE RESUMO */}
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

        {/* 4. GRÁFICOS FUTUROS */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[250px] flex items-center justify-center text-gray-400 text-sm">
          Gráfico de Evolução Semanal (Em Breve)
        </div>

      </div>

      <div className="w-full lg:w-96 shrink-0 sticky top-4">
        <RegistroRapido onRegistroSalvo={carregarDashboard} />
      </div>

    </div>
  );
}