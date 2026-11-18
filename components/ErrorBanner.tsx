import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AlertCircle, RotateCcw } from 'lucide-react-native';
import { THEME } from '../constants/theme';

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, onRetry }) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconCol}>
        <AlertCircle size={20} color={THEME.colors.error} />
      </View>
      <View style={styles.textCol}>
        <Text style={styles.title}>Extraction Failed</Text>
        <Text style={styles.message}>{message}</Text>
        {onRetry && (
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={onRetry}
            activeOpacity={0.7}
          >
            <RotateCcw size={12} color={THEME.colors.text} />
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.errorSurface,
    borderRadius: THEME.radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(248, 113, 113, 0.3)',
    marginHorizontal: 16,
    marginTop: 16,
    gap: 12,
  },
  iconCol: {
    marginTop: 2,
  },
  textCol: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.error,
    marginBottom: 2,
  },
  message: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    lineHeight: 17,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: THEME.radius.md,
  },
  retryText: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.colors.text,
  },
});
