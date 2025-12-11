import { useState, useEffect } from 'react';
import { User, Lock, Trash2, Save, AlertTriangle, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Modal from '../components/Modal';

export default function Perfil() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState({ nome: '', email: '' });
  const [loading, setLoading] = useState(true);

  // Estados de Edição
  const [modalNomeAberto, setModalNomeAberto] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  
  const [modalSenhaAberto, setModalSenhaAberto] = useState(false);
  const [senhaForm, setSenhaForm] = useState({ atual: '', nova: '', confirma: '' });
  const [erroSenha, setErroSenha] = useState('');

  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);

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
      setLoading(false);
    }
  };

  const salvarNome = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/usuarios', { nome: novoNome });
      setModalNomeAberto(false);
      carregarUsuario();
      // Atualiza o localStorage para o header pegar o novo nome
      const userStorage = JSON.parse(localStorage.getItem('usuario') || '{}');
      localStorage.setItem('usuario', JSON.stringify({ ...userStorage, nome: novoNome }));
      window.dispatchEvent(new Event('storage')); // Força atualização se houver listener
    } catch (e) { alert('Erro ao salvar nome.'); }
  };

  const salvarSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroSenha('');

    if (senhaForm.nova !== senhaForm.confirma) {
      setErroSenha('As novas senhas não conferem.');
      return;
    }

    try {
      await api.patch('/usuarios/senha', {
        senhaAtual: senhaForm.atual,
        novaSenha: senhaForm.nova
      });
      alert('Senha alterada com sucesso!');
      setModalSenhaAberto(false);
      setSenhaForm({ atual: '', nova: '', confirma: '' });
    } catch (error: any) {
      setErroSenha(error.response?.data || 'Erro ao alterar senha.');
    }
  };

  const excluirConta = async () => {
    try {
      await api.delete('/usuarios');
      alert('Sua conta foi excluída. Sentiremos sua falta!');
      localStorage.clear();
      navigate('/login');
    } catch (e) { alert('Erro ao excluir conta.'); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-10">
      
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Minha Conta</h1>
        <p className="text-sm text-gray-500">Gerencie seus dados e segurança</p>
      </div>

      {/* 1. DADOS PESSOAIS */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
          <User className="text-blue-600" size={20} />
          <h2 className="font-bold text-gray-700">Dados Pessoais</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Nome de Exibição</label>
            <div className="flex items-center gap-4">
              <span className="text-gray-800 font-medium text-lg">{usuario.nome}</span>
              <button onClick={() => setModalNomeAberto(true)} className="text-sm text-blue-600 hover:underline">Editar</button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">E-mail (Login)</label>
            <div className="text-gray-600">{usuario.email}</div>
            <p className="text-xs text-gray-400 mt-1">O e-mail não pode ser alterado.</p>
          </div>
        </div>
      </div>

      {/* 2. SEGURANÇA */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
          <Lock className="text-green-600" size={20} />
          <h2 className="font-bold text-gray-700">Segurança</h2>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800">Senha</p>
              <p className="text-sm text-gray-500">Recomendamos usar uma senha forte e única.</p>
            </div>
            <button onClick={() => setModalSenhaAberto(true)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
              Alterar Senha
            </button>
          </div>
        </div>
      </div>

      {/* 3. ZONA DE PERIGO */}
      <div className="bg-red-50 rounded-xl border border-red-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-red-100 bg-red-100/50 flex items-center gap-2">
          <AlertTriangle className="text-red-600" size={20} />
          <h2 className="font-bold text-red-700">Zona de Perigo</h2>
        </div>
        <div className="p-6 flex items-center justify-between">
          <div>
            <p className="font-medium text-red-800">Excluir Conta</p>
            <p className="text-sm text-red-600/80">Esta ação é permanente e não pode ser desfeita.</p>
          </div>
          <button onClick={() => setModalExcluirAberto(true)} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors flex items-center gap-2">
            <Trash2 size={16} /> Excluir
          </button>
        </div>
      </div>

      {/* --- MODAIS --- */}

      {/* Editar Nome */}
      <Modal isOpen={modalNomeAberto} onClose={() => setModalNomeAberto(false)} title="Editar Nome">
        <form onSubmit={salvarNome}>
          <input autoFocus value={novoNome} onChange={e => setNovoNome(e.target.value)} className="w-full border p-2 rounded mb-4" />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setModalNomeAberto(false)} className="text-gray-500 px-3">Cancelar</button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded">Salvar</button>
          </div>
        </form>
      </Modal>

      {/* Trocar Senha */}
      <Modal isOpen={modalSenhaAberto} onClose={() => setModalSenhaAberto(false)} title="Alterar Senha">
        <form onSubmit={salvarSenha} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Senha Atual</label>
            <input type="password" value={senhaForm.atual} onChange={e => setSenhaForm({...senhaForm, atual: e.target.value})} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Nova Senha</label>
            <input type="password" value={senhaForm.nova} onChange={e => setSenhaForm({...senhaForm, nova: e.target.value})} className="w-full border p-2 rounded" />
            <p className="text-xs text-gray-400 mt-1">Mínimo 8 caracteres, maiúscula, minúscula, número e símbolo.</p>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Confirmar Nova Senha</label>
            <input type="password" value={senhaForm.confirma} onChange={e => setSenhaForm({...senhaForm, confirma: e.target.value})} className="w-full border p-2 rounded" />
          </div>
          
          {erroSenha && <div className="text-red-600 text-sm bg-red-50 p-2 rounded">{erroSenha}</div>}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalSenhaAberto(false)} className="text-gray-500 px-3">Cancelar</button>
            <button className="bg-green-600 text-white px-4 py-2 rounded font-bold">Alterar Senha</button>
          </div>
        </form>
      </Modal>

      {/* Confirmar Exclusão */}
      <Modal isOpen={modalExcluirAberto} onClose={() => setModalExcluirAberto(false)} title="Tem certeza absoluta?">
        <div className="space-y-4">
          <p className="text-gray-600">
            Isso irá apagar <strong>todos</strong> os seus dados: ciclos, histórico, matérias e estatísticas. 
            <br/><br/>
            <span className="font-bold text-red-600">Não há como desfazer.</span>
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setModalExcluirAberto(false)} className="px-4 py-2 border rounded text-gray-600">Manter Conta</button>
            <button onClick={excluirConta} className="px-4 py-2 bg-red-600 text-white rounded font-bold hover:bg-red-700">Sim, excluir tudo</button>
          </div>
        </div>
      </Modal>

    </div>
  );
}