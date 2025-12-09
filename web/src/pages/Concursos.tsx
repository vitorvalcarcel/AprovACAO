import { useState, useEffect } from 'react';
import { Plus, Pencil, Archive, Search, AlertCircle, RefreshCw, Calendar, Building2, Timer, Trash2 } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/Modal';

interface Concurso {
  id: number;
  nome: string;
  banca?: string;
  dataProva?: string;
  arquivado: boolean;
}

export default function Concursos() {
  const [concursos, setConcursos] = useState<Concurso[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarArquivados, setMostrarArquivados] = useState(false);

  // Formulário
  const [modalAberto, setModalAberto] = useState(false);
  const [modoEdicao, setModoEdicao] = useState<Concurso | null>(null);
  const [form, setForm] = useState({ nome: '', banca: '', dataProva: '' });
  const [erroForm, setErroForm] = useState('');
  const [salvando, setSalvando] = useState(false);

  // Confirmação
  const [modalConfirmacao, setModalConfirmacao] = useState<{
    aberto: boolean;
    titulo: string;
    mensagem: string;
    acao: () => Promise<void>;
  }>({ aberto: false, titulo: '', mensagem: '', acao: async () => {} });

  const carregarConcursos = async () => {
    setLoading(true);
    try {
      const response = await api.get<Concurso[]>('/concursos');
      setConcursos(response.data);
    } catch (error) {
      console.error("Erro ao listar", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarConcursos(); }, []);

  // --- Helpers ---
  const calcularDiasRestantes = (dataProva?: string) => {
    if (!dataProva) return null;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const prova = new Date(dataProva + 'T00:00:00');
    const diffTime = prova.getTime() - hoje.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const formatarData = (data?: string) => {
    if (!data) return '';
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  // --- Ações ---
  const abrirModal = (concurso?: Concurso) => {
    setErroForm('');
    if (concurso) {
      setModoEdicao(concurso);
      setForm({ nome: concurso.nome, banca: concurso.banca || '', dataProva: concurso.dataProva || '' });
    } else {
      setModoEdicao(null);
      setForm({ nome: '', banca: '', dataProva: '' });
    }
    setModalAberto(true);
  };

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome.trim()) return;
    setSalvando(true);
    setErroForm('');

    try {
      const payload = { nome: form.nome, banca: form.banca || null, dataProva: form.dataProva || null };
      if (modoEdicao) {
        await api.put('/concursos', { id: modoEdicao.id, ...payload });
      } else {
        await api.post('/concursos', payload);
      }
      setModalAberto(false);
      carregarConcursos();
    } catch (error: any) {
      setErroForm(error.response?.data?.mensagem || 'Erro ao salvar.');
    } finally {
      setSalvando(false);
    }
  };

  const confirmarAcao = (concurso: Concurso, tipo: 'arquivar' | 'desarquivar' | 'excluir') => {
    // 1. Exclusão
    if (tipo === 'excluir') {
      setModalConfirmacao({
        aberto: true,
        titulo: 'Excluir Concurso',
        mensagem: `Tem certeza que deseja excluir "${concurso.nome}"? Se houver registros de estudo, a ação será bloqueada.`,
        acao: async () => {
          try {
            await api.delete(`/concursos/${concurso.id}`);
            carregarConcursos();
            setModalConfirmacao(prev => ({ ...prev, aberto: false }));
          } catch (error: any) {
            alert(error.response?.data || "Não foi possível excluir.");
          }
        }
      });
      return;
    }

    // 2. Arquivamento
    const isArquivar = tipo === 'arquivar';
    setModalConfirmacao({
      aberto: true,
      titulo: isArquivar ? 'Arquivar Concurso' : 'Desarquivar Concurso',
      mensagem: isArquivar ? `Arquivar "${concurso.nome}"?` : `Reativar "${concurso.nome}"?`,
      acao: async () => {
        try {
          await api.patch(`/concursos/${concurso.id}/${tipo}`);
          carregarConcursos();
          setModalConfirmacao(prev => ({ ...prev, aberto: false }));
        } catch (error) {
          alert("Erro ao alterar status.");
        }
      }
    });
  };

  const listaExibida = concursos.filter(c => mostrarArquivados ? c.arquivado : !c.arquivado);

  return (
    <div className="max-w-4xl mx-auto space-y-6"> {/* PADRONIZADO: max-w-4xl */}
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Concursos</h1>
          <p className="text-sm text-gray-500">Defina seus objetivos</p>
        </div>
        <button onClick={() => abrirModal()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium shadow-sm transition-colors">
          <Plus size={18} /> Novo Concurso
        </button>
      </div>

      <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2 text-gray-500 text-sm px-2">
          <Search size={16} /> <span>{listaExibida.length} concursos</span>
        </div>
        <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-gray-600">
          <span>Ver Arquivados</span>
          <div className="relative">
            <input type="checkbox" checked={mostrarArquivados} onChange={(e) => setMostrarArquivados(e.target.checked)} className="sr-only peer" />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
          </div>
        </label>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Carregando...</div>
        ) : listaExibida.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            {mostrarArquivados ? "O arquivo está vazio." : "Cadastre seu primeiro objetivo de estudo!"}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {listaExibida.map((concurso) => {
              const dias = calcularDiasRestantes(concurso.dataProva);
              let badgeCor = 'bg-blue-50 text-blue-700';
              let badgeTexto = `${dias} dias`;
              
              if (dias !== null) {
                if (dias < 0) { badgeCor = 'bg-gray-100 text-gray-500'; badgeTexto = 'Já passou'; }
                else if (dias === 0) { badgeCor = 'bg-green-100 text-green-700'; badgeTexto = 'É HOJE!'; }
                else if (dias <= 30) { badgeCor = 'bg-red-50 text-red-700 font-bold'; }
              }

              return (
                <div key={concurso.id} className="group flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"> {/* PADRONIZADO: p-3 */}
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className={`w-1.5 h-1.5 rounded-full ${concurso.arquivado ? 'bg-orange-400' : 'bg-blue-600'}`} />
                      <span className={`font-medium text-gray-700 ${concurso.arquivado ? 'line-through text-gray-400' : ''}`}> {/* PADRONIZADO: font-medium text-gray-700 */}
                        {concurso.nome}
                      </span>
                      {concurso.arquivado && <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">Arquivado</span>}
                    </div>

                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 pl-4"> {/* PADRONIZADO: text-xs */}
                      {concurso.banca && <div className="flex items-center gap-1"><Building2 size={12} />{concurso.banca}</div>}
                      {concurso.dataProva && <div className="flex items-center gap-1"><Calendar size={12} />{formatarData(concurso.dataProva)}</div>}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {dias !== null && !concurso.arquivado && (
                      <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${badgeCor}`}>
                        <Timer size={12} /> {badgeTexto}
                      </div>
                    )}

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => abrirModal(concurso)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded transition-colors" title="Editar">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => confirmarAcao(concurso, concurso.arquivado ? 'desarquivar' : 'arquivar')} className={`p-1.5 rounded transition-colors ${concurso.arquivado ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:text-orange-500 hover:bg-orange-50'}`} title={concurso.arquivado ? "Restaurar" : "Arquivar"}>
                        {concurso.arquivado ? <RefreshCw size={16} /> : <Archive size={16} />}
                      </button>
                      {/* Botão EXCLUIR */}
                      <button onClick={() => confirmarAcao(concurso, 'excluir')} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Excluir Permanentemente">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modais (Form e Confirmação) - Mantidos iguais */}
      <Modal isOpen={modalAberto} onClose={() => setModalAberto(false)} title={modoEdicao ? 'Editar Concurso' : 'Novo Concurso'}>
        <form onSubmit={salvar}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Concurso *</label>
            <input autoFocus type="text" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} placeholder="Ex: Polícia Federal" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Banca</label>
              <input type="text" value={form.banca} onChange={e => setForm({...form, banca: e.target.value})} placeholder="Ex: Cebraspe" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data da Prova</label>
              <input type="date" value={form.dataProva} onChange={e => setForm({...form, dataProva: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            </div>
          </div>
          {erroForm && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-md flex items-center gap-2"><AlertCircle size={16} /> {erroForm}</div>}
          <div className="flex justify-end gap-2 mt-6">
            <button type="button" onClick={() => setModalAberto(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">Cancelar</button>
            <button type="submit" disabled={salvando || !form.nome.trim()} className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50">{salvando ? 'Salvando...' : 'Salvar'}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={modalConfirmacao.aberto} onClose={() => setModalConfirmacao(p => ({...p, aberto: false}))} title={modalConfirmacao.titulo}>
        <div className="space-y-4">
          <p className="text-gray-600">{modalConfirmacao.mensagem}</p>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setModalConfirmacao(p => ({...p, aberto: false}))} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">Cancelar</button>
            <button onClick={modalConfirmacao.acao} className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md">Confirmar</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}