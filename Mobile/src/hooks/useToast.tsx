import {useCallback} from 'react';
import {Alert, ToastAndroid, Platform} from 'react-native';

interface ToastOptions {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
}

export const useToast = () => {
  const toast = useCallback(({title, description, variant = 'default'}: ToastOptions) => {
    const message = description ? `${title}\n${description}` : title;

    if (Platform.OS === 'android') {
      // Android usa ToastAndroid nativo
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      // iOS usa Alert
      Alert.alert(title, description, [{text: 'OK'}]);
    }
  }, []);

  return {toast};
};
