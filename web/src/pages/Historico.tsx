import { useState } from 'react';
import { Clock, Trash2, CheckSquare, Square, AlertTriangle, X, GripHorizontal, Brain, Edit3 } from 'lucide-react';
import api from '../services/api';
import Filtros, { type FiltrosState } from '../components/Filtros';
import Modal from '../components/Modal';
import { useToast } from '../components/Toast/ToastContext';
import TableSkeleton from '../components/skeletons/TableSkeleton';
import useLongPress from '../hooks/useLongPress';
import RegistroRapido from '../components/RegistroRapido';

// Interfaces
interface Registro {
  id: number;
  nomeMateria: string;
  nomeTopico?: string;
  nomeConcurso?: string;
  dataInicio: string;
  segundos: number;
  questoesFeitas: number;
  questoesCertas: number;
  anotacoes?: string;
  materiaId?: number; 
  topicoId?: number;
  tipoEstudoId?: number;
}

interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

interface RegistroItemMobileProps {
    registro: Registro;
    modoSelecao: boolean;
    selecionado: boolean;
    onToggle: () => void;
    onLongPress: () => void;
    onEdit: () => void;
    onDelete: () => void;
    formatarData: (d: string) => string;
    formatarTempo: (s: number) => string;
}

function RegistroItemMobile({ 
    registro, modoSelecao, selecionado, onToggle, onLongPress, onEdit, formatarData, formatarTempo 
}: RegistroItemMobileProps) {
    
    const bind = useLongPress(() => {
        if(!modoSelecao) onLongPress();
    }, { threshold: 600 });

    const handleClick = () => {
        if(modoSelecao) onToggle();
    };

    return (
        <li 
            {...bind}
            onClick={handleClick}
            className={`p-4 flex gap-3 transition-colors items-center select-none ${selecionado ? 'bg-blue-50' : 'bg-white active:bg-gray-50'}`}
        >
            {modoSelecao && (
                <div className="shrink-0 flex items-center justify-center h-full pr-1">
                    {selecionado 
                        ? <CheckSquare size={22} className="text-blue-600" /> 
                        : <Square size={22} className="text-gray-300" />}
                </div>
            )}

            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                    <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                        {formatarData(registro.dataInicio)}
                    </span>
                    {!modoSelecao && (
                        <div className="flex">
                            <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-2 -mr-2 text-gray-400 hover:text-blue-600">
                                <Edit3 size={18} />
                            </button>
                        </div>
                    )}
                </div>
                
                <h3 className="text-base font-bold text-gray-800 leading-tight truncate">{registro.nomeMateria}</h3>
                
                <div className="flex items-center gap-2 mt-1">
                     {registro.nomeTopico && (
                        <span className="text-xs text-gray-500 flex items-center gap-1 truncate max-w-[150px]">
                            <Brain size={12}/> {registro.nomeTopico}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-3 mt-3">
                    <div className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1">
                        <Clock size={12} /> {formatarTempo(registro.segundos)}
                    </div>
                    
                    {registro.questoesFeitas > 0 && (
                        <div className="flex items-center gap-1 text-xs text-gray-600 font-medium">
                            <span>{registro.questoesCertas}/{registro.questoesFeitas}</span>
                            <span className={`px-1 rounded ${
                                (registro.questoesCertas/registro.questoesFeitas) >= 0.8 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                                {Math.round((registro.questoesCertas / registro.questoesFeitas) * 100)}%
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </li>
    );
}

export default function Historico() {
  const { showToast } = useToast();
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [modoSelecao, setModoSelecao] = useState(false);
  const [idsSelecionados, setIdsSelecionados] = useState<number[]>([]);
  const [modalConfirmacao, setModalConfirmacao] = useState<{
    aberto: boolean;
    tipo: 'unico' | 'lote';
    idAlvo?: number; 
  }>({ aberto: false, tipo: 'unico' });

  const [modalEdicao, setModalEdicao] = useState<{
      aberto: boolean;
      registro?: Registro;
  }>({ aberto: false });

  const [filtrosAtuais, setFiltrosAtuais] = useState<FiltrosState | null>(null);

  const carregarDados = async (filtros: FiltrosState) => {
    setLoading(true);
    setFiltrosAtuais(filtros);
    setIdsSelecionados([]);
    setModoSelecao(false);
    
    try {
      const params: any = { size: 50 };
      if (filtros.dataInicio) params.inicio = filtros.dataInicio + 'T00:00:00';
      if (filtros.dataFim) params.fim = filtros.dataFim + 'T23:59:59';
      if (filtros.materiaIds.length) params.materias = filtros.materiaIds.join(',');
      if (filtros.concursoIds.length) params.concursos = filtros.concursoIds.join(',');
      if (filtros.tipoEstudoIds.length) params.tipos = filtros.tipoEstudoIds.join(',');
      if (filtros.topicoIds.length) params.topicos = filtros.topicoIds.join(','); // ADICIONADO

      const response = await api.get<PageResponse<Registro>>('/registros', { params });
      setRegistros(response.data.content);
    } catch (error) {
      console.error("Erro ao filtrar", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelecao = (id: number) => {
    setIdsSelecionados(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelecionarTudo = () => {
    if (idsSelecionados.length === registros.length) {
      setIdsSelecionados([]);
    } else {
      setIdsSelecionados(registros.map(r => r.id));
    }
  };

  const handleLongPress = (id: number) => {
    if (!modoSelecao) {
        if (navigator.vibrate) navigator.vibrate(50);
        setModoSelecao(true);
        setIdsSelecionados([id]);
    }
  };

  const confirmarExclusaoUnica = (id: number) => {
    setModalConfirmacao({ aberto: true, tipo: 'unico', idAlvo: id });
  };

  const confirmarExclusaoLote = () => {
    if (idsSelecionados.length === 0) return;
    setModalConfirmacao({ aberto: true, tipo: 'lote' });
  };

  const abrirEdicao = (reg: Registro) => {
      setModalEdicao({ aberto: true, registro: reg });
  };

  const executarExclusao = async () => {
    try {
      if (modalConfirmacao.tipo === 'unico' && modalConfirmacao.idAlvo) {
        await api.delete(`/registros/${modalConfirmacao.idAlvo}`);
      } else if (modalConfirmacao.tipo === 'lote') {
        await api.delete('/registros', {
          params: { ids: idsSelecionados.join(',') }
        });
      }
      
      setModalConfirmacao({ ...modalConfirmacao, aberto: false });
      showToast('success', 'Sucesso', 'Registros excluídos.');
      if (filtrosAtuais) carregarDados(filtrosAtuais);
      
    } catch (error) {
      showToast('error', 'Erro', "Erro ao excluir registros.");
    }
  };

  const formatarTempo = (seg: number) => {
    const h = Math.floor(seg / 3600);
    const m = Math.floor((seg % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const formatarData = (iso: string) => {
    return new Date(iso).toLocaleString('pt-BR', { 
      day: '2-digit', month: '2-digit', hour: '2-digit', minute:'2-digit' 
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 flex flex-col h-full">
      
      <div className="flex justify-between items-center sticky top-0 z-20 bg-gray-50 py-2">
        <h1 className="text-2xl font-bold text-gray-800">Histórico</h1>
        
        <div className="flex items-center gap-3">
          {modoSelecao ? (
            <>
              <button 
                onClick={() => { setModoSelecao(false); setIdsSelecionados([]); }}
                className="px-3 py-1.5 text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium flex items-center gap-2"
              >
                <X size={16} /> Cancelar
              </button>
              <button 
                onClick={confirmarExclusaoLote}
                disabled={idsSelecionados.length === 0}
                className="px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-sm font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 size={16} /> Excluir ({idsSelecionados.length})
              </button>
            </>
          ) : (
            <button 
              onClick={() => setModoSelecao(true)}
              className="hidden md:flex px-3 py-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm font-medium items-center gap-2 border border-blue-100"
            >
              <GripHorizontal size={16} /> Gerenciar
            </button>
          )}
        </div>
      </div>

      <Filtros onChange={carregarDados} />

      {loading ? (
        <TableSkeleton />
      ) : (
        <div className="bg-transparent md:bg-white md:rounded-xl md:shadow-sm md:border md:border-gray-200 flex-1 flex flex-col">
          
          <div className="md:hidden pb-32">
            <ul className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
                {registros.map(reg => (
                    <RegistroItemMobile 
                        key={reg.id} 
                        registro={reg} 
                        modoSelecao={modoSelecao}
                        selecionado={idsSelecionados.includes(reg.id)}
                        onToggle={() => toggleSelecao(reg.id)}
                        onLongPress={() => handleLongPress(reg.id)}
                        onEdit={() => abrirEdicao(reg)}
                        onDelete={() => confirmarExclusaoUnica(reg.id)}
                        formatarData={formatarData}
                        formatarTempo={formatarTempo}
                    />
                ))}
                 {registros.length === 0 && <div className="text-center text-gray-400 py-10">Nenhum registro.</div>}
            </ul>
          </div>

          <div className="hidden md:block overflow-auto flex-1">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 font-medium border-b sticky top-0 z-10">
                <tr>
                  {modoSelecao && (
                    <th className="px-4 py-3 w-10 text-center">
                      <button onClick={toggleSelecionarTudo} className="text-gray-500 hover:text-blue-600 flex items-center justify-center w-full">
                        {idsSelecionados.length > 0 && idsSelecionados.length === registros.length 
                          ? <CheckSquare size={20} className="text-blue-600" /> 
                          : <Square size={20} />}
                      </button>
                    </th>
                  )}
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Matéria / Tópico</th>
                  <th className="px-4 py-3">Concurso</th>
                  <th className="px-4 py-3 text-center">Tempo</th>
                  <th className="px-4 py-3 text-center">Questões</th>
                  <th className="px-4 py-3 text-center">Desempenho</th>
                  {!modoSelecao && <th className="px-4 py-3 text-right">Ações</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {registros.map(reg => (
                    <tr 
                      key={reg.id} 
                      className={`transition-colors select-none ${idsSelecionados.includes(reg.id) ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'}`}
                      onClick={() => modoSelecao && toggleSelecao(reg.id)}
                    >
                      {modoSelecao && (
                        <td className="px-4 py-3 text-center align-middle">
                          <button className="text-gray-400 flex items-center justify-center w-full h-full">
                            {idsSelecionados.includes(reg.id) ? <CheckSquare size={20} className="text-blue-600" /> : <Square size={20} />}
                          </button>
                        </td>
                      )}
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatarData(reg.dataInicio)}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-800">{reg.nomeMateria}</div>
                        {reg.nomeTopico && <div className="text-xs text-gray-500">{reg.nomeTopico}</div>}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{reg.nomeConcurso || '-'}</td>
                      <td className="px-4 py-3 text-center font-medium text-blue-700">
                        <div className="inline-flex items-center gap-1 bg-blue-50 px-2 py-1 rounded">
                          <Clock size={14} /> {formatarTempo(reg.segundos)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600">
                        {reg.questoesFeitas > 0 ? reg.questoesFeitas : '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {reg.questoesFeitas > 0 ? (
                          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${
                            (reg.questoesCertas/reg.questoesFeitas) >= 0.8 ? 'bg-green-100 text-green-700' :
                            (reg.questoesCertas/reg.questoesFeitas) >= 0.6 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {Math.round((reg.questoesCertas / reg.questoesFeitas) * 100)}%
                          </div>
                        ) : '-'}
                      </td>
                      {!modoSelecao && (
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-1">
                            <button onClick={(e) => { e.stopPropagation(); abrirEdicao(reg); }} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="Editar">
                                <Edit3 size={16} />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); confirmarExclusaoUnica(reg.id); }} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded" title="Excluir">
                                <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAIS */}
      <Modal isOpen={modalConfirmacao.aberto} onClose={() => setModalConfirmacao({ ...modalConfirmacao, aberto: false })} title="Excluir Registros">
        <div className="space-y-4">
          <div className="flex items-start gap-3 bg-red-50 p-3 rounded-lg text-red-800 text-sm">
            <AlertTriangle className="shrink-0 mt-0.5" size={18}/>
            {modalConfirmacao.tipo === 'unico' 
              ? 'Tem certeza que deseja excluir este registro? As estatísticas serão recalculadas.' 
              : `Tem certeza que deseja excluir ${idsSelecionados.length} registros?`}
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setModalConfirmacao({ ...modalConfirmacao, aberto: false })} className="text-gray-500 px-3 py-2 rounded hover:bg-gray-100 text-sm font-medium">Cancelar</button>
            <button onClick={executarExclusao} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-bold text-sm">Confirmar Exclusão</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={modalEdicao.aberto} onClose={() => setModalEdicao({ aberto: false })} title="Editar Registro" className="md:max-w-3xl">
          {modalEdicao.registro && (
              <RegistroRapido 
                registroParaEditar={modalEdicao.registro}
                onClose={() => setModalEdicao({ aberto: false })} 
                onRegistroSalvo={() => {
                    setModalEdicao({ aberto: false });
                    if(filtrosAtuais) carregarDados(filtrosAtuais);
                }}
              />
          )}
      </Modal>

    </div>
  );
}