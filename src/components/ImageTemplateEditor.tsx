import { useResize } from "../context/ResizeContext";
import { useModal } from '../context2/ModalContext';
import DiscardImageModal from '../components/modals/DiscardImageModal';
import React, { useState, useRef, useEffect, useCallback } from "react";
import Konva from "konva";
import {
  Stage,
  Layer,
  Rect,
  Text as KonvaText,
  Image as KonvaImage,
  Group,
  Transformer,
  Ellipse,
} from "react-konva";
import {
  Template,
  TemplateElement,
  TextElement,
  LogoElement,
  ShapeElement,
} from "../types/templates";
import {
  Palette,
  Type,
  Upload,
  Square,
  Download,
  Undo,
  Redo,
  Loader,
  ArrowUp,
  ArrowDown,
  ChevronUp,
  ChevronDown,
  Trash,
  Lock,
  Unlock,
  Circle,
  Plus,
  Monitor,
  Smartphone,
  Youtube,
  Instagram,
  Twitter,
} from "lucide-react";
import { uploadMedia, getCurrentUser } from "../lib/database";
import { templateService } from "../services/templateService";
import "../styles/drag-prevention.css";
import "../styles/template-editor.css";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface ImageTemplateEditorProps {
  imageUrl: string;
  selectedTemplate?: Template;
  onSave: (imageUrl: string) => void;
  onCancel: () => void;
  isVideoThumbnail?: boolean;
  aspectRatio?: string; // Aspect ratio from ContentInput (e.g., '1:1', '16:9', '9:16')
}

