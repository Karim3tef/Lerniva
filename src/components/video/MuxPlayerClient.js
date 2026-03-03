'use client';
import MuxPlayer from '@mux/mux-player-react';

export default function MuxPlayerClient({ playbackId, onEnded, onTimeUpdate, title }) {
  return (
    <MuxPlayer
      playbackId={playbackId}
      metadata={{ video_title: title }}
      onEnded={onEnded}
      onTimeUpdate={onTimeUpdate}
      streamType="on-demand"
      className="w-full aspect-video rounded-xl"
    />
  );
}
