import { useState, useEffect, useRef } from 'react';
import { X, Crop, ZoomIn, MoveVertical, MoveHorizontal, Check, Image as ImageIcon } from 'lucide-react';

interface ImageCropperModalProps {
  isOpen: boolean;
  imageFile: File | null;
  onClose: () => void;
  onCropComplete: (croppedFile: File) => void;
  defaultAspect?: '3:4' | '1:1' | '4:3' | '16:9' | 'free';
}

const ASPECT_RATIOS = [
  { id: '3:4', label: '3:4 Portrait (Founders/Team)', ratio: 3 / 4 },
  { id: '1:1', label: '1:1 Square (Products/Thumbnails)', ratio: 1 / 1 },
  { id: '4:3', label: '4:3 Standard', ratio: 4 / 3 },
  { id: '16:9', label: '16:9 Banner (Hero/Wide)', ratio: 16 / 9 },
  { id: 'free', label: 'Original / Free', ratio: 0 },
];

export default function ImageCropperModal({
  isOpen,
  imageFile,
  onClose,
  onCropComplete,
  defaultAspect = '3:4',
}: ImageCropperModalProps) {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [aspect, setAspect] = useState<string>(defaultAspect);
  const [scale, setScale] = useState<number>(1);
  const [offsetY, setOffsetY] = useState<number>(20); // default to 20% (near top so faces are preserved!)
  const [offsetX, setOffsetX] = useState<number>(50); // 0 (left) to 100 (right)
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!imageFile) {
      setImgSrc(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setImgSrc(url);
    setScale(1);
    setOffsetY(20);
    setOffsetX(50);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  useEffect(() => {
    setAspect(defaultAspect);
  }, [defaultAspect]);

  // Render canvas whenever parameters change
  useEffect(() => {
    if (!imgSrc || !canvasRef.current) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imgSrc;
    img.onload = () => {
      imageRef.current = img;
      drawCanvas();
    };
  }, [imgSrc, aspect, scale, offsetY, offsetX]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Determine target dimensions based on aspect ratio
    const selectedRatio = ASPECT_RATIOS.find((r) => r.id === aspect)?.ratio || 0;
    let targetWidth = 800;
    let targetHeight = 800;

    if (selectedRatio > 0) {
      if (selectedRatio >= 1) {
        targetWidth = 1000;
        targetHeight = Math.round(targetWidth / selectedRatio);
      } else {
        targetHeight = 1000;
        targetWidth = Math.round(targetHeight * selectedRatio);
      }
    } else {
      // Free / original aspect ratio
      targetWidth = Math.min(img.naturalWidth, 1200);
      targetHeight = Math.round(targetWidth * (img.naturalHeight / img.naturalWidth));
    }

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    ctx.clearRect(0, 0, targetWidth, targetHeight);

    // Calculate crop rectangle with scale and offsets
    const imgAspect = img.naturalWidth / img.naturalHeight;
    const canvasAspect = targetWidth / targetHeight;

    let srcW = img.naturalWidth;
    let srcH = img.naturalHeight;

    if (imgAspect > canvasAspect) {
      srcW = img.naturalHeight * canvasAspect;
    } else {
      srcH = img.naturalWidth / canvasAspect;
    }

    // Apply zoom (scale >= 1 means smaller source window, zooming in)
    srcW = srcW / scale;
    srcH = srcH / scale;

    // Apply pan offsets (0 to 100%)
    const maxOffsetX = img.naturalWidth - srcW;
    const maxOffsetY = img.naturalHeight - srcH;

    const srcX = Math.max(0, Math.min(maxOffsetX, (offsetX / 100) * maxOffsetX));
    const srcY = Math.max(0, Math.min(maxOffsetY, (offsetY / 100) * maxOffsetY));

    // High-quality image rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, targetWidth, targetHeight);
  };

  const handleApplyCrop = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imageFile) return;

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const croppedFile = new File(
          [blob],
          imageFile.name.replace(/\.[^.]+$/, '.webp'),
          { type: 'image/webp', lastModified: Date.now() }
        );
        onCropComplete(croppedFile);
      },
      'image/webp',
      0.9
    );
  };

  const handleUseOriginal = () => {
    if (imageFile) {
      onCropComplete(imageFile);
    }
  };

  if (!isOpen || !imageFile) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#0D2012] border border-[#C5A046]/40 rounded-2xl w-full max-w-2xl my-auto shadow-2xl overflow-hidden p-5 sm:p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#C5A046]/20">
          <div className="flex items-center gap-2">
            <Crop className="w-5 h-5 text-[#C5A046]" />
            <h3 className="text-base font-semibold text-white">Crop &amp; Adjust Image</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Aspect Ratio Presets */}
        <div>
          <label className="block text-[11px] font-semibold text-[#C5A046] uppercase tracking-wider mb-2">
            1. Select Aspect Ratio
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ASPECT_RATIOS.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setAspect(r.id)}
                className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition-all cursor-pointer ${
                  aspect === r.id
                    ? 'bg-[#C5A046] text-[#071309] border-[#C5A046] font-semibold shadow-md'
                    : 'bg-[#071309] text-stone-300 border-[#C5A046]/30 hover:border-[#C5A046]'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Interactive Canvas Preview */}
        <div className="relative bg-[#071309] border border-[#C5A046]/30 rounded-xl overflow-hidden flex items-center justify-center min-h-[220px] max-h-[340px] p-2">
          <canvas
            ref={canvasRef}
            className="max-h-[300px] w-auto max-w-full object-contain rounded-lg shadow-lg"
          />
        </div>

        {/* 3. Controls: Zoom & Focus Position */}
        <div className="space-y-3 bg-[#071309]/80 border border-[#C5A046]/20 rounded-xl p-3.5">
          {/* Zoom Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-stone-300">
              <span className="flex items-center gap-1"><ZoomIn className="w-3.5 h-3.5 text-[#C5A046]" /> Zoom</span>
              <span>{Math.round(scale * 100)}%</span>
            </div>
            <input
              type="range"
              min="1"
              max="2.5"
              step="0.05"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="w-full accent-[#C5A046] cursor-pointer"
            />
          </div>

          {/* Vertical Focus (Top/Bottom) */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-stone-300">
              <span className="flex items-center gap-1"><MoveVertical className="w-3.5 h-3.5 text-[#C5A046]" /> Focus (Top/Bottom)</span>
              <span>{offsetY < 35 ? 'Top' : offsetY > 65 ? 'Bottom' : 'Center'}</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={offsetY}
              onChange={(e) => setOffsetY(parseInt(e.target.value, 10))}
              className="w-full accent-[#C5A046] cursor-pointer"
            />
          </div>

          {/* Horizontal Focus (Left/Right) */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-stone-300">
              <span className="flex items-center gap-1"><MoveHorizontal className="w-3.5 h-3.5 text-[#C5A046]" /> Position (Left/Right)</span>
              <span>{offsetX < 35 ? 'Left' : offsetX > 65 ? 'Right' : 'Center'}</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={offsetX}
              onChange={(e) => setOffsetX(parseInt(e.target.value, 10))}
              className="w-full accent-[#C5A046] cursor-pointer"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={handleUseOriginal}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs text-[#C5A046] border border-[#C5A046]/40 hover:bg-[#C5A046]/10 cursor-pointer transition-colors"
            title="Use original file without cropping"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Skip / Use Original
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs text-stone-300 border border-stone-700 hover:border-stone-500 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApplyCrop}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A046] to-[#DFBF6C] text-[#071309] font-semibold text-xs uppercase tracking-wider hover:brightness-110 cursor-pointer shadow-xl"
            >
              <Check className="w-4 h-4" /> Crop &amp; Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
