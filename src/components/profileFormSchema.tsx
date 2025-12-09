import z from "zod";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";

export const useProfileFormSchema = () => {
  const { t } = useTranslation();

  const profileFormSchema = useMemo(() => {
    return z.object({
      fullName: z.string().min(2, { message: t("error_full_name") }).trim(),
      email: z.string(),
      phoneNumber: z
        .string()
        .regex(/^[+\d\s-()]{10,}$/, { message: t("error_phone_number") }),

      publicUrl: z
        .string()
        .regex(/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/, {
          message: t("error_valid_url"),
        }),

      brandName: z.string().min(2, { message: t("error_brand_name") }),
      brandLogo: z.string().min(1, { message: t("error_brand_logo") }),
      brandTone: z.string().min(1, { message: t("error_brand_tone") }),

      audienceAgeRange: z.array(z.string().min(1)).min(1, {
        message: t("error_audience_age"),
      }),

      audienceGender: z
        .string()
        .min(1, { message: t("error_audience_gender") }),

      audienceRegions: z.array(z.string().min(1)).min(1, {
        message: t("error_audience_region"),
      }),

      audienceInterests: z.array(z.string().min(1)).min(1, {
        message: t("error_audience_interest"),
      }),

      audienceSegments: z.array(z.string().min(1)).min(1, {
        message: t("error_audience_segment"),
      }),

      contentCategories: z.array(z.string().min(1)).min(1, {
        message: t("error_content_category"),
      }),

      preferredPlatforms: z.array(z.string().min(1)).min(1, {
        message: t("error_platform"),
      }),

      primaryPurpose: z.array(z.string().min(1)).min(1, {
        message: t("error_primary_purpose"),
      }),

      keyOutcomes: z.array(z.string().min(1)).min(1, {
        message: t("error_key_outcome"),
      }),

      postingStyle: z
        .string()
        .min(1, { message: t("error_posting_style") }),
    });
  }, [t]); // <-- VERY IMPORTANT

  return profileFormSchema;
};

export type ProfileFormData = z.infer<
  ReturnType<typeof useProfileFormSchema>
>;
