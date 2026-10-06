import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/theme';
import { MOMO_PROVIDERS } from '../constants/ghana';
import { MoMoNetwork, TransactionRecord } from '../types';

interface TransferScreenProps {
  availableBalance: number;
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  onTransferCompleted: (tx: TransactionRecord, newBalance: number) => void;
}

export const TransferScreen: React.FC<TransferScreenProps> = ({
  availableBalance,
  onOpenDeposit,
  onOpenWithdraw,
  onTransferCompleted,
}) => {
  const [targetNetwork, setTargetNetwork] = useState<MoMoNetwork>('mtn');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const numAmount = parseFloat(amount) || 0;

  const handleSendMoMo = () => {
    if (recipientPhone.length < 10) {
      Alert.alert('Invalid Number', 'Please enter a valid 10-digit Ghana MoMo number.');
      return;
    }

    if (numAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter an amount to transfer.');
      return;
    }

    if (numAmount > availableBalance) {
      Alert.alert('Insufficient Balance', 'You do not have enough funds in your QuickSave wallet.');
      return;
    }

    const provider = MOMO_PROVIDERS[targetNetwork];
    const ref = `TRANS-GH-${Math.floor(100000 + Math.random() * 900000)}`;

    const tx: TransactionRecord = {
      id: `tx_${Date.now()}`,
      type: 'momo_withdrawal',
      title: `Transfer to ${provider.shortName}`,
      description: `Sent to ${recipientPhone}${note ? ` • ${note}` : ''}`,
      amount: numAmount,
      currency: 'GH₵',
      date: 'Just now',
      status: 'completed',
      network: targetNetwork,
      reference: ref,
      fee: 0,
    };

    onTransferCompleted(tx, availableBalance - numAmount);
    Alert.alert('Transfer Successful! 🎉', `GH₵ ${numAmount.toFixed(2)} sent to ${recipientPhone} on ${provider.name}.`);
    setRecipientPhone('');
    setAmount('');
    setNote('');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Top Banner */}
      <View style={styles.topBanner}>
        <Text style={styles.bannerTitle}>Ghana Mobile Money Hub</Text>
        <Text style={styles.bannerSubtitle}>
          Instant zero-fee wallet transfers across MTN MoMo, Telecel Cash, and AT Money.
        </Text>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionPill} onPress={onOpenDeposit} activeOpacity={0.8}>
            <Ionicons name="arrow-down" size={18} color={COLORS.primary} />
            <Text style={styles.actionPillText}>Deposit (Top Up)</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionPill} onPress={onOpenWithdraw} activeOpacity={0.8}>
            <Ionicons name="arrow-up" size={18} color={COLORS.accentGold} />
            <Text style={styles.actionPillText}>Cashout (Withdraw)</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Instant MoMo Transfer Form */}
      <View style={[styles.formCard, SHADOWS.sm]}>
        <Text style={styles.formTitle}>Send Money to MoMo or Bank</Text>
        <Text style={styles.formSub}>Transfer instantly from your QuickSave balance</Text>

        {/* Network Selection */}
        <Text style={styles.inputLabel}>Recipient Channel</Text>
        <View style={styles.networksRow}>
          {(['mtn', 'telecel', 'at'] as MoMoNetwork[]).map((net) => {
            const prov = MOMO_PROVIDERS[net];
            const isSelected = targetNetwork === net;
            return (
              <TouchableOpacity
                key={net}
                style={[
                  styles.networkTab,
                  isSelected && { borderColor: prov.badgeColor, borderWidth: 2, backgroundColor: '#F8FAFC' },
                ]}
                onPress={() => setTargetNetwork(net)}
              >
                <View style={[styles.dot, { backgroundColor: prov.badgeColor }]} />
                <Text style={styles.networkTabText}>{prov.shortName}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Recipient Phone */}
        <Text style={styles.inputLabel}>Recipient Phone Number</Text>
        <View style={styles.phoneInputRow}>
          <View style={styles.flagBox}>
            <Text style={styles.flagText}>🇬🇭 +233</Text>
          </View>
          <TextInput
            style={styles.textInput}
            value={recipientPhone}
            onChangeText={setRecipientPhone}
            keyboardType="phone-pad"
            maxLength={10}
            placeholder="0244123456"
            placeholderTextColor={COLORS.textMuted}
          />
        </View>

        {/* Amount */}
        <Text style={styles.inputLabel}>Amount (GH₵)</Text>
        <TextInput
          style={styles.amountInput}
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          placeholder="0.00"
          placeholderTextColor={COLORS.textMuted}
        />
        <Text style={styles.balanceHelper}>
          Available Balance: GH₵ {availableBalance.toFixed(2)}
        </Text>

        {/* Reference / Note */}
        <Text style={styles.inputLabel}>Payment Note (Optional)</Text>
        <TextInput
          style={styles.textInput}
          value={note}
          onChangeText={setNote}
          placeholder="e.g. Market goods, rent, family support"
          placeholderTextColor={COLORS.textMuted}
        />

        <TouchableOpacity style={styles.sendBtn} onPress={handleSendMoMo} activeOpacity={0.85}>
          <Ionicons name="paper-plane" size={16} color="#FFFFFF" />
          <Text style={styles.sendBtnText}>
            Send GH₵ {numAmount.toFixed(2)} to {MOMO_PROVIDERS[targetNetwork].shortName}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Ghana Interbank GHIPSS Notice */}
      <View style={styles.ghipssCard}>
        <Ionicons name="card-outline" size={20} color={COLORS.primary} />
        <View style={{ flex: 1 }}>
          <Text style={styles.ghipssTitle}>GHIPSS Instant Pay (GIP) Enabled</Text>
          <Text style={styles.ghipssText}>
            Direct clearing through Bank of Ghana GhIPSS network enables seamless transfers between Mobile Money and traditional banks (Ecobank, GCB, Stanbic, Absa, Fidelity).
          </Text>
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topBanner: {
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 22,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  bannerSubtitle: {
    fontSize: 12,
    color: '#D1FAE5',
    marginTop: 4,
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  actionPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
  },
  actionPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginHorizontal: 20,
    marginTop: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  formSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
    marginTop: 12,
  },
  networksRow: {
    flexDirection: 'row',
    gap: 8,
  },
  networkTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  networkTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  phoneInputRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    overflow: 'hidden',
  },
  flagBox: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  flagText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
  },
  amountInput: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primaryDark,
    backgroundColor: '#F0FDF4',
  },
  balanceHelper: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  sendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 15,
    marginTop: 20,
  },
  sendBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  ghipssCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#ECFDF5',
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 18,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  ghipssTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  ghipssText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 16,
    marginTop: 4,
  },
});
