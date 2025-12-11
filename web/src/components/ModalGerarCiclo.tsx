import { useState, useEffect } from 'react';
import { Clock, Calculator, Save, ArrowRight, RotateCcw, CheckCircle, BookOpen } from 'lucide-react';
import api from '../services/api';
import Modal from './Modal';

interface Concurso {
  id: number;
  nome: string;
}

interface ItemSugestao {
  materiaId: number;
  nomeMateria: string;
  peso: number;
  percentual: number;
  // Sugeridos pelo backend
  horasSugeridas: number;
  questoesSugeridas: number;
  // Editados pelo usuário
  horasEditadas: number;
  questoesEditadas: number;
}

interface ModalGerarCicloProps {
  isOpen: boolean;
  onClose: () => void;
  concurso: Concurso | null;
}

export default function ModalGerarCiclo({ isOpen, onClose, concurso }: ModalGerarCicloProps) {
  const [step, setStep] = useState(1);
  
  // Inputs Step 1
  const [totalHorasStr, setTotalHorasStr] = useState('20'); 
  const [totalQuestoesStr, setTotalQuestoesStr] = useState('500'); 
  
  const [itens, setItens] = useState<ItemSugestao[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setItens([]);
      setErro('');
      // Valores padrão
      setTotalHorasStr('20');
      setTotalQuestoesStr('500');
    }
  }, [isOpen]);

  // Passo 1 -> Passo 2
  const gerarSugestao = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    const horasNum = parseFloat(totalHorasStr);
    const questoesNum = parseInt(totalQuestoesStr);

    if (!concurso || isNaN(horasNum) || horasNum <= 0) {
      setErro("Insira uma carga horária válida.");
      return;
    }
    
    setLoading(true);

    try {
      const response = await api.get<ItemSugestao[]>('/ciclos/sugestao', {
        params: { 
          concursoId: concurso.id, 
          horas: horasNum,
          questoes: isNaN(questoesNum) ? 0 : questoesNum
        }
      });

      // Inicializa os campos editáveis com a sugestão
      const dados = response.data.map(item => ({
        ...item,
        horasEditadas: item.horasSugeridas,
        questoesEditadas: item.questoesSugeridas
      }));

      setItens(dados);
      setStep(2);
    } catch (error: any) {
      setErro(error.response?.data?.mensagem || "Erro ao gerar sugestão. O concurso possui matérias com pesos?");
    } finally {
      setLoading(false);
    }
  };

  // Passo 2 -> Salvar
  const salvarCiclo = async () => {
    if (!concurso) return;
    setLoading(true);
    setErro('');

    const totalHorasReal = itens.reduce((acc, i) => acc + i.horasEditadas, 0);
    const totalQuestoesReal = itens.reduce((acc, i) => acc + i.questoesEditadas, 0);

    try {
      const payload = {
        concursoId: concurso.id,
        descricao: `Ciclo ${totalHorasReal.toFixed(0)}h / ${totalQuestoesReal}q`,
        totalHoras: totalHorasReal,
        totalQuestoes: totalQuestoesReal,
        itens: itens.map((item, index) => ({
          materiaId: item.materiaId,
          horasMeta: item.horasEditadas,
          questoesMeta: item.questoesEditadas,
          ordem: index + 1
        }))
      };

      await api.post('/ciclos', payload);
      setStep(3);
      
      // Auto-fecha
      setTimeout(() => {
        onClose();
        // Recarrega a página ou contexto se necessário
        window.location.reload(); 
      }, 1500);

    } catch (error: any) {
      setErro(error.response?.data?.mensagem || "Erro ao salvar ciclo.");
      setLoading(false);
    }
  };

  // Atualizadores da Tabela
  const atualizarHoras = (index: number, valor: string) => {
    const novaLista = [...itens];
    if (valor === '') novaLista[index].horasEditadas = 0;
    else {
      const num = parseFloat(valor);
      if (!isNaN(num) && num >= 0) novaLista[index].horasEditadas = num;
    }
    setItens(novaLista);
  };

  const atualizarQuestoes = (index: number, valor: string) => {
    const novaLista = [...itens];
    if (valor === '') novaLista[index].questoesEditadas = 0;
    else {
      const num = parseInt(valor);
      if (!isNaN(num) && num >= 0) novaLista[index].questoesEditadas = num;
    }
    setItens(novaLista);
  };

  const totalHorasAtual = itens.reduce((acc, i) => acc + i.horasEditadas, 0);
  const totalQuestoesAtual = itens.reduce((acc, i) => acc + i.questoesEditadas, 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={step === 1 ? "Novo Ciclo" : (step === 3 ? "Sucesso!" : `Planejando: ${concurso?.nome}`)}>
      
      {/* --- PASSO 1: DEFINIÇÃO DE METAS --- */}
      {step === 1 && (
        <form onSubmit={gerarSugestao} className="space-y-6">
          <div className="text-center py-4">
            <div className="bg-blue-50 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="text-blue-600" size={28} />
            </div>
            <h3 className="font-semibold text-gray-800">Defina suas metas globais</h3>
            <p className="text-sm text-gray-500">O sistema distribuirá proporcionalmente aos pesos.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Input Horas */}
            <div className="flex flex-col items-center p-4 bg-blue-50 rounded-xl border border-blue-100">
              <label className="text-xs font-bold text-blue-600 uppercase mb-2">Horas Totais</label>
              <div className="flex items-center gap-1">
                <input 
                  type="number" autoFocus min="1"
                  value={totalHorasStr} onChange={e => setTotalHorasStr(e.target.value)}
                  className="w-20 text-center text-2xl font-bold bg-white border border-blue-200 rounded-lg py-1 focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <span className="text-blue-400 font-medium">h</span>
              </div>
            </div>

            {/* Input Questões */}
            <div className="flex flex-col items-center p-4 bg-purple-50 rounded-xl border border-purple-100">
              <label className="text-xs font-bold text-purple-600 uppercase mb-2">Questões Totais</label>
              <div className="flex items-center gap-1">
                <input 
                  type="number" min="0"
                  value={totalQuestoesStr} onChange={e => setTotalQuestoesStr(e.target.value)}
                  className="w-20 text-center text-2xl font-bold bg-white border border-purple-200 rounded-lg py-1 focus:ring-2 focus:ring-purple-500 outline-none"
                />
                <span className="text-purple-400 font-medium">q</span>
              </div>
            </div>
          </div>

          {erro && <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded animate-pulse">{erro}</div>}

          <button type="submit" disabled={loading || !totalHorasStr} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm">
            {loading ? 'Calculando...' : <>Gerar Sugestão <ArrowRight size={18}/></>}
          </button>
        </form>
      )}

      {/* --- PASSO 2: TABELA DE AJUSTES --- */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-1.5 text-blue-700">
                <Calculator size={14} /> <strong>{totalHorasAtual.toFixed(1)}h</strong>
              </div>
              <div className="flex items-center gap-1.5 text-purple-700">
                <BookOpen size={14} /> <strong>{totalQuestoesAtual}q</strong>
              </div>
            </div>
            <button type="button" onClick={() => setStep(1)} className="text-xs text-gray-500 hover:text-gray-800 flex gap-1 items-center hover:underline">
              <RotateCcw size={12}/> Recalcular
            </button>
          </div>

          <div className="border rounded-lg overflow-hidden max-h-[300px] overflow-y-auto bg-white scrollbar-thin">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 font-medium border-b sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-2">Matéria</th>
                  <th className="px-3 py-2 w-14 text-center text-xs">Peso</th>
                  <th className="px-2 py-2 w-20 text-center text-blue-600">Horas</th>
                  <th className="px-2 py-2 w-20 text-center text-purple-600">Questões</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {itens.map((item, idx) => (
                  <tr key={item.materiaId} className="hover:bg-gray-50">
                    <td className="px-3 py-2">
                      <div className="font-medium text-gray-800 truncate max-w-[150px]" title={item.nomeMateria}>{item.nomeMateria}</div>
                      <div className="w-full bg-gray-100 h-1 rounded-full mt-1 overflow-hidden">
                        <div className="bg-blue-400 h-1 rounded-full" style={{width: `${Math.min(item.percentual, 100)}%`}} />
                      </div>
                    </td>
                    <td className="px-3 py-2 text-center text-xs text-gray-500 font-mono">
                      {item.peso}
                    </td>
                    
                    {/* Input Horas */}
                    <td className="px-2 py-2">
                      <input 
                        type="number" step="0.1" min="0"
                        value={item.horasEditadas}
                        onChange={e => atualizarHoras(idx, e.target.value)}
                        className="w-full border border-blue-100 bg-blue-50/50 rounded px-1 py-1 text-center font-bold text-blue-700 focus:border-blue-500 outline-none focus:bg-white transition-colors"
                      />
                    </td>

                    {/* Input Questões */}
                    <td className="px-2 py-2">
                      <input 
                        type="number" min="0"
                        value={item.questoesEditadas}
                        onChange={e => atualizarQuestoes(idx, e.target.value)}
                        className="w-full border border-purple-100 bg-purple-50/50 rounded px-1 py-1 text-center font-bold text-purple-700 focus:border-purple-500 outline-none focus:bg-white transition-colors"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm transition-colors">Cancelar</button>
            <button onClick={salvarCiclo} disabled={loading} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm">
              <Save size={16} /> {loading ? 'Salvando...' : 'Salvar Ciclo'}
            </button>
          </div>
        </div>
      )}

      {/* --- PASSO 3: SUCESSO --- */}
      {step === 3 && (
        <div className="flex flex-col items-center justify-center py-8 space-y-4 animate-fade-in">
          <div className="bg-green-100 text-green-600 p-4 rounded-full animate-bounce">
            <CheckCircle size={48} />
          </div>
          <h3 className="text-xl font-bold text-gray-800">Ciclo Criado!</h3>
          <p className="text-gray-500 text-sm">Bom estudo 🚀</p>
        </div>
      )}

    </Modal>
  );
}