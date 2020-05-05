import React from "react";
import Link from "next/link";
import { useSelector } from "react-redux";

import styled from "styled-components";
import { List } from "@material-ui/core";

import ListItem from "../PostList/PostListItem";
import { RootState } from "../../../modules/store";
import Container from "../../atoms/Container";

const Root = styled.div`
  // bottom-navigation
  margin-bottom: 60px;
`;

const searchResultSelector = (state: RootState) => {
  return state.search.result;
};

const SearchResultList = () => {
  const result = useSelector(searchResultSelector);

  return (
    <Root>
      <Container>
        <List>
          {!result ? (
            <></>
          ) : result.hits.length === 0 ? (
            <>{`検索結果なし`}</>
          ) : (
            result.hits.map((hit) => (
              <Link
                key={hit.objectID}
                href={{
                  pathname: `/post`,
                  query: {
                    id: hit.objectID,
                  },
                }}
              >
                <ListItem
                  text={hit.text}
                  authorName={hit.authorName}
                  authorProfileImageUrl={hit.authorProfileImageUrl}
                  mediaUrls={[hit.mediaUrl]}
                  timestamp={new Date(hit.timestamp)}
                  css={`
                    margin: 10px auto;
                  `}
                />
              </Link>
            ))
          )}
        </List>
      </Container>
    </Root>
  );
};

export default SearchResultList;
