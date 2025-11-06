import React, { useState, useEffect, useRef } from 'react';

interface TypedTextWithHighlightProps {
  text: string;
  highlightWord: string;
  highlightClassName: string;
  speed?: number;
  delay?: number;
}

const TypedTextWithHighlight: React.FC<TypedTextWithHighlightProps> = ({
  text,
  highlightWord,
  highlightClassName,
  speed = 50,
  delay = 1000,
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTranslated, setIsTranslated] = useState(false);
  const hasCheckedRef = useRef(false);

  // Detecta se o Google Translate está ativo
  useEffect(() => {
    const checkTranslation = () => {
      const translated = 
        document.documentElement.classList.contains('translated-ltr') ||
        document.documentElement.classList.contains('translated-rtl') ||
        document.body.classList.contains('translated-ltr') ||
        document.body.classList.contains('translated-rtl');
      
      if (translated && !hasCheckedRef.current) {
        setIsTranslated(true);
        setDisplayedText(text);
        setCurrentIndex(text.length);
        hasCheckedRef.current = true;
      }
    };

    // Verifica imediatamente
    checkTranslation();

    // Monitora mudanças nas classes (quando usuário traduz)
    const observer = new MutationObserver(checkTranslation);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class']
    });
    observer.observe(document.body, { 
      attributes: true, 
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, [text]);

  // Animação de digitação (só roda se NÃO estiver traduzido)
  useEffect(() => {
    if (isTranslated) return;
    
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, speed, isTranslated]);

  const renderText = () => {
    const highlightStartIndex = text.indexOf(highlightWord);
    if (highlightStartIndex === -1) {
      return <>{displayedText}</>;
    }
    const highlightEndIndex = highlightStartIndex + highlightWord.length;

    const beforeText = displayedText.substring(0, highlightStartIndex);
    const highlightedText = displayedText.substring(highlightStartIndex, highlightEndIndex);
    const afterText = displayedText.substring(highlightEndIndex);

    return (
      <>
        {beforeText}
        <span className={highlightClassName}>{highlightedText}</span>
        {afterText}
      </>
    );
  };

  return (
    <>
      {renderText()}
    </>
  );
};

export default TypedTextWithHighlight;
