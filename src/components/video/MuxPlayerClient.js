'use client';
import MuxPlayer from '@mux/mux-player-react';

export default function MuxPlayerClient({ playbackId, onEnded, title }) {
  return (
    <MuxPlayer
      playbackId={playbackId}
      metadata={{ video_title: title }}
      onEnded={onEnded}
      streamType="on-demand"
      className="w-full aspect-video rounded-xl"
    />
  );
}
