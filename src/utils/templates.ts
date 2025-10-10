import { Template, TextElement, LogoElement, ShapeElement } from '../types/templates';

export const templates: Template[] = [
  // Instagram Templates
  {
    id: 'instagram-header-footer',
    name: 'Header & Footer',
    description: 'Clean header and footer design for Instagram posts',
    category: 'social',
    platforms: ['instagram'],
    dimensions: { width: 1080, height: 1080 },
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxNSIgZmlsbD0iIzMzNzNkYyIvPjxyZWN0IHk9Ijg1IiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjE1IiBmaWxsPSIjMzM3M2RjIi8+PC9zdmc+',
    elements: [
      {
        id: 'header',
        type: 'text',
        content: 'YOUR TITLE HERE',
        x: 540,
        y: 80,
        width: 900,
        height: 60,
        fontSize: 48,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 'bold',
        color: '#ffffff',
        textAlign: 'center',
        backgroundColor: '#3373dc',
        padding: 20,
        borderRadius: 12,
        zIndex: 2
      } as TextElement,
      {
        id: 'footer',
        type: 'text',
        content: '@yourbrand',
        x: 540,
        y: 1000,
        width: 400,
        height: 40,
        fontSize: 24,
        fontFamily: 'Inter, sans-serif',
        fontWeight: '600',
        color: '#6b7280',
        textAlign: 'center',
        zIndex: 2
      } as TextElement,
      {
        id: 'logo-placeholder',
        type: 'logo',
        src: '',
        x: 90,
        y: 90,
        width: 100,
        height: 100,
        opacity: 0.9,
        borderRadius: 50,
        zIndex: 3
      } as LogoElement
    ]
  },

  // YouTube Thumbnail Templates
  {
    id: 'youtube-thumbnail-bold',
    name: 'Bold YouTube Thumbnail',
    description: 'Eye-catching design for YouTube video thumbnails',
    category: 'youtube',
    platforms: ['youtube'],
    dimensions: { width: 1280, height: 720 },
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjU2IiB2aWV3Qm94PSIwIDAgMTAwIDU2IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iNTYiIGZpbGw9IiNmZjAwMDAiLz48dGV4dCB4PSI1MCIgeT0iMzAiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtd2VpZ2h0PSJib2xkIj5ZVCB0aHVtYm5haWw8L3RleHQ+PC9zdmc+',
    elements: [
      {
        id: 'main-title',
        type: 'text',
        content: 'AMAZING VIDEO TITLE',
        x: 640,
        y: 200,
        width: 1000,
        height: 120,
        fontSize: 72,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 'bold',
        color: '#ffffff',
        textAlign: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: 30,
        borderRadius: 15,
        zIndex: 2
      } as TextElement,
      {
        id: 'subtitle',
        type: 'text',
        content: 'Watch now to discover something incredible!',
        x: 640,
        y: 380,
        width: 800,
        height: 60,
        fontSize: 32,
        fontFamily: 'Inter, sans-serif',
        fontWeight: '500',
        color: '#fbbf24',
        textAlign: 'center',
        zIndex: 2
      } as TextElement,
      {
        id: 'channel-logo',
        type: 'logo',
        src: '',
        x: 1100,
        y: 550,
        width: 120,
        height: 120,
        opacity: 0.9,
        borderRadius: 60,
        zIndex: 3
      } as LogoElement,
      {
        id: 'accent-shape',
        type: 'shape',
        shape: 'rectangle',
        x: 0,
        y: 0,
        width: 20,
        height: 720,
        color: '#ff0000',
        zIndex: 1
      } as ShapeElement
    ]
  },

  // LinkedIn Template
  {
    id: 'linkedin-professional',
    name: 'Professional Post',
    description: 'Clean and professional design for LinkedIn posts',
    category: 'social',
    platforms: ['linkedin'],
    dimensions: { width: 1200, height: 627 },
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjUyIiB2aWV3Qm94PSIwIDAgMTAwIDUyIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iNTIiIGZpbGw9IiMwZjc2Yjc3Ii8+PHRleHQgeD0iNTAiIHk9IjMwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmb250LXdlaWdodD0iYm9sZCI+TGlua2VkSW48L3RleHQ+PC9zdmc+',
    elements: [
      {
        id: 'background-overlay',
        type: 'shape',
        shape: 'rectangle',
        x: 0,
        y: 0,
        width: 1200,
        height: 627,
        color: 'rgba(15, 118, 119, 0.1)',
        zIndex: 0
      } as ShapeElement,
      {
        id: 'main-heading',
        type: 'text',
        content: 'Professional Insight',
        x: 600,
        y: 200,
        width: 1000,
        height: 80,
        fontSize: 56,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 'bold',
        color: '#1f2937',
        textAlign: 'center',
        zIndex: 2
      } as TextElement,
      {
        id: 'description',
        type: 'text',
        content: 'Share your expertise with your professional network',
        x: 600,
        y: 320,
        width: 900,
        height: 50,
        fontSize: 28,
        fontFamily: 'Inter, sans-serif',
        fontWeight: '400',
        color: '#6b7280',
        textAlign: 'center',
        zIndex: 2
      } as TextElement,
      {
        id: 'company-logo',
        type: 'logo',
        src: '',
        x: 100,
        y: 470,
        width: 80,
        height: 80,
        opacity: 0.8,
        zIndex: 3
      } as LogoElement
    ]
  },

  // Twitter/X Template
  {
    id: 'twitter-announcement',
    name: 'Announcement Card',
    description: 'Perfect for Twitter announcements and news',
    category: 'social',
    platforms: ['twitter'],
    dimensions: { width: 1200, height: 675 },
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjU2IiB2aWV3Qm94PSIwIDAgMTAwIDU2IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iNTYiIGZpbGw9IiMxZGE1ZjIiLz48dGV4dCB4PSI1MCIgeT0iMzAiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZvbnQtd2VpZ2h0PSJib2xkIj5Ud2l0dGVyPC90ZXh0Pjwvc3ZnPg==',
    elements: [
      {
        id: 'announcement-title',
        type: 'text',
        content: 'BIG ANNOUNCEMENT',
        x: 600,
        y: 180,
        width: 1000,
        height: 100,
        fontSize: 64,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 'bold',
        color: '#1da1f2',
        textAlign: 'center',
        zIndex: 2
      } as TextElement,
      {
        id: 'announcement-details',
        type: 'text',
        content: 'Something exciting is coming your way!',
        x: 600,
        y: 350,
        width: 900,
        height: 70,
        fontSize: 36,
        fontFamily: 'Inter, sans-serif',
        fontWeight: '500',
        color: '#374151',
        textAlign: 'center',
        zIndex: 2
      } as TextElement,
      {
        id: 'brand-handle',
        type: 'text',
        content: '@yourbrand',
        x: 600,
        y: 500,
        width: 300,
        height: 40,
        fontSize: 24,
        fontFamily: 'Inter, sans-serif',
        fontWeight: '600',
        color: '#6b7280',
        textAlign: 'center',
        zIndex: 2
      } as TextElement
    ]
  },

  // Facebook Template
  {
    id: 'facebook-event',
    name: 'Event Promotion',
    description: 'Great for promoting events and announcements on Facebook',
    category: 'social',
    platforms: ['facebook'],
    dimensions: { width: 1200, height: 630 },
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjUyIiB2aWV3Qm94PSIwIDAgMTAwIDUyIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iNTIiIGZpbGw9IiMzYjVmOTkiLz48dGV4dCB4PSI1MCIgeT0iMzAiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZvbnQtd2VpZ2h0PSJib2xkIj5GYWNlYm9vazwvdGV4dD48L3N2Zz4=',
    elements: [
      {
        id: 'event-title',
        type: 'text',
        content: 'JOIN OUR EVENT',
        x: 600,
        y: 160,
        width: 1000,
        height: 80,
        fontSize: 52,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 'bold',
        color: '#3b5998',
        textAlign: 'center',
        zIndex: 2
      } as TextElement,
      {
        id: 'event-date',
        type: 'text',
        content: 'December 25, 2024',
        x: 600,
        y: 280,
        width: 600,
        height: 50,
        fontSize: 32,
        fontFamily: 'Inter, sans-serif',
        fontWeight: '600',
        color: '#1f2937',
        textAlign: 'center',
        backgroundColor: '#fbbf24',
        padding: 15,
        borderRadius: 25,
        zIndex: 2
      } as TextElement,
      {
        id: 'event-description',
        type: 'text',
        content: 'Don\'t miss this amazing opportunity to connect and learn!',
        x: 600,
        y: 400,
        width: 900,
        height: 60,
        fontSize: 28,
        fontFamily: 'Inter, sans-serif',
        fontWeight: '400',
        color: '#4b5563',
        textAlign: 'center',
        zIndex: 2
      } as TextElement
    ]
  },

  // Business Template
  {
    id: 'business-minimal',
    name: 'Minimal Business',
    description: 'Clean and minimal design for business communications',
    category: 'business',
    platforms: ['linkedin', 'facebook', 'twitter'],
    dimensions: { width: 1200, height: 800 },
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjY3IiB2aWV3Qm94PSIwIDAgMTAwIDY3IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iNjciIGZpbGw9IiNmOWZhZmIiIHN0cm9rZT0iI2U1ZTdlYiIvPjx0ZXh0IHg9IjUwIiB5PSIzOCIgZmlsbD0iIzM3NDE1MSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEwIj5CdXNpbmVzczwvdGV4dD48L3N2Zz4=',
    elements: [
      {
        id: 'business-title',
        type: 'text',
        content: 'Business Update',
        x: 600,
        y: 250,
        width: 900,
        height: 80,
        fontSize: 48,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 'bold',
        color: '#1f2937',
        textAlign: 'center',
        zIndex: 2
      } as TextElement,
      {
        id: 'business-subtitle',
        type: 'text',
        content: 'Professional insights and company news',
        x: 600,
        y: 370,
        width: 800,
        height: 50,
        fontSize: 24,
        fontFamily: 'Inter, sans-serif',
        fontWeight: '400',
        color: '#6b7280',
        textAlign: 'center',
        zIndex: 2
      } as TextElement,
      {
        id: 'business-logo',
        type: 'logo',
        src: '',
        x: 600,
        y: 500,
        width: 120,
        height: 120,
        opacity: 0.9,
        zIndex: 3
      } as LogoElement,
      {
        id: 'accent-line',
        type: 'shape',
        shape: 'rectangle',
        x: 300,
        y: 200,
        width: 600,
        height: 4,
        color: '#3b82f6',
        zIndex: 1
      } as ShapeElement
    ]
  },

  // Blank Template
  {
    id: 'blank-template',
    name: 'Blank Canvas',
    description: 'Start with a clean slate - add your own elements',
    category: 'blank',
    platforms: ['instagram', 'facebook', 'twitter', 'linkedin', 'youtube'],
    dimensions: { width: 1080, height: 1080 },
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNmOWZhZmIiIHN0cm9rZT0iI2U1ZTdlYiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtZGFzaGFycmF5PSI1IDUiLz48dGV4dCB4PSI1MCIgeT0iNTUiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiI+QmxhbmsgQ2FudmFzPC90ZXh0Pjwvc3ZnPg==',
    elements: [
      // Start with minimal elements - just a sample text that can be edited
     
    ]
  }
];

export const PREDEFINED_TEMPLATES = templates;

export const getTemplatesByCategory = (category: string): Template[] => {
  if (category === 'all') return templates;
  return templates.filter(template => template.category === category);
};

export const getTemplatesByPlatform = (platform: string): Template[] => {
  return templates.filter(template => 
    template.platforms.includes(platform.toLowerCase())
  );
};

export const getTemplateById = (id: string): Template | undefined => {
  return templates.find(template => template.id === id);
};
