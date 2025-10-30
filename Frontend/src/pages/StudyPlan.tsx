import { useState, useEffect } from 'react';
import apiClient from '@/api/axios';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowLeft, RefreshCw, Rocket } from 'lucide-react';
import { useGamification } from '@/hooks/useGamification';
import { trilhaPrincipal } from '@/data/trilhaPrincipal';
import { Separator } from '@/components/ui/separator';
import { BookOpenCheck } from 'lucide-react';
import LoadingAnimation from '@/components/ui/LoadingAnimation';

// Tipos do Plano de Estudo (espelhado de QuizNivelamento.tsx)
type StudyPlanTopic = {
  title: string;
  description: string;
};

type StudyPlanAction = {
  area: string;
  emoji: string;
  topics: StudyPlanTopic[];
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

// Função auxiliar para enriquecer tópicos genéricos com conteúdos específicos
const enriquecerTopico = (area: string, topic: StudyPlanTopic, index: number): StudyPlanTopic => {
  const areaLower = area.toLowerCase();
  const titleLower = topic.title.toLowerCase();
  
  // Dicionário de conteúdos específicos por área
  const conteudosEspecificos: Record<string, string[]> = {
    'matemática': [
      'Operações básicas (adição, subtração, multiplicação, divisão)',
      'Frações, porcentagens e números decimais',
      'Equações de primeiro grau e sistemas lineares',
      'Funções (linear, quadrática, exponencial)',
      'Geometria plana (triângulos, círculos, polígonos)',
      'Trigonometria (seno, cosseno, tangente)',
    ],
    'português': [
      'Classes gramaticais: substantivo, verbo, adjetivo, advérbio',
      'Pronomes: pessoais, possessivos, demonstrativos, relativos',
      'Preposições e conjunções: uso e classificação',
      'Sintaxe: sujeito, predicado, objeto direto e indireto',
      'Concordância nominal e verbal',
      'Regência nominal e verbal',
      'Crase: quando usar e casos especiais',
      'Acentuação gráfica e regras de acentuação',
      'Ortografia: uso de S, SS, Ç, X, CH',
      'Sílaba tônica: oxítonas, paroxítonas e proparoxítonas',
      'Pontuação: vírgula, ponto e vírgula, dois pontos',
      'Interpretação de textos narrativos, descritivos e dissertativos',
      'Gêneros textuais: crônica, notícia, artigo de opinião',
      'Coesão e coerência textual',
      'Figuras de linguagem: metáfora, metonímia, hipérbole',
      'Verbos: conjugação, tempos verbais e modos (indicativo, subjuntivo, imperativo)',
      'Vozes verbais: ativa, passiva e reflexiva',
      'Orações subordinadas: substantivas, adjetivas e adverbiais',
      'Período composto por coordenação e subordinação',
      'Semântica: sinônimos, antônimos, homônimos e parônimos',
    ],
    'história': [
      'Descobrimento do Brasil e colonização portuguesa',
      'Escravidão e movimentos abolicionistas',
      'Independência do Brasil e formação do Estado',
      'República Velha e Era Vargas',
      'Segunda Guerra Mundial e Guerra Fria',
      'Ditadura Militar e redemocratização',
    ],
    'geografia': [
      'Tipos de vegetação (Amazônia, Cerrado, Mata Atlântica)',
      'Clima e suas características (tropical, subtropical, equatorial)',
      'Relevo brasileiro (planaltos, planícies, depressões)',
      'Hidrografia e bacias hidrográficas',
      'Urbanização e crescimento das cidades',
      'Problemas ambientais e sustentabilidade',
    ],
    'biologia': [
      'Células (estrutura celular, DNA, RNA)',
      'Biologia humana (corpo humano e suas características)',
      'Genética (hereditariedade, genes, mutações)',
      'Ecologia (ecossistemas, cadeias alimentares)',
      'Evolução (seleção natural, adaptação)',
      'Fisiologia (sistemas do corpo humano)',
    ],
    'física': [
      'Cinemática (movimento, velocidade, aceleração)',
      'Leis de Newton e dinâmica',
      'Energia (cinética, potencial, conservação)',
      'Eletricidade (corrente, tensão, resistência)',
      'Óptica (reflexão, refração, lentes)',
      'Ondas e movimento harmônico',
    ],
    'química': [
      'Tabela periódica e propriedades dos elementos',
      'Ligações químicas (iônica, covalente, metálica)',
      'Reações químicas e balanceamento',
      'Estequiometria e cálculos químicos',
      'Ácidos, bases e pH',
      'Química orgânica (hidrocarbonetos, funções orgânicas)',
    ],
    'inglês': [
      'Vocabulário básico do dia a dia',
      'Tempos verbais (presente, passado, futuro)',
      'Verbos modais (can, should, must, would)',
      'Preposições e conectivos',
      'Interpretação de textos em inglês',
      'Conversação e expressões idiomáticas',
    ],
    'lógica': [
      'Sequências numéricas e padrões',
      'Problemas de raciocínio lógico',
      'Silogismos e proposições',
      'Probabilidade básica',
      'Análise combinatória',
      'Resolução de problemas complexos',
    ],
    'direito': [
      'Introdução ao Direito e conceitos fundamentais',
      'Direito Constitucional: princípios e garantias fundamentais',
      'Direito Civil: pessoas, bens e fatos jurídicos',
      'Direito Penal: crimes e penas',
      'Direito do Trabalho: relações de emprego e direitos trabalhistas',
      'Direito Administrativo: organização do Estado e serviços públicos',
    ],
    'programação': [
      'Lógica de programação e algoritmos',
      'Variáveis, tipos de dados e operadores',
      'Estruturas condicionais (if, else, switch)',
      'Estruturas de repetição (for, while)',
      'Funções e modularização de código',
      'Estruturas de dados: arrays, listas, pilhas, filas',
    ],
    'enem': [
      'Redação: estrutura dissertativa-argumentativa',
      'Interpretação de textos e questões interdisciplinares',
      'Matemática e suas tecnologias',
      'Ciências da Natureza e suas tecnologias',
      'Ciências Humanas e suas tecnologias',
      'Linguagens, Códigos e suas tecnologias',
    ],
  };

  // Verifica se o tópico é genérico
  const topicosGenericos = [
    'fundamentos', 'básico', 'conceitos', 'introdução', 'revisar', 
    'prática', 'exercícios', 'questões', 'aprofundamento', 'estudar'
  ];
  
  const ehGenerico = topicosGenericos.some(palavra => titleLower.includes(palavra));
  
  if (ehGenerico) {
    // Encontra conteúdos específicos para a área
    for (const [key, conteudos] of Object.entries(conteudosEspecificos)) {
      if (areaLower.includes(key)) {
        // Seleciona um conteúdo baseado no índice do tópico
        const conteudoEspecifico = conteudos[index % conteudos.length];
        return {
          title: conteudoEspecifico,
          description: `Estude e pratique este conteúdo com atenção. ${topic.description || 'Realize exercícios para fixar o conhecimento.'}`
        };
      }
    }
  }
  
  return topic;
};

// Componente para renderizar o plano de estudo
const StudyPlanDisplay = ({ plan, userFocus }: { plan: StudyPlan | null; userFocus: string }) => {
  // Defensive: se plan ou partes essenciais estiverem ausentes, não quebre a UI
  if (!plan || !plan.analysis) {
    return (
      <div className="p-6 text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
          <BookOpenCheck className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-2xl font-bold text-primary">Plano de Estudo em Construção</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Sua análise personalizada está sendo gerada com base no seu desempenho no quiz de nivelamento. 
          Em breve, você terá um roteiro completo do básico ao avançado!
        </p>
      </div>
    );
  }

  const actionPlan: StudyPlanAction[] = Array.isArray(plan.actionPlan) ? plan.actionPlan : [];
  const focusPoints: string[] = Array.isArray(plan.analysis?.focusPoints) ? plan.analysis.focusPoints : [];
  
  // Reorganiza o plano para priorizar o foco do usuário
  const reorganizarPlanoPorFoco = (actions: StudyPlanAction[], foco: string): StudyPlanAction[] => {
    const focoLower = foco.toLowerCase();
    console.log('🎯 DEBUG StudyPlan - Reorganizando por foco:', { foco, focoLower });
    console.log('🎯 DEBUG StudyPlan - Actions disponíveis:', actions.map(a => a.area));
    
    const acoesFoco = actions.filter(a => {
      const match = a.area.toLowerCase().includes(focoLower);
      console.log(`  - "${a.area}" contains "${focoLower}"? ${match}`);
      return match;
    });
    const acoesOutras = actions.filter(a => !a.area.toLowerCase().includes(focoLower));
    
    console.log('🎯 DEBUG StudyPlan - Ações do foco:', acoesFoco.map(a => a.area));
    console.log('🎯 DEBUG StudyPlan - Outras ações:', acoesOutras.map(a => a.area));
    
    // Se não encontrou nenhum card do foco E o foco não é genérico, cria um card automaticamente
    if (acoesFoco.length === 0 && foco && foco !== 'Conhecimentos Gerais') {
      console.log('🎯 DEBUG StudyPlan - Foco não encontrado! Criando card automático para:', foco);
      const cardDoFoco: StudyPlanAction = {
        area: foco,
        emoji: '🎯',
        topics: [
          {
            title: 'Fundamentos',
            description: `Estude os conceitos fundamentais de ${foco}.`
          },
          {
            title: 'Prática',
            description: `Resolva exercícios práticos de ${foco}.`
          },
          {
            title: 'Aprofundamento',
            description: `Aprofunde seus conhecimentos em ${foco}.`
          }
        ]
      };
      return [cardDoFoco, ...acoesOutras];
    }
    
    // Retorna primeiro as ações do foco, depois as outras
    return [...acoesFoco, ...acoesOutras];
  };
  
  const actionPlanOrdenado = reorganizarPlanoPorFoco(actionPlan, userFocus || 'Conhecimentos Gerais');

  return (
    <div className="space-y-8">
      {/* Cabeçalho do Plano */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-2">
          <span className="text-sm font-semibold text-primary">📊 Análise Baseada no Quiz</span>
        </div>
        <h3 className="text-2xl font-bold text-primary">{plan.title || 'Seu Plano de Estudo Personalizado'}</h3>
        <p className="text-muted-foreground">{plan.greeting || ''}</p>
      </div>

      <Separator />

      {/* Raio-X do Conhecimento */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-1 bg-primary rounded-full"></div>
          <h4 className="font-bold text-2xl">🔍 Raio-X do Seu Conhecimento</h4>
        </div>
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6 space-y-4">
            <p className="text-base leading-relaxed">{plan.analysis.summary || ''}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🎯</span>
                  <p className="font-bold text-lg">Áreas que Precisam de Atenção</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {focusPoints.map((point, idx) => (
                    <span key={idx} className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 rounded-full text-sm font-medium">
                      {point}
                    </span>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">💪</span>
                  <p className="font-bold text-lg">Seu Ponto Forte</p>
                </div>
                <span className="inline-block px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
                  {plan.analysis.strength || 'Identificando...'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plano de Ação Progressivo */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-1 bg-gradient-to-b from-green-500 via-yellow-500 to-red-500 rounded-full"></div>
          <h4 className="font-bold text-2xl">🎓 Seu Plano de Estudos Detalhado</h4>
        </div>
        <p className="text-muted-foreground text-sm mb-6">
          Com base na sua performance no quiz, organizamos os conteúdos que você precisa estudar do básico ao avançado.
          {userFocus && userFocus !== 'Conhecimentos Gerais' && (
            <span className="block mt-2 text-primary font-semibold">
              🎯 Priorizando: {userFocus}
            </span>
          )}
        </p>
        
        <div className="space-y-6">
          {actionPlanOrdenado.map((action: StudyPlanAction, index: number) => {
            // Verifica se esta ação é do foco principal do usuário
            const ehFocoPrincipal = action.area.toLowerCase().includes((userFocus || '').toLowerCase());
            console.log(`🎯 DEBUG Card ${action.area} - ehFocoPrincipal:`, ehFocoPrincipal, 'userFocus:', userFocus);
            
            // Determina o nível e a cor baseado no índice
            const nivelInfo = index === 0 
              ? { nivel: 'Nível Básico', emoji: '🟢', cor: 'green' }
              : index === 1 
              ? { nivel: 'Nível Intermediário', emoji: '🟡', cor: 'yellow' }
              : index === 2 
              ? { nivel: 'Nível Avançado', emoji: '🔴', cor: 'red' }
              : { nivel: `Nível ${index + 1}`, emoji: '🔵', cor: 'blue' };

            const borderColor = nivelInfo.cor === 'green' ? 'border-l-green-500' 
              : nivelInfo.cor === 'yellow' ? 'border-l-yellow-500'
              : nivelInfo.cor === 'red' ? 'border-l-red-500'
              : 'border-l-blue-500';

            return (
              <Card key={index} className={`overflow-hidden border-l-4 ${borderColor} ${ehFocoPrincipal ? 'ring-2 ring-primary/30' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{action.emoji}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-xl font-bold">{action.area}</CardTitle>
                        {ehFocoPrincipal && (
                          <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                            SEU FOCO
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {nivelInfo.emoji} {nivelInfo.nivel} • {(action.topics || []).length} {(action.topics || []).length === 1 ? 'assunto' : 'assuntos'}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <Separator className="mb-4" />
                  <div className="space-y-3">
                    {(action.topics || []).map((topic: StudyPlanTopic, i: number) => {
                      const topicoEnriquecido = enriquecerTopico(action.area, topic, i);
                      return (
                        <div key={i} className="space-y-1.5">
                          <div className="flex items-start gap-2">
                            <span className="flex-shrink-0 text-primary font-bold text-sm mt-0.5">
                              {i + 1}.
                            </span>
                            <div className="flex-1 space-y-1">
                              <p className="font-semibold text-base leading-tight">
                                {topicoEnriquecido.title}
                              </p>
                              {topicoEnriquecido.description && (
                                <p className="text-sm text-muted-foreground leading-relaxed pl-4">
                                  {topicoEnriquecido.description}
                                </p>
                              )}
                            </div>
                          </div>
                          {i < (action.topics || []).length - 1 && (
                            <Separator className="my-3" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Próximo Desafio */}
      <div className="text-center space-y-3 p-6 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-background rounded-full mb-2">
          <span className="text-2xl">🚀</span>
          <h4 className="font-bold text-lg">{plan.nextChallenge?.title || 'Próxima Etapa'}</h4>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">{plan.nextChallenge?.suggestion || ''}</p>
        <p className="font-bold text-primary text-lg mt-4">{plan.motivation || '💪 Continue sua jornada de aprendizado!'}</p>
      </div>
    </div>
  );
};

const StudyPlan = () => {
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [isRefazerAtivo, setIsRefazerAtivo] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const navigate = useNavigate();
  const { level, blocosCompletos, userFocus } = useGamification();

  console.log('🎯 DEBUG StudyPlan Component - userFocus:', userFocus);

  useEffect(() => {
    // Função para corrigir o plano de estudo com o foco correto do usuário
    const corrigirFocoDoPlano = (plan: StudyPlan, focoReal: string): StudyPlan => {
      if (!plan) return plan;
      
      // Atualiza o título e greeting para refletir o foco correto
      return {
        ...plan,
        title: `Plano de Estudo - Foco em ${focoReal}`,
        greeting: `Olá! Com base no seu quiz, preparamos um plano de estudo focado em ${focoReal}, incluindo outras áreas importantes.`,
      };
    };
    
    (async () => {
      try {
        // Try loading from server first
        console.log('🎯 DEBUG: Carregando plano do servidor...');
        const resp = await apiClient.get('/users/me/');
        console.log('🎯 DEBUG: Resposta recebida:', resp.data);
        console.log('🎯 DEBUG: Profile:', resp.data?.profile);
        console.log('🎯 DEBUG: Profile.focus:', resp.data?.profile?.focus);
        console.log('🎯 DEBUG: Profile.study_plan:', resp.data?.profile?.study_plan);
        
        let serverPlan = resp.data?.profile?.study_plan;
        if (typeof serverPlan === 'string') {
          console.log('🎯 DEBUG: Plano é string, fazendo parse...');
          try {
            serverPlan = JSON.parse(serverPlan);
            console.log('🎯 DEBUG: Parse bem-sucedido:', serverPlan);
          } catch (e) {
            console.error('🎯 DEBUG: Erro no parse:', e);
            serverPlan = null;
          }
        }
        if (serverPlan && Object.keys(serverPlan).length > 0) {
          console.log('🎯 DEBUG: Plano válido encontrado! Chaves:', Object.keys(serverPlan));
          console.log('🎯 DEBUG: userFocus atual:', userFocus);
          // Corrige o foco do plano para usar o foco real do usuário
          const planCorrigido = corrigirFocoDoPlano(serverPlan, userFocus || 'Conhecimentos Gerais');
          console.log('🎯 DEBUG: Plano corrigido:', planCorrigido);
          setStudyPlan(planCorrigido);
          setCarregando(false);
          return;
        } else {
          console.log('🎯 DEBUG: Plano vazio ou inválido');
          // if serverPlan exists but is empty object, treat as no plan
          setStudyPlan(null);
        }
      } catch (e) {
        // ignore and fallback to localStorage
        console.error('🎯 DEBUG: Erro ao carregar do servidor:', e);
        console.warn('Could not fetch study plan from server, falling back to localStorage', e);
      }

      try {
        const savedPlanString = localStorage.getItem('studyPlan');
        if (savedPlanString) {
          const savedPlan = JSON.parse(savedPlanString);
          // Corrige o foco do plano para usar o foco real do usuário
          const planCorrigido = corrigirFocoDoPlano(savedPlan, userFocus || 'Conhecimentos Gerais');
          setStudyPlan(planCorrigido);
        }
      } catch (error) {
        console.error("Falha ao carregar o plano de estudo do localStorage:", error);
        setStudyPlan(null); // Garante que o estado é nulo se houver erro
      } finally {
        setCarregando(false);
      }
    })();

    // Leave isRefazerAtivo decision to separate effect that depends on studyPlan
  }, [level, blocosCompletos, userFocus]);

  // Decide if "Refazer Nivelamento" should be active:
  // - Active if user has NO study plan (encorajar criar um)
  // - OR if the current level's blocks are all complete
  useEffect(() => {
    const nivelAtualData = trilhaPrincipal.find(n => n.nivel === level);
    const todosBlocosCompletos = nivelAtualData ? nivelAtualData.blocos.every(bloco => blocosCompletos.includes(bloco.id)) : false;
    if (!studyPlan) {
      setIsRefazerAtivo(true);
    } else {
      setIsRefazerAtivo(todosBlocosCompletos);
    }
  }, [studyPlan, level, blocosCompletos]);

  const handleNavigateToQuiz = () => {
    navigate('/quiz-nivelamento');
  };

  if (carregando) {
    return <LoadingAnimation text="Carregando seu plano de estudo..." subtext="Aguarde enquanto buscamos seus dados." />;
  }

  return (
    <TooltipProvider>
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Link to="/dashboard">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Dashboard
          </Button>
        </Link>

        <main className="max-w-4xl mx-auto">
          {studyPlan ? (
            // --- Visualização do Plano de Estudo Existente ---
            <>
              <Card className="mb-6">
                <CardHeader className="bg-muted/30">
                  <CardTitle className="text-3xl font-bold text-center bg-gradient-primary bg-clip-text text-transparent">
                    Plano de Estudo Personalizado
                  </CardTitle>
                  <div className="text-center mt-3">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                      <span className="text-sm">🎯 Foco Principal:</span>
                      <span className="font-bold text-primary text-base">{userFocus || 'Conhecimentos Gerais'}</span>
                    </div>
                    <p className="text-muted-foreground text-sm mt-2">
                      Seu plano prioriza <strong>{userFocus || 'Conhecimentos Gerais'}</strong>, mas também inclui outras áreas essenciais
                    </p>
                  </div>
                </CardHeader>
                <CardContent>
                  <StudyPlanDisplay plan={studyPlan} userFocus={userFocus || 'Conhecimentos Gerais'} />
                </CardContent>
              </Card>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  size="lg" 
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => navigate('/dashboard')}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Ir para o Dashboard
                </Button>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Button 
                        size="lg" 
                        onClick={handleNavigateToQuiz} 
                        disabled={!isRefazerAtivo}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refazer Nivelamento
                      </Button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isRefazerAtivo ? (
                      <p>Parabéns! Você completou o nível e pode refazer o nivelamento.</p>
                    ) : (
                      <p>Complete todos os blocos do seu nível atual para refazer o nivelamento.</p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </div>
            </>
          ) : (
            // --- Card para Fazer o Quiz de Nivelamento ---
            <Card className="text-center p-8 sm:p-12 shadow-lg border-2 border-dashed">
              <CardHeader>
                <Rocket className="mx-auto h-20 w-20 text-primary mb-6 animate-pulse" />
                <CardTitle className="text-3xl sm:text-4xl font-bold mb-3">
                  Descubra Seu Caminho de Aprendizado!
                </CardTitle>
                {userFocus && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mt-2">
                    <span className="text-sm">🎯 Foco de Estudo:</span>
                    <span className="font-bold text-primary">{userFocus}</span>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto">
                  Faça nosso <strong>quiz de nivelamento inteligente</strong> e receba um plano de estudo 
                  completamente personalizado, estruturado em <strong>3 níveis progressivos</strong>:
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8">
                  <Card className="p-4 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                    <div className="text-3xl mb-2">🟢</div>
                    <p className="font-bold text-sm">Básico</p>
                    <p className="text-xs text-muted-foreground mt-1">Fundamentos essenciais</p>
                  </Card>
                  <Card className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800">
                    <div className="text-3xl mb-2">🟡</div>
                    <p className="font-bold text-sm">Intermediário</p>
                    <p className="text-xs text-muted-foreground mt-1">Consolidação do aprendizado</p>
                  </Card>
                  <Card className="p-4 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
                    <div className="text-3xl mb-2">🔴</div>
                    <p className="font-bold text-sm">Avançado</p>
                    <p className="text-xs text-muted-foreground mt-1">Domínio completo</p>
                  </Card>
                </div>

                <div className="bg-muted/50 rounded-lg p-6 space-y-3 text-left">
                  <p className="font-semibold flex items-center gap-2">
                    <span>✨</span> O que você vai receber:
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">📊</span>
                      <span>Análise detalhada dos seus <strong>acertos e erros</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">🎯</span>
                      <span>Identificação das suas <strong>áreas fortes e fracas</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">📚</span>
                      <span>Roteiro progressivo: do <strong>básico ao avançado</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">🚀</span>
                      <span>Sugestões personalizadas para <strong>acelerar seu aprendizado</strong></span>
                    </li>
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <Button 
                    size="lg" 
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => navigate('/dashboard')}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar ao Dashboard
                  </Button>
                  <Button size="lg" className="bg-gradient-growth" onClick={handleNavigateToQuiz}>
                    <BookOpenCheck className="h-4 w-4 mr-2" />
                    Iniciar Quiz de Nivelamento
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </TooltipProvider>
  );
};

export default StudyPlan;