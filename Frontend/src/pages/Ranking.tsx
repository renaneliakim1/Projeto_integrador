import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { GameCard } from "@/components/ui/game-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getRankingWithCurrentUser, globalRankingData, matematicaRankingData, programacaoRankingData, portuguesRankingData, historiaRankingData, semanalRankingData, geografiaRankingData, cienciasRankingData, artesRankingData, inglesRankingData, filosofiaRankingData, RankedUser } from "@/data/ranking";
import { useTopicCategorizer } from "@/hooks/useTopicCategorizer";
import { ArrowLeft, ArrowRight, Award, Crown, Medal, Star, Trophy } from "lucide-react";
import { useEffect, useState, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

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
const RankingCard = ({ player, rank, isCurrentUser }: { player: RankedUser, rank: number, isCurrentUser: boolean }) => (
  <GameCard className={`p-4 transition-all ${isCurrentUser ? 'border-2 border-primary shadow-lg' : ''}`}>
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="flex items-center justify-center w-10 h-10 font-bold text-lg">{rank}</div>
        <Avatar className="w-12 h-12">
          <AvatarImage src={player.avatar} alt={player.name} />
          <AvatarFallback>{player.name.substring(0, 2)}</AvatarFallback>
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
);

// Componente que renderiza uma lista de ranking (pódio + resto)
const RankingList = ({ players, currentUser }: { players: RankedUser[], currentUser: string | null }) => {
  if (!players || players.length === 0) {
    return <p className="text-center text-muted-foreground">Nenhum jogador no ranking ainda.</p>;
  }

  const podium = players.slice(0, 3);
  const rest = players.slice(3);

  return (
    <div className="space-y-4">
      {/* Pódio */}
      {podium.length > 0 && (
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {podium.map((player, index) => (
            <GameCard key={player.id} className={`p-6 text-center border-2 ${index === 0 ? 'border-yellow-400' : index === 1 ? 'border-gray-300' : 'border-amber-500'}`}>
              <div className="mb-3">{getPositionIcon(index + 1)}</div>
              <Avatar className="w-20 h-20 mx-auto mb-3">
                <AvatarImage src={player.avatar} alt={player.name} />
                <AvatarFallback className="text-2xl">{player.name.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <h3 className="font-bold text-lg">{player.name}</h3>
              <p className="text-sm text-muted-foreground">Nível {player.level}</p>
              <p className="text-xl font-bold mt-1">{player.xp.toLocaleString()} XP</p>
            </GameCard>
          ))}
        </div>
      )}

      {/* Restante do Ranking */}
      <div className="space-y-3">
        {rest.map((player, index) => (
          <RankingCard key={player.id} player={player} rank={index + 4} isCurrentUser={currentUser === player.name} />
        ))}
      </div>
    </div>
  );
};

const Ranking = () => {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [userStudyTopic, setUserStudyTopic] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState("global");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const userName = localStorage.getItem('userName');
    setCurrentUser(userName);
    if (userName) {
      const userFocus = localStorage.getItem('userFocus');
      setUserStudyTopic(userFocus);
    }
  }, []);

  const { category: categorizedTopic } = useTopicCategorizer(userStudyTopic || "");

  const tabs = useMemo(() => {
    const educacaoFisicaRankingData: RankedUser[] = [];
    const ensinoReligiosoRankingData: RankedUser[] = [];
    const logicaRankingData: RankedUser[] = [];

    const bnccSubjects = [
        { value: "matematica", label: "Matemática", data: getRankingWithCurrentUser(matematicaRankingData) },
        { value: "portugues", label: "Português", data: getRankingWithCurrentUser(portuguesRankingData) },
        { value: "geografia", label: "Geografia", data: getRankingWithCurrentUser(geografiaRankingData) },
        { value: "ciencias", label: "Ciências", data: getRankingWithCurrentUser(cienciasRankingData) },
        { value: "historia", label: "História", data: getRankingWithCurrentUser(historiaRankingData) },
        { value: "artes", label: "Artes", data: getRankingWithCurrentUser(artesRankingData) },
        { value: "ingles", label: "Inglês", data: getRankingWithCurrentUser(inglesRankingData) },
        { value: "educacao-fisica", label: "Educação Física", data: getRankingWithCurrentUser(educacaoFisicaRankingData) },
        { value: "ensino-religioso", label: "Ensino Religioso", data: getRankingWithCurrentUser(ensinoReligiosoRankingData) },
    ];

    const otherSubjects = [
        { value: "programacao", label: "Programação", data: getRankingWithCurrentUser(programacaoRankingData) },
        { value: "filosofia", label: "Filosofia", data: getRankingWithCurrentUser(filosofiaRankingData) },
        { value: "logica", label: "Lógica", data: getRankingWithCurrentUser(logicaRankingData) },
    ];

    const allSubjects = [...bnccSubjects, ...otherSubjects];

    const orderedTabs = [
      { value: "global", label: "Global", data: getRankingWithCurrentUser(globalRankingData) },
      { value: "semanal", label: "Semanal", data: getRankingWithCurrentUser(semanalRankingData) },
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
                <RankingList players={tab.data} currentUser={currentUser} />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Ranking;