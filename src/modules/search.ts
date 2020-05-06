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
  hits?: AlgoliaObject[];
  //  (note: this value is zero-based)
  // https://www.algolia.com/doc/guides/building-search-ui/going-further/backend-search/how-to/pagination/
  currentPage?: number;
  availablePageCount?: number;
  // result?: SearchResponse<AlgoliaObject>;
}

/** @see search */
type SearchAction = ThunkAction<
  Promise<void>,
  RootState,
  undefined,
  Action<string>
>;

/** @see nextPage */
type NextPageAction = ThunkAction<
  Promise<void>,
  RootState,
  undefined,
  Action<string>
>;

type InternalSearchAction = PayloadAction<{
  result?: SearchResponse<AlgoliaObject>;
}>;

type InternalNextPageAction = PayloadAction<{
  result: SearchResponse<AlgoliaObject>;
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

  const trimedQuery = query.trim();

  const check = async (prevQuery: string) => {
    const currentQuery = getState().search.query;

    if (currentQuery === prevQuery) {
      const result = await index.search<AlgoliaObject>(currentQuery, {});
      console.log("search result:", result);
      dispatch(searchSlice.actions.search({ result }));
    }
  };

  if (searchTimeoutId) {
    clearTimeout(searchTimeoutId);
  }

  searchTimeoutId = setTimeout(check, 1000, trimedQuery);
};

export const nextPage = (): NextPageAction => async (dispatch, getState) => {
  const { query, currentPage } = getState().search;

  if (query === undefined || currentPage === undefined) {
    console.warn("");
    return;
  }

  const result = await index.search<AlgoliaObject>(query, {
    page: currentPage + 1,
  });

  dispatch(searchSlice.actions.nextPage({ result }));
};

/*******************************************************************************
 * slice
 */

const initialState: SearchState = {
  query: undefined,
  hits: undefined,
  currentPage: undefined,
  availablePageCount: undefined,
};

const searchSlice = createSlice({
  name: "searchSlice",
  initialState,
  reducers: {
    inputQuery: (state: SearchState, action: InputQueryAction) => {
      state.query = action.payload.query;
    },
    search: (state: SearchState, action: InternalSearchAction) => {
      state.hits = action.payload.result?.hits;
      state.currentPage = action.payload.result?.page;
      state.availablePageCount = action.payload.result?.nbPages;
    },
    nextPage: (state: SearchState, action: InternalNextPageAction) => {
      state.hits = state.hits
        ? [...state.hits, ...action.payload.result.hits]
        : [...action.payload.result.hits];
      state.currentPage = action.payload.result.page;
      state.availablePageCount = action.payload.result.nbPages;
    },
  },
});

export default searchSlice;
