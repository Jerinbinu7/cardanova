import { useState, useEffect, useRef } from 'react';
import { X, Crop, ZoomIn, MoveVertical, MoveHorizontal, Check } from 'lucide-react';

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

    let targetWidth = 600;
    let targetHeight = 600;

    const selectedRatio = ASPECT_RATIOS.find((r) => r.id === aspect)?.ratio ?? 0;
    if (selectedRatio > 0) {
      if (selectedRatio >= 1) {
        targetWidth = 800;
        targetHeight = Math.round(800 / selectedRatio);
      } else {
        targetHeight = 800;
        targetWidth = Math.round(800 * selectedRatio);
      }
    } else {
      targetWidth = img.width;
      targetHeight = img.height;
    }

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    ctx.clearRect(0, 0, targetWidth, targetHeight);

    // Calculate source crop region based on scale and offsets
    const imgRatio = img.width / img.height;
    const canvasRatio = targetWidth / targetHeight;

    let drawW: number;
    let drawH: number;

    if (imgRatio > canvasRatio) {
      drawH = targetHeight * scale;
      drawW = drawH * imgRatio;
    } else {
      drawW = targetWidth * scale;
      drawH = drawW / imgRatio;
    }

    // Offset calculations
    const extraX = drawW - targetWidth;
    const extraY = drawH - targetHeight;

    const drawX = -extraX * (offsetX / 100);
    const drawY = -extraY * (offsetY / 100);

    ctx.drawImage(img, drawX, drawY, drawW, drawH);
  };

  const handleApplyCrop = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imageFile) return;

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const croppedFile = new File([blob], imageFile.name, {
          type: imageFile.type || 'image/jpeg',
          lastModified: Date.now(),
        });
        onCropComplete(croppedFile);
        onClose();
      },
      imageFile.type || 'image/jpeg',
      0.92
    );
  };

  if (!isOpen || !imageFile || !imgSrc) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-[#0D2012] border border-[#C5A046]/40 rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#C5A046]/20 pb-4">
          <div className="flex items-center gap-2 text-[#C5A046]">
            <Crop className="w-5 h-5" />
            <h3 className="text-lg font-light text-[#FAF8F5]">Crop & Adjust Image</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Aspect Ratio Selector */}
        <div>
          <label className="block text-xs uppercase tracking-wider text-[#C5A046] mb-2 font-medium">
            1. Select Aspect Ratio
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ASPECT_RATIOS.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setAspect(r.id)}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  aspect === r.id
                    ? 'bg-[#C5A046] text-[#071309] font-bold shadow-md'
                    : 'bg-[#071309] text-stone-300 border border-[#C5A046]/30 hover:border-[#C5A046]'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Canvas Preview Box */}
        <div className="flex justify-center bg-[#071309] border border-[#C5A046]/30 rounded-2xl p-4 overflow-hidden max-h-[320px]">
          <canvas
            ref={canvasRef}
            className="max-h-[280px] w-auto object-contain rounded-lg shadow-lg border border-[#C5A046]/20"
          />
        </div>

        {/* Fine Adjustment Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#071309]/80 p-4 rounded-2xl border border-[#C5A046]/20">
          {/* Zoom */}
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
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs text-stone-300 border border-stone-700 hover:border-stone-500 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApplyCrop}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#C5A046] to-[#DFBF6C] text-[#071309] font-semibold text-xs uppercase tracking-wider hover:brightness-110 cursor-pointer shadow-xl"
          >
            <Check className="w-4 h-4" /> Crop & Apply
          </button>
        </div>
      </div>
    </div>
  );
}
