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
import { LOAN_PRODUCTS, BOG_REGULATION_INFO, MOMO_PROVIDERS } from '../constants/ghana';
import { ActiveLoan, UserProfile } from '../types';

interface LoansScreenProps {
  user: UserProfile;
  activeLoans: ActiveLoan[];
  onOpenLoanModal: () => void;
  onRepayLoan: (loan: ActiveLoan) => void;
  onOpenKycModal: () => void;
}

export const LoansScreen: React.FC<LoansScreenProps> = ({
  user,
  activeLoans,
  onOpenLoanModal,
  onRepayLoan,
  onOpenKycModal,
}) => {
  const activeLoan = activeLoans.find((l) => l.status === 'active');

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Top Banner */}
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Instant MoMo Micro-Credit</Text>
        <Text style={styles.bannerSubtitle}>
          Fair, transparent micro-loans disbursed in 60 seconds directly to your Mobile Money wallet.
        </Text>

        {/* Credit score & Limit box */}
        <View style={styles.creditCard}>
          <View style={styles.creditCol}>
            <Text style={styles.creditLabel}>Your Credit Score</Text>
            <View style={styles.scoreRow}>
              <Text style={styles.scoreNumber}>{user.creditScore}</Text>
              <Text style={styles.scoreMax}>/ 850</Text>
            </View>
            <View style={styles.scoreBadge}>
              <Ionicons name="shield-checkmark" size={12} color={COLORS.success} />
              <Text style={styles.scoreBadgeText}>Very Good</Text>
            </View>
          </View>

          <View style={styles.creditDivider} />

          <View style={styles.creditCol}>
            <Text style={styles.creditLabel}>Approved Credit Limit</Text>
            <Text style={styles.limitAmount}>GH₵ {user.maxLoanLimit.toLocaleString()}</Text>
            <TouchableOpacity onPress={onOpenKycModal} style={styles.increaseBtn}>
              <Text style={styles.increaseBtnText}>Increase Limit ›</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.applyBtn} onPress={onOpenLoanModal} activeOpacity={0.85}>
          <Ionicons name="flash" size={18} color="#FFFFFF" />
          <Text style={styles.applyBtnText}>Instant Loan Calculator & Apply</Text>
        </TouchableOpacity>
      </View>

      {/* Active Loan Section */}
      {activeLoan ? (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Current Active Loan</Text>
          <View style={[styles.activeLoanBox, SHADOWS.sm]}>
            <View style={styles.activeLoanTop}>
              <View>
                <Text style={styles.activeLoanTitle}>{activeLoan.productName}</Text>
                <Text style={styles.activeLoanRef}>Ref: {activeLoan.reference}</Text>
              </View>
              <View style={styles.dueBadge}>
                <Text style={styles.dueBadgeText}>Due {activeLoan.dueDate}</Text>
              </View>
            </View>

            <View style={styles.repaymentBreakdown}>
              <View style={styles.repRow}>
                <Text style={styles.repLabel}>Total Repayment</Text>
                <Text style={styles.repVal}>GH₵ {activeLoan.totalRepayment.toFixed(2)}</Text>
              </View>
              <View style={styles.repRow}>
                <Text style={styles.repLabel}>Amount Paid</Text>
                <Text style={[styles.repVal, { color: COLORS.success }]}>GH₵ {activeLoan.amountPaid.toFixed(2)}</Text>
              </View>
              <View style={styles.repRow}>
                <Text style={styles.repLabel}>Remaining Balance</Text>
                <Text style={[styles.repVal, { color: COLORS.danger, fontWeight: '800' }]}>
                  GH₵ {(activeLoan.totalRepayment - activeLoan.amountPaid).toFixed(2)}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.repayMoMoBtn}
              onPress={() => onRepayLoan(activeLoan)}
              activeOpacity={0.85}
            >
              <Ionicons name="phone-portrait" size={16} color="#FFFFFF" />
              <Text style={styles.repayMoMoBtnText}>Repay with {MOMO_PROVIDERS[activeLoan.network].shortName}</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.noLoanCard}>
          <Ionicons name="checkmark-circle-outline" size={32} color={COLORS.success} />
          <Text style={styles.noLoanTitle}>No Outstanding Debts</Text>
          <Text style={styles.noLoanSub}>You have 100% of your credit limit available for immediate cashout.</Text>
        </View>
      )}

      {/* Available Loan Packages */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Available Loan Packages</Text>
        <View style={styles.productsList}>
          {LOAN_PRODUCTS.map((prod) => (
            <View key={prod.id} style={[styles.productItem, SHADOWS.sm]}>
              <View style={styles.productTop}>
                <View style={styles.productBadge}>
                  <Text style={styles.productBadgeText}>{prod.badge}</Text>
                </View>
                <Text style={styles.monthlyRate}>{prod.monthlyInterestRate}% / mo</Text>
              </View>

              <Text style={styles.prodName}>{prod.name}</Text>
              <Text style={styles.prodDesc}>{prod.description}</Text>

              <View style={styles.prodDetailsRow}>
                <View>
                  <Text style={styles.detailLabel}>Loan Range</Text>
                  <Text style={styles.detailVal}>GH₵ {prod.minAmount} - GH₵ {prod.maxAmount.toLocaleString()}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.detailLabel}>Tenure</Text>
                  <Text style={styles.detailVal}>{prod.minTenureDays} - {prod.maxTenureDays} Days</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.selectPackageBtn}
                onPress={onOpenLoanModal}
                activeOpacity={0.8}
              >
                <Text style={styles.selectPackageBtnText}>Apply for this Package</Text>
                <Ionicons name="arrow-forward" size={14} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>

      {/* Play Store & Bank of Ghana Compliance Notice */}
      <View style={styles.complianceBox}>
        <Text style={styles.complianceTitle}>Regulatory & Consumer Protection Notice</Text>
        <Text style={styles.complianceText}>
          • QuickSave complies with the Bank of Ghana Tier-3 Microfinance Lending Directive.
        </Text>
        <Text style={styles.complianceText}>
          • Minimum repayment tenure is 61 days; maximum tenure is 180 days.
        </Text>
        <Text style={styles.complianceText}>
          • Maximum Annual Percentage Rate (APR): 36.0% - 54.0% p.a.
        </Text>
        <Text style={styles.complianceText}>
          • No hidden rollover fees. Transparent SMS reminders sent prior to due date.
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
  banner: {
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
  creditCard: {
    backgroundColor: '#0F5132',
    borderRadius: 16,
    flexDirection: 'row',
    padding: 16,
    marginTop: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  creditCol: {
    flex: 1,
  },
  creditDivider: {
    width: 1,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 14,
  },
  creditLabel: {
    fontSize: 11,
    color: '#A7F3D0',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 2,
  },
  scoreNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  scoreMax: {
    fontSize: 12,
    color: '#D1FAE5',
    marginLeft: 4,
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  scoreBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A7F3D0',
  },
  limitAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FEF3C7',
    marginTop: 2,
  },
  increaseBtn: {
    marginTop: 4,
  },
  increaseBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FCD34D',
  },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.accentGold,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 16,
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  activeLoanBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  activeLoanTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  activeLoanTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  activeLoanRef: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  dueBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  dueBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.danger,
  },
  repaymentBreakdown: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    gap: 6,
  },
  repRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  repLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  repVal: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  repayMoMoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 14,
  },
  repayMoMoBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  noLoanCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  noLoanTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginTop: 8,
  },
  noLoanSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  productsList: {
    gap: 12,
  },
  productItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  productTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  productBadge: {
    backgroundColor: COLORS.accentGoldLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  productBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.accentGold,
  },
  monthlyRate: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },
  prodName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  prodDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
    lineHeight: 16,
  },
  prodDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    marginTop: 12,
  },
  detailLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  detailVal: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  selectPackageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
  },
  selectPackageBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  complianceBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 20,
    gap: 6,
  },
  complianceTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  complianceText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
});
