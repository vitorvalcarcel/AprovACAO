import { useOnboarding } from '../../contexts/OnboardingContext';
import Step1_Intro from './steps/Step1_Intro';
import Step2_Materias from './steps/Step2_Materias';
import Step3_Ciclo from './steps/Step3_Ciclo';
import Step4_Vincular from './steps/Step4_Vincular';
import Step4_Registro from './steps/Step4_Registro';
import Step5_TiposEstudo from './steps/Step5_TiposEstudo';
import Step6_Final from './steps/Step6_Final';

export default function Onboarding() {
    const { currentStep } = useOnboarding();

    return (
        <>
            {currentStep === 1 && <Step1_Intro />}
            {currentStep === 2 && <Step2_Materias />}
            {currentStep === 3 && <Step3_Ciclo />}
            {currentStep === 4 && <Step4_Vincular />}
            {currentStep === 5 && <Step4_Registro />}
            {currentStep === 6 && <Step5_TiposEstudo />}
            {currentStep === 7 && <Step6_Final />}
        </>
    );
}
