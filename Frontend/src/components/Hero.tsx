import { Button } from "@/components/ui/button";
import { GameCard } from "@/components/ui/game-card";
import { Play, Trophy, Users, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import mascot from "@/assets/mascot.png";
import TypedTextWithHighlight from './TypedTextWithHighlight';
import { useState, useEffect } from 'react';
import apiClient from '@/api/axios';
import { useAuth } from "@/contexts/AuthContext";

interface HeroStats {
  record: {
    holder: string | null;
    xp: number;
  };
  online_players: number;
}

const Hero = () => {
  const [stats, setStats] = useState<HeroStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleStartPlaying = () => {
    if (isAuthenticated) {
      navigate('/trilha');
    } else {
      navigate('/login?redirect=/trilha');
    }
  };

  useEffect(() => {
    const fetchHeroStats = async () => {
      try {
        const response = await apiClient.get<HeroStats>('/hero-stats/');
        setStats(response.data);
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        // Define valores padrão em caso de erro
        setStats({
          record: { holder: null, xp: 0 },
          online_players: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchHeroStats();
    
    // Atualiza a cada 30 segundos
    const interval = setInterval(fetchHeroStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <TypedTextWithHighlight
                text="Aprenda Brincando com o Skillio"
                highlightWord="Skillio"
                highlightClassName="bg-gradient-primary bg-clip-text text-transparent"
                speed={75}
              />
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Transforme seus estudos em uma aventura emocionante! Jogue, aprenda e 
              conquiste conhecimento em diversas disciplinas de forma divertida e interativa.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <Button 
                variant="game" 
                size="lg" 
                className="text-lg px-8 w-full sm:w-auto"
                onClick={handleStartPlaying}
              >
                <Play className="h-5 w-5" />
                Começar a Jogar
              </Button>
              <Link to="/quiz-rapido" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="text-lg px-8 w-full">
                  Quiz Rápido
                </Button>
              </Link>
            </div>

            <div className="flex gap-8 justify-center lg:justify-start">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">5+</div>
                <div className="text-sm text-muted-foreground">Disciplinas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">1000+</div>
                <div className="text-sm text-muted-foreground">Perguntas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">∞</div>
                <div className="text-sm text-muted-foreground">Diversão</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <GameCard variant="knowledge" className="p-8 text-center">
              <img 
                src={mascot} 
                alt="EdGame Mascot" 
                className="w-75 h-75 mx-auto mb-6 object-contain"
              />
              <div className="space-y-12">
                <Link to="/ranking">
                  <GameCard className="p-4 flex items-center justify-between bg-background/20 backdrop-blur-sm hover:bg-background/30 transition-colors cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <Trophy className="h-6 w-6 text-warning" />
                      {loading ? (
                        <div className="flex items-center space-x-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="font-semibold">Carregando...</span>
                        </div>
                      ) : stats?.record.holder ? (
                        <span className="font-semibold">
                          Recorde: {stats.record.holder} - {stats.record.xp} XP
                        </span>
                      ) : (
                        <span className="font-semibold">Seja o primeiro no ranking!</span>
                      )}
                    </div>
                  </GameCard>
                </Link>
                <Link to="/ranking">
                  <GameCard className="p-4 flex items-center justify-between bg-background/20 backdrop-blur-sm hover:bg-background/30 transition-colors cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <Users className="h-6 w-6 text-success" />
                      {loading ? (
                        <div className="flex items-center space-x-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="font-semibold">Carregando...</span>
                        </div>
                      ) : (
                        <span className="font-semibold">
                          Jogadores Ativos: {stats?.online_players || 0}
                        </span>
                      )}
                    </div>
                  </GameCard>
                </Link>
              </div>
            </GameCard>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;