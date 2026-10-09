import type { LucideIcon } from 'lucide-react-native';
import { ChevronRight } from 'lucide-react-native';
import { Switch, Text, View } from 'react-native';

import { PremiumPressable } from '@/components/ui/PremiumPressable';
import { colors } from '@/theme/tokens';

type Props = { disabled?: boolean; Icon: LucideIcon; label: string; onPress?: () => void; onToggle?: (value: boolean) => void; showDivider?: boolean; value?: boolean; valueLabel?: string };

export function SettingsRow({ disabled, Icon, label, onPress, onToggle, showDivider = true, value, valueLabel }: Props) {
  const content = <View className={`min-h-[62px] flex-row items-center px-4 py-3 ${showDivider ? 'border-b border-white/10' : ''} ${disabled ? 'opacity-50' : ''}`}><View className="h-9 w-9 items-center justify-center rounded-[9px] border border-white/10 bg-white/[0.07]"><Icon color={colors.textSecondary} size={19} /></View><Text className="ml-3 flex-1 font-inter text-[15px] text-ora-primary">{label}</Text>{typeof value === 'boolean' && onToggle ? <Switch accessibilityLabel={label} accessibilityState={{ checked: value }} onValueChange={onToggle} thumbColor={value ? colors.textPrimary : colors.textSecondary} trackColor={{ false: colors.divider, true: colors.gold }} value={value} /> : <><Text className="mr-2 font-inter text-sm text-ora-secondary">{valueLabel}</Text>{onPress ? <ChevronRight color={colors.textSecondary} size={18} /> : null}</>}</View>;
  return onPress && !disabled ? <PremiumPressable accessibilityLabel={label} onPress={onPress}>{content}</PremiumPressable> : content;
}
