/**
 * Unified AI Service for Multi-Model Support
 * Supports OpenAI, Google Gemini, Anthropic Claude, and more
 */

export interface AIModel {
  id: string;
  name: string;
  provider: 'openai' | 'google' | 'anthropic' | 'huggingface' | 'cohere' | 'deepseek' | 'meta' | 'mistral' | 'together' | 'replicate' | 'stability' | 'runway' | 'pika' | 'perplexity';
  type: 'text' | 'image' | 'video' | 'multimodal' | 'audio';
  description: string;
  capabilities: string[];
  pricing?: {
    input: number; // per 1K tokens
    output: number; // per 1K tokens
  };
  contextWindow: number;
  maxOutputTokens: number;
  isAvailable: boolean;
  specialFeatures?: string[];
}

export interface AIRequest {
  model: string;
  prompt: string;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  context?: any;
}

export interface AIResponse {
  content: string;
  model: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  finishReason?: string;
}

export interface ImageGenerationRequest {
  model: string;
  prompt: string;
  size?: string;
  quality?: 'standard' | 'hd';
  style?: string;
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3';
}

export interface ImageGenerationResponse {
  imageUrl: string;
  revisedPrompt?: string;
  model: string;
}

// Available AI Models Configuration
export const AI_MODELS: AIModel[] = [
  // Text Generation Models
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    type: 'multimodal',
    description: 'Most capable OpenAI model with vision, fast and efficient',
    capabilities: ['text', 'vision', 'code', 'reasoning'],
    pricing: { input: 5, output: 15 },
    contextWindow: 128000,
    maxOutputTokens: 4096,
    isAvailable: true
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo', 
    provider: 'openai',
    type: 'text',
    description: 'High-performance model with extended context window',
    capabilities: ['text', 'code', 'reasoning', 'analysis'],
    pricing: { input: 10, output: 30 },
    contextWindow: 128000,
    maxOutputTokens: 4096,
    isAvailable: true
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'openai', 
    type: 'text',
    description: 'Fast and cost-effective model for most tasks',
    capabilities: ['text', 'code', 'general'],
    pricing: { input: 0.5, output: 1.5 },
    contextWindow: 16000,
    maxOutputTokens: 4096,
    isAvailable: true
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'google',
    type: 'multimodal',
    description: 'Google\'s most capable model with multimodal understanding',
    capabilities: ['text', 'vision', 'code', 'reasoning'],
    pricing: { input: 1.25, output: 5 },
    contextWindow: 32000,
    maxOutputTokens: 8192,
    isAvailable: true
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'google',
    type: 'multimodal', 
    description: 'Latest Gemini with 1M+ token context window',
    capabilities: ['text', 'vision', 'code', 'reasoning', 'long-context'],
    pricing: { input: 3.5, output: 10.5 },
    contextWindow: 1000000,
    maxOutputTokens: 8192,
    isAvailable: true
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'anthropic',
    type: 'text',
    description: 'Most capable Claude model for complex reasoning',
    capabilities: ['text', 'code', 'reasoning', 'analysis'],
    pricing: { input: 15, output: 75 },
    contextWindow: 200000,
    maxOutputTokens: 4096,
    isAvailable: false // Requires API setup
  },
  {
    id: 'claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    provider: 'anthropic',
    type: 'text',
    description: 'Balanced performance and speed from Anthropic',
    capabilities: ['text', 'code', 'reasoning'],
    pricing: { input: 3, output: 15 },
    contextWindow: 200000,
    maxOutputTokens: 4096,
    isAvailable: false // Requires API setup
  },
  {
    id: 'claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    type: 'text',
    description: 'Latest and most capable Claude model with enhanced reasoning',
    capabilities: ['text', 'code', 'reasoning', 'analysis', 'creative-writing'],
    pricing: { input: 3, output: 15 },
    contextWindow: 200000,
    maxOutputTokens: 8192,
    isAvailable: true
  },
  {
    id: 'claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'anthropic',
    type: 'text',
    description: 'Fastest Claude model for simple tasks',
    capabilities: ['text', 'general', 'fast-response'],
    pricing: { input: 0.25, output: 1.25 },
    contextWindow: 200000,
    maxOutputTokens: 4096,
    isAvailable: true
  },
  // DeepSeek Models
  {
    id: 'deepseek-chat',
    name: 'DeepSeek Chat',
    provider: 'deepseek',
    type: 'text',
    description: 'Advanced Chinese AI model with strong reasoning capabilities',
    capabilities: ['text', 'code', 'reasoning', 'multilingual'],
    pricing: { input: 0.14, output: 0.28 },
    contextWindow: 32000,
    maxOutputTokens: 4096,
    isAvailable: true,
    specialFeatures: ['chinese-language', 'cost-effective']
  },
  {
    id: 'deepseek-coder',
    name: 'DeepSeek Coder',
    provider: 'deepseek',
    type: 'text',
    description: 'Specialized coding model from DeepSeek',
    capabilities: ['code', 'programming', 'debugging', 'code-review'],
    pricing: { input: 0.14, output: 0.28 },
    contextWindow: 16000,
    maxOutputTokens: 4096,
    isAvailable: true,
    specialFeatures: ['code-specialized', 'multiple-languages']
  },
  // Meta LLaMA Models
  {
    id: 'llama-3.1-405b',
    name: 'LLaMA 3.1 405B',
    provider: 'meta',
    type: 'text',
    description: 'Meta\'s largest and most capable open-source model',
    capabilities: ['text', 'code', 'reasoning', 'multilingual', 'long-context'],
    pricing: { input: 2.7, output: 2.7 },
    contextWindow: 128000,
    maxOutputTokens: 4096,
    isAvailable: true,
    specialFeatures: ['open-source', 'multilingual', 'large-scale']
  },
  {
    id: 'llama-3.1-70b',
    name: 'LLaMA 3.1 70B',
    provider: 'meta',
    type: 'text',
    description: 'High-performance Meta model for complex tasks',
    capabilities: ['text', 'code', 'reasoning', 'multilingual'],
    pricing: { input: 0.9, output: 0.9 },
    contextWindow: 128000,
    maxOutputTokens: 4096,
    isAvailable: true,
    specialFeatures: ['open-source', 'cost-effective']
  },
  {
    id: 'llama-3.1-8b',
    name: 'LLaMA 3.1 8B',
    provider: 'meta',
    type: 'text',
    description: 'Fast and efficient Meta model for general tasks',
    capabilities: ['text', 'general', 'fast-response'],
    pricing: { input: 0.2, output: 0.2 },
    contextWindow: 128000,
    maxOutputTokens: 2048,
    isAvailable: true,
    specialFeatures: ['open-source', 'fast', 'lightweight']
  },
  // Mistral Models
  {
    id: 'mistral-large',
    name: 'Mistral Large',
    provider: 'mistral',
    type: 'text',
    description: 'Mistral\'s flagship model with advanced reasoning',
    capabilities: ['text', 'code', 'reasoning', 'multilingual'],
    pricing: { input: 8, output: 24 },
    contextWindow: 32000,
    maxOutputTokens: 8192,
    isAvailable: true,
    specialFeatures: ['european-ai', 'multilingual']
  },
  {
    id: 'mistral-medium',
    name: 'Mistral Medium',
    provider: 'mistral',
    type: 'text',
    description: 'Balanced Mistral model for various tasks',
    capabilities: ['text', 'code', 'reasoning'],
    pricing: { input: 2.7, output: 8.1 },
    contextWindow: 32000,
    maxOutputTokens: 4096,
    isAvailable: true
  },
  {
    id: 'mistral-small',
    name: 'Mistral Small',
    provider: 'mistral',
    type: 'text',
    description: 'Cost-effective Mistral model for simple tasks',
    capabilities: ['text', 'general'],
    pricing: { input: 2, output: 6 },
    contextWindow: 32000,
    maxOutputTokens: 2048,
    isAvailable: true
  },
  // Cohere Models
  {
    id: 'command-r-plus',
    name: 'Command R+',
    provider: 'cohere',
    type: 'text',
    description: 'Cohere\'s most capable model for complex reasoning',
    capabilities: ['text', 'reasoning', 'analysis', 'rag'],
    pricing: { input: 3, output: 15 },
    contextWindow: 128000,
    maxOutputTokens: 4096,
    isAvailable: true,
    specialFeatures: ['rag-optimized', 'enterprise-ready']
  },
  {
    id: 'command-r',
    name: 'Command R',
    provider: 'cohere',
    type: 'text',
    description: 'Balanced Cohere model for general use',
    capabilities: ['text', 'reasoning', 'general'],
    pricing: { input: 0.5, output: 1.5 },
    contextWindow: 128000,
    maxOutputTokens: 4096,
    isAvailable: true
  },
  // Perplexity Models
  {
    id: 'pplx-70b-online',
    name: 'Perplexity 70B Online',
    provider: 'perplexity',
    type: 'text',
    description: 'Real-time web search integrated language model',
    capabilities: ['text', 'web-search', 'real-time-data', 'research'],
    pricing: { input: 1, output: 1 },
    contextWindow: 4096,
    maxOutputTokens: 4096,
    isAvailable: true,
    specialFeatures: ['web-search', 'real-time', 'citations']
  },
  {
    id: 'pplx-7b-online',
    name: 'Perplexity 7B Online',
    provider: 'perplexity',
    type: 'text',
    description: 'Fast web-search integrated model',
    capabilities: ['text', 'web-search', 'real-time-data'],
    pricing: { input: 0.2, output: 0.2 },
    contextWindow: 4096,
    maxOutputTokens: 4096,
    isAvailable: true,
    specialFeatures: ['web-search', 'fast', 'cost-effective']
  }
];

