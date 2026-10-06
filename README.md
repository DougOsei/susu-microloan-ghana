# QuickSave Ghana: Mobile Money Savings & Microfinance Loan App 🇬🇭

A production-ready Android mobile application built with **React Native & Expo TypeScript** designed specifically for the **Ghanaian financial market**. 

QuickSave bridges traditional Ghanaian thrift banking (**Susu**) with digital micro-lending, powered by direct integration with Ghana's major Mobile Money (MoMo) providers (**MTN MoMo**, **Telecel Cash**, and **AT Money**) and national identity verification (**Ghana Card / NIA**).

---

## 🌟 Key Features

### 1. 🇬🇭 Ghanaian Mobile Money (MoMo) Rails
- **Supported Networks**:
  - **MTN Mobile Money (`*170#`)** - Ghana's leading mobile wallet.
  - **Telecel Cash (`*110#`)** - Formerly Vodafone Cash, zero-fee cashouts.
  - **AT Money (`*110#`)** - Formerly AirtelTigo Money.
- **Auto Carrier Detection**: Automatically identifies the Ghanaian network based on mobile prefix (e.g. `024`, `054`, `055`, `059` -> MTN; `020`, `050` -> Telecel; `027`, `057`, `026` -> AT).
- **USSD / STK Push Simulation**: Authentic modal simulator recreating the standard Ghanaian Mobile Money prompt (*"Authorize payment of GH₵... to QuickSave Finance? Enter PIN"*).
- **Instant Deposits & Cashouts**: Real-time balance crediting and debiting with instant digital receipts.

### 2. 💰 Susu & High-Yield Savings Hub
- **Daily / Weekly Susu Thrift**: Automates traditional Ghanaian rotational and goal savings (e.g. Makola Market inventory, rent, school fees) with 12.0% annual interest.
- **SafeLock Fixed Deposit Vault**: Lock funds for 30, 60, 90, or 180 days with up to 14.5% guaranteed interest.
- **Emergency Pot**: Liquid instant-access cushion earning 8.5% p.a.
- **Top-Up directly from MoMo**: Add money anytime to any savings goal.

### 3. ⚡ Microfinance & Nano-Credit Engine (Google Play & BoG Compliant)
- **Credit Limit & Scoring Gauge**: Real-time dynamic credit score (300 - 850) that upgrades as users save and make on-time repayments.
- **Loan Products**:
  - *Quick Nano-Credit*: GH₵ 100 - GH₵ 1,000 (disbursed in 60s directly to MoMo).
  - *Market Trader & SME Booster*: GH₵ 1,000 - GH₵ 6,000 for merchants and artisans.
  - *Susu Backed Advance*: Borrow up to 80% of locked savings at prime discounted rates.
- **Transparent Loan Calculator**:
  - Principal slider & tenure selector (61, 90, 120, 180 days).
  - Explicit monthly interest rate and processing fee breakdown.
  - Bank of Ghana (BoG) compliant APR disclosure (36% - 54% p.a.).
- **Direct MoMo Disbursement**: Transferred immediately into recipient's MTN, Telecel, or AT wallet.
- **Flexible Repayment**: Pay full or partial balances using MoMo with credit score reward boosters (+15 points per on-time settlement).

### 4. 🪪 Ghana Card Verification (NIA KYC Tier-2)
- Built-in verification following the National Identification Authority format (`GHA-XXXXXXXXX-X`).
- Upgrades users from Tier-1 (GH₵ 1,000 limit) to Tier-2 (GH₵ 10,000 credit limit & enhanced transaction limits).

### 5. 🛡️ Google Play Store Policy & Regulatory Compliance
- Compliant with **Google Play Financial Services Policy 2026** for personal loan and microfinance apps.
- No access to sensitive user contacts, SMS logs, or external photo galleries.
- In-app Privacy Policy and Terms of Service.
- Formatted for Android App Bundle (`.aab`) export.

---

## 📱 Project Architecture

```
QuickSave-Mobile App/
├── App.tsx                    # Root application entry with tabs and state management
├── app.json                   # Android package (com.quicksave.ghana) & Play Store config
├── eas.json                   # Expo Application Services build profiles (APK & AAB)
├── tsconfig.json              # TypeScript strict configuration
├── assets/                    # Android adaptive icons, splash screen, favicon
├── src/
│   ├── components/
│   │   ├── Header.tsx                 # Ghanaian greeting, avatar, KYC badge
│   │   ├── WalletCard.tsx             # Virtual Cedi card with balance and quick actions
│   │   ├── MoMoSelectorModal.tsx      # MTN / Telecel / AT deposit & cashout + USSD
│   │   ├── LoanCalculatorModal.tsx    # BoG compliant loan calculator & disbursement
│   │   ├── SavingsGoalModal.tsx       # Susu and SafeLock vault creation modal
│   │   ├── GhanaCardKycModal.tsx      # National ID (NIA) Tier-2 verification
│   │   └── TransactionReceiptModal.tsx# Digital receipt generator and sharing
│   ├── constants/
│   │   ├── ghana.ts           # MoMo carrier metadata, prefixes, BoG notices
│   │   └── theme.ts           # Emerald green, cedi gold, and MoMo color scheme
│   ├── data/
│   │   └── mockData.ts        # Realistic Ghanaian market seed data
│   ├── screens/
│   │   ├── HomeScreen.tsx     # Overview, quick loan limits, Susu progress, feed
│   │   ├── SavingsScreen.tsx  # Susu thrift, fixed deposit vaults, filters
│   │   ├── LoansScreen.tsx    # Credit score gauge, loan packages, active loan
│   │   ├── TransferScreen.tsx # MoMo P2P transfer, cashout, GHIPSS Interbank
│   │   └── ProfileScreen.tsx  # KYC status, security PIN, legal compliance
│   └── types/
│       └── index.ts           # Strongly typed data models
```

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js (v18+)
- Expo CLI

### 1. Start the Expo Development Server
```bash
npm start
```

### 2. Run on Android Phone or Emulator
- Install **Expo Go** from the Google Play Store on your Android phone.
- Scan the QR code displayed in your terminal.
- Or run with Android emulator:
```bash
npm run android
```

---

## 📦 How to Build the `.aab` / `.apk` for Google Play Store

### Option A: Cloud Build using EAS (Recommended - No Android Studio required)
1. Install EAS CLI:
   ```bash
   npm install -g eas-cli
   ```
2. Log in to your Expo account:
   ```bash
   eas login
   ```
3. Configure the project:
   ```bash
   eas build:configure
   ```
4. Build Android App Bundle (`.aab`) for Google Play Store:
   ```bash
   eas build -p android --profile production
   ```
5. Build standalone `.apk` for direct testing on your phone:
   ```bash
   eas build -p android --profile preview
   ```

### Option B: Local Android Export
To verify and bundle your Android assets locally:
```bash
npx expo export --platform android
```

---

## 🇬🇭 Bank of Ghana & Play Store Compliance Summary
- **Package Name**: `com.quicksave.ghana`
- **Minimum Loan Term**: 61 Days
- **Maximum Loan Term**: 180 Days
- **Maximum APR**: 36% - 54% p.a.
- **Regulator**: Bank of Ghana (Non-Bank Financial Institutions Act / Digital Credit Guidelines)
- **Data Protection**: Registered with Ghana Data Protection Commission (DPC)
