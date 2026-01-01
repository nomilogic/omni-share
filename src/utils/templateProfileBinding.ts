import { TemplateElement, TextElement, LogoElement } from '../types/templates';
import { ProfileInfo } from '../types';
import { ProfileFormData } from '../types/profile';

/**
 * Maps profile fields to element names for automatic binding
 */
export const PROFILE_FIELD_MAPPING = {
  email: 'email',
  website: 'website',
  companyName: 'companyName',
  brandName: 'brandName',
  fullName: 'fullName',
  phoneNumber: 'phoneNumber',
  logo: 'logo',
  brandLogo: 'brandLogo',
  businessName: 'businessName',
} as const;

/**
 * Predefined element names that can be used when creating template elements
 */
export const ELEMENT_NAMES = {
  EMAIL: 'email',
  WEBSITE: 'website',
  COMPANY_NAME: 'companyName',
  BRAND_NAME: 'brandName',
  FULL_NAME: 'fullName',
  LOGO: 'logo',
  PHONE: 'phoneNumber',
} as const;

interface ProfileBindingData {
  email?: string;
  website?: string;
  companyName?: string;
  brandName?: string;
  fullName?: string;
  phoneNumber?: string;
  logo?: string;
}

/**
 * Extract profile data that can be bound to template elements
 */
export const extractProfileBindingData = (
  profile?: ProfileInfo,
  profileFormData?: ProfileFormData
): ProfileBindingData => {
  return {
    email: profile?.name || profileFormData?.email || '',
    website: profile?.website || profileFormData?.publicUrl || '',
    companyName: profile?.name || profileFormData?.brandName || '',
    brandName: profileFormData?.brandName || '',
    fullName: profileFormData?.fullName || '',
    phoneNumber: profileFormData?.phoneNumber || '',
    logo: profileFormData?.brandLogo ? String(profileFormData.brandLogo) : undefined,
  };
};

/**
 * Get the value for a specific profile field
 */
export const getProfileFieldValue = (
  fieldName: string,
  profileData: ProfileBindingData
): string | undefined => {
  const key = fieldName as keyof ProfileBindingData;
  return profileData[key];
};

/**
 * Update template elements with profile data based on element names
 */
export const populateTemplateWithProfileData = (
  elements: TemplateElement[],
  profileData: ProfileBindingData
): TemplateElement[] => {
  return elements.map((el) => {
    // Skip if element doesn't have a name
    if (!el.name) return el;

    // For text elements, update content
    if (el.type === 'text') {
      const textEl = el as TextElement;
      const value = getProfileFieldValue(el.name, profileData);
      if (value) {
        return {
          ...textEl,
          content: value,
        };
      }
    }

    // For logo elements, update source
    if (el.type === 'logo') {
      const logoEl = el as LogoElement;
      if (el.name === ELEMENT_NAMES.LOGO || el.name === ELEMENT_NAMES.LOGO) {
        const logo = profileData.logo;
        if (logo) {
          return {
            ...logoEl,
            src: logo,
          };
        }
      }
    }

    return el;
  });
};

/**
 * Get all bindable elements from a template
 * Returns elements that have a name property set
 */
export const getBindableElements = (elements: TemplateElement[]) => {
  return elements.filter((el) => el.name && el.type === 'text').map((el) => ({
    id: el.id,
    name: (el as TextElement).name,
    type: el.type,
    currentContent: (el as TextElement).content,
    suggestedField: (el as TextElement).name,
  }));
};

/**
 * Generate a report of which profile fields are used in the template
 */
export const getTemplateBindingReport = (elements: TemplateElement[]): {
  boundElements: Array<{ elementId: string; elementName: string; fieldName: string }>;
  unboundElements: Array<{ elementId: string; elementType: string }>;
} => {
  const boundElements: Array<{ elementId: string; elementName: string; fieldName: string }> = [];
  const unboundElements: Array<{ elementId: string; elementType: string }> = [];

  elements.forEach((el) => {
    if (el.name) {
      boundElements.push({
        elementId: el.id,
        elementName: el.name,
        fieldName: el.name,
      });
    } else {
      unboundElements.push({
        elementId: el.id,
        elementType: el.type,
      });
    }
  });

  return { boundElements, unboundElements };
};
