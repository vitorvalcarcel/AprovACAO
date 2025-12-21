import { ArrowRight, ArrowLeft, Clock } from 'lucide-react';
import OnboardingLayout from '../../../components/Onboarding/OnboardingLayout';
import { useOnboarding } from '../../../contexts/OnboardingContext';

export default function Step4_Registro() {
    const { nextStep, prevStep } = useOnboarding();

    const educationContent = (
        <>
            <p>Registrar seus estudos é fundamental para alimentar as estatísticas e atualizar o ciclo.</p>
            <p>Se você registrar uma matéria que está no seu Ciclo Ativo, o sistema desconta automaticamente do seu "saldo" daquela matéria.</p>
            <p>Você não precisa selecionar o Concurso na hora de registrar, basta selecionar a Matéria.</p>
        </>
    );

    return (
        <OnboardingLayout
            stepTitle="Registro de Estudos"
            stepDescription="Duas formas simples de acompanhar sua evolução."
            educationContent={educationContent}
        >
            <div className="space-y-6">

                <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Clock size={20} className="text-blue-500" />
                        Como registrar?
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
                            <div className="text-2xl">⏱️</div>
                            <div>
                                <h4 className="font-bold text-gray-700">Cronômetro</h4>
                                <p className="text-sm text-gray-600">Dê o play quando começar. Ao pausar/parar, o tempo é salvo automaticamente.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
                            <div className="text-2xl">📝</div>
                            <div>
                                <h4 className="font-bold text-gray-700">Manual</h4>
                                <p className="text-sm text-gray-600">Esqueceu de ligar o timer? Sem problemas. Adicione o tempo manualmente depois.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl text-yellow-800 text-sm">
                    <strong>Importante:</strong> Ao registrar "Questões", elas contam para seu histórico e estatísticas de acerto, mas o tempo gasto nelas tem uma regra especial que veremos a seguir.
                </div>

                <div className="flex justify-between pt-8">
                    <button
                        onClick={prevStep}
                        className="text-gray-500 hover:text-gray-700 font-bold px-4 py-2 flex items-center gap-2"
                    >
                        <ArrowLeft size={20} />
                        Voltar
                    </button>

                    <button
                        onClick={nextStep}
                        className="group bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold transition-all flex items-center gap-3 shadow-lg shadow-blue-200"
                    >
                        Entendi, próximo
                        <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </OnboardingLayout>
    );
}
