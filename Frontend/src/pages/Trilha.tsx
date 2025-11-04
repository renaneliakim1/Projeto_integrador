import { useMemo, useRef, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { trilhaPrincipal } from '@/data/trilhaPrincipal';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Flame, BrainCircuit, Lock, Check, Heart, Gift, ArrowLeft } from 'lucide-react';
import { useGamification } from '@/hooks/useGamification';
import { useToast } from '@/hooks/use-toast';
import { useTimeTracker } from '@/hooks/useTimeTracker';
import apiClient from '@/api/axios';
import LoadingAnimation from '@/components/ui/LoadingAnimation';
import { motion, useScroll, useSpring } from "framer-motion";

const Trilha = () => {
  const navigate = useNavigate();
  const { blocosCompletos, hearts, addXp } = useGamification();
  const { toast } = useToast();
  useTimeTracker();

  const [checkingPlan, setCheckingPlan] = useState(true);

  const [recompensasColetadas, setRecompensasColetadas] = useState<number[]>(() => {
      const saved = localStorage.getItem('recompensasColetadas');
      return saved ? JSON.parse(saved) : [];
  });

  const todosOsBlocos = useMemo(() => trilhaPrincipal.flatMap(n => n.blocos), []);
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    // Verifica se o usuário completou o quiz de nivelamento (tem performance data)
    useEffect(() => {
        (async () => {
            try {
                const resp = await apiClient.get('/users/me/');
                const performanceData = resp.data?.performance || [];
                
                // Verifica se há dados de performance com respostas registradas
                const hasPerformanceData = performanceData.length > 0 && 
                    performanceData.some((area: { subjects: { correct_answers: number; incorrect_answers: number }[] }) =>
                        area.subjects.some((subject: { correct_answers: number; incorrect_answers: number }) => 
                            subject.correct_answers > 0 || subject.incorrect_answers > 0
                        )
                    );
                
                if (!hasPerformanceData) {
                    toast({ 
                        title: 'Quiz de Nivelamento Pendente', 
                        description: 'Você precisa completar o quiz de nivelamento antes de acessar a trilha.',
                        variant: 'destructive'
                    });
                    navigate('/quiz-nivelamento');
                } else {
                    setCheckingPlan(false);
                }
            } catch (e) {
                console.warn('Could not verify quiz completion, allowing access by fallback.', e);
                setCheckingPlan(false);
            }
        })();
    }, [navigate, toast]);

            if (checkingPlan) {
                return <LoadingAnimation text="Verificando progresso..." subtext="Aguarde um momento" />;
            }

  const handleBlockClick = (nivel: number, blocoId: string) => {
    navigate(`/lesson/${blocoId}`);
  };

  const handleClaimReward = (nivel: number) => {
    if (recompensasColetadas.includes(nivel)) return;
    addXp(100);
    const novasRecompensas = [...recompensasColetadas, nivel];
    setRecompensasColetadas(novasRecompensas);
    localStorage.setItem('recompensasColetadas', JSON.stringify(novasRecompensas));
    toast({ title: "Reward Collected!", description: "You earned 100 extra XP!", className: 'bg-gradient-warning text-white border-none' });
  };


  return (
    <div className="bg-gradient-to-b from-gray-900 to-background text-white min-h-screen overflow-x-hidden">
        <motion.div className="progress-bar bg-primary fixed top-0 left-0 right-0 h-1.5 origin-[0%] z-50" style={{ scaleX }} />
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 relative">
            <Link to="/dashboard">
                <Button variant="ghost" className="absolute top-8 left-8 z-20 backdrop-blur-sm bg-white/10 hover:bg-white/20 text-white">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar para Dashboard
                </Button>
            </Link>
            <div className="text-center mb-16 pt-16">
                <motion.h1 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-400 via-primary to-orange-500 bg-clip-text text-transparent">
                        Seu Caminho de Aprendizado
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-gray-400 mt-4 max-w-2xl mx-auto">
                        Avance pelos níveis, complete desafios e colete suas recompensas para dominar novas habilidades.
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
                                <h2 className="text-2xl font-bold text-orange-400 shrink-0 px-4">{nivel.titulo}</h2>
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
                                                    <div className="relative w-24 h-24">
                                                        <img
                                                            src={`/Group ${indiceGlobal + 1}.svg`}
                                                            alt={bloco.titulo}
                                                            className="w-full h-full rounded-full object-cover"
                                                        />
                                                        {status === 'completo' && (
                                                            <div className="absolute inset-0 bg-secondary/70 rounded-full flex items-center justify-center">
                                                                <Check className="h-10 w-10 text-white" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="font-bold">{bloco.titulo}</p>
                                                {status === 'completo' && <p>Review</p>}
                                                {status === 'desbloqueado' && !hasNoHearts && <p>Start</p>}
                                                {status === 'desbloqueado' && hasNoHearts && <p>You are out of lives!</p>}
                                                {status === 'bloqueado' && <p>Locked</p>}
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
                                                    ${isLevelComplete && !isRewardClaimed ? 'border-warning hover:bg-warning/20 animate-pulse' : 'border-white/10'}
                                                    ${isRewardClaimed && 'border-secondary/50'}
                                                `}
                                                disabled={!isLevelComplete || isRewardClaimed}
                                                onClick={() => handleClaimReward(nivel.nivel)}
                                            >
                                                <Gift className={`h-12 w-12 transition-colors ${isLevelComplete && !isRewardClaimed ? 'text-warning' : isRewardClaimed ? 'text-secondary' : 'text-gray-500'}`} />
                                                <span className="text-xs font-bold text-gray-300">Reward</span>
                                            </Button>
                                        </motion.div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        {isLevelComplete && !isRewardClaimed && <p>Click to collect 100 XP!</p>}
                                        {isLevelComplete && isRewardClaimed && <p>Reward already collected.</p>}
                                        {!isLevelComplete && <p>Complete all blocks in the level to unlock.</p>}
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
