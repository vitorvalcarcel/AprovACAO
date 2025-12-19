import { useState, useEffect } from 'react';
import { Plus, Pencil, Archive, Trash2, Book, ChevronDown, ChevronUp, Box, RefreshCw, AlertCircle } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/Modal';
import ModalTopico from '../components/ModalTopico';
import MobileActionMenu from '../components/MobileActionMenu'; // Import Mobile Action
import { useToast } from '../components/Toast/ToastContext';
import CardListSkeleton from '../components/skeletons/CardListSkeleton';

interface Materia {
  id: number;
  nome: string;
  arquivada: boolean;
}

interface Topico {
  id: number;
  nome: string;
  arquivado: boolean;
}

export default function Materias() {
  const { showToast } = useToast();
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [materiaAbertaId, setMateriaAbertaId] = useState<number | null>(null);
  const [topicos, setTopicos] = useState<Topico[]>([]);
  const [loadingTopicos, setLoadingTopicos] = useState(false);
  const [mostrarArquivados, setMostrarArquivados] = useState(false);

  // Estados dos Modais
  const [modalMateriaOpen, setModalMateriaOpen] = useState(false);
  const [materiaEdicao, setMateriaEdicao] = useState<Materia | null>(null);
  const [formMateria, setFormMateria] = useState('');

  const [modalTopicoOpen, setModalTopicoOpen] = useState(false);
  const [topicoEdicao, setTopicoEdicao] = useState<Topico | null>(null);

  const [confirmacao, setConfirmacao] = useState<{
    aberto: boolean;
    titulo: string;
    msg: string;
    acao: () => Promise<void>;
  }>({ aberto: false, titulo: '', msg: '', acao: async () => {} });

  const carregarMaterias = async () => {
    setLoading(true);
    try {
      const res = await api.get('/materias');
      setMaterias(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarMaterias(); }, []);

  const toggleMateria = async (id: number) => {
    if (materiaAbertaId === id) {
      setMateriaAbertaId(null);
    } else {
      setMateriaAbertaId(id);
      setMostrarArquivados(false);
      carregarTopicos(id, false);
    }
  };

  const carregarTopicos = async (id: number, incluirArquivados: boolean) => {
    setLoadingTopicos(true);
    try {
      const res = await api.get(`/topicos/${id}`, {
        params: { incluirArquivados }
      });
      setTopicos(res.data);
    } catch (e) {
      showToast('error', 'Erro', "Erro ao carregar tópicos.");
    } finally {
      setLoadingTopicos(false);
    }
  };

  const toggleFiltroArquivados = () => {
    if (!materiaAbertaId) return;
    const novoValor = !mostrarArquivados;
    setMostrarArquivados(novoValor);
    carregarTopicos(materiaAbertaId, novoValor);
  };

  const salvarMateria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formMateria.trim()) return;
    try {
      if (materiaEdicao) {
        await api.put('/materias', { id: materiaEdicao.id, nome: formMateria });
        showToast('success', 'Matéria atualizada!');
      } else {
        await api.post('/materias', { nome: formMateria });
        showToast('success', 'Matéria criada!');
      }
      setModalMateriaOpen(false);
      carregarMaterias();
    } catch (error: any) {
      showToast('error', 'Erro', error.response?.data?.mensagem || "Erro ao salvar.");
    }
  };

  const confirmarExclusaoMateria = (materia: Materia) => {
    setConfirmacao({
      aberto: true,
      titulo: `Excluir ${materia.nome}?`,
      msg: "CUIDADO: Se houver estudos vinculados, a exclusão será bloqueada. Prefira arquivar.",
      acao: async () => {
        try {
          await api.delete(`/materias/${materia.id}`);
          showToast('success', 'Matéria excluída.');
          carregarMaterias();
          if (materiaAbertaId === materia.id) setMateriaAbertaId(null);
          setConfirmacao(p => ({ ...p, aberto: false }));
        } catch (error: any) {
          showToast('error', 'Não foi possível excluir', error.response?.data?.mensagem || "Erro desconhecido.");
        }
      }
    });
  };

  const arquivarMateria = async (materia: Materia) => {
    try {
      const endpoint = materia.arquivada ? 'desarquivar' : 'arquivar';
      await api.patch(`/materias/${materia.id}/${endpoint}`);
      showToast('success', materia.arquivada ? 'Matéria restaurada' : 'Matéria arquivada');
      carregarMaterias();
    } catch (e) { 
      showToast('error', 'Erro', "Erro ao alterar status.");
    }
  };

  const confirmarExclusaoTopico = (topico: Topico) => {
    setConfirmacao({
      aberto: true,
      titulo: `Excluir Tópico?`,
      msg: `Deseja remover "${topico.nome}"? Se já estudou isso, o sistema bloqueará.`,
      acao: async () => {
        try {
          await api.delete(`/topicos/${topico.id}`);
          showToast('success', 'Tópico excluído.');
          if (materiaAbertaId) carregarTopicos(materiaAbertaId, mostrarArquivados);
          setConfirmacao(p => ({ ...p, aberto: false }));
        } catch (error: any) {
          showToast('error', 'Erro', error.response?.data || "Erro ao excluir.");
        }
      }
    });
  };

  const arquivarTopico = async (topico: Topico) => {
    try {
      const endpoint = topico.arquivado ? 'desarquivar' : 'arquivar';
      await api.patch(`/topicos/${topico.id}/${endpoint}`);
      showToast('success', topico.arquivado ? 'Tópico restaurado' : 'Tópico arquivado');
      if (materiaAbertaId) carregarTopicos(materiaAbertaId, mostrarArquivados);
    } catch (e) { 
      showToast('error', 'Erro', "Erro ao alterar status.");
    }
  };

  const listaMaterias = materias.filter(m => !m.arquivada);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Matérias e Tópicos</h1>
          <p className="text-sm text-gray-500">Organize o que você estuda</p>
        </div>
        <button 
          onClick={() => { setMateriaEdicao(null); setFormMateria(''); setModalMateriaOpen(true); }} 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm active:scale-95"
        >
          <Plus size={20} /> Nova Matéria
        </button>
      </div>

      <div className="space-y-3">
        {loading ? <CardListSkeleton /> :
         listaMaterias.length === 0 ? 
         <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
           <Book size={48} className="mx-auto text-gray-300 mb-3" />
           <p className="text-gray-500">Nenhuma matéria cadastrada.</p>
         </div> :
         listaMaterias.map(materia => (
           <div key={materia.id} className={`bg-white rounded-xl border transition-all duration-300 ${materiaAbertaId === materia.id ? 'border-blue-300 shadow-md ring-1 ring-blue-100' : 'border-gray-200 hover:border-blue-200'}`}>
             
             {/* HEADER MATÉRIA */}
             <div 
               className="p-4 flex items-center justify-between cursor-pointer select-none"
               onClick={() => toggleMateria(materia.id)}
             >
               <div className="flex items-center gap-3">
                 <div className={`p-2 rounded-lg ${materiaAbertaId === materia.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                   <Book size={20} />
                 </div>
                 <span className="font-semibold text-gray-800 text-lg">{materia.nome}</span>
               </div>
               
               <div className="flex items-center gap-2">
                 {/* Desktop: Buttons */}
                 <div className="hidden md:flex gap-1 mr-2" onClick={e => e.stopPropagation()}>
                   <button onClick={() => { setMateriaEdicao(materia); setFormMateria(materia.nome); setModalMateriaOpen(true); }} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Editar Nome"><Pencil size={16}/></button>
                   <button onClick={() => arquivarMateria(materia)} className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg" title="Arquivar"><Archive size={16}/></button>
                   <button onClick={() => confirmarExclusaoMateria(materia)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Excluir"><Trash2 size={16}/></button>
                 </div>
                 
                 {/* Mobile: Action Menu */}
                 <div className="md:hidden" onClick={e => e.stopPropagation()}>
                    <MobileActionMenu 
                      onEdit={() => { setMateriaEdicao(materia); setFormMateria(materia.nome); setModalMateriaOpen(true); }}
                      onArchive={() => arquivarMateria(materia)}
                      onDelete={() => confirmarExclusaoMateria(materia)}
                      isArchived={materia.arquivada}
                    />
                 </div>

                 {materiaAbertaId === materia.id ? <ChevronUp size={20} className="text-blue-500"/> : <ChevronDown size={20} className="text-gray-400"/>}
               </div>
             </div>

             {/* CORPO ACORDEÃO */}
             {materiaAbertaId === materia.id && (
               <div className="border-t border-gray-100 bg-gray-50/50 p-4 animate-fade-in-down">
                 
                 <div className="flex justify-between items-center mb-4">
                   <div className="flex items-center gap-2">
                     <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer select-none hover:text-gray-700">
                       <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${mostrarArquivados ? 'bg-blue-500' : 'bg-gray-300'}`}>
                         <div className={`w-3 h-3 bg-white rounded-full shadow-sm transform transition-transform ${mostrarArquivados ? 'translate-x-4' : ''}`} />
                       </div>
                       <input type="checkbox" className="hidden" checked={mostrarArquivados} onChange={toggleFiltroArquivados} />
                       Mostrar Arquivados
                     </label>
                   </div>
                   <button 
                     onClick={() => { setTopicoEdicao(null); setModalTopicoOpen(true); }}
                     className="bg-white border border-blue-200 text-blue-600 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-50 flex items-center gap-1 shadow-sm active:bg-blue-100"
                   >
                     <Plus size={16} /> Novo Tópico
                   </button>
                 </div>

                 {loadingTopicos ? (
                   <div className="text-center text-gray-400 py-4 text-sm animate-pulse">Carregando assuntos...</div>
                 ) : topicos.length === 0 ? (
                   <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg">
                     <p className="text-gray-400 text-sm">Nenhum tópico encontrado.</p>
                     <p className="text-gray-400 text-xs mt-1">Clique em "Novo Tópico" para adicionar.</p>
                   </div>
                 ) : (
                   <div className="grid grid-cols-1 gap-2">
                     {topicos.map(topico => (
                       <div key={topico.id} className={`group flex justify-between items-center p-3 bg-white rounded-lg border hover:shadow-sm transition-all ${topico.arquivado ? 'opacity-60 bg-gray-50 border-gray-200' : 'border-gray-100 hover:border-blue-200'}`}>
                         <div className="flex items-center gap-3 overflow-hidden">
                           {topico.arquivado ? <Box size={16} className="text-gray-400 shrink-0"/> : <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"/>}
                           <span className={`text-sm truncate ${topico.arquivado ? 'text-gray-500 line-through' : 'text-gray-700 font-medium'}`}>{topico.nome}</span>
                         </div>
                         
                         {/* Desktop Actions */}
                         <div className="hidden md:flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity hover:opacity-100">
                           {!topico.arquivado && (
                             <button onClick={() => { setTopicoEdicao(topico); setModalTopicoOpen(true); }} className="p-1.5 text-gray-400 hover:text-blue-600 rounded"><Pencil size={14}/></button>
                           )}
                           <button onClick={() => arquivarTopico(topico)} className="p-1.5 text-gray-400 hover:text-orange-500 rounded" title={topico.arquivado ? "Restaurar" : "Arquivar"}>
                             {topico.arquivado ? <RefreshCw size={14}/> : <Archive size={14}/>}
                           </button>
                           <button onClick={() => confirmarExclusaoTopico(topico)} className="p-1.5 text-gray-400 hover:text-red-600 rounded"><Trash2 size={14}/></button>
                         </div>

                         {/* Mobile Actions */}
                         <div className="md:hidden">
                            <MobileActionMenu 
                                onEdit={() => { setTopicoEdicao(topico); setModalTopicoOpen(true); }}
                                onArchive={() => arquivarTopico(topico)}
                                onDelete={() => confirmarExclusaoTopico(topico)}
                                isArchived={topico.arquivado}
                            />
                         </div>
                       </div>
                     ))}
                   </div>
                 )}
               </div>
             )}
           </div>
         ))
        }
      </div>

      <Modal isOpen={modalMateriaOpen} onClose={() => setModalMateriaOpen(false)} title={materiaEdicao ? 'Editar Matéria' : 'Nova Matéria'}>
        <form onSubmit={salvarMateria}>
          <div className="space-y-4">
            <input autoFocus placeholder="Nome da Matéria" value={formMateria} onChange={e=>setFormMateria(e.target.value)} className="w-full border p-2 rounded outline-none focus:ring-2 focus:ring-blue-500"/>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={()=>setModalMateriaOpen(false)} className="text-gray-500 px-3">Cancelar</button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded">Salvar</button>
            </div>
          </div>
        </form>
      </Modal>

      <ModalTopico 
        isOpen={modalTopicoOpen} 
        onClose={() => setModalTopicoOpen(false)} 
        materiaId={materiaAbertaId}
        topicoEdicao={topicoEdicao}
        onSalvo={() => materiaAbertaId && carregarTopicos(materiaAbertaId, mostrarArquivados)}
      />

      <Modal isOpen={confirmacao.aberto} onClose={() => setConfirmacao(p => ({...p, aberto: false}))} title={confirmacao.titulo}>
        <div className="space-y-4">
          <div className="flex items-start gap-3 bg-red-50 p-3 rounded-lg text-red-800 text-sm">
            <AlertCircle className="shrink-0 mt-0.5" size={18}/>
            {confirmacao.msg}
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setConfirmacao(p => ({...p, aberto: false}))} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">Cancelar</button>
            <button onClick={confirmacao.acao} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold">Confirmar Exclusão</button>
          </div>
        </div>
      </Modal>

    </div>
  );
}