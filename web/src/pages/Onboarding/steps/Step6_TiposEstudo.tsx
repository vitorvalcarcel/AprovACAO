import { ArrowRight, ArrowLeft, ToggleLeft, BookOpen, PenTool } from 'lucide-react';
import OnboardingLayout from '../../../components/Onboarding/OnboardingLayout';
import { useOnboarding } from '../../../contexts/OnboardingContext';

export default function Step5_TiposEstudo() {
    const { nextStep, prevStep } = useOnboarding();

    const educationContent = (
        <>
            <p>Aqui está o "pulo do gato" da nossa metodologia.</p>
            <p>Horas de <strong>Teoria</strong> (PDF, Vídeo-aula) descontam da meta do seu ciclo.</p>
            <p>Horas de <strong>Prática</strong> (Questões) NÃO descontam da meta de horas, apenas da meta de questões!</p>
            <p>Isso garante que você não "engane" o ciclo fazendo apenas exercícios rápidos quando deveria estar avançando na teoria.</p>
        </>
    );

    return (
        <OnboardingLayout
            stepTitle="Tipos de Estudo"
            stepDescription="Entenda a diferença entre Estudo Teórico e Prático no ciclo."
            educationContent={educationContent}
        >
            <div className="space-y-6">

                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-3">
                        <ToggleLeft size={32} className="text-gray-400" />
                        <h3 className="font-bold text-gray-800">A opção "Contabilizar no Ciclo"</h3>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                        Ao criar um <strong>Tipo de Estudo</strong> (ex: "Videoaula", "PDF", "Questões"), você define se ele "Contabiliza horas no ciclo" ou não.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex flex-col gap-2">
                        <div className="flex items-center gap-2 font-bold text-blue-700">
                            <BookOpen size={18} />
                            Teoria
                        </div>
                        <p className="text-xs text-blue-600">
                            Videoaulas, Leitura de PDF, Doutrina.
                        </p>
                        <div className="mt-auto pt-2 text-xs font-bold text-blue-800 uppercase">
                            ✔ Abate Horas do Ciclo
                        </div>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 flex flex-col gap-2">
                        <div className="flex items-center gap-2 font-bold text-purple-700">
                            <PenTool size={18} />
                            Questões / Prática
                        </div>
                        <p className="text-xs text-purple-600">
                            Resolução de exercícios, simulados.
                        </p>
                        <div className="mt-auto pt-2 text-xs font-bold text-purple-800 uppercase">
                            ❌ Não Abate Horas (Só Questões)
                        </div>
                    </div>
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
