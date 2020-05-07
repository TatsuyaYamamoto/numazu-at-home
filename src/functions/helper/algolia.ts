import algoliasearch from "algoliasearch";
import { ChunkedBatchResponse } from "@algolia/client-search";

import { AlgoliaObject } from "../../share/models/Algolia";
import config from "../../config.functions";
import { UserDocument } from "../../share/models/User";
import { PostDocument } from "../../share/models/Post";

const algolia = algoliasearch(config.algolia.app_id, config.algolia.api_key);
const algoliaIndex = algolia.initIndex(config.algolia.index_name);

export const saveAlgoliaObjects = async (params: {
  users: { [id: string]: UserDocument };
  posts: { [id: string]: PostDocument };
}): Promise<ChunkedBatchResponse> => {
  const { users, posts } = params;

  const newObject: AlgoliaObject[] = Object.keys(posts).map((postId) => {
    const post = posts[postId];
    const user = users[post.author.id];

    return {
      objectID: post.id,
      text: post.text,
      authorName: user.displayName || user.userName,
      authorProfileImageUrl: user.profileImageUrl,
      timestamp: post.timestamp.toMillis(),
      mediaUrl: post.mediaUrls[0],
      provider: post.provider,
    };
  });

  return algoliaIndex.saveObjects(newObject);
};
