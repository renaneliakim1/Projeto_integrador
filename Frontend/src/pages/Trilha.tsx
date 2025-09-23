import { useMemo, useRef, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { trilhaPrincipal } from '@/data/trilhaPrincipal';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Flame, BrainCircuit, Lock, Check, Heart, Gift, ArrowLeft } from 'lucide-react';
import { useGamification } from '@/hooks/useGamification';
import { useToast } from '@/hooks/use-toast';
import { useTimeTracker } from '@/hooks/useTimeTracker';
import { motion, useScroll, useSpring } from "framer-motion";

// Componente para o visual do bloco circular com efeito 3D
const BlocoCircular = ({ status, tipo, hasNoHearts }) => {
    const icon = useMemo(() => {
        const iconClass = "h-10 w-10 text-white/90 drop-shadow-lg";
        if (status === 'completo') return <Check className={iconClass} />;
        if (status === 'bloqueado') return <Lock className="h-8 w-8 text-gray-400" />;
        if (hasNoHearts) return <Heart className="h-8 w-8 text-gray-400" />;
        if (tipo === 'foco') return <Flame className={iconClass} />;
        return <BrainCircuit className={iconClass} />;
    }, [status, tipo, hasNoHearts]);

    const gradientClasses = useMemo(() => {
        if (status === 'completo') return "from-green-500 to-green-700 shadow-lg shadow-green-700/40";
        if (status === 'desbloqueado' && !hasNoHearts) {
            if (tipo === 'foco') return "from-purple-500 to-indigo-700 shadow-lg shadow-indigo-700/40";
            return "from-sky-500 to-blue-700 shadow-lg shadow-blue-700/40";
        }
        return "from-gray-600 to-gray-800 shadow-lg shadow-black/30";
    }, [status, tipo, hasNoHearts]);

    const isPulsing = status === 'desbloqueado' && !hasNoHearts;

    return (
        <motion.div
            className={`relative w-24 h-24 rounded-full flex items-center justify-center bg-gradient-to-br border-2 border-white/10 ${gradientClasses} ${isPulsing ? 'animate-pulse' : ''}`}
            whileHover={{ scale: 1.1, y: -8 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 10 }}
        >
            {/* Efeito de brilho interno */}
            <div className="absolute top-1 left-1 w-[90%] h-[90%] rounded-full bg-white/10 blur-sm"></div>
            <div className="relative z-10">{icon}</div>
        </motion.div>
    );
};

