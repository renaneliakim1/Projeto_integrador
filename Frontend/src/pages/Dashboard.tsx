import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Pie, Doughnut, Bar, Line } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement } from 'chart.js';
Chart.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement);

// Dados mockados avançados
const userData = {
  nome: "João Silva",
  fotoPerfil: "/assets/mascot.png",
  pontuacao: 1200,
  nivel: "Intermediário",
  areaFavorita: "Matemática",
  proximaAtividade: "Exercício de Matemática",
  posicaoRanking: 7,
  estatisticas: {
    acertos: 85,
    erros: 15,
    tempoEstudo: "2h 30min",
  },
};

const estatisticasAvancadas = {
  materias: [
    { nome: "Matemática", acertos: 30, erros: 5 },
    { nome: "Português", acertos: 20, erros: 10 },
    { nome: "História", acertos: 15, erros: 8 },
    { nome: "Geografia", acertos: 10, erros: 7 },
    { nome: "Física", acertos: 10, erros: 3 },
  ],
  tempoPorMateria: [
    { nome: "Matemática", tempo: 60 },
    { nome: "Português", tempo: 45 },
    { nome: "História", tempo: 30 },
    { nome: "Geografia", tempo: 25 },
    { nome: "Física", tempo: 20 },
  ],
  diasPraticados: [
    { nome: "Matemática", dias: [1, 1, 0, 1, 1, 0, 1] }, // 1=praticou, 0=não
    { nome: "Português", dias: [1, 0, 1, 1, 0, 1, 1] },
    { nome: "História", dias: [0, 1, 1, 0, 1, 1, 1] },
    { nome: "Geografia", dias: [1, 1, 0, 1, 0, 1, 0] },
    { nome: "Física", dias: [1, 1, 1, 1, 1, 1, 1] },
  ],
};
      {/* Gráfico de barras: Acertos/Erros por matéria em % */}
      <Card className="p-6 flex flex-col gap-2 col-span-1 md:col-span-2">
        <span className="text-lg font-semibold mb-2">Desempenho por Matéria (%)</span>
        <div style={{ height: 220, width: '100%', maxWidth: 500, margin: '0 auto' }}>
          <Bar
            data={{
              labels: estatisticasAvancadas.materias.map(m => m.nome),
              datasets: [
                {
                  label: 'Acertos (%)',
                  data: estatisticasAvancadas.materias.map(m => {
                    const total = m.acertos + m.erros;
                    return total ? Math.round((m.acertos / total) * 100) : 0;
                  }),
                  backgroundColor: '#22c55e',
                },
                {
                  label: 'Erros (%)',
                  data: estatisticasAvancadas.materias.map(m => {
                    const total = m.acertos + m.erros;
                    return total ? Math.round((m.erros / total) * 100) : 0;
                  }),
                  backgroundColor: '#ef4444',
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { display: true, position: 'top' },
                tooltip: { enabled: true },
              },
              scales: {
                x: { stacked: true },
                y: { stacked: true, beginAtZero: true, max: 100 },
              },
            }}
          />
        </div>
      </Card>
      {/* Gráfico de linha: Dias praticados por matéria/disciplina */}
      <Card className="p-6 flex flex-col gap-2 col-span-1 md:col-span-2">
        <span className="text-lg font-semibold mb-2">Sequência de Dias Praticados por Matéria</span>
        <div style={{ height: 220, width: '100%', maxWidth: 500, margin: '0 auto' }}>
          <Line
            data={{
              labels: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
              datasets: estatisticasAvancadas.diasPraticados.map(m => ({
                label: m.nome,
                data: m.dias,
                borderColor: undefined,
                backgroundColor: undefined,
                pointBackgroundColor: undefined,
              })).map((ds, i) => ({
                ...ds,
                borderColor: ["#6366f1", "#22c55e", "#ef4444", "#eab308", "#0ea5e9"][i % 5],
                backgroundColor: ["rgba(99,102,241,0.2)", "rgba(34,197,94,0.2)", "rgba(239,68,68,0.2)", "rgba(234,179,8,0.2)", "rgba(14,165,233,0.2)"][i % 5],
                pointBackgroundColor: ["#6366f1", "#22c55e", "#ef4444", "#eab308", "#0ea5e9"][i % 5],
                tension: 0.3,
                fill: false,
              })),
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { display: true, position: 'top' },
                tooltip: { enabled: true },
              },
              scales: {
                y: { beginAtZero: true, max: 1, ticks: { stepSize: 1 } },
              },
            }}
          />
        </div>
      </Card>

      {/* Gráfico de linha: Tempo de estudo por matéria */}
      <Card className="p-6 flex flex-col gap-2 col-span-1 md:col-span-2">
        <span className="text-lg font-semibold mb-2">Tempo de Estudo por Matéria (min)</span>
        <div style={{ height: 220, width: '100%', maxWidth: 500, margin: '0 auto' }}>
          <Line
            data={{
              labels: estatisticasAvancadas.tempoPorMateria.map(m => m.nome),
              datasets: [
                {
                  label: 'Tempo (min)',
                  data: estatisticasAvancadas.tempoPorMateria.map(m => m.tempo),
                  borderColor: '#6366f1',
                  backgroundColor: 'rgba(99,102,241,0.2)',
                  tension: 0.3,
                  fill: true,
                  pointBackgroundColor: '#6366f1',
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { display: true, position: 'top' },
                tooltip: { enabled: true },
              },
              scales: {
                y: { beginAtZero: true },
              },
            }}
          />
        </div>
      </Card>

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Exemplo: redirecionar se não estiver logado
    // if (!usuarioLogado) navigate("/login");
  }, [navigate]);

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Dados do usuário */}
      <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
        <img src={userData.fotoPerfil} alt="Foto de perfil" className="w-20 h-20 rounded-full border-2 border-primary shadow-glow object-cover" />
        <div className="flex-1">
          <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">{userData.nome}</h2>
          <div className="flex flex-wrap gap-4 mt-2">
            <span className="text-base text-muted-foreground">Área favorita: <span className="font-bold text-primary">{userData.areaFavorita}</span></span>
            <span className="text-base text-muted-foreground">Nível: <span className="font-bold text-gradient-knowledge">{userData.nivel}</span></span>
            <span className="text-base text-muted-foreground">Ranking: <span className="font-bold text-warning">#{userData.posicaoRanking}</span></span>
            <span className="text-base text-muted-foreground">Pontuação: <span className="font-bold text-primary">{userData.pontuacao}</span></span>
          </div>
        </div>
        <Button variant="outline" size="sm" className="ml-auto" onClick={() => navigator.share ? navigator.share({ title: 'Meu progresso no EdGame', text: `Veja meu desempenho! Pontuação: ${userData.pontuacao}` }) : alert('Compartilhamento não suportado')}>Compartilhar</Button>
      </div>

      {/* Gráficos de desempenho */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Gráfico de barras: Acertos/Erros por matéria em % */}
        <Card className="p-6 flex flex-col gap-2 col-span-1 md:col-span-2">
          <span className="text-lg font-semibold mb-2">Desempenho por Matéria (%)</span>
          <div style={{ height: 220, width: '100%', maxWidth: 500, margin: '0 auto' }}>
            <Bar
              data={{
                labels: estatisticasAvancadas.materias.map(m => m.nome),
                datasets: [
                  {
                    label: 'Acertos (%)',
                    data: estatisticasAvancadas.materias.map(m => {
                      const total = m.acertos + m.erros;
                      return total ? Math.round((m.acertos / total) * 100) : 0;
                    }),
                    backgroundColor: '#22c55e',
                  },
                  {
                    label: 'Erros (%)',
                    data: estatisticasAvancadas.materias.map(m => {
                      const total = m.acertos + m.erros;
                      return total ? Math.round((m.erros / total) * 100) : 0;
                    }),
                    backgroundColor: '#ef4444',
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: true, position: 'top' },
                  tooltip: { enabled: true },
                },
                scales: {
                  x: { stacked: true },
                  y: { stacked: true, beginAtZero: true, max: 100 },
                },
              }}
            />
          </div>
        </Card>

        {/* Gráfico de linha: Dias praticados por matéria/disciplina */}
        <Card className="p-6 flex flex-col gap-2 col-span-1 md:col-span-2">
          <span className="text-lg font-semibold mb-2">Sequência de Dias Praticados por Matéria</span>
          <div style={{ height: 220, width: '100%', maxWidth: 500, margin: '0 auto' }}>
            <Line
              data={{
                labels: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
                datasets: estatisticasAvancadas.diasPraticados.map(m => ({
                  label: m.nome,
                  data: m.dias,
                  borderColor: undefined,
                  backgroundColor: undefined,
                  pointBackgroundColor: undefined,
                })).map((ds, i) => ({
                  ...ds,
                  borderColor: ["#6366f1", "#22c55e", "#ef4444", "#eab308", "#0ea5e9"][i % 5],
                  backgroundColor: ["rgba(99,102,241,0.2)", "rgba(34,197,94,0.2)", "rgba(239,68,68,0.2)", "rgba(234,179,8,0.2)", "rgba(14,165,233,0.2)"][i % 5],
                  pointBackgroundColor: ["#6366f1", "#22c55e", "#ef4444", "#eab308", "#0ea5e9"][i % 5],
                  tension: 0.3,
                  fill: false,
                })),
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: true, position: 'top' },
                  tooltip: { enabled: true },
                },
                scales: {
                  y: { beginAtZero: true, max: 1, ticks: { stepSize: 1 } },
                },
              }}
            />
          </div>
        </Card>

        {/* Gráfico de linha: Tempo de estudo por matéria */}
        <Card className="p-6 flex flex-col gap-2 col-span-1 md:col-span-2">
          <span className="text-lg font-semibold mb-2">Tempo de Estudo por Matéria (min)</span>
          <div style={{ height: 220, width: '100%', maxWidth: 500, margin: '0 auto' }}>
            <Line
              data={{
                labels: estatisticasAvancadas.tempoPorMateria.map(m => m.nome),
                datasets: [
                  {
                    label: 'Tempo (min)',
                    data: estatisticasAvancadas.tempoPorMateria.map(m => m.tempo),
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99,102,241,0.2)',
                    tension: 0.3,
                    fill: true,
                    pointBackgroundColor: '#6366f1',
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: true, position: 'top' },
                  tooltip: { enabled: true },
                },
                scales: {
                  y: { beginAtZero: true },
                },
              }}
            />
          </div>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button size="lg" className="bg-gradient-knowledge shadow-glow" onClick={() => navigate("/game")}>Iniciar Exercício</Button>
      </div>
    </div>
  );
};

export default Dashboard;
