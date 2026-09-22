export type DeviceAvailabilityStatus = 'online' | 'offline' | 'busy' | 'maintenance';

export type DeviceAvailability = {
  id: string;
  name: string;
  type: 'pc' | 'xbox';
  status: DeviceAvailabilityStatus;
};
