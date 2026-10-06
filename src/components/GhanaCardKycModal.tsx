import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { UserProfile } from '../types';

interface GhanaCardKycModalProps {
  visible: boolean;
  user: UserProfile;
  onClose: () => void;
  onKycVerified: (updatedUser: UserProfile) => void;
}

export const GhanaCardKycModal: React.FC<GhanaCardKycModalProps> = ({
  visible,
  user,
  onClose,
  onKycVerified,
}) => {
  const [ghanaCard, setGhanaCard] = useState(user.ghanaCardNumber || 'GHA-724183921-9');
  const [fullName, setFullName] = useState(user.fullName);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = () => {
    // Validate Ghana Card pattern: GHA-XXXXXXXXX-X
    const regex = /^GHA-\d{9}-\d$/i;
    if (!regex.test(ghanaCard.trim())) {
      Alert.alert(
        'Invalid Ghana Card Format',
        'Ghana Card ID must follow standard format: GHA-XXXXXXXXX-X (e.g., GHA-724183921-9)'
      );
      return;
    }

    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);

      const updatedUser: UserProfile = {
        ...user,
        fullName: fullName.trim(),
        ghanaCardNumber: ghanaCard.trim().toUpperCase(),
        isGhanaCardVerified: true,
        kycLevel: 2,
        creditScore: Math.min(850, user.creditScore + 60),
        maxLoanLimit: 10000,
      };

      onKycVerified(updatedUser);
      Alert.alert(
        'Ghana Card Verified! 🇬🇭',
        'National Identification Authority (NIA) match confirmed. Your account is now Tier-2 verified with loan limit increased to GH₵ 10,000!'
      );
      onClose();
    }, 1600);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Ghana Card Verification (NIA)</Text>
              <Text style={styles.subtitle}>Bank of Ghana Tier-2 Compliance & Credit Unlock</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            {/* Visual Ghana Card Mockup */}
            <View style={styles.cardGraphic}>
              <View style={styles.cardGraphicHeader}>
                <Text style={styles.republicText}>REPUBLIC OF GHANA</Text>
                <Text style={styles.flagIcon}>🇬🇭</Text>
              </View>
              <Text style={styles.niaText}>NATIONAL IDENTITY CARD</Text>
              <View style={styles.cardGraphicBody}>
                <View style={styles.chipGraphic} />
                <View>
                  <Text style={styles.cardHolderLabel}>HOLDER NAME</Text>
                  <Text style={styles.cardHolderName}>{fullName || 'KWAME ASANTE MENSAH'}</Text>
                  <Text style={styles.cardHolderLabel}>CARD PIN NUMBER</Text>
                  <Text style={styles.cardHolderNumber}>{ghanaCard.toUpperCase()}</Text>
                </View>
              </View>
            </View>

            {/* Input field */}
            <Text style={styles.inputLabel}>Enter Ghana Card PIN (GHA-XXXXXXXXX-X)</Text>
            <TextInput
              style={styles.input}
              value={ghanaCard}
              onChangeText={setGhanaCard}
              placeholder="GHA-724183921-9"
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="characters"
            />

            <Text style={styles.inputLabel}>Full Legal Name (as on card)</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Kwame Asante Mensah"
              placeholderTextColor={COLORS.textMuted}
            />

            {/* Benefits */}
            <View style={styles.benefitsBox}>
              <Text style={styles.benefitsTitle}>Tier-2 Unlocked Benefits:</Text>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                <Text style={styles.benefitText}>Micro-credit limit elevated to GH₵ 10,000</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                <Text style={styles.benefitText}>Daily MoMo transaction limit up to GH₵ 20,000</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                <Text style={styles.benefitText}>SafeLock high-yield 14.5% interest unlocked</Text>
              </View>
            </View>

            {/* Action button */}
            <TouchableOpacity
              style={[styles.verifyBtn, isVerifying && { opacity: 0.7 }]}
              onPress={handleVerify}
              disabled={isVerifying}
              activeOpacity={0.85}
            >
              {isVerifying ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.verifyBtnText}>Validating with NIA Ghana Database...</Text>
                </View>
              ) : (
                <Text style={styles.verifyBtnText}>Verify via National ID (NIA)</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: COLORS.cardBg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: 28,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    paddingHorizontal: 22,
    paddingTop: 16,
  },
  cardGraphic: {
    backgroundColor: '#0F5132',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#D97706',
  },
  cardGraphicHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  republicText: {
    color: '#FEF3C7',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  flagIcon: {
    fontSize: 18,
  },
  niaText: {
    color: '#D1FAE5',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginTop: 2,
    marginBottom: 12,
  },
  cardGraphicBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  chipGraphic: {
    width: 36,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#F59E0B',
    borderWidth: 1,
    borderColor: '#B45309',
  },
  cardHolderLabel: {
    color: '#A7F3D0',
    fontSize: 8,
    fontWeight: '600',
  },
  cardHolderName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardHolderNumber: {
    color: '#FEF3C7',
    fontSize: 12,
    fontWeight: '800',
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.textPrimary,
    backgroundColor: '#F8FAFC',
  },
  benefitsBox: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 12,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  benefitsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginBottom: 6,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 2,
  },
  benefitText: {
    fontSize: 11,
    color: COLORS.textPrimary,
  },
  verifyBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  verifyBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
