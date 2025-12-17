import { useState, useEffect } from 'react';
import { Play, Pause, Save, Clock, Edit3, X, CheckCircle, AlertCircle, Plus, Check } from 'lucide-react';
import api from '../services/api';
import Modal from './Modal';
import { useTimerState, useTimerSeconds } from '../contexts/TimerContext';

interface Materia { id: number; nome: string; }
interface TipoEstudo { id: number; nome: string; contaHorasCiclo: boolean; } 
interface Topico { id: number; nome: string; }

interface RegistroRapidoProps {
  onRegistroSalvo?: () => void;
  onClose?: () => void;
  initialMode?: 'timer' | 'manual';
}

const toLocalISOString = (date: Date) => {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

function TimerDisplay() {
  const { seconds } = useTimerSeconds();
  const formatarTempo = (total: number) => {
    const h = Math.floor(total / 3600).toString().padStart(2, '0');
    const m = Math.floor((total % 3600) / 60).toString().padStart(2, '0');
    const s = (total % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };
  return <>{formatarTempo(seconds)}</>;
}

export default function RegistroRapido({ onRegistroSalvo, onClose, initialMode = 'timer' }: RegistroRapidoProps) {
  const { isActive, isPaused, timerData, startTimer, pauseTimer, resumeTimer, stopTimer, updateTimerData, getCurrentSeconds } = useTimerState();

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

  const [criandoMateria, setCriandoMateria] = useState(false);
  const [novaMateriaNome, setNovaMateriaNome] = useState('');
  const [salvandoMateria, setSalvandoMateria] = useState(false);

  const [form, setForm] = useState({
    materiaId: '',
    topicoId: '',
    tipoEstudoId: '',
    questoes: '',
    acertos: '',
    anotacoes: '',
    dataInicioManual: toLocalISOString(new Date()).slice(0, 16),
    duracaoManual: '' 
  });

  const [contarHoras, setContarHoras] = useState(true);

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
    carregarMaterias();
    api.get('/tipos-estudo').then(res => setTiposEstudo(res.data)).catch(() => {});
  }, []);

  const carregarMaterias = async () => {
    try {
      const res = await api.get('/materias');
      const lista = res.data.sort((a: Materia, b: Materia) => a.nome.localeCompare(b.nome));
      setMaterias(lista);
    } catch (e) {}
  };

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

  const handleTopicoChange = (id: string) => {
    setForm(f => ({ ...f, topicoId: id }));
    if (isActive) updateTimerData({ topicoId: id });
  };

  const handleTipoChange = (id: string) => {
    setForm(f => ({ ...f, tipoEstudoId: id }));
    if (isActive) updateTimerData({ tipoEstudoId: id });
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
      dataInicioManual: toLocalISOString(new Date()).slice(0, 16), duracaoManual: ''
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
      const novoId = String(res.data.id);
      setForm(f => ({ ...f, topicoId: novoId }));
      if (isActive) updateTimerData({ topicoId: novoId });
      setCriandoTopico(false);
      setNovoTopicoNome('');
    } catch (error) { setErro("Erro ao criar tópico"); } finally { setSalvandoTopico(false); }
  };

  const salvarNovaMateria = async () => {
    if (!novaMateriaNome.trim()) { setErro("Nome inválido"); return; }
    setSalvandoMateria(true);
    try {
      const res = await api.post('/materias', { nome: novaMateriaNome });
      const novaLista = [...materias, res.data]; 
      novaLista.sort((a, b) => a.nome.localeCompare(b.nome));
      setMaterias(novaLista);
      handleMateriaChange(String(res.data.id));
      setCriandoMateria(false);
      setNovaMateriaNome('');
    } catch (error: any) {
      setErro(error.response?.data?.mensagem || "Erro ao criar matéria");
    } finally {
      setSalvandoMateria(false);
    }
  };

  const salvar = async () => {
    setErro('');
    
    if (modo === 'timer' && isActive && !isPaused) {
        setErro("Pause o cronômetro para salvar o registro.");
        return;
    }

    if (!form.materiaId) { setErro("Selecione uma matéria para salvar."); return; }

    const qtdQ = form.questoes ? Number(form.questoes) : 0;
    const qtdA = form.acertos ? Number(form.acertos) : 0;
    if (qtdA > qtdQ) { setErro("Acertos maior que questões."); return; }

    setLoading(true);
    try {
      let segs = 0;
      let dtInicio = '';

      if (modo === 'timer') {
        segs = getCurrentSeconds(); 
        dtInicio = toLocalISOString(new Date()); 
      } else {
        const partes = form.duracaoManual.split(':').map(Number);
        segs = (partes[0] || 0) * 3600 + (partes[1] || 0) * 60 + (partes[2] || 0);
        dtInicio = toLocalISOString(new Date(form.dataInicioManual));
      }

      if (segs < 1) { setErro("Tempo inválido (0s)."); setLoading(false); return; }

      await api.post('/registros', {
        materiaId: Number(form.materiaId),
        topicoId: form.topicoId ? Number(form.topicoId) : null,
        tipoEstudoId: form.tipoEstudoId ? Number(form.tipoEstudoId) : null,
        dataInicio: dtInicio,
        segundos: segs,
        questoesFeitas: qtdQ,
        questoesCertas: qtdA,
        anotacoes: form.anotacoes,
        contarHorasNoCiclo: contarHoras
      });
      
      stopTimer(); 
      
      if (onRegistroSalvo) onRegistroSalvo();
      setModalSucessoAberto(true);
      setTimeout(() => {
        setModalSucessoAberto(false);
      }, 1500);

    } catch (error: any) {
      setErro(error.response?.data?.mensagem || "Erro ao salvar.");
    } finally {
      setLoading(false);
    }
  };

  const MateriaInput = () => criandoMateria ? (
    <div className="flex gap-1 animate-fade-in">
      <input autoFocus placeholder="Nova matéria..." value={novaMateriaNome} onChange={e=>setNovaMateriaNome(e.target.value)} className="flex-1 border rounded p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" onKeyDown={e => e.key === 'Enter' && salvarNovaMateria()} />
      <button onClick={salvarNovaMateria} disabled={salvandoMateria} className="p-2 bg-green-100 text-green-700 rounded hover:bg-green-200"><Check size={18}/></button>
      <button onClick={()=>{setCriandoMateria(false); setErro('');}} className="p-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"><X size={18}/></button>
    </div>
  ) : (
    <div className="flex gap-1">
      <select 
        value={form.materiaId} 
        onChange={e => handleMateriaChange(e.target.value)} 
        className="flex-1 border rounded p-2 text-sm bg-white disabled:bg-gray-50 focus:ring-1 focus:ring-blue-500 outline-none"
      >
        <option value="">Selecione...</option>
        {materias.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
      </select>
      <button onClick={()=>setCriandoMateria(true)} className="p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 disabled:opacity-50 transition-colors" title="Nova Matéria"><Plus size={18}/></button>
    </div>
  );

  const TopicoInput = () => criandoTopico ? (
    <div className="flex gap-1 animate-fade-in">
      <input autoFocus placeholder="Novo tópico..." value={novoTopicoNome} onChange={e=>setNovoTopicoNome(e.target.value)} className="flex-1 border rounded p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500" onKeyDown={e => e.key === 'Enter' && salvarNovoTopico()} />
      <button onClick={salvarNovoTopico} disabled={salvandoTopico} className="p-2 bg-green-100 text-green-700 rounded hover:bg-green-200"><Check size={18}/></button>
      <button onClick={()=>{setCriandoTopico(false); setErro('');}} className="p-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"><X size={18}/></button>
    </div>
  ) : (
    <div className="flex gap-1">
      <select 
        value={form.topicoId} 
        onChange={e => handleTopicoChange(e.target.value)} 
        disabled={!form.materiaId} 
        className="flex-1 border rounded p-2 text-sm bg-white disabled:bg-gray-50 focus:ring-1 focus:ring-blue-500 outline-none"
      >
        <option value="">{form.materiaId && topicos.length === 0 ? "Sem tópicos" : "Geral"}</option>
        {topicos.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
      </select>
      <button onClick={()=>setCriandoTopico(true)} disabled={!form.materiaId} className="p-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 disabled:opacity-50 transition-colors" title="Novo Tópico"><Plus size={18}/></button>
    </div>
  );

  const isTimerRunning = modo === 'timer' && isActive && !isPaused;

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden flex flex-col h-auto transition-all">
      
      {!isActive && (
        <div className="flex border-b bg-gray-50">
          <button onClick={() => setModo('timer')} className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${modo === 'timer' ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-gray-500'}`}><Clock size={16} /> Cronômetro</button>
          <button onClick={() => setModo('manual')} className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${modo === 'manual' ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-gray-500'}`}><Edit3 size={16} /> Manual</button>
        </div>
      )}

      {isActive && (
        <div className="bg-blue-600 text-white p-2 text-center text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2">
            <Clock size={14} /> Cronômetro em Andamento
        </div>
      )}

      <div className="p-5 md:grid md:grid-cols-2 md:gap-8">
        
        {/* COLUNA ESQUERDA */}
        <div className="space-y-5">
          
          {modo === 'timer' ? (
            <div className={`text-center py-4 md:py-6 rounded-2xl border mb-2 transition-colors ${isActive && !isPaused ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
              <div className={`text-4xl sm:text-5xl md:text-6xl font-mono font-bold tracking-wider ${isActive && !isPaused ? 'text-blue-600' : 'text-gray-500'}`}>
                <TimerDisplay />
              </div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2">
                {isActive && !isPaused ? 'Contando...' : 'Tempo Decorrido'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 mb-4">
              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1">INÍCIO</label>
                <input 
                  type="datetime-local" 
                  value={form.dataInicioManual} 
                  onChange={e=>setForm({...form, dataInicioManual:e.target.value})} 
                  className="w-full border rounded-lg p-3 text-sm outline-none focus:border-blue-500" 
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 block mb-1">DURAÇÃO (HH:MM:SS)</label>
                <input 
                  type="text" 
                  placeholder="00:00:00" 
                  value={form.duracaoManual} 
                  onChange={e=>setForm({...form, duracaoManual:e.target.value})} 
                  className="w-full border rounded-lg p-3 text-sm outline-none focus:border-blue-500" 
                />
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Matéria</label>
              <MateriaInput />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Tópico / Assunto</label>
              <TopicoInput />
            </div>
          </div>

          {modo === 'timer' && !isActive && (
            <button onClick={iniciar} className="w-full mt-4 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-100 transition-all active:scale-95">
              <Play size={20} fill="currentColor" /> INICIAR CRONÔMETRO
            </button>
          )}
          
          {isActive && (
            <div className="flex gap-2 mt-4">
              {!isPaused 
                ? <button onClick={pauseTimer} className="flex-1 py-3 md:py-4 text-sm md:text-base bg-yellow-400 hover:bg-yellow-500 text-yellow-900 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"><Pause size={20} fill="currentColor" /> PAUSAR</button>
                : <button onClick={resumeTimer} className="flex-1 py-3 md:py-4 text-sm md:text-base bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"><Play size={20} fill="currentColor" /> RETOMAR</button>
              }
              <button onClick={() => setModalCancelarAberto(true)} className="px-3 md:px-5 bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors"><X size={24}/></button>
            </div>
          )}
        </div>

        {/* COLUNA DIREITA */}
        <div className="space-y-4 border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-8 flex flex-col justify-center">
          
          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Tipo de Estudo</label>
            <select value={form.tipoEstudoId} onChange={e => handleTipoChange(e.target.value)} className="w-full border rounded-lg p-2.5 text-sm bg-white outline-none focus:border-blue-500">
              <option value="">Selecione...</option>
              {tiposEstudo.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Questões</label>
              <input type="number" min="0" value={form.questoes} onChange={e => setForm({...form, questoes: e.target.value})} className="w-full border rounded-lg p-2.5 text-sm outline-none focus:border-blue-500" placeholder="0" />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Acertos</label>
              <input type="number" min="0" value={form.acertos} onChange={e => setForm({...form, acertos: e.target.value})} className="w-full border rounded-lg p-2.5 text-sm outline-none focus:border-blue-500" placeholder="0" />
            </div>
          </div>

          {/* SWITCH INTELIGENTE */}
          <label className="flex items-center gap-2 cursor-pointer select-none bg-gray-50 p-2 rounded-md border border-gray-100 hover:bg-gray-100 transition-colors">
            <div className="relative">
              <input 
                type="checkbox" 
                checked={contarHoras} 
                onChange={e => setContarHoras(e.target.checked)} 
                className="sr-only peer" 
              />
              <div className="w-7 h-4 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-green-600"></div>
            </div>
            <span className={`text-xs font-medium ${contarHoras ? 'text-green-700' : 'text-gray-500'}`}>
              {contarHoras ? 'Contabilizar tempo na meta do ciclo' : 'Não contar tempo no ciclo (apenas registro)'}
            </span>
          </label>

          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Anotações</label>
            <textarea rows={3} value={form.anotacoes} onChange={e => setForm({...form, anotacoes: e.target.value})} className="w-full border rounded-lg p-2.5 text-sm resize-none outline-none focus:border-blue-500" placeholder="O que você estudou hoje?" />
          </div>

          {erro && <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg flex items-center gap-2"><AlertCircle size={16} /> {erro}</div>}

          {(modo === 'manual' || isActive) && (
            <button 
              onClick={salvar} 
              disabled={loading || isTimerRunning} 
              className={`w-full mt-2 py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] ${
                isTimerRunning 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isTimerRunning ? (
                <>Pause para Salvar</>
              ) : (
                <><Save size={20} /> {loading ? 'Salvando...' : 'SALVAR REGISTRO'}</>
              )}
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