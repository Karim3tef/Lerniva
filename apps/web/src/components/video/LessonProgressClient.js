'use client';

import { useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import MuxPlayerClient from './MuxPlayerClient';

export default function LessonProgressClient({ playbackId, lessonTitle, courseId, lessonId, lessons }) {
  const router = useRouter();
  const watchedSecondsRef = useRef(0);

  const reportProgress = useCallback(async (watchDuration) => {
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course_id: courseId, lesson_id: lessonId, watch_duration: watchDuration }),
      });
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  }, [courseId, lessonId]);

  const handleTimeUpdate = useCallback((e) => {
    const player = e.target;
    if (player?.currentTime) {
      watchedSecondsRef.current = Math.round(player.currentTime);
    }
  }, []);

  const handleEnded = useCallback(async () => {
    await reportProgress(watchedSecondsRef.current);

    // Auto-advance to next lesson
    if (lessons && lessons.length > 0) {
      const currentIndex = lessons.findIndex((l) => l.id === lessonId);
      const nextLesson = lessons[currentIndex + 1];
      if (nextLesson) {
        router.push(`/learn/${courseId}/${nextLesson.id}`);
      }
    }
  }, [courseId, lessonId, lessons, router, reportProgress]);

  return (
    <MuxPlayerClient
      playbackId={playbackId}
      title={lessonTitle}
      onEnded={handleEnded}
      onTimeUpdate={handleTimeUpdate}
    />
  );
}
