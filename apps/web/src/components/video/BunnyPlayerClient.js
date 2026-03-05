'use client';
import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

export default function BunnyPlayerClient({ playbackUrl, onEnded, onTimeUpdate, title }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!playbackUrl || !ref.current) return;
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(playbackUrl);
      hls.attachMedia(ref.current);
      return () => hls.destroy();
    } else if (ref.current.canPlayType('application/vnd.apple.mpegurl')) {
      ref.current.src = playbackUrl;
    }
  }, [playbackUrl]);
  return (
    <video
      ref={ref}
      controls
      onEnded={onEnded}
      onTimeUpdate={onTimeUpdate}
      title={title}
      className="w-full rounded-xl aspect-video bg-black"
    />
  );
}
