import { useRef, useState } from 'react';
import { Platform, Pressable, Text, TextInput, View } from 'react-native';
import { GlassSurface } from '@/components/ui/GlassSurface';

type PinInputProps = {
  error?: boolean;
  compact?: boolean;
  onForgot?: () => void;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  value: string;
};

export function PinInput({ error, compact = false, onForgot, onChange, onSubmit, value }: PinInputProps) {
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);

  const handleChange = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 4);
    onChange(digits);
  };

  if (compact) return (
    <View>
      <Text className="mb-[8px] font-inter-medium text-xs text-ora-secondary">COD PIN</Text>
      <GlassSurface radius={16} borderColor={error ? '#E08C7D' : focused ? '#C9A24B' : 'rgba(156,116,55,0.50)'}>
      <View className="h-[54px] flex-row items-center">
        <Pressable accessibilityRole="none" className="h-full flex-1 justify-center px-[16px]" onPress={() => inputRef.current?.focus()}>
          <View className="flex-row gap-[16px]" style={{ pointerEvents: 'none' }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            {[0, 1, 2, 3].map(index => <View key={index} className={`h-[14px] w-[14px] rounded-full border ${index < value.length ? 'border-[#D9A441] bg-[#E5A43D]' : 'border-[#89734B]/60 bg-[#514B3F]'}`} />)}
          </View>
          <TextInput
            ref={inputRef}
            accessibilityLabel="Cod PIN, 4 cifre"
            caretHidden
            contextMenuHidden
            keyboardType={Platform.OS === 'web' ? 'numeric' : 'number-pad'}
            maxLength={4}
            onBlur={() => setFocused(false)}
            onChangeText={handleChange}
            onFocus={() => setFocused(true)}
            onSubmitEditing={onSubmit}
            returnKeyType="done"
            secureTextEntry
            style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, color: 'transparent', opacity: 0.02 }}
            value={value}
          />
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Ai uitat codul PIN?" className="min-h-[44px] justify-center px-[16px]" onPress={onForgot}>
          <Text className="font-inter text-[13px] text-[#D9A441]">Ai uitat codul?</Text>
        </Pressable>
      </View>
      </GlassSurface>
    </View>
  );

  return (
    <View>
      <Text className="mb-2 font-inter text-base text-ora-secondary">PIN</Text>
      <Pressable
        accessibilityLabel="PIN din 4 cifre"
        accessibilityRole="none"
        onPress={() => inputRef.current?.focus()}>
        <View className="flex-row gap-3">
          {[0, 1, 2, 3].map((index) => {
            const filled = index < value.length;
            const active = focused && index === Math.min(value.length, 3);
            return (
              <View
                className={`h-16 flex-1 items-center justify-center rounded-xl border bg-ora-surface ${
                  error ? 'border-ora-error' : active || (value.length === 4 && filled) ? 'border-ora-gold' : 'border-ora-dark'
                }`}
                key={index}>
                {filled && <View className="h-4 w-4 rounded-full bg-ora-primary" />}
              </View>
            );
          })}
        </View>
        <TextInput
          ref={inputRef}
          accessibilityElementsHidden
          caretHidden
          className="absolute inset-0 opacity-0"
          contextMenuHidden={false}
          keyboardType={Platform.OS === 'web' ? 'numeric' : 'number-pad'}
          maxLength={4}
          onBlur={() => setFocused(false)}
          onChangeText={handleChange}
          onFocus={() => setFocused(true)}
          onSubmitEditing={onSubmit}
          returnKeyType="done"
          secureTextEntry
          value={value}
        />
      </Pressable>
    </View>
  );
}
