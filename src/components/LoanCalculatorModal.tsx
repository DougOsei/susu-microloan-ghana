import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/theme';
import { LOAN_PRODUCTS, MOMO_PROVIDERS, BOG_REGULATION_INFO } from '../constants/ghana';
import { LoanProduct, ActiveLoan, MoMoNetwork, TransactionRecord } from '../types';

interface LoanCalculatorModalProps {
  visible: boolean;
  userCreditScore: number;
  maxLoanLimit: number;
  userPhone: string;
  onClose: () => void;
  onLoanApproved: (loan: ActiveLoan, transaction: TransactionRecord) => void;
}

export const LoanCalculatorModal: React.FC<LoanCalculatorModalProps> = ({
  visible,
  userCreditScore,
  maxLoanLimit,
  userPhone,
  onClose,
  onLoanApproved,
}) => {
  const [selectedProduct, setSelectedProduct] = useState<LoanProduct>(LOAN_PRODUCTS[0]);
  const [selectedTenure, setSelectedTenure] = useState(61);
  const [amount, setAmount] = useState(500);
  const [disbursementNetwork, setDisbursementNetwork] = useState<MoMoNetwork>('mtn');
  const [isApplying, setIsApplying] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(true);

  // Interest and fee calculations
  const months = selectedTenure / 30;
  const interestRate = (selectedProduct.monthlyInterestRate * months) / 100;
  const interestAmount = Number((amount * interestRate).toFixed(2));
  const processingFee = Number(((amount * selectedProduct.processingFeePercent) / 100).toFixed(2));
  const totalRepayable = Number((amount + interestAmount).toFixed(2));
  const apr = ((selectedProduct.monthlyInterestRate * 12) + (selectedProduct.processingFeePercent * (365 / selectedTenure))).toFixed(1);

  // Due Date calculation (days from now)
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + selectedTenure);
  const dueDateStr = dueDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  const handleApply = () => {
    if (!agreeToTerms) {
      Alert.alert('Terms Required', 'Please accept the Bank of Ghana digital borrower terms.');
      return;
    }

    if (amount > maxLoanLimit) {
      Alert.alert(
        'Limit Exceeded',
        `Your maximum approved loan limit is GH₵ ${maxLoanLimit}. Complete Ghana Card Tier-2 verification to increase your limit.`
      );
      return;
    }

    if (userCreditScore < selectedProduct.eligibleCreditScore) {
      Alert.alert(
        'Credit Score Ineligible',
        `This loan requires a minimum credit score of ${selectedProduct.eligibleCreditScore}. Your current score is ${userCreditScore}.`
      );
      return;
    }

    setIsApplying(true);

    setTimeout(() => {
      setIsApplying(false);

      const loanRef = `LN-GH-${Math.floor(100000 + Math.random() * 900000)}`;
      const activeLoan: ActiveLoan = {
        id: `loan_${Date.now()}`,
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        principalAmount: amount,
        interestAmount: interestAmount,
        processingFee: processingFee,
        totalRepayment: totalRepayable,
        amountPaid: 0,
        tenureDays: selectedTenure,
        disbursementDate: 'Today',
        dueDate: dueDateStr,
        status: 'active',
        disbursementMoMoNumber: userPhone,
        network: disbursementNetwork,
        reference: loanRef,
      };

      const tx: TransactionRecord = {
        id: `tx_${Date.now()}`,
        type: 'loan_disbursement',
        title: `Loan Disbursement: ${selectedProduct.name}`,
        description: `Disbursed to ${MOMO_PROVIDERS[disbursementNetwork].shortName} (${userPhone})`,
        amount: amount,
        currency: 'GH₵',
        date: 'Just now',
        status: 'completed',
        network: disbursementNetwork,
        reference: loanRef,
        fee: processingFee,
      };

      onLoanApproved(activeLoan, tx);
      Alert.alert(
        'Loan Disbursed!',
        `GH₵ ${amount.toFixed(2)} has been transferred directly to your ${MOMO_PROVIDERS[disbursementNetwork].name} wallet.`
      );
      onClose();
    }, 1800);
  };

  const amountPresets = [200, 500, 1000, 2000, 3000];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>Micro-Credit Loan Hub</Text>
              <Text style={styles.modalSubtitle}>Bank of Ghana Tier-3 Compliant Digital Lending</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* Products selector */}
            <Text style={styles.sectionLabel}>Select Loan Package</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productsScroll}>
              {LOAN_PRODUCTS.map((prod) => {
                const isSelected = selectedProduct.id === prod.id;
                return (
                  <TouchableOpacity
                    key={prod.id}
                    style={[styles.productCard, isSelected && styles.activeProductCard]}
                    onPress={() => {
                      setSelectedProduct(prod);
                      setAmount(Math.min(amount, prod.maxAmount));
                    }}
                  >
                    <View style={styles.productBadge}>
                      <Text style={styles.productBadgeText}>{prod.badge}</Text>
                    </View>
                    <Text style={styles.productName}>{prod.name}</Text>
                    <Text style={styles.productRate}>{prod.monthlyInterestRate}% / month</Text>
                    <Text style={styles.productLimit}>Up to GH₵ {prod.maxAmount.toLocaleString()}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Loan Amount Selector */}
            <View style={styles.amountHeaderRow}>
              <Text style={styles.sectionLabel}>Loan Amount</Text>
              <Text style={styles.limitNotice}>Max Limit: GH₵ {maxLoanLimit}</Text>
            </View>

            <View style={styles.amountBox}>
              <Text style={styles.amountDisplay}>GH₵ {amount.toLocaleString()}</Text>
              <View style={styles.chipsRow}>
                {amountPresets.map((val) => (
                  <TouchableOpacity
                    key={val}
                    style={[styles.chip, amount === val && styles.activeChip]}
                    onPress={() => setAmount(val)}
                  >
                    <Text style={[styles.chipText, amount === val && styles.activeChipText]}>GH₵ {val}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Repayment Tenure */}
            <Text style={styles.sectionLabel}>Repayment Period</Text>
            <View style={styles.tenureRow}>
              {[61, 90, 120, 180].map((days) => (
                <TouchableOpacity
                  key={days}
                  style={[styles.tenureBtn, selectedTenure === days && styles.activeTenureBtn]}
                  onPress={() => setSelectedTenure(days)}
                >
                  <Text style={[styles.tenureText, selectedTenure === days && styles.activeTenureText]}>
                    {days} Days
                  </Text>
                  <Text style={[styles.tenureSub, selectedTenure === days && styles.activeTenureSub]}>
                    ({Math.round(days / 30)} mos)
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Disbursement Mobile Money Provider */}
            <Text style={styles.sectionLabel}>Disburse Directly To</Text>
            <View style={styles.networksRow}>
              {(['mtn', 'telecel', 'at'] as MoMoNetwork[]).map((net) => {
                const prov = MOMO_PROVIDERS[net];
                const isSelected = disbursementNetwork === net;
                return (
                  <TouchableOpacity
                    key={net}
                    style={[styles.momoPill, isSelected && { borderColor: prov.badgeColor, borderWidth: 2 }]}
                    onPress={() => setDisbursementNetwork(net)}
                  >
                    <View style={[styles.dot, { backgroundColor: prov.badgeColor }]} />
                    <Text style={styles.momoPillText}>{prov.shortName}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Transparent Calculation Breakdown */}
            <View style={styles.calculationCard}>
              <Text style={styles.cardSectionTitle}>Transparent Cost Breakdown</Text>
              <View style={styles.calcRow}>
                <Text style={styles.calcLabel}>Loan Principal (Received in MoMo)</Text>
                <Text style={styles.calcVal}>GH₵ {amount.toFixed(2)}</Text>
              </View>
              <View style={styles.calcRow}>
                <Text style={styles.calcLabel}>Processing Fee ({selectedProduct.processingFeePercent}%)</Text>
                <Text style={styles.calcVal}>GH₵ {processingFee.toFixed(2)}</Text>
              </View>
              <View style={styles.calcRow}>
                <Text style={styles.calcLabel}>Total Interest ({selectedProduct.monthlyInterestRate}% / mo)</Text>
                <Text style={styles.calcVal}>GH₵ {interestAmount.toFixed(2)}</Text>
              </View>
              <View style={styles.calcRow}>
                <Text style={styles.calcLabel}>Repayment Due Date</Text>
                <Text style={[styles.calcVal, { color: COLORS.accentGold }]}>{dueDateStr}</Text>
              </View>
              <View style={styles.calcDivider} />
              <View style={styles.calcRow}>
                <Text style={styles.totalCalcLabel}>Total Repayment</Text>
                <Text style={styles.totalCalcVal}>GH₵ {totalRepayable.toFixed(2)}</Text>
              </View>
              <Text style={styles.aprNotice}>Estimated APR: {apr}% | {BOG_REGULATION_INFO.maxAprNotice}</Text>
            </View>

            {/* Terms checkbox */}
            <TouchableOpacity
              style={styles.termsRow}
              onPress={() => setAgreeToTerms(!agreeToTerms)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={agreeToTerms ? 'checkbox' : 'square-outline'}
                size={22}
                color={agreeToTerms ? COLORS.primary : COLORS.textMuted}
              />
              <Text style={styles.termsText}>
                I agree to the Bank of Ghana borrower disclosure statement and authorize automated MoMo deduction upon maturity.
              </Text>
            </TouchableOpacity>

            {/* Apply Button */}
            <TouchableOpacity
              style={[styles.applyBtn, isApplying && { opacity: 0.7 }]}
              onPress={handleApply}
              disabled={isApplying}
              activeOpacity={0.85}
            >
              {isApplying ? (
                <View style={styles.btnLoading}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.applyBtnText}>Disbursing to MoMo...</Text>
                </View>
              ) : (
                <Text style={styles.applyBtnText}>Disburse GH₵ {amount.toFixed(2)} to {MOMO_PROVIDERS[disbursementNetwork].shortName}</Text>
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
  productsScroll: {
    marginBottom: 16,
  },
  productCard: {
    width: 170,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    marginRight: 10,
  },
  activeProductCard: {
    borderColor: COLORS.primary,
    backgroundColor: '#F0FDF4',
    borderWidth: 2,
  },
  productBadge: {
    backgroundColor: COLORS.accentGoldLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  productBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.accentGold,
  },
  productName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    height: 36,
  },
  productRate: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 4,
  },
  productLimit: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  amountHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  limitNotice: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
  },
  amountBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    alignItems: 'center',
  },
  amountDisplay: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginBottom: 12,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
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
  tenureRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  tenureBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  activeTenureBtn: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tenureText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  activeTenureText: {
    color: '#FFFFFF',
  },
  tenureSub: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  activeTenureSub: {
    color: '#D1FAE5',
  },
  networksRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  momoPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  momoPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  calculationCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  cardSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  calcLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  calcVal: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  calcDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 8,
  },
  totalCalcLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  totalCalcVal: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  aprNotice: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 8,
    lineHeight: 14,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 16,
  },
  termsText: {
    flex: 1,
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  applyBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  btnLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
