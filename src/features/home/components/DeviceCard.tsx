import { BlurView } from 'expo-blur';
import { Image, Text, View, type ImageSourcePropType } from 'react-native';

import { PremiumPressable } from '@/components/ui/PremiumPressable';
import { useAppLayout } from '@/components/layout/AppScreen';
import { DeviceStatusBadge } from '@/features/home/components/DeviceStatusBadge';
import type { DeviceAvailability } from '@/features/home/types';

type DeviceCardProps = {
    device: DeviceAvailability;
    onPress: (device: DeviceAvailability) => void;
    image: ImageSourcePropType;
};

const CARD_RADIUS = 16;

export function DeviceCard({
                               device,
                               image,
                               onPress,
                           }: DeviceCardProps) {
    const { contentWidth } = useAppLayout();
    const responsiveProgress = Math.min(1, Math.max(0, (contentWidth - 375) / 55));
    const cardWidth = 140 + responsiveProgress * 20;
    const cardHeight = 180 + responsiveProgress * 20;
    const imageHeight = cardHeight * (100 / 180);

    return (
        <PremiumPressable
            accessibilityLabel={`${device.name}, ${device.status}`}
            onPress={() => onPress(device)}
        >
            <View
                style={{
                    width: cardWidth,
                    height: cardHeight,
                    borderRadius: CARD_RADIUS,

                    // Keep outer wrapper unclipped so shadow can render.
                    shadowColor: '#000000',
                    shadowOffset: {
                        width: 0,
                        height: 8,
                    },
                    shadowOpacity: 0.28,
                    shadowRadius: 16,

                    elevation: 8,
                }}
            >
                {/* ==================================================
            CARD MATERIAL
        ================================================== */}

                <View
                    style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: CARD_RADIUS,
                        overflow: 'hidden',
                    }}
                >
                    {/* Figma Background Blur = 16 */}
                    <BlurView
                        intensity={16}
                        tint="dark"
                        pointerEvents="none"
                        style={{
                            position: 'absolute',
                            inset: 0,
                        }}
                    />

                    {/* Figma Fill:
              #FFFFFF @ 6%
          */}
                    <View
                        pointerEvents="none"
                        style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundColor: 'rgba(255,255,255,0.06)',
                        }}
                    />

                    {/* ==================================================
              IMAGE
              140 × 100
              opacity 70%
          ================================================== */}

                    <Image
                        source={image}
                        resizeMode="cover"
                        style={{
                            width: cardWidth,
                            height: imageHeight,
                            opacity: 0.7,
                        }}
                    />

                    {/* Very subtle transition between image/content */}
                    <View
                        pointerEvents="none"
                        style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            top: imageHeight - 14,
                            height: 14,
                            backgroundColor: 'rgba(20,18,16,0.16)',
                        }}
                    />

                    {/* ==================================================
              CONTENT
          ================================================== */}

                    <View
                        style={{
                            height: cardHeight - imageHeight,
                            paddingHorizontal: 12,
                            paddingTop: 11,
                            paddingBottom: 10,
                        }}
                    >
                        <Text
                            numberOfLines={1}
                            style={{
                                color: '#F5F3EF',
                                fontFamily: 'Inter_600SemiBold',
                                fontSize: 13,
                                lineHeight: 20,
                            }}
                        >
                            {device.name}
                        </Text>

                        <View
                            style={{
                                marginTop: 8,
                                alignItems: 'flex-start',
                            }}
                        >
                            <DeviceStatusBadge status={device.status} />
                        </View>
                    </View>
                </View>

                {/* ==================================================
            FIGMA STROKE

            #E29E3E @ 28%
            1px / Inside appearance
        ================================================== */}

                <View
                    pointerEvents="none"
                    style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: CARD_RADIUS,
                        borderWidth: 1,
                        borderColor: 'rgba(226,158,62,0.28)',
                    }}
                />
            </View>
        </PremiumPressable>
    );
}
