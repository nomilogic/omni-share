import React, { useState, useEffect } from "react";
import {
  Target,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Sparkles,
  BarChart3,
} from "lucide-react";
import { getCampaigns, deleteCampaign } from "../lib/database";
import { CampaignInfo } from "../types";
import { usePlanFeatures } from "../hooks/usePlanFeatures";
import { useAppContext } from "../context/AppContext";

interface CampaignSelectorProps {
  userId: string;
  onSelectCampaign: (campaign: CampaignInfo & { id: string }) => void;
  onScheduleCampaign?: (campaign: CampaignInfo & { id: string }) => void;
  onDashboardCampaign?: (campaign: CampaignInfo & { id: string }) => void;
  onEditCampaign?: (campaign: CampaignInfo & { id: string }) => void;
  onCreateNew: () => void;
  refreshTrigger?: number;
}

export const CampaignSelector: React.FC<CampaignSelectorProps> = ({
  userId,
  onSelectCampaign,
  onScheduleCampaign,
  onDashboardCampaign,
  onEditCampaign,
  onCreateNew,
  refreshTrigger,
}) => {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { state } = useAppContext();
  const { canSchedule, currentPlan } = usePlanFeatures();
  const isBusinessAccount =
    state.selectedProfile?.profile_type === "business" ||
    state.user?.profile_type === "business" ||
    currentPlan === "business";

  useEffect(() => {
    loadCampaigns();
  }, [userId, refreshTrigger]);

  const loadCampaigns = async () => {
    try {
      const data = await getCampaigns(userId);
      setCampaigns(data || []);
    } catch (error) {
      console.error("Error loading campaigns:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (campaignId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this campaign?")) {
      try {
        await deleteCampaign(campaignId, userId);
        setCampaigns((prev) => prev.filter((c) => c.id !== campaignId));
      } catch (error) {
        console.error("Error deleting campaign:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-md shadow-md p-8">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-500 font-medium">
            Loading your campaigns...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-md shadow-md p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-md flex items-center justify-center mx-auto mb-4">
          <Target className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">
          Select Campaign
        </h2>
        <p className="text-gray-500 font-medium">
          Choose a campaign or create a new one
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Create New Campaign Card */}
        <div
          onClick={onCreateNew}
          className="border border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
        >
          <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="font-medium text-slate-900 mb-2">
            Create New Campaign
          </h3>
          <p className="text-sm text-gray-500 font-medium">
            Set up a new marketing campaign
          </p>
        </div>

        {/* Existing Campaigns */}
        {campaigns.map((campaign) => {
          const campaignData = {
            id: campaign.id,
            name: campaign.name,
            website: campaign.website,
            industry: campaign.industry,
            description: campaign.description,
            targetAudience: campaign.target_audience,
            brandTone: campaign.brand_tone,
            goals: campaign.goals,
            platforms: campaign.platforms,
            objective: campaign.objective,
            status: campaign.status,
            budget: campaign.budget,
            startDate: campaign.start_date,
            endDate: campaign.end_date,
            totalPosts: campaign.total_posts,
            publishedPosts: campaign.published_posts,
            scheduledPosts: campaign.scheduled_posts,
          };

          return (
            <div
              key={campaign.id}
              className="border border-gray-200 rounded-md p-6 hover:border-blue-500 hover:shadow-md transition-all duration-200 relative group"
            >
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                {onEditCampaign && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditCampaign(campaignData);
                    }}
                    className="p-1 text-blue-500 hover:text-blue-700"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={(e) => handleDelete(campaign.id, e)}
                  className="p-1 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="mb-4">
                <h3 className="font-semibold text-slate-900 text-lg">
                  {campaign.name}
                </h3>
                {campaign.objective && (
                  <p className="text-sm text-blue-600 ">{campaign.objective}</p>
                )}
                {campaign.industry && (
                  <p className="text-sm text-gray-500 font-medium">
                    {campaign.industry}
                  </p>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500 font-medium">Status:</span>
                  <span className="ml-2  font-medium">
                    {campaign.status || "draft"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 font-medium">Platforms:</span>
                  <span className="ml-2">
                    {campaign.platforms?.length || 0}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 font-medium">Posts:</span>
                  <span className="ml-2">
                    {campaign.total_posts || 0} total
                  </span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-1">
                {campaign.platforms?.slice(0, 3).map((platform: string) => (
                  <span
                    key={platform}
                    className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full "
                  >
                    {platform}
                  </span>
                ))}
                {campaign.platforms?.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-500 font-medium text-xs rounded-full">
                    +{campaign.platforms.length - 3} more
                  </span>
                )}
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3">
                <button
                  onClick={() => onSelectCampaign(campaignData)}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-md font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Create New Post
                </button>

                {(canSchedule || isBusinessAccount) && (
                  <button
                    onClick={() => onScheduleCampaign(campaignData)}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-md font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    Schedule Posts
                  </button>
                )}

                {onDashboardCampaign && (
                  <button
                    onClick={() => onDashboardCampaign(campaignData)}
                    className="w-full bg-gradient-to-r from-orange-600 to-yellow-600 text-white py-3 px-4 rounded-md font-medium hover:from-orange-700 hover:to-yellow-700 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <BarChart3 className="w-4 h-4" />
                    View Dashboard
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
