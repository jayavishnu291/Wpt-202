// Deliberately wrong. The scanner must flag every marked line. Never imported by the app.
import React from 'react';
import { Alert, Text, TextInput, Pressable } from 'react-native';

export default function BadScreen({ on }: { on: boolean }) {
  Alert.alert('Delete everything?');                       // 1 Alert text
  const row = { title: 'Settings' };                        // 2 text property
  return (
    <>
      <Text>Welcome back</Text>                             {/* 3 JSX text */}
      <Text>{on ? 'On' : 'Off'}</Text>                      {/* 4 text in braces */}
      <TextInput placeholder="Your name" />                 {/* 5 placeholder */}
      <Pressable accessibilityLabel={'Start focus'} />      {/* 6 label in braces */}
      <Text>{`Hello ${row.title}`}</Text>                   {/* 7 template text */}
      <Text style={{}}>{'WPT 202'}</Text>                   {/* 8 app name typed (also text in braces) */}
    </>
  );
}
