import { useState, useEffect, useCallback, useRef } from 'react';
import './Timer.css';

interface TimerProps {
  totalSeconds: number;
  isRunning: boolean;
  onTick?: (elapsedSeconds: number) => void;
  onTimeUp?: () => void;
}

export default function Timer({ totalSeconds, isRunning, onTick, onTimeUp }: TimerProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onTickRef = useRef(onTick);
  const onTimeUpRef = useRef(onTimeUp);

  // Keep refs updated
  onTickRef.current = onTick;
  onTimeUpRef.current = onTimeUp;

  const remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds);
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const progress = totalSeconds > 0 ? (elapsedSeconds / totalSeconds) * 100 : 0;

  // Determine urgency level
  const urgency = remainingSeconds <= 60 ? 'critical' : remainingSeconds <= 180 ? 'warning' : 'normal';

  useEffect(() => {
    if (isRunning && remainingSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds(prev => Math.min(prev + 1, totalSeconds));
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, totalSeconds, remainingSeconds]);

  useEffect(() => {
    if (!isRunning || elapsedSeconds === 0) {
      return;
    }

    onTickRef.current?.(elapsedSeconds);

    if (elapsedSeconds >= totalSeconds) {
      onTimeUpRef.current?.();
    }
  }, [elapsedSeconds, isRunning, totalSeconds]);

  const formatTime = useCallback((min: number, sec: number) => {
    return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }, []);

  return (
    <div className={`timer timer--${urgency}`}>
      <div className="timer__icon">
        {urgency === 'critical' ? '🔴' : urgency === 'warning' ? '🟡' : '⏱️'}
      </div>
      <div className="timer__display">
        <span className="timer__time">{formatTime(minutes, seconds)}</span>
        <span className="timer__label">restante{remainingSeconds !== 1 ? 's' : ''}</span>
      </div>
      <div className="timer__progress-bar">
        <div
          className="timer__progress-fill"
          style={{ width: `${100 - progress}%` }}
        />
      </div>
    </div>
  );
}