// Image Generation Models
export const IMAGE_MODELS: AIModel[] = [
  // OpenAI Image Models
  {
    id: 'dall-e-3',
    name: 'DALL-E 3',
    provider: 'openai',
    type: 'image',
    description: 'OpenAI\'s most advanced image generation model',
    capabilities: ['image-generation', 'text-to-image', 'high-quality'],
    contextWindow: 4000,
    maxOutputTokens: 0,
    isAvailable: true,
    specialFeatures: ['high-quality', 'prompt-adherence']
  },
  {
    id: 'dall-e-2', 
    name: 'DALL-E 2',
    provider: 'openai',
    type: 'image',
    description: 'Fast and cost-effective image generation',
    capabilities: ['image-generation', 'text-to-image'],
    contextWindow: 1000,
    maxOutputTokens: 0,
    isAvailable: true,
    specialFeatures: ['fast', 'cost-effective']
  },
  // Stability AI Models
  {
    id: 'stable-diffusion-xl',
    name: 'Stable Diffusion XL',
    provider: 'stability',
    type: 'image',
    description: 'High-resolution image generation with exceptional detail',
    capabilities: ['image-generation', 'text-to-image', 'high-resolution', 'artistic'],
    contextWindow: 2000,
    maxOutputTokens: 0,
    isAvailable: true,
    specialFeatures: ['high-resolution', 'artistic-styles', 'fine-control']
  },
  {
    id: 'stable-diffusion-3',
    name: 'Stable Diffusion 3',
    provider: 'stability',
    type: 'image',
    description: 'Latest Stability AI model with improved text rendering',
    capabilities: ['image-generation', 'text-to-image', 'text-in-image', 'photorealistic'],
    contextWindow: 2000,
    maxOutputTokens: 0,
    isAvailable: true,
    specialFeatures: ['text-rendering', 'photorealistic', 'improved-prompt-adherence']
  },
  {
    id: 'stable-cascade',
    name: 'Stable Cascade',
    provider: 'stability',
    type: 'image',
    description: 'Ultra-high resolution image generation in multiple stages',
    capabilities: ['image-generation', 'ultra-high-res', 'multi-stage'],
    contextWindow: 1500,
    maxOutputTokens: 0,
    isAvailable: true,
    specialFeatures: ['ultra-high-resolution', 'multi-stage-generation']
  },
  // Midjourney (via API)
  {
    id: 'midjourney-v6',
    name: 'Midjourney v6',
    provider: 'replicate',
    type: 'image',
    description: 'Artistic and creative image generation',
    capabilities: ['image-generation', 'artistic', 'creative', 'stylized'],
    contextWindow: 1000,
    maxOutputTokens: 0,
    isAvailable: true,
    specialFeatures: ['artistic', 'creative-styles', 'community-driven']
  },
  // Adobe Firefly
  {
    id: 'firefly-v2',
    name: 'Adobe Firefly v2',
    provider: 'replicate',
    type: 'image',
    description: 'Commercial-safe AI image generation from Adobe',
    capabilities: ['image-generation', 'commercial-safe', 'brand-ready'],
    contextWindow: 1500,
    maxOutputTokens: 0,
    isAvailable: true,
    specialFeatures: ['commercial-safe', 'brand-ready', 'copyright-safe']
  }
];

