import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { ImagePlus, LockKeyhole, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Alert, Text, TextInput, View } from 'react-native';

import { PremiumPressable } from '@/components/ui/PremiumPressable';
import { ProfileScreenShell } from '@/features/profile/components/ProfileScreenShell';
import { UserAvatar } from '@/features/profile/components/UserAvatar';
import { getProfileErrorMessage } from '@/features/profile/errors';
import { useProfile, useRemoveProfileAvatar, useUpdateProfile, useUploadProfileAvatar } from '@/features/profile/hooks/use-profile';
import { colors } from '@/theme/tokens';

const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']);

export function EditProfileScreen() {
  const profileQuery = useProfile();
  const updateMutation = useUpdateProfile();
  const uploadMutation = useUploadProfileAvatar();
  const removeMutation = useRemoveProfileAvatar();
  const [fullNameDraft, setFullName] = useState<string | null>(null);
  const [phoneDraft, setPhone] = useState<string | null>(null);
  const [error, setError] = useState('');
  const fullName = fullNameDraft ?? profileQuery.data?.fullName ?? '';
  const phone = phoneDraft ?? profileQuery.data?.phone ?? '+373';

  const pickAvatar = async () => {
    setError('');
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) { Alert.alert('Acces necesar', 'Permite accesul la fotografii pentru a schimba avatarul.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], mediaTypes: ['images'], quality: 0.82 });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) { setError('Imaginea trebuie să aibă maximum 5 MB.'); return; }
    const mimeType = asset.mimeType ?? 'image/jpeg';
    if (!allowedMimeTypes.has(mimeType)) { setError('Alege o imagine JPEG, PNG, WebP, HEIC sau HEIF.'); return; }
    uploadMutation.mutate({ file: asset.file, mimeType, name: asset.fileName ?? `avatar.${mimeType.split('/')[1]}`, uri: asset.uri }, { onError: (uploadError) => setError(getProfileErrorMessage(uploadError, 'Avatarul nu a putut fi încărcat.')) });
  };

  const save = () => {
    setError('');
    const trimmedName = fullName.trim();
    if (trimmedName.length < 2 || trimmedName.length > 80) { setError('Numele trebuie să conțină între 2 și 80 de caractere.'); return; }
    if (!/^\+373\d{8}$/.test(phone)) { setError('Numărul de telefon nu este valid.'); return; }
    const profile = profileQuery.data;
    if (!profile) return;
    const input = { ...(trimmedName !== (profile.fullName ?? '') ? { fullName: trimmedName } : {}), ...(phone !== profile.phone ? { phone } : {}) };
    if (!Object.keys(input).length) { setError('Nu ai făcut nicio modificare.'); return; }
    updateMutation.mutate(input, { onError: (updateError) => setError(getProfileErrorMessage(updateError)), onSuccess: () => router.back() });
  };

  const busy = updateMutation.isPending || uploadMutation.isPending || removeMutation.isPending;
  return (
    <ProfileScreenShell title="Editează profilul">
      {profileQuery.isLoading ? <ActivityIndicator className="mt-16" color={colors.gold} /> : profileQuery.isError || !profileQuery.data ? <Text className="mt-12 text-center font-inter text-ora-secondary">Profilul nu a putut fi încărcat.</Text> : <>
        <View className="mt-8 items-center">
          <PremiumPressable accessibilityLabel="Schimbă fotografia de profil" onPress={busy ? undefined : pickAvatar}>
            <View><UserAvatar avatarUrl={profileQuery.data.avatarUrl} size={116} /><View className="absolute -bottom-1 -right-1 h-10 w-10 items-center justify-center rounded-full border-2 border-ora-background bg-ora-gold">{uploadMutation.isPending ? <ActivityIndicator color={colors.iconBackground} size="small" /> : <ImagePlus color={colors.iconBackground} size={20} />}</View></View>
          </PremiumPressable>
          {profileQuery.data.avatarUrl ? <PremiumPressable accessibilityLabel="Elimină fotografia de profil" className="mt-4" onPress={() => removeMutation.mutate(undefined, { onError: (removeError) => setError(getProfileErrorMessage(removeError, 'Avatarul nu a putut fi eliminat.')) })}><View className="flex-row items-center"><Trash2 color="#E4574E" size={17} /><Text className="ml-2 font-inter-medium text-sm text-[#E4574E]">Elimină fotografia</Text></View></PremiumPressable> : null}
        </View>
        <View className="mt-9 gap-5">
          <View><Text className="mb-2 font-inter-medium text-sm text-ora-secondary">Nume</Text><TextInput accessibilityLabel="Nume" className="h-14 rounded-2xl border border-ora-divider bg-ora-surface px-4 font-inter text-base text-ora-primary" maxLength={80} onChangeText={setFullName} value={fullName} /></View>
          <View><Text className="mb-2 font-inter-medium text-sm text-ora-secondary">Telefon</Text><TextInput accessibilityLabel="Telefon" className="h-14 rounded-2xl border border-ora-divider bg-ora-surface px-4 font-inter text-base text-ora-primary" keyboardType="phone-pad" maxLength={12} onChangeText={(value) => setPhone(`+${value.replace(/\D/g, '').slice(0, 11)}`)} value={phone} /></View>
          {error ? <Text accessibilityRole="alert" className="text-center font-inter text-sm text-ora-error">{error}</Text> : null}
          <PremiumPressable accessibilityLabel="Salvează profilul" onPress={busy ? undefined : save}><View className={`h-14 items-center justify-center rounded-2xl bg-ora-gold ${busy ? 'opacity-60' : ''}`}>{updateMutation.isPending ? <ActivityIndicator color={colors.iconBackground} /> : <Text className="font-inter-semibold text-base text-ora-dark">Salvează modificările</Text>}</View></PremiumPressable>
          <PremiumPressable accessibilityLabel="Schimbă PIN-ul" onPress={() => router.navigate('/profile/change-pin')}><View className="h-14 flex-row items-center rounded-2xl border border-ora-divider bg-ora-surface px-4"><LockKeyhole color={colors.gold} size={20} /><Text className="ml-3 font-inter-medium text-base text-ora-primary">Schimbă PIN-ul</Text></View></PremiumPressable>
        </View>
      </>}
    </ProfileScreenShell>
  );
}
