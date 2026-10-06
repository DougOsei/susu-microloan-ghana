import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/theme';
import { MOMO_PROVIDERS, BOG_REGULATION_INFO } from '../constants/ghana';
import { MoMoNetwork, UserProfile } from '../types';

interface AuthScreenProps {
  onLoginSuccess: (user: UserProfile, isNewUser?: boolean) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('signup');

  // Sign Up Form Fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState<MoMoNetwork>('mtn');
  const [ghanaCard, setGhanaCard] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Sign In Form Fields
  const [loginPhone, setLoginPhone] = useState('0244123456');
  const [loginPin, setLoginPin] = useState('1234');

  const [isLoading, setIsLoading] = useState(false);

  // Auto-detect carrier from Ghana phone prefix
  const handlePhoneChange = (text: string) => {
    setPhone(text);
    if (text.length >= 3) {
      const prefix = text.substring(0, 3);
      if (MOMO_PROVIDERS.mtn.prefixes.includes(prefix)) {
        setSelectedNetwork('mtn');
      } else if (MOMO_PROVIDERS.telecel.prefixes.includes(prefix)) {
        setSelectedNetwork('telecel');
      } else if (MOMO_PROVIDERS.at.prefixes.includes(prefix)) {
        setSelectedNetwork('at');
      }
    }
  };

