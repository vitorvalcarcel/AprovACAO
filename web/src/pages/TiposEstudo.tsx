import { useState, useEffect } from 'react';
import { Plus, Pencil, Archive, Trash2, Tag, RefreshCw, Search, AlertCircle, Clock } from 'lucide-react';
import api from '../services/api';
import ModalTipoEstudo from '../components/ModalTipoEstudo';
import Modal from '../components/Modal';
import MobileActionMenu from '../components/MobileActionMenu'; // Import
import { useToast } from '../components/Toast/ToastContext';
import CardListSkeleton from '../components/skeletons/CardListSkeleton';

interface Tipo { 
  id: number; 
  nome: string; 
  arquivado: boolean; 
  contaHorasCiclo?: boolean;
}

export default function TiposEstudo() {
  const { showToast } = useToast();
  const [tipos, setTipos] = useState<Tipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [incluirArquivados, setIncluirArquivados] = useState(false);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [edicao, setEdicao] = useState<Tipo | null>(null);

  const [confirmacao, setConfirmacao] = useState<{
    aberto: boolean; titulo: string; msg: string; acao: () => Promise<void>;
  }>({ aberto: false, titulo: '', msg: '', acao: async () => {} });

  const carregar = async () => {
    setLoading(true);
    try {
      const res = await api.get('/tipos-estudo', { 
        params: { incluirArquivados: incluirArquivados } 
      });
      setTipos(res.data);
    } catch (error) {
      console.error("Erro ao carregar", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, [incluirArquivados]);

  const toggleArquivo = async (tipo: Tipo) => {
    try {
      await api.patch(`/tipos-estudo/${tipo.id}/alternar-arquivo`);
      showToast('success', tipo.arquivado ? 'Tipo restaurado' : 'Tipo arquivado');
      carregar();
    } catch (e) { 
      showToast('error', 'Erro', "Erro ao alterar status.");
    }
  };

  const confirmarExclusao = (tipo: Tipo) => {
    setConfirmacao({
      aberto: true,
      titulo: 'Excluir Tipo?',
      msg: `Deseja excluir "${tipo.nome}"? Se houver estudos vinculados, a exclusão será bloqueada.`,
      acao: async () => {
        try {
          await api.delete(`/tipos-estudo/${tipo.id}`);
          showToast('success', 'Tipo de estudo excluído.');
          carregar();
          setConfirmacao(p => ({ ...p, aberto: false }));
        } catch (error: any) {
          showToast('error', 'Erro', error.response?.data || "Erro ao excluir.");
        }
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tipos de Estudo</h1>
          <p className="text-sm text-gray-500">Defina seus métodos (PDF, Vídeo...)</p>
        </div>
        <button 
          onClick={() => { setEdicao(null); setModalOpen(true); }} 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm active:scale-95"
        >
          <Plus size={18}/> Novo Tipo
        </button>
      </div>

      <div className="bg-white p-3 rounded-lg border flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2 text-gray-500 text-sm px-2">
          <Search size={16}/> {tipos.length} tipos listados
        </div>
        
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none hover:text-gray-800">
          <span>Incluir Arquivados</span>
          <div className="relative">
            <input 
              type="checkbox" 
              checked={incluirArquivados} 
              onChange={e => setIncluirArquivados(e.target.checked)}
              className="sr-only peer" 
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
          </div>
        </label>
      </div>

      <div className="space-y-3 md:bg-white md:rounded-lg md:border md:space-y-0 md:divide-y">
        {loading ? (
          <div className="p-4"><CardListSkeleton /></div>
        ) : tipos.length === 0 ? (
          <div className="p-12 text-center text-gray-500">Nenhum tipo de estudo encontrado.</div>
        ) : (
           tipos.map(t => (
             <div 
               key={t.id} 
               className={`relative p-4 md:p-3 flex justify-between items-center group transition-all rounded-xl md:rounded-none border border-gray-100 md:border-none shadow-sm md:shadow-none ${
                 t.arquivado 
                   ? 'bg-gray-50 opacity-75'
                   : 'bg-white hover:bg-gray-50'
               }`}
             >
               
               <div className="flex-1">
                 <div className="flex items-start md:items-center gap-3">
                   <div className={`p-2 rounded-lg shrink-0 ${t.arquivado ? 'bg-gray-200 text-gray-400' : 'bg-blue-50 text-blue-600'}`}>
                     <Tag size={18} />
                   </div>
                   
                   <div className="flex flex-col">
                     <span className={`font-bold text-gray-800 ${t.arquivado ? 'text-gray-500 line-through' : ''}`}>
                       {t.nome}
                     </span>
                     
                     <div className="flex flex-wrap items-center gap-2 mt-1">
                       {t.contaHorasCiclo ? (
                         <span className={`text-[10px] flex items-center gap-1 px-1.5 py-0.5 rounded border font-medium ${t.arquivado ? 'bg-gray-100 text-gray-400 border-gray-200' : 'text-green-700 bg-green-50 border-green-100'}`}>
                           <Clock size={10} /> Conta Horas
                         </span>
                       ) : (
                         <span className={`text-[10px] flex items-center gap-1 px-1.5 py-0.5 rounded border font-medium ${t.arquivado ? 'bg-gray-100 text-gray-400 border-gray-200' : 'text-gray-500 bg-gray-100 border-gray-200'}`}>
                           Apenas Questões
                         </span>
                       )}
                       
                       {t.arquivado && (
                         <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full border border-gray-200 font-medium">
                           Arquivado
                         </span>
                       )}
                     </div>
                   </div>
                 </div>
               </div>

               {/* Desktop Actions */}
               <div className="hidden md:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                 {!t.arquivado && (
                   <button onClick={() => { setEdicao(t); setModalOpen(true); }} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="Editar"><Pencil size={16}/></button>
                 )}
                 
                 <button onClick={() => toggleArquivo(t)} className={`p-1.5 rounded ${t.arquivado ? 'text-green-600 hover:bg-green-100' : 'text-gray-400 hover:text-orange-500 hover:bg-orange-50'}`} title={t.arquivado ? "Restaurar" : "Arquivar"}>
                   {t.arquivado ? <RefreshCw size={16}/> : <Archive size={16}/>}
                 </button>

                 <button onClick={() => confirmarExclusao(t)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded" title="Excluir"><Trash2 size={16}/></button>
               </div>

               {/* Mobile Actions */}
               <div className="md:hidden absolute top-4 right-2">
                  <MobileActionMenu 
                    onEdit={() => { setEdicao(t); setModalOpen(true); }}
                    onArchive={() => toggleArquivo(t)}
                    onDelete={() => confirmarExclusao(t)}
                    isArchived={t.arquivado}
                  />
               </div>
             </div>
           ))
        )}
      </div>

      <ModalTipoEstudo isOpen={modalOpen} onClose={() => setModalOpen(false)} edicao={edicao} onSalvo={carregar} />

      <Modal isOpen={confirmacao.aberto} onClose={() => setConfirmacao(p => ({...p, aberto: false}))} title={confirmacao.titulo}>
        <div className="space-y-4">
          <div className="flex items-start gap-3 bg-red-50 p-3 rounded-lg text-red-800 text-sm">
            <AlertCircle className="shrink-0 mt-0.5" size={18}/>
            {confirmacao.msg}
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setConfirmacao(p => ({...p, aberto: false}))} className="text-gray-500 px-3 py-2 rounded hover:bg-gray-100">Cancelar</button>
            <button onClick={confirmacao.acao} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 font-medium">Confirmar Exclusão</button>
          </div>
        </div>
      </Modal>

    </div>
  );
}