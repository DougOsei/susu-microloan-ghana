import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/theme';
import { WalletBalances } from '../types';

interface WalletCardProps {
  balances: WalletBalances;
  onDepositMoMo: () => void;
  onWithdrawMoMo: () => void;
  onOpenSavings: () => void;
  onApplyLoan: () => void;
}

export const WalletCard: React.FC<WalletCardProps> = ({
  balances,
  onDepositMoMo,
  onWithdrawMoMo,
  onOpenSavings,
  onApplyLoan,
}) => {
  const [showBalance, setShowBalance] = useState(true);

  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={['#0D533A', '#083B29', '#05291C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, SHADOWS.lg]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.titleBadge}>
            <Ionicons name="wallet-outline" size={16} color="#FEF3C7" />
            <Text style={styles.cardLabel}>QuickSave Mobile Money Wallet</Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowBalance(!showBalance)}
            style={styles.eyeBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={showBalance ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color="#E2E8F0"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.balanceContainer}>
          <Text style={styles.currencyPrefix}>GH₵</Text>
          <Text style={styles.balanceText}>
            {showBalance ? balances.availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '••••••'}
          </Text>
        </View>

        <View style={styles.subStatsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Total Susu & Vault</Text>
            <Text style={styles.statValue}>
              {showBalance ? `GH₵ ${balances.totalSavings.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '••••'}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Active Loan Balance</Text>
            <Text style={[styles.statValue, { color: '#FCA5A5' }]}>
              {showBalance ? `GH₵ ${balances.activeLoanDebt.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '••••'}
            </Text>
          </View>
        </View>

        <View style={styles.networkTagsRow}>
          <Text style={styles.networkTitle}>Supported MoMo:</Text>
          <View style={[styles.badgePill, { backgroundColor: '#FFCC00' }]}>
            <Text style={[styles.badgeText, { color: '#1A1A1A' }]}>MTN MoMo</Text>
          </View>
          <View style={[styles.badgePill, { backgroundColor: '#E60000' }]}>
            <Text style={[styles.badgeText, { color: '#FFFFFF' }]}>Telecel</Text>
          </View>
          <View style={[styles.badgePill, { backgroundColor: '#003399' }]}>
            <Text style={[styles.badgeText, { color: '#FFFFFF' }]}>AT Money</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Quick Action Floating Bar */}
      <View style={[styles.actionsCard, SHADOWS.md]}>
        <TouchableOpacity style={styles.actionBtn} onPress={onDepositMoMo} activeOpacity={0.8}>
          <View style={[styles.actionIconCircle, { backgroundColor: '#E8F5E9' }]}>
            <Ionicons name="arrow-down" size={22} color={COLORS.primary} />
          </View>
          <Text style={styles.actionBtnTitle}>Deposit</Text>
          <Text style={styles.actionBtnSubtitle}>via MoMo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={onWithdrawMoMo} activeOpacity={0.8}>
          <View style={[styles.actionIconCircle, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="arrow-up" size={22} color={COLORS.accentGold} />
          </View>
          <Text style={styles.actionBtnTitle}>Withdraw</Text>
          <Text style={styles.actionBtnSubtitle}>Cashout</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={onOpenSavings} activeOpacity={0.8}>
          <View style={[styles.actionIconCircle, { backgroundColor: '#DBEAFE' }]}>
            <Ionicons name="lock-closed" size={20} color={COLORS.info} />
          </View>
          <Text style={styles.actionBtnTitle}>Susu / Vault</Text>
          <Text style={styles.actionBtnSubtitle}>Up to 14.5%</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={onApplyLoan} activeOpacity={0.8}>
          <View style={[styles.actionIconCircle, { backgroundColor: '#FEE2E2' }]}>
            <Ionicons name="flash" size={20} color={COLORS.danger} />
          </View>
          <Text style={styles.actionBtnTitle}>Get Loan</Text>
          <Text style={styles.actionBtnSubtitle}>Instant</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 20,
    marginTop: 16,
  },
  card: {
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardLabel: {
    color: '#D1FAE5',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  eyeBtn: {
    padding: 4,
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 14,
    gap: 6,
  },
  currencyPrefix: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FEF3C7',
  },
  balanceText: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  subStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
  },
  statItem: {
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 12,
  },
  statLabel: {
    color: '#A7F3D0',
    fontSize: 11,
    fontWeight: '500',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  networkTagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 6,
  },
  networkTitle: {
    fontSize: 10,
    color: '#94A3B8',
    marginRight: 2,
  },
  badgePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  actionsCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: -16,
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionBtn: {
    alignItems: 'center',
    flex: 1,
  },
  actionIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  actionBtnTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  actionBtnSubtitle: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
});
