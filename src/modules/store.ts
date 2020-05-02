import {
  configureStore,
  combineReducers,
  getDefaultMiddleware,
} from "@reduxjs/toolkit";

import entities from "./entities";
import display from "./display";

const reducer = combineReducers({
  entities: entities.reducer,
  display: display.reducer,
});

export const store = configureStore({
  reducer,
  middleware: [
    ...getDefaultMiddleware({
      // TODO don't use Date type
      // https://qiita.com/puku0x/items/4217ca9f98fad82bc998
      serializableCheck: false,
    }),
  ],
});

export type RootState = ReturnType<typeof reducer>;
