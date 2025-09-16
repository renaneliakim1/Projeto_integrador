/* import { useState, useEffect, useCallback } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  difficulty: string;
}

const API_KEY = import.meta.env.VITE_GOOGLE_GENERATIVE_LANGUAGE_API_KEY;
const DEFAULT_MODEL = "gemini-pro";

export const useGenerativeAI = (subject: string, educationalLevel: string, modelName: string = DEFAULT_MODEL) => {
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateContent = useCallback(async () => {
    if (!API_KEY) {
      setError("Google Generative Language API Key não está definida. Configure VITE_GOOGLE_GENERATIVE_LANGUAGE_API_KEY no .env.");
      return;
    }
    if (!subject || !educationalLevel) {
      setGeneratedQuestions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      let model;
      try {
        model = genAI.getGenerativeModel({ model: modelName });
      } catch {
        model = genAI.getGenerativeModel({ model: modelName === "gemini-pro" ? "models/gemini-pro" : "gemini-pro" });
      }

      const prompt = `Gere 10 perguntas de múltipla escolha sobre "${subject}" para um estudante com nível de escolaridade "${educationalLevel}". Cada pergunta deve ter 4 opções e indicar a opção correta (índice 0-3). Atribua também um nível de dificuldade (easy, medium, hard) a cada pergunta. A saída deve ser um array JSON de objetos, cada um com os campos 'id', 'question', 'options', 'correct' e 'difficulty'. Certifique-se de que a resposta seja um JSON válido e nada mais.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      let parsedQuestions: Question[] = [];
      try {
        const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch && jsonMatch[1]) {
          parsedQuestions = JSON.parse(jsonMatch[1]);
        } else {
          parsedQuestions = JSON.parse(text);
        }
      } catch (parseError) {
        setError("A IA retornou um formato inesperado. Tente novamente ou verifique o modelo utilizado.");
        setGeneratedQuestions([]);
        return;
      }

      const formattedQuestions = parsedQuestions.map((q, index) => ({
        id: index + 1,
        question: q.question,
        options: q.options,
        correct: q.correct,
        difficulty: q.difficulty || "medium",
      }));

      setGeneratedQuestions(formattedQuestions);

    } catch (err: unknown) {
      let msg = "Erro desconhecido";
      if (
        typeof err === "object" &&
        err !== null &&
        "message" in err &&
        typeof (err as { message?: unknown }).message === "string"
      ) {
        msg = (err as { message: string }).message;
      }
      if (msg.includes("404") || msg.includes("not found")) {
        msg = "Modelo não encontrado ou não habilitado para sua chave. Verifique o nome do modelo e permissões da API no Google Cloud Console.";
      }
      setError(`Falha ao gerar perguntas: ${msg}`);
      setGeneratedQuestions([]);
    } finally {
      setLoading(false);
    }
  }, [subject, educationalLevel, modelName]);

  useEffect(() => {
    generateContent();
  }, [generateContent]);

  return { generatedQuestions, loading, error, refetch: generateContent };
}; */



import { useState, useEffect, useCallback } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  difficulty: string;
}

const API_KEY = import.meta.env.VITE_GOOGLE_GENERATIVE_LANGUAGE_API_KEY;
const DEFAULT_MODEL = "gemini-1.5-flash-latest";

export const useGenerativeAI = (
  subject: string,
  educationalLevel: string,
  modelName: string = DEFAULT_MODEL
) => {
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateContent = useCallback(async () => {
    if (!API_KEY) {
      setError(
        "Google Generative Language API Key não está definida. Configure VITE_GOOGLE_GENERATIVE_LANGUAGE_API_KEY no .env."
      );
      return;
    }
    if (!subject || !educationalLevel) {
      setGeneratedQuestions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: modelName });

      const prompt = `Gere 10 perguntas de múltipla escolha sobre "${subject}" para um estudante com nível de escolaridade "${educationalLevel}". 
Cada pergunta deve ter 4 opções e indicar a opção correta (índice 0-3). 
Atribua também um nível de dificuldade (easy, medium, hard) a cada pergunta. 
A saída deve ser um array JSON de objetos, cada um com os campos 'id', 'question', 'options', 'correct' e 'difficulty'. 
Certifique-se de que a resposta seja um JSON válido e nada mais.`;

      const result = await model.generateContent(prompt);

      // captura segura da resposta
      let text = "";
      if (result?.response?.text) {
        text = result.response.text();
      } else if (
        result?.response?.candidates?.[0]?.content?.parts?.[0]?.text
      ) {
        text = result.response.candidates[0].content.parts[0].text;
      } else {
        throw new Error("Resposta da API vazia ou em formato inesperado.");
      }

      // tenta extrair JSON válido
      let parsedQuestions: Question[] = [];
      try {
        const jsonMatch = text.match(/```(?:json)?\n([\s\S]*?)\n```/);
        if (jsonMatch && jsonMatch[1]) {
          parsedQuestions = JSON.parse(jsonMatch[1]);
        } else {
          parsedQuestions = JSON.parse(text);
        }
      } catch (parseError) {
        setError(
          `A IA retornou um formato inesperado. Resposta bruta: ${text.slice(
            0,
            300
          )}...`
        );
        setGeneratedQuestions([]);
        return;
      }

      // normaliza os dados
      const formattedQuestions = parsedQuestions.map((q, index) => ({
        id: index + 1, // força IDs sequenciais para evitar duplicação
        question: q.question,
        options: q.options,
        correct: q.correct,
        difficulty: q.difficulty || "medium",
      }));

      setGeneratedQuestions(formattedQuestions);
    } catch (err: unknown) {
      let msg = "Erro desconhecido";
      if (
        typeof err === "object" &&
        err !== null &&
        "message" in err &&
        typeof (err as { message?: unknown }).message === "string"
      ) {
        msg = (err as { message: string }).message;
      }
      if (msg.includes("404") || msg.includes("not found")) {
        msg =
          "Modelo não encontrado ou não habilitado para sua chave. Verifique o nome do modelo e permissões da API no Google Cloud Console.";
      }
      setError(`Falha ao gerar perguntas: ${msg}`);
      setGeneratedQuestions([]);
    } finally {
      setLoading(false);
    }
  }, [subject, educationalLevel, modelName]);

  useEffect(() => {
    generateContent();
  }, [generateContent]);

  return { generatedQuestions, loading, error, refetch: generateContent };
};
