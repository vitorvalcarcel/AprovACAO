import { useState, useEffect } from 'react';
import { Target, CheckCircle, BarChart2, Plus, StopCircle, AlertTriangle, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import RegistroRapido from '../components/RegistroRapido';
import Modal from '../components/Modal';
import { useToast } from '../components/Toast/ToastContext';

interface ItemProgresso {
  nomeMateria: string;
  metaHoras: number;
  segundosRealizados: number;
  saldoSegundos: number;
  percentualHoras: number;
  metaQuestoes: number;
  questoesRealizadas: number;
  saldoQuestoes: number;
  percentualQuestoes: number;
}

interface DashboardData {
  cicloId: number | null;
  nomeConcurso: string | null;
  progressoGeral: number;
  itens: ItemProgresso[];
}

export default function Dashboard() {
  const { showToast } = useToast();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Modal de Confirmação
  const [modalEncerrarOpen, setModalEncerrarOpen] = useState(false);

  const carregarDashboard = async () => {
    setLoading(true);
    try {
      const response = await api.get<DashboardData>('/dashboard');
      setData(response.data);
    } catch (error) {
      console.error("Erro ao carregar dashboard", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarDashboard(); }, []);

  const handleEncerrarCiclo = async () => {
    if (!data?.cicloId) return;
    try {
      await api.patch(`/ciclos/${data.cicloId}/encerrar`);
      setModalEncerrarOpen(false);
      showToast('success', 'Ciclo Encerrado', 'O ciclo foi finalizado com sucesso.');
      carregarDashboard();
    } catch (error) {
      showToast('error', 'Erro', "Erro ao encerrar ciclo.");
    }
  };

  const formatarTempo = (totalSegundos: number) => {
    const total = Math.abs(totalSegundos);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <div className="flex flex-col xl:flex-row gap-8 items-start pb-20 max-w-[1600px] mx-auto min-h-screen">
      
      <div className="flex-1 w-full min-w-0 flex flex-col">
        
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Meu Ciclo</h1>
            {data?.nomeConcurso && (
              <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                <Target size={14} /> Foco: <span className="font-medium text-blue-600">{data.nomeConcurso}</span>
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {data?.cicloId && (
              <button 
                onClick={() => setModalEncerrarOpen(true)}
                className="flex items-center gap-2 px-3 py-2 bg-white text-gray-500 hover:text-red-600 hover:bg-red-50 border border-gray-200 rounded-lg text-xs font-bold transition-colors uppercase"
                title="Encerrar Ciclo"
              >
                <StopCircle size={16} /> Encerrar
              </button>
            )}

            {data?.cicloId && (
              <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 flex items-center gap-3 shadow-sm">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Conclusão</span>
                <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500" style={{ width: `${data.progressoGeral}%` }} />
                </div>
                <span className="text-sm font-bold text-green-700">{data.progressoGeral}%</span>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="h-64 bg-gray-100 rounded-2xl animate-pulse"></div>
        ) : !data?.cicloId ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-16">
            <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mb-4 text-blue-500">
              <BarChart2 size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Nenhum ciclo ativo</h3>
            <p className="text-gray-500 mb-6 max-w-md text-center">Crie um planejamento baseado no seu edital para começar a acompanhar seu progresso.</p>
            <Link to="/app/concursos" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center gap-2">
              <Plus size={20} /> Criar Planejamento
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider rounded-t-2xl">
              <div className="col-span-4">Matéria</div>
              <div className="col-span-4 text-center">Progresso</div>
              <div className="col-span-2 text-right">Saldo Horas</div>
              <div className="col-span-2 text-right">Saldo Questões</div>
            </div>

            <div className="divide-y divide-gray-50">
              {data.itens.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-4 px-6 py-2.5 items-center hover:bg-blue-50/30 transition-colors group">
                  <div className="col-span-4 flex items-center gap-3">
                    <div className={`w-1.5 h-10 rounded-full shrink-0 ${item.saldoSegundos <= 0 && item.saldoQuestoes <= 0 ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-gray-700 text-sm leading-tight line-clamp-2" title={item.nomeMateria}>{item.nomeMateria}</h4>
                      {item.saldoSegundos <= 0 && item.saldoQuestoes <= 0 && (
                        <span className="text-[10px] text-green-600 font-bold flex items-center gap-1 mt-0.5"><CheckCircle size={10} /> Concluído</span>
                      )}
                    </div>
                  </div>

                  <div className="col-span-4 flex flex-col justify-center gap-1.5 px-2">
                    <div className="relative w-full h-2.5 bg-gray-100 rounded-full overflow-hidden" title={`Horas: ${item.percentualHoras.toFixed(0)}%`}>
                      <div className={`absolute left-0 top-0 h-full rounded-full transition-all duration-700 ${item.saldoSegundos <= 0 ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${item.percentualHoras}%` }} />
                    </div>
                    {item.metaQuestoes > 0 && (
                      <div className="relative w-full h-2.5 bg-gray-100 rounded-full overflow-hidden" title={`Questões: ${item.percentualQuestoes.toFixed(0)}%`}>
                        <div className={`absolute left-0 top-0 h-full rounded-full transition-all duration-700 ${item.saldoQuestoes <= 0 ? 'bg-green-500' : 'bg-purple-500'}`} style={{ width: `${item.percentualQuestoes}%` }} />
                      </div>
                    )}
                  </div>

                  <div className="col-span-2 text-right">
                    <div className="text-sm font-bold text-gray-700 font-mono">{formatarTempo(item.segundosRealizados)}</div>
                    <div className="text-[10px] text-gray-400">de {item.metaHoras}h</div>
                  </div>

                  <div className="col-span-2 text-right">
                    {item.metaQuestoes > 0 ? (
                      <>
                        <div className="text-sm font-bold text-gray-700 font-mono">{item.questoesRealizadas}</div>
                        <div className="text-[10px] text-gray-400">de {item.metaQuestoes}</div>
                      </>
                    ) : <span className="text-xs text-gray-300">-</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="w-full xl:w-96 shrink-0 xl:sticky xl:top-8 flex flex-col gap-4">
        <RegistroRapido onRegistroSalvo={carregarDashboard} />
        
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-6 text-white shadow-lg relative overflow-hidden group shrink-0">
          <div className="relative z-10">
            <h3 className="font-bold text-lg mb-1">Ver Estatísticas</h3>
            <p className="text-blue-100 text-sm mb-4">Analise sua evolução, taxa de acertos e gráficos detalhados.</p>
            <Link to="/app/estatisticas" className="inline-flex items-center gap-2 bg-white text-blue-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-50 transition-colors">
              Acessar Relatórios <ChevronRight size={16}/>
            </Link>
          </div>
          <BarChart2 className="absolute -bottom-4 -right-4 text-white opacity-10 w-32 h-32 transform group-hover:scale-110 transition-transform duration-500" />
        </div>
      </div>

      {/* Modal Confirmar Encerramento */}
      <Modal isOpen={modalEncerrarOpen} onClose={() => setModalEncerrarOpen(false)} title="Encerrar Ciclo">
        <div className="space-y-4">
          <div className="bg-orange-50 p-4 rounded-lg flex gap-3 text-orange-800 text-sm items-start">
            <AlertTriangle className="shrink-0" size={20}/>
            <p>Tem certeza? Ao encerrar o ciclo, ele deixará de aparecer no Dashboard. Seus registros de estudo serão mantidos.</p>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setModalEncerrarOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">Cancelar</button>
            <button onClick={handleEncerrarCiclo} className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-bold">Sim, Encerrar</button>
          </div>
        </div>
      </Modal>

    </div>
  );
}