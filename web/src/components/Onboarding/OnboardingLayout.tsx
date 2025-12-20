import { CheckCircle, Circle, ChevronRight, X, Info } from 'lucide-react';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useState } from 'react';
import Modal from '../Modal';

interface OnboardingLayoutProps {
    children: React.ReactNode;
    stepTitle: string;
    stepDescription?: string;
    educationContent?: React.ReactNode;
}

export default function OnboardingLayout({
    children,
    stepTitle,
    stepDescription,
    educationContent
}: OnboardingLayoutProps) {
    const { currentStep, totalSteps, isLastStep } = useOnboarding();
    const { updateUserTutorialStatus } = useAuth();
    const navigate = useNavigate();
    const [isInfoOpen, setIsInfoOpen] = useState(false);

    const handleSkip = async () => {
        try {
            await api.patch('/usuarios/tutorial', { concluido: true });
            updateUserTutorialStatus(true);
            navigate('/');
        } catch (error) {
            console.error(error);
        }
    };

    // Calcula progresso (para mobile principalmente)
    const progressPercent = (currentStep / totalSteps) * 100;

    return (
        <div className="bg-white min-h-screen md:bg-gray-50 md:flex md:items-center md:justify-center md:p-4">
            <div className="w-full min-h-screen md:min-h-0 md:h-[85vh] md:max-w-7xl bg-white md:rounded-3xl md:shadow-2xl md:overflow-hidden flex flex-col md:flex-row md:border md:border-gray-100">

                {/* COLUNA ESQUERDA: Progresso (Hidden on Mobile) */}
                <div className="hidden md:flex w-72 bg-gradient-to-b from-gray-50 to-white border-r border-gray-100 flex-col p-8 z-10">
                    <div className="mb-10 flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500">
                                Bem-vindo
                            </h1>
                            <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mt-1">Setup Inicial</p>
                        </div>
                        <button onClick={handleSkip} className="text-gray-400 hover:text-gray-600 text-xs font-medium hover:underline flex items-center gap-1" title="Pular Tutorial">
                            Pular <ChevronRight size={12} />
                        </button>
                    </div>

                    <div className="flex-1 space-y-6">
                        {Array.from({ length: totalSteps }).map((_, idx) => {
                            const stepNum = idx + 1;
                            const isCompleted = stepNum < currentStep;
                            const isActive = stepNum === currentStep;

                            return (
                                <div key={stepNum} className={`flex items-center gap-4 transition-all duration-300 ${isActive ? 'translate-x-2' : ''}`}>
                                    <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors
                    ${isCompleted ? 'bg-green-500 border-green-500 text-white' : ''}
                    ${isActive ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200' : ''}
                    ${!isCompleted && !isActive ? 'bg-white border-gray-200 text-gray-300' : ''}
                  `}>
                                        {isCompleted ? <CheckCircle size={16} /> : stepNum}
                                    </div>
                                    <div className={`text-sm font-medium transition-colors ${isActive ? 'text-gray-800' : 'text-gray-400'}`}>
                                        Passo {stepNum}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-auto pt-6 border-t border-gray-100">
                        <div className="text-xs text-gray-400 font-medium flex justify-between mb-2">
                            <span>Progresso Total</span>
                            <span>{Math.round(progressPercent)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
                        </div>
                    </div>
                </div>

                {/* COLUNA CENTRAL: Ação (Conteúdo Principal) */}
                <div className="flex-1 flex flex-col bg-white relative">

                    {/* Mobile Header (Progress) - Sticky at top */}
                    <div className="md:hidden p-4 border-b border-gray-100 sticky top-0 bg-white z-20">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="font-bold text-gray-800">Passo {currentStep} <span className="text-gray-400 font-normal">de {totalSteps}</span></h2>
                            <div className="flex items-center gap-3">
                                {educationContent && (
                                    <button
                                        onClick={() => setIsInfoOpen(true)}
                                        className="text-indigo-600 bg-indigo-50 p-1.5 rounded-full hover:bg-indigo-100 transition-colors animate-pulse"
                                        title="Por que isso é importante?"
                                    >
                                        <Info size={18} />
                                    </button>
                                )}
                                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{Math.round(progressPercent)}%</span>
                                <button onClick={handleSkip} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                            </div>
                        </div>
                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
                        </div>
                    </div>

                    <div className="p-5 pb-20 md:p-12 md:flex-1 md:overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-200">
                        <div className="max-w-2xl mx-auto w-full">
                            <div className="mb-6 md:mb-8">
                                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{stepTitle}</h2>
                                {stepDescription && <p className="text-gray-500 text-lg leading-relaxed">{stepDescription}</p>}
                            </div>

                            <div className="animate-fade-in-up">
                                {children}
                            </div>
                        </div>
                    </div>
                </div>

                {/* COLUNA DIREITA: Educação (Hidden on Mobile) */}
                {educationContent && (
                    <div className="hidden xl:flex w-80 bg-gray-50 border-l border-gray-100 flex-col p-8 overflow-y-auto">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-0">
                            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-4">
                                <Circle size={20} className="fill-indigo-600 text-indigo-600" />
                            </div>
                            <h3 className="font-bold text-gray-800 mb-2">Por que isso é importante?</h3>
                            <div className="text-sm text-gray-600 leading-relaxed gap-y-4 flex flex-col">
                                {educationContent}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile Education Modal */}
            <Modal
                isOpen={isInfoOpen}
                onClose={() => setIsInfoOpen(false)}
                title="Por que isso é importante?"
                className="md:hidden"
            >
                <div className="space-y-4 text-gray-600 leading-relaxed">
                    <div className="flex justify-center mb-4">
                        <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                            <Circle size={24} className="fill-indigo-600 text-indigo-600" />
                        </div>
                    </div>
                    {educationContent}
                    <button
                        onClick={() => setIsInfoOpen(false)}
                        className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl mt-6 hover:bg-indigo-700"
                    >
                        Entendi
                    </button>
                </div>
            </Modal>
        </div>
    );
}
