import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Target } from 'lucide-react';
import OnboardingLayout from '../../../components/Onboarding/OnboardingLayout';
import { useOnboarding } from '../../../contexts/OnboardingContext';
import ConcursoForm from '../../../components/Forms/ConcursoForm';
import api from '../../../services/api';

export default function Step3_Ciclo() {
    const { nextStep, prevStep } = useOnboarding();
    const [concursos, setConcursos] = useState<any[]>([]);

    const carregarConcursos = async () => {
        try {
            const res = await api.get('/concursos');
            setConcursos(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        carregarConcursos();
    }, []);

    const educationContent = (
        <>
            <p>O <strong>Concurso</strong> agrupa as matérias. É aqui que você define o peso e a quantidade de questões de cada uma, com base no seu edital.</p>
            <p>O <strong>Ciclo</strong> é calculado automaticamente usando esses pesos, criando uma rotação de estudo equilibrada.</p>
            <p>Você pode ter vários concursos, mas apenas um Ciclo Ativo por vez.</p>
        </>
    );

    return (
        <OnboardingLayout
            stepTitle="Concursos e Ciclo"
            stepDescription="Configure seu foco e deixe o sistema organizar sua rotina."
            educationContent={educationContent}
        >
            <div className="space-y-6">

                {concursos.length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 animate-fade-in-down">
                        <CheckCircle className="text-green-600" size={20} />
                        <div>
                            <p className="font-bold text-green-800">Objetivo Definido!</p>
                            <p className="text-sm text-green-600">{concursos[0].nome} cadastrado.</p>
                        </div>
                    </div>
                )}

                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <Target size={18} className="text-blue-500" /> Novo Concurso
                    </h3>
                    <ConcursoForm
                        onSuccess={() => { carregarConcursos(); }}
                    />
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <button
                        onClick={prevStep}
                        className="text-gray-500 hover:text-gray-900 flex items-center gap-2 font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <ArrowLeft size={18} /> Voltar
                    </button>

                    <button
                        onClick={nextStep}
                        disabled={concursos.length === 0}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Continuar
                    </button>
                </div>
            </div>
        </OnboardingLayout>
    );
}
