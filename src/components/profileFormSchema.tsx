import z from "zod";

const profileFormSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").trim(),

  phoneNumber: z
    .string()
    .regex(/^[+\d\s-()]{10,}$/, "Please enter a valid phone number"),

  publicUrl: z
    .string()
    .regex(
      /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
      "Please enter a valid URL"
    ),

  brandName: z.string().min(2, "Brand name must be at least 2 characters"),

  brandLogo: z
    .string({ message: "Brand logo is required" })
    .min(1, "Brand logo is required"),

  brandTone: z.string().min(1, "Brand tone is required"),

  audienceAgeRange: z
    .array(z.string().min(1))
    .min(1, "Select at least one audience age range"),

  audienceGender: z.string().min(1, "Audience gender is required"),

  audienceRegions: z
    .array(z.string().min(1))
    .min(1, "Select at least one audience region"),

  audienceInterests: z
    .array(z.string().min(1))
    .min(1, "Select at least one audience interest"),

  audienceSegments: z
    .array(z.string().min(1))
    .min(1, "Select at least one audience segment"),

  contentCategories: z
    .array(z.string().min(1))
    .min(1, "Select at least one content category"),

  preferredPlatforms: z
    .array(z.string().min(1))
    .min(1, "Select at least one preferred platform"),

  primaryPurpose: z
    .array(z.string().min(1))
    .min(1, "Select at least one primary purpose"),

  keyOutcomes: z
    .array(z.string().min(1))
    .min(1, "Select at least one key outcome"),

  postingStyle: z.string().min(1, "Posting style is required"),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

export { profileFormSchema };
export type { ProfileFormData };
