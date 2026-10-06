import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { UserProfile } from '../types';

interface HeaderProps {
  user: UserProfile;
  onPressProfile: () => void;
  onPressKyc: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onPressProfile, onPressKyc }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.userSection} onPress={onPressProfile} activeOpacity={0.8}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user.fullName
              .split(' ')
              .map((n) => n[0])
              .slice(0, 2)
              .join('')}
          </Text>
        </View>
        <View style={styles.greetingContainer}>
          <View style={styles.countryRow}>
            <Text style={styles.flag}>🇬🇭</Text>
            <Text style={styles.greetingText}>Akwaaba, {user.fullName.split(' ')[0]}</Text>
          </View>
          <TouchableOpacity onPress={onPressKyc} style={styles.kycBadge} activeOpacity={0.7}>
            <Ionicons
              name={user.isGhanaCardVerified ? 'shield-checkmark' : 'shield-outline'}
              size={12}
              color={user.isGhanaCardVerified ? COLORS.success : COLORS.warning}
            />
            <Text style={[styles.kycText, { color: user.isGhanaCardVerified ? COLORS.success : COLORS.warning }]}>
              {user.isGhanaCardVerified ? 'Ghana Card Verified (Tier 2)' : 'Verify Ghana Card'}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      <View style={styles.actionSection}>
        <TouchableOpacity style={styles.iconButton} onPress={onPressProfile} activeOpacity={0.7}>
          <Ionicons name="notifications-outline" size={22} color={COLORS.textPrimary} />
          <View style={styles.notificationDot} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: COLORS.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  greetingContainer: {
    justifyContent: 'center',
  },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  flag: {
    fontSize: 16,
  },
  greetingText: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  kycBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  kycText: {
    fontSize: 11,
    fontWeight: '600',
  },
  actionSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.danger,
  },
});
