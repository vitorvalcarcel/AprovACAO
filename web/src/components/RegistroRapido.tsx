import { useState, useEffect } from 'react';
import { Play, Pause, Save, Clock, Edit3, X, CheckCircle, AlertCircle, Plus, Check } from 'lucide-react';
import api from '../services/api';
import Modal from './Modal';
import { useTimer } from '../contexts/TimerContext';

interface Materia { id: number; nome: string; }
interface TipoEstudo { id: number; nome: string; contaHorasCiclo: boolean; } 
interface Topico { id: number; nome: string; }

interface RegistroRapidoProps {
  onRegistroSalvo?: () => void;
  onClose?: () => void;
  initialMode?: 'timer' | 'manual';
}

export default function RegistroRapido({ onRegistroSalvo, onClose, initialMode = 'timer' }: RegistroRapidoProps) {
  const { isActive, isPaused, seconds, timerData, startTimer, pauseTimer, resumeTimer, stopTimer, updateTimerData } = useTimer();

  // Se estiver ativo, força 'timer'. Se não, usa o inicial.
  const [modo, setModo] = useState<'manual' | 'timer'>(isActive ? 'timer' : initialMode);
  
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [tiposEstudo, setTiposEstudo] = useState<TipoEstudo[]>([]);
  const [topicos, setTopicos] = useState<Topico[]>([]);

  const [modalCancelarAberto, setModalCancelarAberto] = useState(false);
  const [modalSucessoAberto, setModalSucessoAberto] = useState(false);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const [criandoTopico, setCriandoTopico] = useState(false);
  const [novoTopicoNome, setNovoTopicoNome] = useState('');
  const [salvandoTopico, setSalvandoTopico] = useState(false);

  const [form, setForm] = useState({
    materiaId: '',
    topicoId: '',
    tipoEstudoId: '',
    questoes: '',
    acertos: '',
    anotacoes: '',
    dataInicioManual: new Date().toISOString().slice(0, 16),
    duracaoManual: '' 
  });

  const [contarHoras, setContarHoras] = useState(true);

  // Sincroniza Form com Contexto ao abrir
  useEffect(() => {
    if (isActive) {
      setModo('timer');
      setForm(f => ({
        ...f,
        materiaId: timerData.materiaId || '',
        topicoId: timerData.topicoId || '',
        tipoEstudoId: timerData.tipoEstudoId || ''
      }));
      if (timerData.materiaId) carregarTopicos(Number(timerData.materiaId));
    }
  }, [isActive]);

  useEffect(() => {
    api.get('/materias').then(res => setMaterias(res.data));
    api.get('/tipos-estudo').then(res => setTiposEstudo(res.data)).catch(() => {});
  }, []);

  const handleMateriaChange = (id: string) => {
    setForm(f => ({ ...f, materiaId: id, topicoId: '' }));
    if (id) {
      const mat = materias.find(m => m.id === Number(id));
      carregarTopicos(Number(id));
      if (isActive) {
        updateTimerData({ materiaId: id, materiaNome: mat?.nome, topicoId: '' });
      }
    } else {
      setTopicos([]);
      if (isActive) {
        updateTimerData({ materiaId: '', materiaNome: '', topicoId: '' });
      }
    }
  };

  useEffect(() => {
    if (form.tipoEstudoId) {
      const tipo = tiposEstudo.find(t => t.id === Number(form.tipoEstudoId));
      if (tipo) setContarHoras(tipo.contaHorasCiclo);
    }
  }, [form.tipoEstudoId, tiposEstudo]);

  const carregarTopicos = async (materiaId: number) => {
    try {
      const res = await api.get(`/topicos/${materiaId}`);
      setTopicos(res.data);
    } catch (e) { setTopicos([]); }
  };

  const formatarTempo = (total: number) => {
    const h = Math.floor(total / 3600).toString().padStart(2, '0');
    const m = Math.floor((total % 3600) / 60).toString().padStart(2, '0');
    const s = (total % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const iniciar = () => {
    const mat = materias.find(m => m.id === Number(form.materiaId));
    startTimer({
      materiaId: form.materiaId,
      materiaNome: mat?.nome || '', 
      topicoId: form.topicoId,
      tipoEstudoId: form.tipoEstudoId
    });
    setErro('');
    if (onClose) onClose(); 
  };

  const resetarTudo = () => {
    stopTimer();
    setForm({
      materiaId: '', topicoId: '', tipoEstudoId: '', questoes: '', acertos: '', anotacoes: '',
      dataInicioManual: new Date().toISOString().slice(0, 16), duracaoManual: ''
    });
    setModalCancelarAberto(false);
    if (onClose) onClose();
  };

  const salvarNovoTopico = async () => {
    if (!novoTopicoNome.trim()) return;
    if (!form.materiaId) { setErro("Selecione a matéria antes."); return; }
    setSalvandoTopico(true);
    try {
      const res = await api.post('/topicos', { nome: novoTopicoNome, materiaId: Number(form.materiaId) });
      await carregarTopicos(Number(form.materiaId));
      setForm(f => ({ ...f, topicoId: res.data.id }));
      setCriandoTopico(false);
      setNovoTopicoNome('');
    } catch (error) { setErro("Erro ao criar tópico"); } finally { setSalvandoTopico(false); }
  };

  const salvar = async () => {
    setErro('');
    
    if (!form.materiaId) { setErro("Selecione uma matéria para salvar."); return; }

    const qtdQ = form.questoes ? Number(form.questoes) : 0;
    const qtdA = form.acertos ? Number(form.acertos) : 0;
    if (qtdA > qtdQ) { setErro("Acertos maior que questões."); return; }

    setLoading(true);
    try {
      let segs = 0;
      let dtInicio = new Date();

      if (modo === 'timer') {
        segs = seconds;
        dtInicio = new Date(); 
      } else {
        const partes = form.duracaoManual.split(':').map(Number);
        segs = (partes[0] || 0) * 3600 + (partes[1] || 0) * 60 + (partes[2] || 0);
        dtInicio = new Date(form.dataInicioManual);
      }

      if (segs < 1) { setErro("Tempo inválido (0s)."); setLoading(false); return; }

      await api.post('/registros', {
        materiaId: Number(form.materiaId),
        topicoId: form.topicoId ? Number(form.topicoId) : null,
        tipoEstudoId: form.tipoEstudoId ? Number(form.tipoEstudoId) : null,
        dataInicio: dtInicio.toISOString(),
        segundos: segs,
        questoesFeitas: qtdQ,
        questoesCertas: qtdA,
        anotacoes: form.anotacoes,
        contarHorasNoCiclo: contarHoras
      });
      
      if (onRegistroSalvo) onRegistroSalvo();
      setModalSucessoAberto(true);
      setTimeout(() => {
        setModalSucessoAberto(false);
        resetarTudo();
      }, 1500);

    } catch (error: any) {
      setErro(error.response?.data?.mensagem || "Erro ao salvar.");
    } finally {
      setLoading(false);
    }
  };

  const TopicoInput = () => criandoTopico ? (
    <div className="flex gap-1">
      <input autoFocus placeholder="Nome..." value={novoTopicoNome} onChange={e=>setNovoTopicoNome(e.target.value)} className="flex-1 border rounded p-1.5 text-sm outline-none" />
      <button onClick={salvarNovoTopico} disabled={salvandoTopico} className="p-1.5 bg-green-100 text-green-700 rounded"><Check size={16}/></button>
      <button onClick={()=>{setCriandoTopico(false); setErro('');}} className="p-1.5 bg-gray-100 text-gray-600 rounded"><X size={16}/></button>
    </div>
  ) : (
    <div className="flex gap-1">
      <select value={form.topicoId} onChange={e=>setForm({...form, topicoId: e.target.value})} disabled={!form.materiaId} className="flex-1 border rounded p-2 text-sm bg-white disabled:bg-gray-50">
        <option value="">{form.materiaId && topicos.length === 0 ? "Sem tópicos" : "Geral"}</option>
        {topicos.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
      </select>
      <button onClick={()=>setCriandoTopico(true)} disabled={!form.materiaId} className="p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 disabled:opacity-50"><Plus size={16}/></button>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden flex flex-col h-auto transition-all">
      
      {/* Abas - SÓ EXIBE SE O TIMER ESTIVER PARADO */}
      {!isActive && (
        <div className="flex border-b bg-gray-50">
          <button onClick={() => setModo('timer')} className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${modo === 'timer' ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-gray-500'}`}><Clock size={16} /> Cronômetro</button>
          <button onClick={() => setModo('manual')} className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${modo === 'manual' ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-gray-500'}`}><Edit3 size={16} /> Manual</button>
        </div>
      )}

      {/* Se estiver ativo, mostra um header fixo para indicar que é modo Timer */}
      {isActive && (
        <div className="bg-blue-600 text-white p-2 text-center text-xs font-bold uppercase tracking-wider">
            Cronômetro em Andamento
        </div>
      )}

      <div className="p-5 md:grid md:grid-cols-2 md:gap-6">
        
        {/* COLUNA ESQUERDA */}
        <div className="space-y-4">
          
          {modo === 'timer' ? (
            <div className="text-center py-2 bg-blue-50/50 rounded-xl border border-blue-100 mb-4">
              <div className={`text-5xl font-mono font-bold tracking-wider ${isActive && !isPaused ? 'text-blue-600' : 'text-gray-700'}`}>
                {formatarTempo(seconds)}
              </div>
              <p className="text-xs text-blue-400 font-medium uppercase tracking-widest mt-1">Tempo Decorrido</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div><label className="text-xs font-bold text-gray-400 block mb-1">INÍCIO</label><input type="datetime-local" value={form.dataInicioManual} onChange={e=>setForm({...form, dataInicioManual:e.target.value})} className="w-full border rounded p-2 text-sm" /></div>
              <div><label className="text-xs font-bold text-gray-400 block mb-1">DURAÇÃO</label><input type="text" placeholder="HH:MM:SS" value={form.duracaoManual} onChange={e=>setForm({...form, duracaoManual:e.target.value})} className="w-full border rounded p-2 text-sm" /></div>
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Matéria</label>
              <select value={form.materiaId} onChange={e => handleMateriaChange(e.target.value)} className="w-full border rounded p-2 text-sm bg-white">
                <option value="">Selecione...</option>
                {materias.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Tópico / Assunto</label>
              <TopicoInput />
            </div>
          </div>

          {modo === 'timer' && !isActive && (
            <button onClick={iniciar} className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95">
              <Play size={20} fill="currentColor" /> INICIAR CRONÔMETRO
            </button>
          )}
          
          {isActive && (
            <div className="flex gap-2 mt-4">
              {!isPaused 
                ? <button onClick={pauseTimer} className="flex-1 py-2 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded-lg font-bold flex items-center justify-center gap-2"><Pause size={18} fill="currentColor" /> PAUSAR</button>
                : <button onClick={resumeTimer} className="flex-1 py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg font-bold flex items-center justify-center gap-2"><Play size={18} fill="currentColor" /> RETOMAR</button>
              }
              <button onClick={() => setModalCancelarAberto(true)} className="px-4 bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600 rounded-lg"><X size={20}/></button>
            </div>
          )}
        </div>

        {/* COLUNA DIREITA */}
        <div className="space-y-3 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
          
          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Tipo de Estudo</label>
            <select value={form.tipoEstudoId} onChange={e => setForm({...form, tipoEstudoId: e.target.value})} className="w-full border rounded p-2 text-sm bg-white">
              <option value="">Selecione...</option>
              {tiposEstudo.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Questões</label>
              <input type="number" min="0" value={form.questoes} onChange={e => setForm({...form, questoes: e.target.value})} className="w-full border rounded p-2 text-sm" placeholder="0" />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Acertos</label>
              <input type="number" min="0" value={form.acertos} onChange={e => setForm({...form, acertos: e.target.value})} className="w-full border rounded p-2 text-sm" placeholder="0" />
            </div>
          </div>

          {/* SWITCH CONTAR HORAS (NOVO) */}
          <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100">
            <span className="text-xs font-medium text-gray-600">Contabilizar horas no Ciclo?</span>
            <label className="relative inline-flex items-center cursor-pointer">
                <input 
                type="checkbox" 
                checked={contarHoras} 
                onChange={e => setContarHoras(e.target.checked)} 
                className="sr-only peer" 
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Anotações</label>
            <textarea rows={3} value={form.anotacoes} onChange={e => setForm({...form, anotacoes: e.target.value})} className="w-full border rounded p-2 text-sm resize-none" placeholder="O que você estudou hoje?" />
          </div>

          {erro && <div className="p-2 bg-red-50 text-red-700 text-xs rounded flex items-center gap-2"><AlertCircle size={14} /> {erro}</div>}

          {(modo === 'manual' || isActive) && (
            <button onClick={salvar} disabled={loading} className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]">
              <Save size={18} /> {loading ? 'Salvando...' : 'SALVAR REGISTRO'}
            </button>
          )}
        </div>
      </div>

      <Modal isOpen={modalCancelarAberto} onClose={() => setModalCancelarAberto(false)} title="Descartar?">
        <div className="space-y-4">
          <p className="text-gray-600 text-sm">Tem certeza que deseja descartar o tempo registrado?</p>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setModalCancelarAberto(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Voltar</button>
            <button onClick={resetarTudo} className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg">Descartar</button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={modalSucessoAberto} onClose={() => {}} title="">
        <div className="flex flex-col items-center justify-center py-6 space-y-4">
          <div className="bg-green-100 text-green-600 p-4 rounded-full animate-bounce"><CheckCircle size={48} /></div>
          <h3 className="text-xl font-bold text-gray-800">Registrado!</h3>
        </div>
      </Modal>
    </div>
  );
}