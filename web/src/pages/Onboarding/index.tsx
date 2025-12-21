import { useOnboarding } from '../../contexts/OnboardingContext';
import Step1_Intro from './steps/Step1_Intro';
import Step2_Materias from './steps/Step2_Materias';
import Step3_Ciclo from './steps/Step3_Ciclo';
import Step4_Vincular from './steps/Step4_Vincular';
import Step5_Registro from './steps/Step5_Registro';
import Step6_TiposEstudo from './steps/Step6_TiposEstudo';
import Step7_Final from './steps/Step7_Final';

export default function Onboarding() {
    const { currentStep } = useOnboarding();

    return (
        <>
            {currentStep === 1 && <Step1_Intro />}
            {currentStep === 2 && <Step2_Materias />}
            {currentStep === 3 && <Step3_Ciclo />}
            {currentStep === 4 && <Step4_Vincular />}
            {currentStep === 5 && <Step5_Registro />}
            {currentStep === 6 && <Step6_TiposEstudo />}
            {currentStep === 7 && <Step7_Final />}
        </>
    );
}