const Trilha = () => {
  const navigate = useNavigate();
  const { blocosCompletos, hearts, addXp } = useGamification();
  const { toast } = useToast();
  useTimeTracker();

  const [recompensasColetadas, setRecompensasColetadas] = useState<number[]>(() => {
      const saved = localStorage.getItem('recompensasColetadas');
      return saved ? JSON.parse(saved) : [];
  });

  const todosOsBlocos = useMemo(() => trilhaPrincipal.flatMap(n => n.blocos), []);

  const handleBlockClick = (nivel: number, blocoId: string) => {
    navigate(`/lesson/${blocoId}`);
  };

  const handleClaimReward = (nivel: number) => {
    if (recompensasColetadas.includes(nivel)) return;
    addXp(100);
    const novasRecompensas = [...recompensasColetadas, nivel];
    setRecompensasColetadas(novasRecompensas);
    localStorage.setItem('recompensasColetadas', JSON.stringify(novasRecompensas));
    toast({ title: "Recompensa Coletada!", description: "Você ganhou 100 XP extras!", className: 'bg-gradient-warning text-white border-none' });
  };

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="bg-gradient-to-b from-gray-900 to-background text-white min-h-screen overflow-x-hidden">
        <motion.div className="progress-bar bg-primary fixed top-0 left-0 right-0 h-1.5 origin-[0%] z-50" style={{ scaleX }} />
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 relative">
            <Link to="/dashboard">
                <Button variant="ghost" className="absolute top-8 left-8 z-20 backdrop-blur-sm bg-white/10 hover:bg-white/20 text-white">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar ao Dashboard
                </Button>
            </Link>
            <div className="text-center mb-16 pt-16">
                <motion.h1 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-primary to-indigo-400 bg-clip-text text-transparent">
                        Sua Trilha de Aprendizado
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-gray-400 mt-4 max-w-2xl mx-auto">
                        Avance pelos níveis, complete os desafios e colete suas recompensas para dominar novas habilidades.
                </motion.p>
            </div>

            <div className="relative flex flex-col items-center gap-20">
                {trilhaPrincipal.map((nivel) => {
                    const isLevelComplete = nivel.blocos.every(b => blocosCompletos.includes(b.id));
                    const isRewardClaimed = recompensasColetadas.includes(nivel.nivel);

                    return (
                        <motion.div 
                            key={nivel.nivel} 
                            className="z-10 w-full flex flex-col items-center"
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="flex items-center gap-4 my-6 w-full max-w-3xl">
                                <div className="flex-1 h-px bg-white/10"></div>
                                <h2 className="text-2xl font-bold text-purple-300 shrink-0 px-4">{nivel.titulo}</h2>
                                <div className="flex-1 h-px bg-white/10"></div>
                            </div>

                            <div className="grid grid-cols-3 md:grid-cols-5 gap-x-4 gap-y-10 w-full max-w-4xl p-4">
                            {nivel.blocos.map((bloco, i) => {
                                const isCompleto = blocosCompletos.includes(bloco.id);
                                const indiceGlobal = todosOsBlocos.findIndex(b => b.id === bloco.id);
                                const blocoAnterior = indiceGlobal > 0 ? todosOsBlocos[indiceGlobal - 1] : null;
                                const isUnlocked = indiceGlobal === 0 || (blocoAnterior && blocosCompletos.includes(blocoAnterior.id));

                                let status: 'completo' | 'desbloqueado' | 'bloqueado' = 'bloqueado';
                                if (isCompleto) status = 'completo';
                                else if (isUnlocked) status = 'desbloqueado';

                                const hasNoHearts = hearts <= 0;
                                const isDisabled = status === 'bloqueado' || (status === 'desbloqueado' && hasNoHearts && !isCompleto);

                                return (
                                    <motion.div
                                        key={bloco.id}
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true, amount: 0.5 }}
                                        transition={{ duration: 0.4, delay: 0.1 * (i % 5) }}
                                        className="flex justify-center"
                                    >
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button 
                                                    variant={'ghost'}
                                                    className={`w-28 h-28 p-0 rounded-full transition-opacity ${isDisabled ? 'opacity-60 cursor-not-allowed filter grayscale-[50%]' : ''}`}
                                                    onClick={() => !isDisabled && handleBlockClick(nivel.nivel, bloco.id)}
                                                    disabled={isDisabled}
                                                >
                                                    <BlocoCircular status={status} tipo={bloco.tipo} hasNoHearts={hasNoHearts} />
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
                                    </motion.div>
                                );
                            })}
                            </div>

                            <motion.div 
                                className="flex justify-center mt-12"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.8 }}
                                transition={{ duration: 0.5 }}
                            >
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                            <Button 
                                                variant="outline"
                                                className={`w-32 h-32 rounded-lg flex flex-col gap-2 shadow-lg border-4 transition-all duration-300 bg-gray-800/50 
                                                    ${isLevelComplete && !isRewardClaimed ? 'border-amber-400 hover:bg-amber-900/40 animate-pulse' : 'border-white/10'}
                                                    ${isRewardClaimed && 'border-green-500/50'}
                                                `}
                                                disabled={!isLevelComplete || isRewardClaimed}
                                                onClick={() => handleClaimReward(nivel.nivel)}
                                            >
                                                <Gift className={`h-12 w-12 transition-colors ${isLevelComplete && !isRewardClaimed ? 'text-amber-400' : isRewardClaimed ? 'text-green-500' : 'text-gray-500'}`} />
                                                <span className="text-xs font-bold text-gray-300">Recompensa</span>
                                            </Button>
                                        </motion.div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        {isLevelComplete && !isRewardClaimed && <p>Clique para coletar 100 XP!</p>}
                                        {isLevelComplete && isRewardClaimed && <p>Recompensa já coletada.</p>}
                                        {!isLevelComplete && <p>Complete todos os blocos do nível para liberar.</p>}
                                    </TooltipContent>
                                </Tooltip>
                            </motion.div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    </div>
  );
};

export default Trilha;