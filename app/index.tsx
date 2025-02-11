import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import MapViewComponent from '@/pages/MapViewComponent';
import PageOne from '@/pages/InfoPage';
import Settings from '@/pages/Settings';
import LoginPage from '@/pages/Login';
import SignUpPage from '@/pages/SignUpPage';
import AddSavedAddress from '@/pages/AddSavedAdress';
import Help from '@/pages/Help';
import Necessities from '@/pages/Necessities';
import FindAShelter from '@/pages/FindAShelter';
import InfoPage from '@/pages/InfoPage';
import FloodPreparation from '@/pages/FloodPreparation';
import InFloodPreparation from '@/pages/InFloodPreparation';

/**
 * RootStackParamList is a type that defines the possible routes in the app.
 */
export type RootStackParamList = {
  LoginPage: undefined;
  MapViewComponent: { selectedPoint?: { latitude: number; longitude: number; title: string; description?: string } } | undefined;
  InfoPage: undefined;
  Settings: undefined;
  SignUpPage: undefined;
  AddSavedAddress: { type: 'home' | 'work' | null };
  Help: undefined;
  Necessities: undefined;
  FindAShelter: undefined;
  FloodPreparation: undefined;
  InFloodPreparation: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

/**
 * The main app component.
 * @returns The main app component consisting off all pages.
 */
const App: React.FC = () => {
  return (
        <Stack.Navigator initialRouteName="LoginPage">
          {/* Define all the routes in the app */}
         <Stack.Screen
            name="LoginPage"
            component={LoginPage}
            options={{ headerShown: false, animationEnabled: false }}
          />
          <Stack.Screen
            name="SignUpPage"
            component={SignUpPage}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="MapViewComponent"
            component={MapViewComponent}
            options={{ headerShown: false, animationEnabled: false }}
          />
          <Stack.Screen
            name="InfoPage"
            component={InfoPage}
            options={{
              headerShown: false,
              animationEnabled: false
            }}
          />
          <Stack.Screen
            name="Settings"
            component={Settings}
            options={{
              headerShown: false,
              animationEnabled: false
            }}
          />

          <Stack.Screen
            name="AddSavedAddress"
            component={AddSavedAddress}
            options={{
              headerShown: false,
              animationEnabled: false
            }}
          />
          <Stack.Screen
            name="Help"
            component={Help}
            options={{
              headerShown: false,
              animationEnabled: false
            }}
          />
          <Stack.Screen
            name="Necessities"
            component={Necessities}
            options={{
              headerShown: false,
              animationEnabled: false
            }}
          />
          <Stack.Screen
            name="FindAShelter"
            component={FindAShelter}
            options={{
              headerShown: false,
              animationEnabled: false
            }}
          />
          <Stack.Screen
            name="FloodPreparation"
            component={FloodPreparation}
            options={{
              headerShown: false,
              animationEnabled: false
            }}
          />
          <Stack.Screen
            name="InFloodPreparation"
            component={InFloodPreparation}
            options={{
              headerShown: false,
              animationEnabled: false
            }}
          />
        </Stack.Navigator>
  );
};

export default App;