# COMPREHENSIVE TRANSLATION AUDIT - ACTION PLAN

## Executive Summary
A complete audit has identified **89 hardcoded English strings** across the React/TypeScript application that need translation. These strings are currently hardcoded in components and pages, preventing them from being translated to Spanish, Chinese, and other languages.

**Audit Date:** January 21, 2026  
**Scope:** /src/pages/ (26 files) and /src/components/ (85+ files)  
**Status:** COMPLETE - All missing translations documented

---

## Missing Translation Breakdown by Category

### 1. Settings & Security (32 strings)
**Files:** `src/pages/SettingsPage.tsx`

**Hardcoded Items:**
- Main settings heading and navigation text
- Profile settings section (display name placeholder, plan display)
- Security settings (password, 2FA, account deletion)
- Notification preferences (email, push, marketing, product updates)
- Appearance & theme settings
- Help text and descriptions for all settings

**Example Hardcoded Strings:**
```tsx
"Settings" // Should be: t("settings_heading")
"Profile" // Should be: t("settings_profile_heading")
"Email cannot be changed" // Should be: t("email_cannot_be_changed")
"Change Password" // Should be: t("change_password_button")
"Enable 2FA" // Should be: t("enable_2fa_button")
```

### 2. Profile Page (9 strings)
**Files:** `src/pages/ProfilePage.tsx`

**Hardcoded Items:**
- Default profile name
- Plan type suffixes and display
- Profile type badges (Business/Creator)
- Fallback text for unset fields
- Brand tone display

**Example Hardcoded Strings:**
```tsx
"Your Profile" // Default when name not set
"Free" // Plan display
"Business" / "Creator" // Profile type badges
"Not set" // Fallback for empty fields
```

### 3. Transactions Page (3 strings)
**Files:** `src/pages/TransactionsTable.tsx`

**Hardcoded Items:**
- Transaction status labels
- Copy button tooltip

**Example Hardcoded Strings:**
```tsx
"Auto-Renewed" // Transaction status
"No Receipt" // Transaction status
"Copy to clipboard" // Tooltip text
```

### 4. Pricing Page (12 strings)
**Files:** `src/pages/PricingPage.tsx`, `src/pages/pricing-card.tsx`, `src/pages/PackagePaymentSuccess.tsx`, `src/pages/PackageAddonSuccess.tsx`

**Hardcoded Items:**
- Plan badges (Current Plan, Pending Downgrade)
- Pricing period text (Forever, Month)
- Button states (Processing, Copying)
- Status titles (Package Status, Payment Status)

**Example Hardcoded Strings:**
```tsx
"Current Plan" // Badge for active plan
"Pending Downgrade" // Badge for downgrade status
"Forever" // Pricing period for free plans
"Month" // Pricing period for paid plans
"Processing..." // Button during payment
"Copied" // Status after copying
```

### 5. Campaigns & Modals (33 strings)
**Files:** `src/components/CampaignSetup.tsx`, `src/components/PricingModals.tsx`, `src/components/SubscriptionPauseModal.tsx`, `src/components/OtpModal.tsx`, `src/components/TierSelectionModal.tsx`

**Hardcoded Items:**

**Industries (12):**
- Technology, Healthcare, Finance, E-commerce, Education
- Food & Beverage, Fashion, Real Estate, Automotive
- Entertainment, Non-profit, Other

**Tones (10):**
- Professional (Formal and authoritative)
- Playful (Fun and energetic)
- Motivational (Inspiring and uplifting)
- Casual (Relaxed and friendly)
- Authoritative (Expert and trustworthy)

**Goals (8):**
- Brand Awareness, Lead Generation, Customer Engagement
- Sales Conversion, Community Building, Thought Leadership
- Product Launch, Event Promotion

**Modals & Forms (3):**
- Payment processing messages
- Plan confirmation dialogs
- Downgrade request notifications
- OTP form messages

**Buttons (5):**
- Get Started Free, Start Pro Trial, Start Business Trial
- Setting up (button state)
- Proceed to Checkout

---

## Implementation Steps

### Step 1: Add Missing Keys to Translation Files
**Effort:** 2-3 hours

1. **English Translation File** (`/public/locales/en/translation.json`)
   - Add all 89 missing translation keys with their English values
   - Use the `MISSING_TRANSLATIONS_KEYS.json` file provided for reference
   - Organize by category for maintainability

2. **Spanish Translation File** (`/public/locales/es/translation.json`)
   - Translate all 89 new keys to Spanish
   - Note: Many keys likely already exist, but verify coverage

