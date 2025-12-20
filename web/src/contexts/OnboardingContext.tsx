import { createContext, useContext, useState, type ReactNode } from 'react';

interface OnboardingContextData {
    currentStep: number;
    totalSteps: number;
    nextStep: () => void;
    prevStep: () => void;
    goToStep: (step: number) => void;
    resetTutorial: () => void;
    isFirstStep: boolean;
    isLastStep: boolean;
    stepsData: any;
    updateStepData: (key: string, value: any) => void;
}

const OnboardingContext = createContext<OnboardingContextData>({} as OnboardingContextData);

export function OnboardingProvider({ children }: { children: ReactNode }) {
    const [currentStep, setCurrentStep] = useState(1);
    const [stepsData, setStepsData] = useState<any>({});

    // Total de passos definido no roteiro: 7 passos (Atualizado com passo de vínculo)
    // 1: Introdução/Metodologia
    // 2: Matérias e Tópicos (Interativo)
    // 3: Concursos (Interativo)
    // 4: Vincular Matérias e Ciclo (Novo)
    // 5: Registro de Estudos
    // 6: Tipos de Estudo
    // 7: Final
    const totalSteps = 7;

    function nextStep() {
        if (currentStep < totalSteps) {
            setCurrentStep(prev => prev + 1);
        }
    }

    function prevStep() {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    }

    function goToStep(step: number) {
        if (step >= 1 && step <= totalSteps) {
            setCurrentStep(step);
        }
    }

    function resetTutorial() {
        setCurrentStep(1);
        setStepsData({});
    }

    function updateStepData(key: string, value: any) {
        setStepsData((prev: any) => ({ ...prev, [key]: value }));
    }

    return (
        <OnboardingContext.Provider value={{
            currentStep,
            totalSteps,
            nextStep,
            prevStep,
            goToStep,
            resetTutorial,
            isFirstStep: currentStep === 1,
            isLastStep: currentStep === totalSteps,
            stepsData,
            updateStepData
        }}>
            {children}
        </OnboardingContext.Provider>
    );
}

export function useOnboarding() {
    const context = useContext(OnboardingContext);
    if (!context) {
        throw new Error('useOnboarding deve ser usado dentro de um OnboardingProvider');
    }
    return context;
}
