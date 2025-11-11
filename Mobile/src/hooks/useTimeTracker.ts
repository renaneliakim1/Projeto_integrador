import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';

const getTodayKey = () => {
  return `learningTime_${new Date().toISOString().split('T')[0]}`;
};

export const useTimeTracker = () => {
  const [totalTime, setTotalTime] = useState<number>(0);

  // Carrega tempo inicial do AsyncStorage
  useEffect(() => {
    const loadSavedTime = async () => {
      const savedTime = await AsyncStorage.getItem(getTodayKey());
      if (savedTime) {
        setTotalTime(parseInt(savedTime, 10));
      }
    };
    loadSavedTime();
  }, []);

  const saveTime = useCallback(async (time: number) => {
    await AsyncStorage.setItem(getTodayKey(), time.toString());
    setTotalTime(time);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        // App está em background ou inativo - para o rastreamento
        if (interval) clearInterval(interval);
        interval = null;
      } else if (nextAppState === 'active') {
        // App está ativo - inicia o rastreamento
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

    // Inicia o rastreamento imediatamente quando o hook é montado
    interval = setInterval(() => {
      setTotalTime(prevTime => {
        const newTime = prevTime + 1;
        saveTime(newTime);
        return newTime;
      });
    }, 1000);

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Limpa o intervalo quando o hook é desmontado
    return () => {
      if (interval) clearInterval(interval);
      subscription.remove();
    };
  }, [saveTime]);

  return { totalTimeInSeconds: totalTime };
};
