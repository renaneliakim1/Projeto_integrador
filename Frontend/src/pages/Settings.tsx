import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GameCard } from "@/components/ui/game-card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Volume2, VolumeX, Moon, Sun, Bell, BellOff, Zap, Clock, Trophy } from "lucide-react";
import { Link } from "react-router-dom";

const Settings = () => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [gameTimer, setGameTimer] = useState(30);
  const [difficulty, setDifficulty] = useState("medium");

  const difficultyOptions = [
    { id: "easy", name: "Fácil", description: "45 segundos por pergunta", icon: "🌱" },
    { id: "medium", name: "Médio", description: "30 segundos por pergunta", icon: "⚡" },
    { id: "hard", name: "Difícil", description: "15 segundos por pergunta", icon: "🔥" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link to="/">
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Início
            </Button>
          </Link>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
              Configurações
            </h1>
            <p className="text-muted-foreground">
              Personalize sua experiência de aprendizado
            </p>
          </div>

          {/* Audio Settings */}
          <GameCard variant="default" className="p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                {soundEnabled ? <Volume2 className="h-5 w-5 text-primary" /> : <VolumeX className="h-5 w-5 text-muted-foreground" />}
                <div>
                  <h3 className="font-semibold">Efeitos Sonoros</h3>
                  <p className="text-sm text-muted-foreground">Sons de feedback durante o jogo</p>
                </div>
              </div>
              <Switch
                checked={soundEnabled}
                onCheckedChange={setSoundEnabled}
              />
            </div>
          </GameCard>

          {/* Appearance Settings */}
          <GameCard variant="default" className="p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                {darkMode ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-warning" />}
                <div>
                  <h3 className="font-semibold">Tema Escuro</h3>
                  <p className="text-sm text-muted-foreground">Interface otimizada para estudos noturnos</p>
                </div>
              </div>
              <Switch
                checked={darkMode}
                onCheckedChange={setDarkMode}
              />
            </div>
          </GameCard>

          {/* Notification Settings */}
          <GameCard variant="default" className="p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                {notifications ? <Bell className="h-5 w-5 text-primary" /> : <BellOff className="h-5 w-5 text-muted-foreground" />}
                <div>
                  <h3 className="font-semibold">Notificações</h3>
                  <p className="text-sm text-muted-foreground">Lembretes para manter seus estudos em dia</p>
                </div>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
          </GameCard>

          {/* Difficulty Settings */}
          <GameCard variant="knowledge" className="p-6 mb-6">
            <div className="mb-4">
              <div className="flex items-center space-x-3 mb-2">
                <Zap className="h-5 w-5" />
                <h3 className="font-semibold">Nível de Dificuldade</h3>
              </div>
              <p className="text-sm text-primary-foreground/80">
                Escolha o ritmo que melhor se adapta ao seu aprendizado
              </p>
            </div>
            
            <div className="grid gap-3">
              {difficultyOptions.map((option) => (
                <Button
                  key={option.id}
                  variant={difficulty === option.id ? "secondary" : "outline"}
                  className="h-auto p-4 justify-start"
                  onClick={() => setDifficulty(option.id)}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{option.icon}</span>
                    <div className="text-left">
                      <div className="font-semibold">{option.name}</div>
                      <div className="text-sm text-muted-foreground">{option.description}</div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </GameCard>

          {/* Game Performance Stats */}
          <GameCard variant="wisdom" className="p-6 mb-6">
            <div className="mb-4">
              <div className="flex items-center space-x-3 mb-2">
                <Trophy className="h-5 w-5" />
                <h3 className="font-semibold">Estatísticas de Jogo</h3>
              </div>
              <p className="text-sm text-secondary-foreground/80">
                Seu desempenho recente
              </p>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">85%</div>
                <div className="text-xs text-secondary-foreground/80">Taxa de Acerto</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-warning">23</div>
                <div className="text-xs text-secondary-foreground/80">Jogos Hoje</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">7</div>
                <div className="text-xs text-secondary-foreground/80">Sequência</div>
              </div>
            </div>
          </GameCard>

          {/* Account Section */}
          <GameCard variant="default" className="p-6">
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Conta e Dados</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Gerencie suas informações pessoais e progresso
              </p>
            </div>
            
            <div className="space-y-3">
              <Link to="/profile">
                <Button variant="outline" className="w-full justify-start">
                  Ver Meu Perfil
                </Button>
              </Link>
              <Button variant="outline" className="w-full justify-start">
                Exportar Progresso
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Limpar Histórico
              </Button>
              <Separator />
              <Button variant="destructive" className="w-full">
                Excluir Conta
              </Button>
            </div>
          </GameCard>
        </div>
      </div>
    </div>
  );
};

export default Settings;