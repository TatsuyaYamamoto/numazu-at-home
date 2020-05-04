import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NextPage } from "next";
import { useRouter } from "next/router";

import { firestore } from "firebase";

import { Button, SvgIcon } from "@material-ui/core";
import styled from "styled-components";

// @ts-ignore
import InstagramBrand from "../components/atoms/svg/instagram-brands.svg";
import { InternalAppBar } from "../components/organisms/AppBar";
import PostDetail from "../components/organisms/PostDetail/PostDetail";
import useFirebase from "../components/hooks/useFirebase";
import PostDetailLoading from "../components/organisms/PostDetail/PostDetailLoading";
import TwitterShareButton from "../components/molecules/ShareButton/TwitterShareButton";
import { primaryBackground } from "../components/helper/styles";
import Container from "../components/atoms/Container";

import { Post, PostDocument } from "../share/models/Post";
import { User } from "../share/models/User";
import { RootState } from "../modules/store";
import { importPostDocs } from "../modules/entities";

const Actions = styled.div`
  margin-top: 40px;
  margin-bottom: 40px;
`;

const ShareActions = styled.div`
  text-align: center;
  margin: 20px 0;
`;

const SourceLinkActions = styled.div`
  text-align: center;
  margin: 20px 0;
`;

const detailSelector = (id: string | null) => (
  state: RootState
): { post: Post; user: User } | undefined => {
  if (!id) {
    return;
  }

  const post = state.entities.posts[id];

  if (!post) {
    return;
  }

  const user = state.entities.users[post.authorId];

  return user ? { post, user } : undefined;
};

const PostPage: NextPage = () => {
  const router = useRouter();
  const [postId] = useState(() => {
    const { searchParams } = new URL(`http://dummy.com${router.asPath}`);
    return searchParams.get("id");
  });
  const detail = useSelector(detailSelector(postId));
  const { app: firebaseApp } = useFirebase();
  const dispatch = useDispatch();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  useEffect(() => {
    if (!firebaseApp) {
      console.warn("FirebaseApp is not initialized.");
      return;
    }

    if (!postId) {
      console.warn("postId is null.");
      return;
    }

    (async () => {
      type PostColRef = firestore.CollectionReference<PostDocument>;
      const postColRef = firebaseApp
        .firestore()
        .collection(`posts`) as PostColRef;

      const postDocSnap = await postColRef.doc(postId).get();
      const postDoc = postDocSnap.data();

      if (postDoc) {
        dispatch(importPostDocs([postDoc]));
      } else {
        console.warn(`could not get post with ID'${postId}' from firestore.`);
      }
    })();
  }, [postId, firebaseApp]);

  let body = <PostDetailLoading />;

  if (detail) {
    const { user, post } = detail;
    body = (
      <>
        <PostDetail
          authorName={user.displayName || user.userName}
          authorProfileImageUrl={user.profileImageUrl}
          timestamp={post.timestamp}
          mediaUrls={post.mediaUrls}
          text={post.text}
        />
        <Actions>
          <ShareActions>
            <TwitterShareButton text={"hogehoge"} url={location.href} />
          </ShareActions>

          <SourceLinkActions>
            <Button
              href={post.sourceUrl}
              startIcon={
                <SvgIcon>
                  <InstagramBrand />
                </SvgIcon>
              }
              css={`
                ${primaryBackground}
              `}
              target="__blank"
              color="primary"
              variant="contained"
            >{`この投稿のページへ`}</Button>
          </SourceLinkActions>
        </Actions>
      </>
    );
  }

  return (
    <>
      <InternalAppBar showBackArrow={true} title={`投稿`} />
      <Container>{body}</Container>
    </>
  );
};

export default PostPage;