// Video Generation Models
export const VIDEO_MODELS: AIModel[] = [
  // Runway ML Models
  {
    id: 'runway-gen-2',
    name: 'Runway Gen-2',
    provider: 'runway',
    type: 'video',
    description: 'High-quality text-to-video and image-to-video generation',
    capabilities: ['video-generation', 'text-to-video', 'image-to-video', 'motion'],
    contextWindow: 1000,
    maxOutputTokens: 0,
    isAvailable: true,
    specialFeatures: ['professional-quality', 'motion-control', 'style-transfer']
  },
  {
    id: 'runway-gen-3',
    name: 'Runway Gen-3 Alpha',
    provider: 'runway',
    type: 'video',
    description: 'Latest Runway model with improved temporal consistency',
    capabilities: ['video-generation', 'text-to-video', 'high-fidelity', 'temporal-consistency'],
    contextWindow: 1500,
    maxOutputTokens: 0,
    isAvailable: true,
    specialFeatures: ['temporal-consistency', 'high-fidelity', 'professional']
  },
  // Pika Labs
  {
    id: 'pika-v1',
    name: 'Pika Labs v1',
    provider: 'pika',
    type: 'video',
    description: 'Creative video generation with unique artistic styles',
    capabilities: ['video-generation', 'creative', 'artistic-styles', 'animation'],
    contextWindow: 800,
    maxOutputTokens: 0,
    isAvailable: true,
    specialFeatures: ['creative-styles', 'animation', 'artistic-effects']
  },
  // Stability AI Video
  {
    id: 'stable-video-diffusion',
    name: 'Stable Video Diffusion',
    provider: 'stability',
    type: 'video',
    description: 'Open-source video generation from Stability AI',
    capabilities: ['video-generation', 'image-to-video', 'motion-generation'],
    contextWindow: 1000,
    maxOutputTokens: 0,
    isAvailable: true,
    specialFeatures: ['open-source', 'customizable', 'research-grade']
  },
  // AnimateDiff
  {
    id: 'animatediff',
    name: 'AnimateDiff',
    provider: 'replicate',
    type: 'video',
    description: 'Animation generation for existing images and styles',
    capabilities: ['animation', 'image-to-video', 'style-preservation'],
    contextWindow: 500,
    maxOutputTokens: 0,
    isAvailable: true,
    specialFeatures: ['style-preservation', 'smooth-animation', 'customizable']
  },
  // LTX Video (Lightricks)
  {
    id: 'ltx-video',
    name: 'LTX Video',
    provider: 'replicate',
    type: 'video',
    description: 'Fast and efficient video generation',
    capabilities: ['video-generation', 'fast-generation', 'text-to-video'],
    contextWindow: 800,
    maxOutputTokens: 0,
    isAvailable: true,
    specialFeatures: ['fast-generation', 'efficient', 'mobile-optimized']
  }
];

