import { useAppContext } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { getPlatformIcon, getPlatformIconBackgroundColors } from '../../utils/platformIcons';
import { Platform } from '../../types';

function Analytics() {
  const { state } = useAppContext();
  const navigate = useNavigate();
  
  // Get top posts from generated posts
  const topPosts = state?.generatedPosts?.slice(0, 3) || [];
  const socialPlatforms: Platform[] = ['linkedin', 'facebook', 'instagram', 'youtube', 'tiktok'];

  return (
    <div>
      <h3 className="font-medium text-gray-900 text-md mb-2">Analytics</h3>

      <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 h-96 flex flex-col">
        <div className="flex gap-3 mb-6">
          {socialPlatforms.map((platform, i) => {
            const IconComponent = getPlatformIcon(platform);
            const bgColor = getPlatformIconBackgroundColors(platform);
            return (
              <div
                key={i}
                className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white ${bgColor}`}
              >
                <IconComponent className="w-5 h-5" />
              </div>
            );
          })}
        </div>

        <div className="mb-6">
          <h4 className="font-medium text-gray-900 text-md">Summary</h4>
          <p className="text-sm text-gray-500 mb-3 mt-1">Last 28 days</p>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Views</span>
              <span className="text-xs font-bold text-gray-900">100</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">
                Impressions click-through rate
              </span>
              <span className="text-xs font-bold text-gray-900">2.1%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">
                Average view duration
              </span>
              <span className="text-xs font-bold text-green-600">1:00</span>
            </div>
          </div>
        </div>

        <div className="mb-auto">
          <h4 className="font-medium text-gray-900 mb-2 text-md">Top Post</h4>
          <p className="text-sm text-gray-500 mb-2">Last 48 hours</p>
          <div className="space-y-1">
            {topPosts.length > 0 ? (
              topPosts.map((post, index) => (
                <p
                  key={index}
                  className="text-sm text-[#7650e3] hover:text-[#8a68d9] cursor-pointer underline line-clamp-1"
                >
                  {post.content?.substring(0, 70) || "Generated Post"}
                </p>
              ))
            ) : (
              <>
                <p className="text-sm text-[#7650e3] underline cursor-pointer hover:text-[#8a68d9]">
                  Best Tech Gadgets of 2025 You Can't Miss!
                </p>
                <p className="text-sm text-[#7650e3] underline cursor-pointer hover:text-[#8a68d9]">
                  The Most Powerful Smartphones of 2025 – Ranked!
                </p>
                <p className="text-sm text-[#7650e3] underline cursor-pointer hover:text-[#8a68d9]">
                  Future Tech: Devices That Feel Like Sci-Fi
                </p>
              </>
            )}
          </div>
        </div>

        <button
          onClick={() => navigate("/dashboard")}
          className="w-full text-white py-2.5 px-4 rounded-md font-bold text-sm transition-all border-2 mt-4"
          style={{
            backgroundColor: "#7650e3",
            borderColor: "#7650e3",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#d7d7fc";
            e.currentTarget.style.color = "#7650e3";
            e.currentTarget.style.borderColor = "#7650e3";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#7650e3";
            e.currentTarget.style.color = "white";
            e.currentTarget.style.borderColor = "#7650e3";
          }}
        >
          View Analytics
        </button>
      </div>
    </div>
  );
}

export default Analytics;
