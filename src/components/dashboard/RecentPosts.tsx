import { useAppContext } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { getPlatformIcon, getPlatformIconBackgroundColors } from '../../utils/platformIcons';
import { Platform } from '../../types';

function RecentPosts() {
  const { state } = useAppContext();
  const navigate = useNavigate();
  
  // Get recent generated posts
  const recentPosts = state?.generatedPosts?.slice(0, 3) || [];
  const lastPost = recentPosts[0];
  const socialPlatforms: Platform[] = ['linkedin', 'facebook', 'instagram', 'youtube', 'tiktok'];

  return (
    <div>
      <h3 className="font-medium text-gray-900 text-md mb-2">Recent Posts</h3>

      <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 h-96 flex flex-col">
        <div className="flex gap-3 mb-5">
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

        <div className="flex-1 mb-5">
          {lastPost?.image ? (
            <div className="relative rounded-lg overflow-hidden h-full">
              <img
                src={lastPost.image}
                alt="Recent Post"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-black/20 p-3">
                <h4 className="text-white font-bold text-xs truncate">
                  {lastPost.content?.substring(0, 50) || "Post Title"}...
                </h4>
              </div>
            </div>
          ) : (
            <div className="relative rounded-lg overflow-hidden bg-gradient-to-br from-indigo-100 to-indigo-50 h-full flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl mb-2">📱</div>
                <p className="text-xs text-gray-500">No posts yet</p>
              </div>
            </div>
          )}
        </div>

        <p className="text-sm text-gray-500 mb-4">
          {recentPosts.length > 0
            ? `Last Post: Recently`
            : "No posts created yet"}
        </p>

        <button
          onClick={() => navigate("/content")}
          className="w-full text-white py-2.5 px-4 rounded-md font-bold text-sm transition-all border-2"
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
          Create Post
        </button>
      </div>
    </div>
  );
}

export default RecentPosts;
