'use client';

import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import BunnyPlayerClient from './BunnyPlayerClient';

const SAVE_INTERVAL_SECONDS = 10;

export default function LessonProgressClient({ playbackUrl, lessonTitle, courseId, lessonId, lessons }) {
  const router = useRouter();
  const lastSavedRef = useRef(0);

  const saveProgress = async (currentTime, duration, ended) => {
    const watched = Math.round(currentTime);
    if (watched - lastSavedRef.current < SAVE_INTERVAL_SECONDS && !ended) return;
    lastSavedRef.current = watched;
    try {
      await api.post('/progress', {
        lessonId,
        courseId,
        watchedSeconds: watched,
        completed: ended || (duration > 0 && currentTime / duration >= 0.9),
      });
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const handleTimeUpdate = (e) => {
    const { currentTime, duration } = e.target;
    if (currentTime) saveProgress(currentTime, duration, false);
  };

  const handleEnded = async () => {
    const videoEl = document.querySelector('video');
    if (videoEl) await saveProgress(videoEl.currentTime, videoEl.duration, true);

    if (lessons && lessons.length > 0) {
      const currentIndex = lessons.findIndex((l) => l.id === lessonId);
      const nextLesson = lessons[currentIndex + 1];
      if (nextLesson) {
        router.push(`/learn/${courseId}/${nextLesson.id}`);
      }
    }
  };

  return (
    <BunnyPlayerClient
      playbackUrl={playbackUrl}
      title={lessonTitle}
      onEnded={handleEnded}
      onTimeUpdate={handleTimeUpdate}
    />
  );
}
