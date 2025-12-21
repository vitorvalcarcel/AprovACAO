import { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/Modal';
import ModalDisciplinas from '../components/ModalDisciplinas';
import ModalGerarCiclo from '../components/ModalGerarCiclo';
import ConcursoForm from '../components/Forms/ConcursoForm';
import ConcursoCard from '../components/Cards/ConcursoCard';
import { useToast } from '../components/Toast/ToastContext';
import CardListSkeleton from '../components/skeletons/CardListSkeleton';

interface Concurso {
  id: number;
  nome: string;
  banca?: string;
  dataProva?: string;
  arquivado: boolean;
}

export default function Concursos() {
  const { showToast } = useToast();
  const [concursos, setConcursos] = useState<Concurso[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarArquivados, setMostrarArquivados] = useState(false);

  const [modalAberto, setModalAberto] = useState(false);
  const [modoEdicao, setModoEdicao] = useState<Concurso | null>(null);

  const [concursoSelecionado, setConcursoSelecionado] = useState<Concurso | null>(null);
  const [modalDisciplinasAberto, setModalDisciplinasAberto] = useState(false);
  const [modalCicloAberto, setModalCicloAberto] = useState(false);

  const [modalConfirmacao, setModalConfirmacao] = useState<{
    aberto: boolean;
    titulo: string;
    mensagem: string;
    acao: () => Promise<void>;
  }>({ aberto: false, titulo: '', mensagem: '', acao: async () => { } });

  const carregarConcursos = async () => {
    setLoading(true);
    try {
      const response = await api.get<Concurso[]>('/concursos');
      setConcursos(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarConcursos(); }, []);

  const abrirModal = (concurso?: Concurso) => {
    if (concurso) {
      setModoEdicao(concurso);
    } else {
      setModoEdicao(null);
    }
    setModalAberto(true);
  };


  const abrirDisciplinas = (concurso: Concurso) => {
    setConcursoSelecionado(concurso);
    setModalDisciplinasAberto(true);
  };

  const abrirGerarCiclo = (concurso: Concurso) => {
    setConcursoSelecionado(concurso);
    setModalCicloAberto(true);
  };



  const confirmarAcao = (concurso: Concurso, tipo: 'arquivar' | 'desarquivar' | 'excluir') => {
    if (tipo === 'excluir') {
      setModalConfirmacao({
        aberto: true,
        titulo: 'Excluir Concurso',
        mensagem: `Tem certeza que deseja excluir "${concurso.nome}"? Se houver registros vinculados, a ação será bloqueada e recomendaremos o arquivamento.`,
        acao: async () => {
          try {
            await api.delete(`/concursos/${concurso.id}`);
            showToast('success', 'Concurso excluído.');
            carregarConcursos();
            setModalConfirmacao(prev => ({ ...prev, aberto: false }));
          } catch (error: any) {
            // Se o backend enviar uma mensagem (400), mostramos ela. 
            // Senão, erro genérico.
            // O tratamento global do api.ts já pode ter exibido o toast, mas aqui garantimos o contexto.
            const msg = error.response?.data?.mensagem;
            if (msg) {
              // Mensagem de negócio (Ex: "Há registros vinculados...")
              // Usamos 'info' ou 'warning' (aqui mapeado como info ou error no ToastContext)
              // Se o api.ts já exibiu, isso pode duplicar, mas garante que o usuário veja no contexto do modal.
            } else {
              showToast('error', 'Erro', "Não foi possível excluir o concurso.");
            }
          }
        }
      });
      return;
    }

    const isArquivar = tipo === 'arquivar';
    setModalConfirmacao({
      aberto: true,
      titulo: isArquivar ? 'Arquivar Concurso' : 'Desarquivar Concurso',
      mensagem: isArquivar ? `Arquivar "${concurso.nome}"?` : `Reativar "${concurso.nome}"?`,
      acao: async () => {
        try {
          await api.patch(`/concursos/${concurso.id}/${tipo}`);
          showToast('success', isArquivar ? 'Concurso arquivado' : 'Concurso reativado');
          carregarConcursos();
          setModalConfirmacao(prev => ({ ...prev, aberto: false }));
        } catch (error: any) {
          // Aqui capturamos especificamente o erro de "Ciclo Ativo"
          const msg = error.response?.data?.mensagem;
          if (msg) {
            // O api.ts mostra o erro globalmente, mas podemos fechar o modal
          } else {
            showToast('error', 'Erro', "Erro ao alterar status.");
          }
        }
      }
    });
  };

  const listaExibida = concursos.filter(c => mostrarArquivados ? c.arquivado : !c.arquivado);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 md:pb-10">

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Concursos</h1>
          <p className="text-sm text-gray-500">Defina seus objetivos</p>
        </div>
        <button onClick={() => abrirModal()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors active:scale-95">
          <Plus size={18} /> Novo Concurso
        </button>
      </div>

      <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
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

      <div className="space-y-4 md:space-y-0 md:bg-white md:rounded-lg md:border md:border-gray-200 md:overflow-hidden">
        {loading ? (
          <div className="p-4"><CardListSkeleton /></div>
        ) : listaExibida.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            {mostrarArquivados ? "O arquivo está vazio." : "Cadastre seu primeiro objetivo de estudo!"}
          </div>
        ) : (
          <div className="flex flex-col md:divide-y md:divide-gray-100">
            {listaExibida.map((concurso) => (
              <ConcursoCard
                key={concurso.id}
                concurso={concurso}
                onEdit={() => abrirModal(concurso)}
                onArchive={() => confirmarAcao(concurso, concurso.arquivado ? 'desarquivar' : 'arquivar')}
                onDelete={() => confirmarAcao(concurso, 'excluir')}
                onOpenDisciplinas={() => abrirDisciplinas(concurso)}
                onOpenCiclo={() => abrirGerarCiclo(concurso)}
              />
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={modalAberto} onClose={() => setModalAberto(false)} title={modoEdicao ? 'Editar Concurso' : 'Novo Concurso'}>
        <ConcursoForm
          concursoEdicao={modoEdicao}
          onSuccess={() => { setModalAberto(false); carregarConcursos(); }}
          onCancel={() => setModalAberto(false)}
        />
      </Modal>

      <Modal isOpen={modalConfirmacao.aberto} onClose={() => setModalConfirmacao(p => ({ ...p, aberto: false }))} title={modalConfirmacao.titulo}>
        <div className="space-y-4">
          <p className="text-gray-600">{modalConfirmacao.mensagem}</p>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setModalConfirmacao(p => ({ ...p, aberto: false }))} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md">Cancelar</button>
            <button onClick={modalConfirmacao.acao} className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md">Confirmar</button>
          </div>
        </div>
      </Modal>

      <ModalDisciplinas
        isOpen={modalDisciplinasAberto}
        onClose={() => setModalDisciplinasAberto(false)}
        concurso={concursoSelecionado}
      />

      <ModalGerarCiclo
        isOpen={modalCicloAberto}
        onClose={() => setModalCicloAberto(false)}
        concurso={concursoSelecionado}
      />

    </div>
  );
}