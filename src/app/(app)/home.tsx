import { TabContentTransition } from '@/features/home/components/TabContentTransition';
import { HomeScreen } from '@/screens/HomeScreen';

export default function HomeRoute() {
  return (
    <TabContentTransition tabName="home">
      <HomeScreen />
    </TabContentTransition>
  );
}
