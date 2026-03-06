import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Star, Target, Award, TrendingUp, TrendingDown, SkipForward, BookOpenCheck, WifiOff, CloudOff } from 'lucide-react';
import { useGamification } from "@/hooks/useGamification";
import apiClient from '@/api/axios';
import { usePerformance } from "@/hooks/usePerformance";
import { Separator } from "@/components/ui/separator";
import LoadingAnimation from "@/components/ui/LoadingAnimation";
import { checkInternetConnection } from "@/utils/networkStatus";
import { gerarQuizOffline } from "@/data/offlineQuizQuestions";
import { gerarPlanoEstudoOffline, salvarPlanoLocal } from "@/utils/offlineStudyPlan";

// Tipo seguro para perguntas do quiz
type PerguntaQuiz = {
  pergunta: string;
  alternativas: string[];
  resposta: number;
  area: string;
};

type DadosGrafico = {
    name: string;
    acertos: number;
    erros: number;
  }[];

// Helper function to order questions
const orderPerguntas = (perguntas: PerguntaQuiz[], foco: string): PerguntaQuiz[] => {
  const focoPerguntas = perguntas.filter(p => p.area.toLowerCase() === foco.toLowerCase());
  const outrasPerguntas = perguntas.filter(p => p.area.toLowerCase() !== foco.toLowerCase());
  const orderedPerguntas: PerguntaQuiz[] = [];

  let i = 0;
  let j = 0;
  while (i < focoPerguntas.length || j < outrasPerguntas.length) {
    // Adiciona 2 perguntas de foco
    if (i < focoPerguntas.length) {
      orderedPerguntas.push(focoPerguntas[i++]);
    }
    if (i < focoPerguntas.length) {
      orderedPerguntas.push(focoPerguntas[i++]);
    }
    // Adiciona 1 pergunta de outra área
    if (j < outrasPerguntas.length) {
      orderedPerguntas.push(outrasPerguntas[j++]);
    }
  }
  return orderedPerguntas;
};

// Integração Gemini
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GOOGLE_GENERATIVE_LANGUAGE_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

// Lista de matérias válidas (deve corresponder às matérias do backend)
const MATERIAS_VALIDAS = [
  'Matemática',
  'Português',
  'História',
  'Geografia',
  'Biologia',
  'Física',
  'Química',
  'Inglês',
  'Lógica',
  'Informática',
  'Programação',
  'Filosofia',
  'Sociologia'
];

