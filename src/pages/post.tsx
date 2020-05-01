import React, { useState } from "react";

import { NextPage } from "next";
import { useRouter } from "next/router";

import { InternalAppBar } from "../components/organisms/AppBar";
import PostDetail from "../components/organisms/PostDetail";

const PostPage: NextPage = () => {
  const router = useRouter();
  const [postId] = useState(() => {
    const { searchParams } = new URL(`http://dummy.com${router.asPath}`);
    return searchParams.get("id");
  });

  if (!postId) {
    return (
      <>
        <InternalAppBar showBackArrow={true} title={`投稿`} />
        <div>Not found.</div>
      </>
    );
  }

  return (
    <>
      <InternalAppBar showBackArrow={true} title={`投稿`} />
      <PostDetail
        authorName={postId}
        authorProfileImageUrl={""}
        timestamp={new Date()}
        mediaUrls={["https://www.instagram.com/p/B_oX4m8na7Z/media/"]}
        text={"hogeohgeohgeohgeohgeohge"}
      />
    </>
  );
};

export default PostPage;
