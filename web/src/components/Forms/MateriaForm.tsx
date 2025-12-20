import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../Toast/ToastContext';

interface Materia {
    id: number;
    nome: string;
}

interface MateriaFormProps {
    materiaEdicao?: Materia | null;
    onSuccess: (materia: Materia) => void;
    onCancel?: () => void;
}

export default function MateriaForm({ materiaEdicao, onSuccess, onCancel }: MateriaFormProps) {
    const { showToast } = useToast();
    const [nome, setNome] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (materiaEdicao) {
            setNome(materiaEdicao.nome);
        } else {
            setNome('');
        }
    }, [materiaEdicao]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nome.trim()) return;

        setLoading(true);
        try {
            let res;
            if (materiaEdicao) {
                res = await api.put('/materias', { id: materiaEdicao.id, nome });
                showToast('success', 'Matéria atualizada!');
            } else {
                res = await api.post('/materias', { nome });
                showToast('success', 'Matéria criada!');
            }
            onSuccess(res.data);
            setNome('');
        } catch (error: any) {
            showToast('error', 'Erro', error.response?.data?.mensagem || "Erro ao salvar.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Matéria</label>
                <input
                    autoFocus
                    placeholder="Ex: Português, Direito Constitucional..."
                    value={nome}
                    onChange={e => setNome(e.target.value)}
                    className="w-full border border-gray-300 p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
            </div>
            <div className="flex justify-end gap-2 pt-2">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="text-gray-500 px-4 py-2 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
                    >
                        Cancelar
                    </button>
                )}
                <button
                    type="submit"
                    disabled={loading || !nome.trim()}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
                >
                    {loading ? 'Salvando...' : 'Salvar'}
                </button>
            </div>
        </form>
    );
}
