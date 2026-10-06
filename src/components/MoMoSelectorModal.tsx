import React, { useState, useEffect } from 'react';
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
import { MOMO_PROVIDERS, GHANA_CURRENCY_SYMBOL } from '../constants/ghana';
import { MoMoNetwork, TransactionRecord } from '../types';

interface MoMoSelectorModalProps {
  visible: boolean;
  mode: 'deposit' | 'withdraw';
  currentBalance: number;
  onClose: () => void;
  onSuccess: (transaction: TransactionRecord, newBalance: number) => void;
}

export const MoMoSelectorModal: React.FC<MoMoSelectorModalProps> = ({
  visible,
  mode,
  currentBalance,
  onClose,
  onSuccess,
}) => {
  const [selectedNetwork, setSelectedNetwork] = useState<MoMoNetwork>('mtn');
  const [phone, setPhone] = useState('0244123456');
  const [amount, setAmount] = useState('100');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUssdPrompt, setShowUssdPrompt] = useState(false);
  const [momoPin, setMomoPin] = useState('');

  // Auto-detect network from Ghana phone prefix
  useEffect(() => {
    if (phone.length >= 3) {
      const prefix = phone.substring(0, 3);
      if (MOMO_PROVIDERS.mtn.prefixes.includes(prefix)) {
        setSelectedNetwork('mtn');
      } else if (MOMO_PROVIDERS.telecel.prefixes.includes(prefix)) {
        setSelectedNetwork('telecel');
      } else if (MOMO_PROVIDERS.at.prefixes.includes(prefix)) {
        setSelectedNetwork('at');
      }
    }
  }, [phone]);

  const numAmount = parseFloat(amount) || 0;
  const provider = MOMO_PROVIDERS[selectedNetwork];
  const fee = mode === 'withdraw' ? Number((numAmount * 0.01).toFixed(2)) : 0; // 1% cashout fee or 0 for deposit
  const totalDeduction = mode === 'withdraw' ? numAmount + fee : numAmount;

  const handleStartTransaction = () => {
    if (numAmount < 10) {
      Alert.alert('Invalid Amount', 'Minimum transaction is GH₵ 10.00');
      return;
    }

    if (phone.length < 10) {
      Alert.alert('Invalid Phone', 'Please enter a valid 10-digit Ghana phone number.');
      return;
    }

    if (mode === 'withdraw' && totalDeduction > currentBalance) {
      Alert.alert(
        'Insufficient Balance',
        `Your available balance is GH₵ ${currentBalance.toFixed(2)}, but this withdrawal requires GH₵ ${totalDeduction.toFixed(2)} (including 1% cashout fee).`
      );
      return;
    }

    // Trigger USSD prompt simulation
    setShowUssdPrompt(true);
  };

  const handleConfirmUssd = () => {
    if (momoPin.length < 4) {
      Alert.alert('Enter PIN', 'Please enter your 4-digit MoMo PIN to authorize.');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setShowUssdPrompt(false);
      setMomoPin('');

      const ref = `MOMO-GH-${Math.floor(100000 + Math.random() * 900000)}`;
      const newBalance = mode === 'deposit' ? currentBalance + numAmount : currentBalance - totalDeduction;

      const record: TransactionRecord = {
        id: `tx_${Date.now()}`,
        type: mode === 'deposit' ? 'momo_deposit' : 'momo_withdrawal',
        title: mode === 'deposit' ? `Deposit via ${provider.shortName}` : `Cashout to ${provider.shortName}`,
        description: `${mode === 'deposit' ? 'Credited from' : 'Sent to'} ${phone}`,
        amount: numAmount,
        currency: 'GH₵',
        date: 'Just now',
        status: 'completed',
        network: selectedNetwork,
        reference: ref,
        fee: fee,
      };

      onSuccess(record, newBalance);
      onClose();
    }, 1500);
  };

  const quickAmounts = [50, 100, 200, 500, 1000];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>
                {mode === 'deposit' ? 'Deposit via Mobile Money' : 'Cashout to Mobile Money'}
              </Text>
              <Text style={styles.modalSubtitle}>
                {mode === 'deposit' ? 'Instant top-up to your QuickSave wallet' : 'Withdraw funds directly to your Ghana MoMo wallet'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* Network Selector */}
            <Text style={styles.sectionLabel}>Select Mobile Money Network</Text>
            <View style={styles.networksRow}>
              {(['mtn', 'telecel', 'at'] as MoMoNetwork[]).map((net) => {
                const prov = MOMO_PROVIDERS[net];
                const isSelected = selectedNetwork === net;
                return (
                  <TouchableOpacity
                    key={net}
                    style={[
                      styles.networkBox,
                      isSelected && { borderColor: prov.badgeColor, backgroundColor: '#F8FAFC', borderWidth: 2 },
                    ]}
                    onPress={() => setSelectedNetwork(net)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.networkDot, { backgroundColor: prov.badgeColor }]} />
                    <Text style={styles.networkName}>{prov.shortName}</Text>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} style={styles.checkIcon} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Phone Number Input */}
            <Text style={styles.sectionLabel}>MoMo Registered Phone Number</Text>
            <View style={styles.phoneInputRow}>
              <View style={styles.flagPrefix}>
                <Text style={styles.flagText}>🇬🇭 +233</Text>
              </View>
              <TextInput
                style={styles.textInput}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                placeholder="e.g. 0244123456"
                placeholderTextColor={COLORS.textMuted}
                maxLength={10}
              />
            </View>
            <Text style={styles.helperText}>
              Carrier detected: <Text style={{ fontWeight: '700', color: provider.badgeColor }}>{provider.name}</Text>
            </Text>

            {/* Amount Input */}
            <Text style={[styles.sectionLabel, { marginTop: 18 }]}>Amount ({GHANA_CURRENCY_SYMBOL})</Text>
            <View style={styles.amountInputRow}>
              <Text style={styles.amountPrefix}>{GHANA_CURRENCY_SYMBOL}</Text>
              <TextInput
                style={styles.amountInput}
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            {/* Quick Amount Chips */}
            <View style={styles.chipsRow}>
              {quickAmounts.map((q) => (
                <TouchableOpacity
                  key={q}
                  style={[styles.chip, numAmount === q && styles.activeChip]}
                  onPress={() => setAmount(q.toString())}
                >
                  <Text style={[styles.chipText, numAmount === q && styles.activeChipText]}>+{q}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Breakdown Card */}
            <View style={styles.breakdownCard}>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Transaction Amount</Text>
                <Text style={styles.breakdownValue}>GH₵ {numAmount.toFixed(2)}</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>{mode === 'withdraw' ? 'Cashout Fee (1%)' : 'Processing Fee'}</Text>
                <Text style={styles.breakdownValue}>{fee > 0 ? `GH₵ ${fee.toFixed(2)}` : 'FREE'}</Text>
              </View>
              <View style={[styles.breakdownRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>
                  {mode === 'deposit' ? 'Total to Pay on Phone' : 'Total Deduction from Wallet'}
                </Text>
                <Text style={styles.totalValue}>GH₵ {totalDeduction.toFixed(2)}</Text>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: provider.badgeColor === '#FFCC00' ? '#E5B800' : provider.badgeColor }]}
              onPress={handleStartTransaction}
              activeOpacity={0.85}
            >
              <Text style={[styles.submitBtnText, { color: provider.badgeColor === '#FFCC00' ? '#1A1A1A' : '#FFFFFF' }]}>
                {mode === 'deposit' ? `Deposit GH₵ ${numAmount.toFixed(2)} via ${provider.shortName}` : `Cashout GH₵ ${numAmount.toFixed(2)} to ${provider.shortName}`}
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Ghanaian USSD Prompt Simulator Modal */}
          {showUssdPrompt && (
            <View style={styles.ussdOverlay}>
              <View style={styles.ussdBox}>
                <View style={[styles.ussdHeader, { backgroundColor: provider.badgeColor }]}>
                  <Text style={[styles.ussdHeaderTitle, { color: provider.textColor }]}>{provider.name} USSD Push</Text>
                </View>
                <View style={styles.ussdBody}>
                  <Text style={styles.ussdPromptText}>
                    Authorize {mode === 'deposit' ? 'DEPOSIT of' : 'CASHOUT of'} GH₵ {numAmount.toFixed(2)} to QuickSave Microfinance?
                  </Text>
                  <Text style={styles.ussdSubText}>Reference: {provider.shortName}-QS-{Math.floor(1000 + Math.random() * 9000)}</Text>
                  
                  <Text style={styles.ussdPinLabel}>Enter your 4-digit MoMo PIN:</Text>
                  <TextInput
                    style={styles.ussdPinInput}
                    secureTextEntry
                    keyboardType="number-pad"
                    maxLength={4}
                    value={momoPin}
                    onChangeText={setMomoPin}
                    placeholder="••••"
                    placeholderTextColor="#94A3B8"
                    autoFocus
                  />

                  {isProcessing ? (
                    <View style={styles.loadingBox}>
                      <ActivityIndicator size="small" color={COLORS.primary} />
                      <Text style={styles.processingText}>Contacting {provider.shortName} gateway...</Text>
                    </View>
                  ) : (
                    <View style={styles.ussdActionRow}>
                      <TouchableOpacity
                        style={styles.ussdCancelBtn}
                        onPress={() => setShowUssdPrompt(false)}
                      >
                        <Text style={styles.ussdCancelText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.ussdConfirmBtn, { backgroundColor: COLORS.primary }]}
                        onPress={handleConfirmUssd}
                      >
                        <Text style={styles.ussdConfirmText}>Approve (Send)</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            </View>
          )}
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
    maxHeight: '92%',
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  modalSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
    maxWidth: 280,
  },
  closeBtn: {
    padding: 4,
  },
  scrollBody: {
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 20,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  networksRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  networkBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  networkDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginBottom: 6,
  },
  networkName: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  checkIcon: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  phoneInputRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    overflow: 'hidden',
  },
  flagPrefix: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  flagText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  helperText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F0FDF4',
  },
  amountPrefix: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeChip: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  activeChipText: {
    color: COLORS.primary,
  },
  breakdownCard: {
    backgroundColor: COLORS.background,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  breakdownLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  breakdownValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginTop: 8,
    paddingTop: 8,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  totalValue: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
  },
  submitBtn: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  ussdOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  ussdBox: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    ...SHADOWS.lg,
  },
  ussdHeader: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  ussdHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  ussdBody: {
    padding: 20,
  },
  ussdPromptText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    lineHeight: 22,
    textAlign: 'center',
  },
  ussdSubText: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 16,
  },
  ussdPinLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 6,
    textAlign: 'center',
  },
  ussdPinInput: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 10,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 10,
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  loadingBox: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  processingText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  ussdActionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  ussdCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  ussdCancelText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  ussdConfirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  ussdConfirmText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
