# FILE-BY-FILE TRANSLATION REQUIREMENTS

This document lists every file that needs translation updates and exactly what needs to be done.

---

## 🔴 CRITICAL FILES (Highest Priority - 32+ strings)

### 1. src/pages/SettingsPage.tsx
**Strings to Translate: 32**

| Line | Current Text | Translation Key |
|------|--------------|-----------------|
| 112 | Settings | settings_heading |
| 117 | Select a category from the left to manage your settings. | settings_select_category_message |
| 130 | Profile | settings_profile_heading |
| 152 | Email cannot be changed | email_cannot_be_changed |
| 165 | Enter your display name | enter_display_name_placeholder |
| 174 | No plan selected | no_plan_selected |
| 227 | Share this link to invite others and earn rewards. | share_link_to_earn_rewards |
| 63 | Profile updated successfully! | profile_updated_successfully_exclamation |
| 65 | Failed to update profile | profile_update_failed |
| 232 | Saving... | saving_button_state |
| 248 | Security Settings | security_settings_heading |
| 254 | Update your password to keep your account secure. | update_password_security_message |
| 256 | Change Password | change_password_button |
| 261 | Two-Factor Authentication | two_factor_authentication_heading |
| 263 | Add an extra layer of security to your account with 2FA. | two_factor_security_description |
| 267 | Status: | status_label |
| 269 | Disabled | status_disabled |
| 271 | Enable 2FA | enable_2fa_button |
| 276 | Account Deletion | account_deletion_heading |
| 278 | Permanently delete your account and all data. | account_deletion_warning |
| 281 | Delete Account | delete_account_button |
| 287 | Notification Preferences | notification_preferences_heading |
| 306 | Email Notifications | email_notifications_setting |
| 306a | Receive updates about your posts and content. | email_notifications_description |
| 311 | Push Notifications | push_notifications_setting |
| 311a | Get instant alerts in your browser. | push_notifications_description |
| 316 | Marketing Emails | marketing_emails_setting |
| 316a | Receive news about features and updates. | marketing_emails_description |
| 321 | Product Updates | product_updates_setting |
| 321a | Get notified about new features and improvements. | product_updates_description |
| 384 | Appearance | appearance_settings_heading |
| 388 | App Themes | app_themes_heading |
| 391 | Choose from our collection of beautiful themes based on the app's features. | app_themes_description |
| 436 | 💡 Tip: Themes are based on the app's feature categories from the onboarding process. Changes apply instantly across the entire application. | app_themes_tip |

**Changes Required:**
- Import `useTranslation` at top: `import { useTranslation } from "react-i18next";`
- In component: `const { t } = useTranslation();`
- Wrap all hardcoded strings with `t("key_name")`

---

## 🟠 HIGH PRIORITY FILES (20+ strings)

### 2. src/components/CampaignSetup.tsx
**Strings to Translate: 20**

**Industries Section (12 strings) - Lines 48-59:**
- Technology → industry_technology
- Healthcare → industry_healthcare
- Finance → industry_finance
- E-commerce → industry_ecommerce
- Education → industry_education
- Food & Beverage → industry_food_beverage
- Fashion → industry_fashion
- Real Estate → industry_real_estate
- Automotive → industry_automotive
- Entertainment → industry_entertainment
- Non-profit → industry_nonprofit
- Other → industry_other

**Tones Section (5 strings with descriptions):**
- Professional / Formal and authoritative → tone_professional_campaign / tone_professional_description
- Playful / Fun and energetic → tone_playful_campaign / tone_playful_description
- Motivational / Inspiring and uplifting → tone_motivational_campaign / tone_motivational_description
- Casual / Relaxed and friendly → tone_casual_campaign / tone_casual_description
- Authoritative / Expert and trustworthy → tone_authoritative_campaign / tone_authoritative_description

**Error Messages (3 strings):**
- Line 143: "Please enter a campaign name" → campaign_name_required_error
- Line 148: "Please select at least one platform" → campaign_platform_required_error

**Special Note:** Consider refactoring industries array to use key-value pairs for easier translation.

---

### 3. src/components/PricingModals.tsx
**Strings to Translate: 10**

