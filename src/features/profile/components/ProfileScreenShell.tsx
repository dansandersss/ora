import { router } from 'expo-router';
import type { PropsWithChildren, ReactNode } from 'react';
import { ScrollView } from 'react-native';

import { PremiumAnimatedBackground } from '@/components/backgrounds/PremiumAnimatedBackground';
import { AppContent, AppScreen } from '@/components/layout/AppScreen';
import { Entrance } from '@/components/ui/Entrance';
import { GlassBlurProvider } from '@/components/ui/GlassSurface';
import { SessionHeader } from '@/features/sessions/components/SessionHeader';

type Props = PropsWithChildren<{ rightContent?: ReactNode; title: string }>;

export function ProfileScreenShell({ children, rightContent, title }: Props) {
  const divider = title.lastIndexOf(' ');
  const splitIndex = divider > 0 ? divider + 1 : Math.max(1, Math.ceil(title.length * 0.55));
  const titleParts = [
    { text: title.slice(0, splitIndex) },
    { text: title.slice(splitIndex), gradient: true },
  ];

  return (
    <GlassBlurProvider>
      <AppScreen backgroundClassName="bg-transparent">
        <PremiumAnimatedBackground />
        <ScrollView contentContainerClassName="pb-[148px] pt-4" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <AppContent>
            <Entrance>
              <SessionHeader
                backLabel="Înapoi la profil"
                onBack={() => router.replace('/profile')}
                rightContent={rightContent}
                title={title}
                titleParts={titleParts}
                titleSize="compact"
              />
            </Entrance>
            {children}
          </AppContent>
        </ScrollView>
      </AppScreen>
    </GlassBlurProvider>
  );
}
