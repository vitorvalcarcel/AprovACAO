import { useState, useEffect } from 'react';
import { Plus, Pencil, Archive, Trash2, Tag, RefreshCw, Search, AlertCircle, Clock } from 'lucide-react';
import api from '../services/api';
import ModalTipoEstudo from '../components/ModalTipoEstudo';
import Modal from '../components/Modal';

interface Tipo { 
  id: number; 
  nome: string; 
  arquivado: boolean; 
  contaHorasCiclo?: boolean;
}

export default function TiposEstudo() {
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
      carregar();
    } catch (e) { alert("Erro ao alterar status."); }
  };

  const confirmarExclusao = (tipo: Tipo) => {
    setConfirmacao({
      aberto: true,
      titulo: 'Excluir Tipo?',
      msg: `Deseja excluir "${tipo.nome}"? Se houver estudos vinculados, a exclusão será bloqueada.`,
      acao: async () => {
        try {
          await api.delete(`/tipos-estudo/${tipo.id}`);
          carregar();
          setConfirmacao(p => ({ ...p, aberto: false }));
        } catch (error: any) {
          alert(error.response?.data || "Erro ao excluir.");
        }
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      
      {/* Topo */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tipos de Estudo</h1>
          <p className="text-sm text-gray-500">Defina seus métodos (PDF, Vídeo, Questões...)</p>
        </div>
        <button 
          onClick={() => { setEdicao(null); setModalOpen(true); }} 
          className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={18}/> Novo Tipo
        </button>
      </div>

      {/* Filtro */}
      <div className="bg-white p-3 rounded-lg border flex justify-between items-center">
        <div className="flex items-center gap-2 text-gray-500 text-sm px-2">
          <Search size={16}/> {tipos.length} tipos listados
        </div>
        
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none hover:text-gray-800">
          <span>Incluir Arquivados na lista</span>
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

      {/* Lista */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {loading ? <div className="p-8 text-center text-gray-400">Carregando...</div> :
         tipos.length === 0 ? <div className="p-12 text-center text-gray-500">Nenhum tipo de estudo encontrado.</div> :
         <div className="divide-y p-1">
           {tipos.map(t => (
             <div 
               key={t.id} 
               className={`p-3 flex justify-between items-center group transition-all rounded-lg my-0.5 ${
                 t.arquivado 
                   ? 'bg-gray-50 opacity-75' // Visual Arquivado: Cinza e opaco
                   : 'bg-white hover:bg-gray-50 border-transparent' // Visual Ativo
               }`}
             >
               
               <div className="flex-1">
                 <div className="flex items-center gap-3">
                   {/* Ícone */}
                   <div className={`p-1.5 rounded-md ${t.arquivado ? 'bg-gray-200 text-gray-400' : 'bg-blue-50 text-blue-600'}`}>
                     <Tag size={18} />
                   </div>
                   
                   <div className="flex flex-col">
                     {/* Nome */}
                     <span className={`font-medium ${t.arquivado ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                       {t.nome}
                     </span>
                     
                     {/* Indicadores */}
                     <div className="flex items-center gap-2 mt-0.5">
                       
                       {/* Badge de Horas */}
                       {t.contaHorasCiclo ? (
                         <span className={`text-[10px] flex items-center gap-1 px-1.5 py-0.5 rounded border font-medium ${t.arquivado ? 'bg-gray-100 text-gray-400 border-gray-200' : 'text-green-700 bg-green-50 border-green-100'}`}>
                           <Clock size={10} /> Conta Horas
                         </span>
                       ) : (
                         <span className={`text-[10px] flex items-center gap-1 px-1.5 py-0.5 rounded border font-medium ${t.arquivado ? 'bg-gray-100 text-gray-400 border-gray-200' : 'text-gray-500 bg-gray-100 border-gray-200'}`}>
                           Apenas Questões
                         </span>
                       )}
                       
                       {/* Badge de Arquivado */}
                       {t.arquivado && (
                         <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full border border-gray-200 font-medium">
                           Arquivado
                         </span>
                       )}
                     </div>
                   </div>
                 </div>
               </div>

               {/* Ações */}
               <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                 {!t.arquivado && (
                   <button onClick={() => { setEdicao(t); setModalOpen(true); }} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="Editar"><Pencil size={16}/></button>
                 )}
                 
                 <button onClick={() => toggleArquivo(t)} className={`p-1.5 rounded ${t.arquivado ? 'text-green-600 hover:bg-green-100' : 'text-gray-400 hover:text-orange-500 hover:bg-orange-50'}`} title={t.arquivado ? "Restaurar" : "Arquivar"}>
                   {t.arquivado ? <RefreshCw size={16}/> : <Archive size={16}/>}
                 </button>

                 <button onClick={() => confirmarExclusao(t)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded" title="Excluir"><Trash2 size={16}/></button>
               </div>
             </div>
           ))}
         </div>
        }
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