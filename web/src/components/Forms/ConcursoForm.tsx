import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../Toast/ToastContext';
import { AlertCircle } from 'lucide-react';

interface Concurso {
    id: number;
    nome: string;
    banca?: string;
    dataProva?: string;
}

interface ConcursoFormProps {
    concursoEdicao?: Concurso | null; // Can be partial if creating
    onSuccess: (concurso: Concurso) => void;
    onCancel?: () => void;
}

export default function ConcursoForm({ concursoEdicao, onSuccess, onCancel }: ConcursoFormProps) {
    const { showToast } = useToast();
    const [form, setForm] = useState({ nome: '', banca: '', dataProva: '' });
    const [erroForm, setErroForm] = useState('');
    const [salvando, setSalvando] = useState(false);

    useEffect(() => {
        if (concursoEdicao) {
            setForm({
                nome: concursoEdicao.nome || '',
                banca: concursoEdicao.banca || '',
                dataProva: concursoEdicao.dataProva || ''
            });
        } else {
            setForm({ nome: '', banca: '', dataProva: '' });
        }
    }, [concursoEdicao]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.nome.trim()) return;
        setSalvando(true);
        setErroForm('');

        try {
            const payload = { nome: form.nome, banca: form.banca || null, dataProva: form.dataProva || null };
            let res;
            if (concursoEdicao && concursoEdicao.id) {
                res = await api.put('/concursos', { id: concursoEdicao.id, ...payload });
                showToast('success', 'Concurso atualizado!');
            } else {
                res = await api.post('/concursos', payload);
                showToast('success', 'Concurso criado!');
            }
            onSuccess(res.data); // Backend returns the full entity? Assuming yes or handled by parent reload
        } catch (error: any) {
            setErroForm(error.response?.data?.mensagem || 'Erro ao salvar.');
        } finally {
            setSalvando(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Concurso *</label>
                <input
                    autoFocus
                    type="text"
                    value={form.nome}
                    onChange={e => setForm({ ...form, nome: e.target.value })}
                    placeholder="Ex: Polícia Federal"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Banca</label>
                    <input
                        type="text"
                        value={form.banca}
                        onChange={e => setForm({ ...form, banca: e.target.value })}
                        placeholder="Ex: Cebraspe"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data da Prova</label>
                    <input
                        type="date"
                        value={form.dataProva}
                        onChange={e => setForm({ ...form, dataProva: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                    />
                </div>
            </div>

            {erroForm && (
                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2 animate-pulse">
                    <AlertCircle size={16} /> {erroForm}
                </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                    >
                        Cancelar
                    </button>
                )}
                <button
                    type="submit"
                    disabled={salvando || !form.nome.trim()}
                    className="px-6 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold disabled:opacity-50 shadow-sm transition-all"
                >
                    {salvando ? 'Salvando...' : 'Salvar'}
                </button>
            </div>
        </form>
    );
}
