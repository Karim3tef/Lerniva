'use client';

import { useEffect } from 'react';
import useAuthStore from '@/store/authStore';

export default function AuthBootstrap() {
  const { init } = useAuthStore();

  useEffect(() => {
    init().catch(() => {});
  }, [init]);

  return null;
}
