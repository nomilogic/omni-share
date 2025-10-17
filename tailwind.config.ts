import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom `purple` palette centered on #6366F1 (used as 500)
        purple: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366F1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        blue: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366F1',
          600: '#6366F0',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        // Brand colors for different themes
        brand: {
          'ai-revolution': {
            primary: '#3B82F6',    // blue-500
            secondary: '#8B5CF6',  // violet-500
            accent: '#6366F1',     // indigo-500
          },
          'content-creation': {
            primary: '#10B981',    // emerald-500
            secondary: '#0D9488',  // teal-600
            accent: '#0891B2',     // cyan-600
          },
          'multi-platform': {
            primary: '#F97316',    // orange-500
            secondary: '#EF4444',  // red-500
            accent: '#EC4899',     // pink-500
          },
          'smart-scheduling': {
            primary: '#8B5CF6',    // violet-500
            secondary: '#A855F7',  // purple-500
            accent: '#C026D3',     // fuchsia-600
          },
          'analytics': {
            primary: '#F59E0B',    // amber-500
            secondary: '#EA580C',  // orange-600
            accent: '#DC2626',     // red-600
          },
          'enterprise': {
            primary: '#4F46E5',    // indigo-600
            secondary: '#2563EB',  // blue-600
            accent: '#7C3AED',     // violet-600
          },
        },
        // Semantic color system
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',   // Default primary
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Theme-aware colors using CSS variables
        theme: {
          primary: 'var(--theme-primary)',
          secondary: 'var(--theme-secondary)',
          accent: 'var(--theme-accent)',
          background: {
            primary: 'var(--theme-bg-primary)',
            secondary: 'var(--theme-bg-secondary)',
            card: 'var(--theme-bg-card)',
          },
          text: {
            primary: 'var(--theme-text-primary)',
            secondary: 'var(--theme-text-secondary)',
            light: 'var(--theme-text-light)',
          },
          border: 'var(--theme-border)',
          button: {
            primary: 'var(--theme-button-primary)',
            secondary: 'var(--theme-button-secondary)',
            hover: 'var(--theme-button-hover)',
          },
        },
      },
      lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
    // numeric values also work e.g. '3': '.75rem'
  },
      backgroundImage: {
        // Gradient definitions for each theme
        'gradient-ai-revolution': 'linear-gradient(135deg, #3B82F6, #8B5CF6, #6366F1)',
        'gradient-content-creation': 'linear-gradient(135deg, #10B981, #0D9488, #0891B2)',
        'gradient-multi-platform': 'linear-gradient(135deg, #F97316, #EF4444, #EC4899)',
        'gradient-smart-scheduling': 'linear-gradient(135deg, #8B5CF6, #A855F7, #C026D3)',
        'gradient-analytics': 'linear-gradient(135deg, #F59E0B, #EA580C, #DC2626)',
        'gradient-enterprise': 'linear-gradient(135deg, #4F46E5, #2563EB, #7C3AED)',
        // Theme-aware gradient
        'gradient-theme': 'linear-gradient(135deg, var(--theme-primary), var(--theme-secondary), var(--theme-accent))',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      backdropBlur: {
        xs: '2px',
      },

    },
  },
  plugins: [],
} satisfies Config;

