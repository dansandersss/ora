import { router } from 'expo-router';
import type { PropsWithChildren, ReactNode } from 'react';
import { ScrollView } from 'react-native';

import { AppContent, AppScreen } from '@/components/layout/AppScreen';
import { Entrance } from '@/components/ui/Entrance';
import { AmbientGoldGlow } from '@/features/home/components/AmbientGoldGlow';
import { SessionHeader } from '@/features/sessions/components/SessionHeader';

type Props = PropsWithChildren<{ rightContent?: ReactNode; title: string }>;

export function ProfileScreenShell({ children, rightContent, title }: Props) {
  return (
    <AppScreen>
      <AmbientGoldGlow />
      <ScrollView contentContainerClassName="pb-24 pt-3" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <AppContent>
          <Entrance><SessionHeader backLabel="Înapoi la profil" onBack={() => router.replace('/profile')} rightContent={rightContent} title={title} titleSize="compact" /></Entrance>
          {children}
        </AppContent>
      </ScrollView>
    </AppScreen>
  );
}
