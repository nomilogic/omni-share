import React from 'react';

// Import SVG assets
import TextPostIcon from '../assets/create-text-post-icon-01.svg';
import ImagePostIcon from '../assets/create-image-post-icon-01.svg';
import VideoPostIcon from '../assets/create-video-post-icon-01.svg';
import UploadIcon from '../assets/click-to-browse-icon-01.svg';
import ConnectAccountsIcon from '../assets/connect-your-accounts-icon-01.svg';
import EditPostIcon from '../assets/edit-post-text-icon-01.svg';
import PlayIcon from '../assets/play-icon-01.svg';
import LogoIcon from '../assets/logo-icon-01.svg';
import WalletIcon from '../assets/wallet-icon-01.svg'; // Example external URL
import TextToImageIcon from '../assets/text-to-image-icon-01.svg'; // Placeholder, replace with actual icon

// Define the available icon names
export type IconName = 
  | 'text-post'
  | 'image-post' 
  | 'video-post'
  | 'upload' // Alias for 'click-to-browse'
  | 'connect-accounts'
  | 'edit-post'
  | 'play'
  | 'logo'
  | 'wallet'
  | 'text-to-image'; // New icon name

// Map icon names to their respective SVG imports
const iconMap: Record<IconName, string> = {
  'text-post': TextPostIcon,
  'image-post': ImagePostIcon,
  'video-post': VideoPostIcon,
  'upload': UploadIcon,
  'connect-accounts': ConnectAccountsIcon,
  'edit-post': EditPostIcon,
  'play': PlayIcon,
  'logo': LogoIcon,
  'wallet': WalletIcon,
  'text-to-image': TextToImageIcon, // Placeholder, replace with actual icon
};

interface IconProps {
  name: IconName;
  size?: number | string;
  className?: string;
  color?: string;
  onClick?: () => void;
}

const Icon: React.FC<IconProps> = ({ 
  name, 
  size = 24, 
  className = '', 
  color,
  onClick 
}) => {
  const iconSrc = iconMap[name];
  
  if (!iconSrc) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  const sizeStyle = typeof size === 'number' ? `${size}px` : size;
  
  return (
    <img
      src={iconSrc}
      alt={`${name} icon`}
      className={`inline-block ${className}`}
      style={{
        width: sizeStyle,
        height: sizeStyle,
        filter: color ? `hue-rotate(${getHueRotation(color)}deg)` : undefined,
        cursor: onClick ? 'pointer' : undefined,
      }}
      onClick={onClick}
    />
  );
};

// Helper function to convert color to hue rotation
// This is a simple implementation - you might want to enhance it based on your needs
const getHueRotation = (color: string): number => {
  const colorMap: Record<string, number> = {
    purple: 0,    // Original color
    blue: -60,
    green: -120,
    red: 120,
    orange: 180,
    yellow: 240,
  };
  
  return colorMap[color.toLowerCase()] || 0;
};

export default Icon;
