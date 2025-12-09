import { useState, useEffect } from 'react';
import { Plus, Pencil, Archive, Search, AlertCircle, RefreshCw, Trash2 } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/Modal';

interface Materia {
  id: number;
  nome: string;
  arquivada: boolean;
}

export default function Materias() {
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarArquivadas, setMostrarArquivadas] = useState(false);

  // Estados do Modal Form
  const [modalFormAberto, setModalFormAberto] = useState(false);
  const [modoEdicao, setModoEdicao] = useState<Materia | null>(null);
  const [nomeForm, setNomeForm] = useState('');
  const [erroForm, setErroForm] = useState('');
  const [salvando, setSalvando] = useState(false);

  // Modal de Confirmação
  const [modalConfirmacao, setModalConfirmacao] = useState<{
    aberto: boolean;
    titulo: string;
    mensagem: string;
    acao: () => Promise<void>;
  }>({ aberto: false, titulo: '', mensagem: '', acao: async () => {} });

  const carregarMaterias = async () => {
    setLoading(true);
    try {
      const response = await api.get<Materia[]>('/materias');
      setMaterias(response.data);
    } catch (error) {
      console.error("Erro ao listar matérias", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarMaterias(); }, []);

  // --- Formulário ---
  const abrirModalForm = (materia?: Materia) => {
    setErroForm('');
    if (materia) {
      setModoEdicao(materia);
      setNomeForm(materia.nome);
    } else {
      setModoEdicao(null);
      setNomeForm('');
    }
    setModalFormAberto(true);
  };

  const salvarMateria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeForm.trim()) return;
    setSalvando(true);
    setErroForm('');

    try {
      if (modoEdicao) {
        await api.put('/materias', { id: modoEdicao.id, nome: nomeForm });
      } else {
        await api.post('/materias', { nome: nomeForm });
      }
      setModalFormAberto(false);
      carregarMaterias();
    } catch (error: any) {
      setErroForm(error.response?.data?.mensagem || 'Erro ao salvar.');
    } finally {
      setSalvando(false);
    }
  };

  // --- Ações (Arquivar / Excluir) ---
  const confirmarAcao = (materia: Materia, tipo: 'arquivar' | 'desarquivar' | 'excluir') => {
    // 1. Exclusão (DELETE)
    if (tipo === 'excluir') {
      setModalConfirmacao({
        aberto: true,
        titulo: 'Excluir Matéria',
        mensagem: `Tem certeza que deseja excluir "${materia.nome}" permanentemente? Se ela já tiver estudos registrados, o sistema impedirá.`,
        acao: async () => {
          try {
            await api.delete(`/materias/${materia.id}`);
            carregarMaterias();
            setModalConfirmacao(prev => ({ ...prev, aberto: false }));
          } catch (error: any) {
            // Mostra o erro do backend (ex: "Não pode excluir pois tem registros")
            alert(error.response?.data || "Não foi possível excluir.");
          }
        }
      });
      return;
    }

    // 2. Arquivamento (PATCH)
    const isArquivar = tipo === 'arquivar';
    setModalConfirmacao({
      aberto: true,
      titulo: isArquivar ? 'Arquivar Matéria' : 'Desarquivar Matéria',
      mensagem: isArquivar 
        ? `Deseja mover "${materia.nome}" para o arquivo?`
        : `Deseja restaurar "${materia.nome}" para a lista ativa?`,
      acao: async () => {
        try {
          await api.patch(`/materias/${materia.id}/${tipo}`);
          carregarMaterias();
          setModalConfirmacao(prev => ({ ...prev, aberto: false }));
        } catch (error: any) {
          alert(error.response?.data || "Erro ao alterar status.");
        }
      }
    });
  };

  const listaExibida = materias.filter(m => mostrarArquivadas ? m.arquivada : !m.arquivada);

  return (
    <div className="max-w-4xl mx-auto space-y-6"> {/* max-w-4xl igual concursos */}
      
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Matérias</h1>
          <p className="text-sm text-gray-500">Gerencie o que você estuda</p>
        </div>
        <button onClick={() => abrirModalForm()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors shadow-sm">
          <Plus size={18} /> Nova Matéria
        </button>
      </div>

      {/* Filtros */}
      <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2 text-gray-500 text-sm px-2">
          <Search size={16} /> <span>{listaExibida.length} matérias</span>
        </div>
        <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-gray-600">
          <span>Ver Arquivadas</span>
          <div className="relative">
            <input type="checkbox" checked={mostrarArquivadas} onChange={(e) => setMostrarArquivadas(e.target.checked)} className="sr-only peer" />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
          </div>
        </label>
      </div>

      {/* LISTA */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Carregando...</div>
        ) : listaExibida.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            {mostrarArquivadas ? "O arquivo está vazio." : "Cadastre suas matérias para começar."}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {listaExibida.map((materia) => (
              <div key={materia.id} className="group flex items-center justify-between p-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3 pl-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${materia.arquivada ? 'bg-orange-400' : 'bg-blue-500'}`} />
                  <span className={`font-medium text-gray-700 ${materia.arquivada ? 'line-through text-gray-400' : ''}`}>
                    {materia.nome}
                  </span>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                  <button onClick={() => abrirModalForm(materia)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded transition-colors" title="Editar">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => confirmarAcao(materia, materia.arquivada ? 'desarquivar' : 'arquivar')} className={`p-1.5 rounded transition-colors ${materia.arquivada ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:text-orange-500 hover:bg-orange-50'}`} title={materia.arquivada ? "Restaurar" : "Arquivar"}>
                    {materia.arquivada ? <RefreshCw size={16} /> : <Archive size={16} />}
                  </button>
                  {/* Botão EXCLUIR */}
                  <button onClick={() => confirmarAcao(materia, 'excluir')} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Excluir Permanentemente">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modais */}
      <Modal isOpen={modalFormAberto} onClose={() => setModalFormAberto(false)} title={modoEdicao ? 'Editar Matéria' : 'Nova Matéria'}>
        <form onSubmit={salvarMateria}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <input autoFocus type="text" value={nomeForm} onChange={e => setNomeForm(e.target.value)} placeholder="Ex: Português" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none" />
          </div>
          {erroForm && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-md flex items-center gap-2"><AlertCircle size={16} />{erroForm}</div>}
          <div className="flex justify-end gap-2 mt-6">
            <button type="button" onClick={() => setModalFormAberto(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">Cancelar</button>
            <button type="submit" disabled={salvando || !nomeForm.trim()} className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50">{salvando ? 'Salvando...' : 'Salvar'}</button>
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