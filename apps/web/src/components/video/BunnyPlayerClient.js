'use client';
import { useEffect, useRef } from 'react';
import Hls from 'hls.js';
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';

export default function BunnyPlayerClient({ playbackUrl, title, onEnded, onTimeUpdate }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !playbackUrl) return;

    let hls = null;
    let player = null;

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hls.loadSource(playbackUrl);
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = playbackUrl;
    } else {
      video.src = playbackUrl;
    }

    player = new Plyr(video, {
      controls: [
        'play-large',
        'play',
        'progress',
        'current-time',
        'duration',
        'mute',
        'volume',
        'settings',
        'pip',
        'fullscreen',
      ],
      settings: ['speed'],
      speed: {
        selected: 1,
        options: [0.5, 0.75, 1, 1.25, 1.5, 2],
      },
    });

    if (onTimeUpdate) video.addEventListener('timeupdate', onTimeUpdate);
    if (onEnded) video.addEventListener('ended', onEnded);

    return () => {
      if (onTimeUpdate) video.removeEventListener('timeupdate', onTimeUpdate);
      if (onEnded) video.removeEventListener('ended', onEnded);
      if (player) player.destroy();
      if (hls) hls.destroy();
    };
  }, [playbackUrl, onEnded, onTimeUpdate]);

  return (
    <video
      ref={videoRef}
      title={title || 'video-player'}
      playsInline
      controls
      className="w-full rounded-xl aspect-video bg-black"
    />
  );
}
