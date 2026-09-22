import { TabContentTransition } from '@/features/home/components/TabContentTransition';
import { PointsScreen } from '@/screens/PointsScreen';

export default function PointsRoute() {
  return <TabContentTransition tabName="points"><PointsScreen /></TabContentTransition>;
}
