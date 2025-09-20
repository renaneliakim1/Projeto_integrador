import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Star, Target, Award, TrendingUp, TrendingDown, SkipForward } from 'lucide-react';
import Markdown from 'react-markdown';

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

// Integração Gemini
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GOOGLE_GENERATIVE_LANGUAGE_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

async function gerarPerguntasGemini(escolaridade: string, foco: string, idade: number): Promise<PerguntaQuiz[]> {
  if (!API_KEY) {
    console.error("API Key do Google não encontrada. Verifique o arquivo .env e a variável VITE_GOOGLE_GENERATIVE_LANGUAGE_API_KEY.");
    return [];
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    const prompt = `Gere um quiz de nivelamento com exatamente 25 perguntas de múltipla escolha para um estudante de ${idade} anos de idade, do nível "${escolaridade}".
    O foco principal do estudante é "${foco}".
    As perguntas devem ser adequadas para a idade e nível de escolaridade informados.
    As perguntas devem seguir estritamente a seguinte distribuição de áreas:
    - ${foco}: 12 questões
    - Conhecimentos Gerais (Lógica, Matemática, Português, Inglês, Geografia, História, Informática, Biologia, etc.): 13 questões distribuídas entre as áreas, excluindo a área de foco principal.

    Para cada pergunta, retorne no formato JSON:
    {
      "pergunta": "texto da pergunta",
      "alternativas": ["alternativa1", "alternativa2", "alternativa3", "alternativa4"],
      "resposta": índice da alternativa correta (0 a 3),
      "area": "nome da área"
    }
    Retorne um array JSON contendo os 25 objetos, sem nenhum texto, markdown ou formatação adicional. A resposta deve ser apenas o array JSON.`;
    
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    try {
      const jsonMatch = text.match(/```(?:json)?\n([\s\S]*?)\n```/);
      if (jsonMatch && jsonMatch[1]) {
        return JSON.parse(jsonMatch[1]);
      }
      return JSON.parse(text);
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

async function gerarPlanoDeEstudo(
  analise: Record<string, { acertos: number; erros: number; pulos: number } >,
  escolaridade: string,
  foco: string,
  idade: number,
  maxStreak: number,
  maxErrorStreak: number
): Promise<{ planMarkdown: string; priorityAreas: string[] } | null> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    
    const desempenho = Object.entries(analise).map(([area, dados]) => 
      `- **${area}**: Acertou ${dados.acertos} de ${dados.acertos + dados.erros + dados.pulos} (pulou ${dados.pulos}).`
    ).join('\n');

    const prompt = `
      Você é um tutor virtual amigável e criativo chamado Skillio. Um aluno de ${idade} anos, do nível ${escolaridade}, acabou de fazer um quiz de nivelamento e informou que seu foco de estudo principal é "${foco}".
      
      # Análise de Desempenho
      ${desempenho}
      
      - **Sequência máxima de acertos**: ${maxStreak}
      - **Sequência máxima de erros/pulos**: ${maxErrorStreak}

      Com base nisso, gere um plano de estudo personalizado. Siga estritamente esta estrutura:

      1.  **Título e Saudação**: Comece com um título chamativo (ex: "Sua Jornada do Conhecimento Começa Agora! 🚀") e uma saudação calorosa. Elogie o esforço do aluno.

      2.  **Seu Raio-X de Conhecimento**: Crie uma seção que resume o desempenho.
          -   Use um subtítulo como "🔍 Seu Raio-X de Conhecimento".
          -   **Priorize a área de foco principal do aluno**: "${foco}". Analise o desempenho nessa área primeiro.
          -   Identifique as **2 áreas prioritárias** (com mais erros e pulos, dando preferência para a área de foco se ela estiver entre as com pior desempenho). Chame-as de "Pontos de Foco".
          -   Identifique a **melhor matéria** do aluno. Chame-a de "Seu Ponto Forte".

      3.  **Plano de Ação**: Crie uma seção com um plano de ação claro.
          -   Use um subtítulo como "🔥 Plano de Ação Personalizado".
          -   Para cada uma das 2 áreas prioritárias, use um emoji e sugira **2 tópicos específicos** para revisar. Explique brevemente (uma linha) por que o tópico é importante.

      4.  **Próximo Desafio**: Sugira um passo prático.
          -   Use um subtítulo como "🎯 Seu Próximo Desafio".
          -   Sugira começar pela matéria prioritária número 1 com um tom encorajador.

      5.  **Mensagem Motivacional**: Finalize com uma mensagem curta e inspiradora.
          -   Use um subtítulo como "✨ Lembre-se Sempre".

      A resposta DEVE ser um objeto JSON com dois campos: 'planMarkdown' (contendo o plano de estudo em formato Markdown) e 'priorityAreas' (um array de strings com os nomes das 2 áreas prioritárias).
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    try {
      const jsonMatch = text.match(/```(?:json)?\n([\s\S]*?)\n```/);
      if (jsonMatch && jsonMatch[1]) {
        return JSON.parse(jsonMatch[1]);
      }
      return JSON.parse(text);
    } catch (e) {
      console.error("Erro ao fazer parse do JSON do plano de estudo:", e);
      return null;
    }

  } catch (e) {
    console.error("Erro ao gerar plano de estudo com a IA:", e);
    return null;
  }
}

const QuizNivelamento = () => {
  const [indice, setIndice] = useState(0);
  const [respostas, setRespostas] = useState<(number | null)[]>([]); // null para pulado
  const [finalizado, setFinalizado] = useState(false);
  const [perguntasNivelamento, setPerguntasNivelamento] = useState<PerguntaQuiz[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [planoDeEstudoGerado, setPlanoDeEstudoGerado] = useState<string>('');
  const [gerandoPlano, setGerandoPlano] = useState(false);
  
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [errorStreak, setErrorStreak] = useState(0);
  const [maxErrorStreak, setMaxErrorStreak] = useState(0);

  const [dadosGrafico, setDadosGrafico] = useState<DadosGrafico>([]);

  const navigate = useNavigate();
  const { toast } = useToast();
  // const { checkAndUnlockAchievements } = useAchievements(); // Hook não utilizado

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
      if (!API_KEY) {
        setErro("API Key do Google não configurada. Verifique seu arquivo .env. Usando um quiz de exemplo.");
        setPerguntasNivelamento([
            {pergunta: 'Qual animal é conhecido como o "rei da selva"?', alternativas: ['Tigre', 'Leão', 'Elefante', 'Urso'], resposta: 1, area: 'Biologia'},
            {pergunta: 'Qual a fórmula da água?', alternativas: ['CO2', 'H2O', 'O2', 'N2'], resposta: 1, area: 'Biologia'},
            {pergunta: 'Qual processo as plantas usam para converter luz em energia?', alternativas: ['Respiração', 'Fotossíntese', 'Transpiração', 'Digestão'], resposta: 1, area: 'Biologia'},
            {pergunta: 'Qual a capital da França?', alternativas: ['Londres', 'Berlim', 'Madri', 'Paris'], resposta: 3, area: 'Geografia'},
            {pergunta: 'Qual o maior continente do mundo?', alternativas: ['África', 'Europa', 'Ásia', 'América'], resposta: 2, area: 'Geografia'},
            {pergunta: 'Qual o rio mais longo do mundo?', alternativas: ['Nilo', 'Amazonas', 'Yangtzé', 'Mississipi'], resposta: 1, area: 'Geografia'},
            {pergunta: 'Quem escreveu "Dom Quixote"?', alternativas: ['Shakespeare', 'Cervantes', 'Dante', 'Homero'], resposta: 1, area: 'História'},
            {pergunta: 'Em que ano começou a Segunda Guerra Mundial?', alternativas: ['1914', '1939', '1945', '1929'], resposta: 1, area: 'História'},
            {pergunta: 'Qual civilização construiu as pirâmides de Gizé?', alternativas: ['Romana', 'Grega', 'Egípcia', 'Maia'], resposta: 2, area: 'História'},
            {pergunta: 'O que significa a sigla "CPU" em um computador?', alternativas: ['Unidade Central de Processamento', 'Placa de Vídeo', 'Memória RAM', 'Fonte de Energia'], resposta: 0, area: 'Informática'},
            {pergunta: 'Qual empresa desenvolveu o sistema operacional Windows?', alternativas: ['Apple', 'Google', 'Microsoft', 'Linux'], resposta: 2, area: 'Informática'},
            {pergunta: 'O que é um "phishing"?', alternativas: ['Um tipo de vírus', 'Um ataque para roubar informações', 'Uma peça de hardware', 'Um software de edição'], resposta: 1, area: 'Informática'},
            {pergunta: 'Qual a tradução de "book" para o português?', alternativas: ['Livro', 'Caneta', 'Mesa', 'Cadeira'], resposta: 0, area: 'Inglês'},
            {pergunta: 'Como se diz "obrigado" em inglês?', alternativas: ['Hello', 'Goodbye', 'Thank you', 'Sorry'], resposta: 2, area: 'Inglês'},
            {pergunta: 'O que significa "cat" em inglês?', alternativas: ['Cachorro', 'Gato', 'Pássaro', 'Peixe'], resposta: 1, area: 'Inglês'},
            {pergunta: 'Se um trem viaja a 100 km/h, que distância ele percorre em 2 horas?', alternativas: ['100 km', '150 km', '200 km', '250 km'], resposta: 2, area: 'Lógica'},
            {pergunta: 'Qual o próximo número na sequência: 2, 4, 6, 8, ...?', alternativas: ['9', '10', '11', '12'], resposta: 1, area: 'Lógica'},
            {pergunta: 'Se todo A é B e todo B é C, então:', alternativas: ['Todo C é A', 'Nenhum A é C', 'Todo A é C', 'Algum A não é C'], resposta: 2, area: 'Lógica'},
            {pergunta: 'Um pai tem o dobro da idade do filho. Juntos, eles têm 60 anos. Qual a idade do pai?', alternativas: ['30', '40', '45', '50'], resposta: 1, area: 'Lógica'},
            {pergunta: 'Quanto é 7 multiplicado por 8?', alternativas: ['49', '54', '56', '63'], resposta: 2, area: 'Matemática'},
            {pergunta: 'Qual o resultado de 10 - (2 + 3)?', alternativas: ['5', '6', '7', '8'], resposta: 0, area: 'Matemática'},
            {pergunta: 'Se um círculo tem um raio de 5 cm, qual o seu diâmetro?', alternativas: ['5 cm', '10 cm', '15 cm', '25 cm'], resposta: 1, area: 'Matemática'},
            {pergunta: 'Qual o sinônimo de "rápido"?', alternativas: ['Lento', 'Veloz', 'Grande', 'Pequeno'], resposta: 1, area: 'Português'},
            {pergunta: 'Qual o coletivo de "cães"?', alternativas: ['Alcateia', 'Manada', 'Matilha', 'Cardume'], resposta: 2, area: 'Português'},
            {pergunta: 'Qual a classe gramatical da palavra "bonito"?', alternativas: ['Substantivo', 'Verbo', 'Adjetivo', 'Advérbio'], resposta: 2, area: 'Português'}
        ]);
        setCarregando(false);
        return;
      }

      const escolaridadePrompt = getEscolaridade();
      const foco = localStorage.getItem('userFocus') || 'Conhecimentos Gerais';
      const idade = getUserAge();

      setCarregando(true);
      setErro(null);
      const perguntas = await gerarPerguntasGemini(escolaridadePrompt, foco, idade);
      if (perguntas && perguntas.length > 0) { // Check for any number of questions
        setPerguntasNivelamento(perguntas);
      } else {
        setErro("Falha ao gerar perguntas com IA. Usando um quiz de exemplo.");
        setPerguntasNivelamento([
            {pergunta: 'Qual animal é conhecido como o "rei da selva"?', alternativas: ['Tigre', 'Leão', 'Elefante', 'Urso'], resposta: 1, area: 'Biologia'},
            {pergunta: 'Qual a fórmula da água?', alternativas: ['CO2', 'H2O', 'O2', 'N2'], resposta: 1, area: 'Biologia'},
            {pergunta: 'Qual processo as plantas usam para converter luz em energia?', alternativas: ['Respiração', 'Fotossíntese', 'Transpiração', 'Digestão'], resposta: 1, area: 'Biologia'},
            {pergunta: 'Qual a capital da França?', alternativas: ['Londres', 'Berlim', 'Madri', 'Paris'], resposta: 3, area: 'Geografia'},
            {pergunta: 'Qual o maior continente do mundo?', alternativas: ['África', 'Europa', 'Ásia', 'América'], resposta: 2, area: 'Geografia'},
            {pergunta: 'Qual o rio mais longo do mundo?', alternativas: ['Nilo', 'Amazonas', 'Yangtzé', 'Mississipi'], resposta: 1, area: 'Geografia'},
            {pergunta: 'Quem escreveu "Dom Quixote"?', alternativas: ['Shakespeare', 'Cervantes', 'Dante', 'Homero'], resposta: 1, area: 'História'},
            {pergunta: 'Em que ano começou a Segunda Guerra Mundial?', alternativas: ['1914', '1939', '1945', '1929'], resposta: 1, area: 'História'},
            {pergunta: 'Qual civilização construiu as pirâmides de Gizé?', alternativas: ['Romana', 'Grega', 'Egípcia', 'Maia'], resposta: 2, area: 'História'},
            {pergunta: 'O que significa a sigla "CPU" em um computador?', alternativas: ['Unidade Central de Processamento', 'Placa de Vídeo', 'Memória RAM', 'Fonte de Energia'], resposta: 0, area: 'Informática'},
            {pergunta: 'Qual empresa desenvolveu o sistema operacional Windows?', alternativas: ['Apple', 'Google', 'Microsoft', 'Linux'], resposta: 2, area: 'Informática'},
            {pergunta: 'O que é um "phishing"?', alternativas: ['Um tipo de vírus', 'Um ataque para roubar informações', 'Uma peça de hardware', 'Um software de edição'], resposta: 1, area: 'Informática'},
            {pergunta: 'Qual a tradução de "book" para o português?', alternativas: ['Livro', 'Caneta', 'Mesa', 'Cadeira'], resposta: 0, area: 'Inglês'},
            {pergunta: 'Como se diz "obrigado" em inglês?', alternativas: ['Hello', 'Goodbye', 'Thank you', 'Sorry'], resposta: 2, area: 'Inglês'},
            {pergunta: 'O que significa "cat" em inglês?', alternativas: ['Cachorro', 'Gato', 'Pássaro', 'Peixe'], resposta: 1, area: 'Inglês'},
            {pergunta: 'Se um trem viaja a 100 km/h, que distância ele percorre em 2 horas?', alternativas: ['100 km', '150 km', '200 km', '250 km'], resposta: 2, area: 'Lógica'},
            {pergunta: 'Qual o próximo número na sequência: 2, 4, 6, 8, ...?', alternativas: ['9', '10', '11', '12'], resposta: 1, area: 'Lógica'},
            {pergunta: 'Se todo A é B e todo B é C, então:', alternativas: ['Todo C é A', 'Nenhum A é C', 'Todo A é C', 'Algum A não é C'], resposta: 2, area: 'Lógica'},
            {pergunta: 'Um pai tem o dobro da idade do filho. Juntos, eles têm 60 anos. Qual a idade do pai?', alternativas: ['30', '40', '45', '50'], resposta: 1, area: 'Lógica'},
            {pergunta: 'Quanto é 7 multiplicado por 8?', alternativas: ['49', '54', '56', '63'], resposta: 2, area: 'Matemática'},
            {pergunta: 'Qual o resultado de 10 - (2 + 3)?', alternativas: ['5', '6', '7', '8'], resposta: 0, area: 'Matemática'},
            {pergunta: 'Se um círculo tem um raio de 5 cm, qual o seu diâmetro?', alternativas: ['5 cm', '10 cm', '15 cm', '25 cm'], resposta: 1, area: 'Matemática'},
            {pergunta: 'Qual o sinônimo de "rápido"?', alternativas: ['Lento', 'Veloz', 'Grande', 'Pequeno'], resposta: 1, area: 'Português'},
            {pergunta: 'Qual o coletivo de "cães"?', alternativas: ['Alcateia', 'Manada', 'Matilha', 'Cardume'], resposta: 2, area: 'Português'},
            {pergunta: 'Qual a classe gramatical da palavra "bonito"?', alternativas: ['Substantivo', 'Verbo', 'Adjetivo', 'Advérbio'], resposta: 2, area: 'Português'}
        ]);
      }
      setCarregando(false);
    })();
  }, []);

  const planoEstudo = useCallback(() => {
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
    if (finalizado) {
      const analise = planoEstudo();
      const { acertos, total } = Object.values(analise).reduce(
        (acc, area) => {
          acc.acertos += area.acertos;
          acc.total += area.acertos + area.erros + area.pulos;
          return acc;
        },
        { acertos: 0, total: 0 }
      );

      const dadosParaGrafico = Object.entries(analise).map(([name, value]) => ({
        name,
        acertos: value.acertos,
        erros: value.erros + value.pulos,
      }));
      setDadosGrafico(dadosParaGrafico);

      // A função completeQuiz() não está definida neste escopo.
      // Se você tiver um hook de gamificação, ele deve ser chamado aqui.

      (async () => {
        setGerandoPlano(true);
        const escolaridade = getEscolaridade();
        const foco = localStorage.getItem('userFocus') || 'Conhecimentos Gerais';
        const idade = getUserAge();
        const planoResponse = await gerarPlanoDeEstudo(analise, escolaridade, foco, idade, maxStreak, maxErrorStreak);

        if (planoResponse) {
          setPlanoDeEstudoGerado(planoResponse.planMarkdown);
          localStorage.setItem('studyPlan', JSON.stringify(planoResponse.priorityAreas));
          
          if (planoResponse.priorityAreas && planoResponse.priorityAreas.length > 0) {
            localStorage.setItem('userPreferredSubject', planoResponse.priorityAreas[0]);
          } else {
            localStorage.setItem('userPreferredSubject', foco);
          }
        } else {
          setPlanoDeEstudoGerado("Não foi possível gerar seu plano de estudo. Tente novamente.");
        }

        setGerandoPlano(false);
      })();
    }
  }, [finalizado, planoEstudo, toast, maxStreak, maxErrorStreak]);

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
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Preparando seu Quiz!</h2>
          <p className="text-muted-foreground">Gerando 25 perguntas personalizadas com IA...</p>
          <Progress value={undefined} className="w-40 mx-auto mt-4" />
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
        <Card className="max-w-5xl mx-auto shadow-elevated overflow-hidden">
          <CardHeader className="bg-muted/30 p-6">
            <h2 className="text-3xl font-bold text-center text-primary">Seu Desempenho no Quiz!</h2>
          </CardHeader>
          <CardContent className="p-6 grid md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Target size={20} /> Desempenho por Matéria</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}> 
                    <BarChart data={dadosGrafico} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="name" width={80} stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
                      <Tooltip cursor={{ fill: 'rgba(240, 240, 240, 0.5)' }} contentStyle={{backgroundColor: '#fff', border: '1px solid #ccc'}}/>
                      <Legend wrapperStyle={{paddingTop: '20px'}}/>
                      <Bar dataKey="acertos" name="Acertos" stackId="a" fill="#22c55e" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="erros" name="Erros/Pulos" stackId="a" fill="#ef4444" radius={[4, 0, 0, 4]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Card className="text-center p-4">
                      <Award size={24} className="mx-auto text-primary"/>
                      <p className="text-2xl font-bold mt-2">+{acertos * 10}</p>
                      <p className="text-xs text-muted-foreground">XP Ganhos</p>
                  </Card>
                  <Card className="text-center p-4">
                      <TrendingUp size={24} className="mx-auto text-green-500"/>
                      <p className="text-2xl font-bold mt-2">{maxStreak}</p>
                      <p className="text-xs text-muted-foreground">Melhor Sequência</p>
                  </Card>
                  <Card className="text-center p-4">
                      <TrendingDown size={24} className="mx-auto text-red-500"/>
                      <p className="text-2xl font-bold mt-2">{maxErrorStreak}</p>
                      <p className="text-xs text-muted-foreground">Pior Sequência</p>
                  </Card>
                   <Card className="text-center p-4">
                      <Star size={24} className="mx-auto text-yellow-400"/>
                      <p className="text-2xl font-bold mt-2">{acertos}/{total}</p>
                      <p className="text-xs text-muted-foreground">Acertos</p>
                  </Card>
              </div>
            </div>
            
            <Card className="bg-muted/20 flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">🚀 Seu Plano de Estudo Personalizado</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                {gerandoPlano ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <p className="text-lg font-semibold">Criando seu plano de estudo com IA...</p>
                      <p className="text-sm text-muted-foreground">Isso pode levar alguns segundos.</p>
                    </div>
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none text-left prose-headings:font-semibold prose-h3:text-lg prose-h4:text-base">
                    <Markdown>{planoDeEstudoGerado}</Markdown>
                  </div>
                )}
              </CardContent>
            </Card>

          </CardContent>
          <div className="p-6 border-t text-center">
             <Button size="lg" className="bg-gradient-growth" onClick={() => navigate("/Dashboard")}>Avançar</Button>
          </div>
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
                    <Button size="lg" className="mt-6 bg-gradient-growth" onClick={() => navigate("/Dashboard")}>Voltar ao Início</Button>
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