import { createSlice, PayloadAction, Action } from "@reduxjs/toolkit";
import { ThunkAction } from "redux-thunk";

import { Post, PostDocument } from "../share/models/Post";
import { User } from "../share/models/User";
import { RootState } from "./store";
import { IG__A1Data } from "../share/models/IG";

/*******************************************************************************
 * definitions
 */

/** @see importPostDocs */
type ImportPostDocsAction = ThunkAction<
  Promise<void>,
  RootState,
  undefined,
  Action<string>
>;

export type AddEntitiesAction = PayloadAction<Partial<EntitiesState>>;

export interface EntitiesState {
  /**
   * {@see Item} Objectのmap
   */
  posts: { [id: string]: Post | undefined };
  /**
   * {@see Category} Objectのmap
   */
  users: { [id: string]: User | undefined };
}

/*******************************************************************************
 * actions
 */

/**
 *
 * @param docs
 */
export const importPostDocs = (
  docs: PostDocument[]
): ImportPostDocsAction => async (dispatch) => {
  const posts: { [id: string]: Post } = {};
  const users: { [id: string]: User } = {};

  await Promise.all(
    docs.map(async (post) => {
      const authorRef = post.author;
      const authorSnap = await authorRef.get();
      const author = authorSnap.data();

      if (!author) {
        return;
      }

      if (post.provider === "instagram") {
        const res = await fetch(`${post.sourceUrl}?__a=1`);

        if (!res.ok) {
          // TODO notify to backend that resource is deleted.
          console.warn(`resource in '${post.sourceUrl}' not found.`);
          return;
        }
        const json: IG__A1Data = await res.json();

        const {
          display_url,
          edge_sidecar_to_children,
        } = json.graphql.shortcode_media;

        const mediaUrls: string[] = edge_sidecar_to_children
          ? edge_sidecar_to_children.edges.map(({ node }) => node.display_url)
          : [display_url];

        posts[post.id] = {
          id: post.id,
          authorId: author.id,
          text: post.text,
          timestamp: post.timestamp.toDate(),
          mediaUrls,
          sourceUrl: post.sourceUrl,
          provider: post.provider,
        };
      } else {
        posts[post.id] = {
          id: post.id,
          authorId: author.id,
          text: post.text,
          timestamp: post.timestamp.toDate(),
          mediaUrls: post.mediaUrls,
          sourceUrl: post.sourceUrl,
          provider: post.provider,
        };
      }

      users[author.id] = {
        id: author.id,
        displayName: author.displayName,
        userName: author.userName,
        profileImageUrl: author.profileImageUrl,
      };
    })
  );

  const newEntities = { posts, users };
  dispatch(entitiesSlice.actions.addEntities(newEntities));
};

/*******************************************************************************
 * slice
 */

const initialState: EntitiesState = {
  posts: {},
  users: {},
};

const entitiesSlice = createSlice({
  name: "entities",
  initialState,
  reducers: {
    /**
     * Entityを追加する
     *
     * @param state
     * @param action
     */
    addEntities: (state: EntitiesState, action: AddEntitiesAction) => {
      const { payload } = action;
      const entityTypes = Object.keys(payload) as Array<keyof EntitiesState>;

      entityTypes.forEach((entityType) => {
        const currentEntities = state[entityType];
        const payloadEntities = payload[entityType];

        if (!payloadEntities) {
          return;
        }

        const payloadEntityIds = Object.keys(payloadEntities);

        payloadEntityIds.forEach((payloadEntityId) => {
          const payloadEntity = payloadEntities[payloadEntityId];
          const currentEntity = currentEntities[payloadEntityId];

          const newEntity = currentEntity
            ? { ...currentEntity, ...payloadEntity }
            : payloadEntity;

          // @ts-ignore TODO fix type
          state[entityType][payloadEntityId] = newEntity;
        });
      });
    },
  },
});

export default entitiesSlice;
