import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../auth/authSlice';
import conversationsReducer from '../currentConversation/conversationsSlice'
import accountReducer from '../account/accountSettingsSlice'
import friendsReducer from '../account/friendsSlice'
import inviteReducer from '../topbar/inviteSlice'
import { createSlice } from '@reduxjs/toolkit';
import uiReducer from '../uiSlice';

export const globalSlice = createSlice({
  name: 'globals',
  initialState: {
    devHost: "http://localhost:3002",
    prodHost: "https://zed-chat",
    testHost: "http://localhost:3002",
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