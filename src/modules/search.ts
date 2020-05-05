import { Action, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ThunkAction } from "redux-thunk";

import algoliasearch from "algoliasearch";
import { SearchResponse } from "@algolia/client-search";

import { RootState } from "./store";
import { AlgoliaObject } from "../share/models/Algolia";

import config from "../config";

const client = algoliasearch(config.algolia.appId, config.algolia.apiKey);
const index = client.initIndex(config.algolia.indexName);

/*******************************************************************************
 * definitions
 */
export interface SearchState {
  query?: string;
  result?: SearchResponse<AlgoliaObject>;
}

/** @see search */
type SearchAction = ThunkAction<
  Promise<void>,
  RootState,
  undefined,
  Action<string>
>;

type InternalSearchAction = PayloadAction<{
  result?: SearchResponse<AlgoliaObject>;
}>;

type InputQueryAction = PayloadAction<{
  query?: string;
}>;

/*******************************************************************************
 * actions
 */
let searchTimeoutId: number | undefined = undefined;

export const search = (query: string): SearchAction => async (
  dispatch,
  getState
) => {
  dispatch(searchSlice.actions.inputQuery({ query }));
  if (!query) {
    dispatch(searchSlice.actions.search({ result: undefined }));
    return;
  }

  const check = async (prevQuery: string) => {
    const currentQuery = getState().search.query;

    if (currentQuery === prevQuery) {
      console.log("query is the same as the last time.", query);

      const result = await index.search<AlgoliaObject>(query);
      console.log("result", result);
      dispatch(searchSlice.actions.search({ result }));
    }
  };

  if (searchTimeoutId) {
    clearTimeout(searchTimeoutId);
  }

  searchTimeoutId = setTimeout(check, 1000, query);
};

/*******************************************************************************
 * slice
 */

const initialState: SearchState = {
  query: undefined,
  result: undefined,
};

const searchSlice = createSlice({
  name: "searchSlice",
  initialState,
  reducers: {
    inputQuery: (state: SearchState, action: InputQueryAction) => {
      state.query = action.payload.query;
    },
    search: (state: SearchState, action: InternalSearchAction) => {
      state.result = action.payload.result;
    },
  },
});

export default searchSlice;
