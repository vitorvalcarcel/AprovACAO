import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

// Tipagem estrita para os dados do fluxo
interface OnboardingData {
    hasMateria?: boolean;
    hasConcurso?: boolean;
    cicloGerado?: boolean;
    [key: string]: string | number | boolean | undefined; // Flexibilidade controlada
}

interface OnboardingContextData {
    currentStep: number;
    totalSteps: number;
    nextStep: () => void;
    prevStep: () => void;
    goToStep: (step: number) => void;
    resetTutorial: () => void;
    isFirstStep: boolean;
    isLastStep: boolean;
    stepsData: OnboardingData;
    updateStepData: (key: keyof OnboardingData, value: any) => void;
}

const OnboardingContext = createContext<OnboardingContextData>({} as OnboardingContextData);

export function OnboardingProvider({ children }: { children: ReactNode }) {
    // Inicializa lendo do storage ou padrão 1
    const [currentStep, setCurrentStep] = useState(() => {
        const stored = sessionStorage.getItem('onboarding_step');
        return stored ? Number(stored) : 1;
    });

    const [stepsData, setStepsData] = useState<OnboardingData>({});

    // 1: Intro
    // 2: Matérias
    // 3: Concursos/Ciclo
    // 4: Vincular (Novo)
    // 5: Registro
    // 6: Tipos de Estudo
    // 7: Final
    const totalSteps = 7;

    // Persistência automática ao mudar de passo
    useEffect(() => {
        sessionStorage.setItem('onboarding_step', String(currentStep));
    }, [currentStep]);

    function nextStep() {
        if (currentStep < totalSteps) {
            setCurrentStep(prev => prev + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    function prevStep() {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
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
        sessionStorage.removeItem('onboarding_step');
    }

    function updateStepData(key: keyof OnboardingData, value: any) {
        setStepsData((prev) => ({ ...prev, [key]: value }));
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
