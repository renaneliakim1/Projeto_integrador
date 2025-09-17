import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAchievements } from "@/hooks/useAchievements";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Star, Target, Award } from 'lucide-react';

// Tipo seguro para perguntas do quiz
type PerguntaQuiz = {
  pergunta: string;
  alternativas: string[];
  resposta: number;
  area: string;
};

// Integração Gemini
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GOOGLE_GENERATIVE_LANGUAGE_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

async function gerarPerguntasGemini(escolaridade: string): Promise<PerguntaQuiz[]> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    const prompt = `Gere 10 perguntas de múltipla escolha para um quiz de nivelamento para um estudante com nível de escolaridade "${escolaridade}", abrangendo as seguintes áreas: Matemática, Português, História, Geografia e Conhecimentos Gerais. Para cada pergunta, retorne no formato JSON:
    {
      "pergunta": "texto da pergunta",
      "alternativas": ["alternativa1", "alternativa2", "alternativa3", "alternativa4"],
      "resposta": índice da alternativa correta (0 a 3),
      "area": "área do conhecimento"
    }
    Retorne um array JSON apenas, sem explicações.`;
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    try {
        const jsonMatch = text.match(/```(?:json)?\n([\s\S]*?)\n```/);
        if (jsonMatch && jsonMatch[1]) {
          return JSON.parse(jsonMatch[1]);
        } else {
          return JSON.parse(text);
        }
    } catch(e) {
        console.error("Erro ao fazer parse do JSON da resposta da IA:", e);
        console.error("Resposta recebida:", text);
        return [];
    }

  } catch (e) {
    console.error("Erro ao gerar perguntas com a IA:", e);
    return [];
  }
}

async function gerarPlanoDeEstudo(
  analise: Record<string, { acertos: number; erros: number }>,
  escolaridade: string,
  maxStreak: number
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    
    const desempenho = Object.entries(analise).map(([area, dados]) => 
      `"${area}: Acertou ${dados.acertos} de ${dados.acertos + dados.erros} perguntas."`
    ).join('\n');

    const prompt = `
      Você é um tutor virtual amigável e criativo chamado Skillio. Um aluno do ${escolaridade} acabou de fazer um quiz de nivelamento com os seguintes resultados:
      ${desempenho}
      O aluno conseguiu uma sequência máxima de ${maxStreak} acertos.

      Com base nisso, gere um plano de estudo personalizado em formato Markdown que seja visualmente interessante e motivador:
      1. Comece com um título chamativo e uma saudação calorosa, elogiando o esforço e o bom desempenho em alguma matéria (se houver).
      2. Crie uma seção "🔥 Pontos de Foco" para as 2 áreas prioritárias (com mais erros). Para cada área, use emojis e sugira 2 tópicos específicos para revisar, explicando brevemente por que são importantes.
      3. Crie uma seção "🎯 Seu Próximo Desafio". Sugira um próximo passo prático, como um link para um jogo ou quiz específico. Use um tom encorajador.
      4. Finalize com uma seção "✨ Mensagem Motivacional", com uma frase curta e inspiradora para o aluno continuar estudando.
      Use emojis para deixar o texto mais amigável e visual.
    `;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (e) {
    console.error("Erro ao gerar plano de estudo com a IA:", e);
    return "Não foi possível gerar seu plano de estudo. Tente novamente mais tarde.";
  }
}

