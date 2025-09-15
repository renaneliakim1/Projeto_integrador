import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

// Exemplo de dados mockados, depois integrar com backend
const userData = {
  nome: "João Silva",
  fotoPerfil: "/assets/mascot.png", // Exemplo, ajuste para o caminho real
  pontuacao: 1200,
  nivel: "Intermediário",
  areaFavorita: "Matemática", // Novo campo
  proximaAtividade: "Exercício de Matemática",
  estatisticas: {
    acertos: 85,
    erros: 15,
    tempoEstudo: "2h 30min",
  },
};

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Exemplo: redirecionar se não estiver logado
    // if (!usuarioLogado) navigate("/login");
  }, [navigate]);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center gap-4 mb-6">
        <img src={userData.fotoPerfil} alt="Foto de perfil" className="w-16 h-16 rounded-full border-2 border-primary shadow-glow object-cover" />
        <div>
          <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Olá, {userData.nome}!
          </h2>
          <span className="text-base text-muted-foreground">Área favorita: <span className="font-bold text-primary">{userData.areaFavorita}</span></span>
        </div>
        <Button variant="outline" size="sm" className="ml-auto" onClick={() => navigator.share ? navigator.share({ title: 'Meu progresso no EdGame', text: `Veja meu desempenho! Pontuação: ${userData.pontuacao}` }) : alert('Compartilhamento não suportado')}>Compartilhar</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6 flex flex-col gap-2">
          <span className="text-lg font-semibold">Pontuação</span>
          <span className="text-2xl font-bold text-primary">{userData.pontuacao}</span>
        </Card>
        <Card className="p-6 flex flex-col gap-2">
          <span className="text-lg font-semibold">Nível</span>
          <span className="text-2xl font-bold text-gradient-knowledge">{userData.nivel}</span>
        </Card>
        <Card className="p-6 flex flex-col gap-2">
          <span className="text-lg font-semibold">Próxima Atividade</span>
          <span className="text-base text-muted-foreground">{userData.proximaAtividade}</span>
        </Card>
        <Card className="p-6 flex flex-col gap-2">
          <span className="text-lg font-semibold">Estatísticas</span>
          <div className="flex flex-col gap-1">
            <span>Acertos: <span className="font-bold text-success">{userData.estatisticas.acertos}</span></span>
            <span>Erros: <span className="font-bold text-destructive">{userData.estatisticas.erros}</span></span>
            <span>Tempo de estudo: <span className="font-bold">{userData.estatisticas.tempoEstudo}</span></span>
          </div>
        </Card>
      </div>
      <div className="flex justify-end">
        <Button size="lg" className="bg-gradient-knowledge shadow-glow" onClick={() => navigate("/exercicio")}>Iniciar Exercício</Button>
      </div>
    </div>
  );
};

export default Dashboard;
