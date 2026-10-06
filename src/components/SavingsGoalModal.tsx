import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { SavingsProduct, SavingsType, TransactionRecord } from '../types';

interface SavingsGoalModalProps {
  visible: boolean;
  walletBalance: number;
  onClose: () => void;
  onGoalCreated: (goal: SavingsProduct, tx: TransactionRecord) => void;
}

export const SavingsGoalModal: React.FC<SavingsGoalModalProps> = ({
  visible,
  walletBalance,
  onClose,
  onGoalCreated,
}) => {
  const [savingsType, setSavingsType] = useState<SavingsType>('susu');
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('2000');
  const [initialDeposit, setInitialDeposit] = useState('100');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [lockDays, setLockDays] = useState(90);

  const interestRate = savingsType === 'vault' ? 14.5 : savingsType === 'susu' ? 12.0 : 8.5;
  const numInitial = parseFloat(initialDeposit) || 0;
  const numTarget = parseFloat(targetAmount) || 0;

  const handleCreate = () => {
    if (!title.trim()) {
      Alert.alert('Title Required', 'Please enter a name for your savings goal (e.g. Market Inventory, Rent, School Fees).');
      return;
    }

    if (numTarget <= 0) {
      Alert.alert('Invalid Target', 'Please enter a target amount in GH₵.');
      return;
    }

    if (numInitial > walletBalance) {
      Alert.alert(
        'Insufficient Wallet Balance',
        `Your wallet has GH₵ ${walletBalance.toFixed(2)}, but you selected GH₵ ${numInitial.toFixed(2)} initial deposit.`
      );
      return;
    }

    const goalId = `sav_${Date.now()}`;
    const newGoal: SavingsProduct = {
      id: goalId,
      title: title.trim(),
      type: savingsType,
      description:
        savingsType === 'vault'
          ? `Locked ${lockDays}-day fixed deposit at ${interestRate}% annual interest`
          : `${frequency.toUpperCase()} Susu savings target at ${interestRate}% p.a.`,
      interestRateAnnual: interestRate,
      targetAmount: numTarget,
      currentAmount: numInitial,
      frequency: frequency,
      startDate: 'Today',
      isLocked: savingsType === 'vault',
      lockPeriodDays: savingsType === 'vault' ? lockDays : undefined,
    };

    const tx: TransactionRecord = {
      id: `tx_${Date.now()}`,
      type: 'savings_deposit',
      title: `Started Savings: ${title}`,
      description: `Initial funding from wallet into ${savingsType.toUpperCase()}`,
      amount: numInitial,
      currency: 'GH₵',
      date: 'Just now',
      status: 'completed',
      reference: `SUSU-GH-${Math.floor(100000 + Math.random() * 900000)}`,
    };

    onGoalCreated(newGoal, tx);
    Alert.alert('Savings Plan Created!', `You have started "${title}". Keep up your savings to boost your MoMo loan credit limit!`);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>Create Savings Plan</Text>
              <Text style={styles.modalSubtitle}>Automated Susu & High-Yield Ghana Cedi Vault</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* Category tabs */}
            <Text style={styles.sectionLabel}>Savings Product</Text>
            <View style={styles.tabRow}>
              <TouchableOpacity
                style={[styles.typeTab, savingsType === 'susu' && styles.activeTypeTab]}
                onPress={() => setSavingsType('susu')}
              >
                <Ionicons name="calendar-outline" size={16} color={savingsType === 'susu' ? COLORS.primary : COLORS.textSecondary} />
                <Text style={[styles.typeTabText, savingsType === 'susu' && styles.activeTypeTabText]}>
                  Susu (12.0%)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.typeTab, savingsType === 'vault' && styles.activeTypeTab]}
                onPress={() => setSavingsType('vault')}
              >
                <Ionicons name="lock-closed-outline" size={16} color={savingsType === 'vault' ? COLORS.primary : COLORS.textSecondary} />
                <Text style={[styles.typeTabText, savingsType === 'vault' && styles.activeTypeTabText]}>
                  SafeLock (14.5%)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.typeTab, savingsType === 'emergency' && styles.activeTypeTab]}
                onPress={() => setSavingsType('emergency')}
              >
                <Ionicons name="shield-outline" size={16} color={savingsType === 'emergency' ? COLORS.primary : COLORS.textSecondary} />
                <Text style={[styles.typeTabText, savingsType === 'emergency' && styles.activeTypeTabText]}>
                  Emergency (8.5%)
                </Text>
              </TouchableOpacity>
            </View>

            {/* Title */}
            <Text style={styles.sectionLabel}>Goal Name</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Makola Market Stock, Rent 2027, School Fees"
              placeholderTextColor={COLORS.textMuted}
            />

            {/* Target Amount */}
            <Text style={[styles.sectionLabel, { marginTop: 14 }]}>Target Amount (GH₵)</Text>
            <TextInput
              style={styles.input}
              value={targetAmount}
              onChangeText={setTargetAmount}
              keyboardType="numeric"
              placeholder="e.g. 5000"
              placeholderTextColor={COLORS.textMuted}
            />

            {/* Initial Deposit */}
            <Text style={[styles.sectionLabel, { marginTop: 14 }]}>Initial Deposit (GH₵)</Text>
            <TextInput
              style={styles.input}
              value={initialDeposit}
              onChangeText={setInitialDeposit}
              keyboardType="numeric"
              placeholder="0.00"
              placeholderTextColor={COLORS.textMuted}
            />

            {/* Lock duration if vault */}
            {savingsType === 'vault' ? (
              <>
                <Text style={[styles.sectionLabel, { marginTop: 14 }]}>Lock Period</Text>
                <View style={styles.chipsRow}>
                  {[30, 60, 90, 180].map((d) => (
                    <TouchableOpacity
                      key={d}
                      style={[styles.chip, lockDays === d && styles.activeChip]}
                      onPress={() => setLockDays(d)}
                    >
                      <Text style={[styles.chipText, lockDays === d && styles.activeChipText]}>{d} Days</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            ) : (
              <>
                <Text style={[styles.sectionLabel, { marginTop: 14 }]}>Savings Frequency</Text>
                <View style={styles.chipsRow}>
                  {(['daily', 'weekly', 'monthly'] as const).map((freq) => (
                    <TouchableOpacity
                      key={freq}
                      style={[styles.chip, frequency === freq && styles.activeChip]}
                      onPress={() => setFrequency(freq)}
                    >
                      <Text style={[styles.chipText, frequency === freq && styles.activeChipText]}>
                        {freq.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {/* Summary Card */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Annual Return</Text>
                <Text style={[styles.summaryVal, { color: COLORS.primary }]}>{interestRate}% p.a.</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Est. Interest at Completion</Text>
                <Text style={styles.summaryVal}>
                  GH₵ {((numTarget * (interestRate / 100)) * (savingsType === 'vault' ? lockDays / 365 : 0.5)).toFixed(2)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Credit Score Benefit</Text>
                <Text style={[styles.summaryVal, { color: COLORS.accentGold }]}>+25 to +40 Points</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.createBtn} onPress={handleCreate} activeOpacity={0.85}>
              <Text style={styles.createBtnText}>Start Savings Plan</Text>
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
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  typeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  activeTypeTab: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  typeTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  activeTypeTabText: {
    color: COLORS.primary,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.textPrimary,
    backgroundColor: '#FFFFFF',
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  chip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    alignItems: 'center',
  },
  activeChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  activeChipText: {
    color: '#FFFFFF',
  },
  summaryCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginVertical: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  summaryVal: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  createBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
