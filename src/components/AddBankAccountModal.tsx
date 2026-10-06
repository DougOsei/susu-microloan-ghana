import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/theme';
import { GHANA_BANKS } from '../constants/ghana';
import { BankAccount } from '../types';

interface AddBankAccountModalProps {
  visible: boolean;
  defaultHolderName: string;
  onClose: () => void;
  onBankAccountAdded: (bankAccount: BankAccount) => void;
}

export const AddBankAccountModal: React.FC<AddBankAccountModalProps> = ({
  visible,
  defaultHolderName,
  onClose,
  onBankAccountAdded,
}) => {
  const [selectedBank, setSelectedBank] = useState(GHANA_BANKS[0]);
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState(defaultHolderName);
  const [branch, setBranch] = useState('Accra Main');
  const [isPrimary, setIsPrimary] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleLinkBank = () => {
    if (!accountNumber.trim() || accountNumber.trim().length < 8) {
      Alert.alert('Invalid Account Number', 'Please enter a valid Ghana bank account number (at least 8-16 digits).');
      return;
    }

    if (!accountHolder.trim()) {
      Alert.alert('Holder Name Required', 'Please enter the legal name on this bank account.');
      return;
    }

    setIsVerifying(true);

    // Simulate GhIPSS bank clearing verification
    setTimeout(() => {
      setIsVerifying(false);

      const newAccount: BankAccount = {
        id: `bnk_${Date.now()}`,
        bankName: selectedBank.name,
        accountNumber: accountNumber.trim(),
        accountHolder: accountHolder.trim(),
        isPrimary: isPrimary,
        branch: branch.trim() || 'Head Office',
        dateAdded: 'Today',
      };

      onBankAccountAdded(newAccount);
      Alert.alert(
        'Bank Account Linked! 🇬🇭',
        `Your ${selectedBank.name} account (${accountNumber.slice(-4)}) has been verified via GhIPSS Instant Pay (GIP).`
      );
      setAccountNumber('');
      onClose();
    }, 1500);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Register Ghana Bank Account</Text>
              <Text style={styles.subtitle}>Verified via GhIPSS Instant Pay (GIP) Interbank</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* Select Bank */}
            <Text style={styles.label}>Select Licensed Commercial Bank</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bankScroll}>
              {GHANA_BANKS.map((b) => {
                const isSelected = selectedBank.id === b.id;
                return (
                  <TouchableOpacity
                    key={b.id}
                    style={[styles.bankCard, isSelected && styles.activeBankCard]}
                    onPress={() => setSelectedBank(b)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.bankIconCircle}>
                      <Ionicons name="business" size={18} color={isSelected ? COLORS.primary : COLORS.textSecondary} />
                    </View>
                    <Text style={[styles.bankName, isSelected && styles.activeBankName]}>{b.name}</Text>
                    <Text style={styles.sortCode}>Sort: {b.sortCode}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Account Number */}
            <Text style={styles.label}>Account Number</Text>
            <TextInput
              style={styles.input}
              value={accountNumber}
              onChangeText={setAccountNumber}
              keyboardType="number-pad"
              maxLength={16}
              placeholder="e.g. 1441002938491"
              placeholderTextColor={COLORS.textMuted}
            />

            {/* Account Holder Name */}
            <Text style={styles.label}>Account Holder Full Name (as on bank ID)</Text>
            <TextInput
              style={styles.input}
              value={accountHolder}
              onChangeText={setAccountHolder}
              placeholder="e.g. Kwame Asante Mensah"
              placeholderTextColor={COLORS.textMuted}
            />

            {/* Branch */}
            <Text style={styles.label}>Branch / Region</Text>
            <TextInput
              style={styles.input}
              value={branch}
              onChangeText={setBranch}
              placeholder="e.g. Accra Main, Kumasi Adum, Tema"
              placeholderTextColor={COLORS.textMuted}
            />

            {/* Primary Toggle */}
            <TouchableOpacity
              style={styles.primaryToggleRow}
              onPress={() => setIsPrimary(!isPrimary)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isPrimary ? 'checkbox' : 'square-outline'}
                size={22}
                color={isPrimary ? COLORS.primary : COLORS.textMuted}
              />
              <Text style={styles.primaryToggleText}>
                Set as primary account for instant cashouts & loan disbursement
              </Text>
            </TouchableOpacity>

            {/* Security Notice */}
            <View style={styles.securityBox}>
              <Ionicons name="shield-checkmark" size={16} color={COLORS.primary} />
              <Text style={styles.securityText}>
                Bank account details are tokenized and cleared securely through Bank of Ghana GhIPSS ISO 20022 protocols.
              </Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitBtn, isVerifying && { opacity: 0.7 }]}
              onPress={handleLinkBank}
              disabled={isVerifying}
              activeOpacity={0.85}
            >
              {isVerifying ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.submitBtnText}>Verifying with {selectedBank.code} / GhIPSS...</Text>
                </View>
              ) : (
                <Text style={styles.submitBtnText}>Verify & Link {selectedBank.name}</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
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
    maxHeight: '90%',
    paddingBottom: 24,
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
  scrollBody: {
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
    marginTop: 10,
  },
  bankScroll: {
    marginBottom: 8,
  },
  bankCard: {
    width: 140,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    marginRight: 10,
  },
  activeBankCard: {
    borderColor: COLORS.primary,
    backgroundColor: '#F0FDF4',
    borderWidth: 2,
  },
  bankIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  bankName: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    height: 32,
  },
  activeBankName: {
    color: COLORS.primaryDark,
  },
  sortCode: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
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
  primaryToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
    marginBottom: 8,
  },
  primaryToggleText: {
    fontSize: 12,
    color: COLORS.textPrimary,
    flex: 1,
  },
  securityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 10,
    marginVertical: 14,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  securityText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 15,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    ...SHADOWS.md,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
