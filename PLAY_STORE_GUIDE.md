# Google Play Store Submission Guide for QuickSave Ghana 🇬🇭

This document provides a step-by-step roadmap for uploading and publishing **QuickSave Ghana** on the Google Play Store, adhering to Google's **Personal Loans & Financial Services Policy**.

---

## 1. Prerequisites
1. **Google Play Console Developer Account**:
   - Register at [play.google.com/console](https://play.google.com/console).
   - Pay the one-time $25 USD registration fee.
   - Complete Google's developer identity verification (passport or Ghana Card).
2. **Bank of Ghana Microfinance or Digital Credit License**:
   - Google requires lending apps targeting Ghana to upload proof of license or partnership with a Bank of Ghana regulated institution (Tier 3/Tier 4 microfinance or commercial bank partner).

---

## 2. Generating the Android App Bundle (`.aab`)
Google Play Store requires an **Android App Bundle (.aab)** instead of a traditional `.apk`.

You can generate this in the cloud using **EAS Build** (no Android Studio installation required):

```bash
# 1. Install EAS CLI globally
npm install -g eas-cli

# 2. Log in with your free Expo account
eas login

# 3. Build your production Android App Bundle
eas build -p android --profile production
```
Once the cloud build finishes (takes ~5-8 minutes), you will receive a direct download link for `quicksave-ghana.aab`.

---

## 3. Store Listing Details

### App Title
`QuickSave Ghana: MoMo Savings & Loans`

### Short Description (Up to 80 characters)
`Microfinance savings & loans app with MTN MoMo, Telecel & AT Money in Ghana.`

### Full Description (Recommended Template)
```text
QuickSave Ghana is your premier digital microfinance companion designed specifically for Ghanaians. Bridge traditional Susu savings with modern digital banking, and get instant access to fair, transparent micro-loans disbursed in 60 seconds directly into your Mobile Money wallet.

🇬🇭 INTEGRATED WITH ALL GHANA MOBILE MONEY NETWORKS:
• MTN Mobile Money (MoMo)
• Telecel Cash (formerly Vodafone Cash)
• AT Money (formerly AirtelTigo Money)
• Interbank transfers via GhIPSS Instant Pay (GIP)

💰 SUSU & HIGH-YIELD SAVINGS:
• Daily & Weekly Susu Thrift: Automate your rotational or market target savings with 12.0% annual returns.
• SafeLock Fixed Vault: Lock funds for 30 to 180 days with guaranteed yields up to 14.5% p.a.
• Emergency Cushion: Maintain instant-access liquidity for unexpected family or medical needs.

⚡ FAIR, TRANSPARENT MICRO-LOANS:
• Quick Nano-Credit: GH₵ 100 to GH₵ 1,000 for everyday urgent expenses.
• Market Trader Booster: Working capital loans for traders, shop owners, and artisans up to GH₵ 6,000.
• Susu Advance: Borrow up to 80% of your active Susu savings at discounted prime interest rates.
• Instant disbursement directly into your MoMo phone wallet.
• Fair terms: Build your credit score with on-time repayments to unlock higher limits up to GH₵ 10,000!

📋 REGULATORY DISCLOSURE & REPRESENTATIVE EXAMPLE:
QuickSave operates in strict compliance with the Bank of Ghana Tier-3 Microfinance & Digital Credit regulatory framework.
• Loan Tenure: 61 days to 180 days.
• Monthly Interest Rate: 2.5% - 4.5% per month.
• Maximum Annual Percentage Rate (APR): 36% - 54% p.a.
• One-time Processing Fee: 1.0% - 2.0%.

Representative Loan Calculation:
- Loan Principal: GH₵ 1,000
- Tenure: 90 days (3 months)
- Monthly Interest Rate: 3.8% (Total interest: GH₵ 114)
- Processing Fee (2%): GH₵ 20
- Total Repayable Amount: GH₵ 1,114 (split into 3 monthly installments of GH₵ 371.33)
- Effective APR: 45.6%

🛡️ PRIVACY & CONSUMER SAFETY:
• We NEVER access your private contacts, call logs, SMS inbox, or personal photo galleries to enforce collection.
• Verified KYC through Ghana Card (National Identification Authority - NIA).
• 256-bit banking-grade SSL encryption for all transactions.

Need help? Contact our Accra support desk:
• WhatsApp: +233 24 412 3456
• Toll-Free: 0800-000-789
• Email: support@quicksavegh.com
```

---

## 4. Financial Services Declaration Form (Google Play Console)
When submitting to the Play Console, you must complete the **Financial Services Declaration**:

1. **Category**: Select **Personal Loans**.
2. **License**: Check "My app is licensed by a government regulator" -> Select **Bank of Ghana**.
3. **Upload License**: Upload your Tier-3 Microfinance Certificate or Partner Agreement.
4. **Loan Details**:
   - Minimum repayment period: `61 days`
   - Maximum repayment period: `180 days`
   - Maximum APR: `54%`
5. **Privacy Policy**: Provide the URL to your hosted privacy policy (or in-app policy).

---

## 5. Data Safety Form Answers
Under the Google Play Data Safety questionnaire:
- **Personal Info**: Phone Number & Name (Collected for account creation & fraud prevention).
- **Financial Info**: Purchase/Transaction history and credit score (Collected for loan evaluation and savings management).
- **Location**: Optional / Approximate.
- **Photos / Files / Contacts**: **NO** (Google strictly bans personal loan apps from accessing contacts or storage photos).
- **Data Sharing**: Data is not sold to third-party data brokers.
- **Encryption in transit**: Yes (HTTPS / TLS 1.3).
- **Account Deletion**: Yes (Mechanism available to delete account upon settlement of debts).

---

## 6. Release Tracks
1. **Internal Testing**: Upload your `.aab` file and invite your team testers.
2. **Closed Testing (20 Testers)**: Google requires 20 testers opted-in for 14 days for personal developer accounts.
3. **Production Release**: Submit for review (takes 2-5 business days for financial apps).
