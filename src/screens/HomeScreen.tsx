import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/theme';
import { Header } from '../components/Header';
import { WalletCard } from '../components/WalletCard';
import {
  UserProfile,
  WalletBalances,
  SavingsProduct,
  ActiveLoan,
  TransactionRecord,
} from '../types';
import { MOMO_PROVIDERS } from '../constants/ghana';

interface HomeScreenProps {
  user: UserProfile;
  balances: WalletBalances;
  savingsGoals: SavingsProduct[];
  activeLoans: ActiveLoan[];
  transactions: TransactionRecord[];
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  onOpenSavingsModal: () => void;
  onOpenLoanModal: () => void;
  onOpenKycModal: () => void;
  onSelectTransaction: (tx: TransactionRecord) => void;
  onRepayLoan: (loan: ActiveLoan) => void;
  onNavigateTab: (tab: 'savings' | 'loans' | 'transfers' | 'profile') => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  user,
  balances,
  savingsGoals,
  activeLoans,
  transactions,
  onOpenDeposit,
  onOpenWithdraw,
  onOpenSavingsModal,
  onOpenLoanModal,
  onOpenKycModal,
  onSelectTransaction,
  onRepayLoan,
  onNavigateTab,
}) => {
  const activeLoan = activeLoans.find((l) => l.status === 'active');

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Top Header */}
      <Header
        user={user}
        onPressProfile={() => onNavigateTab('profile')}
        onPressKyc={onOpenKycModal}
      />

      {/* Main Virtual Wallet Card */}
      <WalletCard
        balances={balances}
        onDepositMoMo={onOpenDeposit}
        onWithdrawMoMo={onOpenWithdraw}
        onOpenSavings={onOpenSavingsModal}
        onApplyLoan={onOpenLoanModal}
      />

      {/* Credit Limit Banner */}
      <View style={styles.creditBanner}>
        <View style={styles.creditBannerContent}>
          <View style={styles.creditIconCircle}>
            <Ionicons name="sparkles" size={18} color="#D97706" />
          </View>
          <View style={styles.creditTextCol}>
            <Text style={styles.creditTitle}>Approved MoMo Loan Limit</Text>
            <Text style={styles.creditSubtitle}>
              You qualify for up to <Text style={styles.boldCredit}>GH₵ {user.maxLoanLimit.toLocaleString()}</Text> with instant disbursement.
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.creditBtn} onPress={onOpenLoanModal} activeOpacity={0.8}>
          <Text style={styles.creditBtnText}>Apply</Text>
        </TouchableOpacity>
      </View>

      {/* Active Loan Reminder Card if user has an active loan */}
      {activeLoan && (
        <View style={[styles.activeLoanCard, SHADOWS.md]}>
          <View style={styles.activeLoanHeader}>
            <View style={styles.loanBadge}>
              <Ionicons name="time" size={14} color={COLORS.danger} />
              <Text style={styles.loanBadgeText}>Active Loan Due</Text>
            </View>
            <Text style={styles.dueDateText}>Due: {activeLoan.dueDate}</Text>
          </View>

          <View style={styles.loanBody}>
            <View>
              <Text style={styles.loanName}>{activeLoan.productName}</Text>
              <Text style={styles.loanRef}>Ref: {activeLoan.reference}</Text>
            </View>
            <View style={styles.loanAmountCol}>
              <Text style={styles.loanAmountLabel}>Balance Due</Text>
              <Text style={styles.loanAmountVal}>
                GH₵ {(activeLoan.totalRepayment - activeLoan.amountPaid).toFixed(2)}
              </Text>
            </View>
          </View>

          <View style={styles.loanProgressTrack}>
            <View
              style={[
                styles.loanProgressFill,
                { width: `${Math.min(100, (activeLoan.amountPaid / activeLoan.totalRepayment) * 100)}%` },
              ]}
            />
          </View>
          <Text style={styles.paidRatio}>
            GH₵ {activeLoan.amountPaid.toFixed(2)} paid of GH₵ {activeLoan.totalRepayment.toFixed(2)}
          </Text>

          <TouchableOpacity
            style={styles.repayBtn}
            onPress={() => onRepayLoan(activeLoan)}
            activeOpacity={0.85}
          >
            <Ionicons name="phone-portrait-outline" size={16} color="#FFFFFF" />
            <Text style={styles.repayBtnText}>Repay via Mobile Money</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Susu & Target Savings Section */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Susu & Savings Pots</Text>
          <Text style={styles.sectionSubtitle}>Earn up to 14.5% annual guaranteed interest</Text>
        </View>
        <TouchableOpacity onPress={() => onNavigateTab('savings')} activeOpacity={0.7}>
          <Text style={styles.seeAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
        {savingsGoals.map((item) => {
          const progressPercent = Math.min(100, Math.round((item.currentAmount / item.targetAmount) * 100));
          return (
            <View key={item.id} style={[styles.goalCard, SHADOWS.sm]}>
              <View style={styles.goalTopRow}>
                <View style={[styles.goalTypePill, item.type === 'vault' && { backgroundColor: '#FEF3C7' }]}>
                  <Text style={[styles.goalTypePillText, item.type === 'vault' && { color: '#B45309' }]}>
                    {item.type === 'vault' ? 'SafeLock' : item.type === 'susu' ? 'Daily Susu' : 'Emergency'}
                  </Text>
                </View>
                <Text style={styles.rateBadge}>+{item.interestRateAnnual}%</Text>
              </View>

              <Text style={styles.goalTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.goalCurrent}>GH₵ {item.currentAmount.toLocaleString()}</Text>
              <Text style={styles.goalTarget}>of GH₵ {item.targetAmount.toLocaleString()} target</Text>

              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
              </View>
              <Text style={styles.progressPercent}>{progressPercent}% completed</Text>
            </View>
          );
        })}

        <TouchableOpacity style={styles.addGoalCard} onPress={onOpenSavingsModal} activeOpacity={0.7}>
          <View style={styles.addIconCircle}>
            <Ionicons name="add" size={24} color={COLORS.primary} />
          </View>
          <Text style={styles.addGoalText}>Create New</Text>
          <Text style={styles.addGoalSub}>Susu / Vault</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Recent Transactions Feed */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <Text style={styles.sectionSubtitle}>Mobile Money, Susu & Loan updates</Text>
        </View>
      </View>

      <View style={styles.transactionsList}>
        {transactions.slice(0, 5).map((tx) => {
          const isDeposit = tx.type.includes('deposit') || tx.type.includes('disbursement') || tx.type.includes('credited');
          const prov = tx.network ? MOMO_PROVIDERS[tx.network] : null;

          return (
            <TouchableOpacity
              key={tx.id}
              style={styles.txRow}
              onPress={() => onSelectTransaction(tx)}
              activeOpacity={0.7}
            >
              <View style={[styles.txIconBox, { backgroundColor: isDeposit ? '#ECFDF5' : '#FEF2F2' }]}>
                <Ionicons
                  name={isDeposit ? 'arrow-down' : 'arrow-up'}
                  size={18}
                  color={isDeposit ? COLORS.success : COLORS.danger}
                />
              </View>

              <View style={styles.txInfoCol}>
                <Text style={styles.txTitle}>{tx.title}</Text>
                <View style={styles.txMetaRow}>
                  <Text style={styles.txDate}>{tx.date}</Text>
                  {prov && (
                    <View style={[styles.carrierPill, { backgroundColor: prov.badgeColor }]}>
                      <Text style={[styles.carrierText, { color: prov.textColor }]}>{prov.shortName}</Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.txAmountCol}>
                <Text style={[styles.txAmount, { color: isDeposit ? COLORS.success : COLORS.textPrimary }]}>
                  {isDeposit ? '+' : '-'}GH₵ {tx.amount.toFixed(2)}
                </Text>
                <Text style={styles.txStatus}>{tx.status}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Bank of Ghana Regulatory Notice Footer */}
      <View style={styles.regulatoryBox}>
        <Ionicons name="information-circle-outline" size={16} color={COLORS.textSecondary} />
        <Text style={styles.regulatoryText}>
          QuickSave is a certified digital microfinance platform regulated by the Bank of Ghana. We adhere to consumer protection and fair lending guidelines.
        </Text>
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
  creditBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 14,
    marginHorizontal: 20,
    marginTop: 18,
    padding: 14,
  },
  creditBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  creditIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  creditTextCol: {
    flex: 1,
  },
  creditTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#92400E',
  },
  creditSubtitle: {
    fontSize: 11,
    color: '#B45309',
    marginTop: 1,
  },
  boldCredit: {
    fontWeight: '800',
    color: '#78350F',
  },
  creditBtn: {
    backgroundColor: COLORS.accentGold,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  creditBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  activeLoanCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 20,
    marginTop: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  activeLoanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  loanBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  loanBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.danger,
  },
  dueDateText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  loanBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  loanName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  loanRef: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  loanAmountCol: {
    alignItems: 'flex-end',
  },
  loanAmountLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  loanAmountVal: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.danger,
  },
  loanProgressTrack: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    marginTop: 12,
    overflow: 'hidden',
  },
  loanProgressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  paidRatio: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  repayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 12,
  },
  repayBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginHorizontal: 20,
    marginTop: 22,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  horizontalScroll: {
    paddingLeft: 20,
    paddingRight: 10,
    gap: 12,
  },
  goalCard: {
    width: 170,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  goalTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalTypePill: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  goalTypePillText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#0369A1',
  },
  rateBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.success,
  },
  goalTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  goalCurrent: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 4,
  },
  goalTarget: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  progressBarBg: {
    height: 5,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  progressPercent: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  addGoalCard: {
    width: 120,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    backgroundColor: '#F8FAFC',
    marginRight: 10,
  },
  addIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  addGoalText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  addGoalSub: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  transactionsList: {
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  txIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  txInfoCol: {
    flex: 1,
  },
  txTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  txMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  txDate: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  carrierPill: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  carrierText: {
    fontSize: 8,
    fontWeight: '800',
  },
  txAmountCol: {
    alignItems: 'flex-end',
  },
  txAmount: {
    fontSize: 13,
    fontWeight: '700',
  },
  txStatus: {
    fontSize: 10,
    color: COLORS.textMuted,
    textTransform: 'capitalize',
    marginTop: 2,
  },
  regulatoryBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 18,
    padding: 12,
  },
  regulatoryText: {
    flex: 1,
    fontSize: 10,
    color: COLORS.textSecondary,
    lineHeight: 14,
  },
});