// Função para validar e normalizar matérias
const validarMateria = (area: string): string => {
  // Normaliza: remove acentos, converte para minúsculas para comparação
  const areaNormalizada = area.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  // Busca correspondência exata (case-insensitive)
  const materiaValida = MATERIAS_VALIDAS.find(
    m => m.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === areaNormalizada
  );
  
  if (materiaValida) {
    return materiaValida;
  }
  
  // Se não encontrar, tenta correspondência parcial
  const materiaAproximada = MATERIAS_VALIDAS.find(
    m => areaNormalizada.includes(m.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
  );
  
  if (materiaAproximada) {
    console.warn(`⚠️ Matéria "${area}" corrigida para "${materiaAproximada}"`);
    return materiaAproximada;
  }
  
  // Se não encontrar nenhuma correspondência, usa "Lógica" como padrão
  console.error(`❌ Matéria inválida detectada: "${area}". Usando "Lógica" como padrão.`);
  return 'Lógica';
};

async function gerarPerguntasGemini(escolaridade: string, foco: string, idade: number): Promise<PerguntaQuiz[]> {
  if (!API_KEY) {
    console.error("API Key do Google não encontrada. Verifique o arquivo .env e a variável VITE_GOOGLE_GENERATIVE_LANGUAGE_API_KEY.");
    return [];
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const prompt = `
      Você é um especialista em educação e criação de conteúdo didático.
      Sua tarefa é gerar um quiz de nivelamento com EXATAMENTE 25 perguntas de múltipla escolha para um estudante com as seguintes características:
      - Idade: ${idade} anos
      - Nível de Escolaridade: "${escolaridade}"
      - Foco Principal de Estudo: "${foco}"

      # INSTRUÇÕES CRÍTICAS:

      1.  **Nível de Dificuldade (MUITO IMPORTANTE):**
          - A **idade (${idade} anos)** é um fator crucial. O tom, os exemplos usados nas perguntas e a complexidade dos cenários devem ser apropriados para essa faixa etária. Uma pergunta para uma criança de 12 anos é fundamentalmente diferente de uma para um jovem adulto de 21, mesmo que ambos estejam no "Ensino Médio".
          - O nível de escolaridade ("${escolaridade}") define os tópicos. **Exemplo:** Para "Ensino Médio", as perguntas de matemática devem envolver tópicos como funções, trigonometria, logaritmos. Para "Ensino Fundamental", as perguntas devem ser mais simples.
          - A complexidade do vocabulário e dos conceitos deve ser calibrada com precisão para a junção de idade e escolaridade.

      2.  **Interpretação do "Foco" (MUITO IMPORTANTE):
          - O campo "foco" indica o CONTEXTO ou ESTILO de prova para o qual o aluno está estudando, não um tópico sobre o qual fazer perguntas.
          - **Exemplo:** Se o foco for "ENEM" ou "Vestibular", você deve gerar perguntas com o **estilo e a complexidade** encontradas nessas provas, abrangendo as matérias relevantes (Matemática, Português, História, etc.). NÃO faça perguntas como "Quando ocorre o ENEM?" ou "Quantas questões tem a prova do ENEM?".

      3.  **MATÉRIAS PERMITIDAS (OBRIGATÓRIO):**
          - Use APENAS as seguintes matérias no campo "area":
            * Matemática
            * Português
            * História
            * Geografia
            * Biologia
            * Física
            * Química
            * Inglês
            * Lógica
            * Informática
            * Programação
            * Filosofia
            * Sociologia
          - **NUNCA use matérias como:** Design, Artes, Música, Educação Física, ou qualquer outra não listada acima.
          - Se o foco do usuário não estiver na lista (ex: "ENEM"), distribua as perguntas entre as matérias listadas.

      4.  **Distribuição das Perguntas:**
          - Gere 12 questões alinhadas ao "foco" principal (usando matérias da lista).
          - **Se o foco for um exame abrangente (como ENEM):** Distribua essas 12 questões entre as principais áreas do exame usando APENAS matérias da lista permitida.
          - Gere 13 questões de Conhecimentos Gerais, distribuídas entre as matérias permitidas, excluindo a área de foco se ela for específica.

      5.  **Formato de Saída:**
          - A resposta DEVE ser um array JSON contendo os 25 objetos de pergunta.
          - Não inclua NENHUM texto, markdown, ou qualquer formatação fora do array JSON.
          - Cada objeto no array deve seguir estritamente a estrutura:
            {
              "pergunta": "O texto completo da pergunta",
              "alternativas": ["alternativa A", "alternativa B", "alternativa C", "alternativa D"],
              "resposta": o índice da alternativa correta (de 0 a 3),
              "area": "Nome da matéria (DEVE ser uma das listadas acima)"
            }
    `;
    
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    try {
      const jsonMatch = text.match(/```(?:json)?\n([\s\S]*?)\n```/);
      let perguntas: PerguntaQuiz[] = [];
      
      if (jsonMatch && jsonMatch[1]) {
        perguntas = JSON.parse(jsonMatch[1]);
      } else {
        perguntas = JSON.parse(text);
      }
      
      // Valida e normaliza as matérias de cada pergunta
      perguntas = perguntas.map(p => ({
        ...p,
        area: validarMateria(p.area)
      }));
      
      // Log para debug: mostrar distribuição de matérias
      const distribuicao = perguntas.reduce((acc, p) => {
        acc[p.area] = (acc[p.area] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      console.log('📊 Distribuição de matérias no quiz:', distribuicao);
      
      return perguntas;
    } catch (e) {
      console.error("Erro ao fazer parse do JSON da resposta da IA:", e);
      console.error("Resposta recebida que causou o erro:", text);
      return [];
    }

  } catch (e) {
    console.error("Erro na chamada da API do Gemini ao gerar perguntas:", e);
    return [];
  }
}

type StudyPlanAction = {
  title: string;
  description: string;
  priority: string;
};

type StudyPlan = {
  title: string;
  greeting: string;
  analysis: {
    summary: string;
    focusPoints: string[];
    strength: string;
  };
  actionPlan: StudyPlanAction[];
  nextChallenge: {
    title: string;
    suggestion: string;
  };
  motivation: string;
};

const QuizNivelamento = () => {
  const [indice, setIndice] = useState(0);
  const [respostas, setRespostas] = useState<(number | null)[]>([]); // null para pulado
  const [finalizado, setFinalizado] = useState(false);
  const [perguntasNivelamento, setPerguntasNivelamento] = useState<PerguntaQuiz[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [quizResults, setQuizResults] = useState({ acertos: 0, total: 0, xpGanhos: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modoOffline, setModoOffline] = useState(false);
  
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [errorStreak, setErrorStreak] = useState(0);
  const [maxErrorStreak, setMaxErrorStreak] = useState(0);
  const [quizProcessado, setQuizProcessado] = useState(false);
  const [gerandoPlano, setGerandoPlano] = useState(false);

  const [dadosGrafico, setDadosGrafico] = useState<DadosGrafico>([]);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { addXp, blocosCompletos, resetHearts, userFocus } = useGamification();
  const { updatePerformance } = usePerformance();

  useEffect(() => {
    // Salva a contagem de blocos quando o quiz é iniciado
    if (blocosCompletos) {
      localStorage.setItem('blockCountOnQuizStart', String(blocosCompletos.length));
    }
    
    // Verifica se o usuário acabou de se cadastrar e limpa cache de quiz anterior
    const justRegistered = sessionStorage.getItem('justRegistered');
    if (justRegistered === 'true') {
      // Limpa todos os caches de quiz para garantir novo quiz para novo usuário
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('quizPerguntas_')) {
          localStorage.removeItem(key);
        }
      });
      sessionStorage.removeItem('justRegistered');
    }
  }, [blocosCompletos]);

  const getEscolaridade = () => {
    const escolaridadeValue = localStorage.getItem('userEducationalLevel') || 'medio';
    const escolaridadeMap: { [key: string]: string } = {
        basico: 'Nível Básico',
        fundamental: 'Ensino Fundamental',
        medio: 'Ensino Médio',
        superior: 'Superior'
    };
    return escolaridadeMap[escolaridadeValue] || 'Ensino Médio';
  }

  const getUserAge = () => {
    const birthDateString = localStorage.getItem('userBirthDate');
    if (!birthDateString) return 25; // Default age
    const birthDate = new Date(birthDateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
  }

  useEffect(() => {
    (async () => {
  const foco = userFocus || 'Conhecimentos Gerais';
      const escolaridadePrompt = getEscolaridade();
      const idade = getUserAge();

      const cacheKey = `quizPerguntas_${foco}_${escolaridadePrompt}_${idade}`;
      const cachedPerguntas = localStorage.getItem(cacheKey);

      if (cachedPerguntas) {
        setPerguntasNivelamento(JSON.parse(cachedPerguntas));
        setCarregando(false);
        return;
      }

      // Verifica se há conexão com a internet
      console.log('🔍 Verificando conexão com a internet...');
      const temInternet = await checkInternetConnection();
      
      if (!temInternet) {
        console.log('🔴 Sem internet - usando quiz offline');
        setModoOffline(true);
        const perguntasOffline = gerarQuizOffline(foco);
        setPerguntasNivelamento(perguntasOffline);
        setCarregando(false);
        toast({
          title: 'Modo Offline Ativado',
          description: 'Sem conexão com internet. Usando perguntas pré-definidas.',
          variant: 'default'
        });
        return;
      }
      
      console.log('🟢 Internet disponível - tentando gerar perguntas com IA');

      if (!API_KEY) {
        console.warn('⚠️ API Key do Google não configurada - usando modo offline');
        setModoOffline(true);
        const perguntasOffline = gerarQuizOffline(foco);
        setPerguntasNivelamento(perguntasOffline);
        setCarregando(false);
        toast({
          title: 'Modo Offline Ativado',
          description: 'API Key não configurada. Usando perguntas pré-definidas.',
          variant: 'default'
        });
        return;
      }

      setCarregando(true);
      setErro(null);
      
      try {
        const perguntas = await gerarPerguntasGemini(escolaridadePrompt, foco, idade);
        if (perguntas && perguntas.length > 0) {
          console.log('✅ Perguntas geradas com IA com sucesso');
          const orderedPerguntas = orderPerguntas(perguntas, foco);
          setPerguntasNivelamento(orderedPerguntas);
          localStorage.setItem(cacheKey, JSON.stringify(orderedPerguntas));
          setModoOffline(false);
        } else {
          throw new Error('IA não retornou perguntas válidas');
        }
      } catch (error) {
        console.warn('⚠️ Falha na geração com IA, usando modo offline:', error);
        setModoOffline(true);
        const perguntasOffline = gerarQuizOffline(foco);
        setPerguntasNivelamento(perguntasOffline);
        toast({
          title: 'Usando Perguntas Locais',
          description: 'A IA não está disponível no momento. Usando perguntas pré-definidas.',
          variant: 'default'
        });
      }
      
      setCarregando(false);
    })();
  }, [userFocus, toast]);

  const calcularPlanoEstudo = useCallback(() => {
    const analise: Record<string, { acertos: number; erros: number; pulos: number }> = {};
    perguntasNivelamento.forEach((q, idx) => {
      if (!analise[q.area]) analise[q.area] = { acertos: 0, erros: 0, pulos: 0 };
      if (respostas[idx] === q.resposta) {
        analise[q.area].acertos++;
      } else if (respostas[idx] === null) {
        analise[q.area].pulos++;
      } else {
        analise[q.area].erros++;
      }
    });
    return analise;
  }, [perguntasNivelamento, respostas]);

  useEffect(() => {
    if (finalizado && !quizProcessado) {
      (async () => {
        setIsSubmitting(true);
        setQuizProcessado(true); // Marca como processado imediatamente para evitar re-execuções
        
        try {
          const analise = calcularPlanoEstudo();
          const { acertos, total } = Object.values(analise).reduce(
            (acc, area) => {
              acc.acertos += area.acertos;
              acc.total += area.acertos + area.erros + area.pulos;
              return acc;
            },
            { acertos: 0, total: 0 }
          );
          const xpGanhos = acertos * 10;
          console.log(`QuizNivelamento: Total acertos=${acertos}, XP a ganhar=${xpGanhos}`);
          setQuizResults({ acertos, total, xpGanhos });

          const dadosParaGrafico = Object.entries(analise).map(([name, value]) => ({
            name,
            acertos: value.acertos,
            erros: value.erros + value.pulos,
          }));
          setDadosGrafico(dadosParaGrafico);

          const performanceResults = Object.entries(analise).map(([subject, data]) => ({
            subject,
            correct: data.acertos,
            incorrect: data.erros + data.pulos,
          }));

          // Persist performance and gamification data
          try {
            console.log(`QuizNivelamento: Chamando addXp com ${xpGanhos} XP`);
            
            // Chama as funções separadamente para identificar qual está falhando
            await updatePerformance(performanceResults);
            console.log(`QuizNivelamento: updatePerformance concluído`);
            
            await addXp(xpGanhos);
            console.log(`QuizNivelamento: addXp concluído - ${xpGanhos} XP adicionados`);
            
            await resetHearts();
            console.log(`QuizNivelamento: resetHearts concluído`);
            
            sessionStorage.setItem('justFinishedQuiz', 'true');
            
            // Gerar plano de estudo e AGUARDAR a conclusão
            setGerandoPlano(true);
            try {
              // Verifica se há internet para decidir como gerar o plano
              const temInternet = await checkInternetConnection();
              
              if (temInternet && !modoOffline) {
                // Gera plano com IA (online)
                console.log(`QuizNivelamento: Gerando plano de estudo com IA...`);
                await apiClient.post('/users/me/generate-study-plan/', {
                  analise,
                  maxStreak,
                  maxErrorStreak,
                });
                console.log(`QuizNivelamento: Plano de estudo gerado com IA com sucesso!`);
              } else {
                // Gera plano localmente (offline)
                console.log(`QuizNivelamento: Gerando plano de estudo offline...`);
                const userName = localStorage.getItem('userName') || 'Estudante';
                const planoOffline = gerarPlanoEstudoOffline(
                  analise,
                  maxStreak,
                  maxErrorStreak,
                  userName
                );
                salvarPlanoLocal(planoOffline);
                console.log(`QuizNivelamento: Plano de estudo offline gerado e salvo!`);
                
                toast({
                  title: 'Plano Gerado Offline',
                  description: 'Seu plano de estudos foi criado localmente e está disponível.',
                  variant: 'default'
                });
              }
              
              // Após gerar o plano, navega automaticamente para a tela do plano
              setTimeout(() => {
                navigate('/study-plan');
              }, 1000); // Aguarda 1 segundo para dar feedback visual
              
            } catch (e) {
              console.error('Failed to trigger study plan generation', e);
              
              // Fallback: tenta gerar offline mesmo em caso de erro
              try {
                console.log('🔄 Tentando gerar plano offline como fallback...');
                const userName = localStorage.getItem('userName') || 'Estudante';
                const planoOffline = gerarPlanoEstudoOffline(
                  analise,
                  maxStreak,
                  maxErrorStreak,
                  userName
                );
                salvarPlanoLocal(planoOffline);
                console.log('✅ Plano offline gerado como fallback');
                
                toast({
                  title: 'Plano Gerado Localmente',
                  description: 'Não foi possível conectar ao servidor, mas seu plano foi criado localmente.',
                  variant: 'default'
                });
                
                setTimeout(() => {
                  navigate('/study-plan');
                }, 1000);
              } catch (fallbackError) {
                console.error('❌ Falha no fallback offline:', fallbackError);
                toast({ 
                  title: "Erro", 
                  description: "Não foi possível gerar seu plano de estudo. Tente novamente.", 
                  variant: "destructive" 
                });
                setGerandoPlano(false);
              }
            }
          } catch (e) {
            console.error('Failed to persist quiz data:', e);
            toast({ title: "Erro", description: "Houve um problema ao salvar seu progresso. Seus resultados podem não ter sido registrados.", variant: "destructive" });
          }

        } finally {
          setIsSubmitting(false);
        }
      })();
    }
  }, [finalizado, quizProcessado, calcularPlanoEstudo, toast, maxStreak, maxErrorStreak, updatePerformance, addXp, resetHearts, navigate, modoOffline]);

  const proximaPergunta = (resposta: number | null) => {
    const perguntaAtual = perguntasNivelamento[indice];
    const respostaCorreta = resposta === perguntaAtual.resposta;

    if (respostaCorreta) {
      const novaSequencia = streak + 1;
      setStreak(novaSequencia);
      setMaxStreak(Math.max(maxStreak, novaSequencia));
      setErrorStreak(0);
    } else {
      const novoErrorStreak = errorStreak + 1;
      setErrorStreak(novoErrorStreak);
      setMaxErrorStreak(Math.max(maxErrorStreak, novoErrorStreak));
      setStreak(0);
    }

    setRespostas([...respostas, resposta]);
    if (indice < perguntasNivelamento.length - 1) {
      setIndice(indice + 1);
    } else {
      setFinalizado(true);
    }
  };

  if (carregando) {
    return (
      <LoadingAnimation 
        text={modoOffline ? "Preparando Quiz Offline..." : "Preparando seu Quiz de nivelamento!"} 
        subtext={modoOffline ? "Carregando perguntas pré-definidas..." : "Gerando 25 perguntas personalizadas com IA..."} 
      />
    );
  }

  if (finalizado) {
    const { acertos, total } = dadosGrafico.reduce((acc, item) => {
        acc.acertos += item.acertos;
        acc.total += item.acertos + item.erros;
        return acc;
    }, { acertos: 0, total: 0 });

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full shadow-elevated">
          <CardContent className="p-12 text-center space-y-8">
            {/* Ícone animado */}
            <div className="relative">
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center animate-pulse">
                <BookOpenCheck className="h-12 w-12 text-primary" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
              </div>
            </div>

            {/* Mensagem principal */}
            <div className="space-y-3">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Analisando Seu Desempenho
              </h2>
              <p className="text-lg text-muted-foreground">
                Nossa IA está criando um plano de estudos personalizado para você...
              </p>
            </div>

            {/* Estatísticas rápidas */}
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto pt-4">
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-2xl font-bold text-primary">{acertos}/{total}</p>
                <p className="text-xs text-muted-foreground mt-1">Questões Acertadas</p>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-2xl font-bold text-primary">+{acertos * 10}</p>
                <p className="text-xs text-muted-foreground mt-1">XP Conquistados</p>
              </div>
            </div>

            {/* Indicador de progresso */}
            <div className="space-y-2 pt-4">
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <p className="text-sm font-medium text-primary">
                  {gerandoPlano ? 'Gerando plano personalizado...' : 'Preparando análise...'}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Você será redirecionado automaticamente em instantes
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (perguntasNivelamento.length === 0) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <Card className="p-6 sm:p-8 max-w-2xl w-full shadow-elevated">
                {erro && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert"><strong className="font-bold">Erro!</strong><span className="block sm:inline"> {erro}</span></div>}
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Não foi possível carregar o quiz</h2>
                    <p className="text-muted-foreground">Tente novamente mais tarde.</p>
                    <Button size="lg" className="mt-6 bg-accent hover:bg-accent/90 text-accent-foreground shadow-cyan-glow" onClick={() => navigate("/trilha")}>Voltar ao Início</Button>
                </div>
            </Card>
        </div>
    )
  }

  const perguntaAtual = perguntasNivelamento[indice];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="p-6 sm:p-8 max-w-2xl w-full shadow-elevated">
        {erro && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert"><strong className="font-bold">Erro!</strong><span className="block sm:inline"> {erro}</span></div>}
        {modoOffline && (
          <Alert className="border-primary/30 bg-primary/5 dark:bg-primary/10 mb-4">
            <CloudOff className="h-4 w-4 text-primary" />
            
            <AlertDescription className="text-muted-foreground">
              Detectamos instabilidade na conexão,  seus resultados serão salvos normalmente.
            </AlertDescription>
          </Alert>
        )}
        <>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-muted-foreground">Pergunta {indice + 1} de {perguntasNivelamento.length}</span>
              <span className="text-sm font-semibold text-primary">{perguntaAtual.area}</span>
            </div>
            <Progress value={((indice + 1) / perguntasNivelamento.length) * 100} className="h-2" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center min-h-[6rem]">{perguntaAtual.pergunta}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {perguntaAtual.alternativas.map((alt, i) => (
              <Button key={i} variant="outline" className="h-auto py-3 text-base whitespace-normal justify-start" onClick={() => proximaPergunta(i)}>
                <span className="font-bold mr-2">{String.fromCharCode(65 + i)}&#41;</span> {alt}
              </Button>
            ))}
          </div>
          <div className="mt-6 border-t pt-4 flex justify-center">
            <Button variant="ghost" className="text-muted-foreground" onClick={() => proximaPergunta(null)}>
              <SkipForward className="mr-2 h-4 w-4" />
              Pular Pergunta
            </Button>
          </div>
        </>
      </Card>
    </div>
  );
};

export default QuizNivelamento;
