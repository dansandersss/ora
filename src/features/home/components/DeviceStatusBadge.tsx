import OnlineBadge from '@/../assets/images/online.svg';
import OfflineBadge from '@/../assets/images/offline.svg';

import type { DeviceAvailabilityStatus } from '@/features/home/types';

export function DeviceStatusBadge({
                                      status,
                                  }: {
    status: DeviceAvailabilityStatus;
}) {
    if (status === 'online') {
        return <OnlineBadge />;
    }

    return <OfflineBadge />;
}