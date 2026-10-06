import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/theme';
import { MOMO_PROVIDERS } from '../constants/ghana';
import { TransactionRecord } from '../types';

interface TransactionReceiptModalProps {
  visible: boolean;
  transaction: TransactionRecord | null;
  onClose: () => void;
}

export const TransactionReceiptModal: React.FC<TransactionReceiptModalProps> = ({
  visible,
  transaction,
  onClose,
}) => {
  if (!transaction) return null;

  const provider = transaction.network ? MOMO_PROVIDERS[transaction.network] : null;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `QuickSave Ghana Official Receipt\nRef: ${transaction.reference}\nAmount: GH₵ ${transaction.amount.toFixed(2)}\nType: ${transaction.title}\nStatus: ${transaction.status.toUpperCase()}\nDate: ${transaction.date}\nRegulated by Bank of Ghana`,
      });
    } catch (e) {
      Alert.alert('Error', 'Unable to share receipt');
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.receiptCard, SHADOWS.lg]}>
          {/* Top Green Accent Bar */}
          <View style={styles.topAccent} />

          {/* Success Checkmark Circle */}
          <View style={styles.iconCircle}>
            <Ionicons name="checkmark-circle" size={54} color={COLORS.success} />
          </View>

          <Text style={styles.receiptHeader}>Transaction Receipt</Text>
          <Text style={styles.orgName}>QuickSave Microfinance Ghana</Text>

          {/* Amount */}
          <View style={styles.amountBox}>
            <Text style={styles.amountPrefix}>GH₵</Text>
            <Text style={styles.amountNumber}>{transaction.amount.toFixed(2)}</Text>
          </View>

          <View style={styles.statusPill}>
            <Text style={styles.statusText}>SUCCESSFUL</Text>
          </View>

          {/* Receipt Details Table */}
          <View style={styles.detailsTable}>
            <View style={styles.tableRow}>
              <Text style={styles.label}>Transaction Type</Text>
              <Text style={styles.val}>{transaction.title}</Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={styles.label}>Reference Number</Text>
              <Text style={[styles.val, styles.monoVal]}>{transaction.reference}</Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={styles.label}>Timestamp</Text>
              <Text style={styles.val}>{transaction.date}</Text>
            </View>

            {provider && (
              <View style={styles.tableRow}>
                <Text style={styles.label}>Payment Channel</Text>
                <View style={styles.channelBadge}>
                  <View style={[styles.channelDot, { backgroundColor: provider.badgeColor }]} />
                  <Text style={styles.channelName}>{provider.name}</Text>
                </View>
              </View>
            )}

            {transaction.fee !== undefined && (
              <View style={styles.tableRow}>
                <Text style={styles.label}>Fee (E-Levy / Cashout)</Text>
                <Text style={styles.val}>
                  {transaction.fee > 0 ? `GH₵ ${transaction.fee.toFixed(2)}` : 'FREE (0.00)'}
                </Text>
              </View>
            )}

            <View style={styles.divider} />

            <View style={styles.tableRow}>
              <Text style={styles.label}>Regulatory Status</Text>
              <Text style={[styles.val, { color: COLORS.primary }]}>Bank of Ghana Tier-3 Verified</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.shareBtn} onPress={handleShare} activeOpacity={0.8}>
              <Ionicons name="share-social-outline" size={18} color={COLORS.primary} />
              <Text style={styles.shareBtnText}>Share Receipt</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.doneBtn} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.doneBtnText}>Close</Text>
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
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  receiptCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingBottom: 24,
    alignItems: 'center',
    overflow: 'hidden',
  },
  topAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: COLORS.primary,
  },
  iconCircle: {
    marginTop: 20,
    marginBottom: 4,
  },
  receiptHeader: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  orgName: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  amountBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 14,
    gap: 4,
  },
  amountPrefix: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
  },
  amountNumber: {
    fontSize: 34,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  statusPill: {
    backgroundColor: COLORS.successBg,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.success,
    letterSpacing: 0.5,
  },
  detailsTable: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  label: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  val: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  monoVal: {
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
  channelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  channelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  channelName: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 6,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  shareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  shareBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  doneBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
  },
  doneBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
