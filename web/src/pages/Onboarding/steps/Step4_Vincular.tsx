
import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, PlayCircle, BookOpen } from 'lucide-react';
import OnboardingLayout from '../../../components/Onboarding/OnboardingLayout';
import { useOnboarding } from '../../../contexts/OnboardingContext';
import ConcursoCard, { type Concurso } from '../../../components/Cards/ConcursoCard';
import ModalDisciplinas from '../../../components/ModalDisciplinas';
import ModalGerarCiclo from '../../../components/ModalGerarCiclo';
import api from '../../../services/api';

export default function Step4_Vincular() {
    const { nextStep, prevStep } = useOnboarding();
    const [concursos, setConcursos] = useState<Concurso[]>([]);

    const [modalDisciplinasAberto, setModalDisciplinasAberto] = useState(false);
    const [modalCicloAberto, setModalCicloAberto] = useState(false);
    const [concursoSelecionado, setConcursoSelecionado] = useState<Concurso | null>(null);
    const [cicloGerado, setCicloGerado] = useState(false);

    const carregarConcursos = async () => {
        try {
            const res = await api.get<Concurso[]>('/concursos');
            setConcursos(res.data);
            if (res.data.length > 0) {
                // Seleciona automaticamente o primeiro concurso se nenhum estiver selecionado
                if (!concursoSelecionado) setConcursoSelecionado(res.data[0]);
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        carregarConcursos();
    }, []);

    // Função auxiliar para abrir os modais corretamente a partir do Card
    const handleOpenDisciplinas = (concurso: Concurso) => {
        setConcursoSelecionado(concurso);
        setModalDisciplinasAberto(true);
    };

    const handleOpenCiclo = (concurso: Concurso) => {
        setConcursoSelecionado(concurso);
        setModalCicloAberto(true);
    };

    const handleCicloSuccess = () => {
        setCicloGerado(true);
        setModalCicloAberto(false);
        carregarConcursos(); // Recarrega para garantir dados frescos
    };

    const educationContent = (
        <>
            <p>1. Clique no botão de <strong>Disciplinas</strong> <BookOpen size={14} className="inline" /> do seu concurso para vincular as matérias que você criou.</p>
            <p>2. Defina o <strong>Peso</strong> de cada uma (ex: Peso 2 para Específicas).</p>
            <p>3. Depois, clique em <strong>Gerar Ciclo</strong> <PlayCircle size={14} className="inline" /> e defina suas horas semanais.</p>
        </>
    );

    return (
        <OnboardingLayout
            stepTitle="Vinculando e Gerando Ciclo"
            stepDescription="Agora vamos conectar tudo. Vincule as matérias ao seu concurso e gere seu primeiro ciclo de estudos."
            educationContent={educationContent}
        >
            <div className="space-y-6">

                {concursos.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 rounded-xl">
                        <p className="text-gray-500">Nenhum concurso encontrado. Volte ao passo anterior.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-100">
                            👇 Aqui está o concurso que você criou. Use os botões roxo e verde nele!
                        </p>

                        {/* Exibimos apenas o primeiro concurso para focar a atenção, ou o selecionado */}
                        <ConcursoCard
                            concurso={concursos[0]}
                            onEdit={() => { }} // Desabilitado no tutorial para simplificar
                            onArchive={() => { }}
                            onDelete={() => { }}
                            onOpenDisciplinas={() => handleOpenDisciplinas(concursos[0])}
                            onOpenCiclo={() => handleOpenCiclo(concursos[0])}
                        />
                    </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <button
                        onClick={prevStep}
                        className="text-gray-500 hover:text-gray-900 flex items-center gap-2 font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <ArrowLeft size={18} /> Voltar
                    </button>

                    <button
                        onClick={nextStep}
                        disabled={!cicloGerado}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        title={!cicloGerado ? "Gere o ciclo primeiro!" : ""}
                    >
                        Continuar <ArrowRight size={18} />
                    </button>
                </div>
            </div>

            <ModalDisciplinas
                isOpen={modalDisciplinasAberto}
                onClose={() => setModalDisciplinasAberto(false)}
                concurso={concursoSelecionado}
            />

            <ModalGerarCiclo
                isOpen={modalCicloAberto}
                onClose={() => setModalCicloAberto(false)}
                onSuccess={handleCicloSuccess}
                concurso={concursoSelecionado}
            />
        </OnboardingLayout>
    );
}