// Audio Generation Models (for future use)
export const AUDIO_MODELS: AIModel[] = [
  {
    id: 'elevenlabs-v1',
    name: 'ElevenLabs Voice',
    provider: 'replicate',
    type: 'audio',
    description: 'High-quality voice synthesis and cloning',
    capabilities: ['voice-synthesis', 'voice-cloning', 'text-to-speech'],
    contextWindow: 2000,
    maxOutputTokens: 0,
    isAvailable: true,
    specialFeatures: ['voice-cloning', 'multilingual', 'emotional-control']
  },
  {
    id: 'musicgen',
    name: 'MusicGen',
    provider: 'meta',
    type: 'audio',
    description: 'AI music generation from text descriptions',
    capabilities: ['music-generation', 'audio-synthesis', 'creative'],
    contextWindow: 1000,
    maxOutputTokens: 0,
    isAvailable: true,
    specialFeatures: ['music-creation', 'genre-control', 'tempo-control']
  }
];

class AIService {
  private baseUrl = '/api/ai';
  private userPreferences: { [key: string]: string } = {};

  constructor() {
    this.loadUserPreferences();
  }

  /**
   * Get available models filtered by type and availability
   */
  getAvailableModels(type?: 'text' | 'image' | 'multimodal'): AIModel[] {
    const allModels = type === 'image' ? IMAGE_MODELS : AI_MODELS;
    return allModels.filter(model => {
      if (!model.isAvailable) return false;
      if (type && model.type !== type && model.type !== 'multimodal') return false;
      return true;
    });
  }

