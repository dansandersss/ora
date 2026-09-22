import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { BlurTargetView } from 'expo-blur';
import { Image, View, useWindowDimensions } from 'react-native';
import Svg, {
    Circle,
    Defs,
    RadialGradient,
    Stop,
} from 'react-native-svg';
import Animated, {
    Easing,
    cancelAnimation,
    useReducedMotion,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

import AuraBig from '@/../assets/images/AuroraBig.svg';
import AuraTopRight from '@/../assets/images/AuroraTopRight.svg';

import Sp1 from '@/../assets/images/Sp1.svg';
import Sp2 from '@/../assets/images/Sp2.svg';
import Sp3 from '@/../assets/images/Sp3.svg';
import Sp4 from '@/../assets/images/Sp4.svg';
import Sp5 from '@/../assets/images/Sp5.svg';

import StreakA from '@/../assets/images/StreakA.svg';
import StreakB from '@/../assets/images/StreakB.svg';
import { useGlassBlurTarget } from '@/components/ui/GlassSurface';

type FloatingLayerProps = {
    children: ReactNode;
    duration: number;

    moveX?: number;
    moveY?: number;

    scaleFrom?: number;
    scaleTo?: number;

    rotateFrom?: number;
    rotateTo?: number;

    opacityFrom?: number;
    opacityTo?: number;

    style?: object;
};

function FloatingLayer({
                           children,
                           duration,

                           moveX = 0,
                           moveY = 0,

                           scaleFrom = 1,
                           scaleTo = 1,

                           rotateFrom = 0,
                           rotateTo = 0,

                           opacityFrom = 1,
                           opacityTo = 1,

                           style,
                       }: FloatingLayerProps) {
    const progress = useSharedValue(0);
    const reducedMotion = useReducedMotion();

    useEffect(() => {
        if (reducedMotion) return;
        progress.value = withRepeat(
            withSequence(
                withTiming(1, {
                    duration,
                    easing: Easing.inOut(Easing.sin),
                }),
                withTiming(0, {
                    duration,
                    easing: Easing.inOut(Easing.sin),
                }),
            ),
            -1,
            false,
        );
        return () => cancelAnimation(progress);
    }, [duration, progress, reducedMotion]);

    const animatedStyle = useAnimatedStyle(() => {
        const p = progress.value;

        return {
            opacity:
                opacityFrom +
                (opacityTo - opacityFrom) * p,

            transform: [
                {
                    translateX:
                        -moveX / 2 +
                        p * moveX,
                },
                {
                    translateY:
                        -moveY / 2 +
                        p * moveY,
                },
                {
                    scale:
                        scaleFrom +
                        (scaleTo - scaleFrom) * p,
                },
                {
                    rotate: `${
                        rotateFrom +
                        (rotateTo - rotateFrom) * p
                    }deg`,
                },
            ],
        };
    });

    return (
        <Animated.View
            style={[
                { pointerEvents: 'none' },
                {
                    position: 'absolute',
                },
                style,
                animatedStyle,
            ]}
        >
            {children}
        </Animated.View>
    );
}

function GradientBlob({
                          id,
                          color,
                      }: {
    id: string;
    color: string;
}) {
    return (
        <Svg
            width="100%"
            height="100%"
            viewBox="0 0 100 100"
        >
            <Defs>
                <RadialGradient
                    id={id}
                    cx="50%"
                    cy="50%"
                    rx="50%"
                    ry="50%"
                >
                    <Stop
                        offset="0%"
                        stopColor={color}
                        stopOpacity={0.72}
                    />

                    <Stop
                        offset="28%"
                        stopColor={color}
                        stopOpacity={0.38}
                    />

                    <Stop
                        offset="58%"
                        stopColor={color}
                        stopOpacity={0.14}
                    />

                    <Stop
                        offset="82%"
                        stopColor={color}
                        stopOpacity={0.035}
                    />

                    <Stop
                        offset="100%"
                        stopColor={color}
                        stopOpacity={0}
                    />
                </RadialGradient>
            </Defs>

            <Circle
                cx="50"
                cy="50"
                r="50"
                fill={`url(#${id})`}
            />
        </Svg>
    );
}

function Firefly({
                     children,
                     glowId,
                 }: {
    children: ReactNode;
    glowId: string;
}) {
    return (
        <View
            style={{
                width: '100%',
                height: '100%',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            {/* very large soft outer glow */}
            <View
                pointerEvents="none"
                style={{
                    position: 'absolute',
                    width: '320%',
                    height: '320%',
                    opacity: 0.55,
                }}
            >
                <GradientBlob
                    id={`${glowId}-outer`}
                    color="#E29E3E"
                />
            </View>

            {/* denser inner glow */}
            <View
                pointerEvents="none"
                style={{
                    position: 'absolute',
                    width: '190%',
                    height: '190%',
                    opacity: 0.7,
                }}
            >
                <GradientBlob
                    id={`${glowId}-inner`}
                    color="#F0AD4D"
                />
            </View>

            {/* intentionally softened original Figma particle */}
            <View
                style={{
                    width: '48%',
                    height: '48%',
                    opacity: 0.38,
                }}
            >
                {children}
            </View>
        </View>
    );
}

export function PremiumAnimatedBackground() {
    const { width, height } = useWindowDimensions();
    const target = useGlassBlurTarget();

    return (
        <BlurTargetView
            ref={target ?? undefined}
            pointerEvents="none"
            style={{
                position: 'absolute',
                inset: 0,
                overflow: 'hidden',
                backgroundColor: '#1E1E21',
            }}
        >
            {/* BOTTOM WARM BLOOM */}
            <FloatingLayer
                duration={18000}
                moveX={110}
                moveY={70}
                scaleFrom={0.96}
                scaleTo={1.14}
                rotateFrom={-2}
                rotateTo={2}
                opacityFrom={0.14}
                opacityTo={0.30}
                style={{
                    width: width * 1.85,
                    height: width * 1.85,
                    left: -width * 0.42,
                    bottom: -width * 0.92,
                }}
            >
                <GradientBlob
                    id="bottomWarmGlow"
                    color="#E29E3E"
                />
            </FloatingLayer>

            {/* MID AMBER GLOW */}
            <FloatingLayer
                duration={14500}
                moveX={90}
                moveY={54}
                scaleFrom={0.94}
                scaleTo={1.11}
                rotateFrom={1}
                rotateTo={-2}
                opacityFrom={0.08}
                opacityTo={0.20}
                style={{
                    width: width * 1.25,
                    height: width * 1.25,
                    left: -width * 0.30,
                    top: height * 0.30,
                }}
            >
                <GradientBlob
                    id="middleAmberGlow"
                    color="#D78B27"
                />
            </FloatingLayer>

            {/* TOP RIGHT WARM GLOW */}
            <FloatingLayer
                duration={16500}
                moveX={60}
                moveY={46}
                scaleFrom={0.98}
                scaleTo={1.12}
                rotateFrom={-1}
                rotateTo={2}
                opacityFrom={0.06}
                opacityTo={0.16}
                style={{
                    width: width * 0.9,
                    height: width * 0.9,
                    right: -width * 0.34,
                    top: -width * 0.18,
                }}
            >
                <GradientBlob
                    id="topRightWarmGlow"
                    color="#F0AD4D"
                />
            </FloatingLayer>

            {/* AURA TOP RIGHT */}
            <FloatingLayer
                duration={17000}
                moveX={48}
                moveY={38}
                scaleFrom={0.96}
                scaleTo={1.09}
                rotateFrom={-2.5}
                rotateTo={2}
                opacityFrom={0.38}
                opacityTo={0.68}
                style={{
                    width: width * 0.62,
                    height: width * 0.62,
                    right: -width * 0.22,
                    top: -width * 0.18,
                }}
            >
                <AuraTopRight
                    width="100%"
                    height="100%"
                />
            </FloatingLayer>

            {/* BIG CENTRAL AURA */}
            <FloatingLayer
                duration={22000}
                moveX={92}
                moveY={62}
                scaleFrom={0.95}
                scaleTo={1.08}
                rotateFrom={-2}
                rotateTo={2}
                opacityFrom={0.38}
                opacityTo={0.68}
                style={{
                    width: width * 1.45,
                    height: width * 1.45,
                    left: -width * 0.42,
                    top: height * 0.18,
                }}
            >
                <AuraBig
                    width="100%"
                    height="100%"
                />
            </FloatingLayer>

            {/* BOTTOM AURA — still disabled */}
            {/*
      <FloatingLayer
        duration={19000}
        moveX={84}
        moveY={54}
        scaleFrom={0.96}
        scaleTo={1.1}
        rotateFrom={1.5}
        rotateTo={-1.5}
        opacityFrom={0.22}
        opacityTo={0.48}
        style={{
          width: width * 1.15,
          height: width * 1.15,
          left: width * 0.08,
          bottom: -width * 0.50,
        }}
      >
        <AuraBottom
          width="100%"
          height="100%"
        />
      </FloatingLayer>
      */}

            {/* STREAK A */}
            <FloatingLayer
                duration={16500}
                moveX={140}
                moveY={46}
                scaleFrom={0.97}
                scaleTo={1.05}
                rotateFrom={-3}
                rotateTo={2.5}
                opacityFrom={0.22}
                opacityTo={0.50}
                style={{
                    width: width * 0.86,
                    height: 80,
                    left: -width * 0.16,
                    top: height * 0.30,
                }}
            >
                <StreakA
                    width="100%"
                    height="100%"
                />
            </FloatingLayer>

            {/* STREAK B */}
            <FloatingLayer
                duration={20000}
                moveX={150}
                moveY={50}
                scaleFrom={0.98}
                scaleTo={1.06}
                rotateFrom={2.5}
                rotateTo={-2.5}
                opacityFrom={0.18}
                opacityTo={0.42}
                style={{
                    width: width * 0.98,
                    height: 80,
                    right: -width * 0.25,
                    top: height * 0.48,
                }}
            >
                <StreakB
                    width="100%"
                    height="100%"
                />
            </FloatingLayer>

            {/* FIREFLY 1 */}
            <FloatingLayer
                duration={8500}
                moveX={34}
                moveY={40}
                scaleFrom={0.78}
                scaleTo={1.28}
                opacityFrom={0.14}
                opacityTo={0.62}
                style={{
                    width: 34,
                    height: 34,
                    left: width * 0.12,
                    top: height * 0.15,
                }}
            >
                <Firefly glowId="entryFirefly1">
                    <Sp1 width="100%" height="100%" />
                </Firefly>
            </FloatingLayer>

            {/* FIREFLY 2 */}
            <FloatingLayer
                duration={10500}
                moveX={44}
                moveY={32}
                scaleFrom={0.8}
                scaleTo={1.22}
                opacityFrom={0.14}
                opacityTo={0.62}
                style={{
                    width: 30,
                    height: 30,
                    right: width * 0.17,
                    top: height * 0.27,
                }}
            >
                <Firefly glowId="entryFirefly2">
                    <Sp2 width="100%" height="100%" />
                </Firefly>
            </FloatingLayer>

            {/* FIREFLY 3 */}
            <FloatingLayer
                duration={7200}
                moveX={32}
                moveY={46}
                scaleFrom={0.72}
                scaleTo={1.34}
                opacityFrom={0.14}
                opacityTo={0.62}
                style={{
                    width: 38,
                    height: 38,
                    left: width * 0.23,
                    top: height * 0.43,
                }}
            >
                <Firefly glowId="entryFirefly3">
                    <Sp3 width="100%" height="100%" />
                </Firefly>
            </FloatingLayer>

            {/* FIREFLY 4 */}
            <FloatingLayer
                duration={11500}
                moveX={48}
                moveY={38}
                scaleFrom={0.82}
                scaleTo={1.2}
                opacityFrom={0.16}
                opacityTo={0.62}
                style={{
                    width: 42,
                    height: 42,
                    right: width * 0.12,
                    top: height * 0.58,
                }}
            >
                <Firefly glowId="entryFirefly4">
                    <Sp4 width="100%" height="100%" />
                </Firefly>
            </FloatingLayer>

            {/* FIREFLY 5 */}
            <FloatingLayer
                duration={9000}
                moveX={38}
                moveY={44}
                scaleFrom={0.76}
                scaleTo={1.3}
                opacityFrom={0.14}
                opacityTo={0.62}
                style={{
                    width: 32,
                    height: 32,
                    left: width * 0.42,
                    top: height * 0.69,
                }}
            >
                <Firefly glowId="entryFirefly5">
                    <Sp5 width="100%" height="100%" />
                </Firefly>
            </FloatingLayer>

            {/* FINAL CINEMATIC DARK VEIL */}
            <View
                pointerEvents="none"
                style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.16)',
                }}
            />
        </BlurTargetView>
    );
}

