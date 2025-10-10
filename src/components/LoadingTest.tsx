import React from 'react';
import { useLoadingAPI } from '../hooks/useLoadingAPI';

export const LoadingTest: React.FC = () => {
  const { executeWithLoading, executeImageGeneration, executeVideoThumbnailGeneration } = useLoadingAPI();

  const testSimpleLoading = async () => {
    await executeWithLoading(
      async () => {
        // Simulate a 3-second API call
        await new Promise(resolve => setTimeout(resolve, 3000));
        console.log('Simple loading test completed!');
        return 'Test completed';
      },
      'Testing simple loading...'
    );
  };

  const testImageGeneration = async () => {
    await executeImageGeneration(
      async () => {
        // Simulate image generation API call
        await new Promise(resolve => setTimeout(resolve, 4000));
        console.log('Image generation test completed!');
        return { success: true, imageUrl: 'test-image-url' };
      },
      'Testing image generation'
    );
  };

  const testVideoThumbnail = async () => {
    await executeVideoThumbnailGeneration(
      async () => {
        // Simulate video thumbnail generation
        await new Promise(resolve => setTimeout(resolve, 3500));
        console.log('Video thumbnail test completed!');
        return 'test-thumbnail-url';
      },
      'Testing video thumbnail generation'
    );
  };

  return (
    <div className="p-4 space-y-4 bg-gray-900 text-white">
      <h2 className="text-xl font-bold">Loading System Test</h2>
      <div className="space-y-2">
        <button
          onClick={testSimpleLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors"
        >
          Test Simple Loading (3s)
        </button>
        <button
          onClick={testImageGeneration}
          className="w-full bg-green-600 hover:bg-green-700 px-4 py-2 rounded transition-colors"
        >
          Test Image Generation Loading (4s)
        </button>
        <button
          onClick={testVideoThumbnail}
          className="w-full bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded transition-colors"
        >
          Test Video Thumbnail Loading (3.5s)
        </button>
      </div>
      <p className="text-sm text-gray-400">
        Click any button to test the preloader overlay. The loading screen should appear with animations and progress.
      </p>
    </div>
  );
};
