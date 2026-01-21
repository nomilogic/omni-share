# IMPLEMENTATION CODE EXAMPLES

This document shows the exact code changes needed to migrate hardcoded strings to translations.

## Pattern 1: Simple Text Replacements

### SettingsPage.tsx - Settings Heading

**BEFORE:**
```tsx
<h3 className="text-xl font-semibold theme-text-primary mb-6">
  Settings
</h3>
```

**AFTER:**
```tsx
import { useTranslation } from "react-i18next";

export const SettingsPage: React.FC = () => {
  const { t } = useTranslation();
  // ... rest of component

  return (
    <h3 className="text-xl font-semibold theme-text-primary mb-6">
      {t("settings_heading")}
    </h3>
  );
};
```

---

## Pattern 2: Default Fallback Values

### ProfilePage.tsx - Default Profile Name

**BEFORE:**
```tsx
<h1 className="text-3xl font-bold text-slate-900">
  {profile.name || "Your Profile"}
</h1>
```

**AFTER:**
```tsx
import { useTranslation } from "react-i18next";

export const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
  // ... rest of component

  return (
    <h1 className="text-3xl font-bold text-slate-900">
      {profile.name || t("your_profile_default")}
    </h1>
  );
};
```

---

## Pattern 3: Map Array Items

### CampaignSetup.tsx - Industries List

**BEFORE:**
```tsx
const industries = [
  "Technology",
  "Healthcare",
  "Finance",
  "E-commerce",
  "Education",
  "Food & Beverage",
  "Fashion",
  "Real Estate",
  "Automotive",
  "Entertainment",
  "Non-profit",
  "Other",
];
```

**AFTER:**
```tsx
import { useTranslation } from "react-i18next";

export const CampaignSetup: React.FC<CampaignSetupProps> = ({
  onNext,
  onBack,
  initialData,
}) => {
  const { t } = useTranslation();

  const industries = [
    { key: "industry_technology", label: "Technology" },
    { key: "industry_healthcare", label: "Healthcare" },
    { key: "industry_finance", label: "Finance" },
    { key: "industry_ecommerce", label: "E-commerce" },
    { key: "industry_education", label: "Education" },
    { key: "industry_food_beverage", label: "Food & Beverage" },
    { key: "industry_fashion", label: "Fashion" },
    { key: "industry_real_estate", label: "Real Estate" },
    { key: "industry_automotive", label: "Automotive" },
    { key: "industry_entertainment", label: "Entertainment" },
    { key: "industry_nonprofit", label: "Non-profit" },
    { key: "industry_other", label: "Other" },
  ];

  // In JSX:
  {industries.map((industry) => (
    <option key={industry.key} value={industry.key}>
      {t(industry.key)}
    </option>
  ))}
};
```

---

## Pattern 4: Conditional Text

### ProfilePage.tsx - Profile Type Badge

**BEFORE:**
```tsx
<span className={`px-3 py-1 rounded-full text-sm font-medium ${
  profile.profileType === "business" || profile.userType === "business"
    ? "bg-indigo-100 text-indigo-700"
    : "bg-purple-100 text-purple-700"
}`}>
  {profile.profileType === "business" || profile.userType === "business"
    ? "Business"
    : "Creator"}
</span>
```

**AFTER:**
```tsx
import { useTranslation } from "react-i18next";

export const ProfilePage: React.FC = () => {
  const { t } = useTranslation();

  const isBusiness = profile.profileType === "business" || profile.userType === "business";
  
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
      isBusiness
        ? "bg-indigo-100 text-indigo-700"
        : "bg-purple-100 text-purple-700"
    }`}>
      {isBusiness ? t("profile_type_business") : t("profile_type_creator")}
    </span>
  );
};
```

---

## Pattern 5: Object with Multiple Text Fields

### SettingsPage.tsx - Notification Settings

**BEFORE:**
```tsx
const notificationItems = [
  {
    key: "email",
    title: "Email Notifications",
    desc: "Receive updates about your posts and content.",
  },
  {
    key: "push",
    title: "Push Notifications",
    desc: "Get instant alerts in your browser.",
  },
  {
    key: "marketing",
    title: "Marketing Emails",
    desc: "Receive news about features and updates.",
  },
  {
    key: "updates",
    title: "Product Updates",
    desc: "Get notified about new features and improvements.",
  },
];
```

**AFTER:**
```tsx
import { useTranslation } from "react-i18next";

export const SettingsPage: React.FC = () => {
  const { t } = useTranslation();

  const notificationItems = [
    {
      key: "email",
      titleKey: "email_notifications_setting",
      descKey: "email_notifications_description",
    },
    {
      key: "push",
      titleKey: "push_notifications_setting",
      descKey: "push_notifications_description",
    },
    {
      key: "marketing",
      titleKey: "marketing_emails_setting",
      descKey: "marketing_emails_description",
    },
    {
      key: "updates",
      titleKey: "product_updates_setting",
      descKey: "product_updates_description",
    },
  ];

  return (
    <div className="space-y-4">
      {notificationItems.map((item) => (
        <div key={item.key} className="theme-bg-primary p-4 rounded-md border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-medium theme-text-primary">
                {t(item.titleKey)}
              </h4>
              <p className="text-gray-500 text-sm">
                {t(item.descKey)}
              </p>
            </div>
            {/* Toggle switch */}
          </div>
        </div>
      ))}
    </div>
  );
};
```

---

## Pattern 6: Modal with Multiple Sections

### PricingModals.tsx - Confirm Plan Modal

**BEFORE:**
```tsx
<h2 className="text-2xl font-bold text-purple-700">
  Confirm Plan
</h2>

{/* ... later in modal ... */}

<button
  className="w-full py-2.5 border border-purple-600 bg-purple-600 text-white"
  onClick={runConfirmHandler}
  disabled={loadingPackage}
>
  {loadingPackage ? (
    <>
      <Loader2 className="w-4 h-4 animate-spin" />
      Processing...
    </>
  ) : (
    "Proceed to Checkout"
  )}
</button>
```

**AFTER:**
```tsx
import { useTranslation } from "react-i18next";

export const PricingModals: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <h2 className="text-2xl font-bold text-purple-700">
        {t("confirm_plan_modal_title")}
      </h2>

      {/* ... later in modal ... */}

      <button
        className="w-full py-2.5 border border-purple-600 bg-purple-600 text-white"
        onClick={runConfirmHandler}
        disabled={loadingPackage}
      >
        {loadingPackage ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {t("processing_button_state")}
          </>
        ) : (
          t("proceed_to_checkout_button")
        )}
      </button>
    </>
  );
};
```

---

## Pattern 7: Dynamic List Items

### TierSelectionModal.tsx - Pricing Tiers

**BEFORE:**
```tsx
const pricingTiers: PricingTier[] = [
  {
    id: "free",
    name: "aiFree",
    price: "$0",
    description: "Perfect for getting started",
    features: [
      "Basic content creation",
      "Limited AI generations (5/month)",
      "Manual posting only",
      "1 social platform",
      "Basic templates",
    ],
    buttonText: "Get Started Free",
  },
  {
    id: "ipro",
    name: "aiPRO",
    description: "Most popular for creators",
    buttonText: "Start Pro Trial",
  },
  // ... more tiers
];
```

**AFTER:**
```tsx
import { useTranslation } from "react-i18next";

const pricingTiers: PricingTier[] = [
  {
    id: "free",
    name: "aiFree",
    price: "$0",
    descriptionKey: "free_tier_description",
    features: [
      "Basic content creation",
      "Limited AI generations (5/month)",
      "Manual posting only",
      "1 social platform",
      "Basic templates",
    ],
    buttonTextKey: "get_started_free_button",
  },
  {
    id: "ipro",
    name: "aiPRO",
    descriptionKey: "pro_tier_description",
    buttonTextKey: "start_pro_trial_button",
  },
  // ... more tiers
];

export const TierSelectionModal: React.FC = ({ isOpen, onClose, onSelectPlan }) => {
  const { t } = useTranslation();

  return (
    <div>
      {pricingTiers.map((tier) => (
        <div key={tier.id}>
          <p className="text-lg text-slate-800 font-medium">
            {t(tier.descriptionKey)}
          </p>
          
          <button
            onClick={() => handleSelectPlan(tier.id)}
            className={`w-full py-2.5 px-4 rounded-md font-medium ${tier.buttonClass}`}
          >
            {loading && selectedPlan === tier.id
              ? t("setting_up_button_state")
              : t(tier.buttonTextKey)}
          </button>
        </div>
      ))}
    </div>
  );
};
```

---

## Pattern 8: Helper Text and Placeholders

### SettingsPage.tsx - Form Help Text

**BEFORE:**
```tsx
<input
  type="text"
  value={profileData.displayName}
  placeholder="Enter your display name"
  className="w-full px-4 py-2.5 border border-white/20 rounded-md"
