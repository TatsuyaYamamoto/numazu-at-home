import React, { FC, useCallback, useMemo } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { Index, IndexRange } from "react-virtualized";

import styled from "styled-components";

import Container from "../../atoms/Container";
import InfiniteList, { RowRendererProps } from "./InfiniteList";
import Loading from "./LoadingPostListItem";
import Item from "./PostListItem";

import { RootState } from "../../../modules/store";
import { nextPage } from "../../../modules/search";

const Root = styled.div`
  // bottom-navigation
  margin-bottom: 60px;
`;

const searchHitsSelector = (state: RootState) => {
  return state.search.hits;
};

const hasMoreRowSelector = (state: RootState) => {
  const { currentPage, availablePageCount } = state.search;

  if (currentPage === undefined || availablePageCount === undefined) {
    return false;
  }

  return currentPage + 1 < availablePageCount;
};

const SearchResultList: FC = (props) => {
  const { ...others } = props;
  const dispatch = useDispatch();
  const hits = useSelector(searchHitsSelector);
  const hasMoreRow = useSelector(hasMoreRowSelector);

  const rowCount = useMemo(() => (hits?.length || 0) + (hasMoreRow ? 1 : 0), [
    hits,
    hasMoreRow,
  ]);

  console.log("rowCount", rowCount);

  const isRowLoaded = ({ index }: Index): boolean => {
    return !!hits && !!hits[index];
  };

  const loadMoreRows = useCallback(async ({}: IndexRange): Promise<any> => {
    console.log("loadMoreRows");
    dispatch(nextPage());
  }, []);

  const renderRow = (props: RowRendererProps) => {
    if (!hits) {
      return;
    }

    const { index, style, measure, registerChild } = props;
    const hit = hits[index];

    return (
      <div
        // @ts-ignore
        ref={registerChild}
        style={{
          ...style,
          padding: "10px 3px",
        }}
      >
        {!hit ? (
          <Loading key={index} />
        ) : (
          <Link
            href={{
              pathname: "/post",
              query: { id: hit.objectID },
            }}
          >
            <Item
              key={hit.objectID}
              authorName={hit.authorName}
              authorProfileImageUrl={hit.authorProfileImageUrl}
              timestamp={new Date(hit.timestamp)}
              mediaUrls={[hit.mediaUrl]}
              text={hit.text}
              onMount={measure}
            />
          </Link>
        )}
      </div>
    );
  };

  return (
    <Root {...others}>
      <Container>
        {!hits ? (
          <></>
        ) : hits.length === 0 ? (
          <>{`検索結果なし`}</>
        ) : (
          <InfiniteList
            isRowLoaded={isRowLoaded}
            onLoadRows={loadMoreRows}
            rowCount={rowCount}
            threshold={1}
          >
            {renderRow}
          </InfiniteList>
        )}
      </Container>
    </Root>
  );
};

export default SearchResultList;
