import React, { CSSProperties, FC, useMemo } from "react";

import {
  InfiniteLoader,
  WindowScroller,
  List,
  ListRowRenderer,
  CellMeasurer,
  CellMeasurerCache,
  IndexRange,
  Index,
} from "react-virtualized";

export interface RowRendererProps {
  // ListRowRenderer
  index: number;
  // CellMeasurerChildProps
  measure: () => void;
  registerChild?: (element: Element) => void;
  style: CSSProperties;
}

interface InfiniteListProps {
  isRowLoaded: (params: Index) => boolean;
  onLoadRows: (params: IndexRange) => Promise<any>;
  rowCount: number;
  threshold?: number;
  children: (props: RowRendererProps) => React.ReactNode;
}

const InfiniteList: FC<InfiniteListProps> = (props) => {
  const { isRowLoaded, rowCount, onLoadRows, threshold, children } = props;

  const cellMeasurerCache = useMemo(
    () =>
      new CellMeasurerCache({
        defaultHeight: 50,
        fixedWidth: true,
      }),
    []
  );

  const measuredRowRenderer: ListRowRenderer = ({
    key,
    index,
    style,
    parent,
  }) => {
    return (
      <CellMeasurer
        key={key}
        cache={cellMeasurerCache}
        parent={parent}
        rowIndex={index}
      >
        {({ registerChild, measure }) =>
          typeof children === "function"
            ? children({
                index,
                measure,
                registerChild,
                style,
              })
            : children
        }
      </CellMeasurer>
    );
  };

  return (
    <InfiniteLoader
      isRowLoaded={isRowLoaded}
      loadMoreRows={onLoadRows}
      rowCount={rowCount}
      threshold={threshold}
    >
      {({ onRowsRendered }) => (
        <WindowScroller>
          {({ height, width, scrollTop, isScrolling }) => (
            <List
              height={height}
              autoHeight={true}
              width={width}
              autoWidth={true}
              isScrolling={isScrolling}
              // onScroll={onChildScroll}
              onRowsRendered={onRowsRendered}
              scrollTop={scrollTop}
              rowCount={rowCount}
              rowHeight={cellMeasurerCache.rowHeight}
              rowRenderer={measuredRowRenderer}
            />
          )}
        </WindowScroller>
      )}
    </InfiniteLoader>
  );
};

export default InfiniteList;
