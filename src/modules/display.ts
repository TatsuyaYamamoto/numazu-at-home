import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/*******************************************************************************
 * definitions
 */
export interface DisplayState {
  recentPost: {
    ids: string[];
    hasMoreItem: boolean;
    lastPostDocId?: string;
  };
}

type PushRecentPostsAction = PayloadAction<{
  ids: string[];
}>;

type NotifyNoMoreRecentPostAction = PayloadAction<{}>;

/*******************************************************************************
 * slice
 */

const initialState: DisplayState = {
  recentPost: {
    ids: [],
    hasMoreItem: true,
    lastPostDocId: undefined,
  },
};

const displaySlice = createSlice({
  name: "displaySlice",
  initialState,
  reducers: {
    pushRecentPosts: (state: DisplayState, action: PushRecentPostsAction) => {
      const { ids } = action.payload;
      const newIds = [...state.recentPost.ids, ...ids];
      const lastPostDocId = newIds[newIds.length - 1];

      state.recentPost = {
        ...state.recentPost,
        ids: newIds,
        lastPostDocId,
      };
    },

    notifyNoMoreRecentPost: (
      state: DisplayState,
      _: NotifyNoMoreRecentPostAction
    ) => {
      state.recentPost = {
        ...state.recentPost,
        hasMoreItem: true,
      };
    },
  },
});

export default displaySlice;
