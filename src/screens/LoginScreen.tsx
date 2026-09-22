import { zodResolver } from '@hookform/resolvers/zod';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';
import { LinearGradient } from 'expo-linear-gradient';
import BackIcon from '@/../assets/images/Active Session/back.svg';
import { EntryAmbientBackground } from '@/components/backgrounds/PremiumAnimatedBackground';
import { GlassBlurProvider, GlassSurface } from '@/components/ui/GlassSurface';

import { PhoneInput } from '@/features/auth/components/PhoneInput';
import { PinInput } from '@/features/auth/components/PinInput';
import { ReceptionHelpModal } from '@/features/auth/components/ReceptionHelpModal';
import { getAuthErrorMessage } from '@/features/auth/errors';
import { useLoginMutation } from '@/features/auth/hooks/use-login';
import { persistSession, POST_LOGIN_ROUTE, restoreSession } from '@/features/auth/session/auth-session';
import { useHasSplashCompleted } from '@/lib/startup-context';

const loginSchema = z.object({
  localPhone: z.string().regex(/^\d{8}$/),
  pin: z.string().regex(/^\d{4}$/),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginScreen() {
  const splashComplete = useHasSplashCompleted();
  const { partyCode } = useLocalSearchParams<{ partyCode?: string }>();
  const loginMutation = useLoginMutation();
  const submitLocked = useRef(false);
  const [receptionModalVisible, setReceptionModalVisible] = useState(false);
  const [storageError, setStorageError] = useState('');
  const [navigationError, setNavigationError] = useState('');
  const [isCompletingLogin, setIsCompletingLogin] = useState(false);
  const [navigationStarted, setNavigationStarted] = useState(false);
  const headingEntrance = useSharedValue(0);
  const formEntrance = useSharedValue(0);
  const {
    control,
    formState: { errors, isValid },
    handleSubmit,
    setValue,
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: { localPhone: '', pin: '' },
  });

  useEffect(() => {
    headingEntrance.value = withTiming(1, { duration: 350, easing: Easing.out(Easing.cubic) });
    formEntrance.value = withDelay(100, withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) }));
  }, [formEntrance, headingEntrance]);

  useEffect(() => {
    if (!splashComplete || isCompletingLogin || navigationStarted) return;
    let active = true;
    restoreSession()
      .then((user) => {
        if (!active || !user || navigationStarted || submitLocked.current) return;
        setNavigationStarted(true);
        router.replace(partyCode ? { pathname: '/party/join', params: { code: partyCode } } : POST_LOGIN_ROUTE);
      })
      .catch(() => {
        // Session restoration is independent from an interactive login attempt.
      });
    return () => {
      active = false;
    };
  }, [splashComplete, isCompletingLogin, navigationStarted, partyCode]);

  const headingStyle = useAnimatedStyle(() => ({
    opacity: 0.9 + headingEntrance.value * 0.1,
    transform: [{ translateY: (1 - headingEntrance.value) * 8 }],
  }));
  const formStyle = useAnimatedStyle(() => ({
    opacity: 0.9 + formEntrance.value * 0.1,
    transform: [{ translateY: (1 - formEntrance.value) * 10 }],
  }));

  const submit = () => handleSubmit(async (values) => {
    if (submitLocked.current || isCompletingLogin || navigationStarted) return;
    submitLocked.current = true;
    setStorageError('');
    setNavigationError('');
    setIsCompletingLogin(true);

    let session;
    try {
      session = await loginMutation.mutateAsync({
        localPhone: values.localPhone,
        pin: values.pin,
        deviceName: `${Platform.OS} ORA app`,
      });
    } catch {
      submitLocked.current = false;
      setIsCompletingLogin(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => undefined);
      return;
    }

    try {
      await persistSession(session);
    } catch {
      setStorageError('Sesiunea nu a putut fi salvata pe acest dispozitiv. Incearca din nou.');
      submitLocked.current = false;
      setIsCompletingLogin(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => undefined);
      return;
    }

    setValue('pin', '');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    setNavigationStarted(true);
    try {
      router.replace(partyCode ? { pathname: '/party/join', params: { code: partyCode } } : POST_LOGIN_ROUTE);
    } catch {
      setNavigationStarted(false);
      setNavigationError('Autentificarea a reusit, dar pagina Home nu a putut fi deschisa. Incearca din nou.');
      submitLocked.current = false;
      setIsCompletingLogin(false);
    }
  })();

  const serverError = loginMutation.isError ? getAuthErrorMessage(loginMutation.error) : '';
  const localError = errors.localPhone
    ? 'Numarul de telefon nu este valid.'
    : errors.pin
      ? 'PIN-ul trebuie sa contina 4 cifre.'
      : '';
  const displayedMessage = serverError || storageError || navigationError || localError;
  const disabled = !isValid || loginMutation.isPending || isCompletingLogin || navigationStarted;

  return (
    <GlassBlurProvider>
    <View className="flex-1 bg-[#080808]">
    <View className="w-full max-w-[430px] flex-1 self-center">
    <EntryAmbientBackground />
    <SafeAreaView className="flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View className="flex-1 px-[22px] pb-[32px] pt-[24px]">
              <Pressable accessibilityRole="button" accessibilityLabel="Înapoi la prezentarea ORA" className="mb-[28px] h-[44px] w-[44px]" onPress={() => router.replace({ pathname: '/', params: { onboarding: '1', ...(partyCode ? { partyCode } : {}) } })}>
                <GlassSurface radius={12} borderColor="rgba(156,116,55,0.40)"><View className="h-[44px] w-[44px] items-center justify-center"><BackIcon width={18} height={18} /></View></GlassSurface>
              </Pressable>
              <Animated.View style={headingStyle}>
                <Text className="font-inter text-[38px] leading-[46px] text-ora-primary">Bine ai revenit</Text>
                <Text className="mt-[2px] max-w-[300px] font-inter text-[14px] leading-[19px] text-ora-secondary/70">Introdu datele tale pentru a te conecta în universul ORA.</Text>
              </Animated.View>

              <View className="mt-[48px]"><Animated.View style={formStyle}>
                <Controller
                  control={control}
                  name="localPhone"
                  render={({ field: { onChange, value } }) => (
                    <PhoneInput
                      error={Boolean(errors.localPhone || serverError)}
                      onChange={(text) => {
                        loginMutation.reset();
                        setStorageError('');
                        setNavigationError('');
                        onChange(text);
                      }}
                      value={value}
                    />
                  )}
                />

                <View className="mt-[20px]">
                  <Controller
                    control={control}
                    name="pin"
                    render={({ field: { onChange, value } }) => (
                      <PinInput
                        compact
                        onForgot={() => setReceptionModalVisible(true)}
                        error={Boolean(errors.pin || serverError)}
                        onChange={(text) => {
                          loginMutation.reset();
                          setStorageError('');
                          setNavigationError('');
                          onChange(text);
                        }}
                        onSubmit={submit}
                        value={value}
                      />
                    )}
                  />
                </View>

                <View className="min-h-[48px] justify-center py-[4px]">
                  {displayedMessage ? (
                    <Text
                      accessibilityLiveRegion="polite"
                      className="font-inter text-sm text-ora-error">
                      {displayedMessage}
                    </Text>
                  ) : null}
                </View>

                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ disabled, busy: loginMutation.isPending || isCompletingLogin }}
                  accessibilityLabel="Conectează-te"
                  className={`h-[54px] overflow-hidden rounded-[15px] border border-[#E9B957]/70 ${disabled ? 'opacity-[0.65]' : 'active:opacity-90'}`}
                  style={{ boxShadow: '0 4px 24px rgba(218,156,54,0.22)' }}
                  disabled={disabled}
                  onPress={submit}>
                  <LinearGradient colors={['#D9A441', '#CD9034']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                  {loginMutation.isPending || isCompletingLogin ? (
                    <ActivityIndicator color="#151516" size="small" />
                  ) : (
                    <Text className="font-inter-semibold text-base text-ora-dark">Conectează-te</Text>
                  )}
                  </LinearGradient>
                </Pressable>

              </Animated.View></View>

              <Pressable
                accessibilityRole="button"
                accessibilityHint="Afiseaza informatii despre crearea unui cont ORA"
                className="mt-[12px] min-h-[44px] items-center justify-center"
                onPress={() => setReceptionModalVisible(true)}>
                <Text
                  adjustsFontSizeToFit
                  className="text-center font-inter text-[13px] text-ora-secondary"
                  minimumFontScale={0.85}
                  numberOfLines={1}>
                  Nu ai cont? <Text className="font-inter-medium text-[#D9A441]">Creează-l la recepția ORA</Text>
                </Text>
              </Pressable>
            </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <ReceptionHelpModal
        onClose={() => setReceptionModalVisible(false)}
        visible={receptionModalVisible}
      />
    </SafeAreaView>
    </View>
    </View>
    </GlassBlurProvider>
  );
}