export const ImageTemplateEditor: React.FC<ImageTemplateEditorProps> = ({
  imageUrl,
  selectedTemplate,
  onSave,
  onCancel,
  isVideoThumbnail = false,
  aspectRatio = "16:9",
}) => {
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const selectedNodeRef = useRef<Konva.Node | null>(null);

  const { handleResizeMainToFullScreen } = useResize();
  const { t, i18n } = useTranslation();
  const changeLanguage = (lang: any) => i18n.changeLanguage(lang);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [elements, setElements] = useState<TemplateElement[]>(
    selectedTemplate?.elements
      ? selectedTemplate.elements.map((el, index) => ({
          ...el,
          zIndex: el.zIndex !== undefined ? el.zIndex : index,
        }))
      : []
  );
  const { openModal } = useModal();
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [backgroundImage, setBackgroundImage] =
    useState<HTMLImageElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lockedElements, setLockedElements] = useState<Set<string>>(new Set());
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoImages, setLogoImages] = useState<{
    [key: string]: HTMLImageElement;
  }>({});
  const [isResizing, setIsResizing] = useState(false);
  const [backgroundImageLoading, setBackgroundImageLoading] = useState(false);
  const [logoImageLoadingIds, setLogoImageLoadingIds] = useState<Set<string>>(
    new Set()
  );
  const [resizeHandle, setResizeHandle] = useState<string | null>(null); // 'nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'
  const [resizeStart, setResizeStart] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [canvasDimensions, setCanvasDimensions] = useState<{
    width: number;
    height: number;
  }>({ width: 800, height: 800 });
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [maxZoom, setMaxZoom] = useState<number>(1);

  const TEMPLATES_STORAGE_KEY = "image-template-editor.templates.v1";
  const LEGACY_TEMPLATE_STORAGE_KEY = "image-template-editor.template.v1";

  type SavedTemplateV1 = {
    version: 1;
    id: string;
    name: string;
    savedAt: string;
    aspectRatio: string;
    canvasDimensions: { width: number; height: number };
    elements: TemplateElement[];
    lockedElementIds: string[];
    thumbnailDataUrl?: string;
    source?: "local" | "user" | "global";
  };

  type SavedTemplateListV1 = {
    version: 1;
    templates: SavedTemplateV1[];
  };

  const [templateName, setTemplateName] = useState<string>("");
  const [saveAsGlobal, setSaveAsGlobal] = useState<boolean>(false);
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplateV1[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [templatesOpen, setTemplatesOpen] = useState<boolean>(true);
  const [elementsOpen, setElementsOpen] = useState<boolean>(true);
  const [propertiesOpen, setPropertiesOpen] = useState<boolean>(true);

  const generateTemplateId = () => {
    const uuid = (globalThis as any)?.crypto?.randomUUID?.();
    if (uuid) return uuid as string;
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  };

  const readTemplatesFromLocalStorage = (): SavedTemplateV1[] => {
    try {
      const raw = localStorage.getItem(TEMPLATES_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as Partial<SavedTemplateListV1>;
      if (!parsed || !Array.isArray(parsed.templates)) return [];
      return parsed.templates as SavedTemplateV1[];
    } catch (error) {
      console.error("❌ Failed to read templates from localStorage", error);
      return [];
    }
  };

  const writeTemplatesToLocalStorage = (templates: SavedTemplateV1[]) => {
    const payload: SavedTemplateListV1 = {
      version: 1,
      templates,
    };
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(payload));
  };

  const parseTemplateJson = (value: unknown): any => {
    if (value === null || value === undefined) return undefined;
    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch {
        return undefined;
      }
    }
    return value;
  };

  const normalizeSavedTemplate = (
    raw: any,
    opts: { fallbackName?: string; fallbackId?: string; source: SavedTemplateV1["source"] }
  ): SavedTemplateV1 | null => {
    try {
      const parsed = parseTemplateJson(raw?.json ?? raw);

      // If parsed is already our structure
      const base =
        parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};

      // If parsed is an array, treat as elements
      const elementsFromParsed = Array.isArray(parsed) ? parsed : base.elements;

      const id =
        (raw?.id as string) ||
        (base.id as string) ||
        opts.fallbackId ||
        generateTemplateId();

      const name =
        (raw?.name as string) ||
        (base.name as string) ||
        opts.fallbackName ||
        "Untitled Template";

      const savedAt =
        (raw?.created_at as string) ||
        (raw?.createdAt as string) ||
        (base.savedAt as string) ||
        new Date().toISOString();

      return {
        version: 1,
        id,
        name,
        savedAt,
        aspectRatio: (base.aspectRatio as string) || aspectRatio,
        canvasDimensions: (base.canvasDimensions as any) || canvasDimensions,
        elements: Array.isArray(elementsFromParsed) ? (elementsFromParsed as any) : [],
        lockedElementIds: Array.isArray(base.lockedElementIds)
          ? (base.lockedElementIds as any)
          : [],
        thumbnailDataUrl: base.thumbnailDataUrl as any,
        source: opts.source,
      };
    } catch (error) {
      console.error("❌ Failed to normalize template", error);
      return null;
    }
  };

  const refreshSavedTemplates = async () => {
    // 1) Local templates (fallback/offline)
    const localTemplates: SavedTemplateV1[] = readTemplatesFromLocalStorage().map(
      (t) => ({
        ...t,
        source: "local",
      })
    );

    // One-time legacy migration (from single-template key) if local list is empty
    if (localTemplates.length === 0) {
      try {
        const legacyRaw = localStorage.getItem(LEGACY_TEMPLATE_STORAGE_KEY);
        if (legacyRaw) {
          const legacyParsed = JSON.parse(legacyRaw) as any;
          if (legacyParsed && Array.isArray(legacyParsed.elements)) {
            const migrated: SavedTemplateV1 = {
              version: 1,
              id: generateTemplateId(),
              name: "Legacy Template",
              savedAt: legacyParsed.savedAt || new Date().toISOString(),
              aspectRatio: legacyParsed.aspectRatio || aspectRatio,
              canvasDimensions: legacyParsed.canvasDimensions || canvasDimensions,
              elements: legacyParsed.elements,
              lockedElementIds: legacyParsed.lockedElementIds || [],
              thumbnailDataUrl: legacyParsed.thumbnailDataUrl,
              source: "local",
            };
            const migratedList = [migrated];
            writeTemplatesToLocalStorage(migratedList);
            localTemplates.push(...migratedList);
          }
        }
      } catch (e) {
        // ignore legacy parse errors
      }
    }

    // 2) Remote templates
    let remoteUser: SavedTemplateV1[] = [];
    let remoteGlobal: SavedTemplateV1[] = [];

    try {
      const [userRaw, globalRaw] = await Promise.all([
        templateService.getTemplates(),
        templateService.getGlobalTemplates(),
      ]);

      remoteUser = userRaw
        .map((item: any) =>
          normalizeSavedTemplate(item, {
            fallbackName: (item?.name as string) || "My Template",
            fallbackId: item?.id as string,
            source: "user",
          })
        )
        .filter(Boolean) as SavedTemplateV1[];

      remoteGlobal = globalRaw
        .map((item: any) =>
          normalizeSavedTemplate(item, {
            fallbackName: (item?.name as string) || "Global Template",
            fallbackId: item?.id as string,
            source: "global",
          })
        )
        .filter(Boolean) as SavedTemplateV1[];
    } catch (error) {
      console.warn("⚠️ Failed to fetch templates from server, using local only", error);
    }

    const merged = [...remoteUser, ...remoteGlobal, ...localTemplates];

    setSavedTemplates(merged);
    setSelectedTemplateId((prev) => {
      if (merged.length === 0) return "";
      if (prev && merged.some((t) => t.id === prev)) return prev;
      return merged[0].id;
    });
  };

  useEffect(() => {
    refreshSavedTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createTemplateThumbnailDataUrl = () => {
    try {
      const stage = stageRef.current;
      if (!stage || !canvasDimensions?.width || !canvasDimensions?.height) {
        return undefined;
      }

      const THUMBNAIL_WIDTH = 320;
      const pixelRatio = Math.max(0.05, THUMBNAIL_WIDTH / canvasDimensions.width);

      // Hide transformer/selection UI from thumbnail
      const tr = transformerRef.current;
      const wasVisible = tr ? tr.visible() : false;
      tr?.hide();
      tr?.getLayer()?.batchDraw();

      const url = stage.toDataURL({ mimeType: "image/png", pixelRatio });

      if (wasVisible) {
        tr?.show();
        tr?.getLayer()?.batchDraw();
      }

      return url;
    } catch (error) {
      console.error("❌ Failed to generate template thumbnail", error);
      return undefined;
    }
  };

  const saveCurrentTemplate = async () => {
    const name = templateName.trim() || `Template ${new Date().toISOString()}`;

    const templates = readTemplatesFromLocalStorage();
    const existing = templates.find(
      (t) => t.name.toLowerCase() === name.toLowerCase()
    );

    const payload: SavedTemplateV1 = {
      version: 1,
      id: existing?.id || generateTemplateId(),
      name,
      savedAt: new Date().toISOString(),
      aspectRatio,
      canvasDimensions,
      elements,
      lockedElementIds: Array.from(lockedElements),
      thumbnailDataUrl: createTemplateThumbnailDataUrl(),
      source: "local",
    };

    // Try saving to server first
    try {
      await templateService.saveTemplate({
        name,
        json: payload,
        isPublic: saveAsGlobal ? true : undefined,
      });
      console.log("✅ Template saved to server", name);
      await refreshSavedTemplates();
      return;
    } catch (error) {
      console.warn("⚠️ Failed to save template to server, saving locally", error);
    }

    // Fallback: save locally
    try {
      const next = existing
        ? templates.map((t) => (t.id === existing.id ? payload : t))
        : [payload, ...templates];

      writeTemplatesToLocalStorage(next);
      setTemplateName(name);
      setSavedTemplates((prev) => {
        // keep any remote templates already loaded
        const remote = prev.filter((t) => t.source === "user" || t.source === "global");
        return [...remote, ...next.map((t) => ({ ...t, source: "local" as const }))];
      });
      setSelectedTemplateId(payload.id);

      console.log("✅ Template saved to localStorage", payload);
    } catch (error) {
      console.error("❌ Failed to save template to localStorage", error);
    }
  };

  const selectTemplateById = (id: string) => {
    setSelectedTemplateId(id);
    const tpl = savedTemplates.find((t) => t.id === id);
    if (tpl) setTemplateName(tpl.name);
  };

  const loadTemplateById = (id: string) => {
    try {
      const tpl = savedTemplates.find((t) => t.id === id);
      if (!tpl) {
        console.warn("⚠️ Template not found", id);
        return;
      }

      const normalizedElements = tpl.elements.map((el, index) => ({
        ...el,
        zIndex: el.zIndex !== undefined ? el.zIndex : index,
      }));

      setElements(normalizedElements);
      setLockedElements(new Set(tpl.lockedElementIds || []));
      setSelectedElement(null);
      setSelectedTemplateId(tpl.id);
      setTemplateName(tpl.name);

      console.log("✅ Template loaded", tpl);
    } catch (error) {
      console.error("❌ Failed to load template from localStorage", error);
    }
  };

  const deleteTemplateById = (id: string) => {
    try {
      const tpl = savedTemplates.find((t) => t.id === id);
      if (tpl?.source && tpl.source !== "local") {
        console.warn("⚠️ Delete not supported for server templates yet");
        return;
      }

      const templates = readTemplatesFromLocalStorage();
      const next = templates.filter((t) => t.id !== id);
      writeTemplatesToLocalStorage(next);

      setSavedTemplates((prev) => {
        const remote = prev.filter((t) => t.source === "user" || t.source === "global");
        const locals = next.map((t) => ({ ...t, source: "local" as const }));
        return [...remote, ...locals];
      });

      setSelectedTemplateId((prev) => {
        if (prev !== id) return prev;
        const stillSelected = next[0]?.id;
        // if no local remains, keep any remote selected
        if (stillSelected) return stillSelected;
        const firstRemote = savedTemplates.find(
          (t) => t.source === "user" || t.source === "global"
        )?.id;
        return firstRemote || "";
      });

      console.log("🗑️ Template deleted", id);
    } catch (error) {
      console.error("❌ Failed to delete template", error);
    }
  };

  const navigate = useNavigate();

  // Utility function to convert hex color to rgba with opacity
  const hexToRgba = (hex: string, opacity: number = 1): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  // IsDragging useEffect
  useEffect(() => {
    if (isDragging) {
      document.body.style.cursor = "grabbing";
    } else {
      document.body.style.cursor = "auto";
    }
  }, [isDragging]);

  // Calculate canvas dimensions based on aspect ratio
  const calculateCanvasDimensions = (
    aspectRatioString: string
  ): { width: number; height: number } => {
    const aspectRatioMap: { [key: string]: { width: number; height: number } } =
      {
        "1:1": { width: 1024, height: 1024 }, // Square
        "16:9": { width: 1280, height: 720 }, // Landscape
        "9:16": { width: 720, height: 1280 }, // Portrait (vertical)
      };

    return aspectRatioMap[aspectRatioString] || aspectRatioMap["1:1"];
  };

  // Calculate zoom level to fit canvas in container
  const calculateZoomLevel = (imageWidth: number, imageHeight: number) => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Available space for canvas (accounting for tools panel and padding)
    let maxWidth, maxHeight;

    if (viewportWidth < 768) {
      // Mobile
      maxWidth = viewportWidth * 0.9;
      maxHeight = viewportHeight * 0.4;
    } else if (viewportWidth < 1024) {
      // Tablet
      maxWidth = viewportWidth * 0.7;
      maxHeight = viewportHeight * 0.6;
    } else {
      // Desktop (accounting for 320px tools panel)
      maxWidth = (viewportWidth - 320) * 0.8;
      maxHeight = viewportHeight * 0.7;
    }

    // Calculate zoom to fit image in available space
    const zoomX = maxWidth / imageWidth;
    const zoomY = maxHeight / imageHeight;
    const fitZoom = Math.min(zoomX, zoomY);

    // Set reasonable zoom limits
    const minZoom = Math.min(fitZoom, 0.1);
    const maxZoomLevel = Math.max(fitZoom * 2, 2);

    return {
      zoom: Math.max(minZoom, Math.min(fitZoom, 1)), // Start at fit zoom or 100% if smaller
      maxZoom: maxZoomLevel,
    };
  };

  type AnyElement = TextElement | LogoElement | ShapeElement;

  const updateElementById = useCallback(
    (id: string, updates: Partial<AnyElement>) => {
      setElements((prev) =>
        prev.map((el) => (el.id === id ? ({ ...el, ...updates } as any) : el))
      );
    },
    []
  );

  const getCoverCrop = useCallback(
    (img: HTMLImageElement, canvasW: number, canvasH: number) => {
      const canvasAspect = canvasW / canvasH;
      const imageAspect = img.width / img.height;

      let cropX = 0;
      let cropY = 0;
      let cropWidth = img.width;
      let cropHeight = img.height;

      if (imageAspect > canvasAspect) {
        // wider -> crop left/right
        cropHeight = img.height;
        cropWidth = img.height * canvasAspect;
        cropX = (img.width - cropWidth) / 2;
        cropY = 0;
      } else {
        // taller -> crop top/bottom
        cropWidth = img.width;
        cropHeight = img.width / canvasAspect;
        cropX = 0;
        cropY = (img.height - cropHeight) / 2;
      }

      return { cropX, cropY, cropWidth, cropHeight };
    },
    []
  );

  useEffect(() => {
    const tr = transformerRef.current;
    if (!tr) return;

    if (selectedElement && lockedElements.has(selectedElement)) {
      tr.nodes([]);
      tr.getLayer()?.batchDraw();
      return;
    }

    const node = selectedNodeRef.current;
    tr.nodes(node ? [node] : []);
    tr.getLayer()?.batchDraw();
  }, [selectedElement, elements, lockedElements]);

  useEffect(() => {
    const targetDimensions = calculateCanvasDimensions(aspectRatio);
    setCanvasDimensions(targetDimensions);

    const { zoom, maxZoom: maxZoomLevel } = calculateZoomLevel(
      targetDimensions.width,
      targetDimensions.height
    );
    setZoomLevel(zoom);
    setMaxZoom(maxZoomLevel);

    if (!imageUrl) {
      // No background image
      setBackgroundImage(null);
      setBackgroundImageLoading(false);
      setImageDimensions(selectedTemplate?.dimensions || targetDimensions);
      return;
    }

    setBackgroundImageLoading(true);
    const img = new Image();

    // Only set crossOrigin for external URLs, not for blob/data URLs
    if (!imageUrl.startsWith("blob:") && !imageUrl.startsWith("data:")) {
      img.crossOrigin = "anonymous";
    }

    img.onload = () => {
      setImageDimensions({ width: img.width, height: img.height });
      setBackgroundImage(img);
      setBackgroundImageLoading(false);
    };

    img.onerror = () => {
      setBackgroundImage(null);
      setImageDimensions(null);
      setBackgroundImageLoading(false);
    };

    img.src = imageUrl;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [imageUrl, aspectRatio, selectedTemplate]);

  useEffect(() => {
    // Preload logo images for Konva rendering
    const logoSrcs = elements
      .filter((el): el is LogoElement => el.type === "logo")
      .map((el) => (el as LogoElement).src)
      .filter((src) => typeof src === "string" && src.length > 0);

    const uniqueSrcs = Array.from(new Set(logoSrcs));

    uniqueSrcs.forEach((src) => {
      if (logoImages[src]) return;

      const img = new Image();
      if (!src.startsWith("blob:") && !src.startsWith("data:")) {
        img.crossOrigin = "anonymous";
      }

      img.onload = () => {
        setLogoImages((prev) => (prev[src] ? prev : { ...prev, [src]: img }));
      };

      img.src = src;
    });
  }, [elements, logoImages]);

  useEffect(() => {
    if (ctx && !isLoading) {
      if (backgroundImage) {
        redrawCanvas(ctx, backgroundImage, elements);
      } else {
        // Draw without background image
        redrawCanvasWithoutBackground(ctx, elements);
      }
    }
  }, [elements, ctx, backgroundImage, isLoading]);

  const handleDiscardClick = useCallback(() => {
    // openModal ko call karein.
    // onConfirmAction mein wahi function pass karein jo Confirm button par chalana hai (jo yahan onCancel hai)
    openModal(DiscardImageModal, {
      t: t,
      onConfirmAction: onCancel, // 👈 onCancel function ko seedha pass kar diya
    });
    // Ab pendingDiscardAction state ki zaroorat nahi.
  }, [t, onCancel]);

  const redrawCanvas = (
    context: CanvasRenderingContext2D,
    bgImage: HTMLImageElement,
    currentElements: TemplateElement[],
    showSelection: boolean = true
  ) => {
    if (!canvas) return;

    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background image using "cover" behavior (crop from all sides to fill canvas)
    // Calculate scaling factor to cover the entire canvas
    const canvasAspect = canvas.width / canvas.height;
    const imageAspect = bgImage.width / bgImage.height;

    let drawWidth, drawHeight, sourceX, sourceY, sourceWidth, sourceHeight;

    if (imageAspect > canvasAspect) {
      // Image is wider than canvas - crop left/right edges
      drawWidth = canvas.width;
      drawHeight = canvas.height;
      sourceHeight = bgImage.height;
      sourceWidth = bgImage.height * canvasAspect; // Maintain canvas aspect ratio
      sourceX = (bgImage.width - sourceWidth) / 2; // Center horizontally
      sourceY = 0;
    } else {
      // Image is taller than canvas - crop top/bottom edges
      drawWidth = canvas.width;
      drawHeight = canvas.height;
      sourceWidth = bgImage.width;
      sourceHeight = bgImage.width / canvasAspect; // Maintain canvas aspect ratio
      sourceX = 0;
      sourceY = (bgImage.height - sourceHeight) / 2; // Center vertically
    }

    // Draw the cropped portion of the image to fill the entire canvas
    context.drawImage(
      bgImage,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight, // Source rectangle (from image)
      0,
      0,
      drawWidth,
      drawHeight // Destination rectangle (on canvas)
    );

    // Draw elements sorted by zIndex
    const sortedElements = [...currentElements].sort(
      (a, b) => (a.zIndex || 0) - (b.zIndex || 0)
    );

    sortedElements.forEach((element) => {
      drawElement(context, element, showSelection);
    });
  };

  const redrawCanvasWithoutBackground = (
    context: CanvasRenderingContext2D,
    currentElements: TemplateElement[],
    showSelection: boolean = true
  ) => {
    if (!canvas) return;

    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw a light gray background as fallback
    context.fillStyle = "#f3f4f600";
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Draw "Image Loading Failed" text
    // context.fillStyle = '#6b7280';
    // context.font = '24px Arial';
    // context.textAlign = 'center';
    // context.textBaseline = 'middle';
    // context.fillText('Image Loading Failed', canvas.width / 2, canvas.height / 2 - 50);
    // context.font = '16px Arial';
    // context.fillText('Template elements still available below', canvas.width / 2, canvas.height / 2 - 20);

    // // Draw elements sorted by zIndex
    // const sortedElements = [...currentElements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

    // sortedElements.forEach(element => {
    //   drawElement(context, element, showSelection);
    // });
  };

  const drawElement = (
    context: CanvasRenderingContext2D,
    element: TemplateElement,
    showSelection: boolean = true
  ) => {
    context.save();

    // Apply rotation if specified
    if (element.rotation && element.rotation !== 0) {
      context.translate(element.x, element.y);
      context.rotate((element.rotation * Math.PI) / 180);
      context.translate(-element.x, -element.y);
    }

    switch (element.type) {
      case "text":
        drawTextElement(context, element as TextElement);
        break;
      case "logo":
        drawLogoElement(context, element as LogoElement);
        break;
      case "shape":
        drawShapeElement(context, element as ShapeElement);
        break;
    }

    context.restore();

    // Draw selection border if selected (after restore to avoid rotation) - only if showSelection is true
    if (showSelection && selectedElement === element.id) {
      context.save();

      // Apply same rotation for selection border
      if (element.rotation && element.rotation !== 0) {
        context.translate(element.x, element.y);
        context.rotate((element.rotation * Math.PI) / 180);
        context.translate(-element.x, -element.y);
      }

      context.strokeStyle = "#3b82f6";
      context.lineWidth = 2;
      context.setLineDash([5, 5]);
      context.strokeRect(
        element.x - element.width / 2,
        element.y - element.height / 2,
        element.width,
        element.height
      );
      context.setLineDash([]);

      context.restore();
    }
  };

  const drawTextElement = (
    context: CanvasRenderingContext2D,
    element: TextElement
  ) => {
    if (!element.content) return;

    context.font = `${element.fontWeight || "normal"} ${
      element.fontSize || 16
    }px ${element.fontFamily || "Arial"}`;
    context.textAlign = (element.textAlign as CanvasTextAlign) || "left";
    context.textBaseline = "middle";

    // Draw background if specified
    if (element.backgroundColor) {
      const backgroundOpacity = element.backgroundOpacity || 1;
      context.fillStyle = hexToRgba(element.backgroundColor, backgroundOpacity);
      const padding = element.padding || 0;
      const borderRadius = element.borderRadius || 0;

      if (borderRadius > 0) {
        drawRoundedRect(
          context,
          element.x - element.width / 2 - padding,
          element.y - element.height / 2 - padding,
          element.width + padding * 2,
          element.height + padding * 2,
          borderRadius
        );
      } else {
        context.fillRect(
          element.x - element.width / 2 - padding,
          element.y - element.height / 2 - padding,
          element.width + padding * 2,
          element.height + padding * 2
        );
      }
    }

    // Set text color with opacity
    const textOpacity = element.textOpacity || 1;
    context.fillStyle = hexToRgba(element.color || "#000000", textOpacity);

    // Draw text
    const lines = element.content.split("\n");
    const lineHeight = (element.fontSize || 16) * 1.2;
    const startY = element.y - ((lines.length - 1) * lineHeight) / 2;

    lines.forEach((line, index) => {
      context.fillText(line, element.x, startY + index * lineHeight);
    });
  };

  const drawLogoElement = (
    context: CanvasRenderingContext2D,
    element: LogoElement
  ) => {
    console.log("🇺 Logo Element Debug:", {
      id: element.id,
      src: element.src,
      position: { x: element.x, y: element.y },
      dimensions: { width: element.width, height: element.height },
      opacity: element.opacity,
      hasImageInCache: element.src ? !!logoImages[element.src] : false,
      logoImagesKeys: Object.keys(logoImages),
    });

    // Apply element opacity to context
    context.save();
    context.globalAlpha = element.opacity || 1;

    if (!element.src) {
      console.log("💷 Drawing placeholder for logo element (no src)");
      // Draw a more visible placeholder background
      context.fillStyle = "rgba(209, 213, 219, 0.3)"; // Light gray background
      context.fillRect(
        element.x - element.width / 2,
        element.y - element.height / 2,
        element.width,
        element.height
      );

      // Draw placeholder border
      context.strokeStyle = "#9ca3af";
      context.lineWidth = 2;
      context.setLineDash([8, 4]);

      if (element.borderRadius && element.borderRadius > 0) {
        drawRoundedRect(
          context,
          element.x - element.width / 2,
          element.y - element.height / 2,
          element.width,
          element.height,
          element.borderRadius
        );
        context.stroke();
      } else {
        context.strokeRect(
          element.x - element.width / 2,
          element.y - element.height / 2,
          element.width,
          element.height
        );
      }

      context.setLineDash([]);

      // Draw "Logo" text more visibly
      context.fillStyle = "#6b7280";
      context.font = "bold 16px Arial";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText("Image", element.x, element.y);

      // Draw upload hint
      context.fillStyle = "#9ca3af";
      context.font = "12px Arial";
      // context.fillText("Click to upload", element.x, element.y + 20);
    } else {
      // Draw logo image
      const logoImg = logoImages[element.src];
      if (logoImg) {
        console.log("✅ Drawing actual logo image from cache");

        // Create clipping path for border radius if specified
        if (element.borderRadius && element.borderRadius > 0) {
          context.beginPath();
          const x = element.x - element.width / 2;
          const y = element.y - element.height / 2;
          const radius = element.borderRadius;

          context.moveTo(x + radius, y);
          context.lineTo(x + element.width - radius, y);
          context.quadraticCurveTo(
            x + element.width,
            y,
            x + element.width,
            y + radius
          );
          context.lineTo(x + element.width, y + element.height - radius);
          context.quadraticCurveTo(
            x + element.width,
            y + element.height,
            x + element.width - radius,
            y + element.height
          );
          context.lineTo(x + radius, y + element.height);
          context.quadraticCurveTo(
            x,
            y + element.height,
            x,
            y + element.height - radius
          );
          context.lineTo(x, y + radius);
          context.quadraticCurveTo(x, y, x + radius, y);
          context.closePath();
          context.clip();
        }

        // Draw the image
        context.drawImage(
          logoImg,
          element.x - element.width / 2,
          element.y - element.height / 2,
          element.width,
          element.height
        );
      } else {
        console.log(
          "🔄 Logo image not in cache, attempting to load:",
          element.src
        );

        // Check if we're already trying to load this image
        if (!logoImages[`loading-${element.src}`]) {
          // Mark as loading to prevent multiple load attempts
          setLogoImages((prev) => ({
            ...prev,
            [`loading-${element.src}`]: new Image(), // Placeholder to mark as loading
          }));

          // Image is loading or failed to load, try to load it
          const img = new Image();
          img.onload = () => {
            console.log(
              "✅ Logo image loaded successfully, adding to cache:",
              element.src
            );
            setLogoImages((prev) => {
              const newLogoImages = { ...prev };
              // Remove loading marker and add actual image
              delete newLogoImages[`loading-${element.src}`];
              newLogoImages[element.src!] = img;
              console.log(
                "📊 Updated logoImages cache:",
                Object.keys(newLogoImages)
              );
              return newLogoImages;
            });

            // Trigger a redraw without interfering with current state
            // Use a timeout to avoid interfering with any ongoing drag operations
            setTimeout(() => {
              console.log("🎨 Triggering canvas redraw after logo load");
              // Force a component re-render which will trigger the useEffect redraw
              // This ensures we use the latest elements state from React
              setLogoImages((prev) => ({ ...prev })); // Trigger re-render
            }, 50); // Slightly longer delay to avoid drag interference
          };

          img.onerror = (error) => {
            console.error("❌ Failed to load logo image:", element.src, error);
            // Remove loading marker on error
            setLogoImages((prev) => {
              const newLogoImages = { ...prev };
              delete newLogoImages[`loading-${element.src}`];
              return newLogoImages;
            });
          };

          // Only set crossOrigin for external URLs
          if (
            !element.src.startsWith("blob:") &&
            !element.src.startsWith("data:")
          ) {
            img.crossOrigin = "anonymous";
          }

          console.log("🔎 Starting to load logo image:", element.src);
          img.src = element.src;
        }

        // Draw loading placeholder while image loads
        console.log("📄 Drawing loading placeholder for logo");

        // Draw semi-transparent background
        context.fillStyle = "rgba(59, 130, 246, 0.1)";
        context.fillRect(
          element.x - element.width / 2,
          element.y - element.height / 2,
          element.width,
          element.height
        );

        // Draw loading border
        context.strokeStyle = "#3b82f6";
        context.lineWidth = 2;
        context.setLineDash([4, 4]);
        context.strokeRect(
          element.x - element.width / 2,
          element.y - element.height / 2,
          element.width,
          element.height
        );
        context.setLineDash([]);

        // Draw loading text
        context.fillStyle = "#3b82f6";
        context.font = "bold 14px Arial";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText("Loading...", element.x, element.y);
      }
    }

    context.restore();
  };

  const drawShapeElement = (
    context: CanvasRenderingContext2D,
    element: ShapeElement
  ) => {
    context.fillStyle = element.color || "#000000";
    context.globalAlpha = element.opacity || 1;

    switch (element.shape) {
      case "rectangle":
        if (element.borderRadius && element.borderRadius > 0) {
          drawRoundedRect(
            context,
            element.x - element.width / 2,
            element.y - element.height / 2,
            element.width,
            element.height,
            element.borderRadius
          );
        } else {
          context.fillRect(
            element.x - element.width / 2,
            element.y - element.height / 2,
            element.width,
            element.height
          );
        }
        break;
      case "circle":
        context.beginPath();
        context.arc(
          element.x,
          element.y,
          Math.min(element.width, element.height) / 2,
          0,
          Math.PI * 2
        );
        context.fill();
        break;
    }

    context.globalAlpha = 1;
  };

  const drawRoundedRect = (
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) => {
    context.beginPath();
    context.moveTo(x + radius, y);
    context.lineTo(x + width - radius, y);
    context.quadraticCurveTo(x + width, y, x + width, y + radius);
    context.lineTo(x + width, y + height - radius);
    context.quadraticCurveTo(
      x + width,
      y + height,
      x + width - radius,
      y + height
    );
    context.lineTo(x + radius, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - radius);
    context.lineTo(x, y + radius);
    context.quadraticCurveTo(x, y, x + radius, y);
    context.closePath();
    context.fill();
  };

  // Locking functionality
  const isElementLocked = (elementId: string | null): boolean => {
    return elementId ? lockedElements.has(elementId) : false;
  };

  const toggleElementLock = () => {
    if (!selectedElement) return;

    setLockedElements((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(selectedElement)) {
        newSet.delete(selectedElement);
      } else {
        newSet.add(selectedElement);
      }
      return newSet;
    });
  };

  // Generic function to get coordinates from mouse or touch events (accounting for zoom)
  const getEventCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();

    let clientX, clientY;
    if ("touches" in e) {
      // Touch event
      if (e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ("changedTouches" in e && e.changedTouches.length > 0) {
        clientX = e.changedTouches[0].clientX;
        clientY = e.changedTouches[0].clientY;
      } else {
        return { x: 0, y: 0 };
      }
    } else {
      // Mouse event
      clientX = e.clientX;
      clientY = e.clientY;
    }

    // Account for zoom level in coordinate calculation
    const x = (clientX - rect.left) / zoomLevel;
    const y = (clientY - rect.top) / zoomLevel;

    return { x, y };
  };

  const handleElementSelection = (x: number, y: number) => {
    console.log("🔍 Element selection at coordinates:", { x, y });

    // Find all clicked/touched elements that match the coordinates
    const matchingElements = elements.filter((element) => {
      const matches =
        x >= element.x - element.width / 2 &&
        x <= element.x + element.width / 2 &&
        y >= element.y - element.height / 2 &&
        y <= element.y + element.height / 2;

      if (matches) {
        console.log("📍 Element matches coordinates:", {
          id: element.id,
          type: element.type,
          zIndex: element.zIndex || 0,
          bounds: {
            left: element.x - element.width / 2,
            right: element.x + element.width / 2,
            top: element.y - element.height / 2,
            bottom: element.y + element.height / 2,
          },
        });
      }

      return matches;
    });

    console.log("🎯 Total matching elements:", matchingElements.length);

    if (matchingElements.length > 0) {
      // Sort by zIndex and pick the highest one
      const sortedByZIndex = [...matchingElements].sort(
        (a, b) => (b.zIndex || 0) - (a.zIndex || 0)
      );
      const clickedElement = sortedByZIndex[0];

      console.log("🥇 Selected topmost element:", {
        id: clickedElement.id,
        type: clickedElement.type,
        zIndex: clickedElement.zIndex || 0,
      });

      console.log(
        "📊 All matching elements by zIndex:",
        sortedByZIndex.map((el) => ({
          id: el.id,
          type: el.type,
          zIndex: el.zIndex || 0,
        }))
      );

      setSelectedElement(clickedElement.id);
      setDragOffset({
        x: x - clickedElement.x,
        y: y - clickedElement.y,
      });
      return true;
    } else {
      console.log("❌ No elements found at coordinates");
      setSelectedElement(null);
      return false;
    }
  };

  const handleElementDrag = (x: number, y: number) => {
    if (!isDragging || !selectedElement) return;

    setElements((prev) =>
      prev.map((element) => {
        if (element.id === selectedElement) {
          return {
            ...element,
            x: x - dragOffset.x,
            y: y - dragOffset.y,
          };
        }
        return element;
      })
    );
  };

  // Mouse event handlers
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    console.log("🖱️ Canvas click event", { selectedElement, isDragging });
    const { x, y } = getEventCoordinates(e);
    const selected = handleElementSelection(x, y);
    console.log("👆 Element selection result:", selected);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getEventCoordinates(e);

    // First, try to select an element at the clicked coordinates
    if (handleElementSelection(x, y)) {
      // An element was selected, check if it's locked
      const isLocked = isElementLocked(selectedElement);
      if (!isLocked) {
        // Start dragging the selected element
        e.preventDefault();
        setIsDragging(true);
        document.body.classList.add("drag-no-scroll");
        console.log("✅ Starting drag for element:", selectedElement);
      }
    } else {
      // No element was selected, allow background interactions
      console.log("🟦 Background click (no element selected)");
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const isLocked = isElementLocked(selectedElement);
    if (selectedElement && isLocked) return; // Don't allow dragging when locked
    if (isDragging && selectedElement) {
      // Only drag element, not background
      e.preventDefault();
      const { x, y } = getEventCoordinates(e);
      handleElementDrag(x, y);
      console.log("🔄 Dragging element:", selectedElement, { x, y });
    } else if (!selectedElement) {
      // If you want to allow background drag/pan, handle it here
      // e.preventDefault();
      // handleBackgroundDrag(...)
    }
  };

  const handleCanvasMouseUp = () => {
    if (isDragging && selectedElement) {
      setIsDragging(false);
      document.body.classList.remove("drag-no-scroll");
      console.log("⬆️ Mouse up event, ending drag for:", selectedElement);
    }
    // If you want to handle background drag end, do it here if (!selectedElement)
  };

  // Touch event handlers
  const handleCanvasTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();

    const { x, y } = getEventCoordinates(e);

    if (handleElementSelection(x, y)) {
      const newIsLocked = isElementLocked(selectedElement);
      if (!newIsLocked) {
        setIsDragging(true);

        // Apply CSS class to prevent scrolling smoothly
        document.body.classList.add("drag-no-scroll");
      }
    }
  };

  const handleCanvasTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const isLocked = isElementLocked(selectedElement);
    if (isLocked) return; // Don't allow dragging when locked

    const { x, y } = getEventCoordinates(e);
    handleElementDrag(x, y);
  };

  const handleCanvasTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDragging(false);

    // Remove CSS class to restore normal scrolling smoothly
    document.body.classList.remove("drag-no-scroll");
  };

  const updateSelectedElement = (updates: Partial<AnyElement>) => {
    if (!selectedElement) {
      console.log("❌ No selected element to update");
      return;
    }

    console.log("🔄 Updating element:", selectedElement, "Updates:", updates);

    setElements((prev) =>
      prev.map((element) => {
        if (element.id === selectedElement) {
          const updatedElement = { ...element, ...updates };
          console.log("✅ Element updated:", updatedElement);
          return updatedElement;
        }
        return element;
      })
    );
  };

  // Layer management functions
  const bringToFront = () => {
    if (!selectedElement) return;
    // Sort elements by zIndex
    const sorted = [...elements].sort(
      (a, b) => (a.zIndex || 0) - (b.zIndex || 0)
    );
    // Remove selected element
    const idx = sorted.findIndex((el) => el.id === selectedElement);
    if (idx === -1) return;
    const [selectedEl] = sorted.splice(idx, 1);
    // Add selected element to the end (top/front)
    sorted.push(selectedEl);
    // Reassign zIndex sequentially
    setElements(sorted.map((el, i) => ({ ...el, zIndex: i })));
  };

  const sendToBack = () => {
    if (!selectedElement) return;
    // Sort elements by zIndex
    const sorted = [...elements].sort(
      (a, b) => (a.zIndex || 0) - (b.zIndex || 0)
    );
    // Remove selected element
    const idx = sorted.findIndex((el) => el.id === selectedElement);
    if (idx === -1) return;
    const [selectedEl] = sorted.splice(idx, 1);
    // Add selected element to the start (bottom/back)
    sorted.unshift(selectedEl);
    // Reassign zIndex sequentially
    setElements(sorted.map((el, i) => ({ ...el, zIndex: i })));
  };

  const moveUp = () => {
    if (!selectedElement) return;
    const currentEl = elements.find((el) => el.id === selectedElement);
    if (!currentEl) return;
    const currentZ = currentEl.zIndex || 0;
    const nextZ = elements
      .filter((el) => (el.zIndex || 0) > currentZ)
      .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))[0]?.zIndex;
    if (nextZ !== undefined) {
      updateSelectedElement({ zIndex: nextZ + 1 });
    }
  };

  const moveDown = () => {
    if (!selectedElement) return;
    const currentEl = elements.find((el) => el.id === selectedElement);
    if (!currentEl) return;
    const currentZ = currentEl.zIndex || 0;
    const prevZ = elements
      .filter((el) => (el.zIndex || 0) < currentZ)
      .sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0))[0]?.zIndex;
    if (prevZ !== undefined) {
      updateSelectedElement({ zIndex: prevZ - 0.1 });
    }
  };

  // Delete element function
  const deleteSelectedElement = () => {
    if (!selectedElement) return;
    setElements((prev) => prev.filter((el) => el.id !== selectedElement));
    setSelectedElement(null);
  };

  // Element creation functions
  const createNewTextElement = () => {
    const cw = canvasDimensions.width;
    const ch = canvasDimensions.height;
    if (!cw || !ch) return;

    // Use responsive sizing based on canvas dimensions
    const fontSize = Math.max(12, Math.min(72, cw / 30));
    const width = Math.max(50, cw * 0.5);

    const nextZ = elements.length
      ? Math.max(...elements.map((el) => el.zIndex || 0)) + 1
      : 0;

    const newElement: TextElement = {
      id: `text-${Date.now()}`,
      type: "text",
      x: cw / 2,
      y: ch / 2,
      width,
      height: fontSize * 1.5,
      content: "New Text",
      fontSize,
      fontWeight: "normal",
      fontFamily: "Arial",
      color: "#ffeb3b",
      textAlign: "center",
      backgroundColor: "#000",
      backgroundOpacity: 0.8,
      textOpacity: 1,
      padding: 2,
      borderRadius: 0,
      zIndex: nextZ,
    };

    setElements((prev) => [...prev, newElement]);
    setSelectedElement(newElement.id);
  };

  const createNewShapeElement = (shape: "rectangle" | "circle") => {
    const cw = canvasDimensions.width;
    const ch = canvasDimensions.height;
    if (!cw || !ch) return;

    // Use responsive sizing based on canvas dimensions
    const size = Math.min(100, cw * 0.15);

    const nextZ = elements.length
      ? Math.max(...elements.map((el) => el.zIndex || 0)) + 1
      : 0;

    const newElement: ShapeElement = {
      id: `shape-${Date.now()}`,
      type: "shape",
      x: cw / 2,
      y: ch / 2,
      width: size,
      height: shape === "circle" ? size : size * 0.6,
      shape,
      color: "#3b82f6",
      opacity: 1,
      zIndex: nextZ,
    };

    setElements((prev) => [...prev, newElement]);
    setSelectedElement(newElement.id);
  };

  const createNewLogoElement = () => {
    const cw = canvasDimensions.width;
    const ch = canvasDimensions.height;
    if (!cw || !ch) return;

    // Use responsive sizing based on canvas dimensions
    const size = Math.min(80, cw * 0.1);

    const nextZ = elements.length
      ? Math.max(...elements.map((el) => el.zIndex || 0)) + 1
      : 0;

    const newElement: LogoElement = {
      id: `logo-${Date.now()}`,
      type: "logo",
      x: cw / 2,
      y: ch / 2,
      width: size,
      height: size,
      src: "",
      opacity: 1,
      borderRadius: 0,
      zIndex: nextZ,
    };

    setElements((prev) => [...prev, newElement]);
    setSelectedElement(newElement.id);
  };

  // Logo upload function
  const handleLogoUpload = async (file: File) => {
    if (!selectedElement) {
      console.log("❌ No selected element for logo upload");
      return;
    }
    const element = elements.find((el) => el.id === selectedElement);
    if (!element || element.type !== "logo") {
      console.log("❌ Selected element is not a logo element:", element?.type);
      return;
    }

    console.log(
      "🚀 Starting logo upload for element:",
      selectedElement,
      "File:",
      file.name
    );
    setLogoUploading(true);
    try {
      const user = await getCurrentUser();
      if (user?.user?.id) {
        console.log("📤 Uploading logo to server...");
        const logoUrl = await uploadMedia(file, user.user.id);
        console.log("✅ Logo uploaded successfully:", logoUrl);
        updateSelectedElement({ src: logoUrl });
      } else {
        // Fallback to local URL
        console.log("🔄 No user found, using local URL fallback");
        const localUrl = URL.createObjectURL(file);
        console.log("📎 Created local URL:", localUrl);
        updateSelectedElement({ src: localUrl });
      }
    } catch (error) {
      console.error("❌ Error uploading logo:", error);
      // Fallback to local URL
      console.log("🔄 Using local URL fallback due to upload error");
      const localUrl = URL.createObjectURL(file);
      console.log("📎 Created fallback local URL:", localUrl);
      updateSelectedElement({ src: localUrl });
    } finally {
      setLogoUploading(false);
      console.log("🏁 Logo upload process completed");
    }
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      handleLogoUpload(file);
    }
  };

  const exportImage = async () => {
    const stage = stageRef.current;
    if (!stage) return;

    setIsSaving(true);

    // Hide transformer/selection UI from export
    const tr = transformerRef.current;
    const wasVisible = tr ? tr.visible() : false;

    try {
      tr?.hide();
      tr?.getLayer()?.batchDraw();

      const exportCanvas = stage.toCanvas({ pixelRatio: 2 });
      const blob = await new Promise<Blob | null>((resolve) => {
        exportCanvas.toBlob((b) => resolve(b), "image/png");
      });

      if (!blob) throw new Error("Failed to create image blob");

      // Create local URL for immediate preview
      const localUrl = URL.createObjectURL(blob);

      // Upload to server for persistent storage
      const user = await getCurrentUser();
      if (user?.user?.id) {
        try {
          const file = new File([blob], `template-${Date.now()}.png`, {
            type: "image/png",
            lastModified: Date.now(),
          });

          const uploadedUrl = await uploadMedia(file, user.user.id);
          onSave(uploadedUrl);
        } catch (uploadError) {
          console.warn(
            "Failed to upload template image, using local URL:",
            uploadError
          );
          onSave(localUrl);
        }
      } else {
        onSave(localUrl);
      }
    } catch (error) {
      console.error("Error exporting template image:", error);
    } finally {
      if (wasVisible) {
        tr?.show();
        tr?.getLayer()?.batchDraw();
      }
      setIsSaving(false);
    }
  };

  const selectedElementData = elements.find((el) => el.id === selectedElement);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-gray-500 font-medium">Loading editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col-reverse md:flex-row">
      <div
        className={`w-full md:w-80 md:min-w-80 md:max-w-80 ${
          aspectRatio === "1:1" ? "h-[50vh]" : ""
        } ${aspectRatio === "16:9" ? "h-[60vh]" : ""} ${
          aspectRatio === "9:16" ? "h-[50vh]" : ""
        }  md:h-full bg-white border-b md:border-b-0 md:border-r border-gray-200 flex flex-col`}
      >
        <div className="flex w-full overflow-y-auto p-3 md:p-4 min-h-0">
          <div className="space-y-3 md:space-y-4 w-full">
            {/* Templates Section */}
            <div className="border border-gray-200 rounded-md p-2 md:p-3 bg-white">
              <button
                type="button"
                onClick={() => setTemplatesOpen((prev) => !prev)}
                className="w-full flex items-center justify-between"
              >
                <h4 className="text-xs md:text-sm font-semibold text-slate-700">
                  Templates
                </h4>
                {templatesOpen ? (
                  <ChevronUp className="w-4 h-4 text-slate-600" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-600" />
                )}
              </button>

              {templatesOpen && (
                <div className="mt-2 space-y-2">
                  <div className="grid grid-cols-[1fr_auto] items-center gap-2">
                    <input
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      placeholder="Template name"
                      className="w-full min-w-0 px-3 h-10 border border-gray-300 rounded-md text-sm"
                    />
                    <button
                      onClick={() => void saveCurrentTemplate()}
                      className="h-10 bg-purple-600 text-white font-medium flex items-center gap-2 justify-center px-3 rounded-md border border-purple-600 hover:bg-[#d7d7fc] hover:text-[#7650e3] whitespace-nowrap"
                      title={saveAsGlobal ? "Save as global template" : "Save as my template"}
                      type="button"
                    >
                      <Download className="w-4 h-4" />
                      <span className="text-sm">Save</span>
                    </button>
                  </div>

                  <label className="flex items-center gap-2 text-xs text-slate-700 select-none">
                    <input
                      type="checkbox"
                      checked={saveAsGlobal}
                      onChange={(e) => setSaveAsGlobal(e.target.checked)}
                      className="h-4 w-4"
                    />
                    Save as global (isPublic)
                  </label>

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-600 font-medium">Saved templates</p>
                    <button
                      onClick={() => void refreshSavedTemplates()}
                      className="text-xs text-purple-600 font-medium hover:underline"
                      type="button"
                    >
                      Refresh
                    </button>
                  </div>

                    {savedTemplates.length === 0 ? (
                    <p className="text-xs text-gray-400">No templates saved yet.</p>
                  ) : (
                    <div className="space-y-2">
                      <div className="grid grid-cols-[1fr_auto_auto] items-center gap-2">
                        <select
                          value={selectedTemplateId}
                          onChange={(e) => selectTemplateById(e.target.value)}
                          className="w-full min-w-0 px-3 h-10 border border-gray-300 rounded-md text-sm"
                        >
                        {[...savedTemplates]
                          .sort((a, b) =>
                            (b.savedAt || "").localeCompare(a.savedAt || "")
                          )
                          .map((tpl) => (
                            <option key={tpl.id} value={tpl.id}>
                              {tpl.source === "global"
                                ? `Global - ${tpl.name}`
                                : tpl.source === "user"
                                  ? `My - ${tpl.name}`
                                  : `Local - ${tpl.name}`}
                            </option>
                          ))}
                        </select>

                        <button
                          onClick={() =>
                            selectedTemplateId && loadTemplateById(selectedTemplateId)
                          }
                          disabled={!selectedTemplateId}
                          className="h-10 w-10 flex items-center justify-center rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                          title="Load"
                          type="button"
                        >
                          <Upload className="w-4 h-4 text-gray-700" />
                        </button>

                        <button
                          onClick={() =>
                            selectedTemplateId && deleteTemplateById(selectedTemplateId)
                          }
                          disabled={
                            !selectedTemplateId ||
                            savedTemplates.find((t) => t.id === selectedTemplateId)?.source !==
                              "local"
                          }
                          className="h-10 w-10 flex items-center justify-center rounded-md bg-red-100 hover:bg-red-200 disabled:opacity-50"
                          title="Delete (local templates only)"
                          type="button"
                        >
                          <Trash className="w-4 h-4 text-red-700" />
                        </button>
                      </div>

                      {(() => {
                        const selected = savedTemplates.find(
                          (t) => t.id === selectedTemplateId
                        );
                        if (!selected?.thumbnailDataUrl) return null;
                        return (
                          <div className="border border-gray-200 rounded-md overflow-hidden bg-gray-50">
                            <img
                              src={selected.thumbnailDataUrl}
                              alt={selected.name}
                              className="w-full h-auto block"
                            />
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Element Creation Toolbar */}
            <div className="border border-gray-200 rounded-md p-2 md:p-3 bg-gray-50">
              <button
                type="button"
                onClick={() => setElementsOpen((prev) => !prev)}
                className="w-full flex items-center justify-between"
              >
                <h4 className="text-xs md:text-sm font-semibold text-slate-700">
                  {t("add_elements")}
                </h4>
                {elementsOpen ? (
                  <ChevronUp className="w-4 h-4 text-slate-600" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-600" />
                )}
              </button>

              {elementsOpen && (
                <div className="mt-2 md:mt-3">
                  <div className="grid grid-cols-4 md:grid-cols-2 gap-1.5 md:gap-2">
                    <button
                      onClick={createNewTextElement}
                      className="p-2 md:p-3 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 flex flex-col items-center justify-center space-y-0.5 md:space-y-1 transition-colors min-h-12 md:min-h-16"
                      title="Add Text"
                      type="button"
                    >
                      <Type className="w-4 h-4 md:w-5 md:h-5" />
                      <span className="text-xs font-medium">{t("text")}</span>
                    </button>
                    <button
                      onClick={createNewLogoElement}
                      className="p-2 md:p-3 bg-green-50 text-green-700 rounded-md hover:bg-green-100 flex flex-col items-center justify-center space-y-0.5 md:space-y-1 transition-colors min-h-12 md:min-h-16"
                      title="Add Logo"
                      type="button"
                    >
                      <Upload className="w-4 h-4 md:w-5 md:h-5" />
                      <span className="text-xs font-medium">{t("image")}</span>
                    </button>
                    <button
                      onClick={() => createNewShapeElement("rectangle")}
                      className="p-2 md:p-3 bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100 flex flex-col items-center justify-center space-y-0.5 md:space-y-1 transition-colors min-h-12 md:min-h-16"
                      title="Add Rectangle"
                      type="button"
                    >
                      <Square className="w-4 h-4 md:w-5 md:h-5" />
                      <span className="text-xs font-medium">{t("rectangle")}</span>
                    </button>
                    <button
                      onClick={() => createNewShapeElement("circle")}
                      className="p-2 md:p-3 bg-orange-50 text-orange-700 rounded-md hover:bg-orange-100 flex flex-col items-center justify-center space-y-0.5 md:space-y-1 transition-colors min-h-12 md:min-h-16"
                      title="Add Circle"
                      type="button"
                    >
                      <Circle className="w-4 h-4 md:w-5 md:h-5" />
                      <span className="text-xs font-medium">{t("circle")}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Selected Element Properties */}
            {selectedElementData && (
              <div className="border border-gray-200 rounded-md p-3 md:p-4 bg-white">
                <button
                  type="button"
                  onClick={() => setPropertiesOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between"
                >
                  <h4 className="text-xs md:text-sm font-semibold text-slate-900">
                    {selectedElementData.type.charAt(0).toUpperCase() +
                      selectedElementData.type.slice(1)} Element
                  </h4>
                  {propertiesOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-600" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-600" />
                  )}
                </button>

                {propertiesOpen && (
                  <>
                    <div className="flex items-center justify-end mb-3 md:mb-4 mt-3">
                      {/* Element Control Buttons */}
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={toggleElementLock}
                          className={`p-2 rounded-md ${
                            isElementLocked(selectedElement)
                              ? "bg-red-100 text-red-600"
                              : "bg-gray-100 text-gray-500 font-medium"
                          } hover:bg-opacity-80 transition-colors`}
                          title={
                            isElementLocked(selectedElement)
                              ? "Unlock Element"
                              : "Lock Element"
                          }
                          type="button"
                        >
                          {isElementLocked(selectedElement) ? (
                            <Lock className="w-4 h-4" />
                          ) : (
                            <Unlock className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={deleteSelectedElement}
                          className="p-2 rounded-md bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                          title="Delete"
                          type="button"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                {/* Layer Controls */}
                <div className="mb-2 md:mb-3">
                  <label className="block text-xs md:text-sm font-medium text-slate-700 mb-1.5 md:mb-2">
                    Layer Order
                  </label>
                  <div className="grid grid-cols-4 gap-1 md:gap-1.5">
                    <button
                      onClick={bringToFront}
                      className="p-2 bg-gray-100 text-gray-500 font-medium rounded-md hover:bg-gray-200 flex items-center justify-center transition-colors text-xs"
                      title="Bring to Front"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={moveUp}
                      className="p-2 bg-gray-100 text-gray-500 font-medium rounded-md hover:bg-gray-200 flex items-center justify-center transition-colors text-xs"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={moveDown}
                      className="p-2 bg-gray-100 text-gray-500 font-medium rounded-md hover:bg-gray-200 flex items-center justify-center transition-colors text-xs"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={sendToBack}
                      className="p-2 bg-gray-100 text-gray-500 font-medium rounded-md hover:bg-gray-200 flex items-center justify-center transition-colors text-xs"
                      title="Send to Back"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                {/* W H X Y Controls in one row */}
                <div className="grid grid-cols-4 gap-1.5 md:gap-2 mb-2 md:mb-3 text-center">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1 text-center">
                      W
                    </label>
                    <input
                      type="number"
                      value={selectedElementData.width || ""}
                      onChange={(e) =>
                        updateSelectedElement({
                          width: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                      min="1"
                      disabled={isElementLocked(selectedElement)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1 text-center">
                      H
                    </label>
                    <input
                      type="number"
                      value={selectedElementData.height || ""}
                      onChange={(e) =>
                        updateSelectedElement({
                          height:
                            e.target.value === ""
                              ? 0
                              : parseInt(e.target.value),
                        })
                      }
                      className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                      min="1"
                      disabled={isElementLocked(selectedElement)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1 text-center">
                      X
                    </label>
                    <input
                      type="number"
                      value={selectedElementData.x || ""}
                      onChange={(e) =>
                        updateSelectedElement({
                          x:
                            e.target.value === ""
                              ? 0
                              : parseInt(e.target.value),
                        })
                      }
                      className="w-full px-2 py-1 border border-gray-300 rounded text-xs text-center"
                      disabled={isElementLocked(selectedElement)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1 text-center">
                      Y
                    </label>
                    <input
                      type="number"
                      value={selectedElementData.y || ""}
                      onChange={(e) =>
                        updateSelectedElement({
                          y:
                            e.target.value === ""
                              ? 0
                              : parseInt(e.target.value),
                        })
                      }
                      className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                      disabled={isElementLocked(selectedElement)}
                    />
                  </div>
                </div>

                {/* Rotation Control - Shown here for non-text elements */}
                {selectedElementData.type !== "text" && (
                  <div className="mb-2 md:mb-3">
                    <label className="block text-xs md:text-sm font-medium text-slate-700 mb-1">
                      Rotation
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={selectedElementData.rotation ?? 0}
                      onChange={(e) =>
                        updateSelectedElement({
                          rotation:
                            e.target.value === ""
                              ? 0
                              : parseInt(e.target.value),
                        })
                      }
                      className="w-full template-range"
                      disabled={isElementLocked(selectedElement)}
                    />
                    <div className="flex justify-between text-xs text-gray-500 font-medium mt-1">
                      <span>0°</span>
                      <span className="font-medium">
                        {selectedElementData.rotation || 0}°
                      </span>
                      <span>360°</span>
                    </div>
                  </div>
                )}

                {selectedElementData.type === "logo" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Image Upload
                      </label>
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleLogoFileChange}
                        className="hidden"
                      />
                      <button
                        onClick={() => logoInputRef.current?.click()}
                        disabled={logoUploading}
                        className="w-full bg-blue-600 text-white px-4 py-3 rounded-md text-sm flex items-center justify-center space-x-2 hover:bg-blue-700 disabled:opacity-50 transition-colors"
                      >
                        {logoUploading ? (
                          <>
                            <Loader className="w-4 h-4 animate-spin" />
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            <span>Upload Image</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          Opacity
                        </label>
                        <input
                          type="range"
                          min="0.01"
                          max="1"
                          step="0.01"
                          value={
                            (selectedElementData as LogoElement).opacity || 1
                          }
                          onChange={(e) =>
                            updateSelectedElement({
                              opacity: parseFloat(e.target.value),
                            })
                          }
                          className="w-full template-range"
                        />
                        <span className="text-sm text-gray-500 font-medium text-center block mt-1">
                          {Math.round(
                            ((selectedElementData as LogoElement).opacity ||
                              1) * 100
                          )}
                          %
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Border Radius
                        </label>
                        <input
                          type="number"
                          value={
                            (selectedElementData as LogoElement).borderRadius ??
                            0
                          }
                          onChange={(e) =>
                            updateSelectedElement({
                              borderRadius:
                                e.target.value === ""
                                  ? 0
                                  : parseInt(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm"
                          placeholder="0"
                          min="0"
                          max="50"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {selectedElementData.type === "text" && (
                  <div className="space-y-3">
                    {/* Colors first */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          Text
                        </label>
                        <input
                          type="color"
                          value={
                            (selectedElementData as TextElement).color ||
                            "#ffeb3b"
                          }
                          onChange={(e) =>
                            updateSelectedElement({ color: e.target.value })
                          }
                          className="w-full h-9 border border-gray-300 rounded-md cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          Background
                        </label>
                        <input
                          type="color"
                          value={
                            (selectedElementData as TextElement)
                              .backgroundColor || "#ffffff"
                          }
                          onChange={(e) =>
                            updateSelectedElement({
                              backgroundColor: e.target.value,
                            })
                          }
                          className="w-full h-9 border border-gray-300 rounded-md cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Opacity second */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Text Opacity
                        </label>
                        <input
                          type="range"
                          min="0.01"
                          max="1"
                          step="0.01"
                          value={
                            (selectedElementData as TextElement).textOpacity ||
                            1
                          }
                          onChange={(e) =>
                            updateSelectedElement({
                              textOpacity: parseFloat(e.target.value),
                            })
                          }
                          className="w-full template-range"
                        />
                        <span className="text-xs text-gray-500 font-medium text-center block mt-1">
                          {Math.round(
                            ((selectedElementData as TextElement).textOpacity ||
                              1) * 100
                          )}
                          %
                        </span>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Background Opacity
                        </label>
                        <input
                          type="range"
                          min="0.01"
                          max="1"
                          step="0.01"
                          value={
                            (selectedElementData as TextElement)
                              .backgroundOpacity || 1
                          }
                          onChange={(e) =>
                            updateSelectedElement({
                              backgroundOpacity: parseFloat(e.target.value),
                            })
                          }
                          className="w-full template-range"
                        />
                        <span className="text-xs text-gray-500 font-medium text-center block mt-1">
                          {Math.round(
                            ((selectedElementData as TextElement)
                              .backgroundOpacity || 1) * 100
                          )}
                          %
                        </span>
                      </div>
                    </div>

                    {/* Text Content last */}
                    <div>
                      <label className="block text-sm font-medium text-yellow-500-700 mb-1.5">
                        Text Content
                      </label>
                      <textarea
                        value={
                          (selectedElementData as TextElement).content ?? ""
                        }
                        onChange={(e) =>
                          updateSelectedElement({
                            content:
                              e.target.value === undefined
                                ? ""
                                : e.target.value,
                          })
                        }
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm"
                        rows={3}
                        placeholder="Enter your text..."
                      />
                    </div>
                    {/* Font Family */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Font Family
                      </label>
                      <select
                        value={
                          (selectedElementData as TextElement).fontFamily ?? ""
                        }
                        onChange={(e) =>
                          updateSelectedElement({
                            fontFamily:
                              e.target.value === undefined
                                ? ""
                                : e.target.value,
                          })
                        }
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="Arial">Arial</option>
                        <option value="Helvetica">Helvetica</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Roboto">Roboto</option>
                        <option value="Open Sans">Open Sans</option>
                        <option value="Lato">Lato</option>
                        <option value="Montserrat">Montserrat</option>
                        <option value="Source Sans Pro">Source Sans Pro</option>
                        <option value="Poppins">Poppins</option>
                        <option value="Inter">Inter</option>
                        <option value="Playfair Display">
                          Playfair Display
                        </option>
                        <option value="Oswald">Oswald</option>
                        <option value="Merriweather">Merriweather</option>
                      </select>
                    </div>

                    {/* Size, Weight, Align, Padding */}
                    <div className="grid grid-cols-4 gap-2 mb-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Size
                        </label>
                        <input
                          type="number"
                          value={
                            (selectedElementData as TextElement).fontSize || ""
                          }
                          onChange={(e) =>
                            updateSelectedElement({
                              fontSize: parseInt(e.target.value),
                            })
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                          min="8"
                          max="72"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Weigt
                        </label>
                        <select
                          value={
                            (selectedElementData as TextElement).fontWeight ||
                            "normal"
                          }
                          onChange={(e) =>
                            updateSelectedElement({
                              fontWeight: e.target.value as TextElement["fontWeight"],
                            })
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                        >
                          <option value="300">Light</option>
                          <option value="normal">Normal</option>
                          <option value="600">Semi</option>
                          <option value="bold">Bold</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Align
                        </label>
                        <select
                          value={
                            (selectedElementData as TextElement).textAlign ||
                            "left"
                          }
                          onChange={(e) =>
                            updateSelectedElement({
                              textAlign: e.target.value as TextElement["textAlign"],
                            })
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                        >
                          <option value="left">Left</option>
                          <option value="center">Center</option>
                          <option value="right">Right</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">
                          Pad
                        </label>
                        <input
                          type="number"
                          value={
                            (selectedElementData as TextElement).padding || ""
                          }
                          onChange={(e) =>
                            updateSelectedElement({
                              padding: parseInt(e.target.value),
                            })
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                          min="0"
                          max="50"
                        />
                      </div>
                    </div>

                    {/* Rotation below fonts for text */}
                    <div className="mb-2">
                      <label className="block text-xs md:text-sm font-medium text-slate-700 mb-1">
                        Rotation
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={selectedElementData.rotation || 0}
                        onChange={(e) =>
                          updateSelectedElement({
                            rotation: parseInt(e.target.value),
                          })
                        }
                        className="w-full template-range"
                        disabled={isElementLocked(selectedElement)}
                      />
                      <div className="flex justify-between text-xs text-gray-500 font-medium mt-1">
                        <span>0°</span>
                        <span className="font-medium">
                          {selectedElementData.rotation || 0}°
                        </span>
                        <span>360°</span>
                      </div>
                    </div>
                  </div>
                )}

                {selectedElementData.type === "shape" && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          Shape Type
                        </label>
                        <select
                          value={
                            (selectedElementData as ShapeElement).shape ||
                            "rectangle"
                          }
                          onChange={(e) =>
                            updateSelectedElement({
                              shape: e.target.value as "rectangle" | "circle",
                            })
                          }
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm"
                        >
                          <option value="rectangle">Rectangle</option>
                          <option value="circle">Circle</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          Color
                        </label>
                        <input
                          type="color"
                          value={
                            (selectedElementData as ShapeElement).color ||
                            "#3b82f6"
                          }
                          onChange={(e) =>
                            updateSelectedElement({ color: e.target.value })
                          }
                          className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Opacity
                      </label>
                      <input
                        type="range"
                        min="0.01"
                        max="1"
                        step="0.01"
                        value={
                          (selectedElementData as ShapeElement).opacity || 1
                        }
                        onChange={(e) =>
                          updateSelectedElement({
                            opacity: parseFloat(e.target.value),
                          })
                        }
                        className="w-full template-range"
                      />
                      <div className="flex justify-between text-sm text-gray-500 font-medium mt-1">
                        <span>1%</span>
                        <span className="font-medium">
                          {Math.round(
                            ((selectedElementData as ShapeElement).opacity ||
                              1) * 100
                          )}
                          %
                        </span>
                        <span>100%</span>
                      </div>
                    </div>

                    {(selectedElementData as ShapeElement).shape ===
                      "rectangle" && (
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          Corner Radius
                        </label>
                        <input
                          type="number"
                          value={
                            (selectedElementData as ShapeElement)
                              .borderRadius || 0
                          }
                          onChange={(e) =>
                            updateSelectedElement({
                              borderRadius: parseInt(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm"
                          min="0"
                          max="50"
                          placeholder="0"
                        />
                      </div>
                    )}
                  </div>
                )}
                  </>
                )}
              </div>
            )}

            {!selectedElementData && (
              <div className="text-center py-6 md:py-12 text-gray-500 font-medium">
                <div className="bg-gray-50 rounded-md p-4 md:p-6">
                  <Palette className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 md:mb-3 text-gray-400" />
                  <p className="text-xs md:text-sm font-medium mb-1">
                    {t("no_element_selected")}
                  </p>
                  <p className="text-xs text-gray-400">
                    {t("click_template_edit")}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-3 md:p-4 ">
          <div className="flex flex-row-reverse justify-center ">
            <button
              onClick={exportImage}
              disabled={isSaving}
              className="bg-purple-600  text-white font-medium w-full flex items-center gap-2 justify-center px-3 py-2.5  mx-1 rounded-md border border-purple-600 hover:bg-[#d7d7fc] hover:text-[#7650e3]"
            >
              {isSaving ? (
                <>
                  <Loader className="w-3 h-3 md:w-4 md:h-4 animate-spin " />
                  <span className="hidden sm:inline text-sm">{t("saving")}</span>
                  <span className="sm:hidden text-sm">{t("saving")}</span>
                </>
              ) : (
                <>
                  <span className="sm:inline">{t("continue")}</span>
                </>
              )}
            </button>

            <button
              onClick={handleDiscardClick}
              className="text-purple-600 flex justify-center items-center gap-2  font-medium w-full px-3 py-2.5  mx-1 rounded-md border border-purple-600 hover:bg-[#d7d7fc] hover:text-[#7650e3]"
            >
              {t("discard_image")}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-gray-50 flex flex-col min-h-0">
        <div className="flex-shrink-0 px-3 py-1 md:py-2.5 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500 font-medium font-mono">
              {canvasDimensions && (
                <>
                  <span className="hidden sm:inline">
                    {canvasDimensions.width} × {canvasDimensions.height} | {Math.round(zoomLevel * 100)}%
                  </span>
                  <span className="sm:hidden">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center space-x-1.5 md:space-x-2">
              <button
                onClick={() => setZoomLevel(Math.max(0.1, zoomLevel - 0.1))}
                className="px-2 py-1 bg-gray-100 text-slate-700 rounded text-xs hover:bg-gray-200 transition-colors"
                disabled={zoomLevel <= 0.1}
              >
                −
              </button>
              <span className="text-xs text-gray-500 font-medium min-w-8 md:min-w-12 text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel(Math.min(maxZoom, zoomLevel + 0.1))}
                className="px-2 py-1 bg-gray-100 text-slate-700 rounded text-xs hover:bg-gray-200 transition-colors"
                disabled={zoomLevel >= maxZoom}
              >
                +
              </button>
              <button
                onClick={() => {
                  if (imageDimensions) {
                    const { zoom } = calculateZoomLevel(
                      imageDimensions.width,
                      imageDimensions.height
                    );
                    setZoomLevel(zoom);
                  }
                }}
                className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-colors ml-1 md:ml-2"
              >
                Fit
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="px-2 py-1 bg-gray-100 text-slate-700 rounded text-xs hover:bg-gray-200 transition-colors"
              >
                100%
              </button>
            </div>
          </div>
        </div>

        {/* Canvas Container - Scrollable */}
        <div
          className={`flex-1 ${
            isDragging ? "overflow-hidden" : "overflow-auto"
          }  bg-gray-100 flex items-center justify-center p-2 md:p-4 min-h-0`}
        >
          <div
            className="flex items-center justify-center"
            style={{
              zoom: `${zoomLevel}`,
              transformOrigin: "center center",
            }}
          >
            <Stage
              ref={stageRef}
              width={canvasDimensions.width}
              height={canvasDimensions.height}
              onMouseDown={(e) => {
                // Deselect when clicking on empty space
                if (e.target === e.target.getStage()) setSelectedElement(null);
              }}
              onTouchStart={(e) => {
                if (e.target === e.target.getStage()) setSelectedElement(null);
              }}
              className="border-2 border-gray-300 rounded-md shadow-md bg-white transition-all duration-200"
            >
              <Layer>
                {backgroundImage ? (
                  (() => {
                    const crop = getCoverCrop(
                      backgroundImage,
                      canvasDimensions.width,
                      canvasDimensions.height
                    );
                    return (
                      <KonvaImage
                        image={backgroundImage}
                        x={0}
                        y={0}
                        width={canvasDimensions.width}
                        height={canvasDimensions.height}
                        cropX={crop.cropX}
                        cropY={crop.cropY}
                        cropWidth={crop.cropWidth}
                        cropHeight={crop.cropHeight}
                        listening={false}
                      />
                    );
                  })()
                ) : (
                  <Rect
                    x={0}
                    y={0}
                    width={canvasDimensions.width}
                    height={canvasDimensions.height}
                    fill="#f3f4f6"
                    listening={false}
                  />
                )}

                {[...elements]
                  .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
                  .map((el) => {
                    const locked = isElementLocked(el.id);
                    const isSelected = el.id === selectedElement;
                    const commonGroupProps = {
                      key: el.id,
                      x: el.x,
                      y: el.y,
                      rotation: el.rotation || 0,
                      draggable: !locked,
                      onClick: () => setSelectedElement(el.id),
                      onTap: () => setSelectedElement(el.id),
                      onDragStart: () => {
                        if (!locked) setIsDragging(true);
                      },
                      onDragEnd: (e: any) => {
                        setIsDragging(false);
                        updateElementById(el.id, { x: e.target.x(), y: e.target.y() });
                      },
                      ref: (node: any) => {
                        if (isSelected && node) selectedNodeRef.current = node;
                      },
                    };

                    if (el.type === "text") {
                      const textEl = el as TextElement;
                      const pad = textEl.padding || 0;
                      const isBold =
                        textEl.fontWeight === "bold" ||
                        (typeof textEl.fontWeight === "string" &&
                          !Number.isNaN(parseInt(textEl.fontWeight, 10)) &&
                          parseInt(textEl.fontWeight, 10) >= 600);

                      return (
                        <Group {...commonGroupProps}>
                          {textEl.backgroundColor ? (
                            <Rect
                              x={-textEl.width / 2 - pad}
                              y={-textEl.height / 2 - pad}
                              width={textEl.width + pad * 2}
                              height={textEl.height + pad * 2}
                              cornerRadius={textEl.borderRadius || 0}
                              fill={textEl.backgroundColor}
                              opacity={textEl.backgroundOpacity ?? 1}
                            />
                          ) : null}
                          <KonvaText
                            x={-textEl.width / 2}
                            y={-textEl.height / 2}
                            width={textEl.width}
                            height={textEl.height}
                            text={textEl.content || ""}
                            fill={textEl.color || "#000000"}
                            fontSize={textEl.fontSize || 16}
                            fontFamily={textEl.fontFamily || "Arial"}
                            fontStyle={isBold ? "bold" : "normal"}
                            align={textEl.textAlign || "left"}
                            verticalAlign="middle"
                            opacity={textEl.textOpacity ?? 1}
                          />
                        </Group>
                      );
                    }

                    if (el.type === "logo") {
                      const logoEl = el as LogoElement;
                      const img = logoEl.src ? logoImages[logoEl.src] : undefined;

                      return (
                        <Group {...commonGroupProps}>
                          {img ? (
                            <KonvaImage
                              image={img}
                              x={-logoEl.width / 2}
                              y={-logoEl.height / 2}
                              width={logoEl.width}
                              height={logoEl.height}
                              opacity={logoEl.opacity ?? 1}
                            />
                          ) : (
                            <Rect
                              x={-logoEl.width / 2}
                              y={-logoEl.height / 2}
                              width={logoEl.width}
                              height={logoEl.height}
                              fill="rgba(209, 213, 219, 0.3)"
                              stroke="#9ca3af"
                              strokeWidth={2}
                              dash={[8, 4]}
                            />
                          )}
                        </Group>
                      );
                    }

                    if (el.type === "shape") {
                      const shapeEl = el as ShapeElement;
                      return (
                        <Group {...commonGroupProps}>
                          {shapeEl.shape === "circle" ? (
                            <Ellipse
                              x={0}
                              y={0}
                              radiusX={Math.max(1, shapeEl.width / 2)}
                              radiusY={Math.max(1, shapeEl.height / 2)}
                              fill={shapeEl.color || "#000000"}
                              opacity={shapeEl.opacity ?? 1}
                            />
                          ) : (
                            <Rect
                              x={-shapeEl.width / 2}
                              y={-shapeEl.height / 2}
                              width={shapeEl.width}
                              height={shapeEl.height}
                              cornerRadius={shapeEl.borderRadius || 0}
                              fill={shapeEl.color || "#000000"}
                              opacity={shapeEl.opacity ?? 1}
                            />
                          )}
                        </Group>
                      );
                    }

                    return null;
                  })}

                <Transformer
                  ref={transformerRef}
                  rotateEnabled
                  enabledAnchors={[
                    "top-left",
                    "top-right",
                    "bottom-left",
                    "bottom-right",
                    "middle-left",
                    "middle-right",
                    "top-center",
                    "bottom-center",
                  ]}
                  onTransformEnd={() => {
                    const node = selectedNodeRef.current;
                    if (!node || !selectedElement) return;

                    // If locked, don't apply transforms
                    if (lockedElements.has(selectedElement)) return;

                    const base = elements.find((e) => e.id === selectedElement) as any;
                    if (!base) return;

                    const scaleX = node.scaleX();
                    const scaleY = node.scaleY();

                    updateElementById(selectedElement, {
                      x: node.x(),
                      y: node.y(),
                      width: Math.max(1, (base.width || 1) * scaleX),
                      height: Math.max(1, (base.height || 1) * scaleY),
                      rotation: node.rotation(),
                    });

                    node.scaleX(1);
                    node.scaleY(1);
                  }}
                />
              </Layer>
            </Stage>
          </div>
        </div>
      </div>
      
    </div>
  );
};
