import { BlurView } from 'expo-blur';
import { Text, View } from 'react-native';

import ChevronRightIcon from '@/../assets/images/chevron-right.svg';
import StarIcon from '@/../assets/images/star.svg';
import { PremiumPressable } from '@/components/ui/PremiumPressable';

type PointsCardProps = {
    onPress: () => void;
    points: number;
};

const CARD_HEIGHT = 72;
const CARD_RADIUS = 24;

export function PointsCard({
                               onPress,
                               points,
                           }: PointsCardProps) {
    return (
        <PremiumPressable
            accessibilityLabel={`ORA Points, ${points} puncte`}
            className="w-full"
            onPress={onPress}
        >
            <View
                style={{
                    width: '100%',
                    height: CARD_HEIGHT,
                    borderRadius: CARD_RADIUS,

                    shadowColor: '#E29E3E',
                    shadowOffset: {
                        width: 0,
                        height: 4,
                    },
                    shadowOpacity: 0.12,
                    shadowRadius: 24,

                    elevation: 8,
                }}
            >
                {/* Glass background */}
                <View
                    pointerEvents="none"
                    style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: CARD_RADIUS,
                        overflow: 'hidden',
                    }}
                >
                    <BlurView
                        intensity={20}
                        tint="dark"
                        style={{
                            position: 'absolute',
                            inset: 0,
                        }}
                    />

                    <View
                        style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundColor: 'rgba(255,255,255,0.06)',
                        }}
                    />
                </View>

                {/* Stroke */}
                <View
                    pointerEvents="none"
                    style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: CARD_RADIUS,
                        borderWidth: 1,
                        borderColor: 'rgba(226,158,62,0.35)',
                    }}
                />

                {/* Content */}
                <View
                    style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',

                        // 16,20,16,20
                        paddingVertical: 16,
                        paddingHorizontal: 20,
                    }}
                >
                    {/* Star icon container */}
                    <View
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 10,
                            borderWidth: 1,
                            borderColor: 'rgba(226,158,62,0.35)',
                            backgroundColor: 'rgba(226,158,62,0.10)',

                            alignItems: 'center',
                            justifyContent: 'center',

                            marginRight: 16,
                        }}
                    >
                        <StarIcon
                            width={18}
                            height={18}
                        />
                    </View>

                    {/* Text */}
                    <View
                        style={{
                            flex: 1,
                            justifyContent: 'center',
                        }}
                    >
                        <Text
                            style={{
                                color: '#F5F3EF',
                                fontFamily: 'Inter_300Light',
                                fontSize: 14,
                                lineHeight: 19,
                            }}
                        >
                            ORA Points
                        </Text>

                        <Text
                            style={{
                                color: '#E29E3E',
                                fontFamily: 'Inter_700Bold',
                                fontSize: 20,
                                lineHeight: 26,
                                marginTop: 1,
                            }}
                        >
                            {points} P
                        </Text>
                    </View>

                    {/* Chevron */}
                    <View
                        style={{
                            width: 22,
                            height: 22,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginLeft: 12,
                        }}
                    >
                        <ChevronRightIcon
                            width={18}
                            height={18}
                        />
                    </View>
                </View>
            </View>
        </PremiumPressable>
    );
}
