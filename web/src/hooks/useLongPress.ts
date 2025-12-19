import { useRef, useCallback, type MouseEvent, type TouchEvent } from 'react';

interface Options {
  threshold?: number;
  onStart?: (e: MouseEvent | TouchEvent) => void;
  onFinish?: (e: MouseEvent | TouchEvent) => void;
  onCancel?: (e: MouseEvent | TouchEvent) => void;
}

export default function useLongPress(
  callback: (e: MouseEvent | TouchEvent) => void,
  { threshold = 500, onStart, onFinish, onCancel }: Options = {}
) {
  const timerRef = useRef<any>(null);
  const isLongPress = useRef(false);

  const start = useCallback(
    (e: MouseEvent | TouchEvent) => {
      onStart?.(e);
      isLongPress.current = false;
      timerRef.current = setTimeout(() => {
        isLongPress.current = true;
        callback(e);
        onFinish?.(e);
      }, threshold);
    },
    [callback, threshold, onStart, onFinish]
  );

  const clear = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      onCancel?.(e);
    },
    [onCancel]
  );

  return {
    onMouseDown: start,
    onMouseUp: clear,
    onMouseLeave: clear,
    onTouchStart: start,
    onTouchEnd: clear,
  };
}