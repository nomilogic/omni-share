import React, { useState, useEffect } from 'react';
import { Settings, ChevronDown, Check, Info, Zap, DollarSign, Clock, Brain, Bot, Search, Sparkles } from 'lucide-react';
import { AIModel, aiService, AI_MODELS, IMAGE_MODELS } from '../lib/aiService';

interface AIModelSelectorProps {
  task: 'content-generation' | 'scheduling' | 'image-generation' | 'social-content';
  selectedModel?: string;
  onModelSelect: (modelId: string) => void;
  showAdvanced?: boolean;
}

const TASK_DESCRIPTIONS = {
  'content-generation': 'General content creation and writing',
  'scheduling': 'AI-powered post scheduling and calendar generation',
  'image-generation': 'AI image and visual content creation',
  'social-content': 'Social media post and caption generation'
};

const TASK_RECOMMENDATIONS = {
  'content-generation': ['gpt-4o', 'gpt-4-turbo', 'gemini-1.5-pro'],
  'scheduling': ['gpt-4-turbo', 'gemini-1.5-pro', 'gpt-4o'],
  'image-generation': ['dall-e-3', 'dall-e-2'],
  'social-content': ['gpt-4o', 'gemini-pro', 'gpt-3.5-turbo']
};

export const AIModelSelector: React.FC<AIModelSelectorProps> = ({
  task,
  selectedModel,
  onModelSelect,
  showAdvanced = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [userPreferences, setUserPreferences] = useState<{[key: string]: string}>({});

  const availableModels = task === 'image-generation'
    ? aiService.getAvailableModels('image')
    : aiService.getAvailableModels('text');

  const recommendedModels = TASK_RECOMMENDATIONS[task] || [];
  const currentModel = selectedModel || aiService.getModelPreference(task);
  const selectedModelInfo = aiService.getModel(currentModel);

  useEffect(() => {
    // Load user preferences
    const loadPreferences = async () => {
      const prefs = JSON.parse(localStorage.getItem('ai-model-preferences') || '{}');
      setUserPreferences(prefs);
    };
    loadPreferences();
  }, []);

  const handleModelSelect = (modelId: string) => {
    aiService.setModelPreference(task, modelId);
    onModelSelect(modelId);
    setIsOpen(false);

    // Update local preferences state
    setUserPreferences(prev => ({ ...prev, [task]: modelId }));
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'openai':
        return Bot;
      case 'google':
        return Search;
      case 'anthropic':
        return Brain;
      default:
        return Sparkles;
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'openai':
        return 'bg-green-100 text-green-800';
      case 'google':
        return 'bg-blue-100 text-blue-800';
      case 'anthropic':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (price: number) => {
    return price < 1 ? `$${(price * 1000).toFixed(0)}k` : `$${price.toFixed(1)}k`;
  };

  const getPerformanceBadge = (modelId: string) => {
    if (recommendedModels.includes(modelId)) {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
          <Zap className="w-3 h-3 mr-1" />
          Recommended
        </span>
      );
    }
    return null;
  };

  const ModelCard = ({ model, isSelected, onClick }: {
    model: AIModel;
    isSelected: boolean;
    onClick: () => void;
  }) => (
    <div
      onClick={onClick}
      className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected
          ? 'border-blue-500 bg-blue-50 shadow-sm'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getProviderColor(model.provider)} bg-opacity-20`}>
            {(() => {
              const IconComponent = getProviderIcon(model.provider);
              return <IconComponent className={`w-4 h-4 ${getProviderColor(model.provider).split(' ')[1]}`} />;
            })()}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{model.name}</h3>
            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getProviderColor(model.provider)}`}>
              {model.provider}
            </span>
          </div>
        </div>
        {isSelected && <Check className="w-5 h-5 text-blue-600" />}
      </div>

      <p className="text-sm text-gray-600 mb-3">{model.description}</p>

      <div className="flex flex-wrap gap-1 mb-3">
        {model.capabilities.slice(0, 3).map(capability => (
          <span key={capability} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
            {capability}
          </span>
        ))}
        {model.capabilities.length > 3 && (
          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
            +{model.capabilities.length - 3} more
          </span>
        )}
      </div>

      {showAdvanced && (
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
          <div className="flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            {model.contextWindow >= 100000 ? `${Math.round(model.contextWindow/1000)}K` : `${Math.round(model.contextWindow/1000)}K`} tokens
          </div>
          {model.pricing && (
            <div className="flex items-center">
              <DollarSign className="w-3 h-3 mr-1" />
              {formatPrice(model.pricing.input)}/1K
            </div>
          )}
        </div>
      )}

      <div className="mt-2">
        {getPerformanceBadge(model.id)}
      </div>
    </div>
  );

  return (
    <div className="relative">
      {/* Current Selection Display */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <div className="flex items-center space-x-2">
            <Brain className="w-4 h-4" />
            <span>AI Model for {TASK_DESCRIPTIONS[task]}</span>
          </div>
        </label>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <div className="flex items-center space-x-3">
            <div className="w-5 h-5 flex items-center justify-center">
              {selectedModelInfo ? (
                (() => {
                  const IconComponent = getProviderIcon(selectedModelInfo.provider);
                  return <IconComponent className="w-4 h-4 text-gray-600" />;
                })()
              ) : (
                <Sparkles className="w-4 h-4 text-gray-600" />
              )}
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900">
                {selectedModelInfo?.name || 'Select AI Model'}
              </div>
              <div className="text-sm text-gray-500">
                {selectedModelInfo?.provider || 'No provider'} • {selectedModelInfo?.type || 'text'}
              </div>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Model Selection Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Select AI Model</h3>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
              >
                <Info className="w-4 h-4" />
                <span>{showDetails ? 'Hide' : 'Show'} Details</span>
              </button>
            </div>

            {/* Recommended Models */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                <Zap className="w-4 h-4 mr-1 text-blue-600" />
                Recommended for {task.replace('-', ' ')}
              </h4>
              <div className="grid gap-3">
                {availableModels
                  .filter(model => recommendedModels.includes(model.id))
                  .map(model => (
                    <ModelCard
                      key={model.id}
                      model={model}
                      isSelected={currentModel === model.id}
                      onClick={() => handleModelSelect(model.id)}
                    />
                  ))
                }
              </div>
            </div>

            {/* All Available Models */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">All Available Models</h4>
              <div className="grid gap-3">
                {availableModels
                  .filter(model => !recommendedModels.includes(model.id))
                  .map(model => (
                    <ModelCard
                      key={model.id}
                      model={model}
                      isSelected={currentModel === model.id}
                      onClick={() => handleModelSelect(model.id)}
                    />
                  ))
                }
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIModelSelector;