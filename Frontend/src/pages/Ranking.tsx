import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { GameCard } from "@/components/ui/game-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRanking, RankedUser } from "@/hooks/useRanking";
import { useTopicCategorizer } from "@/hooks/useTopicCategorizer";
import { ArrowLeft, ArrowRight, Award, Crown, Medal, Star, Trophy, Loader2 } from "lucide-react";
import { useEffect, useState, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

// Ícone para as 3 primeiras posições
const getPositionIcon = (position: number) => {
  switch (position) {
    case 1: return <Crown className="h-8 w-8 text-yellow-400" />;
    case 2: return <Medal className="h-7 w-7 text-gray-300" />;
    case 3: return <Award className="h-6 w-6 text-amber-500" />;
    default: return <span className="text-xl font-bold text-muted-foreground">{position}</span>;
  }
};

// Card de um jogador no ranking
const RankingCard = ({ player, isCurrentUser }: { player: RankedUser, isCurrentUser: boolean }) => (
  <Link to={`/profile/${player.id}`}>
    <GameCard className={`p-4 transition-all hover:scale-[1.02] hover:shadow-lg cursor-pointer ${isCurrentUser ? 'border-2 border-primary shadow-lg' : ''}`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center justify-center w-10 h-10">
            {getPositionIcon(player.rank)}
          </div>
          <Avatar className="w-12 h-12">
            <AvatarImage src={player.avatar || undefined} alt={player.name} />
            <AvatarFallback>{player.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className={`font-bold ${isCurrentUser ? 'text-primary' : ''}`}>{player.name}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Star className="w-4 h-4 text-amber-400" />
              <span>Nível {player.level}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-bold text-lg">{player.xp.toLocaleString()} XP</div>
        </div>
      </div>
    </GameCard>
  </Link>
);

// Componente que renderiza uma lista de ranking (pódio + resto)
const RankingList = ({ 
  ranking, 
  loading, 
  error, 
  currentUser, 
  totalUsers 
}: { 
  ranking: RankedUser[]
  loading: boolean
  error: string | null
  currentUser: string
  totalUsers: number
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Tentar Novamente</Button>
      </div>
    );
  }

  if (!ranking || ranking.length === 0) {
    return <p className="text-center text-muted-foreground py-8">Nenhum jogador no ranking ainda.</p>;
  }

  const podium = ranking.slice(0, 3);
  const rest = ranking.slice(3);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground text-center">Total de jogadores: {totalUsers}</p>
      
      {/* Pódio */}
      {podium.length > 0 && (
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {podium.map((player) => (
            <Link key={player.id} to={`/profile/${player.id}`}>
              <GameCard className={`p-6 text-center border-2 hover:scale-105 transition-transform cursor-pointer ${player.rank === 1 ? 'border-yellow-400' : player.rank === 2 ? 'border-gray-300' : 'border-amber-500'}`}>
                <div className="mb-3">{getPositionIcon(player.rank)}</div>
                <Avatar className="w-20 h-20 mx-auto mb-3">
                  <AvatarImage src={player.avatar || undefined} alt={player.name} />
                  <AvatarFallback className="text-2xl">{player.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <h3 className="font-bold text-lg">{player.name}</h3>
                <p className="text-sm text-muted-foreground">Nível {player.level}</p>
                <p className="text-xl font-bold mt-1">{player.xp.toLocaleString()} XP</p>
              </GameCard>
            </Link>
          ))}
        </div>
      )}

      {/* Restante do Ranking */}
      <div className="space-y-3">
        {rest.map((player) => (
          <RankingCard 
            key={player.id} 
            player={player} 
            isCurrentUser={currentUser === player.name || currentUser === player.username} 
          />
        ))}
      </div>
    </div>
  );
};

const Ranking = () => {
  const [selectedTab, setSelectedTab] = useState("global");
  const { user } = useAuth();
  const { ranking, loading, error, totalUsers } = useRanking(selectedTab);
  const [userStudyTopic, setUserStudyTopic] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Tenta pegar o foco do localStorage mesmo sem login
    const userFocus = localStorage.getItem('userFocus');
    if (userFocus) {
      setUserStudyTopic(userFocus);
    }
  }, [user]);

  const { category: categorizedTopic } = useTopicCategorizer(userStudyTopic || "");

  const tabs = useMemo(() => {
    const bnccSubjects = [
        { value: "matematica", label: "Matemática" },
        { value: "portugues", label: "Português" },
        { value: "geografia", label: "Geografia" },
        { value: "ciencias", label: "Ciências" },
        { value: "historia", label: "História" },
        { value: "artes", label: "Artes" },
        { value: "ingles", label: "Inglês" },
        { value: "educacao-fisica", label: "Educação Física" },
        { value: "ensino-religioso", label: "Ensino Religioso" },
    ];

    const otherSubjects = [
        { value: "programacao", label: "Programação" },
        { value: "filosofia", label: "Filosofia" },
        { value: "logica", label: "Lógica" },
    ];

    const allSubjects = [...bnccSubjects, ...otherSubjects];

    const orderedTabs = [
      { value: "global", label: "Global" },
      { value: "semanal", label: "Semanal" },
    ];

    const userFocusKey = categorizedTopic?.toLowerCase();
    const userFocusTab = userFocusKey ? allSubjects.find(s => s.value === userFocusKey) : undefined;
    
    const mainTabs = new Map<string, typeof allSubjects[0]>();

    if (userFocusTab) {
        mainTabs.set(userFocusTab.value, userFocusTab);
    }

    orderedTabs.push(...Array.from(mainTabs.values()));
    
    allSubjects.forEach(tab => {
        if (!mainTabs.has(tab.value)) orderedTabs.push(tab);
    });

    return orderedTabs;
  }, [categorizedTopic]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
        const scrollAmount = direction === 'left' ? -300 : 300;
        scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const tabElement = document.querySelector(`[data-value="${selectedTab}"]`);
    if (tabElement && scrollContainerRef.current) {
        const { offsetLeft, offsetWidth } = tabElement as HTMLElement;
        const { scrollLeft, clientWidth } = scrollContainerRef.current;
        const scrollPosition = offsetLeft - (clientWidth / 2) + (offsetWidth / 2);
        scrollContainerRef.current.scrollTo({ left: scrollPosition, behavior: 'smooth' });
    }
  }, [selectedTab]);

  // Username do usuário atual (vazio se não estiver logado)
  const currentUser = user?.username || '';

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Início
            </Button>
          </Link>
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <Trophy className="inline-block h-10 w-10 text-amber-400 mb-2" /> Ranking de Jogadores
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Veja os melhores jogadores e compare seu desempenho com outros estudantes!
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {!user && (
            <div className="mb-6 text-center">
              <GameCard className="p-4 bg-primary/5 border-primary/20">
                <p className="text-sm text-muted-foreground">
                  💡 <Link to="/register" className="text-primary font-semibold hover:underline">Crie sua conta</Link> para aparecer no ranking e competir com outros jogadores!
                </p>
              </GameCard>
            </div>
          )}
          
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <div className="relative flex items-center">
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full shrink-0"
                    onClick={() => handleScroll('left')}
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="overflow-x-auto mx-2 flex-grow" ref={scrollContainerRef} style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    <style>{`::-webkit-scrollbar { display: none; }`}</style>
                    <TabsList className="inline-flex h-auto p-1">
                        {tabs.map(tab => (
                            <TabsTrigger 
                                key={tab.value} 
                                value={tab.value} 
                                className={cn(
                                    "text-lg py-2 px-4 transition-all duration-300",
                                    selectedTab === tab.value && "bg-primary text-primary-foreground shadow-md scale-105"
                                )}
                            >
                                {tab.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </div>
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full shrink-0"
                    onClick={() => handleScroll('right')}
                >
                    <ArrowRight className="h-4 w-4" />
                </Button>
            </div>

            {tabs.map(tab => (
              <TabsContent key={tab.value} value={tab.value} className="mt-6">
                <RankingList 
                  ranking={ranking}
                  loading={loading}
                  error={error}
                  currentUser={currentUser}
                  totalUsers={totalUsers}
                />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Ranking;