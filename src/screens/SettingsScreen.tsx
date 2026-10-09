import { Camera as ExpoCamera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Bell, BellRing, Camera as CameraIcon, Languages, LockKeyhole, Palette, Smartphone, Trash2, Vibrate, Volume2 } from 'lucide-react-native';
import type { PropsWithChildren } from 'react';
import { useEffect, useState } from 'react';
import { Alert, Linking, Text, View } from 'react-native';
import { router } from 'expo-router';

import { GlassSurface } from '@/components/ui/GlassSurface';
import { SettingsRow } from '@/features/profile/components/SettingsRow';
import { ProfileScreenShell } from '@/features/profile/components/ProfileScreenShell';
import { defaultOraPreferences, getOraPreferences, saveOraPreferences } from '@/lib/preferences';

function Section({ children, title }: PropsWithChildren<{ title: string }>) {
  return (
    <View className="mt-7">
      <Text className="mb-3 font-inter-semibold text-lg text-ora-primary">{title}</Text>
      <GlassSurface
        radius={18}
        intensity={18}
        fillColor="rgba(255,255,255,0.045)"
        borderColor="rgba(226,158,62,0.28)"
        shadowStyle={{ boxShadow: '0 8px 20px rgba(0,0,0,0.16)' }}>
        <View>{children}</View>
      </GlassSurface>
    </View>
  );
}

export function SettingsScreen() {
  const [preferences, setPreferences] = useState(defaultOraPreferences);
  useEffect(() => { getOraPreferences().then(setPreferences).catch(() => undefined); }, []);
  const toggle = (key: keyof typeof preferences) => (value: boolean) => { const next = { ...preferences, [key]: value }; setPreferences(next); saveOraPreferences(next).catch(() => undefined); };
  const future = (title: string) => Alert.alert(title, 'Această opțiune va fi disponibilă în curând.');
  const openNotificationSettings = () => {
    Linking.openSettings().catch(() => Alert.alert('Setări indisponibile', 'Setările aplicației nu au putut fi deschise.'));
  };
  const requestMediaPermissions = async () => {
    const [camera, photos] = await Promise.all([
      ExpoCamera.requestCameraPermissionsAsync(),
      ImagePicker.requestMediaLibraryPermissionsAsync(),
    ]);
    const granted = camera.granted && photos.granted;
    Alert.alert(
      granted ? 'Permisiuni acordate' : 'Permisiuni necesare',
      granted ? 'Camera și fotografiile pot fi folosite în ORA.' : 'Poți modifica accesul din setările telefonului.',
      granted ? undefined : [{ onPress: () => Linking.openSettings(), text: 'Deschide setările' }, { style: 'cancel', text: 'Mai târziu' }],
    );
  };

  return (
    <ProfileScreenShell title="Setări">
      <Section title="Notificări">
        <SettingsRow Icon={Bell} label="Notificări în aplicație" onToggle={toggle('inAppNotificationsEnabled')} value={preferences.inAppNotificationsEnabled} />
        <SettingsRow Icon={Volume2} label="Sunet notificări" onToggle={toggle('notificationSoundEnabled')} value={preferences.notificationSoundEnabled} />
        <SettingsRow Icon={Vibrate} label="Vibrații" onToggle={toggle('hapticsEnabled')} value={preferences.hapticsEnabled} />
        <SettingsRow Icon={BellRing} label="Alerte sesiune" onToggle={toggle('sessionAlertsEnabled')} showDivider={false} value={preferences.sessionAlertsEnabled} />
      </Section>
      <Section title="Aspect"><SettingsRow Icon={Palette} label="Tema" onPress={() => Alert.alert('Tema', 'ORA folosește tema Dark.')} showDivider={false} valueLabel="Dark" /></Section>
      <Section title="Limbă"><SettingsRow Icon={Languages} label="Limbă" onPress={() => Alert.alert('Limbă', 'Limba activă este Română.')} showDivider={false} valueLabel="Română" /></Section>
      <Section title="Confidențialitate">
        <SettingsRow Icon={Bell} label="Permisiuni notificări" onPress={openNotificationSettings} />
        <SettingsRow Icon={CameraIcon} label="Permisiuni cameră și fotografii" onPress={requestMediaPermissions} showDivider={false} />
      </Section>
      <Section title="Securitate">
        <SettingsRow Icon={LockKeyhole} label="Schimbă PIN-ul" onPress={() => router.navigate('/profile/change-pin')} />
        <SettingsRow Icon={Smartphone} label="Dispozitive conectate" onPress={() => future('Dispozitive conectate')} showDivider={false} valueLabel="În curând" />
      </Section>
      <Section title="Cont"><SettingsRow Icon={Trash2} label="Șterge contul" onPress={() => future('Șterge contul')} showDivider={false} valueLabel="În curând" /></Section>
      <View className="h-8" />
    </ProfileScreenShell>
  );
}
