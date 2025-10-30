import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useApp } from '../context/AppContext';

import AppNavigator from './AppNavigator';
import NowPlayingScreen from '../screens/NowPlayingScreen';
import GenreDetailScreen from '../screens/GenreDetailScreen';
import PlaylistDetailScreen from '../screens/PlaylistDetailScreen';
import ArtistDetailScreen from '../screens/ArtistDetailScreen';
import SettingsScreen from '../screens/SettingsScreen';
import PlayHistoryScreen from '../screens/PlayHistoryScreen';

const Stack = createStackNavigator();

const StackNavigator = () => {
  const { colors } = useApp();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="MainTabs" component={AppNavigator} />
      <Stack.Screen
        name="NowPlaying"
        component={NowPlayingScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen name="GenreDetail" component={GenreDetailScreen} />
      <Stack.Screen name="PlaylistDetail" component={PlaylistDetailScreen} />
      <Stack.Screen name="ArtistDetail" component={ArtistDetailScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="PlayHistory" component={PlayHistoryScreen} />
    </Stack.Navigator>
  );
};

export default StackNavigator;
