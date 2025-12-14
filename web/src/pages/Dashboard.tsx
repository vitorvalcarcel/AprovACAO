import { useState, useEffect } from 'react';
import { Target, CheckCircle, BarChart2, Plus, StopCircle, AlertTriangle, ChevronRight, Clock, Edit3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Modal from '../components/Modal';
import { useToast } from '../components/Toast/ToastContext';
import DashboardSkeleton from '../components/skeletons/DashboardSkeleton';
import { useTimer } from '../contexts/TimerContext';

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
  const { startTimer, isActive } = useTimer(); 
  
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [modalEncerrarOpen, setModalEncerrarOpen] = useState(false);

  const carregarDashboard = async () => {
    if (!data) setLoading(true);
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

  const handleIniciarCronometro = () => {
    if (isActive) {
        // Isso será tratado pelo Layout/FloatingBar na verdade, 
        // mas se o usuário clicar aqui, apenas damos feedback visual
        const event = new CustomEvent('open-timer-modal');
        window.dispatchEvent(event);
    } else {
        startTimer();
        showToast('info', 'Cronômetro Iniciado', 'Selecione a matéria quando for salvar.');
    }
  };

  const handleRegistroManual = () => {
    const event = new CustomEvent('open-manual-modal');
    window.dispatchEvent(event);
  };

  return (
    <div className="flex flex-col xl:flex-row gap-8 items-start max-w-[1600px] mx-auto min-h-screen">
      
      <div className="flex-1 w-full min-w-0 flex flex-col">
        {loading ? (
          <DashboardSkeleton />
        ) : (
          <>
            <div className="mb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
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
                    className="flex items-center gap-2 px-3 py-2 bg-white text-gray-500 hover:text-red-600 hover:bg-red-50 border border-gray-200 rounded-lg text-xs font-bold transition-colors uppercase shadow-sm"
                  >
                    <StopCircle size={16} /> <span className="hidden sm:inline">Encerrar</span>
                  </button>
                )}

                {data?.cicloId && (
                  <div className="bg-white px-4 py-2 rounded-lg border border-gray-200 flex items-center gap-3 shadow-sm flex-1 sm:flex-none justify-between sm:justify-start">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Conclusão</span>
                    <div className="w-24 sm:w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500" style={{ width: `${data.progressoGeral}%` }} />
                    </div>
                    <span className="text-sm font-bold text-green-700">{data.progressoGeral}%</span>
                  </div>
                )}
              </div>
            </div>

            {!data?.cicloId ? (
              <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-8 sm:p-16">
                <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mb-4 text-blue-500">
                  <BarChart2 size={40} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 text-center">Nenhum ciclo ativo</h3>
                <p className="text-gray-500 mb-6 max-w-md text-center text-sm sm:text-base">Crie um planejamento baseado no seu edital para começar a acompanhar seu progresso.</p>
                <Link to="/app/concursos" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center gap-2">
                  <Plus size={20} /> Criar Planejamento
                </Link>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
                <div className="grid grid-cols-12 gap-2 sm:gap-4 px-4 sm:px-6 py-4 bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  <div className="col-span-5 sm:col-span-4">Matéria</div>
                  <div className="col-span-4 sm:col-span-4 text-center">Progresso</div>
                  <div className="col-span-3 sm:col-span-2 text-right">Horas</div>
                  <div className="hidden sm:block col-span-2 text-right">Questões</div>
                </div>
                <div className="divide-y divide-gray-50">
                  {data.itens.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 sm:gap-4 px-4 sm:px-6 py-3 sm:py-2.5 items-center hover:bg-blue-50/30 transition-colors group">
                      <div className="col-span-5 sm:col-span-4 flex items-center gap-2 sm:gap-3">
                        <div className={`w-1 sm:w-1.5 h-8 sm:h-10 rounded-full shrink-0 ${item.saldoSegundos <= 0 && item.saldoQuestoes <= 0 ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-gray-700 text-xs sm:text-sm leading-tight line-clamp-2" title={item.nomeMateria}>{item.nomeMateria}</h4>
                          {item.saldoSegundos <= 0 && item.saldoQuestoes <= 0 && (
                            <span className="text-[9px] text-green-600 font-bold flex items-center gap-1 mt-0.5"><CheckCircle size={9} /> <span className="hidden sm:inline">Concluído</span></span>
                          )}
                        </div>
                      </div>
                      <div className="col-span-4 sm:col-span-4 flex flex-col justify-center gap-1.5 px-1 sm:px-2">
                        <div className="relative w-full h-3 sm:h-2.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`absolute left-0 top-0 h-full rounded-full transition-all duration-700 ${item.saldoSegundos <= 0 ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${item.percentualHoras}%` }} />
                        </div>
                        {item.metaQuestoes > 0 && (
                          <div className="relative w-full h-3 sm:h-2.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`absolute left-0 top-0 h-full rounded-full transition-all duration-700 ${item.saldoQuestoes <= 0 ? 'bg-green-500' : 'bg-purple-500'}`} style={{ width: `${item.percentualQuestoes}%` }} />
                          </div>
                        )}
                      </div>
                      <div className="col-span-3 sm:col-span-2 text-right">
                        <div className="text-xs sm:text-sm font-bold text-gray-700 font-mono">{formatarTempo(item.segundosRealizados)}</div>
                        <div className="text-[9px] sm:text-[10px] text-gray-400">/ {item.metaHoras}h</div>
                      </div>
                      <div className="hidden sm:block col-span-2 text-right">
                        {item.metaQuestoes > 0 ? (
                          <>
                            <div className="text-sm font-bold text-gray-700 font-mono">{item.questoesRealizadas}</div>
                            <div className="text-[10px] text-gray-400">/ {item.metaQuestoes}</div>
                          </>
                        ) : <span className="text-xs text-gray-300">-</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="hidden lg:flex w-full xl:w-96 shrink-0 xl:sticky xl:top-8 flex-col gap-4">
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Clock size={20} className="text-blue-600"/> Registrar Estudo</h3>
            
            <div className="space-y-3">
                <button 
                    onClick={handleIniciarCronometro}
                    className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 shadow-md transition-all active:scale-[0.98] ${
                        isActive 
                        ? 'bg-white border-2 border-blue-600 text-blue-600 shadow-blue-100' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-100'
                    }`}
                >
                    <Clock size={22} />
                    {isActive ? 'ABRIR CRONÔMETRO' : 'INICIAR AGORA'}
                </button>

                {!isActive && (
                    <button 
                        onClick={handleRegistroManual}
                        className="w-full py-3 bg-white border-2 border-gray-100 hover:border-gray-200 text-gray-700 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors animate-fade-in"
                    >
                        <Edit3 size={18} />
                        REGISTRO MANUAL
                    </button>
                )}
            </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-xl p-6 text-white shadow-lg relative overflow-hidden group shrink-0">
          <div className="relative z-10">
            <h3 className="font-bold text-lg mb-1">Ver Estatísticas</h3>
            <p className="text-purple-100 text-sm mb-4">Analise sua evolução, taxa de acertos e gráficos detalhados.</p>
            <Link to="/app/estatisticas" className="inline-flex items-center gap-2 bg-white text-purple-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-purple-50 transition-colors">
              Acessar Relatórios <ChevronRight size={16}/>
            </Link>
          </div>
          <BarChart2 className="absolute -bottom-4 -right-4 text-white opacity-10 w-32 h-32 transform group-hover:scale-110 transition-transform duration-500" />
        </div>
      </div>

      <Modal isOpen={modalEncerrarOpen} onClose={() => setModalEncerrarOpen(false)} title="Encerrar Ciclo">
        <div className="space-y-4">
          <div className="bg-orange-50 p-4 rounded-lg flex gap-3 text-orange-800 text-sm items-start">
            <AlertTriangle className="shrink-0" size={20}/>
            <p>Tem certeza? Ao encerrar o ciclo, ele deixará de aparecer no Dashboard.</p>
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