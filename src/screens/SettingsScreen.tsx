import { Bell, BellRing, Camera, Languages, LockKeyhole, Palette, Smartphone, Trash2, Vibrate, Volume2 } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { router } from 'expo-router';

import { SettingsRow } from '@/features/profile/components/SettingsRow';
import { ProfileScreenShell } from '@/features/profile/components/ProfileScreenShell';
import { defaultOraPreferences, getOraPreferences, saveOraPreferences } from '@/lib/preferences';

function Section({ children, title }: React.PropsWithChildren<{ title: string }>) { return <View className="mt-7"><Text className="mb-3 font-inter-semibold text-lg text-ora-primary">{title}</Text><View className="overflow-hidden rounded-[18px] bg-ora-surface">{children}</View></View>; }

export function SettingsScreen() {
  const [preferences, setPreferences] = useState(defaultOraPreferences);
  useEffect(() => { getOraPreferences().then(setPreferences).catch(() => undefined); }, []);
  const toggle = (key: keyof typeof preferences) => (value: boolean) => { const next = { ...preferences, [key]: value }; setPreferences(next); saveOraPreferences(next).catch(() => undefined); };
  const future = (title: string) => Alert.alert(title, 'Această opțiune va fi disponibilă în curând.');
  return <ProfileScreenShell title="Setări">
    <Section title="Notificări"><SettingsRow Icon={Bell} label="Notificări în aplicație" onToggle={toggle('inAppNotificationsEnabled')} value={preferences.inAppNotificationsEnabled} /><SettingsRow Icon={Volume2} label="Sunet notificări" onToggle={toggle('notificationSoundEnabled')} value={preferences.notificationSoundEnabled} /><SettingsRow Icon={Vibrate} label="Vibrații" onToggle={toggle('hapticsEnabled')} value={preferences.hapticsEnabled} /><SettingsRow Icon={BellRing} label="Alerte sesiune" onToggle={toggle('sessionAlertsEnabled')} value={preferences.sessionAlertsEnabled} /></Section>
    <Section title="Aspect"><SettingsRow disabled Icon={Palette} label="Tema" valueLabel="Dark" /></Section>
    <Section title="Limbă"><SettingsRow disabled Icon={Languages} label="Limbă" valueLabel="Română" /></Section>
    <Section title="Confidențialitate"><SettingsRow Icon={Bell} label="Permisiuni notificări" onPress={() => future('Permisiuni notificări')} /><SettingsRow Icon={Camera} label="Permisiuni cameră și fotografii" onPress={() => future('Permisiuni media')} /></Section>
    <Section title="Securitate"><SettingsRow Icon={LockKeyhole} label="Schimbă PIN-ul" onPress={() => router.navigate('/profile/change-pin')} /><SettingsRow disabled Icon={Smartphone} label="Dispozitive conectate" valueLabel="În curând" /></Section>
    <Section title="Cont"><SettingsRow disabled Icon={Trash2} label="Șterge contul" valueLabel="În curând" /></Section>
  </ProfileScreenShell>;
}
