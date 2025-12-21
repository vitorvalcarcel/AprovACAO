import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '../services/api';

interface Usuario {
    id: number;
    nome: string;
    email: string;
    tutorialConcluido: boolean;
}

interface AuthContextData {
    user: Usuario | null;
    loading: boolean;
    refreshUser: () => Promise<void>;
    signOut: () => void;
    updateUserTutorialStatus: (status: boolean) => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<Usuario | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadStoragedData() {
            const token = localStorage.getItem('token');

            if (token) {
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                try {
                    const response = await api.get('/usuarios/me');
                    setUser(response.data);
                } catch (error) {
                    console.error("Erro ao buscar dados do usuário", error);
                    // Se der erro (ex: token inválido), desloga
                    signOut();
                }
            }
            setLoading(false);
        }

        loadStoragedData();
    }, []);

    async function refreshUser() {
        try {
            const response = await api.get('/usuarios/me');
            setUser(response.data);
        } catch (error) {
            console.error("Erro ao atualizar dados do usuário", error);
        }
    }

    function updateUserTutorialStatus(status: boolean) {
        if (user) {
            setUser({ ...user, tutorialConcluido: status });
        }
    }

    function signOut() {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('usuario'); // Limpa dados antigos se houver
        api.defaults.headers.common['Authorization'] = undefined;
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, loading, refreshUser, signOut, updateUserTutorialStatus }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
}
