import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ViroARScene, ViroARSceneNavigator, ViroText } from '@reactvision/react-viro';

// ─── Scene component ─────────────────────────────────────────────────────────
// Must be defined outside the navigator to maintain a stable reference.
// ViroARSceneNavigator receives a component reference — never an inline element.
const HelloWorldSceneAR = () => {
  return (
    <ViroARScene>
      <ViroText
        text="Tekové Dev AR Active"
        scale={[0.5, 0.5, 0.5]}
        position={[0, 0, -1]}
        style={s.arText}
      />
    </ViroARScene>
  );
};

// ─── Main exported component ──────────────────────────────────────────────────
export default function ARScanner() {
  return (
    <View style={s.root}>
      <ViroARSceneNavigator
        autofocus={true}
        initialScene={{ scene: HelloWorldSceneAR }}
        style={s.navigator}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  navigator: {
    flex: 1,
  },
  arText: {
    fontFamily: 'Arial',
    fontSize: 28,
    color: '#FFFFFF',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
});
