import {useState} from 'react';

// Define the component using a functional component structure
const CommunitySignup: React.FC = () => {
    const [loading, setLoading] = useState(false);
  return (
    // Outer container for the section, using a light background color and padding
    // Relative positioning is needed for the absolute-positioned dots
    <div className="relative bg-white py-16 sm:py-24 lg:py-32 overflow-hidden">
      
      {/* Floating Decorative Dots/Shapes (Mimicking the image) 
        These are positioned absolutely to float around the main content
      */}
      
      {/* Top Left - Small Blue Dot */}
      <div className="absolute top-1/4 left-1/4 w-1.5 h-1.5 bg-blue-400 rounded-full opacity-60"></div>
      
      {/* Mid Left - Larger Dark Blue Dot */}
      <div className="absolute top-1/3 left-[20%] w-2 h-2 bg-indigo-900 rounded-full"></div>
      
      {/* Top Left - Large Purple Dot */}
      <div className="absolute top-[25%] left-[30%] w-3 h-3 bg-indigo-600 rounded-full"></div>
      
      {/* Mid Center - Small Diamond */}
      <div 
        className="absolute bottom-[20%] left-1/2 w-2 h-2 bg-blue-500 transform rotate-45 hidden sm:block"
        style={{ width: '8px', height: '8px' }} // Inline style for precise small size
      ></div>

      {/* Top Right - Diamond */}
      <div 
        className="absolute top-[28%] right-[32%] w-2 h-2 bg-blue-500 transform rotate-45"
        style={{ width: '8px', height: '8px' }} // Inline style for precise small size
      ></div>
      
      {/* Mid Right - Dark Blue Dot */}
      <div className="absolute top-1/2 right-[25%] w-3 h-3 bg-indigo-900 rounded-full"></div>

      {/* Bottom Right - Small Blue Dot */}
      <div className="absolute bottom-[25%] right-[20%] w-1.5 h-1.5 bg-blue-400 rounded-full opacity-60"></div>
      

      {/* Main Content Area: Centered Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          
          {/* Main Headline Text */}
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl leading-relaxed">
            Join our community today and<br />never miss an update!
          </h2>
          
          {/* Email Signup Form/Input Area */}
          <form className="mt-8 max-w-sm mx-auto sm:flex sm:justify-center sm:gap-3">
            <div className="min-w-0 flex-1">
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="px-3 py-2 w-64 rounded-md bg-white border border-purple-600 text-purple-600 placeholder-purple-600/80 focus:outline-none focus:ring-2 focus:ring-purple-600 transition"
                placeholder="Email address"
              />
            </div>
            
            <div className="mt-3 sm:mt-0 sm:ml-4">
              <button
                type="submit"
                className={`px-4 py-2 w-[30%] sm:w-[110px] rounded-md border font-medium shadow-lg transition
                    ${
          loading
            ? "bg-purple-600 text-white border-purple-600 cursor-not-allowed"
            : "bg-white text-theme-secondary border-purple-600"
          }`}
              >{loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16 8 8 0 01-8-8z"
                        ></path>
                      </svg>
                      Joining...
                    </div>
                  ) : (
                    "Join Now"
                  )}
                
              </button>
            </div>
          </form>
          
        </div>
      </div>
    </div>
  );
};

export default CommunitySignup;