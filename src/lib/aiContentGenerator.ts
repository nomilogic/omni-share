import axios from 'axios'

export interface GenerateImageOptions {
  prompt: string
  style?: 'realistic' | 'artistic' | 'cartoon' | 'abstract' | 'vintage' | 'modern' | 'fantasy' | 'cyberpunk' | 'watercolor' | 'oil_painting'
  userId?: string
  width?: number
  height?: number
  seed?: number
  saveToStorage?: boolean
}

export interface GenerateTextOptions {
  prompt: string
  type?: 'story' | 'article' | 'email' | 'code' | 'poem' | 'summary' | 'chat' | 'custom'
  model?: 'mistral' | 'llama' | 'openai' | 'claude'
  maxLength?: number
  userId?: string
}

export interface GeneratedImageResult {
  success: boolean
  data?: {
    imageUrl: string
    pollinationsUrl: string
    supabaseUrl?: string
    prompt: string
    originalPrompt: string
    style: string
    seed: number
    dimensions: { width: number; height: number }
    generatedAt: string
  }
  error?: string
  message?: string
}

export interface GeneratedTextResult {
  success: boolean
  data?: {
    text: string
    prompt: string
    originalPrompt: string
    type: string
    model: string
    maxLength: number
    wordCount: number
    generatedAt: string
    isFallback?: boolean
  }
  error?: string
  message?: string
  warning?: string
}

export class AIContentGenerator {
  private baseUrl: string

  constructor(baseUrl = '/api/ai-content') {
    this.baseUrl = baseUrl
  }

  /**
   * Generate an image using Pollinations AI
   */
  async generateImage(options: GenerateImageOptions): Promise<GeneratedImageResult> {
    try {
      console.log('Generating image with options:', {
        prompt: options.prompt.substring(0, 100) + '...',
        style: options.style,
        dimensions: `${options.width || 1024}x${options.height || 1024}`,
        saveToStorage: options.saveToStorage
      })

      const response = await axios.post(`${this.baseUrl}/generate-image`, {
        prompt: options.prompt,
        style: options.style || 'realistic',
        userId: options.userId,
        width: options.width || 1024,
        height: options.height || 1024,
        // seed: options.seed,
        saveToStorage: options.saveToStorage !== false // Default to true
      })

      console.log('Image generation successful:', response.data.success)
      return response.data

    } catch (error: any) {
      console.error('Image generation failed:', error)
      
      const errorMessage = error.response?.data?.error || error.message || 'Image generation failed'
      
      return {
        success: false,
        error: errorMessage,
        message: 'Failed to generate image with Pollinations AI'
      }
    }
  }

  /**
   * Generate text using Pollinations AI
   */
  async generateText(options: GenerateTextOptions): Promise<GeneratedTextResult> {
    try {
      console.log('Generating text with options:', {
        prompt: options.prompt.substring(0, 100) + '...',
        type: options.type,
        model: options.model,
        maxLength: options.maxLength
      })

      const response = await axios.post(`${this.baseUrl}/generate-text`, {
        prompt: options.prompt,
        type: options.type || 'custom',
        model: options.model || 'mistral',
        maxLength: options.maxLength || 500,
        userId: options.userId
      })

      console.log('Text generation successful, word count:', response.data.data?.wordCount)
      return response.data

    } catch (error: any) {
      console.error('Text generation failed:', error)
      
      const errorMessage = error.response?.data?.error || error.message || 'Text generation failed'
      
      return {
        success: false,
        error: errorMessage,
        message: 'Failed to generate text with Pollinations AI'
      }
    }
  }

  /**
   * Generate both image and text content for social media posts
   */
  async generatePostContent(options: {
    imagePrompt: string
    textPrompt: string
    imageStyle?: string
    textType?: string
    userId?: string
  }): Promise<{
    image: GeneratedImageResult
    text: GeneratedTextResult
  }> {
    console.log('Generating complete post content...')

    // Generate both image and text concurrently
    const [imageResult, textResult] = await Promise.all([
      this.generateImage({
        prompt: options.imagePrompt,
        style: options.imageStyle as any || 'realistic',
        userId: options.userId,
        width: 1024,
        height: 1024,
        saveToStorage: true
      }),
      this.generateText({
        prompt: options.textPrompt,
        type: options.textType as any || 'custom',
        userId: options.userId,
        maxLength: 300
      })
    ])

    return {
      image: imageResult,
      text: textResult
    }
  }

