import { useRef, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { normalizeLocalPhone } from '@/features/auth/api/auth-api';
import { GlassSurface } from '@/components/ui/GlassSurface';

type PhoneInputProps = {
  error?: boolean;
  onChange: (value: string) => void;
  onSubmitEditing?: () => void;
  value: string;
};

export function PhoneInput({ error, onChange, onSubmitEditing, value }: PhoneInputProps) {
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);
  const highlighted = focused || value.length > 0;

  return (
    <View>
      <Text className="mb-[8px] font-inter-medium text-xs text-ora-secondary">NUMĂR DE TELEFON</Text>
      <Pressable
        accessibilityRole="none"
        className="h-[54px]"
        onPress={() => inputRef.current?.focus()}>
        <GlassSurface radius={16} borderColor={error ? '#E08C7D' : highlighted ? '#C9A24B' : 'rgba(156,116,55,0.50)'}>
        <View className="h-[54px] flex-row items-center">
        <View className={`h-[24px] w-[68px] items-center justify-center border-r ${highlighted ? 'border-ora-gold' : 'border-[#9C7437]/50'}`}>
          <Text className="font-inter text-base text-[#D9A441]">+373</Text>
        </View>
        <TextInput
          ref={inputRef}
          accessibilityLabel="Numar de telefon"
          className="h-full flex-1 px-[12px] font-inter text-base text-ora-primary"
          enterKeyHint="next"
          keyboardType="number-pad"
          maxLength={16}
          autoComplete="tel-national"
          onBlur={() => setFocused(false)}
          onChangeText={(text) => onChange(normalizeLocalPhone(text))}
          onFocus={() => setFocused(true)}
          onSubmitEditing={onSubmitEditing}
          placeholder="60 000 000"
          placeholderTextColor="#77777B"
          returnKeyType="next"
          value={value}
        />
        </View>
        </GlassSurface>
      </Pressable>
    </View>
  );
}
