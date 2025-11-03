import { useState, useEffect, useCallback } from 'react';

const getTodayKey = () => {
  return `learningTime_${new Date().toISOString().split('T')[0]}`;
};

export const useTimeTracker = () => {
  const [totalTime, setTotalTime] = useState<number>(() => {
    const savedTime = localStorage.getItem(getTodayKey());
    return savedTime ? parseInt(savedTime, 10) : 0;
  });

  const saveTime = useCallback((time: number) => {
    localStorage.setItem(getTodayKey(), time.toString());
    setTotalTime(time);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        if (interval) clearInterval(interval);
        interval = null;
      } else {
        if (!interval) {
          interval = setInterval(() => {
            setTotalTime(prevTime => {
              const newTime = prevTime + 1;
              saveTime(newTime);
              return newTime;
            });
          }, 1000);
        }
      }
    };

    // Inicia o rastreamento se a página estiver visível
    if (document.visibilityState === 'visible') {
      interval = setInterval(() => {
        setTotalTime(prevTime => {
          const newTime = prevTime + 1;
          saveTime(newTime);
          return newTime;
        });
      }, 1000);
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Limpa o intervalo quando o hook é desmontado
    return () => {
      if (interval) clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [saveTime]);

  return { totalTimeInSeconds: totalTime };
};
