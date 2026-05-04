'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  currentImageUrl?: string;
  label?: string;
  accept?: string;
}

export default function ImageUpload({
  onImageSelect,
  currentImageUrl,
  label = 'Chọn ảnh',
  accept = 'image/*',
}: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      onImageSelect(file);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setPreviewUrl(currentImageUrl || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleClick}
          className="flex items-center space-x-2"
        >
          <Upload size={16} />
          <span>Chọn file</span>
        </Button>
        {selectedFile && (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleRemove}
          >
            <X size={16} />
          </Button>
        )}
      </div>
      <Input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />
      {previewUrl && (
        <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
          <Image
            src={previewUrl}
            alt="Preview"
            fill
            className="object-cover"
          />
        </div>
      )}
    </div>
  );
}