// AI Training Service - Sprint 0.010
// Implements continuous learning criteria and data analysis for AI improvement

export interface TrainingDataPoint {
  id: string;
  timestamp: Date;
  userId: string;
  campaignId: string;
  type: TrainingDataType;
  context: TrainingContext;
  outcome: TrainingOutcome;
  metadata: Record<string, any>;
}

export type TrainingDataType = 
  | 'content_generation'
  | 'user_interaction' 
  | 'performance_metric'
  | 'content_preference'
  | 'platform_behavior'
  | 'engagement_pattern'
  | 'style_preference'
  | 'topic_performance';

export interface TrainingContext {
  platform?: string;
  contentType?: string;
  industry?: string;
  targetAudience?: string;
  previousInteractions?: string[];
  userBehavior?: UserBehaviorContext;
  contentCharacteristics?: ContentCharacteristics;
}

export interface UserBehaviorContext {
  sessionDuration: number;
  actionsPerformed: string[];
  preferredFeatures: string[];
  timeOfDay: string;
  deviceType: string;
  navigationPattern: string[];
}

export interface ContentCharacteristics {
  tone: string;
  style: string;
  length: number;
  topics: string[];
  hashtags: string[];
  mediaTypes: string[];
  platform: string;
  aiModel: string;
}

export interface TrainingOutcome {
  success: boolean;
  rating?: number; // 1-5 scale
  userFeedback?: string;
  performanceMetrics?: PerformanceMetrics;
  userActions?: UserAction[];
  timeToComplete?: number;
  revisionCount?: number;
}

export interface PerformanceMetrics {
  reach: number;
  engagement: number;
  clicks: number;
  shares: number;
  comments: number;
  likes: number;
  conversionRate?: number;
  sentimentScore?: number;
}

export interface UserAction {
  action: string;
  timestamp: Date;
  context?: Record<string, any>;
}

export interface TrainingPattern {
  id: string;
  pattern: string;
  confidence: number;
  frequency: number;
  impact: number;
  conditions: PatternCondition[];
  recommendations: string[];
  createdAt: Date;
  lastUpdated: Date;
}

export interface PatternCondition {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in_range';
  value: any;
  weight: number;
}

export interface TrainingCriteria {
  id: string;
  name: string;
  description: string;
  category: TrainingCategory;
  priority: number; // 1-10
  conditions: CriteriaCondition[];
  weights: CriteriaWeights;
  thresholds: CriteriaThresholds;
  isActive: boolean;
  createdAt: Date;
  lastUpdated: Date;
}

export type TrainingCategory = 
  | 'content_quality'
  | 'user_engagement'
  | 'performance_optimization'
  | 'personalization'
  | 'platform_adaptation'
  | 'trend_analysis';

export interface CriteriaCondition {
  field: string;
  operator: string;
  value: any;
  weight: number;
}

export interface CriteriaWeights {
  userFeedback: number;
  performanceMetrics: number;
  userBehavior: number;
  contentCharacteristics: number;
  platformSpecific: number;
}

export interface CriteriaThresholds {
  minDataPoints: number;
  minConfidence: number;
  maxAge: number; // days
  minImpact: number;
}

export interface LearningInsight {
  id: string;
  category: string;
  insight: string;
  confidence: number;
  impact: number;
  dataPoints: number;
  recommendations: string[];
  affectedFeatures: string[];
  implementationPriority: number;
  createdAt: Date;
}

