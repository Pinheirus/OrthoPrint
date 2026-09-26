import React from 'react';
import { StyleSheet, View } from 'react-native';
import ARScanner from '@/components/scanner/ARScanner';

export default function CameraCaptureScreen() {
  return (
    <View style={s.root}>
      <ARScanner />
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
});
