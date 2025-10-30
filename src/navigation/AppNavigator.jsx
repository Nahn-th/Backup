import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { useApp } from '../context/AppContext';

// Screens
import GenresScreen from '../screens/GenresScreen';
import PlaylistsScreen from '../screens/PlaylistsScreen';
import SongsScreen from '../screens/SongsScreen';
import ArtistsScreen from '../screens/ArtistsScreen';

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
  const { colors } = useApp();

  return (
    <Tab.Navigator
      initialRouteName="Songs"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.iconActive,
        tabBarInactiveTintColor: colors.iconInactive,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="Genres"
        component={GenresScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="musical-notes" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Playlists"
        component={PlaylistsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="folder" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Songs"
        component={SongsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="musical-note" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Artists"
        component={ArtistsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default AppNavigator;
