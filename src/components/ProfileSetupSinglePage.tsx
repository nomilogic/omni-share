import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { User, Building, Globe, Target, Palette, Calendar, Users, DollarSign } from 'lucide-react';

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

const ProfileSetupSinglePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { state } = useAppContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
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
    'Instagram', 'Facebook', 'Twitter', 'LinkedIn', 'TikTok', 'YouTube', 'Pinterest'
  ];

  const contentCategoryOptions = [
    'Technology', 'Fashion', 'Food & Beverage', 'Travel', 'Health & Fitness',
    'Business & Finance', 'Entertainment', 'Education', 'Lifestyle', 'Art & Design'
  ];

  const goalOptions = [
    'Increase brand awareness', 'Generate leads', 'Drive website traffic',
    'Boost engagement', 'Build community', 'Increase sales',
    'Establish thought leadership', 'Customer support'
  ];

  const handleInputChange = (field: keyof ProfileFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

  const isFormValid = () => {
    if (!formData.fullName || !formData.email) return false;
    if (formData.planType === 'business' && (!formData.businessName || !formData.businessType)) return false;
    if (formData.primaryPlatforms.length === 0 || !formData.postingFrequency) return false;
    if (formData.goals.length === 0 || !formData.targetAudience) return false;
    if (formData.planType === 'free' && !formData.campaignType) return false;
    if ((formData.planType === 'pro' || formData.planType === 'business') && (!formData.teamSize || !formData.monthlyBudget)) return false;
    return true;
  };

  return (
    <div className="h-full-dec-hf  x-2 bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6 text-white">
            <h1 className="text-3xl font-bold mb-2">Complete Your Profile</h1>
            <p className="text-blue-100">Tell us about yourself to personalize your experience</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-10">
            {/* Personal Information Section */}
            <section className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter your phone"
                  />
                </div>
              </div>

              {/* Plan Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Plan Type *</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { value: 'free', label: 'Free Plan', description: 'Basic features' },
                    { value: 'pro', label: 'Pro Plan', description: 'Advanced features' },
                    { value: 'business', label: 'Business Plan', description: 'Enterprise features' }
                  ].map((plan) => (
                    <div
                      key={plan.value}
                      className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all ${
                        formData.planType === plan.value
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
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
                          className="h-5 w-5 text-blue-600"
                        />
                        <div className="ml-3">
                          <div className="font-medium text-gray-900">{plan.label}</div>
                          <div className="text-sm text-gray-500">{plan.description}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Business Information (conditional) */}
            {formData.planType === 'business' && (
              <section className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Building className="w-6 h-6 text-purple-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Business Information</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Name *
                    </label>
                    <input
                      type="text"
                      value={formData.businessName || ''}
                      onChange={(e) => handleInputChange('businessName', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                      placeholder="Enter business name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Type *
                    </label>
                    <select
                      value={formData.businessType || ''}
                      onChange={(e) => handleInputChange('businessType', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                      required
                    >
                      <option value="">Select type</option>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Website
                    </label>
                    <input
                      type="url"
                      value={formData.businessWebsite || ''}
                      onChange={(e) => handleInputChange('businessWebsite', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                      placeholder="https://example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Description
                  </label>
                  <textarea
                    value={formData.businessDescription || ''}
                    onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    placeholder="Tell us about your business..."
                  />
                </div>
              </section>
            )}

            {/* Social Media Setup */}
            <section className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Globe className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Social Media Setup</h2>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Primary Platforms * (Select all that apply)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {platformOptions.map((platform) => (
                    <div
                      key={platform}
                      className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.primaryPlatforms.includes(platform)
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleArrayChange('primaryPlatforms', platform)}
                    >
                      <input
                        type="checkbox"
                        checked={formData.primaryPlatforms.includes(platform)}
                        onChange={() => handleArrayChange('primaryPlatforms', platform)}
                        className="h-4 w-4 text-green-600 rounded mr-3"
                      />
                      <span className="text-sm font-medium">{platform}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Content Categories (Select your interests)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {contentCategoryOptions.map((category) => (
                    <div
                      key={category}
                      className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.contentCategories.includes(category)
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleArrayChange('contentCategories', category)}
                    >
                      <input
                        type="checkbox"
                        checked={formData.contentCategories.includes(category)}
                        onChange={() => handleArrayChange('contentCategories', category)}
                        className="h-4 w-4 text-green-600 rounded mr-3"
                      />
                      <span className="text-sm font-medium">{category}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Posting Frequency *
                  </label>
                  <select
                    value={formData.postingFrequency}
                    onChange={(e) => handleInputChange('postingFrequency', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand Tone
                  </label>
                  <select
                    value={formData.brandTone}
                    onChange={(e) => handleInputChange('brandTone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
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
            </section>

            {/* Goals & Preferences */}
            <section className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-yellow-100 p-2 rounded-lg">
                  <Target className="w-6 h-6 text-yellow-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Goals & Preferences</h2>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Goals * (Select all that apply)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {goalOptions.map((goal) => (
                    <div
                      key={goal}
                      className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.goals.includes(goal)
                          ? 'border-yellow-500 bg-yellow-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleArrayChange('goals', goal)}
                    >
                      <input
                        type="checkbox"
                        checked={formData.goals.includes(goal)}
                        onChange={() => handleArrayChange('goals', goal)}
                        className="h-4 w-4 text-yellow-600 rounded mr-3"
                      />
                      <span className="text-sm font-medium">{goal}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Audience *
                </label>
                <textarea
                  value={formData.targetAudience}
                  onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                  placeholder="Describe your target audience... (e.g., Young professionals aged 25-35 interested in technology and lifestyle)"
                  required
                />
              </div>
            </section>

            {/* Plan-specific sections */}
            {formData.planType === 'free' && (
              <section className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Campaign Setup</h2>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign Type *
                  </label>
                  <select
                    value={formData.campaignType || ''}
                    onChange={(e) => handleInputChange('campaignType', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
              </section>
            )}

            {(formData.planType === 'pro' || formData.planType === 'business') && (
              <section className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-indigo-100 p-2 rounded-lg">
                    <Users className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Team & Budget</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Team Size *
                    </label>
                    <select
                      value={formData.teamSize || ''}
                      onChange={(e) => handleInputChange('teamSize', parseInt(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Monthly Budget *
                    </label>
                    <select
                      value={formData.monthlyBudget || ''}
                      onChange={(e) => handleInputChange('monthlyBudget', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
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
              </section>
            )}

            {/* Submit Button */}
            <div className="flex justify-end pt-8 border-t border-gray-200">
              <button
                type="submit"
                disabled={!isFormValid() || loading}
                className={`px-8 py-4 rounded-xl font-semibold text-white text-lg transition-all transform ${
                  isFormValid() && !loading
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105 shadow-lg'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Setting up your profile...
                  </div>
                ) : (
                  'Complete Profile & Get Started'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetupSinglePage;
