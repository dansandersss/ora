import { ImageBackground, Text, View } from 'react-native';

import GoldArrow from '@/../assets/images/arrow 2.svg';
import { PremiumPressable } from '@/components/ui/PremiumPressable';

const CARD_HEIGHT = 220;
const CARD_RADIUS = 24;

export function HomeHeroCard({
                                 onPress,
                             }: {
    onPress: () => void;
}) {
    return (
        <PremiumPressable
            accessibilityLabel="Rezerva o statie acum"
            className="w-full"
            onPress={onPress}
            tilt
        >
            <View
                style={{
                    width: '100%',
                    height: CARD_HEIGHT,
                    borderRadius: CARD_RADIUS,

                    shadowColor: '#000000',
                    shadowOffset: {
                        width: 0,
                        height: 10,
                    },
                    shadowOpacity: 0.38,
                    shadowRadius: 20,

                    elevation: 8,
                }}
            >
                <View
                    style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: CARD_RADIUS,
                        overflow: 'hidden',
                    }}
                >
                    <ImageBackground
                        source={require('@/../assets/images/ora_bg.png')}
                        resizeMode="cover"
                        imageStyle={{
                            opacity: 0.7,
                        }}
                        style={{
                            width: '100%',
                            height: CARD_HEIGHT,
                        }}
                    >
                        {/* Figma black fill #000000 @ 38% */}
                        <View
                            pointerEvents="none"
                            style={{
                                position: 'absolute',
                                inset: 0,
                                backgroundColor: 'rgba(0,0,0,0.38)',
                            }}
                        />

                        {/* Content */}
                        <View
                            style={{
                                flex: 1,
                                justifyContent: 'space-between',
                                padding: 20,
                            }}
                        >
                            {/* Badge */}
                            <View
                                style={{
                                    alignSelf: 'flex-start',
                                    borderRadius: 999,
                                    borderWidth: 1,
                                    borderColor: 'rgba(226,158,62,0.30)',
                                    backgroundColor: 'rgba(0,0,0,0.28)',
                                    paddingHorizontal: 14,
                                    paddingVertical: 7,
                                }}
                            >
                                <Text
                                    style={{
                                        color: '#F5F3EF',
                                        fontFamily: 'Inter_600SemiBold',
                                        fontSize: 11,
                                        lineHeight: 14,
                                    }}
                                >
                                    PLANURI PENTRU AZI?
                                </Text>
                            </View>

                            {/* Bottom content */}
                            <View>
                                <Text
                                    style={{
                                        color: '#F5F3EF',
                                        fontFamily: 'Inter_300Light',
                                        fontSize: 28,
                                        lineHeight: 34,
                                    }}
                                >
                                    Începe seara ta la ORA
                                </Text>

                                <View
                                    style={{
                                        marginTop: 8,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: '#E29E3E',
                                            fontFamily: 'Inter_600SemiBold',
                                            fontSize: 14,
                                            lineHeight: 22,
                                            marginRight: 12,
                                        }}
                                    >
                                        Rezervă o stație acum
                                    </Text>

                                    <GoldArrow
                                        width={18}
                                        height={18}
                                    />
                                </View>
                            </View>
                        </View>
                    </ImageBackground>
                </View>

                {/* Figma stroke */}
                <View
                    pointerEvents="none"
                    style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: CARD_RADIUS,
                        borderWidth: 1,
                        borderColor: 'rgba(226,158,62,0.30)',
                    }}
                />
            </View>
        </PremiumPressable>
    );
}
