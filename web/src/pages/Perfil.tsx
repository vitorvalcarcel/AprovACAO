import { useState, useEffect } from 'react';
import { User, Mail, Lock, Trash2, Save, AlertTriangle, X, CheckCircle, Loader2, KeyRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Modal from '../components/Modal';

interface UsuarioData {
  nome: string;
  email: string;
}

export default function Perfil() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<UsuarioData>({ nome: '', email: '' });
  const [loadingInicial, setLoadingInicial] = useState(true);

  // Estados de Modais
  const [modalNomeAberto, setModalNomeAberto] = useState(false);
  const [modalSenhaAberto, setModalSenhaAberto] = useState(false);
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);

  // Estados de Formulários e Feedbacks
  const [novoNome, setNovoNome] = useState('');
  const [statusNome, setStatusNome] = useState<{tipo: 'sucesso'|'erro', msg: string} | null>(null);
  const [loadingNome, setLoadingNome] = useState(false);

  const [senhaForm, setSenhaForm] = useState({ atual: '', nova: '', confirma: '' });
  const [statusSenha, setStatusSenha] = useState<{tipo: 'sucesso'|'erro', msg: string} | null>(null);
  const [loadingSenha, setLoadingSenha] = useState(false);

  const [senhaExclusao, setSenhaExclusao] = useState('');
  const [erroExclusao, setErroExclusao] = useState('');
  const [loadingExclusao, setLoadingExclusao] = useState(false);

  useEffect(() => {
    carregarUsuario();
  }, []);

  const carregarUsuario = async () => {
    try {
      const res = await api.get('/usuarios/me');
      setUsuario(res.data);
      setNovoNome(res.data.nome);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingInicial(false);
    }
  };

  // --- AÇÃO: SALVAR NOME ---
  const handleSalvarNome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNome.trim()) return;
    
    setLoadingNome(true);
    setStatusNome(null);

    try {
      await api.put('/usuarios', { nome: novoNome });
      setStatusNome({ tipo: 'sucesso', msg: 'Nome atualizado com sucesso!' });
      
      // Atualiza estado local e storage para refletir no header imediatamente
      setUsuario(prev => ({ ...prev, nome: novoNome }));
      const userStorage = JSON.parse(localStorage.getItem('usuario') || '{}');
      localStorage.setItem('usuario', JSON.stringify({ ...userStorage, nome: novoNome }));
      window.dispatchEvent(new Event('storage'));

      setTimeout(() => {
        setModalNomeAberto(false);
        setStatusNome(null);
      }, 1500);
    } catch (e) {
      setStatusNome({ tipo: 'erro', msg: 'Não foi possível atualizar o nome.' });
    } finally {
      setLoadingNome(false);
    }
  };

  // --- AÇÃO: ALTERAR SENHA ---
  const handleSalvarSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusSenha(null);

    // Validações Front-end
    if (senhaForm.nova.length < 8) {
      setStatusSenha({ tipo: 'erro', msg: 'A nova senha deve ter no mínimo 8 caracteres.' });
      return;
    }
    if (senhaForm.nova !== senhaForm.confirma) {
      setStatusSenha({ tipo: 'erro', msg: 'A confirmação de senha não confere.' });
      return;
    }

    setLoadingSenha(true);
    try {
      await api.patch('/usuarios/senha', {
        senhaAtual: senhaForm.atual,
        novaSenha: senhaForm.nova
      });
      setStatusSenha({ tipo: 'sucesso', msg: 'Senha alterada! Use a nova senha no próximo login.' });
      setSenhaForm({ atual: '', nova: '', confirma: '' });
      
      setTimeout(() => {
        setModalSenhaAberto(false);
        setStatusSenha(null);
      }, 2000);
    } catch (error: any) {
      setStatusSenha({ tipo: 'erro', msg: error.response?.data?.mensagem || 'Erro ao alterar senha. Verifique sua senha atual.' });
    } finally {
      setLoadingSenha(false);
    }
  };

  // --- AÇÃO: EXCLUIR CONTA ---
  const handleExcluirConta = async () => {
    if (!senhaExclusao) return;
    setLoadingExclusao(true);
    setErroExclusao('');

    try {
      // Axios delete com body contendo a senha para validação (se o backend suportar)
      await api.delete('/usuarios', {
        data: { senha: senhaExclusao }
      });
      
      // Limpeza e Redirecionamento
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      navigate('/login');
    } catch (error: any) {
      setErroExclusao(error.response?.data?.mensagem || 'Erro ao excluir conta. Verifique sua conexão ou senha.');
    } finally {
      setLoadingExclusao(false);
    }
  };

  if (loadingInicial) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400 gap-2">
        <Loader2 className="animate-spin" size={24} /> Carregando perfil...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20">
      
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Minha Conta</h1>
        <p className="text-sm text-gray-500">Gerencie suas informações pessoais e segurança</p>
      </div>

      {/* --- CARD 1: DADOS PESSOAIS --- */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
          <div className="bg-blue-100 p-1.5 rounded-lg text-blue-600">
            <User size={18} />
          </div>
          <h2 className="font-bold text-gray-700">Dados Pessoais</h2>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nome */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Nome de Exibição</label>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 group hover:border-blue-200 transition-colors">
              <span className="font-medium text-gray-800">{usuario.nome}</span>
              <button 
                onClick={() => { setNovoNome(usuario.nome); setStatusNome(null); setModalNomeAberto(true); }}
                className="text-sm text-blue-600 font-medium hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Editar
              </button>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">E-mail de Login</label>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex items-center gap-2 text-gray-600">
                <Mail size={16} />
                <span className="font-medium">{usuario.email}</span>
              </div>
              <div className="group relative">
                <Lock size={16} className="text-gray-400 cursor-help" />
                <div className="absolute right-0 bottom-full mb-2 w-48 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-center shadow-lg">
                  O e-mail não pode ser alterado por segurança.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- CARD 2: SEGURANÇA --- */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
          <div className="bg-green-100 p-1.5 rounded-lg text-green-600">
            <KeyRound size={18} />
          </div>
          <h2 className="font-bold text-gray-700">Segurança</h2>
        </div>
        <div className="p-6 flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-800">Senha de Acesso</p>
            <p className="text-sm text-gray-500">Recomendamos usar uma senha forte com caracteres especiais.</p>
          </div>
          <button 
            onClick={() => { setSenhaForm({ atual: '', nova: '', confirma: '' }); setStatusSenha(null); setModalSenhaAberto(true); }}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 text-gray-700 transition-colors shadow-sm"
          >
            Alterar Senha
          </button>
        </div>
      </div>

      {/* --- CARD 3: ZONA DE PERIGO --- */}
      <div className="bg-red-50 rounded-xl border border-red-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-red-200/50 flex items-center gap-2">
          <AlertTriangle className="text-red-600" size={20} />
          <h2 className="font-bold text-red-700">Zona de Perigo</h2>
        </div>
        <div className="p-6 flex items-center justify-between">
          <div>
            <p className="font-medium text-red-900">Excluir Conta</p>
            <p className="text-sm text-red-700/80">Esta ação irá apagar permanentemente todos os seus dados e histórico.</p>
          </div>
          <button 
            onClick={() => { setSenhaExclusao(''); setErroExclusao(''); setModalExcluirAberto(true); }}
            className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-bold hover:bg-red-600 hover:text-white transition-colors shadow-sm"
          >
            Excluir Conta
          </button>
        </div>
      </div>

      {/* === MODAIS === */}

      {/* 1. Modal Editar Nome */}
      <Modal isOpen={modalNomeAberto} onClose={() => setModalNomeAberto(false)} title="Editar Nome">
        <form onSubmit={handleSalvarNome} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
            <input 
              autoFocus 
              value={novoNome} 
              onChange={e => setNovoNome(e.target.value)} 
              className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder="Seu nome"
            />
          </div>

          {statusNome && (
            <div className={`text-sm p-3 rounded-lg flex items-center gap-2 ${statusNome.tipo === 'sucesso' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {statusNome.tipo === 'sucesso' ? <CheckCircle size={16}/> : <AlertTriangle size={16}/>}
              {statusNome.msg}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalNomeAberto(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors">Cancelar</button>
            <button 
              type="submit" 
              disabled={loadingNome || !novoNome.trim()} 
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {loadingNome ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>} Salvar
            </button>
          </div>
        </form>
      </Modal>

      {/* 2. Modal Alterar Senha */}
      <Modal isOpen={modalSenhaAberto} onClose={() => setModalSenhaAberto(false)} title="Alterar Senha">
        <form onSubmit={handleSalvarSenha} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha Atual</label>
            <input 
              type="password" 
              value={senhaForm.atual} 
              onChange={e => setSenhaForm({...senhaForm, atual: e.target.value})} 
              className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nova Senha</label>
            <input 
              type="password" 
              value={senhaForm.nova} 
              onChange={e => setSenhaForm({...senhaForm, nova: e.target.value})} 
              className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Mín. 8 caracteres"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Nova Senha</label>
            <input 
              type="password" 
              value={senhaForm.confirma} 
              onChange={e => setSenhaForm({...senhaForm, confirma: e.target.value})} 
              className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
            />
          </div>

          {statusSenha && (
            <div className={`text-sm p-3 rounded-lg flex items-center gap-2 ${statusSenha.tipo === 'sucesso' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {statusSenha.tipo === 'sucesso' ? <CheckCircle size={16}/> : <AlertTriangle size={16}/>}
              {statusSenha.msg}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalSenhaAberto(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors">Cancelar</button>
            <button 
              type="submit" 
              disabled={loadingSenha || !senhaForm.atual || !senhaForm.nova} 
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {loadingSenha ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>} Alterar Senha
            </button>
          </div>
        </form>
      </Modal>

      {/* 3. Modal Excluir Conta */}
      <Modal isOpen={modalExcluirAberto} onClose={() => setModalExcluirAberto(false)} title="Exclusão de Conta">
        <div className="space-y-5">
          <div className="bg-red-50 border border-red-100 p-4 rounded-lg flex gap-3 text-red-800">
            <AlertTriangle className="shrink-0" size={24} />
            <div className="text-sm">
              <p className="font-bold mb-1">Tem certeza absoluta?</p>
              <p>Essa ação não pode ser desfeita. Isso excluirá permanentemente sua conta, histórico de estudos, ciclos e configurações.</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Digite sua senha para confirmar</label>
            <input 
              type="password" 
              autoFocus
              value={senhaExclusao}
              onChange={e => setSenhaExclusao(e.target.value)}
              className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              placeholder="Sua senha atual"
            />
          </div>

          {erroExclusao && (
            <div className="text-sm bg-red-100 text-red-800 p-3 rounded-lg flex items-center gap-2">
              <AlertTriangle size={16}/> {erroExclusao}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t">
            <button onClick={() => setModalExcluirAberto(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors">Manter minha conta</button>
            <button 
              onClick={handleExcluirConta} 
              disabled={loadingExclusao || !senhaExclusao}
              className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingExclusao ? <Loader2 size={16} className="animate-spin"/> : <Trash2 size={16}/>} 
              Sim, excluir tudo
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}