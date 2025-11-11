declare module 'react-native-image-picker' {
  export interface Asset {
    uri?: string;
    type?: string;
    fileName?: string;
  }

  export interface ImagePickerResponse {
    didCancel?: boolean;
    errorCode?: string;
    errorMessage?: string;
    assets?: Asset[];
  }

  export interface ImageLibraryOptions {
    mediaType: 'photo' | 'video' | 'mixed';
    quality?: number;
    maxWidth?: number;
    maxHeight?: number;
  }

  export function launchImageLibrary(
    options: ImageLibraryOptions,
    callback: (response: ImagePickerResponse) => void
  ): void;

  export function launchCamera(
    options: ImageLibraryOptions,
    callback: (response: ImagePickerResponse) => void
  ): void;
}

declare module '@react-native-community/datetimepicker' {
  import { Component } from 'react';

  export interface DateTimePickerEvent {
    type: 'set' | 'dismissed';
    nativeEvent: {
      timestamp: number;
    };
  }

  export interface DateTimePickerProps {
    value: Date;
    mode?: 'date' | 'time' | 'datetime';
    display?: 'default' | 'spinner' | 'calendar' | 'clock';
    onChange?: (event: DateTimePickerEvent, date?: Date) => void;
    minimumDate?: Date;
    maximumDate?: Date;
  }

  export default class DateTimePicker extends Component<DateTimePickerProps> {}
}
