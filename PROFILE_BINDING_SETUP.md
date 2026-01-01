# Template Element Binding - Implementation Summary

## Overview
Added the ability to bind template elements (logo, email, website, company name) to profile information fields. This allows automatic population of template elements with profile data.

## Changes Made

### 1. **Type Definitions** ([src/types/templates.ts](src/types/templates.ts))
- Added optional `name?: string` property to `TemplateElement` interface
- This field stores the profile field name that each element is bound to

### 2. **Template Element Rendering** ([src/components/ImageTemplateEditor.tsx](src/components/ImageTemplateEditor.tsx))

#### Text Elements
- Added `name` attribute to Group element
- Added `name={`text-${el.id}`}` to KonvaText component
- Allows identification and data binding of text elements

#### Logo Elements  
- Added `name={logoEl.name || "logo"}` to Group
- Added `data-field="logo"` attribute for semantic identification
- Added `name="logo-image"` to KonvaImage and `name="logo-placeholder"` to placeholder Rect
- Enables logo element binding to profile logo/brand image

#### Shape Elements
- Added `name={shapeEl.name || el.id}` to Group
- Added descriptive names to shape components (`shape-circle-${id}`, `shape-rect-${id}`)

### 3. **Profile Field Binding UI** ([src/components/ImageTemplateEditor.tsx](src/components/ImageTemplateEditor.tsx))
Added a new "Bind to Profile Field" dropdown in the properties panel with these options:
- **Email** - Binds to user's email address
- **Website** - Binds to user's website URL
- **Company Name** - Binds to company/brand name
- **Brand Name** - Binds to brand name field
- **Full Name** - Binds to user's full name
- **Phone Number** - Binds to phone number
- **Logo** - Binds to logo/brand image

### 4. **Profile Binding Utility** ([src/utils/templateProfileBinding.ts](src/utils/templateProfileBinding.ts))
Created comprehensive utility file with:

#### Constants
- `PROFILE_FIELD_MAPPING` - Maps profile fields to element names
- `ELEMENT_NAMES` - Predefined element name constants

#### Functions

**extractProfileBindingData()**
- Extracts bindable profile data from ProfileInfo and ProfileFormData
- Returns object with fields: email, website, companyName, brandName, fullName, phoneNumber, logo

**getProfileFieldValue()**
- Retrieves the value for a specific profile field
- Used to populate elements with profile data

**populateTemplateWithProfileData()**
- Main function to update template elements with profile data
- Updates text element `content` from profile fields
- Updates logo element `src` from profile logo
- Respects element name bindings

**getBindableElements()**
- Returns all elements in a template that have a name binding
- Useful for previewing what will be populated

**getTemplateBindingReport()**
- Generates a report showing:
  - Bound elements (with field mappings)
  - Unbound elements (not yet linked to profile fields)

## Usage Examples

### Setting Element Binding
```typescript
// When editing a template, select an element and choose a profile field from the dropdown
// The element's `name` property will be set to the selected field (e.g., 'email', 'website')
```

### Populating Template with Profile Data
```typescript
import { 
  extractProfileBindingData, 
  populateTemplateWithProfileData 
} from '../utils/templateProfileBinding';

// Get profile data
const profileData = extractProfileBindingData(userProfile, profileFormData);

// Populate elements
const populatedElements = populateTemplateWithProfileData(templateElements, profileData);
```

### Checking Template Bindings
```typescript
import { getTemplateBindingReport } from '../utils/templateProfileBinding';

const report = getTemplateBindingReport(templateElements);
console.log('Bound elements:', report.boundElements);
console.log('Unbound elements:', report.unboundElements);
```

## Data Flow

1. User creates/edits template and adds elements (text, logo, shapes)
2. User selects each element and chooses a "Bind to Profile Field"
3. Element's `name` property is set to the selected field
4. When template is saved, the name binding is persisted
5. When template is used with profile data:
   - Profile data is extracted using `extractProfileBindingData()`
   - Elements are populated using `populateTemplateWithProfileData()`
   - Text content and logo src are automatically filled from profile

## Profile Fields Available for Binding

| Field | Source | Usage |
|-------|--------|-------|
| email | ProfileFormData.email | Display email address |
| website | ProfileInfo.website, ProfileFormData.publicUrl | Display website URL |
| companyName | ProfileInfo.name, ProfileFormData.brandName | Display company name |
| brandName | ProfileFormData.brandName | Display brand name |
| fullName | ProfileFormData.fullName | Display user's full name |
| phoneNumber | ProfileFormData.phoneNumber | Display phone number |
| logo | ProfileFormData.brandLogo | Display brand logo image |

## Next Steps

To fully integrate this into your workflow:

1. **Import the utility** in components that use templates:
   ```typescript
   import { extractProfileBindingData, populateTemplateWithProfileData } from '../utils/templateProfileBinding';
   ```

2. **Use when generating posts** - When creating social media posts from templates:
   ```typescript
   const profileData = extractProfileBindingData(userProfile, formData);
   const finalElements = populateTemplateWithProfileData(template.elements, profileData);
   ```

3. **Add to publishing pipeline** - When publishing templates with posts, ensure profile data binding is applied

4. **Validation** - Consider adding validation to ensure required fields (logo, email, etc.) are bound before saving template

## Files Modified/Created

- ✅ [src/types/templates.ts](src/types/templates.ts) - Added `name` field to TemplateElement
- ✅ [src/components/ImageTemplateEditor.tsx](src/components/ImageTemplateEditor.tsx) - Added name attributes and binding UI
- ✅ [src/utils/templateProfileBinding.ts](src/utils/templateProfileBinding.ts) - Created new utility file
