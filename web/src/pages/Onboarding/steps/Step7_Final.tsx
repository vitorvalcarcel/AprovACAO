import { useState } from 'react';
import { ArrowLeft, CheckCircle, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import OnboardingLayout from '../../../components/Onboarding/OnboardingLayout';
import { useOnboarding } from '../../../contexts/OnboardingContext';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../services/api';

export default function Step6_Final() {
    const { prevStep } = useOnboarding();
    const { updateUserTutorialStatus } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleFinish = async () => {
        setLoading(true);
        try {
            // 1. Atualiza no Backend
            await api.patch('/usuarios/tutorial', { concluido: true });

            // 2. Atualiza no Contexto Global
            updateUserTutorialStatus(true);

            // 3. Redireciona para o App
            navigate('/app', { replace: true });
        } catch (error) {
            console.error("Erro ao finalizar tutorial", error);
            alert("Erro ao finalizar. Tente novamente.");
            setLoading(false);
        }
    };

    const educationContent = (
        <>
            <p><strong>Este projeto é construído com você.</strong></p>
            <p>Cada sugestão enviada é lida e considerada para as próximas atualizações.</p>
            <p>Se você sentir falta de algo ou encontrar um erro, por favor, nos avise!</p>
        </>
    );

    return (
        <OnboardingLayout
            stepTitle="Uma última coisa..."
            stepDescription="Antes de começar, precisamos da sua ajuda para tornar o AprovAção cada vez melhor."
            educationContent={educationContent}
        >
            <div className="space-y-8">

                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 p-8 rounded-2xl text-center space-y-4 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100 rounded-full blur-3xl -mr-10 -mt-10 opacity-50"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-100 rounded-full blur-2xl -ml-5 -mb-5 opacity-50"></div>

                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-indigo-600 mx-auto shadow-md relative z-10">
                        <MessageSquare size={32} />
                    </div>

                    <div className="relative z-10 space-y-2">
                        <h3 className="text-xl font-bold text-gray-800">Seu feedback define o futuro</h3>
                        <p className="text-gray-600 leading-relaxed max-w-lg mx-auto">
                            O AprovAção está em evolução constante. Queremos criar a melhor ferramenta de estudos para você.
                            <br /><br />
                            Ao encontrar qualquer problema ou ter uma ideia genial,
                            vá até <strong>Meu Perfil</strong> e use a área de <strong>Feedback</strong>.
                        </p>
                    </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex gap-4 items-start">
                    <div className="bg-green-100 p-2 rounded-lg text-green-700 shrink-0">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-green-800">Tudo pronto!</h4>
                        <p className="text-green-700 text-sm mt-1">
                            Seu ambiente de estudos foi configurado. Agora é só manter a constância e buscar sua nomeação.
                        </p>
                    </div>
                </div>

                <div className="flex justify-between pt-4">
                    <button
                        onClick={prevStep}
                        disabled={loading}
                        className="text-gray-500 hover:text-gray-700 font-bold px-4 py-2 flex items-center gap-2 disabled:opacity-50"
                    >
                        <ArrowLeft size={20} />
                        Voltar
                    </button>

                    <button
                        onClick={handleFinish}
                        disabled={loading}
                        className="group bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-bold transition-all flex items-center gap-3 shadow-lg shadow-green-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {loading ? 'Finalizando...' : 'Começar a usar'}
                        {!loading && <CheckCircle className="group-hover:scale-110 transition-transform" />}
                    </button>
                </div>
            </div>
        </OnboardingLayout>
    );
}