  /**
   * Get model by ID
   */
  getModel(modelId: string): AIModel | undefined {
    return [...AI_MODELS, ...IMAGE_MODELS].find(model => model.id === modelId);
  }

  /**
   * Set user preference for a specific task
   */
  setModelPreference(task: string, modelId: string): void {
    this.userPreferences[task] = modelId;
    localStorage.setItem('ai-model-preferences', JSON.stringify(this.userPreferences));
  }

  /**
   * Get user preference for a specific task
   */
  getModelPreference(task: string, defaultModel?: string): string {
    return this.userPreferences[task] || defaultModel || 'gpt-4o';
  }

  /**
   * Load user preferences from localStorage
   */
  private loadUserPreferences(): void {
    try {
      const saved = localStorage.getItem('ai-model-preferences');
      if (saved) {
        this.userPreferences = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading AI model preferences:', error);
      this.userPreferences = {};
    }
  }

  /**
   * Generate text content using specified model
   */
  async generateText(request: AIRequest): Promise<AIResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/generate-text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate text');
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating text:', error);
      throw error;
    }
  }

  /**
   * Generate image using specified model
   */
  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/generate-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate image');
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating image:', error);
      throw error;
    }
  }

  /**
   * Generate social media content with user's preferred model
   */
  async generateSocialContent(
    prompt: string,
    platforms: string[],
    campaignContext?: any,
    preferredModel?: string
  ): Promise<AIResponse> {
    const modelId = preferredModel || this.getModelPreference('social-content', 'gpt-4o');
    
    const systemPrompt = `You are an expert social media strategist. Generate engaging content for ${platforms.join(', ')} platforms. 
Campaign context: ${JSON.stringify(campaignContext)}`;

    return this.generateText({
      model: modelId,
      prompt,
      systemPrompt,
      maxTokens: 1000,
      temperature: 0.7
    });
  }

  /**
   * Generate scheduling recommendations
   */
  async generateSchedule(
    prompt: string,
    platforms: string[],
    campaignId: string,
    options: any = {},
    preferredModel?: string
  ): Promise<AIResponse> {
    const modelId = preferredModel || this.getModelPreference('scheduling', 'gpt-4-turbo');
    
    // Enhanced prompt based on model capabilities
    const model = this.getModel(modelId);
    const enhancedPrompt = this.optimizePromptForModel(prompt, model, 'scheduling');

    return this.generateText({
      model: modelId,
      prompt: enhancedPrompt,
      maxTokens: model?.contextWindow && model.contextWindow > 32000 ? 2000 : 1500,
      temperature: 0.6
    });
  }

  /**
   * Optimize prompt based on model capabilities
   */
  private optimizePromptForModel(prompt: string, model?: AIModel, task?: string): string {
    if (!model) return prompt;

    let optimizedPrompt = prompt;

    // OpenAI models respond well to structured prompts
    if (model.provider === 'openai') {
      optimizedPrompt = `Task: ${task}\n\nRequest: ${prompt}\n\nPlease provide a structured and detailed response.`;
    }

    // Gemini models excel with conversational prompts
    if (model.provider === 'google') {
      optimizedPrompt = `I need help with ${task}. ${prompt} Please provide comprehensive guidance.`;
    }

    // Claude models prefer clear, direct instructions
    if (model.provider === 'anthropic') {
      optimizedPrompt = `${prompt}\n\nPlease analyze this request and provide a thorough response with clear reasoning.`;
    }

    return optimizedPrompt;
  }

  /**
   * Get model performance metrics (placeholder for future implementation)
   */
  async getModelMetrics(): Promise<any> {
    // This would track usage, response times, user satisfaction, etc.
    return {
      usage: {},
      performance: {},
      userRatings: {}
    };
  }
}

export const aiService = new AIService();
export { AIService };
