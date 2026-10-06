import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/theme';
import { SavingsProduct, SavingsType } from '../types';

interface SavingsScreenProps {
  savingsGoals: SavingsProduct[];
  totalSavings: number;
  totalInterestEarned: number;
  onOpenCreateGoal: () => void;
  onTopUpGoal: (goal: SavingsProduct) => void;
}

export const SavingsScreen: React.FC<SavingsScreenProps> = ({
  savingsGoals,
  totalSavings,
  totalInterestEarned,
  onOpenCreateGoal,
  onTopUpGoal,
}) => {
  const [filter, setFilter] = useState<'all' | SavingsType>('all');

  const filteredGoals = savingsGoals.filter((g) => (filter === 'all' ? true : g.type === filter));

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Top Banner */}
      <View style={styles.topBanner}>
        <Text style={styles.bannerTitle}>Ghana Cedi Savings & Susu Vault</Text>
        <Text style={styles.bannerSubtitle}>
          Grow your wealth with BoG insured Susu thrift and locked vaults up to 14.5% p.a.
        </Text>

        <View style={styles.statsCard}>
          <View style={styles.statCol}>
            <Text style={styles.statLabel}>Total Saved</Text>
            <Text style={styles.statVal}>GH₵ {totalSavings.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statLabel}>Accrued Interest</Text>
            <Text style={[styles.statVal, { color: COLORS.accentGold }]}>
              +GH₵ {totalInterestEarned.toFixed(2)}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.newGoalBtn} onPress={onOpenCreateGoal} activeOpacity={0.85}>
          <Ionicons name="add-circle" size={20} color="#FFFFFF" />
          <Text style={styles.newGoalBtnText}>Start New Susu / SafeLock Plan</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filtersRow}>
        {(['all', 'susu', 'vault', 'emergency'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.filterChip, filter === tab && styles.activeFilterChip]}
            onPress={() => setFilter(tab)}
          >
            <Text style={[styles.filterChipText, filter === tab && styles.activeFilterChipText]}>
              {tab === 'all' ? 'All Plans' : tab === 'susu' ? 'Susu Daily' : tab === 'vault' ? 'SafeLock' : 'Emergency'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Savings Goals List */}
      <View style={styles.goalsContainer}>
        {filteredGoals.map((goal) => {
          const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));

          return (
            <View key={goal.id} style={[styles.goalCard, SHADOWS.sm]}>
              <View style={styles.cardHeader}>
                <View style={styles.tagRow}>
                  <View
                    style={[
                      styles.typeBadge,
                      goal.type === 'vault'
                        ? { backgroundColor: '#FEF3C7' }
                        : goal.type === 'susu'
                        ? { backgroundColor: '#E0F2FE' }
                        : { backgroundColor: '#F3E8FF' },
                    ]}
                  >
                    <Ionicons
                      name={goal.type === 'vault' ? 'lock-closed' : goal.type === 'susu' ? 'calendar' : 'shield'}
                      size={12}
                      color={goal.type === 'vault' ? '#B45309' : goal.type === 'susu' ? '#0369A1' : '#7E22CE'}
                    />
                    <Text
                      style={[
                        styles.typeBadgeText,
                        goal.type === 'vault'
                          ? { color: '#B45309' }
                          : goal.type === 'susu'
                          ? { color: '#0369A1' }
                          : { color: '#7E22CE' },
                      ]}
                    >
                      {goal.type === 'vault' ? 'SafeLock Vault' : goal.type === 'susu' ? 'Daily Susu' : 'Emergency Pot'}
                    </Text>
                  </View>
                  <Text style={styles.interestPill}>+{goal.interestRateAnnual}% p.a.</Text>
                </View>

                {goal.isLocked && (
                  <View style={styles.lockedNotice}>
                    <Ionicons name="lock-closed" size={11} color="#B45309" />
                    <Text style={styles.lockedNoticeText}>{goal.lockPeriodDays} Days Locked</Text>
                  </View>
                )}
              </View>

              <Text style={styles.goalTitle}>{goal.title}</Text>
              <Text style={styles.goalDesc}>{goal.description}</Text>

              <View style={styles.amountProgressRow}>
                <View>
                  <Text style={styles.amountLabel}>Saved So Far</Text>
                  <Text style={styles.amountNumber}>GH₵ {goal.currentAmount.toLocaleString()}</Text>
                </View>
                <View style={styles.targetCol}>
                  <Text style={styles.amountLabel}>Target Goal</Text>
                  <Text style={styles.targetNumber}>GH₵ {goal.targetAmount.toLocaleString()}</Text>
                </View>
              </View>

              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${percent}%` }]} />
              </View>
              <Text style={styles.progressPercentText}>{percent}% funded</Text>

              <View style={styles.cardActionsRow}>
                <TouchableOpacity
                  style={styles.topUpBtn}
                  onPress={() => onTopUpGoal(goal)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="add" size={16} color={COLORS.primary} />
                  <Text style={styles.topUpBtnText}>Top Up via MoMo</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.withdrawSavingsBtn}
                  onPress={() => {
                    if (goal.isLocked) {
                      Alert.alert(
                        'Funds Locked',
                        `This vault is locked until maturity to preserve your ${goal.interestRateAnnual}% interest payout.`
                      );
                    } else {
                      Alert.alert('Withdraw to Wallet', `Withdraw from ${goal.title} to your available balance?`);
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.withdrawSavingsText}>Withdraw</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
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
  statsCard: {
    backgroundColor: '#0F5132',
    borderRadius: 16,
    flexDirection: 'row',
    padding: 16,
    marginTop: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  statCol: {
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 16,
  },
  statLabel: {
    fontSize: 11,
    color: '#A7F3D0',
  },
  statVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  newGoalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.accentGold,
    borderRadius: 12,
    paddingVertical: 13,
    marginTop: 16,
  },
  newGoalBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  filtersRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeFilterChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  activeFilterChipText: {
    color: '#FFFFFF',
  },
  goalsContainer: {
    paddingHorizontal: 20,
    marginTop: 14,
    gap: 14,
  },
  goalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  interestPill: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.success,
  },
  lockedNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  lockedNoticeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#B45309',
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  goalDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  amountProgressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: 14,
  },
  amountLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  amountNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 2,
  },
  targetCol: {
    alignItems: 'flex-end',
  },
  targetNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  progressPercentText: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  topUpBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
  },
  topUpBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  withdrawSavingsBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  withdrawSavingsText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
});
