/* eslint-disable react-hooks/immutability -- Reanimated gesture worklets mutate shared values on the UI thread. */

import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import type { BottomTabBarProps } from 'expo-router/build/react-navigation/bottom-tabs';
import type { ComponentType } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
    Platform,
    Pressable,
    useWindowDimensions,
    View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import type { SvgProps } from 'react-native-svg';
import Animated, {
    ReduceMotion,
    interpolate,
    runOnJS,
    useAnimatedReaction,
    useAnimatedStyle,
    useDerivedValue,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeIcon from '@/../assets/images/home.svg';
import PointsIcon from '@/../assets/images/points.svg';
import ProfileIcon from '@/../assets/images/profile.svg';
import SessionsIcon from '@/../assets/images/sessions.svg';

const TAB_BAR_BASE_WIDTH = 335;
const TAB_BAR_HEIGHT = 60;
const TAB_BAR_RADIUS = 50;

const TAB_BAR_SIDE_MARGIN = 22;
const TAB_BAR_MAX_WIDTH = 380;

const TAB_BAR_HORIZONTAL_PADDING = 5;

const MOVER_WIDTH = 90;
const MOVER_HEIGHT = 50;
const MOVER_TOP = (TAB_BAR_HEIGHT - MOVER_HEIGHT) / 2;

const TAB_COLOR = '#F5F3EF';
const ACTIVE_TAB_COLOR = '#D9A441';

const SPRING = {
    damping: 22,
    mass: 0.75,
    overshootClamping: true,
    reduceMotion: ReduceMotion.System,
    stiffness: 210,
} as const;

type Props = BottomTabBarProps;

const tabs: Record<
    string,
    {
        Icon: ComponentType<SvgProps>;
        label: string;
    }
> = {
    home: {
        Icon: HomeIcon,
        label: 'Acasă',
    },
    sessions: {
        Icon: SessionsIcon,
        label: 'Sesiuni',
    },
    points: {
        Icon: PointsIcon,
        label: 'Puncte',
    },
    profile: {
        Icon: ProfileIcon,
        label: 'Profil',
    },
};

type TabItemProps = {
    Icon: ComponentType<SvgProps>;
    label: string;
    index: number;
    tabCenterX: number;
    moverCenterX: SharedValue<number>;
    previewIndex: SharedValue<number>;
    focused: boolean;
    previewed: boolean;
    accessibilityLabel: string;
    onPress: () => void;
    onLongPress: () => void;
};

function TabItem({
                     Icon,
                     label,
                     index,
                     tabCenterX,
                     moverCenterX,
                     previewIndex,
                     focused,
                     previewed,
                     accessibilityLabel,
                     onPress,
                     onLongPress,
                 }: TabItemProps) {
    const pressed = useSharedValue(0);

    const labelOpacity = useSharedValue(
        previewIndex.value === index ? 1 : 0,
    );

    useAnimatedReaction(
        () => previewIndex.value === index,
        (visible) => {
            labelOpacity.value = withTiming(
                visible ? 1 : 0,
                {
                    duration: 140,
                    reduceMotion: ReduceMotion.System,
                },
            );
        },
    );

    const iconStyle = useAnimatedStyle(() => {
        const distance = Math.abs(
            moverCenterX.value - tabCenterX,
        );

        const scale = interpolate(
            distance,
            [0, 45, 95],
            [1.14, 1.06, 1],
            'clamp',
        );

        const translateY = interpolate(
            distance,
            [0, 45, 95],
            [-3.5, -1.5, 0],
            'clamp',
        );

        const opacity = interpolate(
            distance,
            [0, 70, 120],
            [1, 0.92, 0.82],
            'clamp',
        );

        return {
            opacity,
            transform: [
                { translateY },
                {
                    scale:
                        scale *
                        (1 - pressed.value * 0.04),
                },
            ],
        };
    });

    const labelStyle = useAnimatedStyle(() => {
        const opacity = labelOpacity.value;

        return {
            opacity,
            transform: [
                {
                    translateY: interpolate(
                        opacity,
                        [0, 1],
                        [2, 0],
                    ),
                },
            ],
        };
    });

    return (
        <Pressable
            accessibilityLabel={accessibilityLabel}
            accessibilityRole="tab"
            accessibilityState={{
                selected: focused,
            }}
            className="relative z-10 h-full flex-1 items-center justify-center"
            onLongPress={onLongPress}
            onPress={onPress}
            onPressIn={() => {
                pressed.value = withTiming(
                    1,
                    {
                        duration: 70,
                        reduceMotion:
                        ReduceMotion.System,
                    },
                );
            }}
            onPressOut={() => {
                pressed.value = withSpring(
                    0,
                    SPRING,
                );
            }}
        >
            <Animated.View
                className="items-center justify-center"
                style={iconStyle}
            >
                <Icon
                    color={
                        previewed
                            ? ACTIVE_TAB_COLOR
                            : TAB_COLOR
                    }
                    height={20}
                    width={20}
                />
            </Animated.View>

            <Animated.Text
                pointerEvents="none"
                style={[
                    {
                        position: 'absolute',
                        bottom: 8,

                        color: previewed
                            ? ACTIVE_TAB_COLOR
                            : TAB_COLOR,

                        fontFamily:
                            'Inter_500Medium',

                        fontSize: 10,
                        lineHeight: 12,
                    },
                    labelStyle,
                ]}
            >
                {label}
            </Animated.Text>
        </Pressable>
    );
}

export function AnimatedTabBar({
                                   descriptors,
                                   navigation,
                                   state,
                               }: Props) {
    const insets = useSafeAreaInsets();
    const { width: screenWidth } =
        useWindowDimensions();

    const tabBarWidth = Math.min(
        TAB_BAR_MAX_WIDTH,
        Math.max(
            TAB_BAR_BASE_WIDTH,
            screenWidth -
            TAB_BAR_SIDE_MARGIN * 2,
        ),
    );

    const [
        measuredWidth,
        setMeasuredWidth,
    ] = useState(tabBarWidth);

    const moverPositioned =
        useRef(false);

    const visibleRoutes = useMemo(
        () =>
            state.routes.filter(
                (route) =>
                    Boolean(
                        tabs[route.name],
                    ),
            ),
        [state.routes],
    );

    const activeRoute =
        state.routes[state.index];

    const activeIndex =
        visibleRoutes.findIndex(
            (route) =>
                route.key ===
                activeRoute?.key,
        );

    const innerWidth =
        measuredWidth -
        TAB_BAR_HORIZONTAL_PADDING * 2;

    const tabWidth =
        innerWidth /
        visibleRoutes.length;

    const moverWidth =
        MOVER_WIDTH;

    const moverX =
        useSharedValue(
            TAB_BAR_HORIZONTAL_PADDING,
        );

    const dragStartX =
        useSharedValue(0);

    const dragScaleX =
        useSharedValue(1);

    const dragScaleY =
        useSharedValue(1);

    const isDragging =
        useSharedValue(false);

    const previewIndex =
        useSharedValue(
            activeIndex >= 0
                ? activeIndex
                : 0,
        );

    const [
        previewedIndex,
        setPreviewedIndex,
    ] = useState(
        activeIndex >= 0
            ? activeIndex
            : 0,
    );

    useAnimatedReaction(
        () => previewIndex.value,
        (current, previous) => {
            if (
                current !== previous
            ) {
                runOnJS(
                    setPreviewedIndex,
                )(current);
            }
        },
    );

    const moverCenterX =
        useDerivedValue(
            () =>
                moverX.value +
                moverWidth / 2,
        );

    useEffect(() => {
        moverPositioned.current =
            false;
    }, [tabBarWidth]);

    useEffect(() => {
        if (
            activeIndex < 0 ||
            measuredWidth <= 0
        ) {
            return;
        }

        const targetX =
            TAB_BAR_HORIZONTAL_PADDING +
            activeIndex *
            tabWidth +
            tabWidth / 2 -
            moverWidth / 2;

        if (
            moverPositioned.current
        ) {
            moverX.value =
                withSpring(
                    targetX,
                    SPRING,
                );
        } else {
            moverX.value =
                targetX;

            moverPositioned.current =
                true;
        }

        if (
            !isDragging.value
        ) {
            previewIndex.value =
                activeIndex;
        }
    }, [
        activeIndex,
        measuredWidth,
        moverWidth,
        tabWidth,
        moverX,
        previewIndex,
        isDragging,
    ]);

    const navigateToIndex = (
        index: number,
    ) => {
        const route =
            visibleRoutes[index];

        if (!route) return;

        const event =
            navigation.emit({
                canPreventDefault: true,
                target: route.key,
                type: 'tabPress',
            });

        if (
            !event.defaultPrevented &&
            activeRoute?.key !==
            route.key
        ) {
            navigation.navigate(
                route.name,
                route.params,
            );
        }

        if (
            Platform.OS !== 'web'
        ) {
            Haptics.selectionAsync()
                .catch(
                    () => undefined,
                );
        }
    };

    const moverStyle =
        useAnimatedStyle(
            () => ({
                transform: [
                    {
                        translateX:
                        moverX.value,
                    },
                    {
                        scaleX:
                        dragScaleX.value,
                    },
                    {
                        scaleY:
                        dragScaleY.value,
                    },
                ],
            }),
        );

    const panGesture =
        Gesture.Pan()
            .minDistance(4)

            .onBegin(() => {
                isDragging.value =
                    true;

                dragStartX.value =
                    moverX.value;

                dragScaleX.value =
                    withSpring(
                        1.06,
                        SPRING,
                    );

                dragScaleY.value =
                    withSpring(
                        0.97,
                        SPRING,
                    );
            })

            .onUpdate((event) => {
                const minX =
                    TAB_BAR_HORIZONTAL_PADDING;

                const maxX =
                    measuredWidth -
                    TAB_BAR_HORIZONTAL_PADDING -
                    moverWidth;

                const nextX =
                    dragStartX.value +
                    event.translationX;

                moverX.value =
                    Math.min(
                        maxX,
                        Math.max(
                            minX,
                            nextX,
                        ),
                    );

                const centerX =
                    moverX.value +
                    moverWidth / 2;

                const relativeCenter =
                    centerX -
                    TAB_BAR_HORIZONTAL_PADDING;

                const nearestIndex =
                    Math.max(
                        0,
                        Math.min(
                            visibleRoutes.length -
                            1,

                            Math.round(
                                relativeCenter /
                                tabWidth -
                                0.5,
                            ),
                        ),
                    );

                previewIndex.value =
                    nearestIndex;
            })

            .onEnd(() => {
                const centerX =
                    moverX.value +
                    moverWidth / 2;

                const relativeCenter =
                    centerX -
                    TAB_BAR_HORIZONTAL_PADDING;

                const nearestIndex =
                    Math.max(
                        0,
                        Math.min(
                            visibleRoutes.length -
                            1,

                            Math.round(
                                relativeCenter /
                                tabWidth -
                                0.5,
                            ),
                        ),
                    );

                const targetX =
                    TAB_BAR_HORIZONTAL_PADDING +
                    nearestIndex *
                    tabWidth +
                    tabWidth / 2 -
                    moverWidth / 2;

                previewIndex.value =
                    nearestIndex;

                moverX.value =
                    withSpring(
                        targetX,
                        SPRING,
                        (finished) => {
                            if (
                                finished
                            ) {
                                runOnJS(
                                    navigateToIndex,
                                )(
                                    nearestIndex,
                                );
                            }
                        },
                    );
            })

            .onFinalize(() => {
                isDragging.value =
                    false;

                dragScaleX.value =
                    withSpring(
                        1,
                        SPRING,
                    );

                dragScaleY.value =
                    withSpring(
                        1,
                        SPRING,
                    );
            });

    if (activeIndex < 0) {
        return null;
    }

    return (
        <View
            pointerEvents="box-none"
            style={{
                position: 'absolute',

                left: 0,
                right: 0,

                bottom:
                    Math.max(
                        insets.bottom,
                        39,
                    ),

                alignItems:
                    'center',

                zIndex: 100,
                elevation: 100,

                backgroundColor:
                    'transparent',
            }}
        >
            <View
                onLayout={(event) => {
                    setMeasuredWidth(
                        event.nativeEvent
                            .layout.width,
                    );
                }}
                style={{
                    position: 'relative',

                    width:
                    tabBarWidth,

                    height:
                    TAB_BAR_HEIGHT,

                    borderRadius:
                    TAB_BAR_RADIUS,

                    backgroundColor:
                        'transparent',

                    shadowColor:
                        '#E29E3E',

                    shadowOffset: {
                        width: 0,
                        height: 2,
                    },

                    shadowOpacity:
                        0.12,

                    shadowRadius:
                        12,

                    elevation: 4,
                }}
            >
                <View
                    pointerEvents="none"
                    style={{
                        position:
                            'absolute',

                        inset: 0,

                        borderRadius:
                        TAB_BAR_RADIUS,

                        overflow:
                            'hidden',
                    }}
                >
                    <BlurView
                        intensity={20}
                        tint="dark"
                        style={{
                            position:
                                'absolute',
                            inset: 0,
                        }}
                    />

                    <View
                        style={{
                            position:
                                'absolute',

                            inset: 0,

                            backgroundColor:
                                'rgba(255,255,255,0.055)',
                        }}
                    />
                </View>

                <View
                    pointerEvents="none"
                    style={{
                        position:
                            'absolute',

                        inset: 0,

                        borderRadius:
                        TAB_BAR_RADIUS,

                        borderWidth: 1,

                        borderColor:
                            'rgba(226,158,62,0.28)',
                    }}
                />

                <GestureDetector
                    gesture={panGesture}
                >
                    <View
                        style={{
                            position:
                                'relative',

                            flex: 1,

                            flexDirection:
                                'row',

                            paddingHorizontal:
                            TAB_BAR_HORIZONTAL_PADDING,
                        }}
                    >
                        <Animated.View
                            pointerEvents="none"
                            style={[
                                {
                                    position:
                                        'absolute',

                                    left: 0,

                                    top: MOVER_TOP,

                                    width:
                                    moverWidth,

                                    height:
                                    MOVER_HEIGHT,

                                    zIndex: 1,

                                    shadowColor:
                                        '#D9A441',

                                    shadowOffset: {
                                        width: 0,
                                        height: 0,
                                    },

                                    shadowOpacity: 0.5,
                                    shadowRadius: 9,
                                    elevation: 8,
                                },

                                moverStyle,
                            ]}
                        >
                            <View
                                style={{
                                    flex: 1,
                                    borderRadius: 25,
                                    overflow: 'hidden',
                                    backgroundColor: 'rgba(11,11,12,0.42)',
                                }}
                            >
                                <BlurView
                                    intensity={20}
                                    tint="dark"
                                    style={{ position: 'absolute', inset: 0 }}
                                />
                                <LinearGradient
                                    colors={[
                                        'rgba(217,164,65,0.13)',
                                        'rgba(11,11,12,0.24)',
                                        'rgba(11,11,12,0.50)',
                                    ]}
                                    start={{ x: 0.5, y: 0 }}
                                    end={{ x: 0.5, y: 1 }}
                                    style={{ position: 'absolute', inset: 0 }}
                                />
                                <View
                                    pointerEvents="none"
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        borderRadius: 25,
                                        borderWidth: 1,
                                        borderColor: 'rgba(217,164,65,0.8)',
                                    }}
                                />
                            </View>
                        </Animated.View>

                        {visibleRoutes.map(
                            (
                                route,
                                index,
                            ) => {
                                const tab =
                                    tabs[
                                        route
                                            .name
                                        ];

                                if (!tab) {
                                    return null;
                                }

                                const focused =
                                    activeRoute?.key ===
                                    route.key;

                                const tabCenterX =
                                    TAB_BAR_HORIZONTAL_PADDING +
                                    index *
                                    tabWidth +
                                    tabWidth /
                                    2;

                                const onPress =
                                    () => {
                                        const targetX =
                                            TAB_BAR_HORIZONTAL_PADDING +
                                            index *
                                            tabWidth +
                                            tabWidth /
                                            2 -
                                            moverWidth /
                                            2;

                                        previewIndex.value =
                                            index;

                                        moverX.value =
                                            withSpring(
                                                targetX,
                                                SPRING,
                                                (
                                                    finished,
                                                ) => {
                                                    if (
                                                        finished
                                                    ) {
                                                        runOnJS(
                                                            navigateToIndex,
                                                        )(
                                                            index,
                                                        );
                                                    }
                                                },
                                            );
                                    };

                                return (
                                    <TabItem
                                        key={
                                            route.key
                                        }
                                        Icon={
                                            tab.Icon
                                        }
                                        label={
                                            tab.label
                                        }
                                        index={
                                            index
                                        }
                                        tabCenterX={
                                            tabCenterX
                                        }
                                        moverCenterX={
                                            moverCenterX
                                        }
                                        previewIndex={
                                            previewIndex
                                        }
                                        focused={
                                            focused
                                        }
                                        previewed={
                                            previewedIndex ===
                                            index
                                        }
                                        accessibilityLabel={
                                            descriptors[
                                                route
                                                    .key
                                                ]
                                                .options
                                                .tabBarAccessibilityLabel ??
                                            tab.label
                                        }
                                        onLongPress={() =>
                                            navigation.emit(
                                                {
                                                    target:
                                                    route.key,
                                                    type: 'tabLongPress',
                                                },
                                            )
                                        }
                                        onPress={
                                            onPress
                                        }
                                    />
                                );
                            },
                        )}
                    </View>
                </GestureDetector>
            </View>
        </View>
    );
}
