import { useState, useEffect, useCallback } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface Lesson {
  lesson: string;
}

const API_KEY = import.meta.env.VITE_GOOGLE_GENERATIVE_LANGUAGE_API_KEY;
const DEFAULT_MODEL = "gemini-2.5-flash";

export const useLessonAI = (
  subject: string,
  educationalLevel: string,
  enabled: boolean = true,
  modelName: string = DEFAULT_MODEL
) => {
  const [generatedLesson, setGeneratedLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateLessonContent = useCallback(async () => {
    if (!enabled) {
      setGeneratedLesson(null);
      setLoading(false);
      return;
    }
    if (!API_KEY) {
      setError(
        "Google Generative Language API Key não está definida. Configure VITE_GOOGLE_GENERATIVE_LANGUAGE_API_KEY no .env."
      );
      return;
    }
    if (!subject || !educationalLevel) {
      setGeneratedLesson(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: modelName });

      const prompt = `Gere uma breve aula sobre '${subject}' para um estudante do nível '${educationalLevel}'. A aula deve ser um resumo conciso do tópico em um parágrafo. A resposta deve ser um objeto JSON com o campo 'lesson' (string). Certifique-se de que a resposta seja um JSON válido e nada mais.`;

      const result = await model.generateContent(prompt);

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

      let parsedLesson: Lesson | null = null;
      try {
        const jsonMatch = text.match(/```(?:json)?\n([\s\S]*?)\n```/);
        if (jsonMatch && jsonMatch[1]) {
          parsedLesson = JSON.parse(jsonMatch[1]);
        } else {
          parsedLesson = JSON.parse(text);
        }
      } catch (parseError) {
        setError(
          `A IA retornou um formato inesperado. Resposta bruta: ${text.slice(
            0,
            300
          )}...`
        );
        setGeneratedLesson(null);
        return;
      }

      setGeneratedLesson(parsedLesson);
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
      setError(`Falha ao gerar a aula: ${msg}`);
      setGeneratedLesson(null);
    } finally {
      setLoading(false);
    }
  }, [subject, educationalLevel, modelName, enabled]);

  useEffect(() => {
    generateLessonContent();
  }, [generateLessonContent]);

  return { generatedLesson, loading, error, refetch: generateLessonContent };
};