import React, { useState, useRef } from 'react';
import { Camera, Upload, Trash2, ZoomIn, Move, Check, X, Eye, EyeOff } from 'lucide-react';
import { Language, PersonalDetails } from '../../types/resume';
import { SupabaseStorageService } from '../../services/supabaseStorage';

interface ProfilePhotoUploaderProps {
  personalDetails: PersonalDetails;
  userId?: string;
  language: Language;
  onChange: (updated: Partial<PersonalDetails>) => void;
}

const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export const ProfilePhotoUploader: React.FC<ProfilePhotoUploaderProps> = ({
  personalDetails,
  userId,
  language,
  onChange,
}) => {
  const isRtl = language === 'ar';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [pendingSrc, setPendingSrc] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1.1);
  const [offsetX, setOffsetX] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
      setError(
        isRtl
          ? 'صيغة الصورة غير مدعومة. يرجى اختيار JPG أو PNG أو WEBP.'
          : 'Unsupported format. Please select JPG, JPEG, PNG, or WEBP.'
      );
      return;
    }

    if (file.size > MAX_PHOTO_BYTES) {
      setError(
        isRtl
          ? 'حجم الصورة يتجاوز الحد الأقصى المسموح به (5 ميجابايت).'
          : 'Image size exceeds the 5 MB maximum limit.'
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPendingSrc(String(reader.result || ''));
      setZoom(1.1);
      setOffsetX(0);
      setOffsetY(0);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSaveCropped = async () => {
    if (!pendingSrc) return;
    setIsUploading(true);
    setError(null);

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = pendingSrc;
      });

      const size = 400; // 400x400 crisp circular crop output
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');

      // Circular clip
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      const minDim = Math.min(img.width, img.height);
      const scale = (size / minDim) * zoom;
      const drawW = img.width * scale;
      const drawH = img.height * scale;
      const dx = (size - drawW) / 2 + offsetX * 2;
      const dy = (size - drawH) / 2 + offsetY * 2;

      ctx.drawImage(img, dx, dy, drawW, drawH);

      const blob: Blob = await new Promise((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error('Failed to encode image'))),
          'image/webp',
          0.9
        );
      });

      const { photoPath, signedUrl } = await SupabaseStorageService.uploadProfilePhoto(blob, userId);

      onChange({
        avatarUrl: signedUrl,
        photoPath,
        includePhoto: true,
        photoPosition: personalDetails.photoPosition || 'left',
      });
      setPendingSrc(null);
    } catch (err: any) {
      setError(err.message || 'Failed to save profile photo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    setIsUploading(true);
    try {
      await SupabaseStorageService.deleteProfilePhoto(personalDetails.photoPath, userId);
      onChange({
        avatarUrl: undefined,
        photoPath: undefined,
        includePhoto: false,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const includePhoto = personalDetails.includePhoto !== false && Boolean(personalDetails.avatarUrl);
  const photoPosition = personalDetails.photoPosition || 'left';

  return (
    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Current Avatar Preview */}
          <div className="w-16 h-16 rounded-full bg-white border-2 border-slate-200 overflow-hidden flex items-center justify-center shrink-0 shadow-xs">
            {personalDetails.avatarUrl ? (
              <img
                src={personalDetails.avatarUrl}
                alt={personalDetails.fullName || 'Profile'}
                className="w-full h-full object-cover"
              />
            ) : (
              <Camera className="w-6 h-6 text-slate-400" />
            )}
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900">
              {isRtl ? 'الصورة الشخصية للسيرة الذاتية (اختياري)' : 'Profile Photo (Optional)'}
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {isRtl
                ? 'JPG أو PNG أو WEBP بحد أقصى 5 ميجابايت'
                : 'JPG, JPEG, PNG, or WEBP up to 5 MB'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-blue-500 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Upload className="w-3.5 h-3.5 text-blue-600" />
            <span>
              {personalDetails.avatarUrl
                ? isRtl ? 'تغيير الصورة' : 'Replace Photo'
                : isRtl ? 'رفع صورة' : 'Upload Photo'}
            </span>
          </button>

          {personalDetails.avatarUrl && (
            <button
              type="button"
              disabled={isUploading}
              onClick={handleRemovePhoto}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-red-200 hover:bg-red-50 text-red-600 text-xs font-semibold flex items-center gap-1 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isRtl ? 'حذف' : 'Remove'}</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
          {error}
        </div>
      )}

      {/* Interactive Crop & Reposition Modal/Panel */}
      {pendingSrc && (
        <div className="p-4 rounded-xl bg-white border border-blue-200 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">
              {isRtl ? 'قص وتعديل موضع الصورة' : 'Crop & Reposition Photo'}
            </span>
            <button
              type="button"
              onClick={() => setPendingSrc(null)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-5">
            {/* Circular Crop Preview */}
            <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-blue-500 bg-slate-100 relative shrink-0 shadow-inner">
              <img
                src={pendingSrc}
                alt="Crop preview"
                className="w-full h-full object-cover pointer-events-none select-none"
                style={{
                  transform: `scale(${zoom}) translate(${offsetX}px, ${offsetY}px)`,
                }}
              />
            </div>

            {/* Zoom & Pan Controls */}
            <div className="flex-1 w-full space-y-3">
              <div>
                <label className="flex items-center justify-between text-[11px] font-semibold text-slate-600 mb-1">
                  <span className="flex items-center gap-1">
                    <ZoomIn className="w-3.5 h-3.5" />
                    {isRtl ? 'التكبير' : 'Zoom'}
                  </span>
                  <span>{Math.round(zoom * 100)}%</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={2.5}
                  step={0.05}
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 mb-1">
                    <Move className="w-3 h-3" />
                    {isRtl ? 'أفقي' : 'Horizontal'}
                  </label>
                  <input
                    type="range"
                    min={-50}
                    max={50}
                    step={1}
                    value={offsetX}
                    onChange={(e) => setOffsetX(parseInt(e.target.value, 10))}
                    className="w-full accent-blue-600"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 mb-1">
                    <Move className="w-3 h-3" />
                    {isRtl ? 'رأسي' : 'Vertical'}
                  </label>
                  <input
                    type="range"
                    min={-50}
                    max={50}
                    step={1}
                    value={offsetY}
                    onChange={(e) => setOffsetY(parseInt(e.target.value, 10))}
                    className="w-full accent-blue-600"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setPendingSrc(null)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={handleSaveCropped}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isUploading ? (isRtl ? 'جاري الحفظ...' : 'Saving...') : (isRtl ? 'حفظ الصورة' : 'Save Photo')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Photo Visibility & Position Controls */}
      {personalDetails.avatarUrl && !pendingSrc && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200">
          <button
            type="button"
            onClick={() => onChange({ includePhoto: !includePhoto })}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition ${
              includePhoto
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-white text-slate-600 border-slate-300'
            }`}
          >
            {includePhoto ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>
              {includePhoto
                ? isRtl ? 'إظهار الصورة في السيرة' : 'Photo Visible on CV'
                : isRtl ? 'الصورة مخفية' : 'Photo Hidden'}
            </span>
          </button>

          {includePhoto && (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-600">
                {isRtl ? 'الموضع:' : 'Position:'}
              </span>
              {(['left', 'right', 'top', 'sidebar'] as const).map((pos) => (
                <button
                  key={pos}
                  type="button"
                  onClick={() => onChange({ photoPosition: pos })}
                  className={`px-2 py-1 rounded text-[11px] font-semibold capitalize transition ${
                    photoPosition === pos
                      ? 'bg-slate-900 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
