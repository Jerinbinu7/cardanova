import React, { useCallback, useRef, useState } from 'react';
import { X, FileText, Image as ImageIcon, CheckCircle, AlertCircle, Crop } from 'lucide-react';
import ImageCropperModal from './ImageCropperModal';

interface FileUploadProps {
  /** Label shown above the dropzone */
  label?: string;
  /** Already-uploaded file URL (for editing) */
  currentUrl?: string | null;
  /** 'image' | 'pdf' | 'both' */
  accept?: 'image' | 'pdf' | 'both';
  /** Allow multiple files */
  multiple?: boolean;
  /** Called with the raw File(s) ready to be uploaded */
  onFiles: (files: File[]) => void;
  /** Called when the current file is removed */
  onRemove?: () => void;
  /** 0–100 during active upload */
  progress?: number;
  disabled?: boolean;
  className?: string;
  /** Default aspect ratio for cropper */
  defaultAspect?: '3:4' | '1:1' | '4:3' | '16:9' | 'free';
}

const ACCEPT_MAP = {
  image: 'image/jpeg,image/png,image/webp,image/gif',
  pdf:   'application/pdf',
  both:  'image/jpeg,image/png,image/webp,image/gif,application/pdf',
};

export default function FileUpload({
  label,
  currentUrl,
  accept = 'image',
  multiple = false,
  onFiles,
  onRemove,
  progress,
  disabled,
  className = '',
  defaultAspect = '3:4',
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  const handleFiles = useCallback((files: File[]) => {
    setError('');
    if (!files.length) return;
    const valid = files.filter((f) => {
      if (accept === 'image') return f.type.startsWith('image/');
      if (accept === 'pdf') return f.type === 'application/pdf';
      return f.type.startsWith('image/') || f.type === 'application/pdf';
    });
    if (valid.length !== files.length) {
      setError('Some files were rejected (wrong type).');
    }
    if (valid.length) {
      const firstImage = valid.find((f) => f.type.startsWith('image/'));
      if (firstImage) {
        setPendingFiles(valid.filter((f) => f !== firstImage));
        setCropFile(firstImage);
      } else {
        onFiles(valid);
      }
    }
  }, [accept, onFiles]);

  const handleCropComplete = (croppedFile: File) => {
    onFiles([croppedFile, ...pendingFiles]);
    setPendingFiles([]);
    setCropFile(null);
  };


  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, [handleFiles]);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    handleFiles(files);
    e.target.value = '';
  };

  const isUploading = typeof progress === 'number' && progress > 0 && progress < 100;

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-xs text-[#C5A046] uppercase tracking-wider font-medium">
          {label}
        </label>
      )}

      {/* Current file preview */}
      {currentUrl && (
        <div className="relative inline-block">
          {currentUrl.toLowerCase().includes('.pdf') || currentUrl.toLowerCase().endsWith('.pdf') ? (
            <div className="flex items-center gap-3 p-3 bg-[#071309] border border-[#C5A046]/30 rounded-xl">
              <FileText className="w-8 h-8 text-[#C5A046]" />
              <span className="text-xs text-gray-300 truncate max-w-[160px]">PDF Document</span>
            </div>
          ) : (
            <img
              src={currentUrl}
              alt="Current"
              className="w-28 h-28 object-cover rounded-xl border border-[#C5A046]/30"
            />
          )}
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-0.5 hover:bg-red-700 transition-colors"
              title="Remove"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Drop zone */}
      <div
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all select-none
          ${isDragging ? 'border-[#C5A046] bg-[#C5A046]/10' : 'border-[#C5A046]/30 hover:border-[#C5A046]/60 hover:bg-[#C5A046]/5'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <div className="flex flex-col items-center gap-2">
          {accept === 'pdf'
            ? <FileText className="w-8 h-8 text-[#C5A046]/60" />
            : <ImageIcon className="w-8 h-8 text-[#C5A046]/60" />
          }
          <p className="text-xs text-gray-400">
            <span className="text-[#C5A046]">Click to upload</span> or drag & drop
          </p>
          <p className="text-[11px] text-gray-500">
            {accept === 'image' ? 'JPG, PNG, WebP' : accept === 'pdf' ? 'PDF only' : 'JPG, PNG, WebP, PDF'}
            {' · Max 10MB'}
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_MAP[accept]}
          multiple={multiple}
          onChange={onInputChange}
          className="hidden"
          disabled={disabled}
        />
      </div>

      {/* Upload progress */}
      {isUploading && (
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-gray-400">
            <span>Uploading…</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#071309] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#C5A046] to-[#DFBF6C] transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Done */}
      {progress === 100 && !isUploading && (
        <div className="flex items-center gap-1.5 text-emerald-400 text-xs">
          <CheckCircle className="w-4 h-4" />
          <span>Upload complete</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-1.5 text-red-400 text-xs">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Image Cropper Modal */}
      <ImageCropperModal
        isOpen={!!cropFile}
        imageFile={cropFile}
        onClose={() => {
          setCropFile(null);
          setPendingFiles([]);
        }}
        onCropComplete={handleCropComplete}
        defaultAspect={defaultAspect}
      />
    </div>
  );
}

