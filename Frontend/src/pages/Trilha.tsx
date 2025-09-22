import { useMemo, useRef, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { trilhaPrincipal } from '@/data/trilhaPrincipal';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Flame, BrainCircuit, Lock, Check, Heart, Gift, ArrowLeft } from 'lucide-react';
import { useGamification } from '@/hooks/useGamification';
import { useToast } from '@/hooks/use-toast';
import { useTimeTracker } from '@/hooks/useTimeTracker';

const Trilha = () => {
  const navigate = useNavigate();
  const { blocosCompletos, hearts, addXp } = useGamification();
  const { toast } = useToast();
  useTimeTracker(); // Inicia o rastreamento de tempo nesta página

  const [recompensasColetadas, setRecompensasColetadas] = useState<number[]>(() => {
      const saved = localStorage.getItem('recompensasColetadas');
      return saved ? JSON.parse(saved) : [];
  });

  const levelRefs = useRef<Map<number, HTMLDivElement | null>>(new Map());

  const todosOsBlocos = useMemo(() => trilhaPrincipal.flatMap(n => n.blocos), []);

  const nivelAtual = useMemo(() => {
    const proximoBloco = todosOsBlocos.find(bloco => !blocosCompletos.includes(bloco.id));
    if (!proximoBloco) return trilhaPrincipal[trilhaPrincipal.length - 1]; // Se tudo estiver completo, foca no último nível
    const nivelDoBloco = trilhaPrincipal.find(n => n.blocos.some(b => b.id === proximoBloco.id));
    return nivelDoBloco || trilhaPrincipal[0];
  }, [todosOsBlocos, blocosCompletos]);

  useEffect(() => {
    if (nivelAtual) {
      const ref = levelRefs.current.get(nivelAtual.nivel);
      setTimeout(() => {
        ref?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [nivelAtual]);

  const handleBlockClick = (nivel: number, blocoId: string) => {
    navigate(`/lesson/${blocoId}`);
  };

  const handleClaimReward = (nivel: number) => {
    if (recompensasColetadas.includes(nivel)) return;

    addXp(100); // Recompensa de 100 XP
    const novasRecompensas = [...recompensasColetadas, nivel];
    setRecompensasColetadas(novasRecompensas);
    localStorage.setItem('recompensasColetadas', JSON.stringify(novasRecompensas));

    toast({ title: "Recompensa Coletada!", description: "Você ganhou 100 XP extras!", className: 'bg-gradient-warning text-white border-none' });
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 relative">
      <Link to="/dashboard">
          <Button variant="ghost" className="absolute top-8 left-8 z-20">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Dashboard
          </Button>
      </Link>
      <div className="text-center mb-12 pt-16">
        <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">Sua Trilha de Aprendizado</h1>
        <p className="text-muted-foreground mt-2">Avance pelos níveis e domine novas habilidades.</p>
      </div>

      <div className="relative flex flex-col items-center gap-8">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 bg-border h-full z-0"></div>

        {trilhaPrincipal.map((nivel) => {
            const isLevelComplete = nivel.blocos.every(b => blocosCompletos.includes(b.id));
            const isRewardClaimed = recompensasColetadas.includes(nivel.nivel);

            return (
                <div key={nivel.nivel} className="z-10 w-full" ref={(el) => levelRefs.current.set(nivel.nivel, el)}>
                    <div className="flex items-center gap-4 my-4">
                        <div className="flex-1 h-px bg-border"></div>
                        <h2 className="text-xl font-bold text-primary shrink-0">{nivel.titulo}</h2>
                        <div className="flex-1 h-px bg-border"></div>
                    </div>

                    <div className="flex flex-wrap justify-center gap-x-12 gap-y-8">
                    {nivel.blocos.map((bloco, blocoIndex) => {
                        const isCompleto = blocosCompletos.includes(bloco.id);
                        const indiceGlobal = todosOsBlocos.findIndex(b => b.id === bloco.id);
                        const blocoAnterior = indiceGlobal > 0 ? todosOsBlocos[indiceGlobal - 1] : null;
                        const isUnlocked = indiceGlobal === 0 || (blocoAnterior && blocosCompletos.includes(blocoAnterior.id));

                        let status: 'completo' | 'desbloqueado' | 'bloqueado';
                        if (isCompleto) status = 'completo';
                        else if (isUnlocked) status = 'desbloqueado';
                        else status = 'bloqueado';

                        const hasNoHearts = hearts <= 0;
                        const isDisabled = status === 'bloqueado' || (status === 'desbloqueado' && hasNoHearts && !isCompleto);

                        return (
                        <div key={bloco.id} className={`w-1/2 flex ${blocoIndex % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                            <div className={`relative ${blocoIndex % 2 === 0 ? 'pr-12' : 'pl-12'}`}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button 
                                            className={`w-24 h-24 rounded-full flex flex-col gap-1 shadow-lg border-4 
                                                ${status === 'completo' && 'border-green-500 bg-green-500/10'}
                                                ${status === 'desbloqueado' && !hasNoHearts && 'border-primary/80 animate-pulse'}
                                                ${(status === 'bloqueado' || (status === 'desbloqueado' && hasNoHearts)) && 'border-border'}
                                            `}
                                            variant={'outline'}
                                            onClick={() => handleBlockClick(nivel.nivel, bloco.id)}
                                            disabled={isDisabled}
                                        >
                                            {status === 'completo' && <Check className="h-8 w-8 text-green-500" />}
                                            {status === 'desbloqueado' && !hasNoHearts && (bloco.tipo === 'foco' ? <Flame className="h-8 w-8 text-primary" /> : <BrainCircuit className="h-8 w-8 text-primary/80" />)}
                                            {status === 'bloqueado' && <Lock className="h-8 w-8 text-muted-foreground" />}
                                            {status === 'desbloqueado' && hasNoHearts && <Heart className="h-8 w-8 text-muted-foreground" />}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="font-bold">{bloco.titulo}</p>
                                        {status === 'completo' && <p>Revisar</p>}
                                        {status === 'desbloqueado' && !hasNoHearts && <p>Começar</p>}
                                        {status === 'desbloqueado' && hasNoHearts && <p>Você está sem vidas!</p>}
                                        {status === 'bloqueado' && <p>Bloqueado</p>}
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        </div>
                        );
                    })}
                    </div>

                    {/* Baú de Recompensa */}
                    <div className="flex justify-center mt-8">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button 
                                    variant="outline"
                                    className={`w-32 h-32 rounded-lg flex flex-col gap-2 shadow-lg border-4 
                                        ${isLevelComplete && !isRewardClaimed ? 'border-amber-400 animate-pulse' : 'border-border'}
                                        ${isRewardClaimed && 'border-green-500/50'}
                                    `}
                                    disabled={!isLevelComplete || isRewardClaimed}
                                    onClick={() => handleClaimReward(nivel.nivel)}
                                >
                                    <Gift className={`h-12 w-12 ${isLevelComplete && !isRewardClaimed ? 'text-amber-400' : isRewardClaimed ? 'text-green-500' : 'text-muted-foreground'}`} />
                                    <span className="text-xs font-bold">Recompensa</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                {isLevelComplete && !isRewardClaimed && <p>Clique para coletar 100 XP!</p>}
                                {isLevelComplete && isRewardClaimed && <p>Recompensa já coletada.</p>}
                                {!isLevelComplete && <p>Complete todos os blocos do nível para liberar.</p>}
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
};

export default Trilha;
