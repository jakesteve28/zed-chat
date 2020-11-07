import { createSlice } from '@reduxjs/toolkit';

export const authSlice = createSlice({
  name: 'auth',
  initialState: {
    username: "",
    token: ""
  },
  reducers: {
    setUserName: (state, action) => {
      state.username = action.payload;
    },
    setToken: (state, action) => {
        state.token = action.payload;
    }
  }
});

export const { setUserName, setToken } = authSlice.actions;

export const selectUserName = state => state.auth.username;
export const selectToken = state => state.auth.token;

export default authSlice.reducer;