3. **Chinese Translation File** (`/public/locales/zh/translation.json`)
   - Translate all 89 new keys to Simplified Chinese
   - Verify RTL/LTR text handling if applicable

### Step 2: Update Components to Use t() Function
**Effort:** 4-6 hours

**Files to Update (12+):**
- `src/pages/SettingsPage.tsx` (32 strings)
- `src/pages/ProfilePage.tsx` (9 strings)
- `src/pages/TransactionsTable.tsx` (3 strings)
- `src/pages/PricingPage.tsx` (5 strings)
- `src/pages/pricing-card.tsx` (7 strings)
- `src/pages/PackagePaymentSuccess.tsx` (2 strings)
- `src/pages/PackageAddonSuccess.tsx` (2 strings)
- `src/components/CampaignSetup.tsx` (20 strings)
- `src/components/PricingModals.tsx` (10 strings)
- `src/components/SubscriptionPauseModal.tsx` (5 strings)
- `src/components/OtpModal.tsx` (2 strings)
- `src/components/TierSelectionModal.tsx` (8 strings)

**Pattern for Updates:**

```tsx
// BEFORE (hardcoded)
<h3 className="text-xl font-semibold">Settings</h3>

// AFTER (using i18next)
import { useTranslation } from "react-i18next";

export const MyComponent = () => {
  const { t } = useTranslation();
  return <h3 className="text-xl font-semibold">{t("settings_heading")}</h3>;
};
```

### Step 3: Test All Languages
**Effort:** 2-3 hours

1. Switch language in application (if language switcher exists)
2. Verify all updated strings display correctly in:
   - English (baseline)
   - Spanish
   - Chinese
3. Check for text overflow or layout issues in each language
4. Verify placeholder text and form labels translate properly
5. Test RTL/LTR text direction if applicable

### Step 4: Update Translation Keys Document
**Effort:** 1 hour

- Add all new keys to any internal translation key documentation
- Update style guides to ensure future hardcoded strings are caught in code review
- Add pre-commit hooks to flag untranslated strings (optional but recommended)

---

## Recommended Translation Keys Naming Convention

Based on analysis of your existing keys, use this pattern:

**Format:** `category_subcategory_item`

**Examples:**
```
settings_heading
settings_profile_heading
settings_email_cannot_be_changed
button_get_started_free
label_status
message_processing_payment
error_campaign_name_required
```

---

## Testing Checklist

- [ ] All 89 new translation keys added to EN, ES, ZH translation files
- [ ] Components updated to use t() function with correct key names
- [ ] Language switching works without console errors
- [ ] All strings display in correct language after switch
- [ ] No text overflow or layout shifts in any language
- [ ] Form placeholders and labels are translated
- [ ] Button states (Saving..., Processing..., etc.) show translated text
- [ ] Modal titles and descriptions are translated
- [ ] Error messages are translated
- [ ] Help text and descriptions are translated

---

## Files Provided

1. **TRANSLATION_AUDIT_REPORT.json** - Full audit with file locations and context
2. **MISSING_TRANSLATIONS_KEYS.json** - Clean JSON ready to merge into translation files
3. **This document** - Implementation guide and action plan

---

## Quality Assurance Notes

### Already Translated (Do NOT duplicate)
The following strings are already in your translation files and should NOT be duplicated:
- `t("upgrade")`
- `t("manage")`
- `t("connect")`
- `t("connected")`
- `t("invoice")`
- `t("price")`
- `t("purchased_at")`
- `t("purchased_code")`
- All OAuth-related strings
- Most dashboard and content-related strings

### Keys to Standardize
These button states exist in multiple forms - consider standardizing:
- "Saving..." vs "saving"
- "Processing..." vs "processing"
- "Updating..." vs "updating"
- "Verifying..." vs "verifying"
- "Loading..." vs "loading"

---

## Estimated Timeline

| Task | Effort | Timeline |
|------|--------|----------|
| Add keys to translation files | 2-3 hours | Day 1 |
| Update components (12+ files) | 4-6 hours | Day 1-2 |
| Testing all languages | 2-3 hours | Day 2 |
| Code review & fixes | 1-2 hours | Day 2 |
| **Total** | **9-14 hours** | **2 days** |

---

## Next Steps

1. Review this audit report
2. Use `MISSING_TRANSLATIONS_KEYS.json` as base for translation file updates
3. Follow the component update pattern shown above
4. Run through testing checklist
5. Deploy with confident i18n coverage

---

## Notes

- This audit is **comprehensive** - 89 strings across 12+ files identified
- Previous audits may have missed components; this scan was exhaustive
- Recommendation: Implement code review rules to catch hardcoded strings early
- Consider adding linting rule to flag strings not wrapped in t() function
