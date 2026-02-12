import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLessonAI } from '@/hooks/useLessonAI';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Loader2, PlayCircle, BookOpen, TrendingUp } from 'lucide-react';
import { trilhaPrincipal } from "@/data/trilhaPrincipal";
import { subjects } from "@/data/subjects";
import { useState, useEffect } from 'react';
import { useGamification } from '@/hooks/useGamification';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import apiClient from '@/api/axios';
import { Badge } from '@/components/ui/badge';

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

// Tipos do Plano de Estudo
type StudyPlanTopic = {
  title: string;
  description: string;
};

type StudyPlanAction = {
  area: string;
  emoji: string;
  topics: StudyPlanTopic[];
};

type StudyPlan = {
  title: string;
  greeting: string;
  analysis: {
    summary: string;
    focusPoints: string[];
    strength: string;
  };
  actionPlan: StudyPlanAction[];
  nextChallenge: {
    title: string;
    suggestion: string;
  };
  motivation: string;
};

// Helper para extrair o ID do vídeo do YouTube de vários formatos de URL
const getYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === 'youtu.be') {
      return urlObj.pathname.slice(1);
    }
    if (urlObj.hostname.includes('youtube.com')) {
      const videoId = urlObj.searchParams.get('v');
      if (videoId) {
        return videoId;
      }
      // Checa também por URLs de embed
      const pathParts = urlObj.pathname.split('/');
      if (pathParts[1] === 'embed') {
        return pathParts[2];
      }
    }
  } catch (e) {
    console.error("URL do YouTube inválida:", url, e);
    return null;
  }
  return null;
};

interface Video {
  title: string;
  url: string;
}

