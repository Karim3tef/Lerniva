'use client';
import { useState } from 'react';
import * as tus from 'tus-js-client';
import { api } from '@/lib/api';

export default function BunnyUploaderClient({ lessonId, onUploadComplete }) {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = async (file) => {
    setUploading(true);
    setError('');
    try {
      const { videoId, uploadUrl } = await api.post('/upload/video', {
        lessonId,
        title: file.name,
      });
      const upload = new tus.Upload(file, {
        endpoint: uploadUrl,
        retryDelays: [0, 3000, 5000, 10000],
        metadata: { filename: file.name, filetype: file.type },
        onProgress: (bytesUploaded, bytesTotal) => {
          setProgress(Math.round((bytesUploaded / bytesTotal) * 100));
        },
        onSuccess: () => {
          setUploading(false);
          onUploadComplete?.(videoId);
        },
        onError: (err) => {
          console.error('Upload error:', err);
          setError('فشل رفع الفيديو. حاول مجدداً.');
          setUploading(false);
        },
      });
      upload.start();
    } catch (err) {
      setError('فشل الحصول على رابط الرفع.');
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <input
        type="file"
        accept="video/*"
        disabled={uploading}
        onChange={(e) => e.target.files[0] && handleUpload(e.target.files[0])}
        className="block w-full text-sm"
      />
      {uploading && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
          <p className="text-xs text-gray-500 mt-1">{progress}% مكتمل</p>
        </div>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
