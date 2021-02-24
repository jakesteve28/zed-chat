import { configureStore } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import uiReducer from './slices/uiSlice';
import authReducer from './slices/authSlice';
import conversationsReducer from './slices/conversationsSlice';
import accountReducer from './slices/accountSettingsSlice';
import friendsReducer from './slices/friendsSlice';
import inviteReducer from './slices/inviteSlice';

export const globalSlice = createSlice({
  name: 'globals',
  initialState: {
    devHost: "http://localhost:3000",
    prodHost: "http://localhost:3000", //will add custom host soon
    testHost: "http://localhost:3000",
    metadata: "",
    api: "http://localhost:3000",
    refreshExpire: -1,
  },
  reducers: {
    setMetadata: (state, action) => {
      state.metadata = action.payload;
    },
    setRefreshExpire: (state, action) => {
      state.refreshExpire = action.payload;
    }
  },
});

export const { setMetadata, setRefreshExpire } = globalSlice.actions;

export const selectHost = state => {
    if (process.env.NODE_ENV === "production") {
      return state.globals.prodHost; 
    } 
    else if (process.env.NODE_ENV === "development") {
      return state.globals.devHost; 
    } 
    else if (process.env.NODE_ENV === "test") {
      return state.globals.testHost;
    } else {
      return state.globals.devHost;
    }
};

export const selectApi = state => {
  if (process.env.NODE_ENV === "production") {
    return state.globals.prodHost; 
  } 
  else if (process.env.NODE_ENV === "development") {
    return state.globals.api; 
  } 
  else if (process.env.NODE_ENV === "test") {
    return state.globals.api;
  } else {
    return state.globals.api;
  }
}

export const selectRefreshExpire = state => {
  return state.globals.refreshExpire;
}

export const reducer = globalSlice.reducer;

export default configureStore({
  reducer: {
    auth: authReducer,
    conversations: conversationsReducer,
    account: accountReducer,
    invite: inviteReducer,
    friends: friendsReducer,
    globals: reducer,
    ui: uiReducer
  },
});