import { useCallback, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';

type UseHorizontalPanelResizeOptions = {
  defaultWidth: number;
  minWidth: number;
  maxWidth: number;
};

export function useHorizontalPanelResize({
  defaultWidth,
  minWidth,
  maxWidth,
}: UseHorizontalPanelResizeOptions) {
  const [width, setWidth] = useState(defaultWidth);
  const widthRef = useRef(defaultWidth);

  const clampWidth = useCallback(
    (next: number) => Math.min(maxWidth, Math.max(minWidth, next)),
    [maxWidth, minWidth],
  );

  const handleResizeStart = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      const startX = event.clientX;
      const startWidth = widthRef.current;

      const handlePointerMove = (moveEvent: PointerEvent) => {
        const next = clampWidth(startWidth + (moveEvent.clientX - startX));
        widthRef.current = next;
        setWidth(next);
      };

      const handlePointerUp = () => {
        document.removeEventListener('pointermove', handlePointerMove);
        document.removeEventListener('pointerup', handlePointerUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };

      document.addEventListener('pointermove', handlePointerMove);
      document.addEventListener('pointerup', handlePointerUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    },
    [clampWidth],
  );

  return { width, handleResizeStart };
}
