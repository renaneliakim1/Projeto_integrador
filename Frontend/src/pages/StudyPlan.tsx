import { useState, useEffect } from 'react';
import apiClient from '@/api/axios';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ArrowLeft, BookOpenCheck } from 'lucide-react';
import { useGamification } from '@/hooks/useGamification';
import { Separator } from '@/components/ui/separator';
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
      <div className="p-8 sm:p-12 text-center space-y-6">
        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center animate-pulse">
          <BookOpenCheck className="h-10 w-10 text-primary" />
        </div>
        <h3 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Plano de Estudo em Construção
        </h3>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
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
      {/* Cabeçalho do Plano - Sóbrio e Profissional */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-full mb-2">
          <span className="text-xs font-semibold text-primary uppercase tracking-wide">Análise Personalizada</span>
        </div>
        <h3 className="text-2xl sm:text-3xl font-bold text-foreground">
          {plan.title || 'Seu Plano de Estudo Personalizado'}
        </h3>
        <p className="text-muted-foreground text-sm max-w-2xl mx-auto">
          {plan.greeting || ''}
        </p>
      </div>

      <Separator className="my-6" />

      {/* Raio-X do Conhecimento - Compacto */}
      <div className="space-y-4">
        <h4 className="font-bold text-lg flex items-center gap-2">
          <span className="text-primary">📊</span>
          Análise do Seu Desempenho
        </h4>
        <Card className="border border-border shadow-sm">
          <CardContent className="p-6 space-y-4">
            <p className="text-sm leading-relaxed text-muted-foreground">{plan.analysis.summary || ''}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Áreas de Atenção */}
              <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-border/50">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🎯</span>
                  <p className="font-semibold text-sm text-foreground">
                    Pontos de Atenção
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {focusPoints.map((point, idx) => (
                    <span 
                      key={idx} 
                      className="px-3 py-1 bg-secondary/10 text-secondary rounded-md text-xs font-medium"
                    >
                      {point}
                    </span>
                  ))}
                </div>
              </div>

              {/* Ponto Forte */}
              <div className="space-y-3 p-4 bg-green-500/5 dark:bg-green-500/10 rounded-lg border border-green-500/30 dark:border-green-500/20">
                <div className="flex items-center gap-2">
                  <span className="text-lg">✓</span>
                  <p className="font-semibold text-sm text-green-600 dark:text-green-500">
                    Ponto Forte
                  </p>
                </div>
                <span className="inline-block px-3 py-1 bg-green-500/10 dark:bg-green-500/20 text-green-600 dark:text-green-500 rounded-md text-xs font-medium">
                  {plan.analysis.strength || 'Identificando...'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plano de Ação - Design Profissional */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-lg flex items-center gap-2">
            <span className="text-primary">📚</span>
            Áreas de Estudo Recomendadas
          </h4>
          {userFocus && userFocus !== 'Conhecimentos Gerais' && (
            <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
              Foco: {userFocus}
            </span>
          )}
        </div>
        
        <div className="space-y-4">
          {actionPlanOrdenado.map((action: StudyPlanAction, index: number) => {
            const ehFocoPrincipal = action.area.toLowerCase().includes((userFocus || '').toLowerCase());
            
            // Cores modernas do design system
            const cores = [
              { borderColor: 'border-l-primary', bgColor: 'bg-primary/5' },
              { borderColor: 'border-l-secondary', bgColor: 'bg-secondary/5' },
              { borderColor: 'border-l-accent', bgColor: 'bg-accent/5' },
              { borderColor: 'border-l-warning', bgColor: 'bg-warning/5' },
              { borderColor: 'border-l-destructive', bgColor: 'bg-destructive/5' },
              { borderColor: 'border-l-success', bgColor: 'bg-success/5' },
            ];
            
            const corInfo = cores[index % cores.length];

            return (
              <Card 
                key={index} 
                className={`border-l-4 ${corInfo.borderColor} ${corInfo.bgColor} ${ehFocoPrincipal ? 'ring-2 ring-primary/30' : ''} hover:shadow-md transition-shadow`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-background rounded-lg flex items-center justify-center shadow-sm">
                      <span className="text-2xl">{action.emoji}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="text-base font-bold">{action.area}</CardTitle>
                        {ehFocoPrincipal && (
                          <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs font-semibold rounded">
                            Foco Principal
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {(action.topics || []).length} {(action.topics || []).length === 1 ? 'tópico' : 'tópicos'}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 pb-4">
                  <div className="space-y-3">
                    {(action.topics || []).map((topic: StudyPlanTopic, i: number) => {
                      const topicoEnriquecido = enriquecerTopico(action.area, topic, i);
                      return (
                        <div key={i} className="p-3 bg-background/80 rounded-md border border-border/50">
                          <div className="flex items-start gap-2">
                            <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 bg-primary text-primary-foreground font-semibold text-xs rounded">
                              {i + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm leading-snug mb-1">
                                {topicoEnriquecido.title}
                              </p>
                              {topicoEnriquecido.description && (
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  {topicoEnriquecido.description}
                                </p>
                              )}
                            </div>
                          </div>
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

      <Separator className="my-6" />

      {/* Próximo Desafio - Compacto e Elegante */}
      <div className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg border border-border">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-background rounded-full shadow-sm">
            <span className="text-lg">🎯</span>
            <h4 className="font-bold text-sm">{plan.nextChallenge?.title || 'Próxima Etapa'}</h4>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            {plan.nextChallenge?.suggestion || ''}
          </p>
          <p className="font-semibold text-primary text-sm">
            {plan.motivation || '💪 Continue sua jornada de aprendizado!'}
          </p>
        </div>
      </div>
    </div>
  );
};

const StudyPlan = () => {
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [carregando, setCarregando] = useState(true);
  const navigate = useNavigate();
  const { userFocus } = useGamification();

  const carregarPlano = async () => {
    try {
      setCarregando(true);
      console.log('🔍 StudyPlan: Carregando plano de estudo...');
      const resp = await apiClient.get('/users/me/');
      console.log('🔍 StudyPlan: Resposta completa:', resp.data);
      
      let serverPlan = resp.data?.profile?.study_plan;
      console.log('🔍 StudyPlan: study_plan bruto:', serverPlan);
      console.log('🔍 StudyPlan: Tipo do study_plan:', typeof serverPlan);
      
      if (typeof serverPlan === 'string') {
        try {
          serverPlan = JSON.parse(serverPlan);
          console.log('🔍 StudyPlan: study_plan após parse:', serverPlan);
        } catch (e) {
          console.error('❌ StudyPlan: Erro ao fazer parse do plano:', e);
          serverPlan = null;
        }
      }
      
      // Verifica se é um objeto vazio {} ou null
      if (serverPlan && typeof serverPlan === 'object' && Object.keys(serverPlan).length > 0) {
        console.log('✅ StudyPlan: Plano encontrado com', Object.keys(serverPlan).length, 'chaves');
        setStudyPlan(serverPlan);
        // Remove o flag após carregar com sucesso
        sessionStorage.removeItem('justFinishedQuiz');
      } else {
        console.log('❌ StudyPlan: Nenhum plano encontrado ou plano vazio');
        setStudyPlan(null);
      }
    } catch (e) {
      console.error('❌ StudyPlan: Erro ao carregar plano de estudo:', e);
      setStudyPlan(null);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarPlano();
  }, []);

  if (carregando) {
    return <LoadingAnimation text="Carregando seu plano de estudo..." subtext="Aguarde enquanto buscamos seus dados." />;
  }

  return (
    <TooltipProvider>
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 max-w-5xl">
        <Link to="/dashboard">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>

        <main>
          {studyPlan ? (
            // --- Visualização do Plano de Estudo ---
            <div className="space-y-6">
              <Card className="border border-border shadow-sm">
                <CardHeader className="pb-4 border-b">
                  <div className="text-center space-y-3">
                    <CardTitle className="text-2xl font-bold">
                      Plano de Estudo Personalizado
                    </CardTitle>
                    {userFocus && userFocus !== 'Conhecimentos Gerais' && (
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg">
                        <span className="text-sm">🎯</span>
                        <span className="text-sm font-medium">Foco Principal:</span>
                        <span className="text-sm font-bold text-primary">{userFocus}</span>
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
                      Recomendações baseadas no seu desempenho no quiz de nivelamento
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <StudyPlanDisplay plan={studyPlan} userFocus={userFocus || 'Conhecimentos Gerais'} />
                </CardContent>
              </Card>

              {/* Botão de Voltar */}
              <div className="flex justify-center">
                <Button 
                  className="bg-secondary hover:bg-secondary/90 text-white shadow-orange-glow"
                  size="lg" 
                  onClick={() => navigate('/dashboard')}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Ir para Dashboard
                </Button>
              </div>
            </div>
          ) : (
            // --- Mensagem quando não há plano ---
            <Card className="max-w-xl mx-auto">
              <CardContent className="p-8 text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-2">
                  <BookOpenCheck className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold">Nenhum Plano Encontrado</h3>
                <p className="text-sm text-muted-foreground">
                  Complete o quiz de nivelamento para gerar seu plano de estudo personalizado.
                </p>
                <div className="flex gap-3 justify-center pt-2">
                  <Button 
                    onClick={carregarPlano}
                    variant="outline"
                    disabled={carregando}
                  >
                    {carregando ? 'Carregando...' : 'Recarregar'}
                  </Button>
                  <Button 
                    onClick={() => navigate('/dashboard')}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar
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