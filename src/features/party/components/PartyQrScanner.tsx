import { type BarcodeScanningResult, CameraView, useCameraPermissions } from 'expo-camera';
import { Camera, Keyboard, Settings } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Linking, StyleSheet, Text, View } from 'react-native';

import { GlassSurface } from '@/components/ui/GlassSurface';
import { PremiumPressable } from '@/components/ui/PremiumPressable';
import { parsePartyJoinPayload } from '@/features/party/utils';
import { colors } from '@/theme/tokens';

type PartyQrScannerProps = {
  busy: boolean;
  errorMessage?: string | null;
  onCodeScanned: (code: string) => Promise<void>;
  onManualEntry: () => void;
};

export function PartyQrScanner({ busy, errorMessage, onCodeScanned, onManualEntry }: PartyQrScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [requestingPermission, setRequestingPermission] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanLocked, setScanLocked] = useState(false);
  const [previewWidth, setPreviewWidth] = useState(320);
  const scanLock = useRef(false);

  const askForPermission = async () => {
    if (requestingPermission) return;
    setRequestingPermission(true);
    await requestPermission().catch(() => undefined);
    setRequestingPermission(false);
  };

  useEffect(() => {
    if (permission?.status !== 'undetermined') return;
    requestPermission().catch(() => undefined);
    // The status change prevents repeated permission prompts.
  }, [permission?.status, requestPermission]);

  const handleBarcodeScanned = async ({ data }: BarcodeScanningResult) => {
    if (scanLock.current || busy) return;
    if (__DEV__) console.debug('[party-join] QR payload', { payload: data });
    const code = parsePartyJoinPayload(data);
    if (!code) {
      setScanError('Acest QR nu conține un cod de sesiune ORA valid.');
      return;
    }
    scanLock.current = true;
    setScanLocked(true);
    setScanError(null);
    if (__DEV__) console.debug('[party-join] parsed code', { code });
    try {
      await onCodeScanned(code);
    } catch {
      setTimeout(() => {
        scanLock.current = false;
        setScanLocked(false);
      }, 850);
    }
  };

  if (!permission) {
    return (
      <View className="h-[360px] items-center justify-center">
        <ActivityIndicator color={colors.brandGradientEnd} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <GlassSurface
        radius={26}
        intensity={20}
        fillColor="rgba(255,255,255,0.055)"
        borderColor="rgba(226,158,62,0.34)">
        <View className="items-center px-7 py-9">
          <View className="h-16 w-16 items-center justify-center rounded-[19px] bg-ora-gold/15">
            <Camera color={colors.brandGradientEnd} size={30} />
          </View>
          <Text className="mt-5 text-center font-inter-semibold text-xl text-ora-primary">Acces la cameră</Text>
          <Text className="mt-2 text-center font-inter text-sm leading-5 text-ora-secondary">
            ORA folosește camera doar pentru a scana codul QR al sesiunii.
          </Text>
          <PremiumPressable
            accessibilityLabel={permission.canAskAgain ? 'Permite accesul la cameră' : 'Deschide setările camerei'}
            className="mt-6 w-full"
            onPress={permission.canAskAgain ? askForPermission : () => Linking.openSettings()}>
            <View className="h-12 flex-row items-center justify-center rounded-[14px] bg-ora-gold">
              {requestingPermission ? <ActivityIndicator color={colors.iconBackground} size="small" /> : (
                <Settings color={colors.iconBackground} size={19} />
              )}
              <Text className="ml-2 font-inter-semibold text-sm text-ora-dark">
                {permission.canAskAgain ? 'Permite camera' : 'Deschide setările'}
              </Text>
            </View>
          </PremiumPressable>
          <ManualEntryButton onPress={onManualEntry} />
        </View>
      </GlassSurface>
    );
  }

  const previewHeight = Math.max(340, Math.min(460, previewWidth * 1.16));
  const scanFrameSize = Math.max(190, Math.min(252, previewWidth * 0.62));

  return (
    <View>
      <View
        className="overflow-hidden rounded-[28px] border border-ora-gold/45"
        onLayout={(event) => setPreviewWidth(event.nativeEvent.layout.width)}
        style={{ height: previewHeight }}>
        <CameraView
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          facing="back"
          onBarcodeScanned={busy || scanLocked ? undefined : handleBarcodeScanned}
          style={StyleSheet.absoluteFill}
        />
        <View className="flex-1 items-center justify-center px-5 py-6" pointerEvents="none">
          <View className="rounded-[25px] border-2 border-ora-gold" style={{ height: scanFrameSize, width: scanFrameSize }} />
          <View className="mt-5 w-full max-w-[290px] rounded-2xl bg-black/60 px-4 py-3">
            {busy ? (
              <View className="flex-row items-center justify-center">
                <ActivityIndicator color={colors.brandGradientEnd} size="small" />
                <Text className="ml-2 text-center font-inter-medium text-sm text-white">Se conectează sesiunea...</Text>
              </View>
            ) : (
              <Text className="text-center font-inter-medium text-sm text-white">Aliniază codul QR în interiorul chenarului</Text>
            )}
          </View>
        </View>
      </View>
      {scanError || errorMessage ? (
        <Text className="mt-3 text-center font-inter text-sm text-ora-error">{scanError ?? errorMessage}</Text>
      ) : null}
      <ManualEntryButton onPress={onManualEntry} />
    </View>
  );
}

function ManualEntryButton({ onPress }: { onPress: () => void }) {
  return (
    <PremiumPressable accessibilityLabel="Introdu codul sesiunii manual" className="mt-4 w-full" onPress={onPress}>
      <View className="h-12 flex-row items-center justify-center rounded-[14px] border border-ora-gold/65 bg-black/20">
        <Keyboard color={colors.brandGradientEnd} size={19} />
        <Text className="ml-2 font-inter-medium text-sm text-ora-primary">Introdu codul manual</Text>
      </View>
    </PremiumPressable>
  );
}