export interface TrainingReport {
  id: string;
  campaignId: string;
  period: DateRange;
  summary: TrainingSummary;
  insights: LearningInsight[];
  patterns: TrainingPattern[];
  recommendations: TrainingRecommendation[];
  metrics: TrainingMetrics;
  generatedAt: Date;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface TrainingSummary {
  totalDataPoints: number;
  patternsDiscovered: number;
  insightsGenerated: number;
  improvementScore: number;
  confidenceLevel: number;
  topCategories: { category: string; impact: number; }[];
}

export interface TrainingRecommendation {
  id: string;
  type: 'model_adjustment' | 'feature_enhancement' | 'user_experience' | 'content_strategy';
  priority: number;
  description: string;
  expectedImpact: string;
  implementation: string;
  effort: 'low' | 'medium' | 'high';
  timeline: string;
}

export interface TrainingMetrics {
  learningVelocity: number;
  patternAccuracy: number;
  predictionSuccess: number;
  userSatisfaction: number;
  contentQualityImprovement: number;
  engagementImprovement: number;
}

export class AITrainingService {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  // Data Collection Methods
  async recordTrainingData(data: Omit<TrainingDataPoint, 'id' | 'timestamp'>): Promise<TrainingDataPoint> {
    try {
      const response = await fetch(`${this.baseUrl}/training/data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to record training data: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error recording training data:', error);
      throw error;
    }
  }

  async recordContentGeneration(params: {
    campaignId: string;
    userId: string;
    contentType: string;
    platform: string;
    aiModel: string;
    prompt: string;
    generatedContent: string;
    userRating?: number;
    userFeedback?: string;
    revisionCount: number;
    timeToComplete: number;
    finalUsed: boolean;
  }): Promise<void> {
    const trainingData: Omit<TrainingDataPoint, 'id' | 'timestamp'> = {
      userId: params.userId,
      campaignId: params.campaignId,
      type: 'content_generation',
      context: {
        platform: params.platform,
        contentType: params.contentType,
        contentCharacteristics: {
          tone: this.extractTone(params.generatedContent),
          style: this.extractStyle(params.generatedContent),
          length: params.generatedContent.length,
          topics: this.extractTopics(params.generatedContent),
          hashtags: this.extractHashtags(params.generatedContent),
          mediaTypes: [],
          platform: params.platform,
          aiModel: params.aiModel,
        },
      },
      outcome: {
        success: params.finalUsed,
        rating: params.userRating,
        userFeedback: params.userFeedback,
        timeToComplete: params.timeToComplete,
        revisionCount: params.revisionCount,
      },
      metadata: {
        prompt: params.prompt,
        generatedContent: params.generatedContent,
        aiModel: params.aiModel,
      },
    };

    await this.recordTrainingData(trainingData);
  }

  async recordUserInteraction(params: {
    campaignId: string;
    userId: string;
    action: string;
    feature: string;
    context?: Record<string, any>;
    sessionDuration: number;
    deviceType: string;
    successful: boolean;
  }): Promise<void> {
    const trainingData: Omit<TrainingDataPoint, 'id' | 'timestamp'> = {
      userId: params.userId,
      campaignId: params.campaignId,
      type: 'user_interaction',
      context: {
        userBehavior: {
          sessionDuration: params.sessionDuration,
          actionsPerformed: [params.action],
          preferredFeatures: [params.feature],
          timeOfDay: new Date().getHours().toString(),
          deviceType: params.deviceType,
          navigationPattern: [],
        },
      },
      outcome: {
        success: params.successful,
      },
      metadata: {
        action: params.action,
        feature: params.feature,
        context: params.context,
      },
    };

    await this.recordTrainingData(trainingData);
  }

  async recordPerformanceMetrics(params: {
    campaignId: string;
    userId: string;
    contentId: string;
    platform: string;
    metrics: PerformanceMetrics;
    contentCharacteristics: ContentCharacteristics;
  }): Promise<void> {
    const trainingData: Omit<TrainingDataPoint, 'id' | 'timestamp'> = {
      userId: params.userId,
      campaignId: params.campaignId,
      type: 'performance_metric',
      context: {
        platform: params.platform,
        contentCharacteristics: params.contentCharacteristics,
      },
      outcome: {
        success: params.metrics.engagement > 0,
        performanceMetrics: params.metrics,
      },
      metadata: {
        contentId: params.contentId,
        platform: params.platform,
      },
    };

    await this.recordTrainingData(trainingData);
  }

  // Pattern Discovery Methods
  async discoverPatterns(campaignId: string, options?: {
    category?: TrainingCategory;
    minConfidence?: number;
    dateRange?: DateRange;
  }): Promise<TrainingPattern[]> {
    try {
      const queryParams = new URLSearchParams({
        campaignId,
        ...(options?.category && { category: options.category }),
        ...(options?.minConfidence && { minConfidence: options.minConfidence.toString() }),
        ...(options?.dateRange?.start && { startDate: options.dateRange.start.toISOString() }),
        ...(options?.dateRange?.end && { endDate: options.dateRange.end.toISOString() }),
      });

      const response = await fetch(`${this.baseUrl}/training/patterns?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`Failed to discover patterns: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error discovering patterns:', error);
      throw error;
    }
  }

  async generateInsights(campaignId: string, options?: {
    category?: string;
    minImpact?: number;
    limit?: number;
  }): Promise<LearningInsight[]> {
    try {
      const queryParams = new URLSearchParams({
        campaignId,
        ...(options?.category && { category: options.category }),
        ...(options?.minImpact && { minImpact: options.minImpact.toString() }),
        ...(options?.limit && { limit: options.limit.toString() }),
      });

      const response = await fetch(`${this.baseUrl}/training/insights?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`Failed to generate insights: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating insights:', error);
      throw error;
    }
  }

  // Training Criteria Management
  async createTrainingCriteria(criteria: Omit<TrainingCriteria, 'id' | 'createdAt' | 'lastUpdated'>): Promise<TrainingCriteria> {
    try {
      const response = await fetch(`${this.baseUrl}/training/criteria`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...criteria,
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create training criteria: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating training criteria:', error);
      throw error;
    }
  }

  async getTrainingCriteria(options?: {
    category?: TrainingCategory;
    isActive?: boolean;
  }): Promise<TrainingCriteria[]> {
    try {
      const queryParams = new URLSearchParams({
        ...(options?.category && { category: options.category }),
        ...(options?.isActive !== undefined && { isActive: options.isActive.toString() }),
      });

      const response = await fetch(`${this.baseUrl}/training/criteria?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`Failed to get training criteria: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting training criteria:', error);
      throw error;
    }
  }

  async updateTrainingCriteria(id: string, updates: Partial<TrainingCriteria>): Promise<TrainingCriteria> {
    try {
      const response = await fetch(`${this.baseUrl}/training/criteria/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...updates,
          lastUpdated: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update training criteria: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating training criteria:', error);
      throw error;
    }
  }

  // Reporting Methods
  async generateTrainingReport(campaignId: string, period: DateRange): Promise<TrainingReport> {
    try {
      const response = await fetch(`${this.baseUrl}/training/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaignId,
          period: {
            start: period.start.toISOString(),
            end: period.end.toISOString(),
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate training report: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating training report:', error);
      throw error;
    }
  }

  async getTrainingMetrics(campaignId: string, period?: DateRange): Promise<TrainingMetrics> {
    try {
      const queryParams = new URLSearchParams({
        campaignId,
        ...(period?.start && { startDate: period.start.toISOString() }),
        ...(period?.end && { endDate: period.end.toISOString() }),
      });

      const response = await fetch(`${this.baseUrl}/training/metrics?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`Failed to get training metrics: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting training metrics:', error);
      throw error;
    }
  }

  // Analysis Helper Methods
  async analyzeContentPreferences(campaignId: string): Promise<{
    topicPreferences: { topic: string; score: number; }[];
    stylePreferences: { style: string; score: number; }[];
    platformPreferences: { platform: string; score: number; }[];
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/training/analysis/preferences/${campaignId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to analyze content preferences: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error analyzing content preferences:', error);
      throw error;
    }
  }

  async predictContentPerformance(params: {
    campaignId: string;
    contentCharacteristics: ContentCharacteristics;
    platform: string;
    targetAudience?: string;
  }): Promise<{
    predictedMetrics: PerformanceMetrics;
    confidence: number;
    recommendations: string[];
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/training/predict/performance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`Failed to predict content performance: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error predicting content performance:', error);
      throw error;
    }
  }

  // Utility Methods
  private extractTone(content: string): string {
    // Simple tone analysis - would be more sophisticated in real implementation
    const toneKeywords = {
      professional: ['business', 'strategic', 'growth', 'success', 'industry'],
      casual: ['hey', 'awesome', 'cool', 'fun', 'easy'],
      enthusiastic: ['excited', 'amazing', 'incredible', 'fantastic', 'love'],
      informative: ['learn', 'discover', 'understand', 'explain', 'guide'],
    };

    let maxScore = 0;
    let detectedTone = 'neutral';

    for (const [tone, keywords] of Object.entries(toneKeywords)) {
      const score = keywords.reduce((acc, keyword) => 
        acc + (content.toLowerCase().includes(keyword) ? 1 : 0), 0);
      
      if (score > maxScore) {
        maxScore = score;
        detectedTone = tone;
      }
    }

    return detectedTone;
  }

  private extractStyle(content: string): string {
    // Simple style analysis
    if (content.includes('?') && content.split('?').length > 2) return 'question-heavy';
    if (content.split('.').length > 5) return 'detailed';
    if (content.split(' ').length < 20) return 'concise';
    if (content.includes('!')) return 'energetic';
    return 'standard';
  }

  private extractTopics(content: string): string[] {
    // Simple topic extraction - would use NLP in real implementation
    const topicKeywords = {
      'marketing': ['marketing', 'brand', 'campaign', 'advertising'],
      'technology': ['tech', 'AI', 'software', 'digital', 'innovation'],
      'business': ['business', 'strategy', 'growth', 'revenue', 'profit'],
      'social media': ['social', 'engagement', 'followers', 'viral'],
      'leadership': ['leadership', 'team', 'management', 'culture'],
    };

    const topics = [];
    const lowerContent = content.toLowerCase();

    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some(keyword => lowerContent.includes(keyword))) {
        topics.push(topic);
      }
    }

    return topics;
  }

  private extractHashtags(content: string): string[] {
    const hashtagRegex = /#[\w]+/g;
    const hashtags = content.match(hashtagRegex);
    return hashtags || [];
  }
}

export const aiTrainingService = new AITrainingService();