/>

<p className="text-xs theme-text-light mt-1">
  Email cannot be changed
</p>
```

**AFTER:**
```tsx
import { useTranslation } from "react-i18next";

export const SettingsPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <input
        type="text"
        value={profileData.displayName}
        placeholder={t("enter_display_name_placeholder")}
        className="w-full px-4 py-2.5 border border-white/20 rounded-md"
      />

      <p className="text-xs theme-text-light mt-1">
        {t("email_cannot_be_changed")}
      </p>
    </>
  );
};
```

---

## Quick Reference: Common Changes

### Change Summary Table

| Pattern | Location | Effort | Priority |
|---------|----------|--------|----------|
| Simple text | All files | Low | HIGH |
| Default values | ProfilePage, SettingsPage | Low | HIGH |
| Arrays/Lists | CampaignSetup | Medium | HIGH |
| Conditional text | PricingModals, ProfilePage | Medium | MEDIUM |
| Objects with text | SettingsPage | Medium | MEDIUM |
| Modal titles/buttons | PricingModals, Subscription | Medium | HIGH |
| Dynamic lists | TierSelectionModal | High | MEDIUM |
| Helper/placeholder text | Forms | Low | MEDIUM |

---

## Translation File Structure

Add these keys to `/public/locales/en/translation.json`:

```json
{
  // Settings & Security
  "settings_heading": "Settings",
  "settings_profile_heading": "Profile",
  "enter_display_name_placeholder": "Enter your display name",
  "email_cannot_be_changed": "Email cannot be changed",
  
  // Profile Page
  "your_profile_default": "Your Profile",
  "profile_type_business": "Business",
  "profile_type_creator": "Creator",
  
  // Campaigns
  "industry_technology": "Technology",
  "industry_healthcare": "Healthcare",
  // ... more industries
  
  "goal_brand_awareness": "Brand Awareness",
  // ... more goals
  
  // Buttons & States
  "get_started_free_button": "Get Started Free",
  "start_pro_trial_button": "Start Pro Trial",
  "setting_up_button_state": "Setting up...",
  "processing_button_state": "Processing...",
  
  // Modals
  "confirm_plan_modal_title": "Confirm Plan",
  "proceed_to_checkout_button": "Proceed to Checkout"
}
```

---

## Testing Individual Components

### Test SettingsPage
```bash
# Run the app and navigate to /settings
# Switch language using language selector
# Verify all text updates correctly:
# - Settings heading
# - Profile section
# - Notification preferences
# - Appearance settings
```

### Test ProfilePage
```bash
# Run the app and navigate to /profile
# Verify:
# - Plan badges translate
# - Profile type (Business/Creator) translates
# - Fallback text (Not set) translates
```

### Test CampaignSetup
```bash
# Create a new campaign
# Verify:
# - All industry options translate
# - All tone options and descriptions translate
# - All goal options translate
```

---

## Notes for Implementation

1. **Always import useTranslation at component top level**
   ```tsx
   import { useTranslation } from "react-i18next";
   const { t } = useTranslation();
   ```

2. **Use consistent naming conventions**
   - `_button` for buttons
   - `_title` for headings/titles
   - `_message` for messages/descriptions
   - `_placeholder` for input placeholders
   - `_error` for error messages

3. **Group related keys together**
   ```json
   {
     "settings_profile_heading": "...",
     "settings_profile_email": "...",
     "settings_notifications_heading": "...",
     "settings_notifications_email": "..."
   }
   ```

4. **Test with actual translations before deployment**
   - Some languages (Chinese, Spanish) may have different text lengths
   - Watch for UI layout issues with longer/shorter strings

5. **Keep fallback structure for arrays**
   - Always maintain readable code even with translations
   - Use `.map()` pattern for dynamic lists

