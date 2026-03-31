const DEFAULT_OVERSCAN = 3;

export interface VirtualRangeOptions {
  itemCount: number;
  overscan?: number;
  rowHeight: number;
  scrollTop: number;
  viewportHeight: number;
}

export const getVirtualRange = ({
  itemCount,
  overscan = DEFAULT_OVERSCAN,
  rowHeight,
  scrollTop,
  viewportHeight,
}: VirtualRangeOptions) => {
  if (itemCount === 0) {
    return {
      end: 0,
      offsetTop: 0,
      start: 0,
    };
  }

  const visibleCount = Math.max(1, Math.ceil(viewportHeight / rowHeight));
  const start = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const end = Math.min(itemCount, start + visibleCount + overscan * 2);

  return {
    end,
    offsetTop: start * rowHeight,
    start,
  };
};
