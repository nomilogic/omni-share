import { useModal } from "../context2/ModalContext";
import DiscardImageModal from "../components/modals/DiscardImageModal";
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
  Line,
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
  RotateCcw,
  Circle,
  Plus,
  Monitor,
  Smartphone,
  Youtube,
  Instagram,
  Twitter,
  LucideTabletSmartphone,
} from "lucide-react";
import { uploadMedia, getCurrentUser } from "../lib/database";
import { templateService } from "../services/templateService";
import "../styles/drag-prevention.css";
import "../styles/template-editor.css";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useConfirmDialog } from "../context/ConfirmDialogContext";
import { useNavigationGuard } from "../hooks/useNavigationGuard";
import { optimizeThumbnailBlob } from "@/utils/thumbnailOptimizer";
import { optimizeThumbnail } from "@/lib/socialPoster";

interface ImageTemplateEditorProps {
  imageUrl: string;
  selectedTemplate?: Template;
  onSave: (imageUrl: string) => void;
  onCancel: () => void;
  isVideoThumbnail?: boolean;
  aspectRatio?: string; // Aspect ratio from ContentInput (e.g., '1:1', '16:9', '9:16')
  profileData?: any; // Profile info for data binding
}

export const ImageTemplateEditor = ({
  imageUrl,
  selectedTemplate,
  onSave,
  onCancel,
  isVideoThumbnail = false,
  aspectRatio = "16:9",
  profileData: externalProfileData,
}: ImageTemplateEditorProps): JSX.Element => {
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const selectedNodeRef = useRef<Konva.Node | null>(null);

  const { t, i18n } = useTranslation();
  const changeLanguage = (lang: any) => i18n.changeLanguage(lang);
  const [isTemplatesLoading, setIsTemplatesLoading] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const addElementLogoInputRef = useRef<HTMLInputElement>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [elements, setElements] = useState<TemplateElement[]>([]);
  // Undo/Redo history with localStorage persistence
  const HISTORY_STORAGE_KEY = "image-template-editor.history.v1";
  const historyStackRef = useRef<TemplateElement[][]>([]);
  const historyIndexRef = useRef<number>(-1);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const isUndoRedoActionRef = useRef<boolean>(false);

  // Save history to localStorage
  const saveHistoryToStorage = (stack: TemplateElement[][], index: number) => {
    try {
      const payload = {
        version: 1,
        stack,
        index,
      };
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn("Failed to save history to localStorage:", e);
    }
  };

  // Load history from localStorage
  const loadHistoryFromStorage = () => {
    try {
      const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (stored) {
        const payload = JSON.parse(stored);
        if (payload?.stack && Array.isArray(payload.stack)) {
          historyStackRef.current = payload.stack;
          historyIndexRef.current = payload.index ?? -1;
          setCanUndo(historyIndexRef.current > 0);
          setCanRedo(historyIndexRef.current < historyStackRef.current.length - 1);
        }
      }
    } catch (e) {
      console.warn("Failed to load history from localStorage:", e);
    }
  };

  // Add state to undo history and save to localStorage
  const addToHistory = (newElements: TemplateElement[]) => {
    if (isUndoRedoActionRef.current) return;

    try {
      const stack = historyStackRef.current;
      const currentIndex = historyIndexRef.current;

      // Remove any redo history if we're making a new action
      if (currentIndex < stack.length - 1) {
        historyStackRef.current = stack.slice(0, currentIndex + 1);
      }

      // Add new state to history
      const deepCopy = JSON.parse(JSON.stringify(newElements));
      historyStackRef.current.push(deepCopy);
      historyIndexRef.current = historyStackRef.current.length - 1;

      // Save to localStorage
      saveHistoryToStorage(historyStackRef.current, historyIndexRef.current);

      setCanUndo(historyIndexRef.current > 0);
      setCanRedo(false);
    } catch (e) {
      console.error("Failed to add to history:", e);
    }
  };

  // Monitor elements changes and save to history
  useEffect(() => {
    if (!isUndoRedoActionRef.current && elements.length > 0) {
      addToHistory(elements);
    }
  }, [elements]);

  // Clear All with undo support
  const clearAllElements = () => {
    setElements((prevElements) => {
      const filtered = prevElements.filter((el) => el.id === "background-image");
      addToHistory(filtered);
      return filtered;
    });
    setSelectedElement(null);
  };

  // Handle undo
  const handleUndo = () => {
    if (historyIndexRef.current > 0) {
      isUndoRedoActionRef.current = true;
      historyIndexRef.current--;
      const restoredElements = JSON.parse(
        JSON.stringify(historyStackRef.current[historyIndexRef.current])
      );
      setElements(restoredElements);
      saveHistoryToStorage(historyStackRef.current, historyIndexRef.current);
      setCanUndo(historyIndexRef.current > 0);
      setCanRedo(true);
      setTimeout(() => {
        isUndoRedoActionRef.current = false;
      }, 0);
    }
  };

  // Handle redo
  const handleRedo = () => {
    if (historyIndexRef.current < historyStackRef.current.length - 1) {
      isUndoRedoActionRef.current = true;
      historyIndexRef.current++;
      const restoredElements = JSON.parse(
        JSON.stringify(historyStackRef.current[historyIndexRef.current])
      );
      setElements(restoredElements);
      saveHistoryToStorage(historyStackRef.current, historyIndexRef.current);
      setCanUndo(true);
      setCanRedo(historyIndexRef.current < historyStackRef.current.length - 1);
      setTimeout(() => {
        isUndoRedoActionRef.current = false;
      }, 0);
    }
  };

  // Keyboard shortcuts for undo/redo (Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z, and Ctrl/Cmd+Y)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey)) {
        const key = e.key.toLowerCase();
        // Ctrl/Cmd+Z = Undo
        if (key === "z") {
          e.preventDefault();
          if (e.shiftKey) {
            handleRedo();
          } else {
            handleUndo();
          }
        }
        // Ctrl/Cmd+Y = Redo
        else if (key === "y") {
          e.preventDefault();
          handleRedo();
        }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleUndo, handleRedo]);

  // Load history from localStorage on component mount
  useEffect(() => {
    loadHistoryFromStorage();
  }, []);

  const { openModal } = useModal();
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [backgroundImage, setBackgroundImage] =
    useState<HTMLImageElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [lockedElements, setLockedElements] = useState<Set<string>>(new Set());
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoImages, setLogoImages] = useState<{
    [key: string]: HTMLImageElement;
  }>({});
  const [isResizing, setIsResizing] = useState(false);
  const [backgroundImageLoading, setBackgroundImageLoading] = useState(false);
  const [logoImageLoadingIds, setLogoImageLoadingIds] = useState<Set<string>>(
    new Set(),
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
  const [profileBindingData, setProfileBindingData] = useState<any>(
    externalProfileData || {},
  );

  // Load profile data on mount if not provided
  useEffect(() => {
    const loadProfileData = async () => {
      if (externalProfileData) {
        // Use profile data from props/context
        const profile = externalProfileData.profile || externalProfileData;
        setProfileBindingData({
          email: profile.email || externalProfileData.email || "",
          website: profile.publicUrl || profile.website || "",
          companyName: profile.companyName || profile.name || "",
          brandName: profile.brandName || "",
          fullName: profile.fullName || profile.name || "",
          phoneNumber: profile.phoneNumber || "",
          logo: profile.brandLogo || profile.logo || profile.profileImage || "",
        });
        console.log("✅ Profile data from context:", profile);
      } else {
        // Fallback: fetch from database
        try {
          const result = await getCurrentUser();
          if (result?.user?.profile) {
            const profile = result.user.profile as any;
            setProfileBindingData({
              email: profile.email || result.user?.email || "",
              website: profile.publicUrl || profile.website || "",
              companyName: profile.companyName || profile.name || "",
              brandName: profile.brandName || "",
              fullName: profile.fullName || profile.name || "",
              phoneNumber: profile.phoneNumber || "",
              logo:
                profile.brandLogo || profile.logo || profile.profileImage || "",
            });
            console.log("✅ Profile data loaded from DB:", profile);
          }
        } catch (error) {
          console.warn("Failed to load profile data:", error);
        }
      }
    };
    loadProfileData();
  }, [externalProfileData]);

  // Update bound elements when profile data loads or changes
  useEffect(() => {
    if (Object.keys(profileBindingData).length > 0) {
      console.log("🔄 Profile data updated, re-applying bindings");
      setElements((prevElements) => applyProfileBindings(prevElements));
    }
  }, [profileBindingData]);

  // Initialize elements with background image and template elements
  useEffect(() => {
    const initializeElements = () => {
      let initialElements: TemplateElement[] = [];

      // Add background image as an interactive element if imageUrl exists
      if (imageUrl) {
        const backgroundElement: LogoElement = {
          id: "background-image",
          type: "logo",
          name: "background",
          x: canvasDimensions.width / 2,
          y: canvasDimensions.height / 2,
          width: canvasDimensions.width,
          height: canvasDimensions.height,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
          src: imageUrl,
          opacity: 1,
          zIndex: -1, // Background should be behind other elements
        };
        initialElements.push(backgroundElement);
      }

      // Add template elements if they exist (excluding background-image)
      if (selectedTemplate?.elements) {
        const templateElements = selectedTemplate.elements
          .filter((el) => el.id !== "background-image")
          .map((el, index) => ({
            ...el,
            zIndex: el.zIndex !== undefined ? el.zIndex : index + 1, // Start from 1 to be above background
          }));
        initialElements = [...initialElements, ...templateElements];
      }

      setElements(initialElements);
    };

    initializeElements();
  }, [imageUrl, canvasDimensions, selectedTemplate]);

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
  const [isTemplateEditing, setIsTemplateEditing] = useState<boolean>(true);
  const [elementsOpen, setElementsOpen] = useState<boolean>(true);
  const [propertiesOpen, setPropertiesOpen] = useState<boolean>(true);

  // Grid and snapping settings
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [gridSize, setGridSize] = useState<number>(1);
  const [snapToGrid, setSnapToGrid] = useState<boolean>(true);
  const [gridSettingsOpen, setGridSettingsOpen] = useState<boolean>(true);

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
    opts: {
      fallbackName?: string;
      fallbackId?: string;
      source: SavedTemplateV1["source"];
    },
  ): SavedTemplateV1 | null => {
    try {
      const parsed = parseTemplateJson(raw?.json ?? raw);

      // If parsed is already our structure
      const base =
        parsed && typeof parsed === "object" && !Array.isArray(parsed)
          ? parsed
          : {};

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
        elements: Array.isArray(elementsFromParsed)
          ? (elementsFromParsed as any)
          : [],
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

  // Helper function to extract aspect ratio from template name (e.g., "1280x720" -> "16:9")
  const getAspectRatioFromTemplateName = (name: string): string | null => {
    // Try to match dimensions pattern like "1280x720"
    const match = name.match(/(\d+)x(\d+)/);
    if (!match) return null;

    const width = parseInt(match[1], 10);
    const height = parseInt(match[2], 10);

    // Calculate GCD to simplify ratio
    const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
    const divisor = gcd(width, height);

    return `${width / divisor}:${height / divisor}`;
  };

  // Filter templates by current aspect ratio
  const templatesForCurrentRatio = savedTemplates.filter((tpl) => {
    return tpl.aspectRatio === aspectRatio;
  });

  const refreshSavedTemplates = async () => {
    setIsTemplatesLoading(true);
    try {
      // 1) Local templates (fallback/offline)
      const localTemplates: SavedTemplateV1[] =
        readTemplatesFromLocalStorage().map((t) => ({
          ...t,
          source: "local",
        }));

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
                canvasDimensions:
                  legacyParsed.canvasDimensions || canvasDimensions,
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
            }),
          )
          .filter(Boolean) as SavedTemplateV1[];

        remoteGlobal = globalRaw
          .map((item: any) =>
            normalizeSavedTemplate(item, {
              fallbackName: (item?.name as string) || "Global Template",
              fallbackId: item?.id as string,
              source: "global",
            }),
          )
          .filter(Boolean) as SavedTemplateV1[];
      } catch (error) {
        console.warn(
          "⚠️ Failed to fetch templates from server, using local only",
          error,
        );
      }

      const merged = [...remoteUser, ...remoteGlobal, ...localTemplates];

      setSavedTemplates(merged);
      setSelectedTemplateId((prev) => {
        if (merged.length === 0) return "";
        if (prev && merged.some((t) => t.id === prev)) return prev;
        return merged[0].id;
      });
    } finally {
      setIsTemplatesLoading(false);
    }
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
      const pixelRatio = Math.max(
        0.05,
        THUMBNAIL_WIDTH / canvasDimensions.width,
      );

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
    setIsSaving(true);
    try {
      const name = templateName.trim() || `Template ${new Date().toISOString()}`;

      const templates = readTemplatesFromLocalStorage();
      const existing = templates.find(
        (t) => t.name.toLowerCase() === name.toLowerCase(),
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
        console.warn(
          "⚠️ Failed to save template to server, saving locally",
          error,
        );
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
          const remote = prev.filter(
            (t) => t.source === "user" || t.source === "global",
          );
          return [
            ...remote,
            ...next.map((t) => ({ ...t, source: "local" as const })),
          ];
        });
        setSelectedTemplateId(payload.id);

        console.log("✅ Template saved to localStorage", payload);
      } catch (error) {
        console.error("❌ Failed to save template to localStorage", error);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const updateTemplateById = async () => {
    if (!selectedTemplateId) {
      console.log("❌ No template selected to update");
      return;
    }

    setIsSaving(true);
    try {
      const name = templateName.trim() || `Template ${new Date().toISOString()}`;

      const payload: SavedTemplateV1 = {
        version: 1,
        id: selectedTemplateId,
        name,
        savedAt: new Date().toISOString(),
        aspectRatio,
        canvasDimensions,
        elements,
        lockedElementIds: Array.from(lockedElements),
        thumbnailDataUrl: createTemplateThumbnailDataUrl(),
        source: "user",
      };

      // Try updating on server first
      try {
        await templateService.updateTemplate(selectedTemplateId, {
          name,
          json: payload,
          isPublic: saveAsGlobal ? true : undefined,
        });
        console.log("✅ Template updated on server", selectedTemplateId);
        await refreshSavedTemplates();
        return;
      } catch (error) {
        console.warn(
          "⚠️ Failed to update template on server, updating locally",
          error,
        );
      }

      // Fallback: update locally
      try {
        const templates = readTemplatesFromLocalStorage();
        const updated = templates.map((t) =>
          t.id === selectedTemplateId ? payload : t
        );

        writeTemplatesToLocalStorage(updated);
        setTemplateName(name);
        setSavedTemplates((prev) => {
          // keep any remote templates already loaded
          const remote = prev.filter(
            (t) => t.source === "user" || t.source === "global",
          );
          return [
            ...remote,
            ...updated.map((t) => ({ ...t, source: "local" as const })),
          ];
        });

        console.log("✅ Template updated in localStorage", payload);
      } catch (error) {
        console.error("❌ Failed to update template in localStorage", error);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const selectTemplateById = (id: string) => {
    setSelectedTemplateId(id);
    const tpl = savedTemplates.find((t) => t.id === id);
    if (tpl) setTemplateName(tpl.name);
  };

  // Helper function to apply profile bindings to elements
  const applyProfileBindings = (elementsToUpdate: TemplateElement[]) => {
    console.log("🔄 applyProfileBindings called");
    console.log("📊 Profile data:", profileBindingData);
    console.log("📌 Elements to update:", elementsToUpdate);

    return elementsToUpdate.map((el) => {
      const updated = { ...el };

      if (el.name) {
        console.log(`Processing binding: name="${el.name}", type="${el.type}"`);

        if (el.name === "logo" && el.type === "logo") {
          if (profileBindingData.logo) {
            (updated as any).src = profileBindingData.logo;
            console.log("✅ Applied logo binding:", profileBindingData.logo);
          }
        } else if (el.type === "text" && profileBindingData[el.name]) {
          updated.content = profileBindingData[el.name];
          console.log(
            `✅ Applied text binding for ${el.name}:`,
            profileBindingData[el.name],
          );
        }
      }

      return updated;
    });
  };

  const loadTemplateById = (id: string) => {
    try {
      const tpl = savedTemplates.find((t) => t.id === id);
      if (!tpl) {
        console.warn("⚠️ Template not found", id);
        return;
      }

      // Normalize elements and filter out background-image
      const normalizedElements = tpl.elements
        .filter((el) => el.id !== "background-image")
        .map((el, index) => ({
          ...el,
          zIndex: el.zIndex !== undefined ? el.zIndex : index,
        }));

      // Apply profile bindings immediately
      const elementsWithBindings = applyProfileBindings(normalizedElements);

      // Preserve background image if it exists
      setElements((prevElements) => {
        const backgroundElement = prevElements.find(
          (el) => el.id === "background-image",
        );
        const newElements = backgroundElement
          ? [backgroundElement, ...elementsWithBindings]
          : elementsWithBindings;
        return newElements;
      });

      setLockedElements(new Set(tpl.lockedElementIds || []));
      setSelectedElement(null);
      setSelectedTemplateId(tpl.id);
      setTemplateName(tpl.name);

      // Adjust logo placeholders for all logo elements in the template
      elementsWithBindings.forEach((element: TemplateElement) => {
        if (element.type === "logo") {
          const logoElement = element as LogoElement;
          const src = (logoElement as any).src;
          
          if (src) {
            console.log("📐 Adjusting logo placeholder for template element:", logoElement.id);
            
            // Load image to get aspect ratio and adjust placeholder
            const img = new Image();
            img.onload = () => {
              const imageAspect = img.width / img.height;
              const fixedWidth = logoElement.width;
              const newHeight = fixedWidth / imageAspect;
              
              console.log("📐 Logo aspect ratio from template:", {
                imageDimensions: `${img.width}x${img.height}`,
                imageAspect: imageAspect.toFixed(2),
                fixedWidth,
                currentHeight: logoElement.height,
                newHeight: newHeight.toFixed(0),
              });
              
              // Update the element height
              updateElementById(logoElement.id, { height: newHeight });
              
              // Add to logo cache
              setLogoImages((prev) => ({
                ...prev,
                [src]: img,
              }));
              
              // Trigger redraw
              setTimeout(() => {
                setLogoImages((prev) => ({ ...prev }));
              }, 50);
            };
            
            img.onerror = (error) => {
              console.error("❌ Failed to load logo image for template:", src, error);
            };
            
            // Set crossOrigin for external URLs
            if (
              !src.startsWith("blob:") &&
              !src.startsWith("data:")
            ) {
              img.crossOrigin = "anonymous";
            }
            
            img.src = src;
          }
        }
      });

      console.log("✅ Template loaded:", elementsWithBindings);
    } catch (error) {
      console.error("❌ Failed to load template:", error);
    }
  };

  const deleteTemplateById = async (id: string) => {
    setIsDeleting(true);
    try {
      const tpl = savedTemplates.find((t) => t.id === id);
      if (!tpl) {
        console.warn("⚠️ Template not found", id);
        setIsDeleting(false);
        return;
      }

      console.log("🗑️ Attempting to delete template:", { id, source: tpl.source, name: tpl.name });

      // Server-side deletion for user templates and attempt API first for local templates
      console.log("🛰️ Calling templateService.deleteTemplate for id:", id, "source:", tpl.source);

      if (tpl.source === "global" && !saveAsGlobal) {
        console.warn("⚠️ Delete not supported for global templates");
        setIsDeleting(false);
        return;
      }

      try {
        const deleteResponse = await templateService.deleteTemplate(id);
        console.log("✅ templateService.deleteTemplate response:", deleteResponse);
      } catch (apiError) {
        console.error("❌ templateService.deleteTemplate failed:", apiError);

        // If it's a local template, remove from local storage as a fallback
        if (tpl.source === "local" || tpl.source === "user" ||  (saveAsGlobal && tpl.source === "global")) {
          try {
            const templates = readTemplatesFromLocalStorage();
            const next = templates.filter((t) => t.id !== id);
            writeTemplatesToLocalStorage(next);
            console.log("✅ Local template deleted from storage (API fallback)", id);
          } catch (localErr) {
            console.error("❌ Failed to remove local template as fallback:", localErr);
            throw apiError; // surface original API error
          }
        } else {
          // For user templates, bubble API error so we can inform the user
          throw apiError;
        }
      }

      console.log("🗑️ Template deletion successful, reloading templates...", id);
      
      // Reload templates after deletion
      await refreshSavedTemplates();
      console.log("✅ Templates reloaded after deletion");
    } catch (error) {
      console.error("❌ Failed to delete template", error);
      alert("Failed to delete template. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const navigate = useNavigate();
  const { showConfirm, closeConfirm } = useConfirmDialog();

  // Check if there's unsaved changes
  const hasUnsavedChanges = () => {
    return (
      (elements?.length ?? 0) > 1 ||
      !!selectedElement ||
      (templateName?.trim?.()?.length ?? 0) > 0 ||
      isSaving ||
      logoUploading
    );
  };

  // Create a navigation wrapper that checks for unsaved content
  const navigateWithConfirm = (path: string) => {
    if (hasUnsavedChanges()) {
      showConfirm(
        t("confirm_navigation") || "Confirm",
        t("unsaved_changes_warning") ||
          "You have unsaved changes. Are you sure you want to leave?",
        () => {
          closeConfirm();
          navigate(path);
        },
      );
    } else {
      navigate(path);
    }
  };

  // Guard navigation when there are unsaved changes
  useNavigationGuard({
    isActive: hasUnsavedChanges(),
    title: t("confirm_navigation") || "Confirm Navigation",
    message:
      t("unsaved_changes_warning") ||
      "You have unsaved changes. Are you sure you want to leave?",
  });

  // Intercept all navigation attempts (including link clicks and React Router links)
  useEffect(() => {
    const handleClickCapture = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Check for both regular links and React Router Link components
      const link = target.closest("a") as HTMLAnchorElement;

      if (link && hasUnsavedChanges()) {
        // Only intercept internal links (not external URLs and not downloads)
        const href = link.getAttribute("href");
        if (href && !href.includes("://") && !link.download) {
          e.preventDefault();
          e.stopPropagation();
          showConfirm(
            t("confirm_navigation") || "Confirm",
            t("unsaved_changes_warning") ||
              "You have unsaved changes. Are you sure you want to leave?",
            () => {
              closeConfirm();
              navigate(href);
            },
          );
        }
      }
    };

    // Use capture phase to intercept before default behavior
    document.addEventListener("click", handleClickCapture, true);
    return () => {
      document.removeEventListener("click", handleClickCapture, true);
    };
  }, [hasUnsavedChanges, t, navigate, showConfirm, closeConfirm]);

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
    aspectRatioString: string,
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

  // Calculate scaled dimensions to fit image inside canvas while maintaining aspect ratio
  const getScaledDimensions = (
    imgWidth: number,
    imgHeight: number,
    canvasWidth: number,
    canvasHeight: number,
  ) => {
    // If image is smaller than canvas in both dimensions, keep original size
    if (imgWidth <= canvasWidth && imgHeight <= canvasHeight) {
      return { width: imgWidth, height: imgHeight };
    }

    const imgAspect = imgWidth / imgHeight;
    const canvasAspect = canvasWidth / canvasHeight;

    if (imgAspect > canvasAspect) {
      // Image is wider, scale by width
      const scaledWidth = canvasWidth;
      const scaledHeight = canvasWidth / imgAspect;
      return { width: scaledWidth, height: scaledHeight };
    } else {
      // Image is taller, scale by height
      const scaledHeight = canvasHeight;
      const scaledWidth = canvasHeight * imgAspect;
      return { width: scaledWidth, height: scaledHeight };
    }
  };

  type AnyElement = TextElement | LogoElement | ShapeElement;

  const updateElementById = useCallback(
    (id: string, updates: Partial<AnyElement>) => {
      setElements((prev) =>
        prev.map((el) => (el.id === id ? ({ ...el, ...updates } as any) : el)),
      );
    },
    [],
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
    [],
  );

  // Snap value to grid
  const snapToGridValue = useCallback(
    (value: number): number => {
      if (!snapToGrid || gridSize <= 0) return value;
      return Math.floor(value / gridSize) * gridSize;
    },
    [snapToGrid, gridSize],
  );

  useEffect(() => {
    const tr = transformerRef.current;
    if (!tr) return;

    if (!selectedElement) {
      tr.nodes([]);
      tr.getLayer()?.batchDraw();
      return;
    }

    if (lockedElements.has(selectedElement)) {
      tr.nodes([]);
      tr.getLayer()?.batchDraw();
      return;
    }

    // Try to find the node from the stage
    const stage = stageRef.current;
    if (stage) {
      const layer = stage.children?.[0];
      if (layer) {
        const node = layer.children?.find(
          (child: any) => child.id() === selectedElement,
        );
        if (node) {
          selectedNodeRef.current = node;
          tr.nodes([node]);
          tr.getLayer()?.batchDraw();
          return;
        }
      }
    }

    // Fallback to ref if direct lookup fails
    const node = selectedNodeRef.current;
    tr.nodes(node ? [node] : []);
    tr.getLayer()?.batchDraw();
  }, [selectedElement, elements, lockedElements]);

  useEffect(() => {
    const targetDimensions = calculateCanvasDimensions(aspectRatio);
    setCanvasDimensions(targetDimensions);

    const { zoom, maxZoom: maxZoomLevel } = calculateZoomLevel(
      targetDimensions.width,
      targetDimensions.height,
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

  // Update background image dimensions when image loads
  useEffect(() => {
    if (!imageDimensions) return;

    const { width, height } = getScaledDimensions(
      imageDimensions.width,
      imageDimensions.height,
      canvasDimensions.width,
      canvasDimensions.height,
    );

    setElements((prev) =>
      prev.map((el) =>
        el.id === "background-image" ? { ...el, width, height } : el,
      ),
    );
  }, [imageDimensions, canvasDimensions]);

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
    showSelection: boolean = true,
  ) => {
    if (!context.canvas) return;

    // Clear canvas
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    // Draw background image using "cover" behavior (crop from all sides to fill canvas)
    // Calculate scaling factor to cover the entire canvas
    const canvasAspect = context.canvas.width / context.canvas.height;
    const imageAspect = bgImage.width / bgImage.height;

    let drawWidth, drawHeight, sourceX, sourceY, sourceWidth, sourceHeight;

    if (imageAspect > canvasAspect) {
      // Image is wider than canvas - crop left/right edges
      drawWidth = context.canvas.width;
      drawHeight = context.canvas.height;
      sourceHeight = bgImage.height;
      sourceWidth = bgImage.height * canvasAspect; // Maintain canvas aspect ratio
      sourceX = (bgImage.width - sourceWidth) / 2; // Center horizontally
      sourceY = 0;
    } else {
      // Image is taller than canvas - crop top/bottom edges
      drawWidth = context.canvas.width;
      drawHeight = context.canvas.height;
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
      drawHeight, // Destination rectangle (on canvas)
    );

    // Draw elements sorted by zIndex
    const sortedElements = [...currentElements].sort(
      (a, b) => (a.zIndex || 0) - (b.zIndex || 0),
    );

    sortedElements.forEach((element) => {
      drawElement(context, element, showSelection);
    });
  };

  const redrawCanvasWithoutBackground = (
    context: CanvasRenderingContext2D,
    currentElements: TemplateElement[],
    showSelection: boolean = true,
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
    showSelection: boolean = true,
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
        element.height,
      );
      context.setLineDash([]);

      context.restore();
    }
  };

  const drawTextElement = (
    context: CanvasRenderingContext2D,
    element: TextElement,
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
          borderRadius,
        );
      } else {
        context.fillRect(
          element.x - element.width / 2 - padding,
          element.y - element.height / 2 - padding,
          element.width + padding * 2,
          element.height + padding * 2,
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
    element: LogoElement,
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
        element.height,
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
          element.borderRadius,
        );
        context.stroke();
      } else {
        context.strokeRect(
          element.x - element.width / 2,
          element.y - element.height / 2,
          element.width,
          element.height,
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

        // Draw image to fill the entire placeholder (dimensions already adjusted for aspect ratio)
        const x = element.x - element.width / 2;
        const y = element.y - element.height / 2;

        context.drawImage(
          logoImg,
          x,
          y,
          element.width,
          element.height,
        );
      } else {
        console.log(
          "🔄 Logo image not in cache, attempting to load:",
          element.src,
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
              element.src,
            );
            
            // Keep width fixed, adjust height based on image aspect ratio
            const imageAspect = img.width / img.height;
            const fixedWidth = element.width;
            const newHeight = fixedWidth / imageAspect;
            
            console.log("📐 Adjusting height based on image aspect ratio:", {
              imageDimensions: `${img.width}x${img.height}`,
              imageAspect: imageAspect.toFixed(2),
              fixedWidth,
              oldHeight: element.height,
              newHeight: newHeight.toFixed(0),
            });
            
            // Update element height only
            updateElementById(element.id, { 
              height: newHeight
            });
            
            setLogoImages((prev) => {
              const newLogoImages = { ...prev };
              // Remove loading marker and add actual image
              delete newLogoImages[`loading-${element.src}`];
              newLogoImages[element.src!] = img;
              console.log(
                "📊 Updated logoImages cache:",
                Object.keys(newLogoImages),
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
          element.height,
        );

        // Draw loading border
        context.strokeStyle = "#3b82f6";
        context.lineWidth = 2;
        context.setLineDash([4, 4]);
        context.strokeRect(
          element.x - element.width / 2,
          element.y - element.height / 2,
          element.width,
          element.height,
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
    element: ShapeElement,
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
            element.borderRadius,
          );
        } else {
          context.fillRect(
            element.x - element.width / 2,
            element.y - element.height / 2,
            element.width,
            element.height,
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
          Math.PI * 2,
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
    radius: number,
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
      y + height,
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

  // Reset element dimensions to original size
  const resetElementDimensions = () => {
    if (!selectedElement) return;

    const element = elements.find((el) => el.id === selectedElement);
    if (
      !element ||
      element.type !== "logo" ||
      element.id === "background-image"
    )
      return;

    const logoElement = element as LogoElement;
    if (!logoElement.src) return;

    const img = logoImages[logoElement.src];
    if (!img) return;

    // Use scaled dimensions to fit inside canvas while maintaining aspect ratio
    const { width: newWidth, height: newHeight } = getScaledDimensions(
      img.width,
      img.height,
      canvasDimensions.width,
      canvasDimensions.height,
    );

    updateSelectedElement({
      width: newWidth,
      height: newHeight,
    });
  };

  // Keyboard movement for selected element
  useEffect(() => {
    if (!selectedElement) return;

    const handleKeyboardMove = (e: KeyboardEvent) => {
      const element = elements.find((el) => el.id === selectedElement);
      if (!element || isElementLocked(element.id)) return;

      let dx = 0;
      let dy = 0;

      switch (e.key) {
        case "ArrowUp":
          dy = -gridSize;
          e.preventDefault();
          break;
        case "ArrowDown":
          dy = gridSize;
          e.preventDefault();
          break;
        case "ArrowLeft":
          dx = -gridSize;
          e.preventDefault();
          break;
        case "ArrowRight":
          dx = gridSize;
          e.preventDefault();
          break;
        default:
          return;
      }

      const newX = snapToGridValue(element.x + dx);
      const newY = snapToGridValue(element.y + dy);
      updateElementById(element.id, { x: newX, y: newY });
    };

    window.addEventListener("keydown", handleKeyboardMove);
    return () => {
      window.removeEventListener("keydown", handleKeyboardMove);
    };
  }, [
    selectedElement,
    elements,
    gridSize,
    snapToGridValue,
    updateElementById,
    isElementLocked,
  ]);

  // Generic function to get coordinates from mouse or touch events (accounting for zoom)
  const getEventCoordinates = (
    e:
      | React.MouseEvent<HTMLCanvasElement>
      | React.TouchEvent<HTMLCanvasElement>,
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
        (a, b) => (b.zIndex || 0) - (a.zIndex || 0),
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
        })),
      );

      setSelectedElement(clickedElement.id);
      setPropertiesOpen(true);
      setTemplatesOpen(false);
      setElementsOpen(false);
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
      }),
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
          let updatedElement = { ...element, ...updates };

          // If name/binding was changed, auto-populate with profile data
          if (updates.name && element.type === "text") {
            const fieldValue = profileBindingData[updates.name];
            if (fieldValue) {
              updatedElement = { ...updatedElement, content: fieldValue };
              console.log(
                `✅ Auto-populated text with profile field '${updates.name}': ${fieldValue}`,
              );
            }
          }

          // If binding logo element to logo field, set the src to the image URL
          if (updates.name === "logo" && element.type === "logo") {
            const logoUrl = profileBindingData.logo;
            if (logoUrl) {
              updatedElement = { ...updatedElement, src: logoUrl };
              console.log(
                `✅ Auto-populated logo element with brandLogo URL: ${logoUrl}`,
              );
            } else {
              console.warn("⚠️ No logo URL found in profile data");
            }
          }

          console.log("✅ Element updated:", updatedElement);
          return updatedElement;
        }
        return element;
      }),
    );
  };

  // Layer management functions
  const bringToFront = () => {
    if (!selectedElement) return;
    // Sort elements by zIndex
    const sorted = [...elements].sort(
      (a, b) => (a.zIndex || 0) - (b.zIndex || 0),
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
      (a, b) => (a.zIndex || 0) - (b.zIndex || 0),
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

    // Prevent deletion of background image
    if (selectedElement === "background-image") {
      console.log("⚠️ Cannot delete background image");
      return;
    }

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
    // Directly trigger file input instead of creating empty element
    addElementLogoInputRef.current?.click();
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
      file.name,
    );
    setLogoUploading(true);
    try {
      const user = await getCurrentUser();
      if (user?.user?.id) {
        console.log("📤 Uploading logo to server...");
        const logoUrl = await uploadMedia(file, user.user?.id);
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
      // Check if there's a selected logo element - if so, update it instead of creating new
      const selectedLogoElement =
        selectedElement &&
        elements.find((el) => el.id === selectedElement && el.type === "logo");

      if (selectedLogoElement) {
        // Update existing selected logo element - do not scale
        handleLogoUploadWithId(file, selectedElement, false);
      } else {
        // Create new logo element - scale to fit
        const cw = canvasDimensions.width;
        const ch = canvasDimensions.height;
        if (!cw || !ch) return;

        // Use responsive sizing based on canvas dimensions
        const size = Math.min(80, cw * 0.1);

        const nextZ = elements.length
          ? Math.max(...elements.map((el) => el.zIndex || 0)) + 1
          : 0;

        const newElementId = `logo-${Date.now()}`;
        const newElement: LogoElement = {
          id: newElementId,
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
        setSelectedElement(newElementId);

        // Upload the image with the new element ID - scale it
        handleLogoUploadWithId(file, newElementId, true);
      }
    }
    // Reset file input
    if (e.target) e.target.value = "";
  };

  const handleLogoUploadWithId = async (
    file: File,
    elementId: string,
    isNewElement: boolean = true,
  ) => {
    console.log(
      "🚀 Starting logo upload for element:",
      elementId,
      "File:",
      file.name,
      "Is new element:",
      isNewElement,
    );
    setLogoUploading(true);

    // First, load the image to get its dimensions
    const img = new Image();
    img.onload = async () => {
      console.log("📏 Image loaded, dimensions:", img.width, "x", img.height);

      // Calculate dimensions based on whether it's a new element or update
      let finalWidth: number;
      let finalHeight: number;

      if (isNewElement) {
        // For new elements (from toolbar), scale to fit within canvas
        const { width: scaledWidth, height: scaledHeight } =
          getScaledDimensions(
            img.width,
            img.height,
            canvasDimensions.width,
            canvasDimensions.height,
          );
        finalWidth = scaledWidth;
        finalHeight = scaledHeight;
        console.log(
          "📐 Scaled dimensions for new element:",
          finalWidth,
          "x",
          finalHeight,
        );
      } else {
        // For existing elements (from properties panel), retain current scale/dimensions
        const currentElement = elements.find((el) => el.id === elementId);
        if (currentElement) {
          finalWidth = currentElement.width;
          finalHeight = currentElement.height;
          console.log(
            "📐 Retained current dimensions for existing element:",
            finalWidth,
            "x",
            finalHeight,
          );
        } else {
          // Fallback to original dimensions if element not found
          finalWidth = img.width;
          finalHeight = img.height;
          console.log(
            "📐 Fallback to original dimensions:",
            finalWidth,
            "x",
            finalHeight,
          );
        }
      }

      try {
        const user = await getCurrentUser();
        if (user?.user?.id) {
          console.log("📤 Uploading logo to server...");
          const logoUrl = await uploadMedia(file, user.user?.id);
          console.log("✅ Logo uploaded successfully:", logoUrl);
          
          // Adjust height based on image aspect ratio
          const imageAspect = img.width / img.height;
          const fixedWidth = finalWidth;
          const adjustedHeight = fixedWidth / imageAspect;
          
          console.log("📐 Adjusting logo height based on image aspect ratio:", {
            imageDimensions: `${img.width}x${img.height}`,
            imageAspect: imageAspect.toFixed(2),
            fixedWidth,
            originalHeight: finalHeight,
            adjustedHeight: adjustedHeight.toFixed(0),
          });
          
          setElements((prev) =>
            prev.map((el) =>
              el.id === elementId
                ? {
                    ...el,
                    src: logoUrl,
                    width: fixedWidth,
                    height: adjustedHeight,
                  }
                : el,
            ),
          );
          
          // Add to logo cache
          setLogoImages((prev) => ({
            ...prev,
            [logoUrl]: img,
          }));
        } else {
          // Fallback to local URL
          console.log("🔄 No user found, using local URL fallback");
          const localUrl = URL.createObjectURL(file);
          console.log("📎 Created local URL:", localUrl);
          
          // Adjust height based on image aspect ratio
          const imageAspect = img.width / img.height;
          const fixedWidth = finalWidth;
          const adjustedHeight = fixedWidth / imageAspect;
          
          console.log("📐 Adjusting logo height based on image aspect ratio:", {
            imageDimensions: `${img.width}x${img.height}`,
            imageAspect: imageAspect.toFixed(2),
            fixedWidth,
            originalHeight: finalHeight,
            adjustedHeight: adjustedHeight.toFixed(0),
          });
          
          setElements((prev) =>
            prev.map((el) =>
              el.id === elementId
                ? {
                    ...el,
                    src: localUrl,
                    width: fixedWidth,
                    height: adjustedHeight,
                  }
                : el,
            ),
          );
          
          // Add to logo cache
          setLogoImages((prev) => ({
            ...prev,
            [localUrl]: img,
          }));
        }
      } catch (error) {
        console.error("❌ Error uploading logo:", error);
        // Fallback to local URL
        console.log("🔄 Using local URL fallback due to upload error");
        const localUrl = URL.createObjectURL(file);
        console.log("📎 Created fallback local URL:", localUrl);
        
        // Adjust height based on image aspect ratio
        const imageAspect = img.width / img.height;
        const fixedWidth = finalWidth;
        const adjustedHeight = fixedWidth / imageAspect;
        
        console.log("📐 Adjusting logo height based on image aspect ratio:", {
          imageDimensions: `${img.width}x${img.height}`,
          imageAspect: imageAspect.toFixed(2),
          fixedWidth,
          originalHeight: finalHeight,
          adjustedHeight: adjustedHeight.toFixed(0),
        });
        
        setElements((prev) =>
          prev.map((el) =>
            el.id === elementId
              ? { ...el, src: localUrl, width: fixedWidth, height: adjustedHeight }
              : el,
          ),
        );
        
        // Add to logo cache
        setLogoImages((prev) => ({
          ...prev,
          [localUrl]: img,
        }));
      } finally {
        setLogoUploading(false);
        console.log("🏁 Logo upload process completed");
      }
    };

    img.onerror = () => {
      console.error("❌ Failed to load image for dimension calculation");
      setLogoUploading(false);
    };

    // Start loading the image
    const localUrl = URL.createObjectURL(file);
    img.src = localUrl;
  };

  const exportImage = async () => {
    const stage = stageRef.current;
    if (!stage) return;

    setIsSaving(true);

    // Hide transformer/selection UI from export
    const tr = transformerRef.current;
    const wasVisible = tr ? tr.visible() : false;
    const gridWasVisible = showGrid;

    try {
      // Clear selection and hide transformer and grid
      setSelectedElement(null);
      selectedNodeRef.current = null;
      setShowGrid(false);
      tr?.hide();

      // Force a render cycle to ensure grid is hidden and transformer is gone
      await new Promise((resolve) => setTimeout(resolve, 100));

      const exportCanvas = stage.toCanvas({ pixelRatio: 2 });
      const targetWidth =  aspectRatio== "16:9" ? 1280 : aspectRatio== "9:16" ? 720 : 1024;
      const targetHeight =  aspectRatio== "9:16" ? 1280 : aspectRatio== "16:9" ? 720 : 1024;
      const blob = await new Promise<Blob | null>((resolve) => {
        exportCanvas.toBlob((b) => resolve(b), "image/png", 1);
      });

      console.log(blob)
      if (!blob) throw new Error("Failed to create image blob");

      // Create local URL for immediate preview
     
    
    let newBlob = await optimizeThumbnail(blob, targetWidth, targetHeight, 1.98 * 1024 * 1024) as Blob;
     let localUrl = URL.createObjectURL(newBlob);

      // Upload to server for persistent storage
      const user = await getCurrentUser();
      if (user?.user?.id) {
        try {
          const file = new File([newBlob], `template-${Date.now()}.png`, {
            type: "image/png",
            lastModified: Date.now(),
          });

          const uploadedUrl = await uploadMedia(file, user.user?.id);
          onSave(uploadedUrl);
        } catch (uploadError) {
          console.warn(
            "Failed to upload template image, using local URL:",
            uploadError,
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
      }
      if (gridWasVisible) {
        setShowGrid(true);
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
    <div className="fixed inset-0 bg-white z-50 flex flex-col-reverse md:flex-row md:w-[99vw]">
      <div
        className={`w-full  md:w-[25vw] md:min-w-[25vw] md:max-w-[25vw] ${
          aspectRatio === "1:1" ? "h-[50vh]" : ""
        } ${aspectRatio === "16:9" ? "h-[60vh]" : ""} ${
          aspectRatio === "9:16" ? "h-[50vh]" : ""
        }  md:h-full bg-white border-b md:border-b-0 md:border-r border-gray-200 flex flex-col`}
      >
        <div className="flex w-full overflow-y-auto p-3 md:p-4 min-h-0">
          <div className="space-y-1 pb-20 overflow-y-auto h-[50vh] md:h-auto md:pb-2 md:overflow-hidden  md:space-y-4 w-full">
            {/* Clear All Elements */}
            {
              <div className="flex items-center justify-between ">
                <label className="flex items-center gap-1 text-xs text-slate-700 select-none">
                  <input
                    type="checkbox"
                    checked={showGrid}
                    onChange={(e) => {
                      setShowGrid(e.target.checked);
                      setSnapToGrid(true);
                      // When grid is on, ensure minimum 5px; when off, snap to 1 pixel
                      if (e.target.checked) {
                        if (gridSize < 5) {
                          setGridSize(5);
                        }
                      } else {
                        setGridSize(1);
                      }
                    }}
                    className="h-4 w-4"
                  />
                  {t("show_grid")}
                </label>
                {showGrid && (
                  <div className="flex items-center gap-1 pl-1 pr-3 w-full"> 
                    <input
                      type="range"
                      min="1"
                      max="100"
                      step="1"
                      value={gridSize}
                      onChange={(e) => setGridSize(parseInt(e.target.value))}
                      className="w-full  template-range mr-0"
                    />
                    <span className="text-xs text-gray-600 font-medium ">
                      {gridSize}px
                    </span> 
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <button
                    onClick={clearAllElements}
                    className="inline-flex items-center justify-center gap-1 p-1.5 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors text-xs font-medium"
                    title={t("delete_all_elements")}
                    type="button"
                  >
                    <Trash className="w-3 h-3" />
                    <span>{t("clear_all")}</span>
                  </button>

                  <button
                    onClick={handleUndo}
                    disabled={!canUndo}
                    className="inline-flex items-center justify-center gap-1 p-1 bg-white text-[#7650e3] border border-[#7650e3] rounded-md hover:bg-[#d7d7fc] disabled:opacity-50 transition-colors text-xs font-medium"
                    title={t("undo")}
                    type="button"
                  >
                    <Undo className="w-3 h-3" />
                  </button>

                  <button
                    onClick={handleRedo}
                    disabled={!canRedo}
                    className="inline-flex items-center justify-center gap-1 p-1 bg-white text-[#7650e3] border border-[#7650e3] rounded-md hover:bg-[#d7d7fc] disabled:opacity-50 transition-colors text-xs font-medium"
                    title={t("redo")}
                    type="button"
                  >
                    <Redo className="w-3 h-3" />
                  </button>
                </div>
              </div>
            }

            {/* Templates Section */}
            <div className="border border-gray-200 rounded-md p-2 md:p-3 bg-white flex flex-col max-h-[40vh]">
              <button
                type="button"
                onClick={() => setTemplatesOpen((prev) => !prev)}
                className="w-full flex items-center justify-between flex-shrink-0"
              >
                <h4 className="text-xs md:text-sm font-semibold text-slate-700">
                  {t("templates")}
                </h4>
                {templatesOpen ? (
                  <ChevronUp className="w-4 h-4 text-slate-600" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-600" />
                )}
              </button>

              {templatesOpen && (
                <div className="mt-2 space-y-2 flex flex-col min-h-0 flex-1 relative">
                  {/* Loader overlay */}
                  {(isTemplatesLoading || isSaving || isDeleting) && (
                    <div className="absolute inset-0 z-10 bg-white/70 backdrop-blur-[1px] rounded-md flex items-center justify-center">
                      <div className="flex items-center gap-2 text-sm text-slate-700">
                        <span className="h-4 w-4 rounded-full border border-slate-300 border-t-purple-600 animate-spin" />
                        {isDeleting ? t("deleting") : isSaving ? t("saving") : t("loading_templates")}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-[1fr_auto] items-center gap-2 flex-shrink-0">
                    <input
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      placeholder={t("template_name")}
                      className="w-full min-w-0 px-3 h-8 border border-gray-300 rounded-md text-sm"
                      disabled={isTemplatesLoading}
                    />
                    <button
                      onClick={() => void saveCurrentTemplate()}
                      className="h-8 bg-purple-600 text-white font-medium flex items-center gap-2 justify-center px-3 rounded-md border border-purple-600 hover:bg-[#d7d7fc] hover:text-[#7650e3] whitespace-nowrap disabled:opacity-60"
                      title={
                        saveAsGlobal
                          ? t("save_template_global")
                          : t("save_template_personal")
                      }
                      type="button"
                      disabled={isTemplatesLoading || isSaving}
                    >
                      <Download className="w-4 h-4" />
                      <span className="text-sm">{t("save")}</span>
                    </button>
                  </div>
                  {/* isGlobal check start */}
                 {isTemplateEditing && <label className="flex items-center gap-2 text-xs text-slate-700 select-none flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={saveAsGlobal}
                    onChange={(e) => setSaveAsGlobal(e.target.checked)}
                    className="h-4 w-4"
                    disabled={isTemplatesLoading}
                  />
                  Global
                </label>}

                {isTemplateEditing && <button
                      onClick={() => void updateTemplateById()}
                      className="h-8 bg-purple-600 text-white font-medium flex items-center gap-2 justify-center px-3 rounded-md border border-purple-600 hover:bg-[#d7d7fc] hover:text-[#7650e3] whitespace-nowrap disabled:opacity-60"
                      title={
                          t("update")
                        
                      }
                      type="button"
                      disabled={isTemplatesLoading || isSaving || !selectedTemplateId}
                    >
                      <LucideTabletSmartphone className="w-4 h-4" />
                      <span className="text-sm">{t("update")}</span>
                    </button>}
                {/* isGlobal check end */}

                  <div className="flex items-center justify-between flex-shrink-0">
                    <p className="text-xs text-gray-600 font-medium">
                      {t("saved_templates")}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => void refreshSavedTemplates()}
                        className="text-xs text-purple-600 font-medium hover:underline disabled:opacity-60 hidden "
                        type="button"
                        disabled={isTemplatesLoading}
                      >
                        {t("refresh")}
                      </button>
                      <button
                        onClick={() =>
                          selectedTemplateId &&
                          deleteTemplateById(selectedTemplateId)
                        }
                        disabled={
                          isTemplatesLoading ||
                          isDeleting ||
                          !selectedTemplateId 
                          ||
                        
                          (["global"].includes(
                            savedTemplates.find(
                              (t) => t.id === selectedTemplateId,
                            )?.source || "",
                          ) && !saveAsGlobal)
                        }
                        className="h-8 px-2 flex items-center justify-center rounded-md bg-red-100 hover:bg-red-200 disabled:opacity-50 text-xs text-red-700"
                        title={t("delete_template_tooltip")}
                        type="button"
                      >
                        <Trash className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {templatesForCurrentRatio.length === 0 ? (
                    <p className="text-xs text-gray-400">
                      {t("no_templates_saved_for", { aspectRatio })}
                    </p>
                  ) : (
                    <div className="space-y-2 overflow-y-auto min-h-0 flex-1">
                      <div className="grid grid-cols-2 gap-2">
                        {[...templatesForCurrentRatio]
                          .sort((a, b) => {
                            // Priority: user > global > local
                            const sourcePriority = {
                              user: 3,
                              global: 2,
                              local: 1,
                            };
                            const aPriority = sourcePriority[a.source] || 0;
                            const bPriority = sourcePriority[b.source] || 0;
                            if (aPriority !== bPriority) {
                              return bPriority - aPriority;
                            }
                            // Then sort by savedAt descending
                            return (b.savedAt || "").localeCompare(
                              a.savedAt || "",
                            );
                          })
                          .map((tpl) => (
                            <div
                              key={tpl.id}
                              onClick={() =>
                                !isTemplatesLoading && loadTemplateById(tpl.id)
                              }
                              className={`relative cursor-pointer rounded-md overflow-hidden border transition-all ${
                                selectedTemplateId === tpl.id
                                  ? "border-purple-600 bg-purple-50"
                                  : tpl.source === "global"
                                    ? "border-green-500 bg-green-50 hover:border-green-600"
                                    : "border-gray-200 bg-gray-50 hover:border-gray-300"
                              } ${isTemplatesLoading ? "pointer-events-none opacity-60" : ""}`}
                              title={`${
                                tpl.source === "global"
                                  ? t("template_label_global") + " - "
                                  : tpl.source === "user"
                                    ? t("template_label_my") + " - "
                                    : ""
                              }${tpl.name}`}
                            >
                              {tpl.thumbnailDataUrl ? (
                                <img
                                  src={tpl.thumbnailDataUrl}
                                  alt={tpl.name}
                                  className="w-full h-20 object-cover"
                                />
                              ) : (
                                <div className="w-full h-20 bg-gray-200 flex items-center justify-center text-xs text-gray-400">
                                  {t("no_preview")}
                                </div>
                              )}
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-1.5">
                                <p className="text-xs text-white font-semibold truncate drop-shadow-lg">
                                  {tpl.name}
                                </p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Element Creation Toolbar */}
            <div className="border border-gray-200 rounded-md p-2 md:p-3 bg-gray-50">
              <input
                ref={addElementLogoInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoFileChange}
                className="hidden"
              />
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
                  <div className="grid grid-cols-4 md:grid-cols-4 gap-1.5 md:gap-2">
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
                      title="Add Image"
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
                      <span className="text-xs font-medium">
                        {t("rectangle")}
                      </span>
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
              <div className="border border-gray-200 rounded-md p-2 mb-36 md:p-3 bg-gray-50">
                <button
                  type="button"
                  onClick={() => setPropertiesOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between"
                >
                  <h4 className="text-xs md:text-sm font-semibold text-slate-900">
                    {selectedElement === "background-image"
                      ? "Background "
                      : selectedElementData.type === "logo"
                        ? "Image"
                        : selectedElementData.type.charAt(0).toUpperCase() +
                          selectedElementData.type.slice(1)}{" "}
                    Element
                  </h4>
                  {propertiesOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-600" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-600" />
                  )}
                </button>

                {propertiesOpen && (
                  <>
                    <div className="flex items-center gap-1 mb-2 md:mb-3 mt-2 md:mt-3">
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
                        {selectedElementData.type === "logo" && (
                          <button
                            onClick={resetElementDimensions}
                            className="p-2 rounded-md bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                            title="Reset to Original Size"
                            type="button"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                        {selectedElement !== "background-image" && (
                          <button
                            onClick={deleteSelectedElement}
                            className="p-2 rounded-md bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                            title="Delete"
                            type="button"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Layer Order Buttons - Spread across remaining space */}
                      <div className="flex items-center gap-1 flex-1 justify-between">
                        <button
                          onClick={bringToFront}
                          className="w-full p-2 bg-gray-100 text-gray-500 font-medium rounded-md hover:bg-gray-200 flex items-center justify-center transition-colors text-xs"
                          title={t("bring_to_front")}
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={moveUp}
                          className="w-full p-2 bg-gray-100 text-gray-500 font-medium rounded-md hover:bg-gray-200 flex items-center justify-center transition-colors text-xs"
                          title={t("move_up")}
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={moveDown}
                          className="w-full p-2 bg-gray-100 text-gray-500 font-medium rounded-md hover:bg-gray-200 flex items-center justify-center transition-colors text-xs"
                          title={t("move_down")}
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={sendToBack}
                          className="w-full p-2 bg-gray-100 text-gray-500 font-medium rounded-md hover:bg-gray-200 flex items-center justify-center transition-colors text-xs"
                          title={t("send_to_back")}
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Profile Field Binding - Logo elements only (excluding background) */}
                    {isTemplateEditing &&
                      selectedElementData.type === "logo" && selectedElement !== "background-image" && (
                        <div className="mb-2 md:mb-3">
                          <label className="block text-xs md:text-sm font-medium text-slate-700 mb-1.5 md:mb-2">
                            Bind to Profile Field
                          </label>
                          <select
                            value={selectedElementData.name || ""}
                            onChange={(e) =>
                              updateSelectedElement({
                                name: e.target.value || undefined,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs md:text-sm"
                          >
                            <option value="">No binding</option>
                            <option value="logo">Logo</option>
                          </select>
                          {/* Show preview of bound data */}
                          {selectedElementData.name && (
                            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                              <p className="font-medium text-blue-900 mb-1">
                                Preview:
                              </p>
                              {selectedElementData.type === "logo" && (
                                <div>
                                  { isTemplateEditing && profileBindingData.logo ? (
                                    <>
                                      <p className="text-blue-700 mb-1">
                                        Logo URL:
                                      </p>
                                      <p className="text-blue-600 break-all text-xs font-mono max-h-12 overflow-y-auto">
                                        {profileBindingData.logo}
                                      </p>
                                    </>
                                  ) : (
                                    <p className="text-blue-700">
                                      (no logo in profile)
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            Logo will auto-populate from profile
                          </p>
                        </div>
                      )
                    }
                    {/* Text Content last */}
                    {selectedElementData.type === "text" && (
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
                          rows={2}
                          placeholder="Enter your text..."
                        />
                      </div>
                    )}
                    {/* Profile Field Binding - Text elements */}
                    {
                      selectedElementData.type === "text" && (
                        <div className="mb-2 md:mb-3">
                          <label className="block text-xs md:text-sm font-medium text-slate-700 mb-1.5 md:mb-2">
                            Bind to Profile Field
                          </label>
                          <select
                            value={selectedElementData.name || ""}
                            onChange={(e) =>
                              updateSelectedElement({
                                name: e.target.value || undefined,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs md:text-sm"
                          >
                            <option value="">No binding</option>
                            <option value="email">Email</option>
                            <option value="website">Website</option>
                            <option value="brandName">Brand Name</option>
                            <option value="fullName">Full Name</option>
                            <option value="phoneNumber">Phone Number</option>
                          </select>
                          {/* Show preview of bound data */}
                          {selectedElementData.name && (
                            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                              <p className="font-medium text-blue-900 mb-1">
                                Preview:
                              </p>
                              <p className="text-blue-700 break-words truncate max-w-xs">
                                {profileBindingData[selectedElementData.name] ||
                                  "(empty)"}
                              </p>
                            </div>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            Element will auto-populate with profile data
                          </p>
                        </div>
                      )
                    }

                    {/* W H X Y Controls in one row */}
                    <div className="grid grid-cols-4 gap-1.5 md:gap-2 mb-2 md:mb-3 text-center">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1 text-center">
                          W
                        </label>
                        <input
                          type="number"
                          value={Math.round(selectedElementData.width ?? 0)}
                          onChange={(e) =>
                            updateSelectedElement({
                              width:
                                e.target.value === ""
                                  ? 0
                                  : Math.round(parseInt(e.target.value)),
                            })
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                          min="0"
                          disabled={isElementLocked(selectedElement)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1 text-center">
                          H
                        </label>
                        <input
                          type="number"
                          value={Math.round(selectedElementData.height ?? 0)}
                          onChange={(e) =>
                            updateSelectedElement({
                              height:
                                e.target.value === ""
                                  ? 0
                                  : Math.round(parseInt(e.target.value)),
                            })
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                          min="0"
                          disabled={isElementLocked(selectedElement)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1 text-center">
                          X
                        </label>
                        <input
                          type="number"
                          value={Math.round(selectedElementData.x ?? 0)}
                          onChange={(e) =>
                            updateSelectedElement({
                              x:
                                e.target.value === ""
                                  ? 0
                                  : Math.round(parseInt(e.target.value)),
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
                          value={Math.round(selectedElementData.y ?? 0)}
                          onChange={(e) =>
                            updateSelectedElement({
                              y:
                                e.target.value === ""
                                  ? 0
                                  : Math.round(parseInt(e.target.value)),
                            })
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                          disabled={isElementLocked(selectedElement)}
                        />
                      </div>
                    </div>

                    {selectedElementData.type === "logo" &&
                      selectedElement !== "background-image" && (
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
                                  <span>{t("uploading")}</span>
                                </>
                              ) : (
                                <>
                                  <Upload className="w-4 h-4" />
                                  <span>{t("upload_image")}</span>
                                </>
                              )}
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-2.5">
                            <div>
                              <label className="block text-sm font-medium text-slate-700">
                                Rotation
                              </label>
                              <input
                                type="range"
                                min="0"
                                max="360"
                                value={selectedElementData.rotation ?? 0}
                                onChange={(e) =>
                                  updateSelectedElement({
                                    rotation: parseInt(e.target.value),
                                  })
                                }
                                className="w-full template-range"
                                disabled={isElementLocked(selectedElement)}
                              />
                              <span className="text-sm text-gray-500 font-medium text-center block">
                                {selectedElementData.rotation || 0}°
                              </span>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700">
                                Opacity
                              </label>
                              <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={
                                  (selectedElementData as LogoElement)
                                    .opacity ?? 1
                                }
                                onChange={(e) =>
                                  updateSelectedElement({
                                    opacity: parseFloat(e.target.value),
                                  })
                                }
                                className="w-full template-range"
                              />
                              <span className="text-sm text-gray-500 font-medium text-center block">
                                {Math.round(
                                  ((selectedElementData as LogoElement)
                                    .opacity ?? 1) * 100,
                                )}
                                %
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                    {/* Background Image Controls - Rotation and Opacity only */}
                    {selectedElement === "background-image" && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-2.5">
                          <div>
                            <label className="block text-sm font-medium text-slate-700">
                              Rotation
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="360"
                              value={selectedElementData.rotation ?? 0}
                              onChange={(e) =>
                                updateSelectedElement({
                                  rotation: parseInt(e.target.value),
                                })
                              }
                              className="w-full template-range"
                              disabled={isElementLocked(selectedElement)}
                            />
                            <span className="text-sm text-gray-500 font-medium text-center block">
                              {selectedElementData.rotation || 0}°
                            </span>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700">
                              Opacity
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.01"
                              value={
                                (selectedElementData as LogoElement).opacity ??
                                1
                              }
                              onChange={(e) =>
                                updateSelectedElement({
                                  opacity: parseFloat(e.target.value),
                                })
                              }
                              className="w-full template-range"
                            />
                            <span className="text-sm text-gray-500 font-medium text-center block">
                              {Math.round(
                                ((selectedElementData as LogoElement).opacity ??
                                  1) * 100,
                              )}
                              %
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedElementData.type === "text" && (
                      <div className="space-y-3">
                        {/* Font Family and Text Color in same row */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                              Font Family
                            </label>
                            <select
                              value={
                                (selectedElementData as TextElement)
                                  .fontFamily ?? ""
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
                              <option value="Times New Roman">
                                Times New Roman
                              </option>
                              <option value="Georgia">Georgia</option>
                              <option value="Roboto">Roboto</option>
                              <option value="Open Sans">Open Sans</option>
                              <option value="Lato">Lato</option>
                              <option value="Montserrat">Montserrat</option>
                              <option value="Source Sans Pro">
                                Source Sans Pro
                              </option>
                              <option value="Poppins">Poppins</option>
                              <option value="Inter">Inter</option>
                              <option value="Playfair Display">
                                Playfair Display
                              </option>
                              <option value="Oswald">Oswald</option>
                              <option value="Merriweather">Merriweather</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                              Text Color
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
                              className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
                            />
                          </div>
                        </div>

                        {/* Size, Weight, Align, Padding */}
                        <div className="grid grid-cols-4 gap-2 mb-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">
                              Size (px)
                            </label>
                            <input
                              type="number"
                              value={Math.round(
                                (selectedElementData as TextElement).fontSize ??
                                  0,
                              )}
                              onChange={(e) =>
                                updateSelectedElement({
                                  fontSize:
                                    e.target.value === ""
                                      ? 0
                                      : parseInt(e.target.value),
                                })
                              }
                              className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                              min="8"
                              max="999"
                              step="1"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">
                              Weigt
                            </label>
                            <select
                              value={
                                (selectedElementData as TextElement)
                                  .fontWeight || "normal"
                              }
                              onChange={(e) =>
                                updateSelectedElement({
                                  fontWeight: e.target
                                    .value as TextElement["fontWeight"],
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
                                (selectedElementData as TextElement)
                                  .textAlign || "left"
                              }
                              onChange={(e) =>
                                updateSelectedElement({
                                  textAlign: e.target
                                    .value as TextElement["textAlign"],
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
                                (selectedElementData as TextElement).padding ??
                                ""
                              }
                              onChange={(e) =>
                                updateSelectedElement({
                                  padding:
                                    e.target.value === ""
                                      ? 0
                                      : parseInt(e.target.value),
                                })
                              }
                              className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                              min="0"
                              max="50"
                            />
                          </div>
                        </div>

                        {/* Text Opacity and Rotation in same row - at the end */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs font-medium text-slate-700">
                              Text Opacity
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.01"
                              value={
                                (selectedElementData as TextElement)
                                  .textOpacity ?? 1
                              }
                              onChange={(e) =>
                                updateSelectedElement({
                                  textOpacity: parseFloat(e.target.value),
                                })
                              }
                              className="w-full template-range"
                            />
                            <span className="text-xs text-gray-500 font-medium text-center block">
                              {Math.round(
                                ((selectedElementData as TextElement)
                                  .textOpacity ?? 1) * 100,
                              )}
                              %
                            </span>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-700">
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
                            <span className="text-xs text-gray-500 font-medium text-center block">
                              {selectedElementData.rotation || 0}°
                            </span>
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
                                  shape: e.target.value as
                                    | "rectangle"
                                    | "circle",
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

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-sm font-medium text-slate-700">
                              Rotation
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="360"
                              value={selectedElementData.rotation ?? 0}
                              onChange={(e) =>
                                updateSelectedElement({
                                  rotation: parseInt(e.target.value),
                                })
                              }
                              className="w-full template-range"
                              disabled={isElementLocked(selectedElement)}
                            />
                            <span className="text-sm text-gray-500 font-medium text-center block">
                              {selectedElementData.rotation || 0}°
                            </span>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700">
                              Opacity
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.01"
                              value={
                                (selectedElementData as ShapeElement).opacity ??
                                1
                              }
                              onChange={(e) =>
                                updateSelectedElement({
                                  opacity: parseFloat(e.target.value),
                                })
                              }
                              className="w-full template-range"
                            />
                            <span className="text-sm text-gray-500 font-medium text-center block">
                              {Math.round(
                                ((selectedElementData as ShapeElement)
                                  .opacity ?? 1) * 100,
                              )}
                              %
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                              Border
                            </label>
                            <input
                              type="number"
                              value={
                                (selectedElementData as ShapeElement)
                                  .borderWidth ?? 0
                              }
                              onChange={(e) =>
                                updateSelectedElement({
                                  borderWidth: parseInt(e.target.value) || 0,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                              min="0"
                              max="10"
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                              B-Radius
                            </label>
                            <input
                              type="number"
                              value={
                                (selectedElementData as ShapeElement)
                                  .borderRadius ?? 0
                              }
                              onChange={(e) =>
                                updateSelectedElement({
                                  borderRadius: parseInt(e.target.value) || 0,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                              min="0"
                              max="50"
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                              B-Color
                            </label>
                            <input
                              type="color"
                              value={
                                (selectedElementData as ShapeElement)
                                  .borderColor ?? "#000000"
                              }
                              onChange={(e) =>
                                updateSelectedElement({
                                  borderColor: e.target.value,
                                })
                              }
                              className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
                            />
                          </div>
                        </div>
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

        <div className="fixed md:static bottom-0 left-0 right-0  bg-white p-3    ">
          <div className="flex flex-row-reverse ">
            <button
              onClick={exportImage}
              disabled={isSaving}
              className="bg-purple-600 text-base text-white font-semibold w-full flex items-center gap-2 justify-center px-3 py-2.5 mx-1 rounded-md border border-purple-600 hover:bg-[#d7d7fc] hover:text-[#7650e3]"
            >
              {isSaving ? (
                <>
                  <Loader className="w-3 h-3 md:w-4 md:h-4 animate-spin" />
                  <span className="hidden sm:inline text-sm">
                    {t("saving")}
                  </span>
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
              className="text-purple-600 flex text-base font-semibold justify-center items-center gap-2 w-full px-3 py-2.5 mx-1 rounded-md border border-purple-600 hover:bg-[#d7d7fc] hover:text-[#7650e3]"
            >
              {t("discard_image")}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-gray-50 flex flex-col min-h-0 w-[100vw] md:w-[69vw]">
        <div className="sticky top-0 z-10 flex-shrink-0 px-3 py-1 md:py-2.5 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between  md:w-[69vw]">
            <div className="text-xs text-gray-500 font-medium font-mono">
              {canvasDimensions && (
                <>
                  <span className="hidden sm:inline">
                    {canvasDimensions.width} × {canvasDimensions.height} |{" "}
                    {Math.round(zoomLevel * 100)}%
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
                      imageDimensions.height,
                    );
                    setZoomLevel(zoom * 0.82);
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
          }  bg-gray-100 flex items-start justify-around p-2 md:p-4 min-h-0`}
          onClick={(e) => {
            // Only deselect if clicking directly on the container background, not on child elements
            if (e.target === e.currentTarget) {
              setSelectedElement(null);
              setPropertiesOpen(false);
              setElementsOpen(true);
            }
          }}
        >
          <div
            className="flex "
            style={{
              zoom: zoomLevel,
            }}
          >
            <Stage
              ref={stageRef}
              width={canvasDimensions.width}
              height={canvasDimensions.height}
              onMouseDown={(e) => {
                // Deselect when clicking on empty space
                if (e.target === e.target.getStage()) {
                  setSelectedElement(null);
                  setPropertiesOpen(false);
                  setElementsOpen(true);
                }
              }}
              onTouchStart={(e) => {
                if (e.target === e.target.getStage()) {
                  setSelectedElement(null);
                  setPropertiesOpen(false);
                  setElementsOpen(true);
                }
              }}
              className="border border-gray-300 rounded-md shadow-md bg-white transition-all duration-200"
            >
              <Layer>
                <Rect
                  x={0}
                  y={0}
                  width={canvasDimensions.width}
                  height={canvasDimensions.height}
                  fill="#f3f4f6"
                  listening={false}
                />

                {[...elements]
                  .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
                  .map((el) => {
                    const locked = isElementLocked(el.id);
                    const isSelected = el.id === selectedElement;
                    const commonGroupProps = {
                      key: el.id,
                      id: el.id,
                      x: el.x,
                      y: el.y,
                      rotation: el.rotation || 0,
                      draggable: !locked,
                      onMouseDown: () => {
                        setSelectedElement(el.id);
                        setPropertiesOpen(true);
                        setTemplatesOpen(false);
                        setElementsOpen(false);
                      },
                      onTouchStart: () => {
                        setSelectedElement(el.id);
                        setPropertiesOpen(true);
                        setTemplatesOpen(false);
                        setElementsOpen(false);
                      },
                      onDragStart: () => {
                        if (!locked) setIsDragging(true);
                      },
                      onDragEnd: (e: any) => {
                        setIsDragging(false);
                        let newX = e.target.x();
                        let newY = e.target.y();

                        // Apply grid snapping if enabled - snap to grid lines (not centers)
                        if (snapToGrid && gridSize > 0) {
                          newX = Math.floor(newX / gridSize) * gridSize;
                          newY = Math.floor(newY / gridSize) * gridSize;
                        }

                        updateElementById(el.id, { x: newX, y: newY });
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
                        <Group
                          {...commonGroupProps}
                          name={textEl.name || el.id}
                        >
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
                            name={`text-${el.id}`}
                          />
                        </Group>
                      );
                    }

                    if (el.type === "logo") {
                      const logoEl = el as LogoElement;
                      const img = logoEl.src
                        ? logoImages[logoEl.src]
                        : undefined;

                      return (
                        <Group
                          {...commonGroupProps}
                          name={logoEl.name || "logo"}
                          data-field="logo"
                        >
                          {img ? (
                            <KonvaImage
                              image={img}
                              x={-logoEl.width / 2}
                              y={-logoEl.height / 2}
                              width={logoEl.width}
                              height={logoEl.height}
                              opacity={logoEl.opacity ?? 1}
                              name="logo-image"
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
                              name="logo-placeholder"
                            />
                          )}
                        </Group>
                      );
                    }

                    if (el.type === "shape") {
                      const shapeEl = el as ShapeElement;
                      return (
                        <Group
                          {...commonGroupProps}
                          name={shapeEl.name || el.id}
                        >
                          {shapeEl.shape === "circle" ? (
                            <Ellipse
                              x={0}
                              y={0}
                              radiusX={Math.max(1, shapeEl.width / 2)}
                              radiusY={Math.max(1, shapeEl.height / 2)}
                              fill={shapeEl.color || "#000000"}
                              stroke={shapeEl.borderColor || "#000000"}
                              strokeWidth={shapeEl.borderWidth || 0}
                              opacity={shapeEl.opacity ?? 1}
                              name={`shape-circle-${el.id}`}
                            />
                          ) : (
                            <Rect
                              x={-shapeEl.width / 2}
                              y={-shapeEl.height / 2}
                              width={shapeEl.width}
                              height={shapeEl.height}
                              cornerRadius={shapeEl.borderRadius || 0}
                              fill={shapeEl.color || "#000000"}
                              stroke={shapeEl.borderColor || "#000000"}
                              strokeWidth={shapeEl.borderWidth || 0}
                              opacity={shapeEl.opacity ?? 1}
                              name={`shape-rect-${el.id}`}
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
                  anchorSize={Math.max(6, 12 / zoomLevel)}
                  borderStrokeWidth={2 / zoomLevel}
                  onTransformEnd={() => {
                    const node = selectedNodeRef.current;
                    if (!node || !selectedElement) return;

                    // If locked, don't apply transforms
                    if (lockedElements.has(selectedElement)) return;

                    const base = elements.find(
                      (e) => e.id === selectedElement,
                    ) as any;
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

                {/* Grid overlay - rendered on top for reference only */}
                {showGrid && gridSize > 0 && (
                  <>
                    {/* Vertical grid lines */}
                    {Array.from(
                      {
                        length: Math.ceil(canvasDimensions.width / gridSize),
                      },
                      (_, i) => (
                        <Line
                          key={`v-${i}`}
                          points={[
                            i * gridSize,
                            0,
                            i * gridSize,
                            canvasDimensions.height,
                          ]}
                          stroke="#4b5563"
                          strokeWidth={1}
                          listening={false}
                          opacity={0.85}
                        />
                      ),
                    )}
                    {/* Horizontal grid lines */}
                    {Array.from(
                      {
                        length: Math.ceil(canvasDimensions.height / gridSize),
                      },
                      (_, i) => (
                        <Line
                          key={`h-${i}`}
                          points={[
                            0,
                            i * gridSize,
                            canvasDimensions.width,
                            i * gridSize,
                          ]}
                          stroke="#4b5563"
                          strokeWidth={1}
                          listening={false}
                          opacity={0.85}
                        />
                      ),
                    )}
                  </>
                )}
              </Layer>
            </Stage>
          </div>
        </div>
      </div>
    </div>
  );
};
