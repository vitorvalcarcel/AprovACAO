import { useState, useEffect } from 'react';
import { Clock, Calculator, Save, AlertCircle, ArrowRight, RotateCcw, CheckCircle } from 'lucide-react';
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
  questoes: number;
  horasSugeridas: number;
  horasEditadas: number;
  percentual: number;
}

interface ModalGerarCicloProps {
  isOpen: boolean;
  onClose: () => void;
  concurso: Concurso | null;
}

export default function ModalGerarCiclo({ isOpen, onClose, concurso }: ModalGerarCicloProps) {
  // Passos: 1=Meta, 2=Tabela, 3=Sucesso
  const [step, setStep] = useState(1);
  
  // SOLUÇÃO DO "TOC": Usamos string para permitir limpar o campo (ficar vazio)
  const [totalHorasStr, setTotalHorasStr] = useState('20'); 
  
  const [itens, setItens] = useState<ItemSugestao[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setItens([]);
      setErro('');
      setTotalHorasStr('20'); // Valor padrão ao abrir
    }
  }, [isOpen]);

  // Passo 1: Buscar Sugestão do Java
  const gerarSugestao = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    // Converte para número apenas na hora de usar
    const horasNum = parseFloat(totalHorasStr);

    if (!concurso || isNaN(horasNum) || horasNum <= 0) {
      setErro("Por favor, insira uma quantidade válida de horas.");
      return;
    }
    
    setLoading(true);

    try {
      const response = await api.get<ItemSugestao[]>('/ciclos/sugestao', {
        params: { concursoId: concurso.id, horas: horasNum }
      });

      // Prepara os dados para edição
      const dados = response.data.map(item => ({
        ...item,
        horasEditadas: item.horasSugeridas
      }));

      setItens(dados);
      setStep(2);
    } catch (error: any) {
      setErro(error.response?.data?.mensagem || "Erro ao gerar sugestão. O concurso tem matérias?");
    } finally {
      setLoading(false);
    }
  };

  // Passo 2: Salvar no Banco
  const salvarCiclo = async () => {
    if (!concurso) return;
    setLoading(true);
    setErro('');

    // Recalcula total real
    const totalFinal = itens.reduce((acc, i) => acc + i.horasEditadas, 0);
    const horasMetaInicial = parseFloat(totalHorasStr);

    try {
      const payload = {
        concursoId: concurso.id,
        // Usa o nome baseado na meta inicial para referência
        descricao: `Ciclo ${isNaN(horasMetaInicial) ? totalFinal.toFixed(0) : horasMetaInicial}h`,
        totalHoras: totalFinal,
        itens: itens.map((item, index) => ({
          materiaId: item.materiaId,
          horasMeta: item.horasEditadas,
          ordem: index + 1
        }))
      };

      await api.post('/ciclos', payload);
      
      // SOLUÇÃO DO POPUP: Vai para o Passo 3 (Sucesso) em vez de alert()
      setStep(3);

      // Fecha sozinho após 1.5s
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (error: any) {
      setErro(error.response?.data?.mensagem || "Erro ao salvar ciclo.");
      setLoading(false); // Só para loading se der erro, se der sucesso o modal vai fechar
    }
  };

  // Atualiza valor editado na tabela
  const atualizarItem = (index: number, valor: string) => {
    // Permite digitar e apagar livremente na tabela também
    const novaLista = [...itens];
    if (valor === '') {
        novaLista[index].horasEditadas = 0; // Ou mantém como string se quiser refinar mais
    } else {
        const num = parseFloat(valor);
        if (!isNaN(num) && num >= 0) {
            novaLista[index].horasEditadas = num;
        }
    }
    setItens(novaLista);
  };

  const totalAtual = itens.reduce((acc, i) => acc + i.horasEditadas, 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={step === 1 ? "Novo Ciclo" : (step === 3 ? "Sucesso!" : `Planejando: ${concurso?.nome}`)}>
      
      {/* PASSO 1: INPUT DE HORAS (Limpo) */}
      {step === 1 && (
        <form onSubmit={gerarSugestao} className="space-y-6">
          <div className="text-center py-4">
            <div className="bg-blue-50 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="text-blue-600" size={28} />
            </div>
            <h3 className="font-semibold text-gray-800">Defina sua meta</h3>
            <p className="text-sm text-gray-500">Quantas horas totais terá este ciclo?</p>
          </div>

          <div className="flex justify-center">
            <div className="flex items-center gap-2">
              <input 
                type="number" autoFocus min="1" max="500"
                // Valor agora é string, permite ficar vazio
                value={totalHorasStr} 
                onChange={e => setTotalHorasStr(e.target.value)}
                placeholder="0"
                className="w-24 text-center text-2xl font-bold border rounded-lg py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <span className="text-gray-500 font-medium">horas</span>
            </div>
          </div>

          {erro && <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded animate-pulse">{erro}</div>}

          <button type="submit" disabled={loading || !totalHorasStr} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {loading ? 'Calculando...' : <>Gerar Sugestão <ArrowRight size={18}/></>}
          </button>
        </form>
      )}

      {/* PASSO 2: TABELA DE AJUSTES */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-100">
            <div className="flex items-center gap-2 text-blue-800 text-sm">
              <Calculator size={16} />
              Total Planejado: <strong>{totalAtual.toFixed(1)}h</strong>
            </div>
            <button type="button" onClick={() => setStep(1)} className="text-xs text-blue-600 hover:underline flex gap-1 items-center">
              <RotateCcw size={12}/> Recalcular
            </button>
          </div>

          <div className="border rounded-lg overflow-hidden max-h-[300px] overflow-y-auto bg-white scrollbar-thin">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 font-medium border-b sticky top-0">
                <tr>
                  <th className="px-3 py-2">Matéria</th>
                  <th className="px-3 py-2 w-16 text-center">Peso</th>
                  <th className="px-3 py-2 w-20 text-center">Horas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {itens.map((item, idx) => (
                  <tr key={item.materiaId} className="hover:bg-gray-50">
                    <td className="px-3 py-2">
                      <div className="font-medium text-gray-800">{item.nomeMateria}</div>
                      <div className="w-full bg-gray-100 h-1 rounded-full mt-1 overflow-hidden">
                        <div className="bg-blue-500 h-1 rounded-full transition-all duration-500" style={{width: `${Math.min(item.percentual, 100)}%`}} />
                      </div>
                    </td>
                    <td className="px-3 py-2 text-center text-xs text-gray-500">
                      {item.peso}
                    </td>
                    <td className="px-3 py-2">
                      <input 
                        type="number" step="0.1" min="0"
                        // Exibindo o valor numérico (se for 0, mostra 0)
                        value={item.horasEditadas}
                        onChange={e => atualizarItem(idx, e.target.value)}
                        className="w-full border rounded px-1 py-1 text-center font-bold text-gray-700 focus:border-blue-500 outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {erro && <div className="text-red-600 text-xs text-center">{erro}</div>}

          <div className="flex justify-end gap-2 pt-2 border-t">
            <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm transition-colors">Cancelar</button>
            <button onClick={salvarCiclo} disabled={loading} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm">
              <Save size={16} /> {loading ? 'Salvando...' : 'Salvar Ciclo'}
            </button>
          </div>
        </div>
      )}

      {/* PASSO 3: SUCESSO (Feedback Visual) */}
      {step === 3 && (
        <div className="flex flex-col items-center justify-center py-8 space-y-4 animate-fade-in">
          <div className="bg-green-100 text-green-600 p-4 rounded-full">
            <CheckCircle size={48} />
          </div>
          <h3 className="text-xl font-bold text-gray-800">Ciclo Criado!</h3>
          <p className="text-gray-500 text-sm">Bom estudo 🚀</p>
        </div>
      )}

    </Modal>
  );
}