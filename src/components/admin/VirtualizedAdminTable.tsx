import { useMemo, useState, type ReactNode, UIEvent } from "react";
import { getVirtualRange } from "./virtualizedAdminTableRange";

const DEFAULT_OVERSCAN = 3;

interface VirtualizedAdminTableProps<Item> {
  emptyState: ReactNode;
  getItemKey: (item: Item) => string;
  header: ReactNode;
  items: Item[];
  overscan?: number;
  renderRow: (item: Item, index: number) => ReactNode;
  rowHeight: number;
  viewportHeight: number;
  viewportTestId?: string;
}

export const VirtualizedAdminTable = <Item,>({
  emptyState,
  getItemKey,
  header,
  items,
  overscan = DEFAULT_OVERSCAN,
  renderRow,
  rowHeight,
  viewportHeight,
  viewportTestId,
}: VirtualizedAdminTableProps<Item>) => {
  const [scrollTop, setScrollTop] = useState(0);

  const range = useMemo(
    () =>
      getVirtualRange({
        itemCount: items.length,
        overscan,
        rowHeight,
        scrollTop,
        viewportHeight,
      }),
    [items.length, overscan, rowHeight, scrollTop, viewportHeight],
  );

  const visibleItems = items.slice(range.start, range.end);
  const totalHeight = items.length * rowHeight;

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  };

  return (
    <div className="border border-border">
      {header}
      {items.length === 0 ? (
        <div className="border-t border-border p-6 text-center text-sm text-muted-foreground">
          {emptyState}
        </div>
      ) : (
        <div
          className="overflow-auto border-t border-border"
          data-testid={viewportTestId}
          onScroll={handleScroll}
          style={{ height: `${viewportHeight}px` }}
        >
          <div className="relative" style={{ height: `${totalHeight}px` }}>
            <div
              className="absolute inset-x-0 top-0"
              style={{ transform: `translateY(${range.offsetTop}px)` }}
            >
              {visibleItems.map((item, visibleIndex) => (
                <div key={getItemKey(item)} style={{ height: `${rowHeight}px` }}>
                  {renderRow(item, range.start + visibleIndex)}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
