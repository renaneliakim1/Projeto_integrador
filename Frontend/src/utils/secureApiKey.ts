// Função para proteger a chave da API (exemplo simples)
// Em produção, nunca exponha a chave no frontend!
export const getApiKey = () => {
  // Ideal: buscar do backend ou variável de ambiente protegida
  return import.meta.env.VITE_GOOGLE_GENERATIVE_LANGUAGE_API_KEY || "";
};
