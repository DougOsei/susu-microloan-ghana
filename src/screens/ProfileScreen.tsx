import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/theme';
import { UserProfile } from '../types';
import { BOG_REGULATION_INFO } from '../constants/ghana';

interface ProfileScreenProps {
  user: UserProfile;
  onOpenKycModal: () => void;
  onOpenAddBankModal: () => void;
  onUpdateUser: (user: UserProfile) => void;
  onLogout: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  user,
  onOpenKycModal,
  onOpenAddBankModal,
  onLogout,
}) => {
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user.fullName
              .split(' ')
              .map((n) => n[0])
              .slice(0, 2)
              .join('')}
          </Text>
        </View>
        <Text style={styles.userName}>{user.fullName}</Text>
        <Text style={styles.userPhone}>+233 {user.phone.substring(1)}</Text>

        <TouchableOpacity
          style={[styles.kycBadge, user.isGhanaCardVerified ? styles.verifiedBadge : styles.unverifiedBadge]}
          onPress={onOpenKycModal}
          activeOpacity={0.8}
        >
          <Ionicons
            name={user.isGhanaCardVerified ? 'shield-checkmark' : 'alert-circle'}
            size={14}
            color={user.isGhanaCardVerified ? COLORS.success : COLORS.warning}
          />
          <Text
            style={[
              styles.kycText,
              { color: user.isGhanaCardVerified ? COLORS.success : COLORS.accentGold },
            ]}
          >
            {user.isGhanaCardVerified ? 'Ghana Card Verified (Tier-2)' : 'Upgrade to Tier-2 (Ghana Card)'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* KYC & Identity Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Identity & Verification (Ghana Card)</Text>
        <View style={[styles.card, SHADOWS.sm]}>
          <View style={styles.rowItem}>
            <View style={styles.iconCircle}>
              <Ionicons name="card-outline" size={18} color={COLORS.primary} />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Ghana Card Number (NIA)</Text>
              <Text style={styles.rowSubtitle}>{user.ghanaCardNumber || 'Not submitted'}</Text>
            </View>
            <TouchableOpacity onPress={onOpenKycModal}>
              <Text style={styles.actionLink}>Update</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <View style={styles.rowItem}>
            <View style={styles.iconCircle}>
              <Ionicons name="speedometer-outline" size={18} color={COLORS.accentGold} />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Credit Limit Tier</Text>
              <Text style={styles.rowSubtitle}>Tier {user.kycLevel} (Max GH₵ {user.maxLoanLimit.toLocaleString()})</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Linked Bank Accounts */}
      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>Linked Bank Accounts (GhIPSS)</Text>
          <TouchableOpacity onPress={onOpenAddBankModal} activeOpacity={0.7}>
            <Text style={styles.linkAddText}>+ Link Bank</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.card, SHADOWS.sm]}>
          {user.bankAccounts && user.bankAccounts.length > 0 ? (
            user.bankAccounts.map((bank, idx) => (
              <React.Fragment key={bank.id}>
                <View style={styles.bankRowItem}>
                  <View style={[styles.iconCircle, { backgroundColor: '#E0F2FE' }]}>
                    <Ionicons name="business" size={18} color="#0369A1" />
                  </View>
                  <View style={styles.rowText}>
                    <View style={styles.bankNameBadgeRow}>
                      <Text style={styles.rowTitle}>{bank.bankName}</Text>
                      {bank.isPrimary && (
                        <View style={styles.primaryBadge}>
                          <Text style={styles.primaryBadgeText}>Primary</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.rowSubtitle}>
                      •••• {bank.accountNumber.slice(-4)} • {bank.branch || 'Accra'}
                    </Text>
                  </View>
                </View>
                {idx < (user.bankAccounts?.length || 0) - 1 && <View style={styles.divider} />}
              </React.Fragment>
            ))
          ) : (
            <View style={styles.emptyBankBox}>
              <Ionicons name="card-outline" size={24} color={COLORS.textMuted} />
              <Text style={styles.emptyBankText}>No commercial bank account linked yet</Text>
              <TouchableOpacity style={styles.addBankBtn} onPress={onOpenAddBankModal} activeOpacity={0.8}>
                <Text style={styles.addBankBtnText}>Link Ghana Bank Account</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Security & Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security & Notifications</Text>
        <View style={[styles.card, SHADOWS.sm]}>
          <View style={styles.rowItem}>
            <View style={styles.iconCircle}>
              <Ionicons name="finger-print-outline" size={18} color={COLORS.primary} />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Biometric Authentication</Text>
              <Text style={styles.rowSubtitle}>Fingerprint & Face Unlock</Text>
            </View>
            <Switch
              value={biometricsEnabled}
              onValueChange={setBiometricsEnabled}
              trackColor={{ false: '#CBD5E1', true: COLORS.primaryLight }}
              thumbColor={biometricsEnabled ? COLORS.primary : '#F1F5F9'}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.rowItem}>
            <View style={styles.iconCircle}>
              <Ionicons name="chatbubble-ellipses-outline" size={18} color={COLORS.primary} />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>MoMo SMS Notifications</Text>
              <Text style={styles.rowSubtitle}>Instant text on credit or debit</Text>
            </View>
            <Switch
              value={smsAlerts}
              onValueChange={setSmsAlerts}
              trackColor={{ false: '#CBD5E1', true: COLORS.primaryLight }}
              thumbColor={smsAlerts ? COLORS.primary : '#F1F5F9'}
            />
          </View>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.rowItem}
            onPress={() => Alert.alert('Security PIN', 'Enter your current 4-digit PIN to set a new one.')}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="lock-closed-outline" size={18} color={COLORS.primary} />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Change 4-Digit Security PIN</Text>
              <Text style={styles.rowSubtitle}>Used for approving loans and withdrawals</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Google Play & Regulatory Compliance Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Compliance, Legal & Licensing</Text>
        <View style={[styles.card, SHADOWS.sm]}>
          <TouchableOpacity style={styles.rowItem} onPress={() => setShowPrivacyPolicy(true)}>
            <View style={styles.iconCircle}>
              <Ionicons name="document-text-outline" size={18} color={COLORS.primary} />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Privacy Policy & Data Safety</Text>
              <Text style={styles.rowSubtitle}>Google Play Financial Services Compliant</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.rowItem} onPress={() => setShowTerms(true)}>
            <View style={styles.iconCircle}>
              <Ionicons name="shield-outline" size={18} color={COLORS.primary} />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Bank of Ghana Lending Disclosure</Text>
              <Text style={styles.rowSubtitle}>{BOG_REGULATION_INFO.licenseCategory}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.rowItem}
            onPress={() =>
              Alert.alert(
                'Contact QuickSave Ghana',
                'Toll Free: 0800-000-789\nWhatsApp: +233 24 412 3456\nEmail: support@quicksavegh.com\nAccra, Ghana'
              )
            }
          >
            <View style={styles.iconCircle}>
              <Ionicons name="help-buoy-outline" size={18} color={COLORS.primary} />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Customer Helpdesk & WhatsApp Support</Text>
              <Text style={styles.rowSubtitle}>24/7 dedicated support in English and Twi</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Log Out / Switch Account */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => {
            Alert.alert(
              'Log Out',
              'Are you sure you want to sign out? You will be returned to the account registration screen.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Log Out', style: 'destructive', onPress: onLogout },
              ]
            );
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={18} color={COLORS.danger} />
          <Text style={styles.logoutBtnText}>Log Out / Switch Account</Text>
        </TouchableOpacity>
      </View>

      {/* App Version */}
      <View style={styles.versionBox}>
        <Text style={styles.versionText}>QuickSave Mobile App v1.0.0 (Google Play Production Build)</Text>
        <Text style={styles.versionSub}>Package: com.quicksave.ghana • Target Market: Ghana 🇬🇭</Text>
      </View>

      {/* Privacy Policy Modal */}
      <Modal visible={showPrivacyPolicy} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Privacy Policy & Data Safety</Text>
              <TouchableOpacity onPress={() => setShowPrivacyPolicy(false)}>
                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              <Text style={styles.legalHeading}>1. Information We Collect</Text>
              <Text style={styles.legalBody}>
                QuickSave Ghana collects phone numbers, legal names, and Ghana Card identification numbers solely for Know-Your-Customer (KYC) compliance required under Bank of Ghana microfinance directives and the Data Protection Act 2012 (Act 843).
              </Text>

              <Text style={styles.legalHeading}>2. No Deceptive Permissions</Text>
              <Text style={styles.legalBody}>
                In strict compliance with Google Play Store Financial Services Policy, QuickSave does not access contact lists, call logs, SMS logs, or external photo galleries to enforce loan collection.
              </Text>

              <Text style={styles.legalHeading}>3. Mobile Money Payment Data</Text>
              <Text style={styles.legalBody}>
                All deposits and withdrawals are processed via authenticated Mobile Money gateways (MTN MoMo, Telecel Cash, and AT Money) with end-to-end tokenization and 256-bit SSL encryption.
              </Text>

              <Text style={styles.legalHeading}>4. Account Deletion Rights</Text>
              <Text style={styles.legalBody}>
                Users have the right to request deletion of their account and associated data by contacting privacy@quicksavegh.com after settling any outstanding loan balances.
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Terms Modal */}
      <Modal visible={showTerms} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Bank of Ghana Lending Disclosure</Text>
              <TouchableOpacity onPress={() => setShowTerms(false)}>
                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              <Text style={styles.legalHeading}>Bank of Ghana Tier-3 Microfinance Principles</Text>
              <Text style={styles.legalBody}>
                • All loan tenures are between 61 days and 180 days.{'\n'}
                • Monthly interest rates range from 2.5% to 4.5%.{'\n'}
                • The maximum Annual Percentage Rate (APR) does not exceed 54.0% p.a.{'\n'}
                • Processing fees are fully disclosed prior to disbursement (1.0% to 2.0%).{'\n'}
                • Borrower funds in Susu accounts are ring-fenced and insured under the Ghana Deposit Protection Scheme.
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  userPhone: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  kycBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    marginTop: 10,
  },
  verifiedBadge: {
    backgroundColor: COLORS.primaryLight,
  },
  unverifiedBadge: {
    backgroundColor: '#FEF3C7',
  },
  kycText: {
    fontSize: 11,
    fontWeight: '700',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  rowSubtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  actionLink: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  linkAddText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  bankRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  bankNameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primaryBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  primaryBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  emptyBankBox: {
    paddingVertical: 20,
    alignItems: 'center',
    gap: 8,
  },
  emptyBankText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  addBankBtn: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  addBankBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 14,
    paddingVertical: 14,
  },
  logoutBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.danger,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
  },
  versionBox: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  versionText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  versionSub: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  modalScroll: {
    marginBottom: 20,
  },
  legalHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginTop: 12,
    marginBottom: 4,
  },
  legalBody: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});
