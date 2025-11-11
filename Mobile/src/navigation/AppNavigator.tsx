import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Ionicons} from '@expo/vector-icons';
import {useAuth} from '@contexts/AuthContext';

// Screens
import LoginScreen from '@screens/Login';
import RegisterScreen from '@screens/Register';
import DashboardScreen from '@screens/Dashboard';
import TrilhaScreen from '@screens/Trilha';
import SubjectsScreen from '@screens/Subjects';
import ProfileScreen from '@screens/Profile';
import StudyPlanScreen from '@screens/StudyPlan';
import GameScreen from '@screens/Game';
import EditProfileScreen from '@screens/EditProfile';
import SuporteScreen from '@screens/Suporte';
import QuizPersonalizadoScreen from '@screens/QuizPersonalizado';

import {RootStackParamList, MainTabsParamList} from '@types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabsParamList>();

// Bottom Tab Navigator
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          let iconName: string;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Trilha':
              iconName = focused ? 'trail-sign' : 'trail-sign-outline';
              break;
            case 'Subjects':
              iconName = focused ? 'book' : 'book-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#f59e0b',
        tabBarInactiveTintColor: '#a3a3a3',
        tabBarStyle: {
          backgroundColor: '#1a1a1a',
          borderTopColor: '#262626',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{tabBarLabel: 'Início'}}
      />
      <Tab.Screen
        name="Trilha"
        component={TrilhaScreen}
        options={{tabBarLabel: 'Trilha'}}
      />
      <Tab.Screen
        name="Subjects"
        component={SubjectsScreen}
        options={{tabBarLabel: 'Matérias'}}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{tabBarLabel: 'Perfil'}}
      />
    </Tab.Navigator>
  );
};

// Root Navigator
const AppNavigator = () => {
  const {isAuthenticated} = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: {backgroundColor: '#0a0a0a'},
        }}
      >
        {!isAuthenticated ? (
          // Auth Stack
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          // Main Stack
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="StudyPlan" component={StudyPlanScreen} />
            <Stack.Screen name="Game" component={GameScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="Suporte" component={SuporteScreen} />
            <Stack.Screen
              name="QuizPersonalizado"
              component={QuizPersonalizadoScreen}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
