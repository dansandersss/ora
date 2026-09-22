import { BlurView } from 'expo-blur';
import { createContext, useContext, useRef, type PropsWithChildren, type RefObject } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

const GlassBlurTargetContext = createContext<RefObject<View | null> | null>(null);

export function GlassBlurProvider({ children }: PropsWithChildren) {
  const targetRef = useRef<View | null>(null);
  return <GlassBlurTargetContext.Provider value={targetRef}>{children}</GlassBlurTargetContext.Provider>;
}

export function useGlassBlurTarget() {
  return useContext(GlassBlurTargetContext);
}

type GlassSurfaceProps = PropsWithChildren<{
  className?: string;
  radius?: number;
  intensity?: number;
  fillColor?: string;
  borderColor?: string;
  shadowStyle?: StyleProp<ViewStyle>;
}>;

export function GlassSurface({
  children,
  className = '',
  radius = 26,
  intensity = 18,
  fillColor = 'rgba(255,255,255,0.055)',
  borderColor = 'rgba(226,158,62,0.30)',
  shadowStyle,
}: GlassSurfaceProps) {
  const target = useGlassBlurTarget();

  return (
    <View className={className} style={shadowStyle}>
      <View style={{ borderRadius: radius, overflow: 'hidden' }}>
        <BlurView
          blurMethod={target ? 'dimezisBlurView' : undefined}
          blurTarget={target ?? undefined}
          intensity={intensity}
          tint="dark"
          style={[StyleSheet.absoluteFill, styles.decorative]}
        />
        <View style={[StyleSheet.absoluteFill, styles.decorative, { backgroundColor: fillColor }]} />
        <View style={[StyleSheet.absoluteFill, styles.decorative, { borderRadius: radius, borderWidth: 1, borderColor }]} />
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({ decorative: { pointerEvents: 'none' } });
