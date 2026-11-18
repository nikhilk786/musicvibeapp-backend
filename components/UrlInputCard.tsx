import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Clipboard, Check, Sparkles, ArrowRight, X } from 'lucide-react-native';
import { THEME } from '../constants/theme';
import { pasteFromClipboard, triggerLightHaptic, triggerSelectionHaptic } from '../services/deviceUtils';

interface UrlInputCardProps {
  url: string;
  onUrlChange: (newUrl: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export const UrlInputCard: React.FC<UrlInputCardProps> = ({
  url,
  onUrlChange,
  onSubmit,
  isLoading,
}) => {
  const [justPasted, setJustPasted] = useState(false);

  const handlePaste = async () => {
    triggerSelectionHaptic();
    const clipText = await pasteFromClipboard();
    if (clipText) {
      onUrlChange(clipText);
      setJustPasted(true);
      setTimeout(() => setJustPasted(false), 2000);
    }
  };

  const handleInsertDemo = () => {
    triggerLightHaptic();
    onUrlChange('https://soundcloud.com/demo/emerald-resonance-320kbps');
  };

  const handleClear = () => {
    triggerLightHaptic();
    onUrlChange('');
  };

  const isButtonDisabled = !url.trim() || isLoading;

  return (
    <View style={styles.card}>
      {/* Input container */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Paste link here..."
          placeholderTextColor={THEME.colors.textSubtle}
          value={url}
          onChangeText={onUrlChange}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          returnKeyType="go"
          onSubmitEditing={onSubmit}
        />

        <View style={styles.inputActions}>
          {url.length > 0 && (
            <TouchableOpacity
              onPress={handleClear}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.actionIconBtn}
            >
              <X size={15} color={THEME.colors.textMuted} />
            </TouchableOpacity>
          )}

          {/* 1-Tap Paste Button */}
          <TouchableOpacity
            style={[styles.pasteBtn, justPasted && styles.pasteBtnSuccess]}
            onPress={handlePaste}
            activeOpacity={0.7}
          >
            {justPasted ? (
              <>
                <Check size={12} color={THEME.colors.primary} />
                <Text style={styles.pasteBtnTextSuccess}>Pasted</Text>
              </>
            ) : (
              <>
                <Clipboard size={12} color={THEME.colors.textMuted} />
                <Text style={styles.pasteBtnText}>Paste</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Helper Bar: Demo URL trigger */}
      <View style={styles.helperRow}>
        <TouchableOpacity
          onPress={handleInsertDemo}
          style={styles.demoLink}
          activeOpacity={0.7}
        >
          <Sparkles size={11} color={THEME.colors.textSubtle} />
          <Text style={styles.demoLinkText}>Try Demo Track</Text>
        </TouchableOpacity>
      </View>

      {/* Main Extract / Download Button */}
      <TouchableOpacity
        onPress={onSubmit}
        disabled={isButtonDisabled}
        activeOpacity={0.85}
        style={[styles.submitButtonWrapper, isButtonDisabled && !isLoading && styles.disabledWrapper]}
      >
        <LinearGradient
          colors={
            isLoading
              ? ['#14281a', '#1e3825']
              : !url.trim()
              ? ['#191e19', '#191e19']
              : THEME.gradients.primaryButton
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientButton}
        >
          {isLoading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={THEME.colors.primary} />
              <Text style={styles.loadingText}>Extracting Audio...</Text>
            </View>
          ) : (
            <View style={styles.buttonContent}>
              <Text
                style={[
                  styles.buttonText,
                  isButtonDisabled && styles.disabledButtonText,
                ]}
              >
                Extract Audio
              </Text>
              <ArrowRight
                size={16}
                color={isButtonDisabled ? THEME.colors.textSubtle : '#0c0e0c'}
                strokeWidth={2.5}
              />
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginHorizontal: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    paddingHorizontal: 12,
    minHeight: 46,
  },
  textInput: {
    flex: 1,
    color: THEME.colors.text,
    fontSize: 13,
    paddingVertical: 10,
  },
  inputActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionIconBtn: {
    padding: 4,
  },
  pasteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: THEME.colors.surfaceSubtle,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  pasteBtnSuccess: {
    borderColor: 'rgba(16, 185, 129, 0.4)',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  pasteBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.colors.textMuted,
  },
  pasteBtnTextSuccess: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.colors.primary,
  },
  helperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 8,
    marginBottom: 12,
  },
  demoLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  demoLinkText: {
    fontSize: 11,
    color: THEME.colors.textSubtle,
    fontWeight: '500',
  },
  submitButtonWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  disabledWrapper: {
    opacity: 0.6,
  },
  gradientButton: {
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#0c0e0c',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  disabledButtonText: {
    color: THEME.colors.textSubtle,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    color: THEME.colors.primary,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});
