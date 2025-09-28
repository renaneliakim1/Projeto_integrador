import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState, useMemo, useRef } from "react";
import { Bar, Radar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, RadialLinearScale } from 'chart.js';
import { getElementAtEvent } from 'react-chartjs-2';
import { CalendarioAtividades } from "@/components/ui/CalendarioAtividades";
import { useGamification } from "@/hooks/useGamification";
import { useToast } from "@/hooks/use-toast";
import { Flame, Star, Trophy, AreaChart, BarChart, ArrowLeft } from "lucide-react";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, RadialLinearScale);

// Estrutura de dados atualizada para as áreas da BNCC
const estatisticasPorArea = {
  "Linguagens e suas Tecnologias": [
    { nome: "Português", acertos: 75, erros: 25 },
    { nome: "Inglês", acertos: 68, erros: 32 },
  ],
  "Matemática e suas Tecnologias": [
    { nome: "Matemática", acertos: 88, erros: 12 },
  ],
  "Ciências da Natureza e suas Tecnologias": [
    { nome: "Física", acertos: 80, erros: 20 },
    { nome: "Química", acertos: 78, erros: 22 },
    { nome: "Biologia", acertos: 95, erros: 5 },
  ],
  "Ciências Humanas e Sociais Aplicadas": [
    { nome: "História", acertos: 92, erros: 8 },
    { nome: "Geografia", acertos: 85, erros: 15 },
    { nome: "Sociologia", acertos: 82, erros: 18 },
    { nome: "Filosofia", acertos: 79, erros: 21 },
  ],
};

// Função auxiliar para calcular o desempenho
const calculatePerformance = (items) => {
  const totalAcertos = items.reduce((sum, item) => sum + item.acertos, 0);
  const totalErros = items.reduce((sum, item) => sum + item.erros, 0);
  const total = totalAcertos + totalErros;
  return total > 0 ? Math.round((totalAcertos / total) * 100) : 0;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userName, setUserName] = useState('Usuário');
  const [chartType, setChartType] = useState('bar'); // 'barras' ou 'radar'
  const [currentView, setCurrentView] = useState('Visão Geral'); // 'visão geral' ou nome da área
  const [quizNivelamentoConcluido, setQuizNivelamentoConcluido] = useState(false);
  const chartRef = useRef<ChartJS>(null);

  const {
    level,
    xp,
    streak,
    dailyQuests,
    completeQuest,
  } = useGamification();

  useEffect(() => {
    const name = localStorage.getItem('userName');
    if (name) setUserName(name);
    
    const quizConcluido = localStorage.getItem('quizNivelamentoConcluido') === 'true';
    setQuizNivelamentoConcluido(quizConcluido);
  }, []);

  const handleNextExercise = () => {
    if (quizNivelamentoConcluido) {
      navigate('/trilha');
    } else {
      toast({
        title: "Quiz de Nivelamento Pendente",
        description: "Você precisa concluir o quiz de nivelamento antes de acessar as lições.",
        variant: "destructive",
      });
    }
  };

  const chartData = useMemo(() => {
    let labels;
    let performanceData;
    let errorData = [];

    if (currentView === 'Visão Geral') {
      labels = Object.keys(estatisticasPorArea);
      performanceData = labels.map(area => calculatePerformance(estatisticasPorArea[area]));
      if (chartType === 'bar') {
        errorData = labels.map(area => 100 - calculatePerformance(estatisticasPorArea[area]));
      }
    } else {
      const subjects = estatisticasPorArea[currentView];
      labels = subjects.map(m => m.nome);
      performanceData = subjects.map(m => {
        const total = m.acertos + m.erros;
        return total ? Math.round((m.acertos / total) * 100) : 0;
      });
      if (chartType === 'bar') {
        errorData = subjects.map(m => {
          const total = m.acertos + m.erros;
          return total ? Math.round((m.erros / total) * 100) : 0;
        });
      }
    }

    const datasets = [
      {
        label: '% de Acertos',
        data: performanceData,
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
        barPercentage: 0.5,
        categoryPercentage: 0.5,
      });
    }

    return { labels, datasets };
  }, [currentView, chartType]);

  const handleChartClick = (event) => {
    if (currentView !== 'Visão Geral' || !chartRef.current) return;
    const element = getElementAtEvent(chartRef.current, event);
    if (element.length > 0) {
      const dataIndex = element[0].index;
      const area = chartData.labels[dataIndex];
      if (estatisticasPorArea[area]) {
        setCurrentView(area);
      }
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <img src={`https://api.dicebear.com/8.x/adventurer/tsx?seed=${userName}`} alt="Foto de perfil" className="w-20 h-20 rounded-full border-2 border-primary shadow-glow object-cover" />
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">Bem-vindo, {userName}!</h2>
            <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2 text-sm sm:text-base">
              <span className="flex items-center text-muted-foreground"><Star className="w-4 h-4 mr-1 text-amber-400"/>Nível: <b className="ml-1 text-primary">{level}</b></span>
              <span className="flex items-center text-muted-foreground"><Trophy className="w-4 h-4 mr-1 text-amber-400"/>Pontos: <b className="ml-1 text-primary">{xp} XP</b></span>
              {streak > 0 && <span className="flex items-center text-muted-foreground"><Flame className="w-4 h-4 mr-1 text-orange-500"/>Sequência: <b className="ml-1 text-orange-500">{streak} dias</b></span>}
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          {quizNivelamentoConcluido ? (
            <Link to="/study-plan" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full">Meu Plano de Estudo</Button>
            </Link>
          ) : (
            <Link to="/quiz-nivelamento" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full">Fazer Quiz de nivelamento</Button>
            </Link>
          )}
          <Button size="lg" className="bg-gradient-knowledge shadow-glow w-full sm:w-auto" onClick={handleNextExercise}>Próxima Lição</Button>
        </div>
      </header>

      <main className="flex flex-col gap-8">
        <CalendarioAtividades />

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
            {dailyQuests.map(quest => (
              <div key={quest.id} className={`flex items-center gap-4 p-3 rounded-lg transition-all ${quest.isCompleted ? 'bg-green-500/10' : 'bg-muted/50'}`}>
                <Checkbox id={quest.id} checked={quest.isCompleted} disabled className="data-[state=checked]:border-green-500 data-[state=checked]:bg-green-500" />
                <label htmlFor={quest.id} className={`flex-1 text-sm ${quest.isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                  {quest.description}
                </label>
                {!quest.isCompleted && <Button size="sm" variant="outline" onClick={() => completeQuest(quest.id)}>+50 XP</Button>}
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;