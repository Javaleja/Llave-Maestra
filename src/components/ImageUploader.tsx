import React from "react";
import { useState, useRef, useCallback } from "react";
import { Upload, X, ImageIcon, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "../lib/supabase";

interface ImageUploaderProps {
  onImagesChange: (urls: string[]) => void;
  maxFiles?: number;
  existingImages?: string[];
  onRemoveExistingImage?: (url: string) => void;
}

export default function ImageUploader({ onImagesChange, maxFiles = 5, existingImages = [], onRemoveExistingImage }: ImageUploaderProps) {
  const [images, setImages] = useState<{ file?: File, url: string, uploading: boolean, error?: string }[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFiles = async (files: File[]) => {
    const validFiles = files.filter(file => file.type.startsWith('image/')).slice(0, maxFiles - images.length);
    
    if (validFiles.length === 0) return;

    const newImages = validFiles.map(file => ({
      file,
      url: URL.createObjectURL(file), // Temp URL for preview
      uploading: true
    }));

    setImages(prev => [...prev, ...newImages]);

    for (const img of newImages) {
      await uploadFile(img);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files) as File[];
    processFiles(files);
  }, [images.length, maxFiles]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files) as File[];
      processFiles(files);
    }
  };

  const uploadFile = async (imgObj: { file: File, url: string, uploading: boolean, error?: string }) => {
    try {
      if (!supabase) {
        throw new Error("Supabase credentials not configured");
      }

      const fileExt = imgObj.file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `trabajos/${fileName}`;

      const { data, error } = await supabase.storage
        .from('images') // Adjust bucket name as needed
        .upload(filePath, imgObj.file);

      if (error) {
        throw error;
      }

      const { data: urlData } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      setImages(prev => prev.map(img => 
        img.url === imgObj.url 
          ? { ...img, url: urlData.publicUrl, uploading: false, file: undefined } 
          : img
      ));
      
      // Update parent
      setImages(prev => {
        const completedUrls = prev.filter(i => !i.uploading && !i.error).map(i => i.url);
        onImagesChange(completedUrls);
        return prev;
      });

    } catch (error: any) {
      console.error("Upload error:", error);
      setImages(prev => prev.map(img => 
        img.url === imgObj.url 
          ? { ...img, uploading: false, error: error.message || 'Error al subir' } 
          : img
      ));
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImages(prev => {
      const newImages = prev.filter((_, idx) => idx !== indexToRemove);
      const completedUrls = newImages.filter(i => !i.uploading && !i.error).map(i => i.url);
      onImagesChange(completedUrls);
      return newImages;
    });
  };

  return (
    <div className="w-full">
      <div 
        className={`w-full border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-colors cursor-pointer mb-6
          ${isDragging ? 'border-[#111111] bg-[#F9FAFB]' : 'border-[#E5E7EB] hover:border-[#D1D5DB]'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="w-12 h-12 bg-[#F9FAFB] rounded-full flex items-center justify-center mb-4">
          <Upload className="w-5 h-5 text-[#6B7280]" />
        </div>
        <p className="text-[15px] font-medium text-[#111111] mb-1">
          Arrastra imágenes o haz clic aquí
        </p>
        <p className="text-[13px] text-[#6B7280]">
          Soporta JPG, PNG (máx. {maxFiles} fotos)
        </p>
        <input 
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          multiple
          className="hidden"
        />
      </div>

      {((existingImages && existingImages.length > 0) || images.length > 0) && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[300px] overflow-y-auto pr-2 pb-2">
          <AnimatePresence>
            {existingImages?.map((url, idx) => (
              <motion.div 
                key={`existing-${url}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative aspect-square rounded-xl overflow-hidden bg-[#F9FAFB] border border-[#E5E7EB] group"
              >
                <img 
                  src={url} 
                  alt="Existing" 
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onRemoveExistingImage?.(url); }}
                  className="absolute top-2 right-2 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-[#111111] opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
            
            {images.map((img, idx) => (
              <motion.div 
                key={`new-${img.url}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative aspect-square rounded-xl overflow-hidden bg-[#F9FAFB] border border-[#E5E7EB] group"
              >
                <img 
                  src={img.url} 
                  alt="Preview" 
                  className={`w-full h-full object-cover transition-opacity ${img.uploading ? 'opacity-50' : 'opacity-100'}`}
                />
                
                {img.uploading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-[#111111] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}

                {img.error && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm p-2 text-center">
                    <AlertCircle className="w-6 h-6 text-[#DC2626] mb-1" />
                    <span className="text-[11px] font-medium text-[#DC2626] leading-tight">{img.error}</span>
                  </div>
                )}

                {!img.uploading && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                    className="absolute top-2 right-2 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-[#111111] opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
