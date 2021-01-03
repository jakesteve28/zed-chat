import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../auth/authSlice';
import conversationsReducer from '../currentConversation/conversationsSlice'
import accountReducer from '../account/accountSettingsSlice'
import friendsReducer from '../account/friendsSlice'
import inviteReducer from '../topbar/inviteSlice'
import { createSlice } from '@reduxjs/toolkit';

export const globalSlice = createSlice({
  name: 'globals',
  initialState: {
    devHost: "http://localhost:3002",
    prodHost: "https://zed-chat",
    testHost: "http://localhost:3002",
    metadata: ""
  },
  reducers: {
    setMetadata: (state, action) => {
      state.metadata = action.payload;
    }
  },
});

export const { setMetadata } = globalSlice.actions;

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

export const reducer = globalSlice.reducer;

export default configureStore({
  reducer: {
    auth: authReducer,
    conversations: conversationsReducer,
    account: accountReducer,
    invite: inviteReducer,
    friends: friendsReducer,
    globals: reducer
  },
});