import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";

// Tipo seguro para perguntas do quiz
type PerguntaQuiz = {
  pergunta: string;
  alternativas: string[];
  resposta: number;
  area: string;
};

// Integração Gemini
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

async function gerarPerguntasGemini(): Promise<PerguntaQuiz[]> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `Gere 10 perguntas de múltipla escolha para um quiz de nivelamento. Para cada pergunta, retorne no formato JSON:
    {
      "pergunta": "texto da pergunta",
      "alternativas": ["alternativa1", "alternativa2", "alternativa3", "alternativa4"],
      "resposta": índice da alternativa correta (0 a 3),
      "area": "área do conhecimento"
    }
    Retorne um array JSON apenas, sem explicações.`;
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    // Tenta extrair JSON do texto retornado
    const match = text.match(/\[.*\]/s);
    if (match) {
      const arr = JSON.parse(match[0]);
      return arr;
    }
    return [];
  } catch (e) {
    return [];
  }
}

const QuizNivelamento = () => {
  const [indice, setIndice] = useState(0);
  const [respostas, setRespostas] = useState<number[]>([]);
  const [finalizado, setFinalizado] = useState(false);
  const [perguntasNivelamento, setPerguntasNivelamento] = useState<PerguntaQuiz[]>([]);
  const [carregando, setCarregando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      setCarregando(true);
      const perguntas = await gerarPerguntasGemini();
      setPerguntasNivelamento(perguntas.length ? perguntas : [
        {
          pergunta: "Qual é o resultado de 15 × 8?",
          alternativas: ["120", "140", "110", "130"],
          resposta: 0,
          area: "Matemática"
        },
      ]);
      setCarregando(false);
    })();
  }, []);

  const perguntaAtual = perguntasNivelamento[indice];

  const handleResponder = (i: number) => {
    setRespostas([...respostas, i]);
    if (indice < perguntasNivelamento.length - 1) {
      setIndice(indice + 1);
    } else {
      setFinalizado(true);
    }
  };

  // Análise simples de acertos/erros por área
  const planoEstudo = () => {
    const analise: Record<string, { acertos: number; erros: number }> = {};
    perguntasNivelamento.forEach((q, idx) => {
      if (!analise[q.area]) analise[q.area] = { acertos: 0, erros: 0 };
      if (respostas[idx] === q.resposta) analise[q.area].acertos++;
      else analise[q.area].erros++;
    });
    return analise;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="p-8 max-w-lg w-full shadow-elevated">
        {carregando ? (
          <div className="text-center py-12">
            <span className="text-lg font-semibold">Gerando perguntas por IA...</span>
          </div>
        ) : !finalizado ? (
          <>
            <div className="mb-4">
              <span className="text-sm font-medium">Pergunta {indice + 1} de {perguntasNivelamento.length}</span>
              <Progress value={((indice + 1) / perguntasNivelamento.length) * 100} className="h-2 mt-2" />
            </div>
            <h2 className="text-xl font-bold mb-6">{perguntaAtual.pergunta}</h2>
            <div className="grid grid-cols-1 gap-3 mb-6">
              {perguntaAtual.alternativas.map((alt, i) => (
                <Button key={i} variant="outline" className="h-12" onClick={() => handleResponder(i)}>{String.fromCharCode(65 + i)}) {alt}</Button>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Quiz de Nivelamento Finalizado!</h2>
            <p className="mb-4 text-muted-foreground">Veja seu plano de estudo sugerido com base nos seus acertos e erros:</p>
            <div className="mb-6">
              {Object.entries(planoEstudo()).map(([area, dados], i) => (
                <div key={i} className="mb-2">
                  <span className="font-semibold">{area}:</span> <span className="text-success">{dados.acertos} acertos</span> / <span className="text-danger">{dados.erros} erros</span>
                </div>
              ))}
            </div>
            <Button size="lg" className="bg-gradient-growth" onClick={() => navigate("/Dashboard")}>Ir para Dashboard</Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default QuizNivelamento;
