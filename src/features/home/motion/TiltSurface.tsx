import type { PropsWithChildren } from 'react';
import Animated from 'react-native-reanimated';

import { useCardTilt } from '@/features/home/motion/use-card-tilt';

export function TiltSurface({ children }: PropsWithChildren) {
  const tilt = useCardTilt();

  return (
    <Animated.View
      onLayout={tilt.onLayout}
      onPointerLeave={tilt.onPointerLeave}
      onPointerMove={tilt.onPointerMove}
      onTouchEnd={tilt.resetTilt}
      onTouchStart={tilt.onPressIn}
      style={tilt.animatedStyle}>
      {children}
    </Animated.View>
  );
}
