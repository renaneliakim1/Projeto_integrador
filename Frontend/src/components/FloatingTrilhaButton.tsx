import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

const FloatingTrilhaButton = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Verifica se o usuário está logado
    const token = localStorage.getItem('accessToken');
    setIsLoggedIn(!!token);
  }, [location.pathname]);

  // Lista de páginas onde o botão NÃO deve aparecer
  const excludedPages = [
    '/trilha',
    '/game',
    '/study-plan',
    '/edit-profile',
    '/lesson',
    '/forgot-password',
    '/login',
    '/register',
    '/quiz-nivelamento',
    '/suporte'
  ];

  // Verifica se a página atual está na lista de exclusão
  const isExcludedPage = excludedPages.some(page => 
    location.pathname === page || location.pathname.startsWith(`${page}/`)
  );

  // Não mostrar o botão se não estiver logado ou estiver em uma página excluída
  if (!isLoggedIn || isExcludedPage) {
    return null;
  }

  return (
    <Button
      onClick={() => navigate('/trilha')}
      className="hidden md:flex fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-50 bg-transparent p-2"
      size="icon"
      title="Ir para Trilha"
    >
      <img 
        src="/joystick.svg" 
        alt="Joystick" 
        className="w-full h-full object-contain"
      />
    </Button>
  );
};

export default FloatingTrilhaButton;
