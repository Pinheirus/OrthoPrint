import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import ARScanner from '@/components/scanner/ARScanner';

export default function CameraCaptureScreen() {
  const params = useLocalSearchParams<{
    id?: string;
    patientName?: string;
    region?: string;
    side?: string;
  }>();

  return (
    <View style={s.root}>
      <ARScanner
        scanId={params.id}
        patientName={params.patientName}
        region={params.region}
        side={params.side}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
});
