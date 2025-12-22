export interface TemplateElement {
  id: string;
  type: 'text' | 'logo' | 'shape';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  zIndex: number;
}

export interface TextElement extends TemplateElement {
  type: 'text';
  content: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  fontWeight: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  textAlign: 'left' | 'center' | 'right';
  backgroundColor?: string;
  textOpacity?: number;
  backgroundOpacity?: number;
  padding?: number;
  borderRadius?: number;
  maxWidth?: number;
}

export interface LogoElement extends TemplateElement {
  type: 'logo';
  src: string;
  opacity?: number;
  borderRadius?: number;
}

export interface ShapeElement extends TemplateElement {
  type: 'shape';
  shape: 'rectangle' | 'circle' | 'line';
  color: string;
  opacity?: number;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: 'social' | 'youtube' | 'business' | 'custom' | 'blank';
  platforms: string[];
  dimensions: {
    width: number;
    height: number;
  };
  elements: (TextElement | LogoElement | ShapeElement)[];
  thumbnail: string;
  isPremium?: boolean;
}

export interface TemplateConfig {
  canvas: {
    width: number;
    height: number;
    backgroundColor: string;
  };
  elements: (TextElement | LogoElement | ShapeElement)[];
}

export type TemplateCategory = 'all' | 'social' | 'youtube' | 'business' | 'custom' | 'blank';

export interface TemplateEditorState {
  selectedTemplate: Template | null;
  selectedElement: string | null;
  elements: (TextElement | LogoElement | ShapeElement)[];
  canvasSize: { width: number; height: number };
  backgroundImage: string | null;
  zoom: number;
  isDragging: boolean;
  isResizing: boolean;
}
