import React from "react";
import Icon, { IconName } from "./Icon";

const IconShowcase: React.FC = () => {
  const icons: { name: IconName; description: string }[] = [
    { name: "text-post", description: "Text Post" },
    { name: "image-post", description: "Image Post" },
    { name: "video-post", description: "Video Post" },
    { name: "click-to-browse", description: "Click to Browse" },
    { name: "connect-accounts", description: "Connect Accounts" },
    { name: "edit-post", description: "Edit Post" },
    { name: "play", description: "Play" },
    { name: "logo", description: "Logo" },
  ];

  const colors = ["purple", "blue", "green", "red", "orange", "yellow"];
  const sizes = [16, 24, 32, 48, 64];

  return (
    <div className="p-8 bg-gray-50 h-full-dec-hf  x-2">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-8">
          Icon Component Showcase
        </h1>

        {/* Basic Icons */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-slate-700 mb-6">
            Available Icons
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
            {icons.map((icon) => (
              <div
                key={icon.name}
                className="flex flex-col items-center p-4 bg-white rounded-md shadow-md hover:shadow-lg transition-shadow"
              >
                <Icon name={icon.name} size={48} className="mb-3" />
                <span className="text-sm font-medium text-slate-500 text-center">
                  {icon.description}
                </span>
                <span className="text-xs text-gray-400 mt-1">{icon.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Different Sizes */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-slate-700 mb-6">
            Size Variations
          </h2>
          <div className="bg-white rounded-md p-6 shadow-md">
            <div className="flex items-end space-x-6">
              {sizes.map((size) => (
                <div key={size} className="flex flex-col items-center">
                  <Icon name="logo" size={size} className="mb-2" />
                  <span className="text-sm text-slate-500">{size}px</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Color Variations */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-slate-700 mb-6">
            Color Variations
          </h2>
          <div className="bg-white rounded-md p-6 shadow-md">
            <div className="grid grid-cols-3 md:grid-cols-6 gap-6">
              {colors.map((color) => (
                <div key={color} className="flex flex-col items-center">
                  <Icon
                    name="image-post"
                    size={48}
                    color={color}
                    className="mb-2"
                  />
                  <span className="text-sm text-slate-500 ">{color}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Interactive Example */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-slate-700 mb-6">
            Interactive Icons
          </h2>
          <div className="bg-white rounded-md p-6 shadow-md">
            <div className="flex space-x-4 mb-4">
              <Icon
                name="play"
                size={48}
                className="hover:scale-110 transition-transform duration-200"
                onClick={() => alert("Play clicked!")}
              />
              <Icon
                name="edit-post"
                size={48}
                className="hover:scale-110 transition-transform duration-200"
                onClick={() => alert("Edit clicked!")}
              />
              <Icon
                name="connect-accounts"
                size={48}
                className="hover:scale-110 transition-transform duration-200"
                onClick={() => alert("Connect clicked!")}
              />
            </div>
            <p className="text-sm text-slate-500">
              Click on the icons above to see interactive functionality!
            </p>
          </div>
        </section>

        {/* Usage Examples */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-700 mb-6">
            Usage Examples
          </h2>
          <div className="bg-white rounded-md p-6 shadow-md">
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-md">
                <h3 className="text-lg font-medium mb-2">Basic Usage</h3>
                <pre className="text-sm bg-gray-800 text-green-400 p-3 rounded overflow-x-auto">
                  <code>{`<Icon name="text-post" size={24} />`}</code>
                </pre>
              </div>

              <div className="p-4 bg-gray-50 rounded-md">
                <h3 className="text-lg font-medium mb-2">
                  With Color and Click Handler
                </h3>
                <pre className="text-sm bg-gray-800 text-green-400 p-3 rounded overflow-x-auto">
                  <code>{`<Icon 
  name="play" 
  size={48} 
  color="blue"
  onClick={() => console.log('Clicked!')} 
/>`}</code>
                </pre>
              </div>

              <div className="p-4 bg-gray-50 rounded-md">
                <h3 className="text-lg font-medium mb-2">
                  With Custom Classes
                </h3>
                <pre className="text-sm bg-gray-800 text-green-400 p-3 rounded overflow-x-auto">
                  <code>{`<Icon 
  name="image-post" 
  size={32}
  className="hover:opacity-75 transition-opacity" 
/>`}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default IconShowcase;