| Line | Current Text | Translation Key |
|------|--------------|-----------------|
| 55 | Processing your payment | processing_payment_title |
| 59 | Hold tight while we complete your secure transaction. | payment_processing_message |
| 70 | Confirm Plan | confirm_plan_modal_title |
| 103 | We are committed to secure payments for businesses and service providers without any limitations. | secure_payment_commitment |
| 108 | Proceed to Checkout | proceed_to_checkout_button |
| 120 | Downgrade Request Pending | downgrade_request_pending_title |
| 123 | You have already requested a downgrade. It will be applied in your next billing cycle. | downgrade_request_pending_message |

---

## 🟡 MEDIUM PRIORITY FILES (8-9 strings)

### 4. src/pages/ProfilePage.tsx
**Strings to Translate: 9**

| Line | Current Text | Translation Key |
|------|--------------|-----------------|
| 95 | Your Profile | your_profile_default |
| 114 | Plan | plan_text_suffix |
| 125 | Business | profile_type_business |
| 126 | Creator | profile_type_creator |
| 171 | Free | plan_free_display |
| 190 | No Expire | no_expiration_text |
| 223, 226, 235, 318, 448 | Not set | not_set_default |
| 226 | Tone not set | tone_not_set |
| 235 | Add public URL | add_public_url_placeholder |

---

### 5. src/components/TierSelectionModal.tsx
**Strings to Translate: 8**

| Section | Current Text | Translation Key |
|---------|--------------|-----------------|
| Free tier | Perfect for getting started | free_tier_description |
| Free button | Get Started Free | get_started_free_button |
| Pro tier | Most popular for creators | pro_tier_description |
| Pro button | Start Pro Trial | start_pro_trial_button |
| Business tier | For teams and businesses | business_tier_description |
| Business button | Start Business Trial | start_business_trial_button |
| Button state | Setting up... | setting_up_button_state |
| Disclaimer | All plans include a 14-day free trial. No credit card required for Free plan. | trial_disclaimer |

---

### 6. src/components/SubscriptionPauseModal.tsx
**Strings to Translate: 5**

| Line | Current Text | Translation Key |
|------|--------------|-----------------|
| 120 | Downgrade Request Pending | downgrade_request_pending_title |
| 123 | You have already requested a downgrade. It will be applied in your next billing cycle. | downgrade_request_pending_message |
| 141 | Coins: {{coins}} — Limit: {{limit}} | coins_limit_display |

---

## 🟢 LOWER PRIORITY FILES (1-3 strings)

### 7. src/pages/TransactionsTable.tsx
**Strings to Translate: 3**

| Line | Current Text | Translation Key |
|------|--------------|-----------------|
| 36 | Auto-Renewed | transaction_auto_renewed_status |
| 36 | No Receipt | transaction_no_receipt_status |
| 68 | Copy to clipboard | copy_to_clipboard_tooltip |

---

### 8. src/pages/pricing-card.tsx
**Strings to Translate: 7**

| Line | Current Text | Translation Key |
|------|--------------|-----------------|
| 48 | Current Plan | current_plan_badge |
| 48 | Pending Downgrade | pending_downgrade_badge |
| 96 | Ideal for: | ideal_for_label |
| 97 | Small agency, growing business, content team | ideal_for_default_text |
| 72 | Processing... | processing_button_state |

---

### 9. src/pages/PricingPage.tsx
**Strings to Translate: 5**

| Line | Current Text | Translation Key |
|------|--------------|-----------------|
| 354 | Forever | pricing_forever_period |
| 354 | Month | pricing_month_period |

---

### 10. src/pages/PackagePaymentSuccess.tsx
**Strings to Translate: 2**

| Line | Current Text | Translation Key |
|------|--------------|-----------------|
| 83 | Package Status | package_status_title |
| 144 | Copied | copied_status |
| 144 | Copy | copy_button_text |

---

### 11. src/pages/PackageAddonSuccess.tsx
**Strings to Translate: 2**

| Line | Current Text | Translation Key |
|------|--------------|-----------------|
| 83 | Payment Status | payment_status_title |
| 140 | Copied | copied_status |
| 140 | Copy | copy_button_text |

