import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

interface ProfileFormData {
  // Personal Information
  fullName: string;
  email: string;
  phone: string;
  
  // Plan Selection
  planType: 'free' | 'pro' | 'business';
  
  // Business Information (conditional)
  businessName?: string;
  businessType?: string;
  businessWebsite?: string;
  businessDescription?: string;
  
  // Social Media Information
  primaryPlatforms: string[];
  contentCategories: string[];
  postingFrequency: string;
  
  // Goals and Preferences
  goals: string[];
  targetAudience: string;
  brandTone: string;
  
  // Free Plan Specific
  campaignType?: string;
  
  // Pro/Business Plan Specific
  teamSize?: number;
  monthlyBudget?: string;
  integrations?: string[];
}

const ProfileSetupUnified: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { state } = useAppContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Convert plan types to match our form interface
  const getFormPlanType = (contextPlan: 'free' | 'ipro' | 'business' | null) => {
    if (contextPlan === 'ipro') return 'pro';
    return contextPlan || 'free';
  };
  
  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    planType: getFormPlanType(state.userPlan),
    primaryPlatforms: [],
    contentCategories: [],
    postingFrequency: '',
    goals: [],
    targetAudience: '',
    brandTone: 'professional',
  });

  const platformOptions = [
    'Instagram',
    'Facebook',
    'Twitter',
    'LinkedIn',
    'TikTok',
    'YouTube',
    'Pinterest'
  ];

  const contentCategoryOptions = [
    'Technology',
    'Fashion',
    'Food & Beverage',
    'Travel',
    'Health & Fitness',
    'Business & Finance',
    'Entertainment',
    'Education',
    'Lifestyle',
    'Art & Design'
  ];

  const goalOptions = [
    'Increase brand awareness',
    'Generate leads',
    'Drive website traffic',
    'Boost engagement',
    'Build community',
    'Increase sales',
    'Establish thought leadership',
    'Customer support'
  ];

  const handleInputChange = (field: keyof ProfileFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field: keyof ProfileFormData, option: string) => {
    setFormData(prev => {
      const currentArray = (prev[field] as string[]) || [];
      const isSelected = currentArray.includes(option);
      
      return {
        ...prev,
        [field]: isSelected
          ? currentArray.filter(item => item !== option)
          : [...currentArray, option]
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert plan type back to context format
      const convertPlanType = (formPlan: 'free' | 'pro' | 'business') => {
        if (formPlan === 'pro') return 'ipro';
        return formPlan;
      };
      
      const profileData = {
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        plan_type: convertPlanType(formData.planType),
        business_name: formData.businessName || null,
        business_type: formData.businessType || null,
        business_website: formData.businessWebsite || null,
        business_description: formData.businessDescription || null,
        primary_platforms: formData.primaryPlatforms,
        content_categories: formData.contentCategories,
        posting_frequency: formData.postingFrequency,
        goals: formData.goals,
        target_audience: formData.targetAudience,
        brand_tone: formData.brandTone,
        campaign_type: formData.campaignType || null,
        team_size: formData.teamSize || null,
        monthly_budget: formData.monthlyBudget || null,
        integrations: formData.integrations || [],
        profile_completed: true
      };

      await updateProfile(profileData);
      navigate('/content');
    } catch (error) {
      console.error('Profile update failed:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, getTotalSteps()));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const getTotalSteps = () => {
    return formData.planType === 'free' ? 4 : 5;
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.fullName && formData.email && formData.planType;
      case 2:
        if (formData.planType === 'business') {
          return formData.businessName && formData.businessType;
        }
        return true;
      case 3:
        return formData.primaryPlatforms.length > 0 && formData.postingFrequency;
      case 4:
        return formData.goals.length > 0 && formData.targetAudience;
      case 5:
        if (formData.planType === 'free') {
          return formData.campaignType;
        }
        return formData.teamSize && formData.monthlyBudget;
      default:
        return true;
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
            Full Name *
          </label>
          <input
            type="text"
            id="fullName"
            value={formData.fullName}
            onChange={(e) => handleInputChange('fullName', e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email *
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Plan Type *</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { value: 'free', label: 'Free Plan', description: 'Basic features for getting started' },
            { value: 'pro', label: 'Pro Plan', description: 'Advanced features for professionals' },
            { value: 'business', label: 'Business Plan', description: 'Enterprise features for teams' }
          ].map((plan) => (
            <div
              key={plan.value}
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                formData.planType === plan.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => handleInputChange('planType', plan.value)}
            >
              <div className="flex items-center">
                <input
                  type="radio"
                  name="planType"
                  value={plan.value}
                  checked={formData.planType === plan.value}
                  onChange={() => handleInputChange('planType', plan.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <label className="ml-3 text-sm font-medium text-gray-900">
                  {plan.label}
                </label>
              </div>
              <p className="mt-1 text-sm text-gray-500">{plan.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => {
    if (formData.planType !== 'business') {
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Account Setup</h2>
          <p className="text-gray-600">Your {formData.planType} plan is being configured...</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Business Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
              Business Name *
            </label>
            <input
              type="text"
              id="businessName"
              value={formData.businessName || ''}
              onChange={(e) => handleInputChange('businessName', e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="businessType" className="block text-sm font-medium text-gray-700">
              Business Type *
            </label>
            <select
              id="businessType"
              value={formData.businessType || ''}
              onChange={(e) => handleInputChange('businessType', e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select business type</option>
              <option value="startup">Startup</option>
              <option value="small-business">Small Business</option>
              <option value="enterprise">Enterprise</option>
              <option value="agency">Agency</option>
              <option value="nonprofit">Non-profit</option>
              <option value="ecommerce">E-commerce</option>
              <option value="consulting">Consulting</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="businessWebsite" className="block text-sm font-medium text-gray-700">
              Business Website
            </label>
            <input
              type="url"
              id="businessWebsite"
              value={formData.businessWebsite || ''}
              onChange={(e) => handleInputChange('businessWebsite', e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://example.com"
            />
          </div>
        </div>

        <div>
          <label htmlFor="businessDescription" className="block text-sm font-medium text-gray-700">
            Business Description
          </label>
          <textarea
            id="businessDescription"
            value={formData.businessDescription || ''}
            onChange={(e) => handleInputChange('businessDescription', e.target.value)}
            rows={4}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Tell us about your business..."
          />
        </div>
      </div>
    );
  };

  const renderStep3 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Social Media Setup</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Primary Platforms * (Select all that apply)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {platformOptions.map((platform) => (
            <div
              key={platform}
              className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                formData.primaryPlatforms.includes(platform)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => handleArrayChange('primaryPlatforms', platform)}
            >
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.primaryPlatforms.includes(platform)}
                  onChange={() => handleArrayChange('primaryPlatforms', platform)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-900">{platform}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Content Categories (Select all that apply)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {contentCategoryOptions.map((category) => (
            <div
              key={category}
              className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                formData.contentCategories.includes(category)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => handleArrayChange('contentCategories', category)}
            >
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.contentCategories.includes(category)}
                  onChange={() => handleArrayChange('contentCategories', category)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-900">{category}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="postingFrequency" className="block text-sm font-medium text-gray-700">
          Posting Frequency *
        </label>
        <select
          id="postingFrequency"
          value={formData.postingFrequency}
          onChange={(e) => handleInputChange('postingFrequency', e.target.value)}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          required
        >
          <option value="">Select frequency</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="bi-weekly">Bi-weekly</option>
          <option value="monthly">Monthly</option>
          <option value="as-needed">As needed</option>
        </select>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Goals & Preferences</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Goals * (Select all that apply)
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {goalOptions.map((goal) => (
            <div
              key={goal}
              className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                formData.goals.includes(goal)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => handleArrayChange('goals', goal)}
            >
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.goals.includes(goal)}
                  onChange={() => handleArrayChange('goals', goal)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-900">{goal}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700">
          Target Audience *
        </label>
        <textarea
          id="targetAudience"
          value={formData.targetAudience}
          onChange={(e) => handleInputChange('targetAudience', e.target.value)}
          rows={3}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          placeholder="Describe your target audience..."
          required
        />
      </div>

      <div>
        <label htmlFor="brandTone" className="block text-sm font-medium text-gray-700">
          Brand Tone
        </label>
        <select
          id="brandTone"
          value={formData.brandTone}
          onChange={(e) => handleInputChange('brandTone', e.target.value)}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="professional">Professional</option>
          <option value="casual">Casual</option>
          <option value="friendly">Friendly</option>
          <option value="authoritative">Authoritative</option>
          <option value="humorous">Humorous</option>
          <option value="inspirational">Inspirational</option>
        </select>
      </div>
    </div>
  );

  const renderStep5 = () => {
    if (formData.planType === 'free') {
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Campaign Setup</h2>
          
          <div>
            <label htmlFor="campaignType" className="block text-sm font-medium text-gray-700">
              Campaign Type *
            </label>
            <select
              id="campaignType"
              value={formData.campaignType || ''}
              onChange={(e) => handleInputChange('campaignType', e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select campaign type</option>
              <option value="brand-awareness">Brand Awareness</option>
              <option value="product-launch">Product Launch</option>
              <option value="engagement">Engagement Campaign</option>
              <option value="seasonal">Seasonal Campaign</option>
              <option value="educational">Educational Content</option>
            </select>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Team & Budget</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="teamSize" className="block text-sm font-medium text-gray-700">
              Team Size *
            </label>
            <select
              id="teamSize"
              value={formData.teamSize || ''}
              onChange={(e) => handleInputChange('teamSize', parseInt(e.target.value))}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select team size</option>
              <option value={1}>1 person</option>
              <option value={2}>2-5 people</option>
              <option value={3}>6-10 people</option>
              <option value={4}>11-25 people</option>
              <option value={5}>26+ people</option>
            </select>
          </div>

          <div>
            <label htmlFor="monthlyBudget" className="block text-sm font-medium text-gray-700">
              Monthly Budget *
            </label>
            <select
              id="monthlyBudget"
              value={formData.monthlyBudget || ''}
              onChange={(e) => handleInputChange('monthlyBudget', e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select budget range</option>
              <option value="under-1000">Under $1,000</option>
              <option value="1000-5000">$1,000 - $5,000</option>
              <option value="5000-10000">$5,000 - $10,000</option>
              <option value="10000-25000">$10,000 - $25,000</option>
              <option value="over-25000">Over $25,000</option>
            </select>
          </div>
        </div>
      </div>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      case 5:
        return renderStep5();
      default:
        return renderStep1();
    }
  };

  return (
    <div className="h-full-dec-hf  x-2 bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg">
          {/* Progress Bar */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-medium text-gray-900">Profile Setup</h1>
              <span className="text-sm text-gray-500">
                Step {currentStep} of {getTotalSteps()}
              </span>
            </div>
            <div className="mt-2">
              <div className="bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 rounded-full h-2 transition-all duration-300"
                  style={{ width: `${(currentStep / getTotalSteps()) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="px-6 py-8">
              {renderCurrentStep()}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {currentStep < getTotalSteps() ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!isStepValid()}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!isStepValid() || loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Completing...' : 'Complete Profile'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetupUnified;
