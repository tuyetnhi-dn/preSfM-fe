'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppStore } from '@/store/useAppStore';

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const setJobStatus = useAppStore((state) => state.setJobStatus);

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      // connected
    });

    socket.on('job.progress', (payload) => {
      setJobStatus({
        id: payload.jobId,
        stage: payload.stage,
        status: payload.status,
        progress: payload.progress || 0,
      });
    });

    socket.on('disconnect', () => {
      // disconnected
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [setJobStatus]);

  return socketRef.current;
}
