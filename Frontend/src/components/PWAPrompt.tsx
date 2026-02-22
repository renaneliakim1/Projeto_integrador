import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';

export function PWAPrompt() {
  const { toast } = useToast();
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(registration) {
      console.log('✅ PWA: Service Worker registrado com sucesso!');
      console.log('📱 App pode ser instalado como PWA');
      console.log('🌐 URL atual:', window.location.href);
      console.log('📱 User Agent:', navigator.userAgent);
      
      // Verifica atualizações a cada hora
      if (registration) {
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.error('❌ PWA: Erro ao registrar Service Worker:', error);
    },
  });

  useEffect(() => {
    // Detecta iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(ios);
    
    // Detecta se é mobile (Android ou iOS)
    const mobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    setIsMobile(mobile);
    
    // Detecta se já está instalado (standalone mode)
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                       (window.navigator as any).standalone === true;
    setIsStandalone(standalone);
    
    console.log('📱 Dispositivo:', {
      iOS: ios,
      mobile: mobile,
      standalone: standalone,
      displayMode: window.matchMedia('(display-mode: standalone)').matches
    });

    if (standalone) {
      console.log('✅ App já instalado! Rodando em modo standalone');
      return;
    }

    // Só mostra banner em dispositivos mobile
    if (!mobile) {
      console.log('🖥️ Desktop detectado - banner não será exibido');
      return;
    }

    // Verifica se já mostrou o banner
    const hasSeenBanner = localStorage.getItem('pwa-install-banner-seen');
    
    if (!hasSeenBanner) {
      // Mostra banner após 3 segundos
      setTimeout(() => {
        setShowInstallBanner(true);
        console.log('🎉 Mostrando banner de instalação (mobile)');
      }, 3000);
    }
  }, []);

  useEffect(() => {
    if (offlineReady) {
      toast({
        title: "📱 App pronto para uso!",
        description: "Você pode usar o Skillio como aplicativo.",
        duration: 5000,
      });
      setOfflineReady(false);
    }
  }, [offlineReady, setOfflineReady, toast]);

  useEffect(() => {
    if (needRefresh) {
      toast({
        title: "🔄 Nova versão disponível!",
        description: "Clique para atualizar o aplicativo.",
        duration: 0,
        action: (
          <Button
            size="sm"
            onClick={() => {
              updateServiceWorker(true);
              window.location.reload();
            }}
            className="bg-primary hover:bg-primary/90"
          >
            Atualizar Agora
          </Button>
        ),
      });
    }
  }, [needRefresh, updateServiceWorker, toast]);

  // Evento de instalação do app
  useEffect(() => {
    const handleAppInstalled = () => {
      console.log('🎉 PWA: App instalado com sucesso!');
      setShowInstallBanner(false);
      toast({
        title: "🎉 App instalado!",
        description: "Skillio foi adicionado à sua tela inicial.",
        duration: 5000,
      });
    };

    window.addEventListener('appinstalled', handleAppInstalled);
    
    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [toast]);

  // Captura o evento beforeinstallprompt (Chrome Android)
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      console.log('💡 PWA: beforeinstallprompt capturado - Chrome Android detectado');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    console.log('🔘 Botão de instalação clicado');
    console.log('📱 Dispositivo iOS?', isIOS);
    console.log('📱 Prompt disponível?', !!deferredPrompt);

    if (deferredPrompt && !isIOS) {
      // Chrome Android - usa o prompt nativo
      console.log('▶️ Mostrando prompt de instalação (Chrome Android)');
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`PWA: Usuário ${outcome === 'accepted' ? 'aceitou' : 'recusou'} instalação`);
      
      if (outcome === 'accepted') {
        setShowInstallBanner(false);
        localStorage.setItem('pwa-install-banner-seen', 'true');
      }
      
      setDeferredPrompt(null);
    } else {
      // iOS ou navegadores sem beforeinstallprompt - mostra instruções
      console.log('ℹ️ Mostrando instruções de instalação manual');
      
      const instructions = isIOS 
        ? 'Para instalar no iOS:\n\n1. Toque no botão "Compartilhar" (quadrado com seta) na barra inferior\n2. Role para baixo e toque em "Adicionar à Tela de Início"\n3. Toque em "Adicionar"'
        : 'Para instalar:\n\n1. Toque no menu do navegador (⋮)\n2. Selecione "Instalar app" ou "Adicionar à tela inicial"\n3. Confirme a instalação';

      toast({
        title: "📱 Como Instalar o Skillio",
        description: instructions,
        duration: 15000,
      });
    }
  };

  const handleDismissBanner = () => {
    console.log('❌ Banner de instalação descartado');
    setShowInstallBanner(false);
    localStorage.setItem('pwa-install-banner-seen', 'true');
  };

  // Não mostra banner se já estiver instalado ou não for mobile
  if (isStandalone || !showInstallBanner || !isMobile) {
    return null;
  }

  // Banner de instalação
  return (
    <div className="fixed bottom-20 left-4 right-4 z-[9999] md:bottom-4 md:left-auto md:right-4 md:max-w-sm animate-in slide-in-from-bottom-5 duration-500">
      <div className="bg-gradient-to-r from-primary to-secondary p-4 rounded-lg shadow-2xl border border-white/20">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 p-2 bg-white/20 rounded-lg">
            <Download className="h-6 w-6 text-white" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-white font-bold mb-1">
              📱 Instalar Skillio
            </h3>
            <p className="text-white/90 text-sm mb-3">
              {isIOS 
                ? 'Adicione à tela inicial para acesso rápido!'
                : 'Instale o app para acesso rápido!'}
            </p>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleInstallClick}
                className="bg-white text-primary hover:bg-white/90 font-semibold"
              >
                {isIOS ? 'Ver Como' : 'Instalar Agora'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismissBanner}
                className="text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
