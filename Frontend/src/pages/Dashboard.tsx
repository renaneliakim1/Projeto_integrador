import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate, Link } from "react-router-dom";
import React, { useEffect, useState, useMemo, useRef } from "react";
import { Bar, Radar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, RadialLinearScale } from 'chart.js';
import { getElementAtEvent } from 'react-chartjs-2';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Flame, Star, Trophy, AreaChart, BarChart, ArrowLeft, Loader2, CheckCircle, Calendar, TrendingUp, TrendingDown, ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, type DayContentProps } from 'react-day-picker';
import { ptBR } from 'date-fns/locale';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useDashboardData } from "@/hooks/useDashboardData";
import { useGamification } from "@/hooks/useGamification";
import { trilhaPrincipal } from '@/data/trilhaPrincipal';

/* eslint-disable @typescript-eslint/no-explicit-any */

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, RadialLinearScale);

// Tipos e Funções do Calendário
type Activity = {
  date: Date;
  type: 'pratica' | 'falha';
};

const calculateStats = (activities: Activity[]) => {
    const sortedActivities = [...activities].sort((a, b) => a.date.getTime() - b.date.getTime());
    let longestPracticeStreak = 0;
    let currentPracticeStreak = 0;
    let longestFailureStreak = 0;
    let currentFailureStreak = 0;
    const totalPracticeDays = new Set(activities.filter(a => a.type === 'pratica').map(a => a.date.toDateString())).size;
    let lastDate: Date | null = null;

    sortedActivities.forEach(activity => {
        const currentDate = new Date(activity.date.getFullYear(), activity.date.getMonth(), activity.date.getDate());
        const lastDateOnly = lastDate ? new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate()) : null;

        if (activity.type === 'pratica') {
            if (lastDateOnly && (currentDate.getTime() - lastDateOnly.getTime()) / (1000 * 3600 * 24) === 1) {
                currentPracticeStreak++;
            } else if (!lastDateOnly || (currentDate.getTime() - lastDateOnly.getTime()) / (1000 * 3600 * 24) > 1) {
                currentPracticeStreak = 1;
            }
            longestPracticeStreak = Math.max(longestPracticeStreak, currentPracticeStreak);
            currentFailureStreak = 0;
        } else if (activity.type === 'falha') {
            if (lastDateOnly && (currentDate.getTime() - lastDateOnly.getTime()) / (1000 * 3600 * 24) === 1) {
                currentFailureStreak++;
            } else if (!lastDateOnly || (currentDate.getTime() - lastDateOnly.getTime()) / (1000 * 3600 * 24) > 1) {
                currentFailureStreak = 1;
            }
            longestFailureStreak = Math.max(longestFailureStreak, currentFailureStreak);
            currentPracticeStreak = 0;
        }
        lastDate = activity.date;
    });

    return { longestPracticeStreak, longestFailureStreak, totalPracticeDays };
};

function CustomDayContent(props: DayContentProps) {
    const { activeModifiers: modifiers, date } = props;
    const isOutside = modifiers.outside;

    return (
        <div className={cn("relative flex flex-col items-center justify-center w-full h-full", {
            "font-bold text-primary": modifiers.today && !isOutside
        })}>
            <span>{date.getDate()}</span>
            {!isOutside && (modifiers.practice || modifiers.failure) && (
                <div className="absolute -bottom-1">
                    <Flame className={cn(
                        "h-4 w-4",
                        modifiers.practice && "text-yellow-500",
                        modifiers.failure && "text-blue-500"
                    )} />
                </div>
            )}
        </div>
    );
}

