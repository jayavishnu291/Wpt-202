
import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { t } from '../../../t';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#6C63FF',
        tabBarInactiveTintColor: '#888888',
        tabBarStyle: {
          height: 65,
          paddingTop: 6,
          paddingBottom: 8,
          backgroundColor: '#FFFFFF',
          borderTopColor: '#EEEEEE',
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
             color={focused ? '#6C63FF' : '#888888'}
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
             color={focused ? '#6C63FF' : '#888888'}
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
             color={focused ? '#6C63FF' : '#888888'}
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
             color={focused ? '#6C63FF' : '#888888'}
            />
          ),
        }}
      />
    </Tabs>
  );
}
