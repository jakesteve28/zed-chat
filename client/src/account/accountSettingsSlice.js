import { createSlice } from '@reduxjs/toolkit';

export const accountSlice = createSlice({
  name: 'account',
  initialState: {
    email: "",
    tagName: "",
    loggedIn: false,
    id: ""
  },
  reducers: {
    clearAccount: (state) => {
      state.email = "";
      state.tagName = "";
      state.loggedIn = false;
      state.id = "";
    },
    setEmail: (state, action) => {
        state.email = action.payload
    },
    setTagName: (state, action) => {
        state.tagName = action.payload
    },
    login: state => {
        state.loggedIn = true
    },
    logout: state => {
        state.loggedIn = false
    },
    setId: (state, action) => {
        state.id = action.payload
    }
  },
});

export const { clearAccount, setId, setEmail, setTagName, login, logout } = accountSlice.actions;

export const selectAccount = state => {
  return {
    id: state.account.id,
    email: state.account.email,
    tagName: state.account.tagName,
    loggedIn: state.account.loggedIn
   }
};

export default accountSlice.reducer;