/** Quiet entry-flow atmosphere, using the same ORA assets as the app background. */
/** Premium animated background for Splash / Onboarding / Login. */
export function EntryAmbientBackground() {
    const { width, height } = useWindowDimensions();
    const target = useGlassBlurTarget();

    return (
        <BlurTargetView
            ref={target ?? undefined}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={{
                position: 'absolute',
                inset: 0,
                overflow: 'hidden',
                backgroundColor: '#080808',
                pointerEvents: 'none',
            }}
        >
            {/* -----------------------------------------------------
                BASE WARM ATMOSPHERE
               ----------------------------------------------------- */}

            <FloatingLayer
                duration={18000}
                moveX={70}
                moveY={46}
                scaleFrom={0.96}
                scaleTo={1.12}
                rotateFrom={-2}
                rotateTo={2}
                opacityFrom={0.22}
                opacityTo={0.42}
                style={{
                    width: width * 1.55,
                    height: width * 1.55,
                    left: -width * 0.48,
                    top: height * 0.20,
                }}
            >
                <GradientBlob
                    id="entryCentralGlow"
                    color="#D58C2D"
                />
            </FloatingLayer>

            {/* -----------------------------------------------------
                TOP RIGHT GLOW
               ----------------------------------------------------- */}

            <FloatingLayer
                duration={21000}
                moveX={54}
                moveY={42}
                scaleFrom={0.98}
                scaleTo={1.14}
                rotateFrom={-1}
                rotateTo={2}
                opacityFrom={0.18}
                opacityTo={0.34}
                style={{
                    width: width * 1.05,
                    height: width * 1.05,
                    right: -width * 0.38,
                    top: -width * 0.28,
                }}
            >
                <GradientBlob
                    id="entryTopRightGlow"
                    color="#E29E3E"
                />
            </FloatingLayer>

            {/* -----------------------------------------------------
                LARGE BOTTOM GOLD BLOOM
               ----------------------------------------------------- */}

            <FloatingLayer
                duration={16000}
                moveX={90}
                moveY={62}
                scaleFrom={0.94}
                scaleTo={1.16}
                rotateFrom={1}
                rotateTo={-2}
                opacityFrom={0.20}
                opacityTo={0.40}
                style={{
                    width: width * 1.75,
                    height: width * 1.75,
                    left: -width * 0.34,
                    bottom: -width * 0.92,
                }}
            >
                <GradientBlob
                    id="entryBottomGlow"
                    color="#F0A33B"
                />
            </FloatingLayer>

            {/* -----------------------------------------------------
                FIGMA AURA — CENTER
               ----------------------------------------------------- */}

            <FloatingLayer
                duration={23000}
                moveX={76}
                moveY={54}
                scaleFrom={0.96}
                scaleTo={1.08}
                rotateFrom={-2}
                rotateTo={2}
                opacityFrom={0.28}
                opacityTo={0.54}
                style={{
                    width: width * 1.45,
                    height: width * 1.45,
                    left: -width * 0.34,
                    top: height * 0.18,
                }}
            >
                <AuraBig
                    width="100%"
                    height="100%"
                />
            </FloatingLayer>

            {/* -----------------------------------------------------
                FIGMA AURA — TOP RIGHT
               ----------------------------------------------------- */}

            <FloatingLayer
                duration={19000}
                moveX={48}
                moveY={36}
                scaleFrom={0.96}
                scaleTo={1.10}
                rotateFrom={-2}
                rotateTo={2}
                opacityFrom={0.26}
                opacityTo={0.50}
                style={{
                    width: width * 0.78,
                    height: width * 0.78,
                    right: -width * 0.28,
                    top: -width * 0.12,
                }}
            >
                <AuraTopRight
                    width="100%"
                    height="100%"
                />
            </FloatingLayer>

            {/* -----------------------------------------------------
                MOVING STREAK A
               ----------------------------------------------------- */}

            <FloatingLayer
                duration={14000}
                moveX={120}
                moveY={36}
                scaleFrom={0.98}
                scaleTo={1.05}
                rotateFrom={-3}
                rotateTo={2}
                opacityFrom={0.18}
                opacityTo={0.38}
                style={{
                    width: width * 1.05,
                    height: 90,
                    left: -width * 0.22,
                    top: height * 0.40,
                }}
            >
                <StreakA
                    width="100%"
                    height="100%"
                />
            </FloatingLayer>

            {/* -----------------------------------------------------
                MOVING STREAK B
               ----------------------------------------------------- */}

            <FloatingLayer
                duration={17500}
                moveX={-130}
                moveY={42}
                scaleFrom={0.98}
                scaleTo={1.05}
                rotateFrom={2}
                rotateTo={-2}
                opacityFrom={0.14}
                opacityTo={0.32}
                style={{
                    width: width * 1.15,
                    height: 90,
                    right: -width * 0.30,
                    top: height * 0.58,
                }}
            >
                <StreakB
                    width="100%"
                    height="100%"
                />
            </FloatingLayer>

            {/* -----------------------------------------------------
                FIREFLIES
               ----------------------------------------------------- */}

            <FloatingLayer
                duration={7000}
                moveX={18}
                moveY={26}
                scaleFrom={0.72}
                scaleTo={1.35}
                opacityFrom={0.18}
                opacityTo={0.68}
                style={{
                    width: 22,
                    height: 22,
                    left: width * 0.16,
                    top: height * 0.27,
                }}
            >
                <Firefly glowId="entry-flow-firefly-1">
                    <Sp1 width="100%" height="100%" />
                </Firefly>
            </FloatingLayer>

            <FloatingLayer
                duration={9000}
                moveX={24}
                moveY={34}
                scaleFrom={0.76}
                scaleTo={1.28}
                opacityFrom={0.16}
                opacityTo={0.62}
                style={{
                    width: 27,
                    height: 27,
                    right: width * 0.12,
                    top: height * 0.32,
                }}
            >
                <Firefly glowId="entry-flow-firefly-2">
                    <Sp2 width="100%" height="100%" />
                </Firefly>
            </FloatingLayer>

            <FloatingLayer
                duration={7600}
                moveX={22}
                moveY={28}
                scaleFrom={0.75}
                scaleTo={1.32}
                opacityFrom={0.18}
                opacityTo={0.64}
                style={{
                    width: 20,
                    height: 20,
                    left: width * 0.48,
                    top: height * 0.18,
                }}
            >
                <Firefly glowId="entry-flow-firefly-3">
                    <Sp3 width="100%" height="100%" />
                </Firefly>
            </FloatingLayer>

            <FloatingLayer
                duration={10500}
                moveX={30}
                moveY={36}
                scaleFrom={0.78}
                scaleTo={1.25}
                opacityFrom={0.14}
                opacityTo={0.56}
                style={{
                    width: 20,
                    height: 20,
                    left: width * 0.28,
                    top: height * 0.70,
                }}
            >
                <Firefly glowId="entry-flow-firefly-4">
                    <Sp4 width="100%" height="100%" />
                </Firefly>
            </FloatingLayer>

            <FloatingLayer
                duration={8200}
                moveX={26}
                moveY={30}
                scaleFrom={0.74}
                scaleTo={1.30}
                opacityFrom={0.16}
                opacityTo={0.60}
                style={{
                    width: 18,
                    height: 18,
                    right: width * 0.25,
                    top: height * 0.77,
                }}
            >
                <Firefly glowId="entry-flow-firefly-5">
                    <Sp5 width="100%" height="100%" />
                </Firefly>
            </FloatingLayer>

            {/* -----------------------------------------------------
                VERY SUBTLE NOISE
               ----------------------------------------------------- */}

            <Image
                source={require('@/../assets/images/noise.png')}
                resizeMode="repeat"
                style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0.035,
                }}
            />

            {/* -----------------------------------------------------
                FINAL CINEMATIC VEIL

                Keeps gold glows premium instead of yellow/bright.
               ----------------------------------------------------- */}

            <View
                pointerEvents="none"
                style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.08)',
                }}
            />
        </BlurTargetView>
    );
}
