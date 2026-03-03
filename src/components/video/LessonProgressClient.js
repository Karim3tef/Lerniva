'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import MuxPlayerClient from './MuxPlayerClient';

export default function LessonProgressClient({ playbackId, lessonTitle, courseId, lessonId, lessons }) {
  const router = useRouter();

  const handleEnded = useCallback(async () => {
    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course_id: courseId }),
      });
    } catch (error) {
      console.error('Error updating progress:', error);
    }

    // Auto-advance to next lesson
    if (lessons && lessons.length > 0) {
      const currentIndex = lessons.findIndex((l) => l.id === lessonId);
      const nextLesson = lessons[currentIndex + 1];
      if (nextLesson) {
        router.push(`/learn/${courseId}/${nextLesson.id}`);
      }
    }
  }, [courseId, lessonId, lessons, router]);

  return (
    <MuxPlayerClient
      playbackId={playbackId}
      title={lessonTitle}
      onEnded={handleEnded}
    />
  );
}