const Lesson = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const navigate = useNavigate();
  const educationalLevel = localStorage.getItem('userEducationalLevel') || 'Ensino Médio';
  const userAge = localStorage.getItem('userAge') || '15';
  const { userFocus, isLoading: isLoadingFocus, blocosCompletos } = useGamification();
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(true);
  const [forceGenerate, setForceGenerate] = useState(false);
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [relevantTopics, setRelevantTopics] = useState<StudyPlanTopic[]>([]);
  const [isLoadingPlan, setIsLoadingPlan] = useState(true);

  // Timeout de segurança: após 3 segundos, força geração mesmo sem userFocus
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isLoadingFocus && !userFocus) {
        console.warn('⏰ Timeout: Forçando geração da aula após 3s');
        setForceGenerate(true);
      }
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [isLoadingFocus, userFocus]);

  // Busca o plano de estudos do usuário
  useEffect(() => {
    const fetchStudyPlan = async () => {
      try {
        setIsLoadingPlan(true);
        console.log('📚 Lesson: Buscando plano de estudos...');
        const response = await apiClient.get('/users/me/');
        let plan = response.data?.profile?.study_plan;
        
        if (typeof plan === 'string') {
          plan = JSON.parse(plan);
        }
        
        if (plan && typeof plan === 'object' && Object.keys(plan).length > 0) {
          console.log('✅ Lesson: Plano de estudos carregado:', plan);
          setStudyPlan(plan);
        } else {
          console.warn('⚠️ Lesson: Plano de estudos não encontrado');
        }
      } catch (error) {
        console.error('❌ Lesson: Erro ao buscar plano de estudos:', error);
      } finally {
        setIsLoadingPlan(false);
      }
    };
    
    fetchStudyPlan();
  }, []);

  // userFocus and isLoadingFocus are provided by useGamification (centralized source)

  const trilhaBloco = trilhaPrincipal.flatMap(n => n.blocos).find(b => b.id === subjectId);
  const subjectInfo = subjects.find(s => s.id === subjectId);

  let displayTitle: string;
  let subjectForAI: string;
  let isFocusBlock = false;

  if (trilhaBloco) { // É um jogo de trilha
    if (trilhaBloco.tipo === 'foco') {
      isFocusBlock = true;
      displayTitle = userFocus || 'Seu Foco de Estudo';
      subjectForAI = userFocus || 'Conhecimentos Gerais';
    } else {
      displayTitle = trilhaBloco.titulo;
      subjectForAI = trilhaBloco.titulo;
    }
  } else if (subjectInfo) { // É um jogo de matéria
    displayTitle = subjectInfo.name;
    subjectForAI = subjectInfo.name;
  } else {
    // Fallback: usa o subjectId ou um padrão
    displayTitle = subjectId || 'Tópico Desconhecido';
    subjectForAI = subjectId || 'Conhecimentos Gerais';
  }

  // Filtra os topics relevantes do plano de estudos
  useEffect(() => {
    if (!studyPlan || !studyPlan.actionPlan) return;
    
    console.log('🔍 Lesson: Filtrando topics para:', subjectForAI);
    
    // Procura a área correspondente no plano de estudos
    const relevantArea = studyPlan.actionPlan.find((action: StudyPlanAction) => {
      const areaMatch = action.area.toLowerCase().includes(subjectForAI.toLowerCase()) ||
                       subjectForAI.toLowerCase().includes(action.area.toLowerCase());
      return areaMatch;
    });
    
    if (relevantArea && relevantArea.topics) {
      console.log(`✅ Lesson: Encontrados ${relevantArea.topics.length} topics para ${relevantArea.area}`);
      setRelevantTopics(relevantArea.topics);
      
      // Calcula o progresso: quantos blocos dessa matéria foram completados
      const blocosDestaMateria = trilhaPrincipal
        .flatMap(n => n.blocos)
        .filter(b => b.titulo?.toLowerCase().includes(subjectForAI.toLowerCase()));
      
      const blocosCompletosDestaMateria = blocosDestaMateria.filter(b => 
        blocosCompletos?.includes(b.id)
      ).length;
      
      // Define o índice do topic atual (progride conforme completa blocos)
      const topicIndex = Math.min(blocosCompletosDestaMateria, relevantArea.topics.length - 1);
      setCurrentTopicIndex(topicIndex);
      
      console.log(`📊 Lesson: Progresso ${blocosCompletosDestaMateria}/${blocosDestaMateria.length} blocos`);
      console.log(`📍 Lesson: Topic atual [${topicIndex}]: ${relevantArea.topics[topicIndex]?.title}`);
    } else {
      console.warn('⚠️ Lesson: Nenhuma área relevante encontrada no plano');
      setRelevantTopics([]);
    }
  }, [studyPlan, subjectForAI, blocosCompletos]);

  // Garante que sempre temos um subject válido
  const finalSubjectForAI = subjectForAI && subjectForAI.trim() !== '' ? subjectForAI : 'Conhecimentos Gerais';
  
  // Determina o tópico específico baseado no plano de estudos
  const currentTopic = relevantTopics[currentTopicIndex];
  const specificTopic = currentTopic?.title || finalSubjectForAI;
  const topicContext = currentTopic?.description || '';
  
  console.log('🎯 Lesson: Gerando aula para:', {
    materia: finalSubjectForAI,
    topico: specificTopic,
    contexto: topicContext,
    nivel: educationalLevel,
    idade: userAge,
    foco: userFocus,
    progressoTopics: `${currentTopicIndex + 1}/${relevantTopics.length}`
  });
  
  // Contextualiza o assunto para garantir que aula e vídeos sejam do mesmo tema
  let contextualizedSubject = specificTopic; // Usa o tópico específico
  const lowerSubject = specificTopic.toLowerCase();
  
  if (lowerSubject.includes('arquitetura') && !lowerSubject.includes('computador')) {
    contextualizedSubject = `Arquitetura Civil - ${specificTopic}`;
  } else if (lowerSubject.includes('design') && !lowerSubject.includes('web')) {
    contextualizedSubject = `Design Gráfico - ${specificTopic}`;
  } else if (lowerSubject.includes('engenharia') && !lowerSubject.includes('software')) {
    contextualizedSubject = `Engenharia Civil - ${specificTopic}`;
  }
  
  // Adiciona contexto à aula se tiver descrição do tópico
  if (topicContext && topicContext.trim() !== '') {
    contextualizedSubject = `${contextualizedSubject}. Contexto: ${topicContext}`;
  }
  
  // Se for bloco de foco E o userFocus ainda está carregando E está vazio E não forçado, aguarda
  const shouldWaitForFocus = isFocusBlock && isLoadingFocus && !userFocus && !forceGenerate;
  
  // Sempre habilita EXCETO se for bloco de foco E ainda está carregando
  const { generatedLesson, loading: isLoadingLesson, error, refetch } = useLessonAI(
    contextualizedSubject, // Usa o tópico específico contextualizado
    educationalLevel, 
    !shouldWaitForFocus // Habilitado a menos que precise esperar foco
  );

  useEffect(() => {
    const fetchYouTubeVideos = async () => {
      if (!specificTopic) {
        console.warn('⚠️ Lesson: specificTopic vazio, não buscando vídeos');
        setIsLoadingVideos(false);
        return;
      }
  
      if (!YOUTUBE_API_KEY) {
        console.error("A chave da API do YouTube não foi definida. Crie um arquivo .env na pasta Frontend e adicione VITE_YOUTUBE_API_KEY=SUA_CHAVE.");
        setIsLoadingVideos(false);
        return;
      }

      // Verifica cache primeiro
      const cacheKey = `youtube_videos_${specificTopic.toLowerCase().replace(/\s+/g, '_')}`;
      const cachedVideos = localStorage.getItem(cacheKey);
      
      if (cachedVideos) {
        try {
          const parsed = JSON.parse(cachedVideos);
          console.log('✅ Vídeos carregados do cache para:', specificTopic);
          setVideos(parsed);
          setIsLoadingVideos(false);
          return;
        } catch (e) {
          console.warn('⚠️ Cache corrompido, buscando novos vídeos');
        }
      }
  
      setIsLoadingVideos(true);
      console.log('🎬 Iniciando busca de vídeos para:', specificTopic);
      
      try {
        // Tenta primeiro com o tópico específico
        const searchTerm = `${specificTopic} aula`;
        console.log('🔍 Termo de busca:', searchTerm);
        
        const searchResponse = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchTerm)}&key=${YOUTUBE_API_KEY}&type=video&maxResults=15&videoEmbeddable=true&relevanceLanguage=pt&videoDuration=medium`);
        
        console.log('📡 Status da resposta YouTube Search:', searchResponse.status);
        
        if (!searchResponse.ok) {
          const errorText = await searchResponse.text();
          console.error('❌ Erro na API do YouTube:', errorText);
          
          // Verifica se é erro de quota
          if (searchResponse.status === 403 && errorText.includes('quotaExceeded')) {
            console.error('🚫 Quota da API do YouTube excedida!');
            setVideos([]);
            setIsLoadingVideos(false);
            return;
          }
          
          throw new Error(`YouTube API error: ${searchResponse.status}`);
        }
        
        const searchData = await searchResponse.json();
        console.log('📦 Dados recebidos do YouTube:', searchData);
        
        if (searchData.error) {
          console.error('❌ Erro retornado pela API:', searchData.error);
          
          if (searchData.error.code === 403 && searchData.error.message?.includes('quota')) {
            console.error('🚫 Quota da API do YouTube excedida!');
            setVideos([]);
            setIsLoadingVideos(false);
            return;
          }
          
          throw new Error(searchData.error.message);
        }
        
        if (searchData.items && searchData.items.length > 0) {
          console.log(`✅ Encontrados ${searchData.items.length} vídeos iniciais`);
          
          // Pega os IDs dos vídeos para buscar detalhes (incluindo duração)
          const videoIds = searchData.items.map((item: { id: { videoId: string } }) => item.id.videoId).join(',');
          console.log('🎥 IDs dos vídeos:', videoIds);
          
          // Busca detalhes dos vídeos (incluindo duração)
          const detailsResponse = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`);
          
          console.log('📡 Status da resposta YouTube Details:', detailsResponse.status);
          
          if (!detailsResponse.ok) {
            const errorText = await detailsResponse.text();
            console.error('❌ Erro ao buscar detalhes:', errorText);
            throw new Error(`YouTube API error: ${detailsResponse.status}`);
          }
          
          const detailsData = await detailsResponse.json();
          console.log('📦 Detalhes recebidos:', detailsData);
          
          if (detailsData.items) {
            // Função para converter duração ISO 8601 (PT5M30S) em segundos
            const parseISO8601Duration = (duration: string): number => {
              const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
              if (!match) return 0;
              const hours = parseInt(match[1] || '0');
              const minutes = parseInt(match[2] || '0');
              const seconds = parseInt(match[3] || '0');
              return hours * 3600 + minutes * 60 + seconds;
            };
            
            // Filtra vídeos entre 3-6 minutos (180-360 segundos)
            const filteredVideos = detailsData.items
              .filter((item: { contentDetails: { duration: string } }) => {
                const durationInSeconds = parseISO8601Duration(item.contentDetails.duration);
                return durationInSeconds >= 180 && durationInSeconds <= 360;
              })
              .map((item: { snippet: { title: string }; id: string }) => ({
                title: item.snippet.title,
                url: `https://www.youtube.com/watch?v=${item.id}`
              }))
              .slice(0, 3); // Limita a 3 vídeos
            
            console.log(`✅ Vídeos filtrados (3-6 min): ${filteredVideos.length}`);
            
            if (filteredVideos.length > 0) {
              setVideos(filteredVideos);
              // Salva no cache
              localStorage.setItem(cacheKey, JSON.stringify(filteredVideos));
              console.log('💾 Vídeos salvos no cache');
            } else {
              // Se não encontrou vídeos de 3-6 min, usa qualquer duração
              console.warn('⚠️ Nenhum vídeo de 3-6 min encontrado, usando qualquer duração');
              const allVideos = detailsData.items
                .map((item: { snippet: { title: string }; id: string }) => ({
                  title: item.snippet.title,
                  url: `https://www.youtube.com/watch?v=${item.id}`
                }))
                .slice(0, 3);
              setVideos(allVideos);
              localStorage.setItem(cacheKey, JSON.stringify(allVideos));
              console.log('💾 Vídeos salvos no cache');
            }
          } else {
            console.warn('⚠️ Nenhum detalhe de vídeo retornado');
            setVideos([]);
          }
        } else {
          console.warn('⚠️ Nenhum vídeo encontrado para o termo:', searchTerm);
          setVideos([]);
        }
      } catch (error) {
        console.error("❌ Falha ao buscar vídeos do YouTube:", error);
        setVideos([]);
      } finally {
        setIsLoadingVideos(false);
        console.log('🏁 Busca de vídeos finalizada');
      }
    };
  
    if (!isLoadingLesson && !shouldWaitForFocus && !isLoadingPlan) {
      fetchYouTubeVideos();
    }
  }, [specificTopic, finalSubjectForAI, isLoadingLesson, shouldWaitForFocus, isLoadingPlan]);

  if (shouldWaitForFocus || isLoadingLesson || isLoadingPlan) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">
            {shouldWaitForFocus 
              ? "Carregando suas preferências..." 
              : isLoadingPlan
              ? "Carregando seu plano de estudos..."
              : "Gerando sua aula personalizada..."}
          </h2>
          <Progress value={null} className="h-3 w-full animate-pulse" />
        </Card>
      </div>
    );
  }

  if (error) {
    // Se tem erro MAS também tem conteúdo fallback, não bloqueia tudo
    if (generatedLesson?.lesson) {
      console.warn('⚠️ Usando conteúdo alternativo devido a erro:', error);
      // Continua renderizando normalmente, a mensagem de erro será sutil
    } else {
      // Erro crítico sem fallback
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Card className="p-8 text-center max-w-md">
            <h2 className="text-2xl font-bold mb-4">Não foi possível carregar a aula</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button variant="game" onClick={refetch}>Tentar Novamente</Button>
          </Card>
        </div>
      );
    }
  }

  return (
    <>
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Link to="/dashboard">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Dashboard
          </Button>
        </Link>

        <main className="max-w-3xl mx-auto">
          {/* Progressão do Plano de Estudos */}
          {relevantTopics.length > 0 && (
            <Card className="mb-6 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Sua Jornada de Aprendizado</CardTitle>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {currentTopicIndex + 1} de {relevantTopics.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Tópico Atual:</span>
                    <span className="text-sm text-primary font-bold">{currentTopic?.title}</span>
                  </div>
                  
                  <Progress 
                    value={(currentTopicIndex / Math.max(relevantTopics.length - 1, 1)) * 100} 
                    className="h-2"
                  />
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                    {relevantTopics.map((topic, index) => (
                      <div
                        key={index}
                        className={`px-2 py-1 rounded text-xs ${
                          index < currentTopicIndex
                            ? 'bg-green-500/20 text-green-700 dark:text-green-400'
                            : index === currentTopicIndex
                            ? 'bg-primary/20 text-primary font-bold'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {index + 1}. {topic.title}
                      </div>
                    ))}
                  </div>
                  
                  {currentTopicIndex < relevantTopics.length - 1 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      <span className="font-medium">Próximo:</span> {relevantTopics[currentTopicIndex + 1]?.title}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-center bg-gradient-primary bg-clip-text text-transparent">
                {currentTopic ? currentTopic.title : `Aula de ${displayTitle}`}
              </CardTitle>
              {currentTopic && (
                <p className="text-center text-sm text-muted-foreground mt-2">
                  {displayTitle} • {educationalLevel} • {relevantTopics.length > 0 ? `Nível ${currentTopicIndex + 1}` : 'Básico'}
                </p>
              )}
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-sm text-yellow-600 dark:text-yellow-400">
                  {error}
                </div>
              )}
              {generatedLesson?.lesson ? (
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {generatedLesson.lesson}
                </p>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    Não foi possível gerar a aula automaticamente.
                  </p>
                  <Button variant="outline" onClick={refetch}>
                    Tentar Gerar Novamente
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card de Vídeos - só aparece se tiver vídeos */}
          {(videos.length > 0 || isLoadingVideos) && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Vídeos Sugeridos</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {isLoadingVideos ? (
                  <div className="col-span-full text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                    <p>Buscando vídeos...</p>
                  </div>
                ) : videos.length > 0 ? (
                  videos.map((video, index) => {
                    const videoId = getYouTubeVideoId(video.url);
                    if (!videoId) {
                      return (
                        <div key={index} className="p-4 border rounded-lg text-red-500">
                          <p>Link de vídeo inválido: {video.url}</p>
                        </div>
                      );
                    }
                    return (
                      <div key={index} className="cursor-pointer group" onClick={() => setSelectedVideo(video)}>
                        <div className="relative aspect-video overflow-hidden rounded-lg border shadow-lg mb-2">
                          <img 
                            src={`https://i.ytimg.com/vi/${videoId}/sddefault.jpg`} 
                            alt={video.title} 
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              if (target.src.includes('/sddefault.jpg')) {
                                target.src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
                              } else if (target.src.includes('/hqdefault.jpg')) {
                                target.src = `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
                              } else if (target.src.includes('/mqdefault.jpg')) {
                                target.src = `https://i.ytimg.com/vi/${videoId}/default.jpg`;
                              }
                            }}
                          />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <PlayCircle className="h-12 w-12 text-white" />
                          </div>
                        </div>
                        <h3 className="font-semibold text-sm text-center">{video.title}</h3>
                      </div>
                    );
                  })
                ) : null}
              </CardContent>
            </Card>
          )}

          <div className="text-center">
            <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-white shadow-orange-glow" onClick={() => navigate(`/game/${subjectId}`)}>
              Iniciar Quiz
            </Button>
          </div>
        </main>
      </div>

      {selectedVideo && (
        <Dialog open={!!selectedVideo} onOpenChange={(isOpen) => !isOpen && setSelectedVideo(null)}>
          <DialogContent className="max-w-4xl w-full p-0 border-0">
            <DialogHeader className="p-4">
              <DialogTitle>{selectedVideo.title}</DialogTitle>
              <DialogDescription className="sr-only">
                Vídeo sobre {selectedVideo.title}. O player do YouTube está incorporado abaixo.
              </DialogDescription>
            </DialogHeader>
            <div className="aspect-video">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${getYouTubeVideoId(selectedVideo.url)}?autoplay=1`}
                title={selectedVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default Lesson;
