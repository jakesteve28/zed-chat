import { createSlice } from '@reduxjs/toolkit';

export const accountSlice = createSlice({
  name: 'account',
  initialState: {
    email: "",
    tagName: "",
    loggedIn: false,
    contacts: [],
    id: ""
  },
  reducers: {
    clearAccount: (state) => {
      state.email = "";
      state.tagName = "";
      state.loggedIn = false;
      state.contacts = [];
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
    setContacts: (state, action) => {
        state.contacts = action.payload
    },
    setId: (state, action) => {
        state.id = action.payload
    }
  },
});

export const { clearAccount, setId, setEmail, setTagName, login, logout } = accountSlice.actions;

// // The function below is called a thunk and allows us to perform async logic. It
// // can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
// // will call the thunk with the `dispatch` function as the first argument. Async
// // code can then be executed and other actions can be dispatched
// export const incrementAsync = amount => dispatch => {
//   setTimeout(() => {
//     dispatch(incrementByAmount(amount));
//   }, 1000);
// };

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.counter.value)`
export const selectAccount = state => {
  return {
    id: state.account.id,
    email: state.account.email,
    tagName: state.account.tagName,
    loggedIn: state.account.loggedIn
   }
};

export default accountSlice.reducer;
