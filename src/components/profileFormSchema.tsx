import z from "zod";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";

export const useProfileFormSchema = () => {
  const { t } = useTranslation();

  const profileFormSchema = useMemo(() => {
    return z.object({
      fullName: z
        .string()
        .trim()
        .min(2, { message: t("error_full_name") }),
      email: z.string(),

      phoneNumber: z
        .string()

        .optional(),

      publicUrl: z.string().optional(),

      brandName: z
        .string()

        .optional(),

      brandLogo: z
        .string()

        .optional(),

      brandTone: z
        .string()

        .optional(),

      audienceAgeRange: z
        .array(z.string().min(1))

        .optional(),

      audienceGender: z
        .string()

        .optional(),

      audienceRegions: z
        .array(z.string().min(1))

        .optional(),

      audienceInterests: z.array(z.string().min(1)).optional(),

      audienceSegments: z.array(z.string().min(1)).optional(),

      contentCategories: z.array(z.string().min(1)).optional(),

      preferredPlatforms: z.array(z.string().min(1)).optional(),

      primaryPurpose: z.array(z.string().min(1)).optional(),

      keyOutcomes: z.array(z.string().min(1)).optional(),

      postingStyle: z.string().optional(),
    });
  }, [t]);

  return profileFormSchema;
};

export type ProfileFormData = z.infer<ReturnType<typeof useProfileFormSchema>>;
