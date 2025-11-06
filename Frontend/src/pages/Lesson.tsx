import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLessonAI } from '@/hooks/useLessonAI';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Loader2, PlayCircle } from 'lucide-react';
import { trilhaPrincipal } from "@/data/trilhaPrincipal";
import { subjects } from "@/data/subjects";
import { useState, useEffect } from 'react';
import { useGamification } from '@/hooks/useGamification';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

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
  const { userFocus, isLoading: isLoadingFocus } = useGamification();
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(true);

  // userFocus and isLoadingFocus are provided by useGamification (centralized source)

  const trilhaBloco = trilhaPrincipal.flatMap(n => n.blocos).find(b => b.id === subjectId);
  const subjectInfo = subjects.find(s => s.id === subjectId);

  let displayTitle: string;
  let subjectForAI: string;

  if (trilhaBloco) { // É um jogo de trilha
    if (trilhaBloco.tipo === 'foco') {
      displayTitle = userFocus;
      subjectForAI = userFocus;
    } else {
      displayTitle = trilhaBloco.titulo;
      subjectForAI = trilhaBloco.titulo;
    }
  } else if (subjectInfo) { // É um jogo de matéria
    displayTitle = subjectInfo.name;
    subjectForAI = subjectInfo.name;
  } else {
    displayTitle = subjectId || 'Tópico Desconhecido';
    subjectForAI = subjectId || 'Conhecimentos Gerais';
  }
  
  const { generatedLesson, loading: isLoadingLesson, error, refetch } = useLessonAI(subjectForAI, educationalLevel, !isLoadingFocus);

  useEffect(() => {
    const fetchYouTubeVideos = async () => {
      if (!subjectForAI) return;
  
      if (!YOUTUBE_API_KEY) {
        console.error("A chave da API do YouTube não foi definida. Crie um arquivo .env na pasta Frontend e adicione VITE_YOUTUBE_API_KEY=SUA_CHAVE.");
        setIsLoadingVideos(false);
        return;
      }
  
      setIsLoadingVideos(true);
      try {
        // Busca vídeos com termo de busca mais específico e contextualizado
        // Adiciona palavras-chave para diferenciar contextos (ex: civil, computadores, etc)
        let searchTerm = `${subjectForAI} aula introdução`;
        
        // Contextualizações específicas para evitar ambiguidades
        const lowerSubject = subjectForAI.toLowerCase();
        if (lowerSubject.includes('arquitetura') && !lowerSubject.includes('computador')) {
          searchTerm = `arquitetura civil construção aula introdução`;
        } else if (lowerSubject.includes('design') && !lowerSubject.includes('web')) {
          searchTerm = `design gráfico criativo aula introdução`;
        } else if (lowerSubject.includes('engenharia') && !lowerSubject.includes('software')) {
          searchTerm = `engenharia civil mecânica aula introdução`;
        }
        
        const searchResponse = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchTerm)}&key=${YOUTUBE_API_KEY}&type=video&maxResults=15&videoEmbeddable=true&relevanceLanguage=pt&videoDuration=medium`);
        const searchData = await searchResponse.json();
        
        if (searchData.items && searchData.items.length > 0) {
          // Pega os IDs dos vídeos para buscar detalhes (incluindo duração)
          const videoIds = searchData.items.map((item: { id: { videoId: string } }) => item.id.videoId).join(',');
          
          // Busca detalhes dos vídeos (incluindo duração)
          const detailsResponse = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`);
          const detailsData = await detailsResponse.json();
          
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
            
            setVideos(filteredVideos);
          }
        }
      } catch (error) {
        console.error("Falha ao buscar vídeos do YouTube", error);
      } finally {
        setIsLoadingVideos(false);
      }
    };
  
    if (!isLoadingLesson) {
      fetchYouTubeVideos();
    }
  }, [subjectForAI, isLoadingLesson]);

  if (isLoadingFocus || isLoadingLesson) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">
            {isLoadingFocus ? "Buscando suas preferências..." : `Gerando sua aula de ${displayTitle}...`}
          </h2>
          <Progress value={null} className="h-3 w-full animate-pulse" />
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Erro ao gerar a aula</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button variant="game" onClick={refetch}>Tentar Novamente</Button>
        </Card>
      </div>
    );
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
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-center bg-gradient-primary bg-clip-text text-transparent">
                Aula de {displayTitle}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {generatedLesson?.lesson}
              </p>
            </CardContent>
          </Card>

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
              ) : (
                <p className="col-span-full text-center text-muted-foreground">Nenhum vídeo encontrado.</p>
              )}
            </CardContent>
          </Card>

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
