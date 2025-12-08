import React, { useState, useEffect } from "react";
import {
  Brain,
  TrendingUp,
  Target,
  Lightbulb,
  Settings,
  BarChart3,
  Activity,
  Award,
  Users,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  Database,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Star,
  ArrowUp,
  ArrowDown,
  Pause,
  Play,
} from "lucide-react";

import {
  aiTrainingService,
  TrainingCriteria,
  TrainingCategory,
  LearningInsight,
  TrainingPattern,
  TrainingMetrics,
  TrainingReport,
  DateRange,
} from "../lib/aiTrainingService";

interface AITrainingDashboardProps {
  campaignId: string;
}

type DashboardTab =
  | "overview"
  | "criteria"
  | "insights"
  | "patterns"
  | "reports";

export const AITrainingDashboard: React.FC<AITrainingDashboardProps> = ({
  campaignId,
}) => {
  // State management
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<TrainingMetrics | null>(null);
  const [criteria, setCriteria] = useState<TrainingCriteria[]>([]);
  const [insights, setInsights] = useState<LearningInsight[]>([]);
  const [patterns, setPatterns] = useState<TrainingPattern[]>([]);
  const [reports, setReports] = useState<TrainingReport[]>([]);

  // Filters and selections
  const [selectedCategory, setSelectedCategory] = useState<
    TrainingCategory | "all"
  >("all");
  const [dateRange, setDateRange] = useState<DateRange>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    end: new Date(),
  });

  // Modal states
  const [showCreateCriteria, setShowCreateCriteria] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedCriteria, setSelectedCriteria] =
    useState<TrainingCriteria | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, [campaignId, activeTab, selectedCategory, dateRange]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load metrics
      const metricsData = await aiTrainingService.getTrainingMetrics(
        campaignId,
        dateRange
      );
      setMetrics(metricsData);

      // Load data based on active tab
      switch (activeTab) {
        case "overview":
          await Promise.all([loadCriteria(), loadInsights(), loadPatterns()]);
          break;
        case "criteria":
          await loadCriteria();
          break;
        case "insights":
          await loadInsights();
          break;
        case "patterns":
          await loadPatterns();
          break;
        case "reports":
          await loadReports();
          break;
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadCriteria = async () => {
    const criteriaData = await aiTrainingService.getTrainingCriteria({
      category: selectedCategory === "all" ? undefined : selectedCategory,
      isActive: true,
    });
    setCriteria(criteriaData);
  };

  const loadInsights = async () => {
    const insightsData = await aiTrainingService.generateInsights(campaignId, {
      category: selectedCategory === "all" ? undefined : selectedCategory,
      limit: 20,
    });
    setInsights(insightsData);
  };

  const loadPatterns = async () => {
    const patternsData = await aiTrainingService.discoverPatterns(campaignId, {
      category: selectedCategory === "all" ? undefined : selectedCategory,
      minConfidence: 0.7,
      dateRange,
    });
    setPatterns(patternsData);
  };

  const loadReports = async () => {
    // Mock reports for now - would be loaded from API
    setReports([]);
  };

  const generateReport = async () => {
    try {
      const report = await aiTrainingService.generateTrainingReport(
        campaignId,
        dateRange
      );
      setReports((prev) => [report, ...prev]);
      setShowReportModal(false);
    } catch (error) {
      console.error("Error generating report:", error);
    }
  };

  const TabButton = ({
    id,
    label,
    icon,
    count,
  }: {
    id: DashboardTab;
    label: string;
    icon: React.ReactNode;
    count?: number;
  }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
        activeTab === id
          ? "bg-blue-100 text-blue-700 border-blue-200"
          : "text-gray-500 font-medium hover:text-slate-900 hover:bg-gray-50"
      } border`}
    >
      {icon}
      {label}
      {count !== undefined && (
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${
            activeTab === id
              ? "bg-blue-200 text-blue-800"
              : "bg-gray-200 text-gray-500 font-medium"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );

  const MetricCard = ({
    title,
    value,
    change,
    icon,
    color = "blue",
  }: {
    title: string;
    value: string | number;
    change?: number;
    icon: React.ReactNode;
    color?: "blue" | "green" | "purple" | "orange";
  }) => {
    const colorClasses = {
      blue: "bg-blue-50 text-blue-600 border-blue-200",
      green: "bg-green-50 text-green-600 border-green-200",
      purple: "bg-purple-50 text-purple-600 border-purple-200",
      orange: "bg-orange-50 text-orange-600 border-orange-200",
    };

    return (
      <div className="bg-white p-6 rounded-md border shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 font-medium">
              {title}
            </p>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            {change !== undefined && (
              <div
                className={`flex items-center gap-1 text-sm ${
                  change >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {change >= 0 ? (
                  <ArrowUp className="w-4 h-4" />
                ) : (
                  <ArrowDown className="w-4 h-4" />
                )}
                {Math.abs(change).toFixed(1)}%
              </div>
            )}
          </div>
          <div className={`p-3 rounded-md border ${colorClasses[color]}`}>
            {icon}
          </div>
        </div>
      </div>
    );
  };

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Learning Velocity"
          value={`${metrics?.learningVelocity.toFixed(1) || 0}%`}
          change={12.5}
          icon={<Zap className="w-6 h-6" />}
          color="blue"
        />
        <MetricCard
          title="Pattern Accuracy"
          value={`${metrics?.patternAccuracy.toFixed(1) || 0}%`}
          change={8.2}
          icon={<Target className="w-6 h-6" />}
          color="green"
        />
        <MetricCard
          title="User Satisfaction"
          value={`${metrics?.userSatisfaction.toFixed(1) || 0}%`}
          change={-2.1}
          icon={<ThumbsUp className="w-6 h-6" />}
          color="purple"
        />
        <MetricCard
          title="Content Quality"
          value={`${metrics?.contentQualityImprovement.toFixed(1) || 0}%`}
          change={15.8}
          icon={<Award className="w-6 h-6" />}
          color="orange"
        />
      </div>

      {/* Recent Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-md border shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">
              Recent Insights
            </h3>
            <Lightbulb className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="space-y-3">
            {insights.slice(0, 5).map((insight) => (
              <div key={insight.id} className="p-3 bg-gray-50 rounded-md">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">
                      {insight.insight}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500 font-medium">
                        Confidence: {(insight.confidence * 100).toFixed(0)}%
                      </span>
                      <span className="text-xs text-gray-500 font-medium">
                        Impact: {insight.impact}/10
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => setActiveTab("insights")}
            className="w-full mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            View All Insights
          </button>
        </div>

        <div className="bg-white p-6 rounded-md border shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">
              Active Training Criteria
            </h3>
            <Settings className="w-5 h-5 text-gray-500 font-medium" />
          </div>
          <div className="space-y-3">
            {criteria.slice(0, 5).map((criterion) => (
              <div
                key={criterion.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {criterion.name}
                  </p>
                  <p className="text-xs text-gray-500 font-medium">
                    {criterion.category}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      criterion.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-slate-800"
                    }`}
                  >
                    {criterion.isActive ? "Active" : "Inactive"}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    Priority: {criterion.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => setActiveTab("criteria")}
            className="w-full mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Manage Criteria
          </button>
        </div>
      </div>
    </div>
  );

  const CriteriaTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Training Criteria
          </h2>
          <p className="text-gray-500 font-medium">
            Define and manage AI learning parameters
          </p>
        </div>
        <button
          onClick={() => setShowCreateCriteria(true)}
          className="bg-blue-600 text-white px-4 py-2.5 rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Criteria
        </button>
      </div>

      <div className="bg-white rounded-md border shadow-md">
        <div className="p-4 border-b">
          <div className="flex items-center gap-4">
            <select
              value={selectedCategory}
              onChange={(e) =>
                setSelectedCategory(e.target.value as TrainingCategory | "all")
              }
              className="border border-gray-300 rounded-md px-3 py-2.5 text-sm"
            >
              <option value="all">All Categories</option>
              <option value="content_quality">Content Quality</option>
              <option value="user_engagement">User Engagement</option>
              <option value="performance_optimization">
                Performance Optimization
              </option>
              <option value="personalization">Personalization</option>
              <option value="platform_adaptation">Platform Adaptation</option>
              <option value="trend_analysis">Trend Analysis</option>
            </select>
          </div>
        </div>

        <div className="divide-y">
          {criteria.map((criterion) => (
            <div key={criterion.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium text-slate-900">
                      {criterion.name}
                    </h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        criterion.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-slate-800"
                      }`}
                    >
                      {criterion.isActive ? "Active" : "Inactive"}
                    </span>
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                      {criterion.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 font-medium mb-3">
                    {criterion.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
                    <span>Priority: {criterion.priority}/10</span>
                    <span>Conditions: {criterion.conditions.length}</span>
                    <span>
                      Updated: {new Date(criterion.lastUpdated).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedCriteria(criterion)}
                    className="p-2 text-gray-400 hover:text-gray-500 font-medium"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      /* Edit functionality */
                    }}
                    className="p-2 text-gray-400 hover:text-gray-500 font-medium"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      /* Delete functionality */
                    }}
                    className="p-2 text-red-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const InsightsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Learning Insights
          </h2>
          <p className="text-gray-500 font-medium">
            AI-generated recommendations and discoveries
          </p>
        </div>
        <button
          onClick={loadInsights}
          className="bg-blue-600 text-white px-4 py-2.5 rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="grid gap-6">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className="bg-white p-6 rounded-md border shadow-md"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-slate-900">
                    {insight.category}
                  </h3>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-gray-500 font-medium">
                      Priority: {insight.implementationPriority}
                    </span>
                  </div>
                </div>
                <p className="text-slate-700 mb-3">{insight.insight}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
                  <span>
                    Confidence: {(insight.confidence * 100).toFixed(0)}%
                  </span>
                  <span>Impact: {insight.impact}/10</span>
                  <span>Data Points: {insight.dataPoints}</span>
                  <span>
                    Generated: {new Date(insight.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {insight.recommendations.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 rounded-md">
                <h4 className="font-medium text-blue-900 mb-2">
                  Recommendations:
                </h4>
                <ul className="space-y-1">
                  {insight.recommendations.map((rec, index) => (
                    <li
                      key={index}
                      className="text-sm text-blue-800 flex items-start gap-2"
                    >
                      <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {insight.affectedFeatures.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {insight.affectedFeatures.map((feature, index) => (
                  <span
                    key={index}
                    className="text-xs px-2 py-1 bg-gray-100 text-slate-700 rounded"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const PatternsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Discovered Patterns
          </h2>
          <p className="text-gray-500 font-medium">
            Behavioral and performance patterns in your data
          </p>
        </div>
        <button
          onClick={loadPatterns}
          className="bg-blue-600 text-white px-4 py-2.5 rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Discover New
        </button>
      </div>

      <div className="grid gap-4">
        {patterns.map((pattern) => (
          <div
            key={pattern.id}
            className="bg-white p-6 rounded-md border shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-slate-900">
                    {pattern.pattern}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        pattern.confidence >= 0.8
                          ? "bg-green-100 text-green-800"
                          : pattern.confidence >= 0.6
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {(pattern.confidence * 100).toFixed(0)}% confidence
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500 font-medium mb-3">
                  <span>Frequency: {pattern.frequency}</span>
                  <span>Impact: {pattern.impact}/10</span>
                  <span>
                    Updated: {new Date(pattern.lastUpdated).toLocaleDateString()}
                  </span>
                </div>

                {pattern.recommendations.length > 0 && (
                  <div className="space-y-1">
                    {pattern.recommendations.map((rec, index) => (
                      <div
                        key={index}
                        className="text-sm text-slate-700 flex items-start gap-2"
                      >
                        <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        {rec}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const ReportsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Training Reports
          </h2>
          <p className="text-gray-500 font-medium">
            Comprehensive analysis of AI learning progress
          </p>
        </div>
        <button
          onClick={() => setShowReportModal(true)}
          className="bg-blue-600 text-white px-4 py-2.5 rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Generate Report
        </button>
      </div>

      <div className="bg-white p-8 rounded-md border shadow-md text-center">
        <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-900 mb-2">
          Reports Coming Soon
        </h3>
        <p className="text-gray-500 font-medium mb-4">
          Comprehensive training reports will be available to track AI learning
          progress and performance improvements.
        </p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-md">
            <Brain className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              AI Training Dashboard
            </h1>
            <p className="text-gray-500 font-medium">
              Monitor and optimize AI learning performance
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
            <Database className="w-4 h-4" />
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
          <button
            onClick={loadDashboardData}
            className="p-2 text-gray-500 font-medium hover:text-slate-900 hover:bg-gray-100 rounded-md"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-8">
        <TabButton
          id="overview"
          label="Overview"
          icon={<Activity className="w-4 h-4" />}
        />
        <TabButton
          id="criteria"
          label="Training Criteria"
          icon={<Target className="w-4 h-4" />}
          count={criteria.length}
        />
        <TabButton
          id="insights"
          label="Insights"
          icon={<Lightbulb className="w-4 h-4" />}
          count={insights.length}
        />
        <TabButton
          id="patterns"
          label="Patterns"
          icon={<TrendingUp className="w-4 h-4" />}
          count={patterns.length}
        />
        <TabButton
          id="reports"
          label="Reports"
          icon={<BarChart3 className="w-4 h-4" />}
        />
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && <OverviewTab />}
      {activeTab === "criteria" && <CriteriaTab />}
      {activeTab === "insights" && <InsightsTab />}
      {activeTab === "patterns" && <PatternsTab />}
      {activeTab === "reports" && <ReportsTab />}
    </div>
  );
};