  const handleSignUp = () => {
    if (!fullName.trim() || fullName.trim().split(' ').length < 2) {
      Alert.alert('Full Name Required', 'Please enter your first and last legal name (e.g., Abena Osei).');
      return;
    }

    if (phone.length < 10) {
      Alert.alert('Invalid Phone', 'Please enter a valid 10-digit Ghana mobile money phone number.');
      return;
    }

    if (pin.length !== 4) {
      Alert.alert('Invalid PIN', 'Please choose a 4-digit security PIN.');
      return;
    }

    if (pin !== confirmPin) {
      Alert.alert('PIN Mismatch', 'The PIN and confirmation PIN do not match.');
      return;
    }

    if (!agreeTerms) {
      Alert.alert('Terms Agreement', 'Please accept the Bank of Ghana digital microfinance terms to continue.');
      return;
    }

    // Validate optional Ghana Card if entered
    const isCardEntered = ghanaCard.trim().length > 0;
    const cardRegex = /^GHA-\d{9}-\d$/i;
    if (isCardEntered && !cardRegex.test(ghanaCard.trim())) {
      Alert.alert(
        'Invalid Ghana Card',
        'Ghana Card must match format GHA-XXXXXXXXX-X (e.g. GHA-123456789-0) or leave blank to verify later.'
      );
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

      const newUser: UserProfile = {
        id: `usr_gh_${Date.now()}`,
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: `${fullName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
        ghanaCardNumber: isCardEntered ? ghanaCard.trim().toUpperCase() : '',
        isGhanaCardVerified: isCardEntered,
        kycLevel: isCardEntered ? 2 : 1,
        creditScore: isCardEntered ? 650 : 580,
        maxLoanLimit: isCardEntered ? 5000 : 1000,
        pin: pin,
        preferredMoMo: selectedNetwork,
        bankAccounts: [],
      };

      Alert.alert(
        'Akwaaba to QuickSave! 🇬🇭',
        `Account created successfully for ${fullName}. You have been credited with a GH₵ 50.00 welcome bonus!`
      );

      onLoginSuccess(newUser, true);
    }, 1500);
  };

  const handleLogin = () => {
    if (loginPhone.length < 10) {
      Alert.alert('Invalid Phone', 'Please enter your 10-digit phone number.');
      return;
    }

    if (loginPin.length < 4) {
      Alert.alert('Enter PIN', 'Please enter your 4-digit PIN.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

      // Log in demo user or active profile
      const userProfile: UserProfile = {
        id: 'usr_gh_982341',
        fullName: 'Kwame Asante Mensah',
        phone: loginPhone,
        email: 'kwame.mensah@gmail.com',
        ghanaCardNumber: 'GHA-724183921-9',
        isGhanaCardVerified: true,
        kycLevel: 2,
        creditScore: 735,
        maxLoanLimit: 5000,
        pin: loginPin,
        preferredMoMo: 'mtn',
      };

      onLoginSuccess(userProfile, false);
    }, 1200);
  };

  const currentProvider = MOMO_PROVIDERS[selectedNetwork];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Brand Banner */}
        <View style={styles.banner}>
          <View style={styles.brandBadge}>
            <Text style={styles.flagEmoji}>🇬🇭</Text>
            <Text style={styles.appName}>QuickSave Ghana</Text>
          </View>
          <Text style={styles.tagline}>Susu Savings, SafeLock & Mobile Money Micro-Loans</Text>
          <Text style={styles.licenseNotice}>Regulated under Bank of Ghana Tier-3 Microfinance Act</Text>
        </View>

        {/* Tab Toggle: Sign Up vs Sign In */}
        <View style={styles.authToggle}>
          <TouchableOpacity
            style={[styles.toggleBtn, mode === 'signup' && styles.activeToggleBtn]}
            onPress={() => setMode('signup')}
            activeOpacity={0.8}
          >
            <Text style={[styles.toggleBtnText, mode === 'signup' && styles.activeToggleText]}>
              Create New Account
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleBtn, mode === 'login' && styles.activeToggleBtn]}
            onPress={() => setMode('login')}
            activeOpacity={0.8}
          >
            <Text style={[styles.toggleBtnText, mode === 'login' && styles.activeToggleText]}>
              Sign In
            </Text>
          </TouchableOpacity>
        </View>

        {mode === 'signup' ? (
          /* Sign Up Form */
          <View style={[styles.card, SHADOWS.md]}>
            <Text style={styles.cardTitle}>Open Your QuickSave Account</Text>
            <Text style={styles.cardSubtitle}>Start saving via MoMo and unlock instant micro-credit</Text>

            {/* Full Name */}
            <Text style={styles.fieldLabel}>Full Legal Name</Text>
            <TextInput
              style={styles.textInput}
              value={fullName}
              onChangeText={setFullName}
              placeholder="e.g. Abena Serwaa Osei"
              placeholderTextColor={COLORS.textMuted}
            />

            {/* Phone Number */}
            <Text style={styles.fieldLabel}>Ghana Mobile Money Number</Text>
            <View style={styles.phoneInputRow}>
              <View style={styles.flagPrefix}>
                <Text style={styles.flagText}>🇬🇭 +233</Text>
              </View>
              <TextInput
                style={styles.phoneInput}
                value={phone}
                onChangeText={handlePhoneChange}
                keyboardType="phone-pad"
                maxLength={10}
                placeholder="0244123456"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            {/* Network Selector */}
            <Text style={styles.fieldLabel}>Primary Mobile Money Wallet</Text>
            <View style={styles.networksRow}>
              {(['mtn', 'telecel', 'at'] as MoMoNetwork[]).map((net) => {
                const prov = MOMO_PROVIDERS[net];
                const isSelected = selectedNetwork === net;
                return (
                  <TouchableOpacity
                    key={net}
                    style={[
                      styles.networkPill,
                      isSelected && { borderColor: prov.badgeColor, borderWidth: 2, backgroundColor: '#F8FAFC' },
                    ]}
                    onPress={() => setSelectedNetwork(net)}
                  >
                    <View style={[styles.netDot, { backgroundColor: prov.badgeColor }]} />
                    <Text style={styles.netPillText}>{prov.shortName}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Ghana Card (Optional/Instant) */}
            <View style={styles.labelWithBadge}>
              <Text style={styles.fieldLabel}>Ghana Card PIN (NIA)</Text>
              <View style={styles.optionalBadge}>
                <Text style={styles.optionalText}>Unlocks GH₵ 5,000</Text>
              </View>
            </View>
            <TextInput
              style={styles.textInput}
              value={ghanaCard}
              onChangeText={setGhanaCard}
              placeholder="GHA-XXXXXXXXX-X (Optional now)"
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="characters"
            />

            {/* PIN & Confirm PIN */}
            <View style={styles.pinRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>4-Digit PIN</Text>
                <TextInput
                  style={styles.pinInput}
                  value={pin}
                  onChangeText={setPin}
                  keyboardType="number-pad"
                  maxLength={4}
                  secureTextEntry
                  placeholder="••••"
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Confirm PIN</Text>
                <TextInput
                  style={styles.pinInput}
                  value={confirmPin}
                  onChangeText={setConfirmPin}
                  keyboardType="number-pad"
                  maxLength={4}
                  secureTextEntry
                  placeholder="••••"
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>
            </View>

            {/* Terms checkbox */}
            <TouchableOpacity
              style={styles.termsRow}
              onPress={() => setAgreeTerms(!agreeTerms)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={agreeTerms ? 'checkbox' : 'square-outline'}
                size={22}
                color={agreeTerms ? COLORS.primary : COLORS.textMuted}
              />
              <Text style={styles.termsText}>
                I agree to the Bank of Ghana borrower rights and QuickSave terms of service.
              </Text>
            </TouchableOpacity>

            {/* Submit */}
            <TouchableOpacity
              style={[styles.actionBtn, isLoading && { opacity: 0.7 }]}
              onPress={handleSignUp}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.actionBtnText}>Creating Account...</Text>
                </View>
              ) : (
                <Text style={styles.actionBtnText}>Create Account & Get GH₵ 50 Bonus</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          /* Sign In Form */
          <View style={[styles.card, SHADOWS.md]}>
            <Text style={styles.cardTitle}>Welcome Back</Text>
            <Text style={styles.cardSubtitle}>Enter your phone number and PIN to access your account</Text>

            <Text style={styles.fieldLabel}>Phone Number</Text>
            <View style={styles.phoneInputRow}>
              <View style={styles.flagPrefix}>
                <Text style={styles.flagText}>🇬🇭 +233</Text>
              </View>
              <TextInput
                style={styles.phoneInput}
                value={loginPhone}
                onChangeText={setLoginPhone}
                keyboardType="phone-pad"
                maxLength={10}
                placeholder="0244123456"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            <Text style={styles.fieldLabel}>4-Digit Security PIN</Text>
            <TextInput
              style={[styles.textInput, { fontSize: 20, letterSpacing: 6 }]}
              value={loginPin}
              onChangeText={setLoginPin}
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
              placeholder="••••"
              placeholderTextColor={COLORS.textMuted}
            />

            <TouchableOpacity
              style={[styles.actionBtn, isLoading && { opacity: 0.7 }]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.actionBtnText}>Authenticating...</Text>
                </View>
              ) : (
                <Text style={styles.actionBtnText}>Sign In to Account</Text>
              )}
            </TouchableOpacity>

            {/* Quick Demo Login Preset */}
            <View style={styles.demoLoginBox}>
              <Text style={styles.demoTitle}>Demo Quick Sign In</Text>
              <TouchableOpacity
                style={styles.demoBtn}
                onPress={() => {
                  setLoginPhone('0244123456');
                  setLoginPin('1234');
                  handleLogin();
                }}
              >
                <Text style={styles.demoBtnText}>⚡ Log in as Kwame Mensah (GH₵ 2,450 balance)</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Security Footer */}
        <View style={styles.footerNotice}>
          <Ionicons name="lock-closed" size={14} color={COLORS.textSecondary} />
          <Text style={styles.footerText}>
            256-Bit SSL Encrypted • Data Protected under Ghana Act 843
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  banner: {
    backgroundColor: COLORS.primaryDark,
    paddingTop: 36,
    paddingBottom: 28,
    paddingHorizontal: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    alignItems: 'center',
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  flagEmoji: {
    fontSize: 24,
  },
  appName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 13,
    color: '#D1FAE5',
    textAlign: 'center',
    marginTop: 6,
    fontWeight: '600',
  },
  licenseNotice: {
    fontSize: 10,
    color: '#A7F3D0',
    marginTop: 4,
  },
  authToggle: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 14,
    padding: 4,
    marginHorizontal: 20,
    marginTop: -16,
    ...SHADOWS.md,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeToggleBtn: {
    backgroundColor: '#FFFFFF',
  },
  toggleBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  activeToggleText: {
    color: COLORS.primaryDark,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  cardSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
    marginTop: 10,
  },
  labelWithBadge: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  optionalBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  optionalText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: COLORS.textPrimary,
    backgroundColor: '#F8FAFC',
  },
  phoneInputRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
  },
  flagPrefix: {
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
  phoneInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  networksRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  networkPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#F8FAFC',
  },
  netDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  netPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  pinRow: {
    flexDirection: 'row',
    gap: 12,
  },
  pinInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingVertical: 10,
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 8,
    color: COLORS.textPrimary,
    backgroundColor: '#F8FAFC',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 16,
    marginBottom: 8,
  },
  termsText: {
    flex: 1,
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  actionBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    ...SHADOWS.md,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  demoLoginBox: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  demoTitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  demoBtn: {
    backgroundColor: '#F0FDF4',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    alignItems: 'center',
  },
  demoBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  footerNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 22,
  },
  footerText: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
});
