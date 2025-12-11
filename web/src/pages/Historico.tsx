import { useState } from 'react';
import { Clock, Trash2, CheckSquare, Square, AlertTriangle, X, GripHorizontal } from 'lucide-react';
import api from '../services/api';
import Filtros, { type FiltrosState } from '../components/Filtros';
import Modal from '../components/Modal';
import { useToast } from '../components/Toast/ToastContext';
import TableSkeleton from '../components/skeletons/TableSkeleton'; // Import novo

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

  const [filtrosAtuais, setFiltrosAtuais] = useState<FiltrosState | null>(null);

  const carregarDados = async (filtros: FiltrosState) => {
    setLoading(true);
    setFiltrosAtuais(filtros);
    setIdsSelecionados([]);
    setModoSelecao(false);
    
    try {
      const params: any = {};
      if (filtros.dataInicio) params.inicio = filtros.dataInicio + 'T00:00:00';
      if (filtros.dataFim) params.fim = filtros.dataFim + 'T23:59:59';
      if (filtros.materiaIds.length) params.materias = filtros.materiaIds.join(',');
      if (filtros.concursoIds.length) params.concursos = filtros.concursoIds.join(',');
      if (filtros.tipoEstudoIds.length) params.tipos = filtros.tipoEstudoIds.join(',');

      const response = await api.get<Registro[]>('/registros', { params });
      setRegistros(response.data);
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

  const confirmarExclusaoUnica = (id: number) => {
    setModalConfirmacao({ aberto: true, tipo: 'unico', idAlvo: id });
  };

  const confirmarExclusaoLote = () => {
    if (idsSelecionados.length === 0) return;
    setModalConfirmacao({ aberto: true, tipo: 'lote' });
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
    <div className="max-w-6xl mx-auto space-y-6 h-[calc(100vh-theme(spacing.24))] flex flex-col">
      
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Histórico de Estudos</h1>
        
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
              className="px-3 py-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm font-medium flex items-center gap-2 border border-blue-100"
            >
              <GripHorizontal size={16} /> Gerenciar
            </button>
          )}
          
          <div className="text-sm text-gray-500 bg-white px-3 py-1.5 rounded-lg border">
            {registros.length} registros
          </div>
        </div>
      </div>

      <Filtros onChange={carregarDados} />

      {loading ? (
        <TableSkeleton />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex-1 overflow-hidden flex flex-col">
          <div className="overflow-auto flex-1">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 font-medium border-b sticky top-0 z-10">
                <tr>
                  {modoSelecao && (
                    <th className="px-4 py-3 w-10">
                      <button onClick={toggleSelecionarTudo} className="text-gray-500 hover:text-blue-600">
                        {idsSelecionados.length > 0 && idsSelecionados.length === registros.length 
                          ? <CheckSquare size={18} className="text-blue-600" /> 
                          : <Square size={18} />}
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
                {registros.length === 0 ? (
                  <tr><td colSpan={7} className="p-12 text-center text-gray-400">Nenhum registro encontrado.</td></tr>
                ) : (
                  registros.map(reg => (
                    <tr 
                      key={reg.id} 
                      className={`transition-colors ${idsSelecionados.includes(reg.id) ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'}`}
                      onClick={() => modoSelecao && toggleSelecao(reg.id)}
                    >
                      {modoSelecao && (
                        <td className="px-4 py-3">
                          <button className="text-gray-400">
                            {idsSelecionados.includes(reg.id) 
                              ? <CheckSquare size={18} className="text-blue-600" /> 
                              : <Square size={18} />}
                          </button>
                        </td>
                      )}

                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {formatarData(reg.dataInicio)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-800">{reg.nomeMateria}</div>
                        {reg.nomeTopico && <div className="text-xs text-gray-500">{reg.nomeTopico}</div>}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {reg.nomeConcurso || '-'}
                      </td>
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
                          <button 
                            onClick={(e) => { e.stopPropagation(); confirmarExclusaoUnica(reg.id); }}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Excluir Registro"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={modalConfirmacao.aberto} onClose={() => setModalConfirmacao({ ...modalConfirmacao, aberto: false })} title="Excluir Registros">
        <div className="space-y-4">
          <div className="flex items-start gap-3 bg-red-50 p-3 rounded-lg text-red-800 text-sm">
            <AlertTriangle className="shrink-0 mt-0.5" size={18}/>
            {modalConfirmacao.tipo === 'unico' 
              ? 'Tem certeza que deseja excluir este registro de estudo? Isso afetará suas estatísticas e metas.' 
              : `Tem certeza que deseja excluir ${idsSelecionados.length} registros selecionados? Esta ação não pode ser desfeita.`}
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setModalConfirmacao({ ...modalConfirmacao, aberto: false })} className="text-gray-500 px-3 py-2 rounded hover:bg-gray-100 text-sm font-medium">Cancelar</button>
            <button onClick={executarExclusao} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-bold text-sm">Confirmar Exclusão</button>
          </div>
        </div>
      </Modal>

    </div>
  );
}