// Função auxiliar para calcular o desempenho
const calculatePerformance = (subjects: any[]) => {
  const totalAcertos = subjects.reduce((sum: number, item: any) => sum + (item.correct_answers || 0), 0);
  const totalErros = subjects.reduce((sum: number, item: any) => sum + (item.incorrect_answers || 0), 0);
  const total = totalAcertos + totalErros;
  return total > 0 ? Math.round((totalAcertos / total) * 100) : 0;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [chartType, setChartType] = useState('bar');
  const [currentView, setCurrentView] = useState('Visão Geral');
  const chartRef = useRef<any>(null);

  const { userData, performanceData, activities: apiActivities, isLoading, refetchData, error } = useDashboardData();
  const { level, xp, streak, dailyQuests, blocosCompletos, hearts, nextRefillInSeconds } = useGamification();

  // determine if user has a study plan
  const studyPlan = (userData?.profile as any)?.study_plan ?? null;

  // Lógica para o botão de Nivelamento/Plano de Estudo
  // initialQuizDone: true if user has performance data (quiz completed)
  const initialQuizDone = useMemo(() => {
    // Considera quiz feito se há dados de performance com respostas registradas
    if (performanceData && performanceData.length > 0) {
      const hasAnyAnswers = performanceData.some(area =>
        area.subjects.some(subject => 
          subject.correct_answers > 0 || subject.incorrect_answers > 0
        )
      );
      return hasAnyAnswers;
    }
    return false;
  }, [performanceData]);
  const blockCountOnQuizStart = parseInt(localStorage.getItem('blockCountOnQuizStart') || '0', 10);
  // canRetakeQuiz: only allow retake if user has completed at least one full level
  const hasCompletedAnyLevel = useMemo(() => {
    if (!blocosCompletos) return false;
    return trilhaPrincipal.some(nivel => nivel.blocos.every(b => blocosCompletos.includes(b.id)));
  }, [blocosCompletos]);
  const canRetakeQuiz = useMemo(() => {
    if (!blocosCompletos) return false;
    // require that user completed a level and progressed beyond the block count recorded at quiz start
    return hasCompletedAnyLevel && blocosCompletos.length > blockCountOnQuizStart;
  }, [blocosCompletos, blockCountOnQuizStart, hasCompletedAnyLevel]);

  const activities = useMemo(() => {
    if (!apiActivities) return [];
    return apiActivities.map(a => ({ ...a, date: new Date(a.date) }));
  }, [apiActivities]);

  const activityStats = useMemo(() => calculateStats(activities), [activities]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
        toast({ title: "Erro", description: "Não foi possível carregar os dados do dashboard.", variant: "destructive" });
    }
  }, [error, toast]);

  useEffect(() => {
    const justFinishedQuiz = sessionStorage.getItem('justFinishedQuiz') === 'true';
    if (justFinishedQuiz) {
      sessionStorage.removeItem('justFinishedQuiz');
      // Força um refresh dos dados para atualizar pontos e atividades
      setTimeout(() => {
        refetchData();
      }, 1000);
    }
  }, [refetchData]);

  const handleNextExercise = () => {
    if (initialQuizDone) {
      // Se não tem vidas mas já fez o quiz, mostra mensagem informativa
      if (hearts <= 0) {
        const minutes = nextRefillInSeconds ? Math.floor(nextRefillInSeconds / 60) : 0;
        const seconds = nextRefillInSeconds ? nextRefillInSeconds % 60 : 0;
        toast({
          title: "Sem vidas disponíveis! 💔",
          description: `Você pode visualizar a trilha, mas não poderá iniciar novos blocos. ${
            nextRefillInSeconds 
              ? `Próxima vida em ${minutes}m ${seconds}s.` 
              : 'As vidas recarregam a cada 3 minutos.'
          }`,
          variant: "default",
        });
      }
      navigate('/trilha');
    } else {
      // Apenas impede se realmente não tiver feito o quiz
      toast({
        title: "Quiz de Nivelamento Pendente",
        description: "Você precisa concluir o quiz de nivelamento antes de acessar as lições.",
        variant: "destructive",
      });
      // Redireciona para o quiz
      navigate('/quiz-nivelamento');
    }
  };

  const chartData = useMemo(() => {
    if (!performanceData || performanceData.length === 0) {
      return { labels: [], datasets: [] };
    }

    let labels: string[];
    let performanceDataset: number[];
    let errorData: number[] = [];

    if (currentView === 'Visão Geral') {
      labels = performanceData.map(area => area.area_name);
      performanceDataset = performanceData.map(area => calculatePerformance(area.subjects));
      if (chartType === 'bar') {
        errorData = performanceDataset.map(p => 100 - p);
      }
    } else {
      const area = performanceData.find(a => a.area_name === currentView);
      if (!area) return { labels: [], datasets: [] };

      labels = area.subjects.map(m => m.subject_name);
      performanceDataset = area.subjects.map(m => {
        const total = m.correct_answers + m.incorrect_answers;
        return total > 0 ? Math.round((m.correct_answers / total) * 100) : 0;
      });
      if (chartType === 'bar') {
        errorData = area.subjects.map(m => {
          const total = m.correct_answers + m.incorrect_answers;
          return total > 0 ? Math.round((m.incorrect_answers / total) * 100) : 0;
        });
      }
    }

    const datasets = [
      {
        label: '% de Acertos',
        data: performanceDataset,
        backgroundColor: chartType === 'bar' ? '#22c55e' : 'rgba(54, 162, 235, 0.5)',
        borderColor: chartType === 'bar' ? undefined : 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
        barPercentage: 0.5,
        categoryPercentage: 0.5,
        pointBackgroundColor: 'rgba(54, 162, 235, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(54, 162, 235, 1)',
      },
    ];

    if (chartType === 'bar') {
      datasets.push({
        label: '% de Erros',
        data: errorData,
        backgroundColor: '#ef4444',
        borderColor: '#dc2626',
        borderWidth: 1,
        barPercentage: 0.5,
        categoryPercentage: 0.5,
        pointBackgroundColor: '#dc2626',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#dc2626',
      });
    }

    return { labels, datasets };
  }, [currentView, chartType, performanceData]);

  const handleChartClick = (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (currentView !== 'Visão Geral' || !chartRef.current) return;
    const element = getElementAtEvent(chartRef.current, event);
    if (element.length > 0) {
      const dataIndex = element[0].index;
      const areaName = chartData.labels[dataIndex];
      if (performanceData && performanceData.some(a => a.area_name === areaName)) {
        setCurrentView(areaName);
      }
    }
  };

  const userName = userData?.first_name || 'Usuário';
  const profilePicture = userData?.profile?.foto || `https://api.dicebear.com/8.x/adventurer/tsx?seed=${userName}`;

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-screen">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }

  // Corrigir o calendário: marcar dias baseados em atividades reais
  // Normaliza as datas para comparação correta (ignora horas e timezone)
  const practiceDays = activities
    .filter(a => a.type === 'pratica')
    .map(a => {
      // Parse da string de data ISO (YYYY-MM-DD) sem considerar timezone
      const dateStr = typeof a.date === 'string' ? a.date : a.date.toISOString().split('T')[0];
      const [year, month, day] = dateStr.split('-').map(Number);
      // Cria data no timezone local (sem conversão UTC)
      return new Date(year, month - 1, day);
    });
    
  const failureDays = activities
    .filter(a => a.type === 'falha')
    .map(a => {
      // Parse da string de data ISO (YYYY-MM-DD) sem considerar timezone
      const dateStr = typeof a.date === 'string' ? a.date : a.date.toISOString().split('T')[0];
      const [year, month, day] = dateStr.split('-').map(Number);
      // Cria data no timezone local (sem conversão UTC)
      return new Date(year, month - 1, day);
    });

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <img src={profilePicture} alt="Foto de perfil" className="w-20 h-20 rounded-full border-2 border-primary shadow-glow object-cover" />
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">Bem-vindo, {userName}!</h2>
            <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2 text-sm sm:text-base">
              <span className="flex items-center text-muted-foreground"><Star className="w-4 h-4 mr-1 text-amber-400"/>Nível: <b className="ml-1 text-primary">{level}</b></span>
              <span className="flex items-center text-muted-foreground"><Trophy className="w-4 h-4 mr-1 text-amber-400"/>Pontos: <b className="ml-1 text-primary">{xp} XP</b></span>
              {streak && streak > 0 && <span className="flex items-center text-muted-foreground"><Flame className="w-4 h-4 mr-1 text-orange-500"/>Sequência: {streak} dias</span>}
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          {!initialQuizDone ? (
            <Link to="/quiz-nivelamento" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full">Fazer Quiz de nivelamento</Button>
            </Link>
          ) : (
            <>
              {studyPlan && (
                <Link to="/study-plan" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full">Meu Plano de Estudo</Button>
                </Link>
              )}
              {canRetakeQuiz && (
                <Link to="/quiz-nivelamento" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full">Refazer Quiz</Button>
                </Link>
              )}
            </>
          )}
          <Button size="lg" className="bg-gradient-knowledge shadow-glow w-full sm:w-auto" onClick={handleNextExercise}>Próxima Lição</Button>
        </div>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-3 flex flex-col gap-8">
            <Card className="p-4 sm:p-6 flex flex-col gap-4 col-span-1 md:col-span-2 bg-gradient-subtle shadow-elegant">
                <CardHeader className="p-0">
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-primary">
                    <Calendar className="h-5 w-5 sm:h-6 sm:w-6" />
                    Meu Calendário de Atividades
                    </CardTitle>
                </CardHeader>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 flex justify-center">
                        <DayPicker
                            mode="multiple"
                            locale={ptBR}
                            showOutsideDays
                            fixedWeeks
                            modifiers={{
                                practice: practiceDays,
                                failure: failureDays,
                            }}
                            classNames={{
                                root: 'p-3',
                                months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
                                month: 'space-y-4',
                                caption: 'flex justify-center pt-1 relative items-center',
                                caption_label: 'text-sm font-medium',
                                nav: 'space-x-1 flex items-center',
                                nav_button: cn(
                                buttonVariants({ variant: 'outline' }),
                                'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100'
                                ),
                                nav_button_previous: 'absolute left-1',
                                nav_button_next: 'absolute right-1',
                                table: 'w-full border-collapse space-y-1',
                                head_row: 'flex',
                                head_cell: 'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
                                row: 'flex w-full mt-2',
                                cell: 'h-10 w-10 text-center text-sm p-0',
                                day: 'h-10 w-10 p-0 font-normal',
                                day_today: 'text-primary',
                                day_outside: 'text-muted-foreground opacity-50',
                                day_disabled: 'text-muted-foreground opacity-50',
                                day_hidden: 'invisible',
                            }}
                            components={{
                                DayContent: CustomDayContent,
                                IconLeft: () => <ChevronLeft className="h-4 w-4" />,
                                IconRight: () => <ChevronRight className="h-4 w-4" />,
                            }}
                        />
                    </div>
                    <div className="flex flex-col gap-4 justify-center lg:border-l lg:pl-6">
                        <h3 className="text-lg font-semibold mb-2 text-center lg:text-left">Estatísticas de Atividade</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                                <TrendingUp className="h-8 w-8 text-yellow-500 flex-shrink-0" />
                                <div>
                                    <p className="font-bold text-2xl">{activityStats.longestPracticeStreak}</p>
                                    <p className="text-sm text-muted-foreground">Maior sequência de práticas</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                                <Flame className="h-8 w-8 text-blue-500 flex-shrink-0" />
                                <div>
                                    <p className="font-bold text-2xl">{activityStats.longestFailureStreak}</p>
                                    <p className="text-sm text-muted-foreground">Maior sequência de falhas</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                                <CheckCircle className="h-8 w-8 text-primary flex-shrink-0" />
                                <div>
                                    <p className="font-bold text-2xl">{activityStats.totalPracticeDays}</p>
                                    <p className="text-sm text-muted-foreground">Total de dias praticados</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                    {currentView !== 'Visão Geral' && (
                        <Button variant="outline" size="icon" onClick={() => setCurrentView('Visão Geral')}>
                        <ArrowLeft className="h-4 w-4" />
                        </Button>
                    )}
                    <CardTitle>
                        {currentView === 'Visão Geral' ? 'Desempenho por Área da BNCC' : `Desempenho em ${currentView}`}
                    </CardTitle>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setChartType(prev => prev === 'bar' ? 'radar' : 'bar')}>
                    {chartType === 'bar' ? <AreaChart className="w-4 h-4 mr-2" /> : <BarChart className="w-4 h-4 mr-2" />}
                    {chartType === 'bar' ? 'Gráfico de Rede' : 'Gráfico de Barras'}
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="min-h-[350px] w-full">
                    {chartType === 'bar' ? (
                        <Bar
                        ref={chartRef}
                        data={chartData}
                        onClick={handleChartClick}
                        options={{ responsive: true, maintainAspectRatio: false, scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true, max: 100 } }, plugins: { legend: { display: true } } }}
                        />
                    ) : (
                        <Radar
                        ref={chartRef}
                        data={chartData}
                        options={{
                            maintainAspectRatio: false,
                            plugins: { legend: { display: false } },
                            scales: {
                            r: {
                                max: 100,
                                min: 0,
                                backgroundColor: '#1f2937',
                                grid: { color: 'rgba(255, 255, 255, 0.2)' },
                                angleLines: { color: 'rgba(255, 255, 255, 0.2)' },
                                pointLabels: { font: { size: 12, weight: 'bold' }, color: 'text-foreground' },
                                ticks: { display: false }
                            }
                            }
                        }}
                        />
                    )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Missões Diárias</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {dailyQuests && dailyQuests.map(quest => (
                    <div key={quest.quest.id} className={`flex items-center gap-4 p-3 rounded-lg transition-all ${quest.is_completed ? 'bg-green-500/10' : 'bg-muted/50'}`}>
                        <Checkbox id={quest.quest.id} checked={quest.is_completed} disabled className="data-[state=checked]:border-green-500 data-[state=checked]:bg-green-500" />
                        <label htmlFor={quest.quest.id} className={`flex-1 text-sm ${quest.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                        {quest.quest.description}
                        </label>
                        {!quest.is_completed && <span className="text-sm text-muted-foreground">+{quest.quest.xp_reward} XP</span>}
                    </div>
                    ))}
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
