import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Text, View } from 'react-native';

import { PremiumPressable } from '@/components/ui/PremiumPressable';
import { PinInput } from '@/features/auth/components/PinInput';
import { ProfileScreenShell } from '@/features/profile/components/ProfileScreenShell';
import { getProfileErrorMessage } from '@/features/profile/errors';
import { useChangeProfilePin } from '@/features/profile/hooks/use-profile';
import { colors } from '@/theme/tokens';

export function ChangePinScreen() {
  const mutation = useChangeProfilePin();
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const submit = () => {
    setError('');
    if (!/^\d{4}$/.test(currentPin) || !/^\d{4}$/.test(newPin)) { setError('PIN-ul trebuie să conțină 4 cifre.'); return; }
    if (newPin !== confirmation) { setError('PIN-urile nu coincid.'); return; }
    mutation.mutate({ currentPin, newPin }, { onError: (changeError) => setError(getProfileErrorMessage(changeError)), onSuccess: () => { setCurrentPin(''); setNewPin(''); setConfirmation(''); Alert.alert('PIN actualizat', 'PIN-ul a fost schimbat cu succes.', [{ onPress: () => router.back(), text: 'OK' }]); } });
  };
  return <ProfileScreenShell title="Schimbă PIN-ul"><View className="mt-9 gap-6"><View><Text className="mb-2 font-inter-medium text-base text-ora-secondary">PIN curent</Text><PinInput error={Boolean(error)} onChange={setCurrentPin} value={currentPin} /></View><View><Text className="mb-2 font-inter-medium text-base text-ora-secondary">PIN nou</Text><PinInput error={Boolean(error)} onChange={setNewPin} value={newPin} /></View><View><Text className="mb-2 font-inter-medium text-base text-ora-secondary">Confirmă PIN-ul nou</Text><PinInput error={Boolean(error)} onChange={setConfirmation} onSubmit={submit} value={confirmation} /></View>{error ? <Text accessibilityRole="alert" className="text-center font-inter text-sm text-ora-error">{error}</Text> : null}<PremiumPressable accessibilityLabel="Schimbă PIN-ul" onPress={mutation.isPending ? undefined : submit}><View className={`h-14 items-center justify-center rounded-2xl bg-ora-gold ${mutation.isPending ? 'opacity-60' : ''}`}>{mutation.isPending ? <ActivityIndicator color={colors.iconBackground} /> : <Text className="font-inter-semibold text-base text-ora-dark">Schimbă PIN-ul</Text>}</View></PremiumPressable></View></ProfileScreenShell>;
}