---

### 12. src/components/OtpModal.tsx
**Strings to Translate: 2**

| Line | Current Text | Translation Key |
|------|--------------|-----------------|
| 225 | Resend in {{remaining}}s | resend_in_seconds |
| 93 | Please enter the complete OTP. | otp_incomplete_error |

---

## 📋 IMPLEMENTATION CHECKLIST

### Phase 1: Prepare Translation Files (30 minutes)
- [ ] Open `/public/locales/en/translation.json`
- [ ] Copy all keys from `MISSING_TRANSLATIONS_KEYS.json`
- [ ] Paste into English translation file
- [ ] Repeat for Spanish (`/public/locales/es/translation.json`)
- [ ] Repeat for Chinese (`/public/locales/zh/translation.json`)

### Phase 2: Update Components (6-8 hours)
For each file above:
- [ ] Add `import { useTranslation } from "react-i18next";`
- [ ] Add `const { t } = useTranslation();` in component
- [ ] Wrap hardcoded strings with `t("key_name")`
- [ ] Test component works correctly

**Recommended order (by dependency):**
1. SettingsPage.tsx (most strings)
2. CampaignSetup.tsx (many strings)
3. PricingModals.tsx
4. TierSelectionModal.tsx
5. SubscriptionPauseModal.tsx
6. ProfilePage.tsx
7. Pricing-related pages (5 files)
8. OtpModal.tsx
9. TransactionsTable.tsx

### Phase 3: Testing (2-3 hours)
- [ ] Switch app language to Spanish
- [ ] Verify all text in each component displays in Spanish
- [ ] Switch app language to Chinese
- [ ] Verify all text in each component displays in Chinese
- [ ] Check for text overflow or layout issues
- [ ] Test form inputs and placeholders
- [ ] Test error messages

### Phase 4: Code Review & Deployment
- [ ] Code review changes
- [ ] Run tests
- [ ] Deploy to staging
- [ ] Final QA testing
- [ ] Deploy to production

---

## 📊 PROGRESS TRACKING

Use this table to track your implementation progress:

| File | Total Strings | Status | Lines Changed | Tested |
|------|---------------|--------|----------------|--------|
| SettingsPage.tsx | 32 | ⬜ | 0 | ❌ |
| CampaignSetup.tsx | 20 | ⬜ | 0 | ❌ |
| PricingModals.tsx | 10 | ⬜ | 0 | ❌ |
| TierSelectionModal.tsx | 8 | ⬜ | 0 | ❌ |
| SubscriptionPauseModal.tsx | 5 | ⬜ | 0 | ❌ |
| ProfilePage.tsx | 9 | ⬜ | 0 | ❌ |
| pricing-card.tsx | 7 | ⬜ | 0 | ❌ |
| PricingPage.tsx | 5 | ⬜ | 0 | ❌ |
| PackagePaymentSuccess.tsx | 2 | ⬜ | 0 | ❌ |
| PackageAddonSuccess.tsx | 2 | ⬜ | 0 | ❌ |
| OtpModal.tsx | 2 | ⬜ | 0 | ❌ |
| TransactionsTable.tsx | 3 | ⬜ | 0 | ❌ |
| **TOTAL** | **105** | | **0** | **❌** |

Legend: ⬜ = Not Started, 🟨 = In Progress, ✅ = Complete

---

## 🎯 Success Criteria

You'll know you're done when:

1. ✅ All 89 translation keys added to all 3 language files (EN, ES, ZH)
2. ✅ All 12 components updated to use `t()` function
3. ✅ App displays correctly in English, Spanish, and Chinese
4. ✅ No console errors related to missing translation keys
5. ✅ All buttons, labels, placeholders, and messages translate properly
6. ✅ No text overflow or layout shifts in any language
7. ✅ Error messages display in correct language
8. ✅ Code review approved
9. ✅ Tests pass
10. ✅ Deployed to production

---

## Notes

- Settings are the #1 priority (32 strings)
- Campaign setup is #2 (20 strings)
- These two files account for 52% of all missing translations
- After SettingsPage and CampaignSetup, everything else is quicker
- Test as you go to catch issues early

Good luck! 🚀
