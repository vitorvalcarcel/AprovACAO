import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Book } from 'lucide-react';
import OnboardingLayout from '../../../components/Onboarding/OnboardingLayout';
import { useOnboarding } from '../../../contexts/OnboardingContext';
import MateriaForm from '../../../components/Forms/MateriaForm';
import api from '../../../services/api';

export default function Step2_Materias() {
    const { nextStep, prevStep, updateStepData } = useOnboarding();
    const [materias, setMaterias] = useState<any[]>([]);

    const carregarMaterias = async () => {
        try {
            const res = await api.get('/materias');
            setMaterias(res.data);
            if (res.data.length > 0) {
                updateStepData('hasMateria', true);
            }
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        carregarMaterias();
    }, []);

    const educationContent = (
        <>
            <p>Cadastrando suas matérias agora, o sistema já começa a aprender sobre o que você precisa estudar.</p>
            <p>Você pode adicionar quantas quiser. Vamos começar com pelo menos uma para prosseguir.</p>
        </>
    );

    return (
        <OnboardingLayout
            stepTitle="Suas Matérias"
            stepDescription="Cadastre agora a primeira matéria que você está estudando. Isso é essencial para montarmos seu ciclo."
            educationContent={educationContent}
        >
            <div className="space-y-6">

                {/* LISTA SIMPLIFICADA */}
                {materias.length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 animate-fade-in-down">
                        <CheckCircle className="text-green-600" size={20} />
                        <div>
                            <p className="font-bold text-green-800">Você já tem {materias.length} matéria(s) cadastrada(s)!</p>
                            <p className="text-sm text-green-600">Pode adicionar mais ou continuar.</p>
                        </div>
                    </div>
                )}

                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <Book size={18} className="text-blue-500" /> Nova Matéria
                    </h3>
                    <MateriaForm
                        onSuccess={() => carregarMaterias()}
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
                        disabled={materias.length === 0}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Continuar
                    </button>
                </div>
            </div>
        </OnboardingLayout>
    );
}