const QuizNivelamento = () => {
  const [indice, setIndice] = useState(0);
  const [respostas, setRespostas] = useState<number[]>([]);
  const [finalizado, setFinalizado] = useState(false);
  const [perguntasNivelamento, setPerguntasNivelamento] = useState<PerguntaQuiz[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [planoDeEstudoGerado, setPlanoDeEstudoGerado] = useState<string>('');
  const [gerandoPlano, setGerandoPlano] = useState(false);
  const [respostasCorretasConsecutivas, setRespostasCorretasConsecutivas] = useState(0);
  const [maxRespostasCorretasConsecutivas, setMaxRespostasCorretasConsecutivas] = useState(0);
  const [dadosGrafico, setDadosGrafico] = useState<any[]>([]);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { checkAndUnlockAchievements } = useAchievements();

  const getEscolaridade = () => {
    const escolaridadeValue = localStorage.getItem('userEducationalLevel') || 'medio';
    const escolaridadeMap: { [key: string]: string } = {
        basico: 'Nível Básico',
        fundamental: 'Ensino Fundamental',
        medio: 'Ensino Médio'
    };
    return escolaridadeMap[escolaridadeValue] || 'Ensino Médio';
  }

  useEffect(() => {
    (async () => {
      const escolaridadePrompt = getEscolaridade();
      setCarregando(true);
      setErro(null);
      const perguntas = await gerarPerguntasGemini(escolaridadePrompt);
      if (perguntas.length > 0) {
        setPerguntasNivelamento(perguntas);
      } else {
        setErro("Não foi possível gerar as perguntas. Usando perguntas de exemplo.");
        setPerguntasNivelamento([
          { pergunta: "Qual a capital do Brasil?", alternativas: ["Rio de Janeiro", "São Paulo", "Brasília", "Salvador"], resposta: 2, area: "Geografia" },
          { pergunta: "Resultado de 5 + 3 * 2?", alternativas: ["16", "11", "13", "10"], resposta: 1, area: "Matemática" }
        ]);
      }
      setCarregando(false);
    })();
  }, []);

  const planoEstudo = useCallback(() => {
    const analise: Record<string, { acertos: number; erros: number }> = {};
    perguntasNivelamento.forEach((q, idx) => {
      if (!analise[q.area]) analise[q.area] = { acertos: 0, erros: 0 };
      if (respostas[idx] === q.resposta) analise[q.area].acertos++;
      else analise[q.area].erros++;
    });
    return analise;
  }, [perguntasNivelamento, respostas]);

  useEffect(() => {
    if (finalizado) {
      const analise = planoEstudo();
      const { acertos, total } = Object.values(analise).reduce(
        (acc, area) => {
          acc.acertos += area.acertos;
          acc.total += area.acertos + area.erros;
          return acc;
        },
        { acertos: 0, total: 0 }
      );

      const dadosParaGrafico = Object.entries(analise).map(([name, value]) => ({
        name,
        acertos: value.acertos,
        erros: value.erros,
      }));
      setDadosGrafico(dadosParaGrafico);

      const XP_POR_ACERTO = 10;
      const xpGanhos = acertos * XP_POR_ACERTO;
      const xpAtual = parseInt(localStorage.getItem('userXP') || '0', 10);
      const novoXP = xpAtual + xpGanhos;
      localStorage.setItem('userXP', novoXP.toString());

      // Lógica de Nível e Conquistas
      checkAndUnlockAchievements({ newXp: novoXP, quizzesCompleted: 1, correctAnswers: acertos, totalAnswers: total });

      toast({ title: "Quiz Finalizado!", description: `Você ganhou ${xpGanhos} XP.` });

      (async () => {
        setGerandoPlano(true);
        const escolaridade = getEscolaridade();
        const plano = await gerarPlanoDeEstudo(analise, escolaridade, maxRespostasCorretasConsecutivas);
        setPlanoDeEstudoGerado(plano);
        setGerandoPlano(false);
      })();
    }
  }, [finalizado, planoEstudo, toast, checkAndUnlockAchievements, maxRespostasCorretasConsecutivas]);

  const handleResponder = (i: number) => {
    const perguntaAtual = perguntasNivelamento[indice];
    const respostaCorreta = i === perguntaAtual.resposta;

    if (respostaCorreta) {
      const novaSequencia = respostasCorretasConsecutivas + 1;
      setRespostasCorretasConsecutivas(novaSequencia);
      if (novaSequencia > maxRespostasCorretasConsecutivas) {
        setMaxRespostasCorretasConsecutivas(novaSequencia);
      }
    } else {
      setRespostasCorretasConsecutivas(0);
    }

    setRespostas([...respostas, i]);
    if (indice < perguntasNivelamento.length - 1) {
      setIndice(indice + 1);
    } else {
      setFinalizado(true);
    }
  };

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center py-12">
          <span className="text-lg font-semibold">Gerando perguntas por IA...</span>
        </div>
      </div>
    );
  }

  if (finalizado) {
    const { acertos, total } = dadosGrafico.reduce((acc, item) => {
        acc.acertos += item.acertos;
        acc.total += item.acertos + item.erros;
        return acc;
    }, { acertos: 0, total: 0 });

    return (
      <div className="min-h-screen bg-background p-4 sm:p-8">
        <Card className="max-w-4xl mx-auto shadow-elevated overflow-hidden">
          <CardHeader className="bg-muted/30 p-6">
            <h2 className="text-2xl font-bold text-center">Quiz de Nivelamento Finalizado!</h2>
          </CardHeader>
          <CardContent className="p-6 grid md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Target size={20} /> Desempenho por Matéria</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={dadosGrafico} layout="vertical">
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="name" width={80} stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
                      <Tooltip cursor={{ fill: 'rgba(240, 240, 240, 0.5)' }} />
                      <Legend />
                      <Bar dataKey="acertos" name="Acertos" stackId="a" fill="#22c55e" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="erros" name="Erros" stackId="a" fill="#ef4444" radius={[4, 0, 0, 4]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <div className="grid grid-cols-2 gap-4">
                  <Card className="text-center">
                      <CardHeader><Award size={24} className="mx-auto text-primary"/></CardHeader>
                      <CardContent>
                          <p className="text-2xl font-bold">{acertos}/{total}</p>
                          <p className="text-sm text-muted-foreground">Acertos Totais</p>
                      </CardContent>
                  </Card>
                  <Card className="text-center">
                      <CardHeader><Star size={24} className="mx-auto text-yellow-400"/></CardHeader>
                      <CardContent>
                          <p className="text-2xl font-bold">{maxRespostasCorretasConsecutivas}</p>
                          <p className="text-sm text-muted-foreground">Sequência Máxima</p>
                      </CardContent>
                  </Card>
              </div>
            </div>
            
            <Card className="bg-muted/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">🚀 Seu Plano de Estudo</CardTitle>
              </CardHeader>
              <CardContent>
                {gerandoPlano ? (
                  <div className="text-center py-12">
                    <span className="text-lg font-semibold">Analisando seus resultados...</span>
                  </div>
                ) : planoDeEstudoGerado ? (
                  <div className="prose prose-sm max-w-none text-left whitespace-pre-wrap">
                    {planoDeEstudoGerado}
                  </div>
                ) : (
                  <p className="mb-4 text-muted-foreground">Calculando seu plano...</p>
                )}
              </CardContent>
            </Card>

          </CardContent>
          <div className="p-6 border-t text-center">
             <Button size="lg" className="bg-gradient-growth" onClick={() => navigate("/Dashboard")}>Ir para Dashboard</Button>
          </div>
        </Card>
      </div>
    );
  }

  const perguntaAtual = perguntasNivelamento[indice];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="p-8 max-w-lg w-full shadow-elevated">
        {erro && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert"><strong className="font-bold">Erro!</strong><span className="block sm:inline"> {erro}</span></div>}
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
      </Card>
    </div>
  );
};

export default QuizNivelamento;
