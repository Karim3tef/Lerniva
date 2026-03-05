'use client';
import MuxUploader from '@mux/mux-uploader-react';
import { useState } from 'react';

export default function MuxUploaderClient({ uploadUrl, onSuccess }) {
  const [status, setStatus] = useState('idle');

  return (
    <div>
      <MuxUploader
        endpoint={uploadUrl}
        onSuccess={() => { setStatus('done'); onSuccess?.(); }}
        onUploadStart={() => setStatus('uploading')}
      />
      {status === 'uploading' && <p className="text-sm text-yellow-500 mt-2">جارٍ رفع الفيديو…</p>}
      {status === 'done' && <p className="text-sm text-green-500 mt-2">اكتمل الرفع! جارٍ المعالجة…</p>}
    </div>
  );
}
