import { router } from 'expo-router';
import { ScrollView } from 'react-native';

import { AppContent, AppScreen } from '@/components/layout/AppScreen';
import { SessionHeader } from '@/features/sessions/components/SessionHeader';
import { SessionHistory } from '@/features/sessions/components/SessionHistory';

export default function SessionHistoryRoute() {
  return (
    <AppScreen>
      <ScrollView contentContainerClassName="pb-8 pt-4" showsVerticalScrollIndicator={false}>
        <AppContent>
          <SessionHeader backLabel="Inapoi la sesiuni" onBack={() => router.replace('/sessions')} title="Istoric sesiuni" />
          <SessionHistory
            grouped
            showTitle={false}
          />
        </AppContent>
      </ScrollView>
    </AppScreen>
  );
}
