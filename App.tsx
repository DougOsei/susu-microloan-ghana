import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar as RNStatusBar,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from './src/constants/theme';
import {
  INITIAL_USER,
  INITIAL_BALANCES,
  INITIAL_SAVINGS_GOALS,
  INITIAL_ACTIVE_LOANS,
  INITIAL_TRANSACTIONS,
} from './src/data/mockData';
import {
  UserProfile,
  WalletBalances,
  SavingsProduct,
  ActiveLoan,
  TransactionRecord,
} from './src/types';

// Screens
import { HomeScreen } from './src/screens/HomeScreen';
import { SavingsScreen } from './src/screens/SavingsScreen';
import { LoansScreen } from './src/screens/LoansScreen';
import { TransferScreen } from './src/screens/TransferScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';

// Modals
import { MoMoSelectorModal } from './src/components/MoMoSelectorModal';
import { LoanCalculatorModal } from './src/components/LoanCalculatorModal';
import { SavingsGoalModal } from './src/components/SavingsGoalModal';
import { GhanaCardKycModal } from './src/components/GhanaCardKycModal';
import { TransactionReceiptModal } from './src/components/TransactionReceiptModal';

type TabType = 'home' | 'savings' | 'loans' | 'transfers' | 'profile';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('home');

  // Core App State
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [balances, setBalances] = useState<WalletBalances>(INITIAL_BALANCES);
  const [savingsGoals, setSavingsGoals] = useState<SavingsProduct[]>(INITIAL_SAVINGS_GOALS);
  const [activeLoans, setActiveLoans] = useState<ActiveLoan[]>(INITIAL_ACTIVE_LOANS);
  const [transactions, setTransactions] = useState<TransactionRecord[]>(INITIAL_TRANSACTIONS);

  // Modal Visibility States
  const [momoModalVisible, setMomoModalVisible] = useState(false);
  const [momoMode, setMomoMode] = useState<'deposit' | 'withdraw'>('deposit');
  const [loanModalVisible, setLoanModalVisible] = useState(false);
  const [savingsModalVisible, setSavingsModalVisible] = useState(false);
  const [kycModalVisible, setKycModalVisible] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<TransactionRecord | null>(null);

  // Handlers for MoMo
  const handleOpenDeposit = () => {
    setMomoMode('deposit');
    setMomoModalVisible(true);
  };

  const handleOpenWithdraw = () => {
    setMomoMode('withdraw');
    setMomoModalVisible(true);
  };

  const handleMoMoSuccess = (tx: TransactionRecord, newBalance: number) => {
    setBalances((prev) => ({
      ...prev,
      availableBalance: newBalance,
    }));
    setTransactions((prev) => [tx, ...prev]);
    setSelectedReceipt(tx);
  };

  // Handlers for Savings
  const handleSavingsGoalCreated = (newGoal: SavingsProduct, tx: TransactionRecord) => {
    setSavingsGoals((prev) => [newGoal, ...prev]);
    setBalances((prev) => ({
      ...prev,
      availableBalance: prev.availableBalance - newGoal.currentAmount,
      totalSavings: prev.totalSavings + newGoal.currentAmount,
    }));
    setTransactions((prev) => [tx, ...prev]);
    setSelectedReceipt(tx);
  };

  const handleTopUpGoal = (goal: SavingsProduct) => {
    Alert.prompt
      ? Alert.prompt(
          'Top Up Savings',
          `Enter amount (GH₵) to add to ${goal.title}:`,
          (text) => {
            const amount = parseFloat(text);
            if (!amount || amount <= 0) return;
            applyTopUp(goal, amount);
          },
          'plain-text',
          '50'
        )
      : applyTopUp(goal, 100); // fallback for platforms without Alert.prompt
  };

  const applyTopUp = (goal: SavingsProduct, amount: number) => {
    if (balances.availableBalance < amount) {
      Alert.alert('Insufficient Balance', 'Please deposit via Mobile Money first.');
      return;
    }

    setBalances((prev) => ({
      ...prev,
      availableBalance: prev.availableBalance - amount,
      totalSavings: prev.totalSavings + amount,
    }));

    setSavingsGoals((prev) =>
      prev.map((g) => (g.id === goal.id ? { ...g, currentAmount: g.currentAmount + amount } : g))
    );

    const tx: TransactionRecord = {
      id: `tx_${Date.now()}`,
      type: 'savings_deposit',
      title: `Top-Up: ${goal.title}`,
      description: 'Saved from wallet balance',
      amount: amount,
      currency: 'GH₵',
      date: 'Just now',
      status: 'completed',
      reference: `SUSU-GH-${Math.floor(100000 + Math.random() * 900000)}`,
    };

    setTransactions((prev) => [tx, ...prev]);
    Alert.alert('Top Up Complete', `Added GH₵ ${amount.toFixed(2)} to ${goal.title}.`);
  };

  // Handlers for Loans
  const handleLoanApproved = (loan: ActiveLoan, tx: TransactionRecord) => {
    setActiveLoans((prev) => [loan, ...prev]);
    setBalances((prev) => ({
      ...prev,
      availableBalance: prev.availableBalance + loan.principalAmount,
      activeLoanDebt: prev.activeLoanDebt + loan.totalRepayment,
    }));
    setTransactions((prev) => [tx, ...prev]);
    setSelectedReceipt(tx);
  };

  const handleRepayLoan = (loan: ActiveLoan) => {
    const outstanding = loan.totalRepayment - loan.amountPaid;
    Alert.alert(
      'Repay MoMo Loan',
      `Outstanding balance: GH₵ ${outstanding.toFixed(2)}.\nSelect repayment amount:`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: `Pay Part (GH₵ 200)`,
          onPress: () => processRepayment(loan, Math.min(200, outstanding)),
        },
        {
          text: `Pay Full (GH₵ ${outstanding.toFixed(2)})`,
          onPress: () => processRepayment(loan, outstanding),
        },
      ]
    );
  };

  const processRepayment = (loan: ActiveLoan, payAmount: number) => {
    if (balances.availableBalance < payAmount) {
      Alert.alert(
        'Insufficient Balance',
        `Your wallet has GH₵ ${balances.availableBalance.toFixed(2)}. Please top up via Mobile Money to repay.`
      );
      return;
    }

    const newPaid = loan.amountPaid + payAmount;
    const isFullyPaid = newPaid >= loan.totalRepayment;

    setActiveLoans((prev) =>
      prev
        .map((l) =>
          l.id === loan.id
            ? { ...l, amountPaid: newPaid, status: (isFullyPaid ? 'paid' : 'active') as 'paid' | 'active' }
            : l
        )
        .filter((l) => l.status === 'active')
    );

    setBalances((prev) => ({
      ...prev,
      availableBalance: prev.availableBalance - payAmount,
      activeLoanDebt: Math.max(0, prev.activeLoanDebt - payAmount),
    }));

    // Reward on-time repayment with credit score boost!
    setUser((prev) => ({
      ...prev,
      creditScore: Math.min(850, prev.creditScore + 15),
      maxLoanLimit: Math.min(15000, prev.maxLoanLimit + 500),
    }));

    const tx: TransactionRecord = {
      id: `tx_${Date.now()}`,
      type: 'loan_repayment',
      title: `Loan Repayment: ${loan.productName}`,
      description: isFullyPaid ? 'Loan fully cleared! Credit score +15' : 'Partial repayment processed',
      amount: payAmount,
      currency: 'GH₵',
      date: 'Just now',
      status: 'completed',
      network: loan.network,
      reference: `LNRP-GH-${Math.floor(100000 + Math.random() * 900000)}`,
    };

    setTransactions((prev) => [tx, ...prev]);
    setSelectedReceipt(tx);
    Alert.alert(
      isFullyPaid ? 'Loan Fully Paid! 🎉' : 'Payment Received',
      isFullyPaid
        ? 'Congratulations! Your loan is settled. Your credit score increased by +15 points!'
        : `GH₵ ${payAmount.toFixed(2)} received.`
    );
  };

  const handleTransferCompleted = (tx: TransactionRecord, newBalance: number) => {
    setBalances((prev) => ({
      ...prev,
      availableBalance: newBalance,
    }));
    setTransactions((prev) => [tx, ...prev]);
    setSelectedReceipt(tx);
  };

  return (
    <SafeAreaView style={styles.rootContainer}>
      <StatusBar style="dark" />

      {/* Main Tab Screen Switcher */}
      <View style={styles.contentArea}>
        {currentTab === 'home' && (
          <HomeScreen
            user={user}
            balances={balances}
            savingsGoals={savingsGoals}
            activeLoans={activeLoans}
            transactions={transactions}
            onOpenDeposit={handleOpenDeposit}
            onOpenWithdraw={handleOpenWithdraw}
            onOpenSavingsModal={() => setSavingsModalVisible(true)}
            onOpenLoanModal={() => setLoanModalVisible(true)}
            onOpenKycModal={() => setKycModalVisible(true)}
            onSelectTransaction={(tx) => setSelectedReceipt(tx)}
            onRepayLoan={handleRepayLoan}
            onNavigateTab={(tab) => setCurrentTab(tab)}
          />
        )}

        {currentTab === 'savings' && (
          <SavingsScreen
            savingsGoals={savingsGoals}
            totalSavings={balances.totalSavings}
            totalInterestEarned={balances.totalInterestEarned}
            onOpenCreateGoal={() => setSavingsModalVisible(true)}
            onTopUpGoal={handleTopUpGoal}
          />
        )}

        {currentTab === 'loans' && (
          <LoansScreen
            user={user}
            activeLoans={activeLoans}
            onOpenLoanModal={() => setLoanModalVisible(true)}
            onRepayLoan={handleRepayLoan}
            onOpenKycModal={() => setKycModalVisible(true)}
          />
        )}

        {currentTab === 'transfers' && (
          <TransferScreen
            availableBalance={balances.availableBalance}
            onOpenDeposit={handleOpenDeposit}
            onOpenWithdraw={handleOpenWithdraw}
            onTransferCompleted={handleTransferCompleted}
          />
        )}

        {currentTab === 'profile' && (
          <ProfileScreen
            user={user}
            onOpenKycModal={() => setKycModalVisible(true)}
            onUpdateUser={(updated) => setUser(updated)}
          />
        )}
      </View>

      {/* Bottom Navigation Tab Bar */}
      <View style={styles.bottomTabBar}>
        <TouchableOpacity
          style={styles.tabBtn}
          onPress={() => setCurrentTab('home')}
          activeOpacity={0.7}
        >
          <Ionicons
            name={currentTab === 'home' ? 'home' : 'home-outline'}
            size={22}
            color={currentTab === 'home' ? COLORS.primary : COLORS.textMuted}
          />
          <Text style={[styles.tabLabel, currentTab === 'home' && styles.activeTabLabel]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabBtn}
          onPress={() => setCurrentTab('savings')}
          activeOpacity={0.7}
        >
          <Ionicons
            name={currentTab === 'savings' ? 'lock-closed' : 'lock-closed-outline'}
            size={22}
            color={currentTab === 'savings' ? COLORS.primary : COLORS.textMuted}
          />
          <Text style={[styles.tabLabel, currentTab === 'savings' && styles.activeTabLabel]}>Susu</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabBtn}
          onPress={() => setCurrentTab('loans')}
          activeOpacity={0.7}
        >
          <Ionicons
            name={currentTab === 'loans' ? 'flash' : 'flash-outline'}
            size={22}
            color={currentTab === 'loans' ? COLORS.primary : COLORS.textMuted}
          />
          <Text style={[styles.tabLabel, currentTab === 'loans' && styles.activeTabLabel]}>Loans</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabBtn}
          onPress={() => setCurrentTab('transfers')}
          activeOpacity={0.7}
        >
          <Ionicons
            name={currentTab === 'transfers' ? 'swap-horizontal' : 'swap-horizontal-outline'}
            size={22}
            color={currentTab === 'transfers' ? COLORS.primary : COLORS.textMuted}
          />
          <Text style={[styles.tabLabel, currentTab === 'transfers' && styles.activeTabLabel]}>MoMo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabBtn}
          onPress={() => setCurrentTab('profile')}
          activeOpacity={0.7}
        >
          <Ionicons
            name={currentTab === 'profile' ? 'person' : 'person-outline'}
            size={22}
            color={currentTab === 'profile' ? COLORS.primary : COLORS.textMuted}
          />
          <Text style={[styles.tabLabel, currentTab === 'profile' && styles.activeTabLabel]}>Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Modals */}
      <MoMoSelectorModal
        visible={momoModalVisible}
        mode={momoMode}
        currentBalance={balances.availableBalance}
        onClose={() => setMomoModalVisible(false)}
        onSuccess={handleMoMoSuccess}
      />

      <LoanCalculatorModal
        visible={loanModalVisible}
        userCreditScore={user.creditScore}
        maxLoanLimit={user.maxLoanLimit}
        userPhone={user.phone}
        onClose={() => setLoanModalVisible(false)}
        onLoanApproved={handleLoanApproved}
      />

      <SavingsGoalModal
        visible={savingsModalVisible}
        walletBalance={balances.availableBalance}
        onClose={() => setSavingsModalVisible(false)}
        onGoalCreated={handleSavingsGoalCreated}
      />

      <GhanaCardKycModal
        visible={kycModalVisible}
        user={user}
        onClose={() => setKycModalVisible(false)}
        onKycVerified={(updated) => setUser(updated)}
      />

      <TransactionReceiptModal
        visible={!!selectedReceipt}
        transaction={selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  contentArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  bottomTabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 4,
  },
  activeTabLabel: {
    color: COLORS.primary,
    fontWeight: '800',
  },
});
