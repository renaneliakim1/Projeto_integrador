
import { useState, useEffect, useCallback } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GOOGLE_GENERATIVE_LANGUAGE_API_KEY;
const DEFAULT_MODEL = "gemini-pro";

// Lista de categorias de ranking pré-definidas
const PREDEFINED_CATEGORIES = ["Matemática", "Programação", "Português", "História", "Geografia", "Ciências"];

export const useTopicCategorizer = (
  topic: string,
  modelName: string = DEFAULT_MODEL
) => {
  const [category, setCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categorizeTopic = useCallback(async () => {
    if (!API_KEY) {
      setError("Chave da API não configurada.");
      return;
    }
    if (!topic) {
      setCategory(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: modelName });

      const prompt = `
        Analise o seguinte tópico de estudo: "${topic}".
        Seu objetivo é categorizá-lo em uma das seguintes áreas principais: ${PREDEFINED_CATEGORIES.join(", ")}.
        Responda APENAS com o nome da categoria correspondente.
        Por exemplo, se o tópico for "equações de 2º grau", a resposta deve ser "Matemática".
        Se o tópico for "Revolução Francesa", a resposta deve ser "História".
        Se o tópico for "variáveis em JavaScript", a resposta deve ser "Programação".
        Se o tópico não se encaixar claramente em nenhuma das categorias, responda com a que mais se aproxima.
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();

      // Valida se a resposta da IA é uma das categorias permitidas
      if (PREDEFINED_CATEGORIES.map(c => c.toLowerCase()).includes(text.toLowerCase())) {
        // Capitaliza a categoria para consistência
        const formattedCategory = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
        setCategory(formattedCategory);
      } else {
        // Se a IA retornar algo inesperado, podemos ter um fallback ou um erro
        console.warn(`A IA retornou uma categoria inesperada: "${text}". Usando a categoria original como fallback.`);
        setCategory(topic); // Fallback para o tópico original
      }

    } catch (err: unknown) {
      let msg = "Erro desconhecido ao categorizar o tópico.";
      if (err instanceof Error) {
        msg = err.message;
      }
      setError(msg);
      setCategory(topic); // Fallback em caso de erro
    } finally {
      setLoading(false);
    }
  }, [topic, modelName]);

  useEffect(() => {
    categorizeTopic();
  }, [categorizeTopic]);

  return { category, loading, error };
};
