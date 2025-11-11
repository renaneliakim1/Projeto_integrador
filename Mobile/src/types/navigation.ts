export type RootStackParamList = {
  // Auth Stack
  Login: undefined;
  Register: undefined;
  
  // Main Stack
  MainTabs: undefined;
  
  // Screens
  StudyPlan: undefined;
  Game: { blocoId: string };
  EditProfile: undefined;
  Suporte: undefined;
  QuizPersonalizado: undefined;
};

export type MainTabsParamList = {
  Dashboard: undefined;
  Trilha: undefined;
  Subjects: undefined;
  Profile: undefined;
};

export type NavigationProps = {
  navigate: (screen: string, params?: any) => void;
  goBack: () => void;
  replace: (screen: string, params?: any) => void;
};
