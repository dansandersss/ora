import type { DeviceAvailability } from '@/features/home/types';

export const mockDevices: DeviceAvailability[] = [
  { id: 'pc-main', name: 'PC', type: 'pc', status: 'online' },
  { id: 'xbox-main', name: 'Xbox', type: 'xbox', status: 'online' },
];
