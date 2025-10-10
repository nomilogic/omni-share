import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { CampaignSelector } from '../components/CampaignSelector';
import { CampaignSetup } from '../components/CampaignSetup';
import { CampaignDashboard } from '../components/CampaignDashboard';
import { FeatureRestriction } from '../components/FeatureRestriction';
import { useAppContext } from '../context/AppContext';
import { usePlanFeatures } from '../hooks/usePlanFeatures';
import { saveCampaign, updateCampaign } from '../lib/database';
import { CampaignInfo } from '../types';

export const CampaignsPage: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { canCreateCampaigns } = usePlanFeatures();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSelectCampaign = (campaign: any) => {
    // Convert to proper Campaign format for context
    const campaignData = {
      ...campaign,
      userId: state.user?.id || campaign.userId || ''
    };
    dispatch({ type: 'SET_SELECTED_CAMPAIGN', payload: campaignData });
    navigate(`/campaigns/${campaign.id}`);
  };

  const handleCreateCampaign = () => {
    setError(null); // Clear any previous errors

    alert('Creating new campaign...');
    navigate('/campaigns/new');
  };

  const handleCampaignCreated = async (campaignData: CampaignInfo) => {
    console.log('handleCampaignCreated called with:', campaignData);
    console.log('Current user:', state.user);
    
    if (!state.user?.id) {
      console.error('No user ID found');
      setError('User not found. Please log in again.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('Starting campaign save process...');
      console.log('Saving campaign data:', campaignData);
      console.log('User ID:', state.user.id);
      
      const savedCampaign = await saveCampaign(campaignData, state.user.id);
      console.log('Campaign saved successfully:', savedCampaign);
      
      // Update the context with the new campaign
      const campaignWithUserId = {
        ...savedCampaign,
        userId: state.user.id
      };
      
      dispatch({ type: 'SET_SELECTED_CAMPAIGN', payload: campaignWithUserId });
      
      // Trigger refresh and navigate back to campaigns list
      setRefreshTrigger(prev => prev + 1);
      console.log('Navigating back to campaigns list');
      navigate('/campaigns');
    } catch (error) {
      console.error('Error creating campaign:', error);
      setError(`Failed to create campaign: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCampaignUpdated = async (campaignData: CampaignInfo) => {
    if (!state.user?.id || !state.selectedCampaign?.id) {
      setError('User or campaign not found. Please try again.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('Updating campaign data:', campaignData);
      
      const updatedCampaign = await updateCampaign(state.selectedCampaign.id, campaignData, state.user.id);
      console.log('Campaign updated successfully:', updatedCampaign);
      
      // Update the context with the updated campaign
      const campaignWithUserId = {
        ...updatedCampaign,
        userId: state.user.id
      };
      
      dispatch({ type: 'SET_SELECTED_CAMPAIGN', payload: campaignWithUserId });
      
      // Trigger refresh and navigate to campaign dashboard
      setRefreshTrigger(prev => prev + 1);
      navigate(`/campaigns/${state.selectedCampaign.id}`);
    } catch (error) {
      console.error('Error updating campaign:', error);
      setError('Failed to update campaign. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Routes>
      <Route 
        index 
        element={
          <div className="space-y-6 p-6 w-full">
            <div className="flex flex-col items-center justify-center w-full">
              <div>
                <h1 className="text-3xl font-bold text-white text-center">Campaigns</h1>
                <p className="theme-text-primary">Manage your marketing campaigns and strategies</p>
              </div>
              {/* <button
                onClick={handleCreateCampaign}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <Plus className="w-4 h-4" />
                <span>New Campaign</span>
              </button> */}
            </div>
            
            {!canCreateCampaigns ? (
              <FeatureRestriction feature="Campaign Management" requiredPlan="ipro">
                <div className="p-8 text-center">
                  <p className="theme-text-secondary">
                    Create and manage multiple campaigns with advanced targeting and analytics
                  </p>
                </div>
              </FeatureRestriction>
            ) : (
              <CampaignSelector
                userId={state.user?.id || ''}
                onSelectCampaign={handleSelectCampaign}
                onCreateNew={handleCreateCampaign}
                refreshTrigger={refreshTrigger}
                onScheduleCampaign={(campaign) => {
                  const campaignData = { ...campaign, userId: state.user?.id || campaign.userId || '' };
                  dispatch({ type: 'SET_SELECTED_CAMPAIGN', payload: campaignData });
                  navigate('/schedule');
                }}
                onDashboardCampaign={(campaign) => {
                  const campaignData = { ...campaign, userId: state.user?.id || campaign.userId || '' };
                  dispatch({ type: 'SET_SELECTED_CAMPAIGN', payload: campaignData });
                  navigate(`/campaigns/${campaign.id}`);
                }}
              />
            )}
          </div>
        } 
      />
       <Route 
        path="new" 
        element={
          <div className="space-y-6 p-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}
            <CampaignSetup
              onNext={handleCampaignCreated}
              onBack={() => {
                setError(null);
                navigate('/campaigns');
              }}
            />
            {loading && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 flex items-center space-x-4">
                  <div className="animate-spin w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                  <span>Saving campaign...</span>
                </div>
              </div>
            )}
          </div>
        } 
      />
      <Route 
        path=":campaignId" 
        element={
          <div className="p-6">
            <CampaignDashboard
              campaign={state.selectedCampaign}
              onCreatePost={() => navigate('/content')}
              onViewPosts={() => navigate('/content')}
              onSchedulePosts={() => navigate('/schedule')}
              onEditCampaign={() => navigate(`/campaigns/${state.selectedCampaign?.id}/edit`)}
              onBack={() => navigate('/campaigns')}
            />
          </div>
        } 
      />
      <Route 
        path=":campaignId/edit" 
        element={
          <div className="space-y-6 p-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}
            <CampaignSetup
              initialData={state.selectedCampaign ? {
                name: state.selectedCampaign.name,
                website: state.selectedCampaign.website || '',
                industry: state.selectedCampaign.industry,
                description: state.selectedCampaign.description || '',
                targetAudience: state.selectedCampaign.target_audience || '',
                brandTone: (state.selectedCampaign.brand_tone as any) || 'professional',
                goals: state.selectedCampaign.goals || [],
                platforms: state.selectedCampaign.platforms || [],
                objective: state.selectedCampaign.objective,
                startDate: state.selectedCampaign.start_date,
                endDate: state.selectedCampaign.end_date,
                budget: state.selectedCampaign.budget,
                status: state.selectedCampaign.status,
                keywords: state.selectedCampaign.keywords || [],
                hashtags: state.selectedCampaign.hashtags || []
              } : undefined}
              onNext={handleCampaignUpdated}
              onBack={() => {
                setError(null);
                navigate(`/campaigns/${state.selectedCampaign?.id}`);
              }}
            />
            {loading && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 flex items-center space-x-4">
                  <div className="animate-spin w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                  <span>Updating campaign...</span>
                </div>
              </div>
            )}
          </div>
        }
      />
    </Routes>
  );
};
