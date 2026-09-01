import type { ComponentType } from 'react';
import type { SvgProps } from 'react-native-svg';

import GiftIcon from '@/../assets/images/gift.svg';
import StarIcon from '@/../assets/images/star.svg';

export type OnboardingSlideData = {
  id: string;
  title: string;
  description?: string;
  benefits?: readonly string[];
  variant: 'hero' | 'icon';
  Icon?: ComponentType<SvgProps>;
};

export const onboardingSlides: readonly OnboardingSlideData[] = [
  {
    id: 'welcome',
    title: 'Bine ai venit la',
    variant: 'hero',
    benefits: [
      'Urmărește timpul rămas',
      'Câștigă puncte',
      'Deblochează recompense',
    ],
  },
  {
    id: 'points',
    title: 'Câștigă puncte',
    description: 'Joacă, acumulează puncte\nși deblochează recompense\nexclusive',
    variant: 'icon',
    Icon: StarIcon,
  },
  {
    id: 'rewards',
    title: 'Recompense',
    description: 'Transformă punctele\nîn timp extra, reduceri\nși beneficii speciale.',
    variant: 'icon',
    Icon: GiftIcon,
  },
];
