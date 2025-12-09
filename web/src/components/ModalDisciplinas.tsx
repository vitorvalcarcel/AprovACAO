import { useState, useEffect } from 'react';
import { Plus, Trash2, BookOpen, AlertCircle } from 'lucide-react';
import api from '../services/api';
import Modal from './Modal';

interface Concurso {
  id: number;
  nome: string;
}

interface Materia {
  id: number;
  nome: string;
}

interface Vinculo {
  id: number;
  nomeMateria: string;
  peso: number;
  questoesProva: number;
}

interface ModalDisciplinasProps {
  isOpen: boolean;
  onClose: () => void;
  concurso: Concurso | null;
}

export default function ModalDisciplinas({ isOpen, onClose, concurso }: ModalDisciplinasProps) {
  const [vinculos, setVinculos] = useState<Vinculo[]>([]);
  const [materiasDisponiveis, setMateriasDisponiveis] = useState<Materia[]>([]);
  
  const [materiaSelecionada, setMateriaSelecionada] = useState('');
  const [peso, setPeso] = useState(1);
  const [questoes, setQuestoes] = useState(10);
  
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  // Estado para o Modal de Confirmação (Sobreposto)
  const [modalConfirmacao, setModalConfirmacao] = useState<{
    aberto: boolean;
    idParaRemover: number | null; // Guardamos o ID aqui
  }>({ aberto: false, idParaRemover: null });

  useEffect(() => {
    if (isOpen && concurso) {
      carregarDados();
    }
  }, [isOpen, concurso]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const resVinculos = await api.get<Vinculo[]>(`/concursos/${concurso?.id}/materias`);
      setVinculos(resVinculos.data);
      const resMaterias = await api.get<Materia[]>('/materias');
      setMateriasDisponiveis(resMaterias.data);
    } catch (error) {
      console.error("Erro ao carregar", error);
    } finally {
      setLoading(false);
    }
  };

  const adicionarDisciplina = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!concurso || !materiaSelecionada) return;
    setErro('');

    try {
      await api.post(`/concursos/${concurso.id}/materias`, {
        materiaId: Number(materiaSelecionada),
        peso: Number(peso),
        questoesProva: Number(questoes)
      });
      setMateriaSelecionada('');
      setPeso(1);
      setQuestoes(10);
      carregarDados();
    } catch (error: any) {
      setErro(error.response?.data?.mensagem || "Erro ao adicionar.");
    }
  };

  // 1. Apenas abre o modal de confirmação
  const solicitarRemocao = (idVinculo: number) => {
    setModalConfirmacao({ aberto: true, idParaRemover: idVinculo });
  };

  // 2. Executa a remoção de fato (Ao clicar em Confirmar)
  const confirmarRemocao = async () => {
    if (!modalConfirmacao.idParaRemover) return;

    try {
      await api.delete(`/concursos/materias/${modalConfirmacao.idParaRemover}`);
      carregarDados();
      setModalConfirmacao({ aberto: false, idParaRemover: null }); // Fecha modal
    } catch (error) {
      setErro("Erro ao remover disciplina.");
      setModalConfirmacao({ aberto: false, idParaRemover: null });
    }
  };

  const materiasParaAdicionar = materiasDisponiveis.filter(
    m => !vinculos.some(v => v.nomeMateria === m.nome)
  );

  return (
    <>
      {/* Modal Principal (Gestão) */}
      <Modal isOpen={isOpen} onClose={onClose} title={`Disciplinas: ${concurso?.nome}`}>
        <div className="space-y-4">
          
          <form onSubmit={adicionarDisciplina} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="text-xs text-gray-500 font-medium ml-1 block mb-1">Matéria</label>
                <select 
                  value={materiaSelecionada}
                  onChange={e => setMateriaSelecionada(e.target.value)}
                  className="w-full px-2 py-1.5 border rounded-md text-sm bg-white focus:ring-1 focus:ring-blue-500 outline-none"
                  required
                >
                  <option value="">Selecione...</option>
                  {materiasParaAdicionar.map(m => (
                    <option key={m.id} value={m.id}>{m.nome}</option>
                  ))}
                </select>
              </div>

              <div className="w-16">
                <label className="text-xs text-gray-500 font-medium ml-1 block mb-1">Peso</label>
                <input 
                  type="number" step="0.1" min="0.1"
                  value={peso}
                  onChange={e => setPeso(Number(e.target.value))}
                  className="w-full px-2 py-1.5 border rounded-md text-sm outline-none text-center"
                />
              </div>

              <div className="w-16">
                <label className="text-xs text-gray-500 font-medium ml-1 block mb-1">Quest.</label>
                <input 
                  type="number" min="1"
                  value={questoes}
                  onChange={e => setQuestoes(Number(e.target.value))}
                  className="w-full px-2 py-1.5 border rounded-md text-sm outline-none text-center"
                />
              </div>

              <button 
                type="submit" 
                disabled={!materiaSelecionada}
                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md transition-colors disabled:opacity-50 h-[34px] w-[34px] flex items-center justify-center"
                title="Adicionar"
              >
                <Plus size={18} />
              </button>
            </div>

            {erro && (
              <div className="mt-2 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle size={12} /> {erro}
              </div>
            )}
          </form>

          <div>
            <div className="flex items-center justify-between mb-2 px-1">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <BookOpen size={14} /> Matérias Vinculadas ({vinculos.length})
              </h4>
            </div>
            
            {loading ? (
              <p className="text-center text-gray-400 text-xs py-4">Carregando...</p>
            ) : vinculos.length === 0 ? (
              <p className="text-center text-gray-400 text-xs py-8 border border-dashed rounded-md bg-gray-50">
                Nenhuma matéria vinculada ainda.
              </p>
            ) : (
              <div className="border rounded-md divide-y overflow-hidden max-h-[250px] overflow-y-auto bg-white scrollbar-thin">
                {vinculos.map(v => (
                  <div key={v.id} className="flex items-center justify-between p-2 hover:bg-blue-50 transition-colors group">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 text-sm truncate">{v.nomeMateria}</p>
                      <p className="text-[10px] text-gray-500 uppercase font-semibold">
                        Peso {v.peso} • {v.questoesProva} questões
                      </p>
                    </div>
                    {/* Botão Remover agora chama solicitarRemocao */}
                    <button 
                      onClick={() => solicitarRemocao(v.id)}
                      className="text-gray-300 hover:text-red-600 p-1.5 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                      title="Remover"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Modal de Confirmação (Sobreposto) */}
      <Modal 
        isOpen={modalConfirmacao.aberto} 
        onClose={() => setModalConfirmacao({ aberto: false, idParaRemover: null })} 
        title="Remover Disciplina"
      >
        <div className="space-y-4">
          <p className="text-gray-600 text-sm">
            Tem certeza que deseja desvincular esta matéria do concurso?
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button 
              onClick={() => setModalConfirmacao({ aberto: false, idParaRemover: null })}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancelar
            </button>
            <button 
              onClick={confirmarRemocao}
              className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg"
            >
              Remover
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}