
import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { t } from '../../text/t';
import { useTheme } from '../../ui/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.mutedText,
        tabBarStyle: {
          height: 65 + insets.bottom,
          paddingTop: 6,
          paddingBottom: 8 + insets.bottom,
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('nav.home'),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={size}
              color={focused ? colors.accent : colors.mutedText}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="history"
        options={{
          title: t('nav.history'),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'time' : 'time-outline'}
              size={size}
              color={focused ? colors.accent : colors.mutedText}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="alarms"
        options={{
          title: t('nav.alarms'),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'alarm' : 'alarm-outline'}
              size={size}
              color={focused ? colors.accent : colors.mutedText}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: t('nav.settings'),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'settings' : 'settings-outline'}
              size={size}
              color={focused ? colors.accent : colors.mutedText}
            />
          ),
        }}
      />
    </Tabs>
  );
}