  /**
   * List user's generated images from storage
   */
  async listGeneratedImages(userId: string): Promise<{ success: boolean; images: any[]; error?: string }> {
    try {
      const response = await axios.get(`${this.baseUrl}/storage/list`, {
        params: { userId }
      })

      return response.data
    } catch (error: any) {
      console.error('Failed to list generated images:', error)
      return {
        success: false,
        images: [],
        error: error.response?.data?.error || error.message
      }
    }
  }
}

// Export a default instance
export const aiContentGenerator = new AIContentGenerator()

// Utility functions for common use cases

export async function generateSocialMediaImage(prompt: string, style = 'realistic', userId?: string): Promise<string | null> {
  const result = await aiContentGenerator.generateImage({
    prompt,
    style: style as any,
    userId,
    width: 1080,
    height: 1080,
    saveToStorage: true
  })

  if (result.success && result.data?.imageUrl) {
    return result.data.imageUrl
  }

  console.error('Failed to generate social media image:', result.error)
  return null
}

export async function generatePostCaption(prompt: string, platform: string = 'general', userId?: string): Promise<string | null> {
  // Customize prompt based on platform
  let enhancedPrompt = prompt
  
  switch (platform.toLowerCase()) {
    case 'twitter':
      enhancedPrompt = `Write a concise, engaging tweet about: ${prompt}. Keep it under 280 characters with relevant hashtags.`
      break
    case 'linkedin':
      enhancedPrompt = `Write a professional LinkedIn post about: ${prompt}. Make it informative and engaging for a business audience.`
      break
    case 'instagram':
      enhancedPrompt = `Write an Instagram caption about: ${prompt}. Make it visual, engaging, and include relevant hashtags.`
      break
    case 'facebook':
      enhancedPrompt = `Write a Facebook post about: ${prompt}. Make it conversational and engaging for friends and followers.`
      break
    default:
      enhancedPrompt = `Write an engaging social media post about: ${prompt}`
  }

  const result = await aiContentGenerator.generateText({
    prompt: enhancedPrompt,
    type: 'custom',
    userId,
    maxLength: platform.toLowerCase() === 'twitter' ? 50 : 100
  })

  if (result.success && result.data?.text) {
    return result.data.text
  }

  console.error('Failed to generate post caption:', result.error)
  return null
}

export async function generateHashtags(topic: string, count = 5): Promise<string[]> {
  const result = await aiContentGenerator.generateText({
    prompt: `Generate ${count} relevant hashtags for the topic: ${topic}. Return only the hashtags separated by commas, starting with #.`,
    type: 'custom',
    maxLength: 50
  })

  if (result.success && result.data?.text) {
    // Extract hashtags from the response
    const hashtags = result.data.text
      .split(/[,\n\s]+/)
      .filter(tag => tag.trim().startsWith('#'))
      .map(tag => tag.trim())
      .slice(0, count)
    
    if (hashtags.length > 0) {
      return hashtags
    }
  }

  // Fallback: generate simple hashtags based on topic
  const words = topic.split(' ').filter(word => word.length > 2)
  return words.slice(0, count).map(word => `#${word.toLowerCase().replace(/[^a-z0-9]/gi, '')}`)
}

// Enhanced error handling
export class AIContentError extends Error {
  constructor(
    message: string,
    public type: 'image' | 'text' | 'storage' | 'network',
    public retryable: boolean = true
  ) {
    super(message)
    this.name = 'AIContentError'
  }
}

// Retry wrapper for AI content generation
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 2,
  backoffMs = 1000
): Promise<T> {
  let lastError: Error

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      
      if (attempt === maxRetries) {
        throw new AIContentError(
          `Failed after ${maxRetries} attempts: ${lastError.message}`,
          'network',
          false
        )
      }

      // Wait before retrying with exponential backoff
      await new Promise(resolve => 
        setTimeout(resolve, backoffMs * Math.pow(2, attempt - 1))
      )
    }
  }

  throw lastError!
}
