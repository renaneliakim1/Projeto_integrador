import axios from 'axios';

// Detecta se está acessando via rede local (192.168.x.x) ou localhost
const getBaseURL = () => {
    const hostname = window.location.hostname;
    
    // Se tiver variável de ambiente configurada, usa ela (produção)
    if (import.meta.env.VITE_API_URL) {
        console.log('☁️ Modo Produção - Base URL:', import.meta.env.VITE_API_URL);
        return import.meta.env.VITE_API_URL;
    }
    
    // 🌐 Apenas rede WiFi local (192.168.x.x e 10.x.x.x)
    // Ignora IPs do WSL/Docker (172.x.x.x)
    if (hostname.startsWith('192.168') || hostname.startsWith('10.')) {
        const baseURL = `http://${hostname}:8000/api/v1`;
        console.log('🌐 Modo Rede - Base URL:', baseURL);
        return baseURL;
    }
    
    // Caso contrário, usa localhost
    console.log('🏠 Modo Local - Base URL: http://127.0.0.1:8000/api/v1');
    return 'http://127.0.0.1:8000/api/v1';
};

const apiClient = axios.create({
    baseURL: getBaseURL(),
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para adicionar o token JWT em cada requisição autenticada
apiClient.interceptors.request.use(
    (config) => {
        console.log('📤 Request:', config.method?.toUpperCase(), config.url);
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
    }
);

// Interceptor para debug de respostas
apiClient.interceptors.response.use(
    (response) => {
        console.log('✅ Response:', response.status, response.config.url);
        return response;
    },
    (error) => {
        console.error('❌ Response Error:', {
            url: error.config?.url,
            status: error.response?.status,
            message: error.message,
            data: error.response?.data
        });
        return Promise.reject(error);
    }
);

export default apiClient;
