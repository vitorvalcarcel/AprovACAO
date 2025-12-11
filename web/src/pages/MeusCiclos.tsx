import { useState, useEffect } from 'react';
import { Target, Calendar, CheckCircle, StopCircle, Trash2, AlertTriangle, Search } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/Modal';
import { useToast } from '../components/Toast/ToastContext';

interface Concurso {
  id: number;
  nome: string;
}

interface Ciclo {
  id: number;
  descricao: string;
  ativo: boolean;
  dataInicio: string;
  dataFim?: string;
  progresso: number;
}

export default function MeusCiclos() {
  const { showToast } = useToast();
  const [concursos, setConcursos] = useState<Concurso[]>([]);
  const [concursoSelecionado, setConcursoSelecionado] = useState<string>('');
  
  const [ciclos, setCiclos] = useState<Ciclo[]>([]);
  const [loading, setLoading] = useState(false);

  const [modalConfirmacao, setModalConfirmacao] = useState<{
    aberto: boolean;
    titulo: string;
    msg: string;
    acao: () => Promise<void>;
  }>({ aberto: false, titulo: '', msg: '', acao: async () => {} });

  useEffect(() => {
    api.get<Concurso[]>('/concursos').then(res => {
      setConcursos(res.data);
      if (res.data.length > 0) {
        setConcursoSelecionado(String(res.data[0].id));
      }
    });
  }, []);

  useEffect(() => {
    if (concursoSelecionado) {
      carregarCiclos(concursoSelecionado);
    }
  }, [concursoSelecionado]);

  const carregarCiclos = async (idConcurso: string) => {
    setLoading(true);
    try {
      const res = await api.get<Ciclo[]>('/ciclos', { params: { concursoId: idConcurso } });
      setCiclos(res.data);
    } catch (e) {
      console.error("Erro ao listar ciclos", e);
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (dataStr?: string) => {
    if (!dataStr) return '-';
    return new Date(dataStr).toLocaleDateString('pt-BR');
  };

  const confirmarExclusao = (ciclo: Ciclo) => {
    setModalConfirmacao({
      aberto: true,
      titulo: 'Excluir Ciclo?',
      msg: `Deseja realmente apagar "${ciclo.descricao}"? Isso removerá o planejamento de metas, mas seus registros de estudo (horas líquidas) serão mantidos no histórico geral.`,
      acao: async () => {
        try {
          await api.delete(`/ciclos/${ciclo.id}`);
          showToast('success', 'Ciclo excluído.');
          carregarCiclos(concursoSelecionado);
          setModalConfirmacao(prev => ({ ...prev, aberto: false }));
        } catch (e) {
          showToast('error', 'Erro', 'Erro ao excluir ciclo.');
        }
      }
    });
  };

  const confirmarEncerramento = (ciclo: Ciclo) => {
    setModalConfirmacao({
      aberto: true,
      titulo: 'Encerrar Ciclo?',
      msg: 'Deseja encerrar este ciclo? Ele deixará de aparecer como meta ativa no Dashboard, mas ficará salvo aqui no histórico.',
      acao: async () => {
        try {
          await api.patch(`/ciclos/${ciclo.id}/encerrar`);
          showToast('success', 'Ciclo encerrado com sucesso!');
          carregarCiclos(concursoSelecionado);
          setModalConfirmacao(prev => ({ ...prev, aberto: false }));
        } catch (e) {
          showToast('error', 'Erro', 'Erro ao encerrar ciclo.');
        }
      }
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      
      <div className="flex justify-between items-end border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Meus Ciclos</h1>
          <p className="text-sm text-gray-500">Histórico de planejamentos e metas</p>
        </div>
        
        <div className="w-64">
          <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Filtrar por Concurso</label>
          <div className="relative">
            <select 
              value={concursoSelecionado}
              onChange={e => setConcursoSelecionado(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-3 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {concursos.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <Target size={16} />
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-400">Carregando histórico...</div>
      ) : ciclos.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-12 text-center">
          <Search size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">Nenhum ciclo encontrado para este concurso.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Ciclo / Descrição</th>
                <th className="px-6 py-4">Período</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {ciclos.map(ciclo => (
                <tr key={ciclo.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-800">{ciclo.descricao || `Ciclo #${ciclo.id}`}</p>
                    <p className="text-xs text-gray-400 mt-0.5">ID: {ciclo.id}</p>
                  </td>
                  
                  <td className="px-6 py-4 text-gray-600">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold text-green-600 w-10">Início</span>
                        <span>{formatarData(ciclo.dataInicio)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold text-red-400 w-10">Fim</span>
                        <span>{formatarData(ciclo.dataFim)}</span>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-center">
                    {ciclo.ativo ? (
                      <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200">
                        <CheckCircle size={12} /> ATIVO
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs font-bold border border-gray-200">
                        <StopCircle size={12} /> ENCERRADO
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {ciclo.ativo && (
                        <button 
                          onClick={() => confirmarEncerramento(ciclo)}
                          className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Encerrar Ciclo"
                        >
                          <StopCircle size={18} />
                        </button>
                      )}
                      <button 
                        onClick={() => confirmarExclusao(ciclo)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir do Histórico"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modalConfirmacao.aberto} onClose={() => setModalConfirmacao(p => ({...p, aberto: false}))} title={modalConfirmacao.titulo}>
        <div className="space-y-4">
          <div className="bg-red-50 p-4 rounded-lg flex gap-3 items-start text-red-800">
            <AlertTriangle className="shrink-0 mt-0.5" size={20} />
            <p className="text-sm">{modalConfirmacao.msg}</p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setModalConfirmacao(p => ({...p, aberto: false}))} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
            <button onClick={modalConfirmacao.acao} className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold">Confirmar</button>
          </div>
        </div>
      </Modal>

    </div>
  );
}