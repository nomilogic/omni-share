import { useResize } from "../context/ResizeContext";
import React, { useState, useRef, useEffect } from "react";
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
import "../styles/drag-prevention.css";
import "../styles/template-editor.css";

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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { handleResizeMainToFullScreen } = useResize();
  // Toggle full screen on small/mobile screens and on resize
  useEffect(() => {
    const checkAndResize = () => {
      const isSmallScreen = window.innerWidth < 768;
      handleResizeMainToFullScreen(isSmallScreen);
    };
    checkAndResize();
    window.addEventListener("resize", checkAndResize);
    return () => {
      window.removeEventListener("resize", checkAndResize);
      handleResizeMainToFullScreen(false);
    };
  }, [handleResizeMainToFullScreen]);
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

  useEffect(() => {
    if (canvasRef.current) {
      const canvasElement = canvasRef.current;
      const context = canvasElement.getContext("2d");

      if (context) {
        setCanvas(canvasElement);
        setCtx(context);

        console.log("Canvas setup complete, image URL:", imageUrl);
        console.log("Selected template:", selectedTemplate);
        console.log("Elements:", elements);

        // Try to load background image to get its dimensions
        if (imageUrl) {
          setBackgroundImageLoading(true);
          const img = new Image();
          // Only set crossOrigin for external URLs, not for blob URLs or data URLs
          if (!imageUrl.startsWith("blob:") && !imageUrl.startsWith("data:")) {
            img.crossOrigin = "anonymous";
          }

          img.onload = () => {
            console.log("Background image loaded successfully:", imageUrl);
            console.log("Image dimensions:", img.width, "x", img.height);
            console.log("Using aspect ratio:", aspectRatio);

            // Store original image dimensions for reference
            setImageDimensions({ width: img.width, height: img.height });

            // Calculate canvas dimensions based on aspect ratio instead of image dimensions
            const targetDimensions = calculateCanvasDimensions(aspectRatio);
            console.log(
              "Target canvas dimensions based on aspect ratio:",
              targetDimensions
            );

            // Set canvas to aspect ratio dimensions
            setCanvasDimensions(targetDimensions);
            canvasElement.width = targetDimensions.width;
            canvasElement.height = targetDimensions.height;

            // Calculate zoom level to fit canvas in container
            const { zoom, maxZoom: maxZoomLevel } = calculateZoomLevel(
              targetDimensions.width,
              targetDimensions.height
            );
            console.log(
              "Calculated zoom level:",
              zoom,
              "Max zoom:",
              maxZoomLevel
            );
            setZoomLevel(zoom);
            setMaxZoom(maxZoomLevel);

            setBackgroundImage(img);
            setBackgroundImageLoading(false);
            redrawCanvas(context, img, elements);
          };

          img.onerror = (error) => {
            console.error("Background image failed to load:", imageUrl, error);
            setBackgroundImageLoading(false);
            // Use template dimensions or fallback to square
          };

          console.log("Attempting to load background image:", imageUrl);
          img.src = imageUrl;
        } else {
          // No image URL, use template dimensions or fallback
          const dimensions = selectedTemplate?.dimensions || {
            width: 1080,
            height: 1080,
          };
          setImageDimensions(dimensions);
          setCanvasDimensions(dimensions);
          canvasElement.width = dimensions.width;
          canvasElement.height = dimensions.height;

          // Calculate zoom for fallback dimensions
          const { zoom, maxZoom: maxZoomLevel } = calculateZoomLevel(
            dimensions.width,
            dimensions.height
          );
          setZoomLevel(zoom);
          setMaxZoom(maxZoomLevel);

          // Initialize canvas with fallback background
          context.fillStyle = "#f3f4f6";
          context.fillRect(0, 0, canvasElement.width, canvasElement.height);

          // Draw template elements immediately
          elements.forEach((element) => {
            drawElement(context, element);
          });
        }
      }
    }
  }, [imageUrl, selectedTemplate]);

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
      context.fillText("Logo", element.x, element.y);

      // Draw upload hint
      context.fillStyle = "#9ca3af";
      context.font = "12px Arial";
      context.fillText("Click to upload", element.x, element.y + 20);
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

  const updateSelectedElement = (updates: Partial<TemplateElement>) => {
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
    if (!canvas) return;

    // Use responsive sizing based on canvas dimensions
    const fontSize = Math.max(0, Math.min(32, canvas.width / 30));
    const width = Math.max(0, canvas.width * 0.5);

    const newElement: TextElement = {
      id: `text-${Date.now()}`,
      type: "text",
      x: canvas.width / 2,
      y: canvas.height / 2,
      width: width,
      height: fontSize * 1.5,
      content: "New Text",
      fontSize: fontSize,
      fontWeight: "normal",
      fontFamily: "Arial",
      color: "#ffeb3b",
      textAlign: "center",
      backgroundColor: "#000",
      backgroundOpacity: 0.8,
      textOpacity: 1,
      padding: 2,
      borderRadius: 0,
      zIndex:
        elements.length > 0
          ? Math.max(...elements.map((el) => el.zIndex || 0)) + 1
          : 0,
    };

    setElements((prev) => [...prev, newElement]);
    setSelectedElement(newElement.id);
  };

  const createNewShapeElement = (shape: "rectangle" | "circle") => {
    if (!canvas) return;

    // Use responsive sizing based on canvas dimensions
    const size = Math.min(100, canvas.width * 0.15);

    const newElement: ShapeElement = {
      id: `shape-${Date.now()}`,
      type: "shape",
      x: canvas.width / 2,
      y: canvas.height / 2,
      width: size,
      height: shape === "circle" ? size : size * 0.6,
      shape,
      color: "#3b82f6",
      opacity: 1,
      zIndex: Math.max(...elements.map((el) => el.zIndex || 0)) + 1,
    };

    setElements((prev) => [...prev, newElement]);
    setSelectedElement(newElement.id);
  };

  const createNewLogoElement = () => {
    if (!canvas) return;

    // Use responsive sizing based on canvas dimensions
    const size = Math.min(80, canvas.width * 0.1);

    const newElement: LogoElement = {
      id: `logo-${Date.now()}`,
      type: "logo",
      x: canvas.width / 2,
      y: canvas.height / 2,
      width: size,
      height: size,
      src: "",
      opacity: 1,
      borderRadius: 0,
      zIndex: Math.max(...elements.map((el) => el.zIndex || 0)) + 1,
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
    if (!canvas || !ctx) return;

    setIsSaving(true);

    try {
      // Create a clean canvas for export by drawing without selection borders
      if (backgroundImage) {
        redrawCanvas(ctx, backgroundImage, elements, false); // false = don't show selection
      } else {
        redrawCanvasWithoutBackground(ctx, elements, false); // false = don't show selection
      }

      // Create blob from the clean canvas
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
        }, "image/png");
      });

      if (!blob) {
        throw new Error("Failed to create image blob");
      }

      // Restore canvas with selection borders for continued editing
      if (backgroundImage) {
        redrawCanvas(ctx, backgroundImage, elements, true); // true = show selection
      } else {
        redrawCanvasWithoutBackground(ctx, elements, true); // true = show selection
      }

      // Create local URL for immediate preview
      const localUrl = URL.createObjectURL(blob);

      // Upload to server for persistent storage
      const user = await getCurrentUser();
      if (user?.user?.id) {
        try {
          // Convert blob to File for upload
          const file = new File([blob], `template-${Date.now()}.png`, {
            type: "image/png",
            lastModified: Date.now(),
          });

          console.log("Uploading template image to server...");
          const uploadedUrl = await uploadMedia(file, user.user.id);
          console.log("Template image uploaded successfully:", uploadedUrl);

          // Use the uploaded URL as the final image
          onSave(uploadedUrl);
        } catch (uploadError) {
          console.warn(
            "Failed to upload template image, using local URL:",
            uploadError
          );
          // Fallback to local URL if upload fails
          onSave(localUrl);
        }
      } else {
        console.warn("No user found, using local URL");
        // Fallback to local URL if no user
        onSave(localUrl);
      }
    } catch (error) {
      console.error("Error exporting template image:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const selectedElementData = elements.find((el) => el.id === selectedElement);

  // Disable body scroll when template editor is open
  useEffect(() => {
    // Disable body scroll when component mounts
    document.body.style.overflow = "hidden";

    // Re-enable body scroll when component unmounts
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-slate-500">Loading editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col-reverse md:flex-row">
      {/* Tools Panel - Top Row on Mobile, Left Column on Desktop - Fixed Height/Width with Scroll */}
      <div
        className={`w-full md:w-80 md:min-w-80 md:max-w-80 ${
          aspectRatio === "1:1" ? "h-[50vh]" : ""
        } ${aspectRatio === "16:9" ? "h-[60vh]" : ""} ${
          aspectRatio === "9:16" ? "h-[50vh]" : ""
        }  md:h-full bg-white border-b md:border-b-0 md:border-r border-gray-200 flex flex-col`}
      >
        {/* Tools Header - Fixed */}
        {/* <div className="flex-shrink-0 p-3 md:p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <h3 className="text-base md:text-lg font-semibold text-slate-900">Template Editor</h3>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-slate-500 text-xl md:text-2xl font-bold leading-none p-1 hover:bg-gray-100 rounded transition-colors"
            >
              ×
            </button>
          </div>
        </div> */}

        {/* Tools Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-3 md:p-4 min-h-0">
          <div className="space-y-3 md:space-y-4">
            {/* Element Creation Toolbar */}
            <div className="border border-gray-200 rounded-md p-2 md:p-3 bg-gray-50">
              <h4 className="text-xs md:text-sm font-semibold text-slate-700 mb-2 md:mb-3">
                Add Elements
              </h4>
              <div className="grid grid-cols-4 md:grid-cols-2 gap-1.5 md:gap-2">
                <button
                  onClick={createNewTextElement}
                  className="p-2 md:p-3 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 flex flex-col items-center justify-center space-y-0.5 md:space-y-1 transition-colors min-h-12 md:min-h-16"
                  title="Add Text"
                >
                  <Type className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="text-xs font-medium">Text</span>
                </button>
                <button
                  onClick={createNewLogoElement}
                  className="p-2 md:p-3 bg-green-50 text-green-700 rounded-md hover:bg-green-100 flex flex-col items-center justify-center space-y-0.5 md:space-y-1 transition-colors min-h-12 md:min-h-16"
                  title="Add Logo"
                >
                  <Upload className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="text-xs font-medium">Image</span>
                </button>
                <button
                  onClick={() => createNewShapeElement("rectangle")}
                  className="p-2 md:p-3 bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100 flex flex-col items-center justify-center space-y-0.5 md:space-y-1 transition-colors min-h-12 md:min-h-16"
                  title="Add Rectangle"
                >
                  <Square className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="text-xs font-medium">Rectangle</span>
                </button>
                <button
                  onClick={() => createNewShapeElement("circle")}
                  className="p-2 md:p-3 bg-orange-50 text-orange-700 rounded-md hover:bg-orange-100 flex flex-col items-center justify-center space-y-0.5 md:space-y-1 transition-colors min-h-12 md:min-h-16"
                  title="Add Circle"
                >
                  <Circle className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="text-xs font-medium">Circle</span>
                </button>
              </div>
            </div>

            {/* Selected Element Properties */}
            {selectedElementData && (
              <div className="border border-gray-200 rounded-md p-3 md:p-4 bg-white">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <h4 className="text-xs md:text-sm font-semibold text-slate-900">
                    {selectedElementData.type.charAt(0).toUpperCase() +
                      selectedElementData.type.slice(1)}{" "}
                    Element
                  </h4>

                  {/* Element Control Buttons */}
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={toggleElementLock}
                      className={`p-2 rounded-md ${
                        isElementLocked(selectedElement)
                          ? "bg-red-100 text-red-600"
                          : "bg-gray-100 text-slate-500"
                      } hover:bg-opacity-80 transition-colors`}
                      title={
                        isElementLocked(selectedElement)
                          ? "Unlock Element"
                          : "Lock Element"
                      }
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
                      className="p-2 bg-gray-100 text-slate-500 rounded-md hover:bg-gray-200 flex items-center justify-center transition-colors text-xs"
                      title="Bring to Front"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={moveUp}
                      className="p-2 bg-gray-100 text-slate-500 rounded-md hover:bg-gray-200 flex items-center justify-center transition-colors text-xs"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={moveDown}
                      className="p-2 bg-gray-100 text-slate-500 rounded-md hover:bg-gray-200 flex items-center justify-center transition-colors text-xs"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={sendToBack}
                      className="p-2 bg-gray-100 text-slate-500 rounded-md hover:bg-gray-200 flex items-center justify-center transition-colors text-xs"
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
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
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
                        <span className="text-sm text-slate-500 text-center block mt-1">
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
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
                        <span className="text-xs text-slate-500 text-center block mt-1">
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
                        <span className="text-xs text-slate-500 text-center block mt-1">
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
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
                              fontWeight: e.target.value,
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
                            updateSelectedElement({ textAlign: e.target.value })
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
                      <div className="flex justify-between text-xs text-slate-500 mt-1">
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
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
                      <div className="flex justify-between text-sm text-slate-500 mt-1">
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          min="0"
                          max="50"
                          placeholder="0"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {!selectedElementData && (
              <div className="text-center py-6 md:py-12 text-slate-500">
                <div className="bg-gray-50 rounded-md p-4 md:p-6">
                  <Palette className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 md:mb-3 text-gray-400" />
                  <p className="text-xs md:text-sm font-medium mb-1">
                    No Element Selected
                  </p>
                  <p className="text-xs text-gray-400">
                    Click on a template element to edit its properties
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tools Actions - Fixed at bottom of tools panel */}
        <div className="flex-shrink-0 px-1 ">
          <div className="flex flex-row-reverse justify-center ">
            <button
              onClick={exportImage}
              disabled={isSaving}
              className="btn-success w-full px-3 py-2.5 mx-1 rounded-md"
            >
              {isSaving ? (
                <>
                  <Loader className="w-3 h-3 md:w-4 md:h-4 animate-spin " />
                  <span className="hidden sm:inline text-sm">
                    Saving Image...
                  </span>
                  <span className="sm:hidden text-sm">Saving...</span>
                </>
              ) : (
                <>
                  {/* <Download className="w-3 h-3 md:w-4 md:h-4" /> */}
                  <span className="sm:inline">Continue</span>
                  {/* <span className="sm:hidden">Save</span> */}
                </>
              )}
            </button>
            {/* <div className="text-center theme-text-secondary ">
              <span className="text-lg font-medium">or</span>
            </div> */}
            <button
              onClick={onCancel}
              className="btn-primary w-full  px-3 py-2.5 mx-1 rounded-md"
            >
              Back
            </button>
          </div>
        </div>
      </div>

      {/* Canvas Area - Bottom Row on Mobile, Right Column on Desktop - Flexible Height/Width with Scroll */}
      <div className="flex-1 bg-gray-50 flex flex-col min-h-0">
        {/* Canvas Controls - Fixed Header */}
        <div className="flex-shrink-0 px-3 py-1 md:py-2 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between">
            {/* Canvas Info */}
            <div className="text-xs text-slate-500 font-mono">
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

            {/* Zoom Controls */}
            <div className="flex items-center space-x-1.5 md:space-x-2">
              <button
                onClick={() => setZoomLevel(Math.max(0.1, zoomLevel - 0.1))}
                className="px-2 py-1 bg-gray-100 text-slate-700 rounded text-xs hover:bg-gray-200 transition-colors"
                disabled={zoomLevel <= 0.1}
              >
                −
              </button>
              <span className="text-xs text-slate-500 min-w-8 md:min-w-12 text-center">
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
            <canvas
              ref={canvasRef}
              onClick={handleCanvasClick}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
              onTouchStart={handleCanvasTouchStart}
              onTouchMove={handleCanvasTouchMove}
              onTouchEnd={handleCanvasTouchEnd}
              className="border-2 border-gray-300 rounded-md shadow-2xl cursor-pointer bg-white transition-all duration-200"
              style={{
                width: `${canvasDimensions.width}px`,
                height: `${canvasDimensions.height}px`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
