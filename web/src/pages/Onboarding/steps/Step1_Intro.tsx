import { ArrowRight, BookOpen } from 'lucide-react';
import OnboardingLayout from '../../../components/Onboarding/OnboardingLayout';
import { useOnboarding } from '../../../contexts/OnboardingContext';

export default function Step1_Intro() {
    const { nextStep } = useOnboarding();

    const educationContent = (
        <>
            <p>O método do <strong>Ciclo de Estudos</strong> é uma forma dinâmica de estudar, onde você não fixa horários rígidos para cada matéria (como "segunda às 14h"), mas sim uma sequência de disciplinas.</p>
            <p>Isso permite flexibilidade: se você tiver um imprevisto, simplesmente continua de onde parou, sem "perder" o dia de estudo daquela matéria.</p>
        </>
    );

    return (
        <OnboardingLayout
            stepTitle="Bem-vindo ao AprovAção"
            stepDescription="Vamos configurar sua conta para que você possa aproveitar ao máximo nossa metodologia baseada em ciclos."
            educationContent={educationContent}
        >
            <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
                    <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                        <BookOpen size={20} />
                        Metodologia
                    </h3>
                    <p className="text-blue-700 leading-relaxed mb-4">
                        Nosso sistema é focado em <strong>Ciclos de Estudo</strong> e <strong>Contabilização de Horas Líquidas</strong>.
                    </p>
                    <ul className="space-y-2 text-blue-800 text-sm">
                        <li className="flex items-start gap-2">
                            <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
                            Você cadastra suas matérias e o peso de cada uma.
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
                            O sistema gera um ciclo (sequência) ideal pra você.
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
                            Você registra o que estudou e o sistema ajusta o ciclo automaticamente.
                        </li>
                    </ul>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        onClick={nextStep}
                        className="group bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold transition-all flex items-center gap-3 shadow-lg shadow-blue-200"
                    >
                        Vamos começar
                        <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </OnboardingLayout>
    );
}
