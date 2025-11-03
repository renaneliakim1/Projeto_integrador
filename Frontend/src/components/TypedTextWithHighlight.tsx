import React, { useState, useEffect } from 'react';

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

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, speed]);

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
